export type UserRole = 'asesor' | 'admin' | 'super_admin';

export type BranchId = 'sucursal_1' | 'sucursal_2' | 'sucursal_3';

export interface Branch {
  id: BranchId;
  name: string;
  shortName: string;
  address: string;
  phone: string;
  manager: string;
}

export interface User {
  id: string;
  name: string;
  username?: string;
  email: string;
  password?: string;
  role: UserRole;
  branch: BranchId;
  active: boolean;
  avatar?: string;
  phone?: string;
  hireDate?: string;
  targetDailyContacts?: number;
  targetDailyAppointments?: number;
}

export type ContactSource = 
  | 'frio' 
  | 'convenio' 
  | 'referido' 
  | 'guardia';

export type ContactStatus = 
  | 'prospecto' 
  | 'cita' 
  | 'cliente' 
  | 'descartado';

export interface Contact {
  id: string;
  userId: string;
  branch: BranchId;
  name: string;
  phone: string;
  address?: string;
  email?: string;
  source: ContactSource;
  status: ContactStatus;
  createdAt: string;
  deletedByAdvisor?: boolean;
  deletedAt?: string;
  notes?: string;
  lastInteraction?: string;
  preferredPackageId?: string;
  tags?: string[];
}

export type ActivityType = 'contacto_diario' | 'cita_presentacion';

export type InteractionResult = 
  | 'cita_agendada' 
  | 'en_seguimiento' 
  | 'venta_cerrada' 
  | 'descartado';

export type ObjectionType = 
  | 'precio' 
  | 'postergacion' 
  | 'competencia' 
  | 'decision_familiar' 
  | 'ninguna';

export interface Activity {
  id: string;
  userId: string;
  contactId: string;
  contactName: string;
  contactPhone: string;
  activityType: ActivityType;
  source: ContactSource;
  packageOfferedId: string;
  packageOfferedName: string;
  result: InteractionResult;
  objection?: ObjectionType;
  notes?: string;
  createdAt: string; // ISO date string
}

export type TaskType = 'llamada' | 'cita';
export type TaskLocation = 'sucursal' | 'domicilio' | 'oficina';

export interface TaskPending {
  id: string;
  userId: string;
  contactId: string;
  contactName: string;
  contactPhone: string;
  dueDate: string; // YYYY-MM-DD
  dueTime: string; // HH:mm
  taskType: TaskType;
  location?: TaskLocation;
  isCompleted: boolean;
  completedAt?: string;
  notes?: string;
  createdAt: string;
}

export interface Referral {
  name: string;
  phone: string;
}

export interface Sale {
  id: string;
  userId: string;
  contactId: string;
  contactName: string;
  packageName: string;
  packageId: string;
  amount: number;
  saleDate: string; // ISO string
  referralsCount: number;
  referrals?: Referral[];
}

export interface FuneralPackage {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  isAnchor: boolean; // High Ticket anchor
  features: string[];
  active: boolean;
}

export type SemaforoStatus = 'verde' | 'amarillo' | 'rojo';

export interface DailyMetrics {
  contactsCompleted: number;
  contactsTarget: number;
  appointmentsCompleted: number;
  appointmentsTarget: number;
  contactsProgressPercent: number;
  appointmentsProgressPercent: number;
  overallScore: number;
  semaforo: SemaforoStatus;
  salesCount: number;
  salesVolume: number;
  averageTicket: number;
}

export interface Advisor90DayMetrics {
  userId: string;
  userName: string;
  branch: BranchId;
  active: boolean;
  totalContacts: number;
  totalAppointments: number;
  totalSales: number;
  salesVolume: number;
  averageTicket: number;
  conversionRate: number; // closed / contacts %
  appointmentRate: number; // appointments / contacts %
  logCompliancePercent: number; // percentage of target days with activity
  anchorFocusRate: number; // % of presentations where anchor package was offered
  semaforo90Days: SemaforoStatus; // Verde (Elite), Amarillo (Ajuste), Rojo (Riesgo)
  statusLabel: string;
}

// CORTE DIARIO REGISTRADO EN PLATAFORMA
export interface DailyReport {
  id: string;
  userId: string;
  userName: string;
  branch: BranchId;
  date: string; // YYYY-MM-DD
  submittedAt: string; // ISO timestamp
  contactsCount: number;
  contactsTarget: number;
  appointmentsCount: number;
  appointmentsTarget: number;
  salesVolume: number;
  salesCount: number;
  referralsCount: number;
  semaforo: SemaforoStatus;
  overallScore: number;
  dailyNotes?: string;
  signature?: string;
}

// CONFIGURACIÓN DE NUBE / MULTI-DISPOSITIVO
export interface CloudSyncConfig {
  enabled: boolean;
  provider: 'supabase' | 'custom_api' | 'local';
  supabaseUrl: string;
  supabaseAnonKey: string;
  lastSyncedAt?: string;
  autoSyncIntervalMs: number;
  syncStatus: 'idle' | 'syncing' | 'error' | 'connected';
}
