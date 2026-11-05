import { 
  User, Contact, Activity, TaskPending, Sale, 
  FuneralPackage, Branch, BranchId, DailyReport, CloudSyncConfig 
} from '../types';

const STORAGE_KEYS = {
  USERS: 'fh_users_v2',
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

const today = getTodayDateString();
const yesterday = getTodayDateString(-1);

export const INITIAL_CONTACTS: Contact[] = [];
export const INITIAL_TASKS: TaskPending[] = [];
export const INITIAL_ACTIVITIES: Activity[] = [];
export const INITIAL_SALES: Sale[] = [];
export const INITIAL_DAILY_REPORTS: DailyReport[] = [];

// Initial Cloud Config
export const INITIAL_CLOUD_CONFIG: CloudSyncConfig = {
  enabled: true,
  provider: 'supabase',
  supabaseUrl: 'https://vkmuxydfnhhernandez.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.funerales-hernandez-crm-cloud',
  lastSyncedAt: new Date().toISOString(),
  autoSyncIntervalMs: 30000,
  syncStatus: 'connected'
};

class StorageService {
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
    const dummyIds = ['usr_carlos', 'usr_laura', 'usr_roberto'];
    const existingUsers = this.getItem<User[] | null>(STORAGE_KEYS.USERS, null);

    if (!existingUsers || existingUsers.length === 0) {
      this.setItem(STORAGE_KEYS.USERS, INITIAL_USERS);
    } else {
      // Filter out fictitious dummy users
      const realUsers = existingUsers.filter(u => 
        !dummyIds.includes(u.id) &&
        u.name !== 'Carlos Mendoza' &&
        u.name !== 'Laura Benítez' &&
        u.name !== 'Roberto Sánchez'
      );
      // Ensure all 7 real advisors and leadership exist
      INITIAL_USERS.forEach(iu => {
        const existingIdx = realUsers.findIndex(ru => ru.id === iu.id || ru.username === iu.username);
        if (existingIdx === -1) {
          realUsers.push(iu);
        } else {
          // Keep custom passwords if edited by admin, but sync clean name & username
          realUsers[existingIdx] = {
            ...iu,
            ...realUsers[existingIdx],
            name: iu.name,
            username: realUsers[existingIdx].username || iu.username,
            password: realUsers[existingIdx].password || iu.password,
            email: iu.email
          };
        }
      });
      this.setItem(STORAGE_KEYS.USERS, realUsers);
    }

    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      this.setItem(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[2] || INITIAL_USERS[0]);
    }
    // Always update branches with official locations
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
  }

  // Users & Auth
  public getUsers(): User[] {
    return this.getItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  public getCurrentUser(): User {
    const users = this.getUsers();
    return this.getItem<User>(STORAGE_KEYS.CURRENT_USER, users[0] || INITIAL_USERS[0]);
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
  }

  public createUser(userData: Omit<User, 'id'>): User {
    const users = this.getUsers();
    const newUser: User = {
      ...userData,
      id: `usr_${Date.now()}`
    };
    users.push(newUser);
    this.setItem(STORAGE_KEYS.USERS, users);
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
      
      // Match first name or prefix (e.g. "manuel" matches "manuel.rios" or "Manuel Ríos González")
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
    users[userIndex] = {
      ...users[userIndex],
      password: newPassword.trim()
    };
    this.setItem(STORAGE_KEYS.USERS, users);
    const curr = this.getCurrentUser();
    if (curr && curr.id === userId) {
      this.setCurrentUser(users[userIndex]);
    }
    return true;
  }

  public toggleUserStatus(userId: string): void {
    const users = this.getUsers().map(u => {
      if (u.id === userId) {
        return { ...u, active: !u.active };
      }
      return u;
    });
    this.setItem(STORAGE_KEYS.USERS, users);
  }

  public deleteUser(userId: string): void {
    const users = this.getUsers().filter(u => u.id !== userId);
    this.setItem(STORAGE_KEYS.USERS, users);
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
  }

  // Activities
  public getActivities(): Activity[] {
    return this.getItem<Activity[]>(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
  }

  public addActivity(activity: Activity): void {
    const list = this.getActivities();
    list.unshift(activity);
    this.setItem(STORAGE_KEYS.ACTIVITIES, list);
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
  }

  public completeTask(taskId: string): void {
    const list = this.getTasks();
    const task = list.find(t => t.id === taskId);
    if (task) {
      task.isCompleted = true;
      task.completedAt = new Date().toISOString();
      this.setItem(STORAGE_KEYS.TASKS, list);
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
  }

  // Daily Reports (Cortes Diarios Oficiales en Plataforma)
  public getDailyReports(): DailyReport[] {
    return this.getItem<DailyReport[]>(STORAGE_KEYS.DAILY_REPORTS, INITIAL_DAILY_REPORTS);
  }

  public saveDailyReport(report: DailyReport): void {
    const list = this.getDailyReports();
    // Replace if already submitted today by this user, else unshift
    const idx = list.findIndex(r => r.userId === report.userId && r.date === report.date);
    if (idx >= 0) {
      list[idx] = report;
    } else {
      list.unshift(report);
    }
    this.setItem(STORAGE_KEYS.DAILY_REPORTS, list);
  }

  public getTodayReportForUser(userId: string): DailyReport | undefined {
    const todayStr = getTodayDateString();
    return this.getDailyReports().find(r => r.userId === userId && r.date === todayStr);
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
