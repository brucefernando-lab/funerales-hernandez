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
    name: 'Sucursal 1 - Centro Histórico (Matriz)',
    shortName: 'Centro (Matriz)',
    address: 'Av. Juárez #450, Centro',
    phone: '442-214-5500',
    manager: 'Lic. Patricia Hernández'
  },
  {
    id: 'sucursal_2',
    name: 'Sucursal 2 - Jardines del Valle',
    shortName: 'Jardines',
    address: 'Blvd. Bernardo Quintana #2100',
    phone: '442-238-1200',
    manager: 'Lic. Patricia Hernández'
  },
  {
    id: 'sucursal_3',
    name: 'Sucursal 3 - Puerta Real / Cimatario',
    shortName: 'Puerta Real',
    address: 'Paseo Constituyentes #890',
    phone: '442-310-7744',
    manager: 'Lic. Patricia Hernández'
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

// Initial Users: Owners (Super Admin), Managers, and Advisors
export const INITIAL_USERS: User[] = [
  {
    id: 'usr_dueno',
    name: 'Don Fernando Hernández',
    username: 'fernando',
    password: '7788',
    email: 'fernando.dueno@funeraleshernandez.com',
    role: 'super_admin',
    branch: 'sucursal_1',
    active: true,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    phone: '4425550001',
    hireDate: '2010-01-01'
  },
  {
    id: 'usr_admin',
    name: 'Lic. Patricia Hernández',
    username: 'patricia',
    password: '7788',
    email: 'patricia.hernandez@funeraleshernandez.com',
    role: 'admin',
    branch: 'sucursal_1',
    active: true,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    phone: '4425550199',
    hireDate: '2024-01-10'
  },
  {
    id: 'usr_carlos',
    name: 'Carlos Mendoza',
    username: 'carlos',
    password: '123',
    email: 'carlos.mendoza@funeraleshernandez.com',
    role: 'asesor',
    branch: 'sucursal_1',
    active: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '4421984521',
    hireDate: '2026-08-01',
    targetDailyContacts: 20,
    targetDailyAppointments: 3
  },
  {
    id: 'usr_laura',
    name: 'Laura Benítez',
    username: 'laura',
    password: '123',
    email: 'laura.benitez@funeraleshernandez.com',
    role: 'asesor',
    branch: 'sucursal_2',
    active: true,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    phone: '4423458912',
    hireDate: '2026-08-15',
    targetDailyContacts: 20,
    targetDailyAppointments: 3
  },
  {
    id: 'usr_roberto',
    name: 'Roberto Sánchez',
    username: 'roberto',
    password: '123',
    email: 'roberto.sanchez@funeraleshernandez.com',
    role: 'asesor',
    branch: 'sucursal_1',
    active: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '4427891234',
    hireDate: '2026-09-01',
    targetDailyContacts: 20,
    targetDailyAppointments: 3
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

export const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'cnt_1',
    userId: 'usr_carlos',
    branch: 'sucursal_1',
    name: 'Ing. Fernando Morales',
    phone: '4424567890',
    source: 'convenio',
    status: 'cita',
    createdAt: yesterday,
    notes: 'Director de RH en Parque Industrial Bernardo Quintana. Convenio corporativo de previsión para 80 colaboradores.',
    preferredPackageId: 'pkg_celestial',
    tags: ['Corporativo', 'Convenio']
  },
  {
    id: 'cnt_2',
    userId: 'usr_carlos',
    branch: 'sucursal_1',
    name: 'Sra. Martha Elena Rivas',
    phone: '4429876543',
    source: 'referido',
    status: 'prospecto',
    createdAt: today,
    notes: 'Referida por su cuñado. Muy interesada en cremación anticipada con Paquete Celestial.',
    preferredPackageId: 'pkg_celestial',
    tags: ['Cremación', 'Referido']
  },
  {
    id: 'cnt_3',
    userId: 'usr_carlos',
    branch: 'sucursal_1',
    name: 'Dr. Alejandro Guajardo',
    phone: '4421112233',
    source: 'frio',
    status: 'cliente',
    createdAt: yesterday,
    notes: 'Contrató cobertura total para él y su esposa.',
    preferredPackageId: 'pkg_celestial',
    tags: ['Cliente Cerrado', 'High Ticket']
  },
  {
    id: 'cnt_4',
    userId: 'usr_carlos',
    branch: 'sucursal_1',
    name: 'Lic. Claudia Peñaloza',
    phone: '4423334455',
    source: 'guardia',
    status: 'prospecto',
    createdAt: today,
    notes: 'Llegó a mostrador solicitando informes de previsión a futuro.',
    preferredPackageId: 'pkg_imperial',
    tags: ['Guardia Mostrador']
  },
  {
    id: 'cnt_5',
    userId: 'usr_laura',
    branch: 'sucursal_2',
    name: 'Sr. Don Guillermo Cárdenas',
    phone: '4426667788',
    source: 'referido',
    status: 'cita',
    createdAt: today,
    notes: 'Familia tradicional de Juriquilla. Pide presentación en su domicilio particular.',
    preferredPackageId: 'pkg_celestial',
    tags: ['Visita Domiciliar', 'Juriquilla']
  },
  {
    id: 'cnt_6',
    userId: 'usr_laura',
    branch: 'sucursal_2',
    name: 'Prof. Beatriz Salgado',
    phone: '4427778899',
    source: 'convenio',
    status: 'cliente',
    createdAt: yesterday,
    notes: 'Sindicato del Magisterio. Venta de paquete Imperial.',
    preferredPackageId: 'pkg_imperial',
    tags: ['Magisterio', 'Cliente']
  },
  {
    id: 'cnt_7',
    userId: 'usr_roberto',
    branch: 'sucursal_1',
    name: 'Arq. Esteban Vega',
    phone: '4428889900',
    source: 'frio',
    status: 'prospecto',
    createdAt: today,
    notes: 'Llamada en frío zona Centro. Pidió que le marquemos hoy a las 5:00 PM.',
    tags: ['Zona Centro']
  }
];

export const INITIAL_TASKS: TaskPending[] = [
  {
    id: 'tsk_1',
    userId: 'usr_carlos',
    contactId: 'cnt_1',
    contactName: 'Ing. Fernando Morales',
    contactPhone: '4424567890',
    dueDate: today,
    dueTime: '11:30',
    taskType: 'cita',
    location: 'oficina',
    isCompleted: false,
    notes: 'Presentación formal de Paquete Celestial Cobertura Total en su oficina corporativa.',
    createdAt: yesterday
  },
  {
    id: 'tsk_2',
    userId: 'usr_carlos',
    contactId: 'cnt_2',
    contactName: 'Sra. Martha Elena Rivas',
    contactPhone: '4429876543',
    dueDate: today,
    dueTime: '16:00',
    taskType: 'llamada',
    isCompleted: false,
    notes: 'Llamada de cortesía para confirmar asistencia a la sucursal Centro o resolver dudas de cremación.',
    createdAt: today
  },
  {
    id: 'tsk_3',
    userId: 'usr_carlos',
    contactId: 'cnt_4',
    contactName: 'Lic. Claudia Peñaloza',
    contactPhone: '4423334455',
    dueDate: yesterday,
    dueTime: '18:00',
    taskType: 'llamada',
    isCompleted: false,
    notes: 'Enviar cotización formal por WhatsApp y confirmar recepción.',
    createdAt: yesterday
  },
  {
    id: 'tsk_4',
    userId: 'usr_laura',
    contactId: 'cnt_5',
    contactName: 'Sr. Don Guillermo Cárdenas',
    contactPhone: '4426667788',
    dueDate: today,
    dueTime: '12:00',
    taskType: 'cita',
    location: 'domicilio',
    isCompleted: false,
    notes: 'Visita domiciliaria en Juriquilla con catálogo de maderas finas.',
    createdAt: today
  },
  {
    id: 'tsk_5',
    userId: 'usr_roberto',
    contactId: 'cnt_7',
    contactName: 'Arq. Esteban Vega',
    contactPhone: '4428889900',
    dueDate: today,
    dueTime: '17:00',
    taskType: 'llamada',
    isCompleted: false,
    notes: 'Llamada de seguimiento programada.',
    createdAt: today
  }
];

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'act_1',
    userId: 'usr_carlos',
    contactId: 'cnt_2',
    contactName: 'Sra. Martha Elena Rivas',
    contactPhone: '4429876543',
    activityType: 'contacto_diario',
    source: 'referido',
    packageOfferedId: 'pkg_celestial',
    packageOfferedName: 'Paquete Celestial / Cobertura Total',
    result: 'cita_agendada',
    notes: 'Excelente respuesta al anclaje Celestial.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'act_2',
    userId: 'usr_carlos',
    contactId: 'cnt_1',
    contactName: 'Ing. Fernando Morales',
    contactPhone: '4424567890',
    activityType: 'cita_presentacion',
    source: 'convenio',
    packageOfferedId: 'pkg_celestial',
    packageOfferedName: 'Paquete Celestial / Cobertura Total',
    result: 'cita_agendada',
    notes: 'Presentación ejecutiva 45 min.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'act_3',
    userId: 'usr_carlos',
    contactId: 'cnt_3',
    contactName: 'Dr. Alejandro Guajardo',
    contactPhone: '4421112233',
    activityType: 'cita_presentacion',
    source: 'frio',
    packageOfferedId: 'pkg_celestial',
    packageOfferedName: 'Paquete Celestial / Cobertura Total',
    result: 'venta_cerrada',
    notes: 'Venta cerrada de contado con descuento por pago único.',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'act_4',
    userId: 'usr_laura',
    contactId: 'cnt_6',
    contactName: 'Prof. Beatriz Salgado',
    contactPhone: '4427778899',
    activityType: 'cita_presentacion',
    source: 'convenio',
    packageOfferedId: 'pkg_imperial',
    packageOfferedName: 'Paquete Imperial / Estándar Superior',
    result: 'venta_cerrada',
    notes: 'Cierre con anticipo del 20%.',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
  }
];

for (let i = 1; i <= 13; i++) {
  INITIAL_ACTIVITIES.push({
    id: `act_carlos_seed_${i}`,
    userId: 'usr_carlos',
    contactId: `cnt_seed_${i}`,
    contactName: `Prospecto Matriz ${i}`,
    contactPhone: `44255510${String(i).padStart(2, '0')}`,
    activityType: 'contacto_diario',
    source: i % 2 === 0 ? 'frio' : 'convenio',
    packageOfferedId: 'pkg_celestial',
    packageOfferedName: 'Paquete Celestial / Cobertura Total',
    result: i % 3 === 0 ? 'en_seguimiento' : (i % 4 === 0 ? 'descartado' : 'en_seguimiento'),
    objection: i % 4 === 0 ? 'postergacion' : undefined,
    notes: 'Llamada de prospección telefónica.',
    createdAt: new Date(Date.now() - (14 - i) * 1800000).toISOString()
  });
}

export const INITIAL_SALES: Sale[] = [
  {
    id: 'sl_1',
    userId: 'usr_carlos',
    contactId: 'cnt_3',
    contactName: 'Dr. Alejandro Guajardo',
    packageId: 'pkg_celestial',
    packageName: 'Paquete Celestial / Cobertura Total',
    amount: 49500,
    saleDate: today,
    referralsCount: 3,
    referrals: [
      { name: 'Dra. Gabriela Soto', phone: '4423338877' },
      { name: 'Dr. Héctor Villalobos', phone: '4424449988' },
      { name: 'Lic. Mónica Guajardo', phone: '4425556611' }
    ]
  },
  {
    id: 'sl_2',
    userId: 'usr_laura',
    contactId: 'cnt_6',
    contactName: 'Prof. Beatriz Salgado',
    packageId: 'pkg_imperial',
    packageName: 'Paquete Imperial / Estándar Superior',
    amount: 36800,
    saleDate: today,
    referralsCount: 2,
    referrals: [
      { name: 'Mtra. Rocío Fuentes', phone: '4429990011' },
      { name: 'Mtro. José Luis Barajas', phone: '4428881122' }
    ]
  },
  {
    id: 'sl_3',
    userId: 'usr_carlos',
    contactId: 'cnt_prev_1',
    contactName: 'Familia Carreón Nieto',
    packageId: 'pkg_celestial',
    packageName: 'Paquete Celestial / Cobertura Total',
    amount: 49500,
    saleDate: yesterday,
    referralsCount: 2
  },
  {
    id: 'sl_4',
    userId: 'usr_roberto',
    contactId: 'cnt_prev_2',
    contactName: 'Lic. Tomás Valenzuela',
    packageId: 'pkg_esencial',
    packageName: 'Paquete Esencial / Básico Digno',
    amount: 24500,
    saleDate: yesterday,
    referralsCount: 0
  }
];

// Initial Official Daily Reports (Cortes Diarios Oficiales)
export const INITIAL_DAILY_REPORTS: DailyReport[] = [
  {
    id: 'rpt_carlos_today',
    userId: 'usr_carlos',
    userName: 'Carlos Mendoza',
    branch: 'sucursal_1',
    date: today,
    submittedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    contactsCount: 14,
    contactsTarget: 20,
    appointmentsCount: 2,
    appointmentsTarget: 3,
    salesVolume: 49500,
    salesCount: 1,
    referralsCount: 3,
    semaforo: 'verde',
    overallScore: 88,
    dailyNotes: 'Cierre exitoso del Paquete Celestial con Dr. Guajardo. Cita acordada con Ing. Morales para convenio corporativo.',
    signature: 'Carlos Mendoza • Verificado'
  },
  {
    id: 'rpt_laura_yesterday',
    userId: 'usr_laura',
    userName: 'Laura Benítez',
    branch: 'sucursal_2',
    date: yesterday,
    submittedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    contactsCount: 19,
    contactsTarget: 20,
    appointmentsCount: 3,
    appointmentsTarget: 3,
    salesVolume: 36800,
    salesCount: 1,
    referralsCount: 2,
    semaforo: 'verde',
    overallScore: 95,
    dailyNotes: 'Contrato Imperial firmado con Prof. Salgado. 2 referidos en proceso de contacto.',
    signature: 'Laura Benítez • Verificado'
  }
];

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
    const existingUsers = this.getItem<User[] | null>(STORAGE_KEYS.USERS, null);
    if (!existingUsers) {
      this.setItem(STORAGE_KEYS.USERS, INITIAL_USERS);
    } else {
      // Ensure all users have username and password
      const updated = existingUsers.map(u => {
        const init = INITIAL_USERS.find(iu => iu.id === u.id);
        return {
          ...u,
          username: u.username || init?.username || u.email.split('@')[0],
          password: u.password || init?.password || '123'
        };
      });
      this.setItem(STORAGE_KEYS.USERS, updated);
    }

    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      this.setItem(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[2]);
    }
    if (!localStorage.getItem(STORAGE_KEYS.BRANCHES)) {
      this.setItem(STORAGE_KEYS.BRANCHES, INITIAL_BRANCHES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PACKAGES)) {
      this.setItem(STORAGE_KEYS.PACKAGES, INITIAL_PACKAGES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CONTACTS)) {
      this.setItem(STORAGE_KEYS.CONTACTS, INITIAL_CONTACTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
      this.setItem(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ACTIVITIES)) {
      this.setItem(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SALES)) {
      this.setItem(STORAGE_KEYS.SALES, INITIAL_SALES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.DAILY_REPORTS)) {
      this.setItem(STORAGE_KEYS.DAILY_REPORTS, INITIAL_DAILY_REPORTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CLOUD_CONFIG)) {
      this.setItem(STORAGE_KEYS.CLOUD_CONFIG, INITIAL_CLOUD_CONFIG);
    }
  }

  // Users & Auth
  public getUsers(): User[] {
    return this.getItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  public getCurrentUser(): User {
    return this.getItem<User>(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[2]);
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

    const user = users.find(u => 
      u.role === 'asesor' && 
      u.active && 
      (u.email.toLowerCase() === cleanInput || (u.username && u.username.toLowerCase() === cleanInput))
    );

    if (!user) return null;
    const validPassword = user.password || '123';
    if (validPassword === cleanPass) {
      return user;
    }
    return null;
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
