import { 
  User, Contact, Activity, TaskPending, Sale, 
  FuneralPackage, Branch, BranchId, DailyReport, CloudSyncConfig 
} from '../types';
import { 
  enqueueSync,
  flushQueue,
  pullCloudData,
  fetchUsersFromCloud,
  seedUsersIfMissing,
  startAutoSync,
  getPendingKeys
} from './supabaseClient';

const STORAGE_KEYS = {
  USERS: 'fh_users_v2',
  DELETED_USERS: 'fh_deleted_users_v1',
  CURRENT_USER: 'fh_current_user_v2',
  CONTACTS: 'fh_contacts_v2',
  ACTIVITIES: 'fh_activities_v2',
  TASKS: 'fh_tasks_v2',
  SALES: 'fh_sales_v2',
  PACKAGES: 'fh_packages_v2',
  BRANCHES: 'fh_branches_v2',
  DAILY_REPORTS: 'fh_daily_reports_v2',
  CLOUD_CONFIG: 'fh_cloud_config_v2',
  SETTINGS: 'fh_settings_v2'
};

// Initial Branches
export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'sucursal_1',
    name: 'Capillas Constitución (Nueva Matriz)',
    shortName: 'Capillas Constitución',
    address: 'Constitución #1200, Matriz',
    phone: '442-214-5500',
    manager: 'Lic. Patricia Hernández'
  },
  {
    id: 'sucursal_2',
    name: 'Capillas Dr. Mier y Lago de Chapala',
    shortName: 'Dr. Mier y Chapala',
    address: 'Dr. Mier esq. Lago de Chapala',
    phone: '442-238-1200',
    manager: 'Lic. Patricia Hernández'
  },
  {
    id: 'sucursal_3',
    name: 'Plan Bienestar 60+ (Capillas Dr. Mier)',
    shortName: 'Plan Bienestar 60+',
    address: 'Oficina Comercial General',
    phone: '442-310-7744',
    manager: 'Don Fernando Hernández'
  }
];

// Initial Configurable Packages (Modular & High-Ticket Focused)
export const INITIAL_PACKAGES: FuneralPackage[] = [
  {
    id: 'pkg_celestial',
    name: 'Paquete Celestial / Cobertura Total',
    subtitle: 'Anclaje High-Ticket • Protección Integral Máxima',
    price: 49500,
    isAnchor: true,
    features: [
      'Ataúd de caoba fina o cedro pulido',
      'Sala premier privada con servicio de catering 24h',
      'Servicio de cremación o inhumación completo con urna italiana',
      'Cortejo con carroza imperial de lujo y 2 vehículos de acompañamiento',
      'Asistencia tanatológica familiar y trámites jurídicos integrales',
      'Transferible 100% y sin caducidad'
    ],
    active: true
  },
  {
    id: 'pkg_imperial',
    name: 'Paquete Imperial / Estándar Superior',
    subtitle: 'Servicio Distintivo y de Alto Valor',
    price: 36800,
    isAnchor: false,
    features: [
      'Ataúd metálico de acabado especial o madera selecta',
      'Sala de velación ejecutiva con cafetería continua',
      'Embalsamamiento estético certificado',
      'Carroza para traslados locales y trámites de defunción',
      'Arreglo floral presidencial y libro de condolencias'
    ],
    active: true
  },
  {
    id: 'pkg_esencial',
    name: 'Paquete Esencial / Básico Digno',
    subtitle: 'Cobertura Esencial sin Compromisos',
    price: 24500,
    isAnchor: false,
    features: [
      'Ataúd tradicional o cremación directa básica',
      'Capilla estándar por 12 horas',
      'Preparación y arreglo del cuerpo',
      'Traslado en carroza reglamentaria',
      'Gestión de certificado médico'
    ],
    active: true
  }
];

// Initial Users: Leadership (Daniel, Linda, Rosa, Bruce) and Advisors
export const INITIAL_USERS: User[] = [
  // Liderazgo y Dirección General
  {
    id: 'usr_bruce',
    name: 'Bruce',
    username: 'bruce',
    password: 'admin123',
    email: 'bruce@funeraleshernandez.com',
    role: 'super_admin',
    branch: 'sucursal_1',
    active: true,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    phone: '4425550000',
    hireDate: '2026-01-01'
  },
  {
    id: 'usr_daniel',
    name: 'Daniel',
    username: 'daniel',
    password: 'admin123',
    email: 'daniel@funeraleshernandez.com',
    role: 'admin',
    branch: 'sucursal_1',
    active: true,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    phone: '4425550001',
    hireDate: '2026-01-01'
  },
  {
    id: 'usr_linda',
    name: 'Linda',
    username: 'linda',
    password: 'admin123',
    email: 'linda@funeraleshernandez.com',
    role: 'admin',
    branch: 'sucursal_1',
    active: true,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    phone: '4425550002',
    hireDate: '2026-01-01'
  },
  {
    id: 'usr_rosa',
    name: 'Rosa',
    username: 'rosa',
    password: 'admin123',
    email: 'rosa@funeraleshernandez.com',
    role: 'admin',
    branch: 'sucursal_1',
    active: true,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    phone: '4425550003',
    hireDate: '2026-01-01'
  },
  // Equipo Oficial de Asesores Comerciales (Nomina Funerales Hernández)
  {
    id: 'usr_manuel_rios',
    name: 'Manuel Ríos González',
    username: 'manuel.rios',
    password: '123',
    email: 'manuel.rios@funeraleshernandez.com',
    role: 'asesor',
    branch: 'sucursal_1',
    active: true,
    phone: 'RIGM780108VA8',
    hireDate: '2026-01-01',
    targetDailyContacts: 20,
    targetDailyAppointments: 3,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr_maria_saldana',
    name: 'María de Jesús Saldaña Nava',
    username: 'maria.saldana',
    password: '123',
    email: 'maria.saldana@funeraleshernandez.com',
    role: 'asesor',
    branch: 'sucursal_1',
    active: true,
    phone: 'SANJ650315I10',
    hireDate: '2026-01-01',
    targetDailyContacts: 20,
    targetDailyAppointments: 3,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr_mariano_delacruz',
    name: 'Mariano de la Cruz Gutiérrez',
    username: 'mariano.delacruz',
    password: '123',
    email: 'mariano.delacruz@funeraleshernandez.com',
    role: 'asesor',
    branch: 'sucursal_1',
    active: true,
    phone: 'CUGM920825AA6',
    hireDate: '2026-01-01',
    targetDailyContacts: 20,
    targetDailyAppointments: 3,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr_juana',
    name: 'Juana',
    username: 'juana',
    password: '123',
    email: 'juana@funeraleshernandez.com',
    role: 'asesor',
    branch: 'sucursal_1',
    active: true,
    phone: 'DOCJ640812KQ4',
    hireDate: '2026-01-01',
    targetDailyContacts: 20,
    targetDailyAppointments: 3,
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr_yuliana_botello',
    name: 'Yuliana Karely Botello Beltrán',
    username: 'yuliana.botello',
    password: '123',
    email: 'yuliana.botello@funeraleshernandez.com',
    role: 'asesor',
    branch: 'sucursal_1',
    active: true,
    phone: 'BOBY000911MTSTLLA1',
    hireDate: '2026-01-01',
    targetDailyContacts: 20,
    targetDailyAppointments: 3,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr_jorge_barrera',
    name: 'Jorge Antonio Barrera Sánchez',
    username: 'jorge.barrera',
    password: '123',
    email: 'jorge.barrera@funeraleshernandez.com',
    role: 'asesor',
    branch: 'sucursal_1',
    active: true,
    phone: 'BASJ720426128',
    hireDate: '2026-01-01',
    targetDailyContacts: 20,
    targetDailyAppointments: 3,
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr_araceli_ramirez',
    name: 'Araceli Ramírez Dávila',
    username: 'araceli.ramirez',
    password: '123',
    email: 'araceli.ramirez@funeraleshernandez.com',
    role: 'asesor',
    branch: 'sucursal_1',
    active: true,
    phone: 'RADA610729ID0',
    hireDate: '2026-01-01',
    targetDailyContacts: 20,
    targetDailyAppointments: 3,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
  }
];

export function getTodayDateString(offsetDays = 0): string {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const INITIAL_CONTACTS: Contact[] = [];
export const INITIAL_TASKS: TaskPending[] = [];
export const INITIAL_ACTIVITIES: Activity[] = [];
export const INITIAL_SALES: Sale[] = [];
export const INITIAL_DAILY_REPORTS: DailyReport[] = [];

// Initial Cloud Config
export const INITIAL_CLOUD_CONFIG: CloudSyncConfig = {
  enabled: true,
  provider: 'supabase',
  supabaseUrl: 'https://liomjpoclsdxcjnnxqhi.supabase.co',
  supabaseAnonKey: 'sb_publishable_VHM7zdpXTaP4UAlUsxwmjQ_m3GxYih9',
  lastSyncedAt: new Date().toISOString(),
  autoSyncIntervalMs: 20000,
  syncStatus: 'connected'
};

/** Mezcla `patch` sobre `base` ignorando propiedades `undefined` para nunca borrar campos locales. */
function mergeDefined<T extends Record<string, any>>(base: T, patch: Partial<T>): T {
  const out: any = { ...base };
  for (const key of Object.keys(patch)) {
    const val = (patch as any)[key];
    if (val !== undefined) {
      out[key] = val;
    }
  }
  return out as T;
}

class StorageService {
  private initialized = false;

  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;
      return JSON.parse(data);
    } catch (e) {
      console.warn(`Error reading localStorage for key ${key}`, e);
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      window.dispatchEvent(new CustomEvent('fh_storage_change', { detail: { key } }));
    } catch (e) {
      console.error(`Error saving localStorage for key ${key}`, e);
    }
  }

  public initialize(): void {
    if (this.initialized) return;
    this.initialized = true;

    const dummyIds = ['usr_carlos', 'usr_laura', 'usr_roberto'];
    const deletedIds = this.getItem<string[]>(STORAGE_KEYS.DELETED_USERS, []);
    const existingUsers = this.getItem<User[] | null>(STORAGE_KEYS.USERS, null);

    if (!existingUsers || existingUsers.length === 0) {
      this.setItem(STORAGE_KEYS.USERS, INITIAL_USERS);
    } else {
      const realUsers = existingUsers.filter(u => 
        !dummyIds.includes(u.id) &&
        !deletedIds.includes(u.id) &&
        u.name !== 'Carlos Mendoza' &&
        u.name !== 'Laura Benítez' &&
        u.name !== 'Roberto Sánchez'
      );
      INITIAL_USERS.forEach(iu => {
        if (deletedIds.includes(iu.id)) return;
        const existingIdx = realUsers.findIndex(ru => ru.id === iu.id || ru.username === iu.username);
        if (existingIdx === -1) {
          realUsers.push(iu);
        } else {
          realUsers[existingIdx] = {
            ...iu,
            ...realUsers[existingIdx],
            name: realUsers[existingIdx].name || iu.name,
            username: realUsers[existingIdx].username || iu.username,
            password: realUsers[existingIdx].password || iu.password,
            email: realUsers[existingIdx].email || iu.email
          };
        }
      });
      this.setItem(STORAGE_KEYS.USERS, realUsers);
    }

    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      this.setItem(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
    }
    this.setItem(STORAGE_KEYS.BRANCHES, INITIAL_BRANCHES);
    if (!localStorage.getItem(STORAGE_KEYS.PACKAGES)) {
      this.setItem(STORAGE_KEYS.PACKAGES, INITIAL_PACKAGES);
    }

    // Clean any dummy records from storage
    const contacts = this.getItem<Contact[]>(STORAGE_KEYS.CONTACTS, []).filter(c => !dummyIds.includes(c.userId));
    this.setItem(STORAGE_KEYS.CONTACTS, contacts);

    const tasks = this.getItem<TaskPending[]>(STORAGE_KEYS.TASKS, []).filter(t => !dummyIds.includes(t.userId));
    this.setItem(STORAGE_KEYS.TASKS, tasks);

    const acts = this.getItem<Activity[]>(STORAGE_KEYS.ACTIVITIES, []).filter(a => !dummyIds.includes(a.userId));
    this.setItem(STORAGE_KEYS.ACTIVITIES, acts);

    const sls = this.getItem<Sale[]>(STORAGE_KEYS.SALES, []).filter(s => !dummyIds.includes(s.userId));
    this.setItem(STORAGE_KEYS.SALES, sls);

    const rpts = this.getItem<DailyReport[]>(STORAGE_KEYS.DAILY_REPORTS, []).filter(r => !dummyIds.includes(r.userId));
    this.setItem(STORAGE_KEYS.DAILY_REPORTS, rpts);

    if (!localStorage.getItem(STORAGE_KEYS.CLOUD_CONFIG)) {
      this.setItem(STORAGE_KEYS.CLOUD_CONFIG, INITIAL_CLOUD_CONFIG);
    }
    
    // Inserta usuarios iniciales SOLO si faltan (sin pisar contraseñas ya cambiadas en la nube) y arranca ciclo automático
    seedUsersIfMissing(INITIAL_USERS).then(() => {
      startAutoSync(() => this.syncAllWithCloud(), 20000);
    });
  }

  // Users & Auth
  public getUsers(): User[] {
    return this.getItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  public getCurrentUser(): User {
    const users = this.getUsers();
    const stored = this.getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    if (stored && stored.id && stored.name) {
      const fresh = users.find(u => u.id === stored.id);
      return fresh || stored;
    }
    return users[0] || INITIAL_USERS[0];
  }

  public setCurrentUser(user: User): void {
    this.setItem(STORAGE_KEYS.CURRENT_USER, user);
  }

  public updateUser(user: User): void {
    const users = this.getUsers().map(u => u.id === user.id ? user : u);
    this.setItem(STORAGE_KEYS.USERS, users);
    if (this.getCurrentUser().id === user.id) {
      this.setCurrentUser(user);
    }
    enqueueSync('user', user.id, user);
  }

  public createUser(userData: Omit<User, 'id'>): User {
    const users = this.getUsers();
    const newUser: User = {
      ...userData,
      id: `usr_${Date.now()}`
    };
    users.push(newUser);
    this.setItem(STORAGE_KEYS.USERS, users);
    enqueueSync('user', newUser.id, newUser);
    return newUser;
  }

  public authenticateAdvisor(loginOrEmail: string, passwordAttempt: string): User | null {
    const users = this.getUsers();
    const cleanInput = loginOrEmail.trim().toLowerCase();
    const cleanPass = passwordAttempt.trim();

    const user = users.find(u => {
      if (u.role !== 'asesor' || !u.active) return false;

      const emailMatch = u.email.toLowerCase() === cleanInput;
      const usernameMatch = Boolean(u.username && u.username.toLowerCase() === cleanInput);
      const nameMatch = u.name.toLowerCase() === cleanInput;
      const firstNameMatch = u.name.toLowerCase().split(' ')[0] === cleanInput;
      const userPrefixMatch = Boolean(u.username && u.username.toLowerCase().split('.')[0] === cleanInput);

      return emailMatch || usernameMatch || nameMatch || firstNameMatch || userPrefixMatch;
    });

    if (!user) return null;
    const validPassword = user.password || '123';
    if (validPassword === cleanPass) {
      return user;
    }
    return null;
  }

  public authenticateUser(loginOrEmail: string, passwordAttempt: string): User | null {
    const users = this.getUsers();
    const cleanInput = loginOrEmail.trim().toLowerCase();
    const cleanPass = passwordAttempt.trim();

    const user = users.find(u => {
      if (!u.active) return false;
      const emailMatch = u.email.toLowerCase() === cleanInput;
      const usernameMatch = Boolean(u.username && u.username.toLowerCase() === cleanInput);
      const nameMatch = u.name.toLowerCase() === cleanInput;
      const firstNameMatch = u.name.toLowerCase().split(' ')[0] === cleanInput;
      const userPrefixMatch = Boolean(u.username && u.username.toLowerCase().split('.')[0] === cleanInput);
      return emailMatch || usernameMatch || nameMatch || firstNameMatch || userPrefixMatch;
    });

    if (!user) return null;
    const validPassword = user.password || (user.role === 'asesor' ? '123' : 'admin123');
    if (validPassword === cleanPass) {
      return user;
    }
    return null;
  }

  /** Sincroniza usuarios con Supabase antes de autenticar para reflejar cambios de contraseña o altas desde otros equipos. */
  public async authenticateUserAsync(loginOrEmail: string, passwordAttempt: string): Promise<User | null> {
    await this.syncUsersFromCloud();
    const user = this.authenticateUser(loginOrEmail, passwordAttempt);
    if (user) {
      this.syncAllWithCloud();
    }
    return user;
  }

  public async syncUsersFromCloud(): Promise<void> {
    try {
      await flushQueue();
      const cloudUsers = await fetchUsersFromCloud();
      if (!cloudUsers || cloudUsers.length === 0) return;
      this.mergeCloudUsers(cloudUsers);
    } catch (e) {
      console.warn('No se pudieron refrescar usuarios desde la nube', e);
    }
  }

  private mergeCloudUsers(cloudUsers: (Partial<User> & { id: string })[]): void {
    const pending = getPendingKeys();
    const deletedIds = new Set(this.getItem<string[]>(STORAGE_KEYS.DELETED_USERS, []));
    const localUsers = this.getUsers();
    const map = new Map<string, User>();
    localUsers.forEach(u => {
      if (!deletedIds.has(u.id)) map.set(u.id, u);
    });

    const initialById = new Map<string, User>(INITIAL_USERS.map(u => [u.id, u]));

    for (const cu of cloudUsers) {
      if (deletedIds.has(cu.id)) continue;
      if (pending.has(`user:${cu.id}`) && map.has(cu.id)) continue;

      const base: User = map.get(cu.id) || initialById.get(cu.id) || {
        id: cu.id,
        name: cu.name || 'Asesor',
        username: cu.username || cu.email?.split('@')[0] || cu.id,
        email: cu.email || `${cu.id}@funeraleshernandez.com`,
        password: cu.password || (cu.role === 'asesor' ? '123' : 'admin123'),
        role: cu.role || 'asesor',
        branch: cu.branch || 'sucursal_1',
        active: cu.active ?? true,
        targetDailyContacts: cu.targetDailyContacts ?? 20,
        targetDailyAppointments: cu.targetDailyAppointments ?? 3,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
      };
      map.set(cu.id, mergeDefined(base, cu));
    }

    const merged = Array.from(map.values());
    this.setItem(STORAGE_KEYS.USERS, merged);
    const curr = this.getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    if (curr) {
      const updatedCurr = merged.find(u => u.id === curr.id);
      if (updatedCurr) this.setItem(STORAGE_KEYS.CURRENT_USER, updatedCurr);
    }
  }

  public authenticateAdmin(usernameOrEmail: string, passwordAttempt: string): User | null {
    const users = this.getUsers();
    const cleanInput = usernameOrEmail.trim().toLowerCase();
    const cleanPass = passwordAttempt.trim();

    const admin = users.find(u => {
      if ((u.role !== 'admin' && u.role !== 'super_admin') || !u.active) return false;
      const emailMatch = u.email.toLowerCase() === cleanInput;
      const usernameMatch = Boolean(u.username && u.username.toLowerCase() === cleanInput);
      const nameMatch = u.name.toLowerCase() === cleanInput;
      const firstNameMatch = u.name.toLowerCase().split(' ')[0] === cleanInput;
      return emailMatch || usernameMatch || nameMatch || firstNameMatch;
    });

    if (!admin) return null;
    const validPassword = admin.password || 'admin123';
    if (validPassword === cleanPass) {
      return admin;
    }
    return null;
  }

  public changePassword(userId: string, newPassword: string): boolean {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return false;
    const updatedUser: User = {
      ...users[userIndex],
      password: newPassword.trim()
    };
    users[userIndex] = updatedUser;
    this.setItem(STORAGE_KEYS.USERS, users);
    const curr = this.getCurrentUser();
    if (curr && curr.id === userId) {
      this.setCurrentUser(updatedUser);
    }
    enqueueSync('user', updatedUser.id, updatedUser);
    return true;
  }

  public toggleUserStatus(userId: string): void {
    let toggled: User | undefined;
    const users = this.getUsers().map(u => {
      if (u.id === userId) {
        toggled = { ...u, active: !u.active };
        return toggled;
      }
      return u;
    });
    this.setItem(STORAGE_KEYS.USERS, users);
    if (toggled) {
      enqueueSync('user', toggled.id, toggled);
    }
  }

  public deleteUser(userId: string): void {
    const existing = this.getUsers().find(u => u.id === userId);
    const users = this.getUsers().filter(u => u.id !== userId);
    this.setItem(STORAGE_KEYS.USERS, users);

    const deletedIds = this.getItem<string[]>(STORAGE_KEYS.DELETED_USERS, []);
    if (!deletedIds.includes(userId)) {
      deletedIds.push(userId);
      this.setItem(STORAGE_KEYS.DELETED_USERS, deletedIds);
    }
    if (existing) {
      // Se desactiva en la nube para no romper llaves foráneas de sus prospectos históricos
      enqueueSync('user', existing.id, { ...existing, active: false });
    }
  }

  // Branches
  public getBranches(): Branch[] {
    return this.getItem<Branch[]>(STORAGE_KEYS.BRANCHES, INITIAL_BRANCHES);
  }

  // Packages
  public getPackages(): FuneralPackage[] {
    return this.getItem<FuneralPackage[]>(STORAGE_KEYS.PACKAGES, INITIAL_PACKAGES);
  }

  public savePackage(pkg: FuneralPackage): void {
    const list = this.getPackages();
    const idx = list.findIndex(p => p.id === pkg.id);
    if (idx >= 0) {
      list[idx] = pkg;
    } else {
      list.push(pkg);
    }
    this.setItem(STORAGE_KEYS.PACKAGES, list);
  }

  // Contacts
  public getContacts(): Contact[] {
    return this.getItem<Contact[]>(STORAGE_KEYS.CONTACTS, INITIAL_CONTACTS);
  }

  public saveContact(contact: Contact): void {
    const list = this.getContacts();
    const idx = list.findIndex(c => c.id === contact.id);
    if (idx >= 0) {
      list[idx] = contact;
    } else {
      list.unshift(contact);
    }
    this.setItem(STORAGE_KEYS.CONTACTS, list);
    enqueueSync('contact', contact.id, contact);
  }

  // Soft delete: hides from advisor, preserves forever for owners/admin
  public softDeleteContact(contactId: string): void {
    const list = this.getContacts();
    const idx = list.findIndex(c => c.id === contactId);
    if (idx >= 0) {
      const updated: Contact = {
        ...list[idx],
        deletedByAdvisor: true,
        deletedAt: new Date().toISOString()
      };
      list[idx] = updated;
      this.setItem(STORAGE_KEYS.CONTACTS, list);
      enqueueSync('contact', updated.id, updated);
    }
  }

  // Activities
  public getActivities(): Activity[] {
    return this.getItem<Activity[]>(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
  }

  public addActivity(activity: Activity): void {
    const list = this.getActivities();
    list.unshift(activity);
    this.setItem(STORAGE_KEYS.ACTIVITIES, list);
    enqueueSync('activity', activity.id, activity);
  }

  // Tasks
  public getTasks(): TaskPending[] {
    return this.getItem<TaskPending[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
  }

  public saveTask(task: TaskPending): void {
    const list = this.getTasks();
    const idx = list.findIndex(t => t.id === task.id);
    if (idx >= 0) {
      list[idx] = task;
    } else {
      list.unshift(task);
    }
    this.setItem(STORAGE_KEYS.TASKS, list);
    enqueueSync('task', task.id, task);
  }

  public completeTask(taskId: string): void {
    const list = this.getTasks();
    const task = list.find(t => t.id === taskId);
    if (task) {
      task.isCompleted = true;
      task.completedAt = new Date().toISOString();
      this.setItem(STORAGE_KEYS.TASKS, list);
      enqueueSync('task', task.id, task);
    }
  }

  // Sales
  public getSales(): Sale[] {
    return this.getItem<Sale[]>(STORAGE_KEYS.SALES, INITIAL_SALES);
  }

  public addSale(sale: Sale): void {
    const list = this.getSales();
    list.unshift(sale);
    this.setItem(STORAGE_KEYS.SALES, list);
    enqueueSync('sale', sale.id, sale);
  }

  // Daily Reports (Cortes Diarios Oficiales en Plataforma)
  public getDailyReports(): DailyReport[] {
    return this.getItem<DailyReport[]>(STORAGE_KEYS.DAILY_REPORTS, INITIAL_DAILY_REPORTS);
  }

  public saveDailyReport(report: DailyReport): void {
    const list = this.getDailyReports();
    const idx = list.findIndex(r => r.userId === report.userId && r.date === report.date);
    if (idx >= 0) {
      list[idx] = report;
    } else {
      list.unshift(report);
    }
    this.setItem(STORAGE_KEYS.DAILY_REPORTS, list);
    enqueueSync('report', report.id, report);
  }

  public getTodayReportForUser(userId: string): DailyReport | undefined {
    const todayStr = getTodayDateString();
    return this.getDailyReports().find(r => r.userId === userId && r.date === todayStr);
  }

  // Bidirectional Cloud Synchronization
  public async syncAllWithCloud(): Promise<void> {
    // 1. Sube primero cualquier cambio local pendiente en el orden correcto de llaves foráneas
    await flushQueue();

    // 2. Descarga estado actual de la nube
    const cloud = await pullCloudData();
    if (!cloud) return;

    const pending = getPendingKeys();

    // 3. Usuarios
    if (cloud.users.length > 0) {
      this.mergeCloudUsers(cloud.users);
    }
    const cloudUserIds = new Set(cloud.users.map(u => u.id));
    for (const localUser of this.getUsers()) {
      if (!cloudUserIds.has(localUser.id) && !pending.has(`user:${localUser.id}`)) {
        enqueueSync('user', localUser.id, localUser);
      }
    }

    // 4. Prospectos (preserva notas y campos locales cuando la nube no tenga columnas opcionales)
    const localContacts = this.getContacts();
    const contactMap = new Map<string, Contact>();
    localContacts.forEach(c => contactMap.set(c.id, c));
    const cloudContactIds = new Set<string>();

    for (const cc of cloud.contacts) {
      cloudContactIds.add(cc.id);
      if (pending.has(`contact:${cc.id}`) && contactMap.has(cc.id)) continue;
      const base: Contact = contactMap.get(cc.id) || {
        id: cc.id,
        userId: cc.userId || 'usr_bruce',
        branch: cc.branch || 'sucursal_1',
        name: cc.name || 'Prospecto',
        phone: cc.phone || 'Sin registrar',
        source: cc.source || 'frio',
        status: cc.status || 'prospecto',
        createdAt: cc.createdAt || getTodayDateString(),
        deletedByAdvisor: Boolean(cc.deletedByAdvisor)
      };
      contactMap.set(cc.id, mergeDefined(base, cc));
    }
    for (const lc of localContacts) {
      if (!cloudContactIds.has(lc.id) && !pending.has(`contact:${lc.id}`)) {
        enqueueSync('contact', lc.id, lc);
      }
    }
    if (cloud.contacts.length > 0 || localContacts.length > 0) {
      this.setItem(STORAGE_KEYS.CONTACTS, Array.from(contactMap.values()));
    }

    // Resuelve nombres/teléfonos desde contactos si la tabla activities en la nube aún no guarda esas columnas
    const allContactsById = contactMap;

    // 5. Actividades
    const localActivities = this.getActivities();
    const activityMap = new Map<string, Activity>();
    localActivities.forEach(a => activityMap.set(a.id, a));
    const cloudActivityIds = new Set<string>();
    const packagesById = new Map(this.getPackages().map(p => [p.id, p.name]));

    for (const ca of cloud.activities) {
      cloudActivityIds.add(ca.id);
      if (pending.has(`activity:${ca.id}`) && activityMap.has(ca.id)) continue;
      const linkedContact = ca.contactId ? allContactsById.get(ca.contactId) : undefined;
      const base: Activity = activityMap.get(ca.id) || {
        id: ca.id,
        userId: ca.userId || 'usr_bruce',
        contactId: ca.contactId || '',
        contactName: ca.contactName || linkedContact?.name || 'Prospecto',
        contactPhone: ca.contactPhone || linkedContact?.phone || '',
        activityType: ca.activityType || 'contacto_diario',
        source: ca.source || linkedContact?.source || 'frio',
        packageOfferedId: ca.packageOfferedId || 'pkg_celestial',
        packageOfferedName: ca.packageOfferedName || (ca.packageOfferedId ? packagesById.get(ca.packageOfferedId) : undefined) || 'Plan Previsión',
        result: ca.result || 'en_seguimiento',
        createdAt: ca.createdAt || new Date().toISOString()
      };
      const mergedAct = mergeDefined(base, ca);
      if ((!mergedAct.contactName || mergedAct.contactName === 'Contacto' || mergedAct.contactName === 'Prospecto') && linkedContact?.name) {
        mergedAct.contactName = linkedContact.name;
      }
      if (!mergedAct.contactPhone && linkedContact?.phone) {
        mergedAct.contactPhone = linkedContact.phone;
      }
      activityMap.set(ca.id, mergedAct);
    }
    for (const la of localActivities) {
      if (!cloudActivityIds.has(la.id) && !pending.has(`activity:${la.id}`)) {
        enqueueSync('activity', la.id, la);
      }
    }
    if (cloud.activities.length > 0 || localActivities.length > 0) {
      const sortedActs = Array.from(activityMap.values()).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      this.setItem(STORAGE_KEYS.ACTIVITIES, sortedActs);
    }

    // 6. Tareas Pendientes
    const localTasks = this.getTasks();
    const taskMap = new Map<string, TaskPending>();
    localTasks.forEach(t => taskMap.set(t.id, t));
    const cloudTaskIds = new Set<string>();

    for (const ct of cloud.tasks) {
      cloudTaskIds.add(ct.id);
      if (pending.has(`task:${ct.id}`) && taskMap.has(ct.id)) continue;
      const linkedContact = ct.contactId ? allContactsById.get(ct.contactId) : undefined;
      const inferredTaskType = ct.notes && /^Cita presencial/i.test(ct.notes) ? 'cita' : 'llamada';
      const base: TaskPending = taskMap.get(ct.id) || {
        id: ct.id,
        userId: ct.userId || 'usr_bruce',
        contactId: ct.contactId || '',
        contactName: ct.contactName || linkedContact?.name || 'Prospecto',
        contactPhone: ct.contactPhone || linkedContact?.phone || '',
        dueDate: ct.dueDate || getTodayDateString(),
        dueTime: ct.dueTime || '10:30',
        taskType: ct.taskType || inferredTaskType,
        isCompleted: Boolean(ct.isCompleted),
        createdAt: ct.createdAt || new Date().toISOString()
      };
      taskMap.set(ct.id, mergeDefined(base, ct));
    }
    for (const lt of localTasks) {
      if (!cloudTaskIds.has(lt.id) && !pending.has(`task:${lt.id}`)) {
        enqueueSync('task', lt.id, lt);
      }
    }
    if (cloud.tasks.length > 0 || localTasks.length > 0) {
      this.setItem(STORAGE_KEYS.TASKS, Array.from(taskMap.values()));
    }

    // 7. Ventas
    const localSales = this.getSales();
    const saleMap = new Map<string, Sale>();
    localSales.forEach(s => saleMap.set(s.id, s));
    const cloudSaleIds = new Set<string>();

    for (const cs of cloud.sales) {
      cloudSaleIds.add(cs.id);
      if (pending.has(`sale:${cs.id}`) && saleMap.has(cs.id)) continue;
      const linkedContact = cs.contactId ? allContactsById.get(cs.contactId) : undefined;
      const base: Sale = saleMap.get(cs.id) || {
        id: cs.id,
        userId: cs.userId || 'usr_bruce',
        contactId: cs.contactId || '',
        contactName: cs.contactName || linkedContact?.name || 'Cliente',
        packageId: cs.packageId || 'pkg_celestial',
        packageName: cs.packageName || 'Plan Previsión',
        amount: cs.amount ?? 0,
        saleDate: cs.saleDate || new Date().toISOString(),
        referralsCount: cs.referralsCount ?? 0,
        referrals: cs.referrals || []
      };
      saleMap.set(cs.id, mergeDefined(base, cs));
    }
    for (const ls of localSales) {
      if (!cloudSaleIds.has(ls.id) && !pending.has(`sale:${ls.id}`)) {
        enqueueSync('sale', ls.id, ls);
      }
    }
    if (cloud.sales.length > 0 || localSales.length > 0) {
      const sortedSales = Array.from(saleMap.values()).sort((a, b) => (b.saleDate || '').localeCompare(a.saleDate || ''));
      this.setItem(STORAGE_KEYS.SALES, sortedSales);
    }

    // 8. Cortes Diarios
    const localReports = this.getDailyReports();
    const reportMap = new Map<string, DailyReport>();
    localReports.forEach(r => reportMap.set(r.id, r));
    const cloudReportIds = new Set<string>();
    const usersById = new Map(this.getUsers().map(u => [u.id, u]));

    for (const cr of cloud.reports) {
      cloudReportIds.add(cr.id);
      if (pending.has(`report:${cr.id}`) && reportMap.has(cr.id)) continue;
      const u = cr.userId ? usersById.get(cr.userId) : undefined;
      const base: DailyReport = reportMap.get(cr.id) || {
        id: cr.id,
        userId: cr.userId || 'usr_bruce',
        userName: cr.userName || u?.name || 'Asesor',
        branch: cr.branch || u?.branch || 'sucursal_1',
        date: cr.date || getTodayDateString(),
        submittedAt: cr.submittedAt || new Date().toISOString(),
        contactsCount: cr.contactsCount ?? 0,
        contactsTarget: cr.contactsTarget ?? 20,
        appointmentsCount: cr.appointmentsCount ?? 0,
        appointmentsTarget: cr.appointmentsTarget ?? 3,
        salesVolume: cr.salesVolume ?? 0,
        salesCount: cr.salesCount ?? 0,
        referralsCount: cr.referralsCount ?? 0,
        semaforo: cr.semaforo || 'amarillo',
        overallScore: cr.overallScore ?? 0
      };
      reportMap.set(cr.id, mergeDefined(base, cr));
    }
    for (const lr of localReports) {
      if (!cloudReportIds.has(lr.id) && !pending.has(`report:${lr.id}`)) {
        enqueueSync('report', lr.id, lr);
      }
    }
    if (cloud.reports.length > 0 || localReports.length > 0) {
      const sortedReports = Array.from(reportMap.values()).sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''));
      this.setItem(STORAGE_KEYS.DAILY_REPORTS, sortedReports);
    }

    // Actualiza sello de última sincronización
    const cfg = this.getCloudConfig();
    this.setItem(STORAGE_KEYS.CLOUD_CONFIG, {
      ...cfg,
      lastSyncedAt: new Date().toISOString(),
      syncStatus: 'connected'
    });
  }

  // Cloud Configuration (Multi-Dispositivo)
  public getCloudConfig(): CloudSyncConfig {
    return this.getItem<CloudSyncConfig>(STORAGE_KEYS.CLOUD_CONFIG, INITIAL_CLOUD_CONFIG);
  }

  public saveCloudConfig(config: CloudSyncConfig): void {
    this.setItem(STORAGE_KEYS.CLOUD_CONFIG, config);
  }

  // Reset to initial mock state
  public resetToDefault(): void {
    this.setItem(STORAGE_KEYS.USERS, INITIAL_USERS);
    this.setItem(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
    this.setItem(STORAGE_KEYS.BRANCHES, INITIAL_BRANCHES);
    this.setItem(STORAGE_KEYS.PACKAGES, INITIAL_PACKAGES);
    this.setItem(STORAGE_KEYS.CONTACTS, INITIAL_CONTACTS);
    this.setItem(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    this.setItem(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
    this.setItem(STORAGE_KEYS.SALES, INITIAL_SALES);
    this.setItem(STORAGE_KEYS.DAILY_REPORTS, INITIAL_DAILY_REPORTS);
    this.setItem(STORAGE_KEYS.CLOUD_CONFIG, INITIAL_CLOUD_CONFIG);
  }

  public exportDataJSON(): string {
    return JSON.stringify({
      company: 'Funerales Hernández',
      users: this.getUsers(),
      branches: this.getBranches(),
      packages: this.getPackages(),
      contacts: this.getContacts(),
      tasks: this.getTasks(),
      activities: this.getActivities(),
      sales: this.getSales(),
      dailyReports: this.getDailyReports(),
      cloudConfig: this.getCloudConfig(),
      exportedAt: new Date().toISOString()
    }, null, 2);
  }
}

export const storage = new StorageService();
