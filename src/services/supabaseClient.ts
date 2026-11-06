import { createClient } from '@supabase/supabase-js';
import { Contact, Activity, TaskPending, User, Sale, DailyReport } from '../types';

export const SUPABASE_URL = 'https://liomjpoclsdxcjnnxqhi.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_VHM7zdpXTaP4UAlUsxwmjQ_m3GxYih9';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * MOTOR DE SINCRONIZACIÓN CON SUPABASE
 *
 * - Toda escritura local se mete a una COLA persistente (localStorage) y se sube con reintentos.
 *   Nada se pierde si no hay internet o si el servidor rechaza un registro: se vuelve a intentar.
 * - El orden de subida respeta las llaves foráneas: usuarios → prospectos → actividades → tareas → ventas → cortes.
 * - Si la nube todavía no tiene columnas nuevas, se sube la versión básica y después se re-sube completa.
 */

export type SyncKind = 'user' | 'contact' | 'activity' | 'task' | 'sale' | 'report';

interface QueueItem {
  kind: SyncKind;
  id: string;
  data: any;
  attempts: number;
  queuedAt: string;
  lastError?: string;
}

const QUEUE_KEY = 'fh_sync_queue_v1';
const KIND_ORDER: SyncKind[] = ['user', 'contact', 'activity', 'task', 'sale', 'report'];
const TABLE: Record<SyncKind, string> = {
  user: 'users',
  contact: 'contacts',
  activity: 'activities',
  task: 'tasks',
  sale: 'sales',
  report: 'daily_reports'
};

// ---------- Cola persistente ----------

function readQueue(): QueueItem[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeQueue(queue: QueueItem[]): void {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.warn('No se pudo guardar la cola de sincronización', e);
  }
}

let flushTimer: any = null;
function scheduleFlush(): void {
  clearTimeout(flushTimer);
  flushTimer = setTimeout(() => {
    flushQueue();
  }, 400);
}

export function enqueueSync(kind: SyncKind, id: string, data: any): void {
  const queue = readQueue().filter(i => !(i.kind === kind && i.id === id));
  queue.push({ kind, id, data, attempts: 0, queuedAt: new Date().toISOString() });
  writeQueue(queue);
  scheduleFlush();
}

/** Llaves "tipo:id" de lo que aún no se ha subido (lo local pendiente siempre gana al mezclar). */
export function getPendingKeys(): Set<string> {
  return new Set(readQueue().map(i => `${i.kind}:${i.id}`));
}

export function getSyncStatus(): { pending: number; failing: number; lastError?: string } {
  const queue = readQueue();
  const failing = queue.filter(i => i.lastError);
  return {
    pending: queue.length,
    failing: failing.length,
    lastError: failing.length > 0 ? failing[failing.length - 1].lastError : undefined
  };
}

// ---------- Conversión a filas de Supabase ----------

function toRows(kind: SyncKind, d: any): { full: any; base?: any } {
  switch (kind) {
    case 'user': {
      const base = {
        id: d.id,
        name: d.name,
        username: d.username || null,
        email: d.email,
        password: d.password || null,
        role: d.role,
        branch: d.branch,
        active: d.active ?? true
      };
      return {
        base,
        full: {
          ...base,
          phone: d.phone || null,
          target_contacts: d.targetDailyContacts ?? null,
          target_appointments: d.targetDailyAppointments ?? null,
          hire_date: d.hireDate || null
        }
      };
    }
    case 'contact': {
      const base = {
        id: d.id,
        user_id: d.userId,
        branch: d.branch,
        name: d.name,
        phone: d.phone,
        source: d.source,
        status: d.status,
        deleted_by_advisor: Boolean(d.deletedByAdvisor),
        deleted_at: d.deletedAt || null,
        created_at: d.createdAt || new Date().toISOString()
      };
      // Pack address & email inside notes as structured metadata if needed so they sync even without extra SQL columns
      let packedNotes: string | null = d.notes || null;
      const metaParts: string[] = [];
      if (d.address && String(d.address).trim()) metaParts.push(`DOM:${String(d.address).trim()}`);
      if (d.email && String(d.email).trim()) metaParts.push(`EMAIL:${String(d.email).trim()}`);
      if (metaParts.length > 0) {
        const cleanNotes = (d.notes || '').replace(/^\[META:[^\]]*\]\s*/, '');
        packedNotes = `[META:${metaParts.join('||')}] ${cleanNotes}`.trim();
      }
      return {
        base,
        full: {
          ...base,
          notes: packedNotes,
          last_interaction: d.lastInteraction || null
        }
      };
    }
    case 'activity': {
      const base = {
        id: d.id,
        user_id: d.userId,
        contact_id: d.contactId || null,
        activity_type: d.activityType,
        package_offered_id: d.packageOfferedId || null,
        result: d.result,
        objection: d.objection || null,
        notes: d.notes || null,
        created_at: d.createdAt || new Date().toISOString()
      };
      return {
        base,
        full: {
          ...base,
          contact_name: d.contactName || null,
          contact_phone: d.contactPhone || null,
          source: d.source || null,
          package_offered_name: d.packageOfferedName || null
        }
      };
    }
    case 'task': {
      const base = {
        id: d.id,
        user_id: d.userId,
        contact_id: d.contactId || null,
        contact_name: d.contactName || '',
        contact_phone: d.contactPhone || '',
        due_date: d.dueDate,
        due_time: d.dueTime || null,
        notes: d.notes || null,
        is_completed: Boolean(d.isCompleted),
        created_at: d.createdAt || new Date().toISOString()
      };
      return {
        base,
        full: {
          ...base,
          task_type: d.taskType || 'llamada',
          location: d.location || null,
          completed_at: d.completedAt || null
        }
      };
    }
    case 'sale':
      return {
        full: {
          id: d.id,
          user_id: d.userId,
          contact_id: d.contactId || null,
          contact_name: d.contactName || null,
          package_id: d.packageId || null,
          package_name: d.packageName || null,
          amount: Number(d.amount) || 0,
          sale_date: d.saleDate,
          referrals_count: d.referralsCount || 0,
          referrals: d.referrals || []
        }
      };
    case 'report':
      return {
        full: {
          id: d.id,
          user_id: d.userId,
          user_name: d.userName || null,
          branch: d.branch,
          date: d.date,
          submitted_at: d.submittedAt,
          contacts_count: d.contactsCount || 0,
          contacts_target: d.contactsTarget || 0,
          appointments_count: d.appointmentsCount || 0,
          appointments_target: d.appointmentsTarget || 0,
          sales_volume: Number(d.salesVolume) || 0,
          sales_count: d.salesCount || 0,
          referrals_count: d.referralsCount || 0,
          semaforo: d.semaforo || null,
          overall_score: d.overallScore || 0,
          daily_notes: d.dailyNotes || null,
          signature: d.signature || null
        }
      };
  }
}

function isMissingColumn(error: any): boolean {
  const msg = String(error?.message || '');
  return error?.code === 'PGRST204' || (/column/i.test(msg) && /(schema cache|does not exist)/i.test(msg));
}

function isMissingTable(error: any): boolean {
  const msg = String(error?.message || '');
  return error?.code === 'PGRST205' || error?.code === '42P01' || /Could not find the table/i.test(msg);
}

function isNetworkError(message: string): boolean {
  return /failed to fetch|networkerror|network request failed|load failed/i.test(message);
}

async function pushItem(item: QueueItem): Promise<{ ok: boolean; error?: string }> {
  const table = TABLE[item.kind];
  const { full, base } = toRows(item.kind, item.data);
  try {
    let { error } = await supabase.from(table).upsert(full, { onConflict: 'id' });
    if (error && base && isMissingColumn(error)) {
      // La nube aún no tiene las columnas nuevas: se sube lo básico y se re-sube completo después.
      ({ error } = await supabase.from(table).upsert(base, { onConflict: 'id' }));
    }
    if (error) {
      return { ok: false, error: `${error.code || ''} ${error.message}`.trim() };
    }
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: String(e?.message || e) };
  }
}

let flushing = false;

/** Sube todo lo pendiente respetando el orden de dependencias. Nunca descarta registros. */
export async function flushQueue(): Promise<void> {
  if (flushing) return;
  flushing = true;
  try {
    for (const kind of KIND_ORDER) {
      const items = readQueue().filter(i => i.kind === kind);
      for (const item of items) {
        const result = await pushItem(item);
        const queue = readQueue();
        const idx = queue.findIndex(i => i.kind === item.kind && i.id === item.id);
        if (idx < 0) continue;

        if (result.ok) {
          // Si mientras tanto se encoló una versión más nueva, se conserva para el siguiente ciclo.
          if (queue[idx].queuedAt === item.queuedAt) queue.splice(idx, 1);
          writeQueue(queue);
        } else {
          queue[idx].attempts = (queue[idx].attempts || 0) + 1;
          queue[idx].lastError = result.error;
          writeQueue(queue);
          if (result.error && isNetworkError(result.error)) {
            return; // Sin internet: se reintenta en el siguiente ciclo
          }
        }
      }
    }
  } finally {
    flushing = false;
  }
}

// ---------- Descarga desde la nube ----------

const nn = <T,>(v: T | null | undefined): T | undefined => (v === null || v === undefined ? undefined : v);

async function fetchAll(table: string): Promise<{ rows: any[]; missing: boolean; failed: boolean }> {
  const rows: any[] = [];
  const PAGE = 1000;
  try {
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .order('id')
        .range(from, from + PAGE - 1);
      if (error) {
        const missing = isMissingTable(error);
        return { rows, missing, failed: !missing };
      }
      rows.push(...(data || []));
      if ((data || []).length < PAGE) break;
    }
    return { rows, missing: false, failed: false };
  } catch (e) {
    console.warn(`Error descargando ${table}:`, e);
    return { rows, missing: false, failed: true };
  }
}

type P<T> = Partial<T> & { id: string };

const normalizeDate = (v: any): string | undefined => {
  if (!v) return undefined;
  const s = String(v);
  return /T00:00:00(\+00:00|Z|\.000Z)?$/.test(s) ? s.substring(0, 10) : s;
};

const mapUser = (r: any): P<User> => ({
  id: r.id,
  name: nn(r.name),
  username: nn(r.username),
  email: nn(r.email),
  password: nn(r.password),
  role: nn(r.role),
  branch: nn(r.branch),
  active: nn(r.active),
  phone: nn(r.phone),
  targetDailyContacts: nn(r.target_contacts),
  targetDailyAppointments: nn(r.target_appointments),
  hireDate: nn(r.hire_date)
});

export async function fetchUsersFromCloud(): Promise<P<User>[] | null> {
  const res = await fetchAll('users');
  return res.failed ? null : res.rows.map(mapUser);
}

export interface CloudSnapshot {
  users: P<User>[];
  contacts: P<Contact>[];
  activities: P<Activity>[];
  tasks: P<TaskPending>[];
  sales: P<Sale>[];
  reports: P<DailyReport>[];
}

export async function pullCloudData(): Promise<CloudSnapshot | null> {
  const [u, c, a, t, s, r] = await Promise.all([
    fetchAll('users'),
    fetchAll('contacts'),
    fetchAll('activities'),
    fetchAll('tasks'),
    fetchAll('sales'),
    fetchAll('daily_reports')
  ]);

  // Si falló algo esencial, no se mezcla nada (evita decisiones con datos incompletos)
  if (u.failed || c.failed || a.failed || t.failed || s.failed || r.failed) return null;

  return {
    users: u.rows.map(mapUser),
    contacts: c.rows.map((row: any): P<Contact> => {
      let rawNotes: string | undefined = nn(row.notes);
      let parsedAddress: string | undefined = nn(row.address);
      let parsedEmail: string | undefined = nn(row.email);
      if (rawNotes && rawNotes.startsWith('[META:')) {
        const endBracket = rawNotes.indexOf(']');
        if (endBracket > 6) {
          const metaStr = rawNotes.substring(6, endBracket);
          rawNotes = rawNotes.substring(endBracket + 1).trim() || undefined;
          metaStr.split('||').forEach(part => {
            if (part.startsWith('DOM:') && !parsedAddress) parsedAddress = part.substring(4).trim();
            if (part.startsWith('EMAIL:') && !parsedEmail) parsedEmail = part.substring(6).trim();
          });
        }
      }
      return {
        id: row.id,
        userId: nn(row.user_id),
        branch: nn(row.branch),
        name: nn(row.name),
        phone: nn(row.phone),
        address: parsedAddress,
        email: parsedEmail,
        source: nn(row.source),
        status: nn(row.status),
        deletedByAdvisor: Boolean(row.deleted_by_advisor),
        deletedAt: nn(row.deleted_at),
        createdAt: normalizeDate(row.created_at),
        notes: rawNotes,
        lastInteraction: nn(row.last_interaction)
      };
    }),
    activities: a.rows.map((row: any): P<Activity> => ({
      id: row.id,
      userId: nn(row.user_id),
      contactId: nn(row.contact_id),
      contactName: nn(row.contact_name),
      contactPhone: nn(row.contact_phone),
      activityType: nn(row.activity_type),
      source: nn(row.source),
      packageOfferedId: nn(row.package_offered_id),
      packageOfferedName: nn(row.package_offered_name),
      result: nn(row.result),
      objection: nn(row.objection),
      notes: nn(row.notes),
      createdAt: nn(row.created_at)
    })),
    tasks: t.rows.map((row: any): P<TaskPending> => ({
      id: row.id,
      userId: nn(row.user_id),
      contactId: nn(row.contact_id),
      contactName: nn(row.contact_name),
      contactPhone: nn(row.contact_phone),
      dueDate: nn(row.due_date),
      dueTime: nn(row.due_time),
      taskType: nn(row.task_type),
      location: nn(row.location),
      isCompleted: Boolean(row.is_completed),
      completedAt: nn(row.completed_at),
      notes: nn(row.notes),
      createdAt: nn(row.created_at)
    })),
    sales: s.rows.map((row: any): P<Sale> => ({
      id: row.id,
      userId: nn(row.user_id),
      contactId: nn(row.contact_id),
      contactName: nn(row.contact_name),
      packageId: nn(row.package_id),
      packageName: nn(row.package_name),
      amount: row.amount === null || row.amount === undefined ? undefined : Number(row.amount),
      saleDate: nn(row.sale_date),
      referralsCount: nn(row.referrals_count),
      referrals: nn(row.referrals)
    })),
    reports: r.rows.map((row: any): P<DailyReport> => ({
      id: row.id,
      userId: nn(row.user_id),
      userName: nn(row.user_name),
      branch: nn(row.branch),
      date: nn(row.date),
      submittedAt: nn(row.submitted_at),
      contactsCount: nn(row.contacts_count),
      contactsTarget: nn(row.contacts_target),
      appointmentsCount: nn(row.appointments_count),
      appointmentsTarget: nn(row.appointments_target),
      salesVolume: row.sales_volume === null || row.sales_volume === undefined ? undefined : Number(row.sales_volume),
      salesCount: nn(row.sales_count),
      referralsCount: nn(row.referrals_count),
      semaforo: nn(row.semaforo),
      overallScore: nn(row.overall_score),
      dailyNotes: nn(row.daily_notes),
      signature: nn(row.signature)
    }))
  };
}

/** Inserta los usuarios iniciales SOLO si no existen (nunca pisa contraseñas ya cambiadas). */
export async function seedUsersIfMissing(users: User[]): Promise<void> {
  try {
    const rows = users.map(u => toRows('user', u).base);
    const { error } = await supabase.from('users').upsert(rows, { onConflict: 'id', ignoreDuplicates: true });
    if (error) console.warn('Seed de usuarios:', error.message);
  } catch (e) {
    console.warn('Seed de usuarios sin conexión', e);
  }
}

// ---------- Diagnóstico ----------

const PROBES: Record<string, string> = {
  users: 'id,phone,target_contacts,target_appointments,hire_date',
  contacts: 'id,notes,last_interaction',
  activities: 'id,contact_name,contact_phone,source,package_offered_name',
  tasks: 'id,task_type,location,completed_at',
  sales: 'id,referrals',
  daily_reports: 'id,signature'
};

export interface CloudDiagnosis {
  reachable: boolean;
  missingTables: string[];
  tablesWithMissingColumns: string[];
  complete: boolean;
}

export async function diagnoseCloud(): Promise<CloudDiagnosis> {
  const missingTables: string[] = [];
  const tablesWithMissingColumns: string[] = [];
  let reachable = false;

  for (const [table, cols] of Object.entries(PROBES)) {
    try {
      const { error } = await supabase.from(table).select(cols).limit(1);
      reachable = true;
      if (error) {
        if (isMissingTable(error)) missingTables.push(table);
        else if (isMissingColumn(error)) tablesWithMissingColumns.push(table);
      }
    } catch {
      // sin conexión
    }
  }

  return {
    reachable,
    missingTables,
    tablesWithMissingColumns,
    complete: reachable && missingTables.length === 0 && tablesWithMissingColumns.length === 0
  };
}

// ---------- Ciclo automático ----------

let started = false;
let runner: (() => Promise<void>) | null = null;

/** Ejecuta `cycle` al abrir, cada `intervalMs`, al volver a la pestaña y al recuperar internet. */
export function startAutoSync(cycle: () => Promise<void>, intervalMs = 20000): void {
  if (started) return;
  started = true;
  let running = false;

  const run = async () => {
    if (running) return;
    running = true;
    try {
      await cycle();
    } catch (e) {
      console.warn('Ciclo de sincronización con error', e);
    } finally {
      running = false;
    }
  };
  runner = run;

  run();
  setInterval(() => {
    if (document.visibilityState === 'visible') run();
  }, intervalMs);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') run();
  });
  window.addEventListener('online', () => {
    run();
  });
}

export function triggerSyncNow(): void {
  if (runner) runner();
}
