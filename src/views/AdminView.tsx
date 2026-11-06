import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, Sale, FuneralPackage, BranchId, User, UserRole, DailyReport, CloudSyncConfig, Contact } from '../types';
import { 
  calculateAdvisor90DayMetrics, formatCurrency, 
  exportToCSV, Timeframe, filterByTimeframe 
} from '../services/metrics';
import { storage, getTodayDateString } from '../services/storage';
import { diagnoseCloud, getSyncStatus } from '../services/supabaseClient';
import { 
  Download, ShieldCheck, Building2, Users, DollarSign, 
  TrendingUp, Settings, Edit3, Plus, Check, AlertTriangle, 
  RefreshCw, Sparkles, UserPlus, Eye, Clock, Phone, Radio, 
  Crown, Trash2, ToggleLeft, ToggleRight, ClipboardCheck, Cloud, Database, Copy, CheckCircle2,
  KeyRound, EyeOff, Lock, UserCheck, MapPin, Mail, ExternalLink, X
} from 'lucide-react';

interface AdminViewProps {
  activities: Activity[];
  sales: Sale[];
  onRefreshData: () => void;
  onShowToast: (msg: string) => void;
  onOpenNewContact?: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  activities,
  sales,
  onRefreshData,
  onShowToast,
  onOpenNewContact
}) => {
  const { allUsers, branches, currentUser } = useAuth();
  const isSuperAdmin = currentUser.role === 'super_admin' || currentUser.role === 'admin';
  const todayStr = getTodayDateString();
  
  // Filters
  const [selectedBranch, setSelectedBranch] = useState<string>('todas');
  const [selectedAdvisorId, setSelectedAdvisorId] = useState<string>('todos');
  const [timeframe, setTimeframe] = useState<Timeframe>('semana');

  // Sub-tabs: 'tablero' | 'radar' | 'cortes' | 'vendedores' | 'nube' | 'configuracion'
  const [activeSubTab, setActiveSubTab] = useState<'tablero' | 'radar' | 'cortes' | 'cartera' | 'vendedores' | 'nube' | 'configuracion'>('tablero');

  // Cartera & Blindaje Anti-Borrado State
  const [contactsSearch, setContactsSearch] = useState('');
  const [contactsFilter, setContactsFilter] = useState<'todos' | 'activos' | 'eliminados'>('todos');
  const [selectedContactAdvisorId, setSelectedContactAdvisorId] = useState<string>('todos');

  const handleRestoreContact = (contactId: string) => {
    const allContacts = storage.getContacts();
    const contact = allContacts.find(c => c.id === contactId);
    if (contact) {
      const restored = {
        ...contact,
        deletedByAdvisor: false,
        deletedAt: undefined
      };
      storage.saveContact(restored);
      onRefreshData();
      onShowToast(`Prospecto "${contact.name}" reactivado con éxito en la cartera del asesor.`);
    }
  };

  const handleReassignContact = (contactId: string, newAdvisorId: string) => {
    const updated = storage.reassignContact(contactId, newAdvisorId);
    const targetUser = allUsers.find(u => u.id === newAdvisorId);
    if (updated && targetUser) {
      onRefreshData();
      onShowToast(`Prospecto "${updated.name}" asignado a ${targetUser.name} y agendado en sus pendientes de hoy.`);
    }
  };

  // Edit Contact Modal state inside AdminView
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editContactName, setEditContactName] = useState('');
  const [editContactPhone, setEditContactPhone] = useState('');
  const [editContactAddress, setEditContactAddress] = useState('');
  const [editContactEmail, setEditContactEmail] = useState('');
  const [editContactNotes, setEditContactNotes] = useState('');

  const handleOpenEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setEditContactName(contact.name);
    setEditContactPhone(contact.phone === 'Sin registrar' ? '' : contact.phone);
    setEditContactAddress(contact.address || '');
    setEditContactEmail(contact.email || '');
    setEditContactNotes(contact.notes || '');
  };

  const handleSaveEditedContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContact || !editContactName.trim()) return;
    storage.saveContact({
      ...editingContact,
      name: editContactName.trim(),
      phone: editContactPhone.trim() || 'Sin registrar',
      address: editContactAddress.trim() || undefined,
      email: editContactEmail.trim().toLowerCase() || undefined,
      notes: editContactNotes.trim() || undefined
    });
    setEditingContact(null);
    onRefreshData();
    onShowToast(`Ficha de "${editContactName.trim()}" actualizada.`);
  };

  const handleExportContactsCSV = (contactsList: Contact[]) => {
    if (contactsList.length === 0) {
      alert('No hay prospectos para exportar con los filtros actuales.');
      return;
    }
    const rows = contactsList.map(c => {
      const advisor = allUsers.find(u => u.id === c.userId);
      const branchObj = branches.find(b => b.id === c.branch);
      return {
        'Nombre del Prospecto': c.name,
        'Teléfono': c.phone,
        'Domicilio / Dirección': c.address || 'Sin registrar',
        'Correo Electrónico': c.email || 'Sin registrar',
        'Estatus Comercial': c.status.toUpperCase(),
        'Origen': c.source.toUpperCase(),
        'Vendedor Asignado': advisor ? advisor.name : 'Dirección General',
        'Sucursal': branchObj ? branchObj.name : c.branch,
        'Estado en Cartera': c.deletedByAdvisor ? 'DESCARTADO (RESGUARDADO)' : 'ACTIVO EN CRM',
        'Fecha de Registro': c.createdAt,
        'Notas / Bitácora': c.notes || ''
      };
    });
    exportToCSV(`Cartera_Prospectos_Funerales_Hernandez_${todayStr}`, rows);
    onShowToast(`Excel descargado con ${contactsList.length} prospectos.`);
  };

  // State for creating new salesperson
  const [isCreatingAdvisor, setIsCreatingAdvisor] = useState(false);
  const [newAdvName, setNewAdvName] = useState('');
  const [newAdvUsername, setNewAdvUsername] = useState('');
  const [newAdvPassword, setNewAdvPassword] = useState('123');
  const [newAdvEmail, setNewAdvEmail] = useState('');
  const [newAdvPhone, setNewAdvPhone] = useState('');
  const [newAdvBranch, setNewAdvBranch] = useState<BranchId>('sucursal_1');
  const [newAdvRole, setNewAdvRole] = useState<UserRole>('asesor');
  const [newAdvTargetContacts, setNewAdvTargetContacts] = useState<number>(20);
  const [newAdvTargetAppointments, setNewAdvTargetAppointments] = useState<number>(3);

  // Edit password state
  const [editingPasswordUserId, setEditingPasswordUserId] = useState<string | null>(null);
  const [tempNewPassword, setTempNewPassword] = useState('');

  // Personal change password state
  const [isChangeMyPasswordOpen, setIsChangeMyPasswordOpen] = useState(false);
  const [myNewPassword, setMyNewPassword] = useState('');
  const [myConfirmPassword, setMyConfirmPassword] = useState('');
  const [showMyPassword, setShowMyPassword] = useState(false);
  const [changeMyPassError, setChangeMyPassError] = useState('');

  // Cloud Config state
  const [cloudConfig, setCloudConfig] = useState<CloudSyncConfig>(() => storage.getCloudConfig());
  const [copiedSql, setCopiedSql] = useState(false);

  // Packages state
  const [packages, setPackages] = useState<FuneralPackage[]>(() => storage.getPackages());
  const [editingPkgId, setEditingPkgId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editSubtitle, setEditSubtitle] = useState('');

  // Daily reports list
  const dailyReports = storage.getDailyReports();

  // Advisors list
  const advisors = allUsers.filter(u => u.role === 'asesor');

  // Apply filters to activities and sales
  let filteredActivities = activities;
  let filteredSales = sales;

  if (selectedBranch !== 'todas') {
    const branchUserIds = allUsers.filter(u => u.branch === selectedBranch).map(u => u.id);
    filteredActivities = filteredActivities.filter(a => branchUserIds.includes(a.userId));
    filteredSales = filteredSales.filter(s => branchUserIds.includes(s.userId));
  }

  if (selectedAdvisorId !== 'todos') {
    filteredActivities = filteredActivities.filter(a => a.userId === selectedAdvisorId);
    filteredSales = filteredSales.filter(s => s.userId === selectedAdvisorId);
  }

  filteredActivities = filterByTimeframe(filteredActivities, timeframe);
  filteredSales = filterByTimeframe(filteredSales, timeframe);

  // Consolidated KPIs
  const totalContacts = filteredActivities.filter(a => a.activityType === 'contacto_diario').length;
  const totalAppointments = filteredActivities.filter(a => a.activityType === 'cita_presentacion').length;
  const totalSalesCount = filteredSales.length;
  const totalRevenue = filteredSales.reduce((acc, s) => acc + s.amount, 0);
  const globalAverageTicket = totalSalesCount > 0 ? Math.round(totalRevenue / totalSalesCount) : 0;
  const totalReferrals = filteredSales.reduce((acc, s) => acc + s.referralsCount, 0);

  // Advisor 90-Day Comparative Board calculation
  const advisorStats = advisors.map(adv => {
    return calculateAdvisor90DayMetrics(adv, activities, sales);
  });

  const displayedAdvisorStats = advisorStats.filter(stat => {
    if (selectedBranch !== 'todas' && stat.branch !== selectedBranch) return false;
    if (selectedAdvisorId !== 'todos' && stat.userId !== selectedAdvisorId) return false;
    return true;
  });

  // Objections Breakdown
  const objectionCounts: Record<string, number> = {
    precio: 0,
    postergacion: 0,
    competencia: 0,
    decision_familiar: 0,
    ninguna: 0
  };

  activities.forEach(a => {
    if (a.objection) {
      objectionCounts[a.objection] = (objectionCounts[a.objection] || 0) + 1;
    }
  });

  // Create Salesperson Handler
  const handleCreateSalesperson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdvName.trim()) {
      alert('Ingresa el nombre del vendedor.');
      return;
    }

    const generatedUsername = newAdvUsername.trim() || newAdvName.trim().toLowerCase().split(' ')[0] + Math.floor(Math.random() * 90 + 10);
    const generatedEmail = newAdvEmail.trim().toLowerCase() || `${generatedUsername}@funeraleshernandez.com`;

    storage.createUser({
      name: newAdvName.trim(),
      username: generatedUsername,
      password: newAdvPassword.trim() || '123',
      email: generatedEmail,
      phone: newAdvPhone.trim() || '4420000000',
      branch: newAdvBranch,
      role: newAdvRole,
      active: true,
      targetDailyContacts: Number(newAdvTargetContacts) || 20,
      targetDailyAppointments: Number(newAdvTargetAppointments) || 3,
      hireDate: getTodayDateString(),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    });

    onRefreshData();
    setIsCreatingAdvisor(false);
    setNewAdvName('');
    setNewAdvUsername('');
    setNewAdvPassword('123');
    setNewAdvEmail('');
    setNewAdvPhone('');
    onShowToast(`Vendedor "${newAdvName.trim()}" dado de alta exitosamente con usuario: ${generatedUsername}`);
  };

  const handleUpdatePassword = (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    if (user && tempNewPassword.trim()) {
      storage.updateUser({
        ...user,
        password: tempNewPassword.trim()
      });
      setEditingPasswordUserId(null);
      setTempNewPassword('');
      onRefreshData();
      onShowToast(`Contraseña actualizada para ${user.name}`);
    }
  };

  const handleChangeMyPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setChangeMyPassError('');

    const cleanPass = myNewPassword.trim();
    if (cleanPass.length < 4) {
      setChangeMyPassError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    if (cleanPass !== myConfirmPassword.trim()) {
      setChangeMyPassError('Las contraseñas no coinciden. Verifícalas nuevamente.');
      return;
    }

    const ok = storage.changePassword(currentUser.id, cleanPass);
    if (ok) {
      setIsChangeMyPasswordOpen(false);
      setMyNewPassword('');
      setMyConfirmPassword('');
      onRefreshData();
      onShowToast(`¡Contraseña actualizada exitosamente para ${currentUser.name}!`);
    } else {
      setChangeMyPassError('No se pudo actualizar la contraseña.');
    }
  };

  const handleToggleUserActive = (userId: string) => {
    storage.toggleUserStatus(userId);
    onRefreshData();
    onShowToast('Estado del vendedor actualizado.');
  };

  const handleDeleteUser = (userId: string, name: string) => {
    if (confirm(`¿Estás seguro de eliminar a ${name}?`)) {
      storage.deleteUser(userId);
      onRefreshData();
      onShowToast(`Vendedor ${name} eliminado.`);
    }
  };

  const handleSaveCloudConfig = () => {
    storage.saveCloudConfig(cloudConfig);
    onShowToast('Configuración de nube guardada exitosamente.');
  };

  const [isTestingCloud, setIsTestingCloud] = useState(false);

  const handleTestCloudSync = async () => {
    setIsTestingCloud(true);
    try {
      await storage.syncAllWithCloud();
      const diag = await diagnoseCloud();
      onRefreshData();
      if (!diag.reachable) {
        onShowToast('Sin conexión con Supabase. Verifica tu red.');
      } else if (diag.missingTables.length > 0) {
        onShowToast(`Conectado a Supabase. Faltan crear tablas: ${diag.missingTables.join(', ')} (Copia el SQL abajo).`);
      } else if (diag.tablesWithMissingColumns.length > 0) {
        onShowToast(`Conectado y sincronizado. Ejecuta el SQL de actualización para habilitar columnas en: ${diag.tablesWithMissingColumns.join(', ')}.`);
      } else {
        const status = getSyncStatus();
        onShowToast(`Sincronización 100% activa (${status.pending} pendientes en cola).`);
      }
    } finally {
      setIsTestingCloud(false);
    }
  };

  const copySupabaseSQL = () => {
    const sql = `-- Esquema Completo e Idempotente para Funerales Hernández en Supabase PostgreSQL
-- Seguro de ejecutar en cualquier momento (no borra datos existentes)

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT,
  password TEXT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'asesor',
  branch TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  target_contacts INT DEFAULT 20,
  target_appointments INT DEFAULT 3,
  hire_date TEXT
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS target_contacts INT DEFAULT 20;
ALTER TABLE users ADD COLUMN IF NOT EXISTS target_appointments INT DEFAULT 3;
ALTER TABLE users ADD COLUMN IF NOT EXISTS hire_date TEXT;

CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  branch TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  source TEXT,
  status TEXT DEFAULT 'prospecto',
  notes TEXT,
  last_interaction TEXT,
  deleted_by_advisor BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE contacts ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS last_interaction TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS deleted_by_advisor BOOLEAN DEFAULT FALSE;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  contact_id TEXT REFERENCES contacts(id),
  contact_name TEXT,
  contact_phone TEXT,
  source TEXT,
  activity_type TEXT NOT NULL,
  package_offered_id TEXT,
  package_offered_name TEXT,
  result TEXT NOT NULL,
  objection TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE activities ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS package_offered_name TEXT;

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  contact_id TEXT REFERENCES contacts(id),
  contact_name TEXT,
  contact_phone TEXT,
  task_type TEXT DEFAULT 'llamada',
  due_date TEXT,
  due_time TEXT,
  location TEXT,
  notes TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS task_type TEXT DEFAULT 'llamada';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  branch TEXT NOT NULL,
  contact_id TEXT REFERENCES contacts(id),
  contact_name TEXT,
  package_id TEXT,
  package_name TEXT,
  amount NUMERIC DEFAULT 0,
  referrals_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_reports (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  user_name TEXT,
  branch TEXT NOT NULL,
  date TEXT NOT NULL,
  contacts_count INT DEFAULT 0,
  target_contacts INT DEFAULT 20,
  appointments_count INT DEFAULT 0,
  target_appointments INT DEFAULT 3,
  sales_count INT DEFAULT 0,
  sales_volume NUMERIC DEFAULT 0,
  referrals_count INT DEFAULT 0,
  overall_score INT DEFAULT 0,
  semaforo TEXT,
  daily_notes TEXT,
  signature TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);`;
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
    onShowToast('Código SQL completo copiado al portapapeles.');
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    const rows = displayedAdvisorStats.map(stat => {
      const branchName = branches.find(b => b.id === stat.branch)?.name || stat.branch;
      return {
        Empresa: 'Funerales Hernández',
        Asesor: stat.userName,
        Sucursal: branchName,
        'Semáforo 90 Días': stat.statusLabel,
        'Cumplimiento Bitácora (%)': `${stat.logCompliancePercent}%`,
        'Contactos Totales': stat.totalContacts,
        'Citas Totales': stat.totalAppointments,
        'Contratos Cerrados': stat.totalSales,
        'Volumen Facturado ($)': stat.salesVolume,
        'Ticket Promedio ($)': stat.averageTicket,
        'Tasa Conversión (%)': `${stat.conversionRate}%`,
        'Enfoque Anclaje (%)': `${stat.anchorFocusRate}%`
      };
    });

    exportToCSV(`Reporte_Directivo_Funerales_Hernandez_${timeframe}`, rows);
    onShowToast('Reporte CSV descargado con éxito.');
  };

  const handleStartEditPackage = (pkg: FuneralPackage) => {
    setEditingPkgId(pkg.id);
    setEditName(pkg.name);
    setEditPrice(pkg.price);
    setEditSubtitle(pkg.subtitle);
  };

  const handleSavePackage = () => {
    if (!editingPkgId) return;
    const pkg = packages.find(p => p.id === editingPkgId);
    if (!pkg) return;

    const updated: FuneralPackage = {
      ...pkg,
      name: editName.trim(),
      price: Number(editPrice),
      subtitle: editSubtitle.trim()
    };

    storage.savePackage(updated);
    setPackages(storage.getPackages());
    setEditingPkgId(null);
    onRefreshData();
    onShowToast(`Paquete "${updated.name}" actualizado dinámicamente.`);
  };

  const handleToggleAnchor = (pkgId: string) => {
    const list = storage.getPackages();
    const updated = list.map(p => ({
      ...p,
      isAnchor: p.id === pkgId
    }));
    updated.forEach(p => storage.savePackage(p));
    setPackages(storage.getPackages());
    onRefreshData();
    onShowToast('Anclaje High-Ticket reconfigurado exitosamente.');
  };

  return (
    <div className="space-y-4 pb-24 text-slate-100">
      
      {/* Admin / Owner Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-2xl border border-slate-800 p-4 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              {isSuperAdmin ? (
                <Crown className="w-5 h-5 text-amber-400" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-amber-400" />
              )}
              <h2 className="text-base font-bold text-white font-serif uppercase tracking-wide">
                {isSuperAdmin ? 'Panel de Dueños (Super Admin)' : 'Panel de Dirección General'}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Funerales Hernández • Supervisión Integral de 3 Sucursales • Programa 90 Días
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setChangeMyPassError('');
                setMyNewPassword('');
                setMyConfirmPassword('');
                setIsChangeMyPasswordOpen(true);
              }}
              className="flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold px-3 py-1.5 rounded-xl text-xs shadow-sm transition-all active:scale-95"
              title="Cambiar mi contraseña personal de acceso"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Cambiar Mi Contraseña</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs shadow-md transition-all active:scale-95"
              title="Exportar métricas a formato Excel / CSV"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>

        {/* Current Admin Session Bar */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">
              Conectado como: <strong className="text-white font-semibold">{currentUser.name}</strong> 
              <span className="text-amber-400/90 font-mono ml-1">(@{currentUser.username || currentUser.email.split('@')[0]})</span>
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
              {isSuperAdmin ? 'Super Administrador' : 'Directivo'}
            </span>
          </div>

          <button
            onClick={() => {
              setChangeMyPassError('');
              setMyNewPassword('');
              setMyConfirmPassword('');
              setIsChangeMyPasswordOpen(true);
            }}
            className="text-[11px] text-amber-400 hover:text-amber-300 underline font-medium"
          >
            ¿Deseas cambiar tu contraseña? Haz clic aquí
          </button>
        </div>
      </div>

      {/* Subtab Navigation (Scrollable Tabs) */}
      <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSubTab('tablero')}
          className={`py-2 px-3 rounded-lg font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'tablero'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Tablero</span>
        </button>

        <button
          onClick={() => setActiveSubTab('radar')}
          className={`py-2 px-3 rounded-lg font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'radar'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Radar Vivo</span>
        </button>

        <button
          onClick={() => setActiveSubTab('cortes')}
          className={`py-2 px-3 rounded-lg font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'cortes'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ClipboardCheck className="w-3.5 h-3.5" />
          <span>Cortes Diarios</span>
        </button>

        <button
          onClick={() => setActiveSubTab('cartera')}
          className={`py-2 px-3 rounded-lg font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'cartera'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Cartera & Blindaje</span>
        </button>

        <button
          onClick={() => setActiveSubTab('vendedores')}
          className={`py-2 px-3 rounded-lg font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'vendedores'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Asesores</span>
        </button>

        <button
          onClick={() => setActiveSubTab('nube')}
          className={`py-2 px-3 rounded-lg font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'nube'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cloud className="w-3.5 h-3.5" />
          <span>Nube Cloud</span>
        </button>

        <button
          onClick={() => setActiveSubTab('configuracion')}
          className={`py-2 px-3 rounded-lg font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'configuracion'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Paquetes</span>
        </button>
      </div>

      {/* 1. SUBTAB: TABLERO COMPARATIVO */}
      {activeSubTab === 'tablero' && (
        <>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-2 text-xs">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
              Filtros de Supervisión
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Sucursal:</label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="todas">Todas las Sucursales (3)</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Asesor Individual:</label>
                <select
                  value={selectedAdvisorId}
                  onChange={(e) => setSelectedAdvisorId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="todos">Todos los Asesores ({advisors.length})</option>
                  {advisors.map(adv => (
                    <option key={adv.id} value={adv.id}>{adv.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Período:</label>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { id: 'hoy', label: 'Hoy' },
                    { id: 'semana', label: 'Semana' },
                    { id: 'mes', label: 'Mes' },
                    { id: '90_dias', label: '90 D' }
                  ].map(t => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setTimeframe(t.id as Timeframe)}
                      className={`py-1.5 rounded text-center font-medium ${
                        timeframe === t.id
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] text-slate-400 block">Facturación Total</span>
              <span className="text-base font-extrabold text-emerald-400 font-mono">
                {formatCurrency(totalRevenue)}
              </span>
              <span className="text-[9px] text-slate-500 block mt-0.5">{totalSalesCount} contratos cerrados</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] text-slate-400 block">Ticket Promedio Global</span>
              <span className="text-base font-extrabold text-amber-400 font-mono">
                {formatCurrency(globalAverageTicket)}
              </span>
              <span className="text-[9px] text-slate-500 block mt-0.5">Meta Directiva: &gt; $35,000</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] text-slate-400 block">Contactos / Citas</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-base font-extrabold text-white font-mono">{totalContacts}</span>
                <span className="text-xs text-slate-400">/</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">{totalAppointments}</span>
              </div>
              <span className="text-[9px] text-slate-500 block">Prospección en período</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] text-slate-400 block">Referidos Nuevos</span>
              <span className="text-base font-extrabold text-sky-400 font-mono">
                {totalReferrals}
              </span>
              <span className="text-[9px] text-slate-500 block mt-0.5">Prospectos ingresados a cartera</span>
            </div>
          </div>

          {/* TABLERO COMPARATIVO Y SEMÁFORO DE DESEMPEÑO (90 DÍAS) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-serif flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-amber-400" />
                  Semáforo Semanal y Filtro de Rendimiento 90 Días
                </h3>
                <p className="text-[11px] text-slate-400">
                  Evaluación de disciplina operativa y anclaje de paquetes High-Ticket
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-[10px] py-1">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                <span className="font-bold block">🟢 Asesor Élite (&gt;= 85%)</span>
                <span>Bitácora completa y paquetes altos</span>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300">
                <span className="font-bold block">🟡 En Ajuste (65% - 84%)</span>
                <span>Ritmo regular de llamadas</span>
              </div>
              <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300">
                <span className="font-bold block">🔴 En Riesgo (&lt; 65%)</span>
                <span>Faltas recurrentes en registro</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              {displayedAdvisorStats.map(stat => {
                const branchName = branches.find(b => b.id === stat.branch)?.shortName || stat.branch;
                const isElite = stat.semaforo90Days === 'verde';
                const isWarning = stat.semaforo90Days === 'amarillo';

                return (
                  <div
                    key={stat.userId}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isElite ? 'bg-slate-850 border-emerald-500/30' :
                      isWarning ? 'bg-slate-850 border-amber-500/30' :
                      'bg-slate-850 border-rose-500/40 shadow-rose-950/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-3 h-3 rounded-full shrink-0 ${
                          isElite ? 'bg-emerald-400 shadow-sm shadow-emerald-400' :
                          isWarning ? 'bg-amber-400' : 'bg-rose-500 shadow-sm shadow-rose-500'
                        }`} />
                        <div>
                          <div className="font-bold text-white text-xs">{stat.userName}</div>
                          <div className="text-[10px] text-slate-400">{branchName}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          isElite ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          isWarning ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {stat.statusLabel}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Bitácora: <b className="text-white">{stat.logCompliancePercent}%</b>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 text-center bg-slate-900/60 p-2 rounded-lg border border-slate-800 text-[11px]">
                      <div>
                        <span className="text-[9px] text-slate-400 block">Contactos</span>
                        <span className="font-bold text-white font-mono">{stat.totalContacts}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block">Citas</span>
                        <span className="font-bold text-emerald-400 font-mono">{stat.totalAppointments}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block">Cierres</span>
                        <span className="font-bold text-amber-400 font-mono">{stat.totalSales}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block">Ticket Promedio</span>
                        <span className="font-bold text-amber-300 font-mono">{formatCurrency(stat.averageTicket)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Analysis of Objections */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-serif flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Análisis de Objeciones Comerciales (Motivos de Descarte)
            </h3>
            <div className="space-y-2 text-xs">
              {[
                { label: 'Postergación ("Déjeme pensarlo / Más adelante")', count: objectionCounts.postergacion || 0, color: 'bg-amber-500' },
                { label: 'Precio / Presupuesto limitado', count: objectionCounts.precio || 0, color: 'bg-rose-500' },
                { label: 'Decisión Familiar / Consultar con cónyuge', count: objectionCounts.decision_familiar || 0, color: 'bg-blue-500' },
                { label: 'Competencia / Ya cuenta con servicio', count: objectionCounts.competencia || 0, color: 'bg-purple-500' },
                { label: 'Ninguna / Desinterés', count: objectionCounts.ninguna || 0, color: 'bg-slate-500' }
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300">{item.label}</span>
                    <span className="font-bold text-white">{item.count} incidentes</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div
                      className={`${item.color} h-full rounded-full`}
                      style={{ width: `${Math.min(100, (item.count / Math.max(1, activities.length)) * 100 * 3)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 2. SUBTAB: RADAR EN VIVO */}
      {activeSubTab === 'radar' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white font-serif flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
                Radar en Vivo • Supervisión en Tiempo Real
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Los dueños pueden ver cada movimiento registrado por los asesores minuto a minuto
              </p>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
              En Vivo
            </span>
          </div>

          <div className="space-y-2.5">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No hay actividades registradas en la bitácora todavía.
              </div>
            ) : (
              activities.slice(0, 15).map(act => {
                const advisor = allUsers.find(u => u.id === act.userId);
                const branch = branches.find(b => b.id === advisor?.branch);
                const isSale = act.result === 'venta_cerrada';
                const isAppointment = act.result === 'cita_agendada';
                const isDiscarded = act.result === 'descartado';

                return (
                  <div
                    key={act.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isSale ? 'bg-emerald-950/20 border-emerald-500/40 shadow-sm' :
                      isAppointment ? 'bg-blue-950/20 border-blue-500/30' :
                      isDiscarded ? 'bg-rose-950/20 border-rose-500/30' :
                      'bg-slate-850 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-white">
                            {advisor?.name || 'Asesor'}
                          </span>
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded border border-slate-700">
                            {branch?.shortName}
                          </span>
                          <span className={`text-[9px] font-bold px-2 py-0.2 rounded-full uppercase ${
                            isSale ? 'bg-emerald-500/20 text-emerald-300' :
                            isAppointment ? 'bg-blue-500/20 text-blue-300' :
                            isDiscarded ? 'bg-rose-500/20 text-rose-300' :
                            'bg-amber-500/20 text-amber-300'
                          }`}>
                            {act.result.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="text-xs text-slate-200 mt-1 font-serif">
                          Prospecto: <b>{act.contactName}</b> ({act.contactPhone})
                        </div>

                        <div className="text-[11px] text-amber-400 mt-0.5">
                          Paquete Ofrecido: {act.packageOfferedName}
                        </div>

                        {act.notes && (
                          <div className="text-[11px] text-slate-400 mt-1 italic bg-slate-900/60 p-1.5 rounded border border-slate-800">
                            "{act.notes}"
                          </div>
                        )}

                        {act.objection && (
                          <div className="text-[10px] text-rose-400 mt-1 font-semibold">
                            Objeción: {act.objection.replace('_', ' ')}
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[9px] text-slate-500 block mt-0.5">
                          {act.createdAt.substring(0, 10)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 3. SUBTAB: CORTES DIARIOS OFICIALES EN PLATAFORMA */}
      {activeSubTab === 'cortes' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white font-serif flex items-center gap-1.5">
                <ClipboardCheck className="w-4 h-4 text-amber-400" />
                Auditoría de Cortes Diarios (8:00 PM)
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Cierres de jornada oficiales asentados en la plataforma por los vendedores
              </p>
            </div>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
              Hoy: {todayStr}
            </span>
          </div>

          {/* Verification of Today's Submissions */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Estatus de Entrega del Día de Hoy
            </span>
            <div className="grid grid-cols-1 gap-2">
              {advisors.map(adv => {
                const reportToday = dailyReports.find(r => r.userId === adv.id && r.date === todayStr);
                const branch = branches.find(b => b.id === adv.branch);

                return (
                  <div
                    key={adv.id}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                      reportToday
                        ? 'bg-emerald-950/20 border-emerald-500/40'
                        : 'bg-rose-950/20 border-rose-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-3 h-3 rounded-full ${reportToday ? 'bg-emerald-400' : 'bg-rose-500 animate-pulse'}`} />
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{adv.name}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({branch?.shortName})</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {reportToday ? (
                            <span className="text-emerald-300">
                              ✓ Entregado a las {new Date(reportToday.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Score: <b>{reportToday.overallScore}%</b>
                            </span>
                          ) : (
                            <span className="text-rose-400 font-semibold">
                              ⚠️ Pendiente de entrega en plataforma (Falta de bitácora)
                            </span>
                          )}
                        </div>
                        {reportToday?.dailyNotes && (
                          <div className="text-[10px] text-slate-300 mt-1 italic bg-slate-900/60 p-1.5 rounded">
                            "{reportToday.dailyNotes}"
                          </div>
                        )}
                      </div>
                    </div>

                    {reportToday && (
                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-bold text-amber-400 block">
                          {formatCurrency(reportToday.salesVolume)}
                        </span>
                        <span className="text-[9px] text-slate-400">
                          {reportToday.contactsCount} llamadas • {reportToday.appointmentsCount} citas
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Historial de Cortes Anteriores */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Historial de Cortes Registrados ({dailyReports.length})
            </span>
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {dailyReports.map(rep => (
                <div key={rep.id} className="p-2.5 bg-slate-850 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-white">{rep.userName}</span>
                    <span className="text-[10px] text-slate-400 block">{rep.date} • {rep.signature || 'Firma asentada'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-400 font-bold block">
                      Semáforo: {rep.semaforo.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-slate-400">Score: {rep.overallScore}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB: CARTERA & BLINDAJE ANTI-BORRADO */}
      {activeSubTab === 'cartera' && (() => {
        const allContacts = storage.getContacts();
        const activeContactsCount = allContacts.filter(c => !c.deletedByAdvisor).length;
        const deletedContactsCount = allContacts.filter(c => c.deletedByAdvisor).length;

        let filtered = allContacts;
        if (contactsFilter === 'activos') {
          filtered = filtered.filter(c => !c.deletedByAdvisor);
        } else if (contactsFilter === 'eliminados') {
          filtered = filtered.filter(c => c.deletedByAdvisor);
        }

        if (selectedContactAdvisorId !== 'todos') {
          filtered = filtered.filter(c => c.userId === selectedContactAdvisorId);
        }

        if (contactsSearch.trim()) {
          const q = contactsSearch.toLowerCase();
          filtered = filtered.filter(c => 
            c.name.toLowerCase().includes(q) || 
            c.phone.includes(q) ||
            Boolean(c.address && c.address.toLowerCase().includes(q)) ||
            Boolean(c.email && c.email.toLowerCase().includes(q))
          );
        }

        return (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-serif flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Blindaje de Cartera y Prospectos
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Histórico permanente de la empresa. Ningún prospecto se pierde aunque un vendedor lo descarte de su CRM.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => handleExportContactsCSV(filtered)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow active:scale-95 transition-transform"
                  title="Descargar base de datos de prospectos en formato Excel (CSV)"
                >
                  <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Exportar Prospectos a Excel</span>
                </button>
                {onOpenNewContact && (
                  <button
                    type="button"
                    onClick={onOpenNewContact}
                    className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow active:scale-95 transition-transform"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>+ Registrar Prospecto</span>
                  </button>
                )}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Cloud className="w-3.5 h-3.5" />
                  Supabase Cloud
                </span>
              </div>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total en Base de Datos</span>
                <span className="text-xl font-bold font-mono text-white mt-0.5 block">{allContacts.length}</span>
                <span className="text-[10px] text-slate-500">Patrimonio comercial histórico</span>
              </div>

              <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3">
                <span className="text-[10px] text-emerald-400 uppercase font-semibold block">Activos en CRM Vendedores</span>
                <span className="text-xl font-bold font-mono text-emerald-400 mt-0.5 block">{activeContactsCount}</span>
                <span className="text-[10px] text-emerald-500/70">En seguimiento comercial vivo</span>
              </div>

              <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3">
                <span className="text-[10px] text-amber-400 uppercase font-semibold block flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                  Protegidos (Descartados)
                </span>
                <span className="text-xl font-bold font-mono text-amber-400 mt-0.5 block">{deletedContactsCount}</span>
                <span className="text-[10px] text-amber-500/70">Ocultos al vendedor, resguardados para dueños</span>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Buscar (Nombre, Teléfono, Domicilio o Correo):</label>
                <input
                  type="text"
                  value={contactsSearch}
                  onChange={(e) => setContactsSearch(e.target.value)}
                  placeholder="Ej. Carlos, 867, Col. Centro, correo..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Filtrar por Estatus:</label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'todos', label: 'Todos' },
                    { id: 'activos', label: 'Activos' },
                    { id: 'eliminados', label: 'Descartados' }
                  ].map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setContactsFilter(f.id as any)}
                      className={`py-1.5 rounded text-center text-[11px] font-medium transition-colors ${
                        contactsFilter === f.id
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Vendedor Asignado:</label>
                <select
                  value={selectedContactAdvisorId}
                  onChange={(e) => setSelectedContactAdvisorId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="todos">Todos los Vendedores ({advisors.length})</option>
                  {advisors.map(adv => (
                    <option key={adv.id} value={adv.id}>{adv.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contacts Table / Cards */}
            <div className="space-y-2">
              {filtered.length === 0 ? (
                <div className="text-center py-8 bg-slate-800/20 rounded-xl border border-dashed border-slate-800 text-xs text-slate-500">
                  No se encontraron prospectos con los filtros seleccionados.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {filtered.map(contact => {
                    const advisor = allUsers.find(u => u.id === contact.userId);
                    const isDeleted = Boolean(contact.deletedByAdvisor);

                    return (
                      <div
                        key={contact.id}
                        className={`rounded-xl p-3 border transition-all ${
                          isDeleted
                            ? 'bg-amber-950/10 border-amber-500/30'
                            : 'bg-slate-800/40 border-slate-700/60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-white font-serif">
                                {contact.name}
                              </h4>
                              {isDeleted ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  <ShieldCheck className="w-3 h-3" />
                                  Resguardado (Descartado por asesor)
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  Activo en CRM
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-300 font-mono">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <a href={`tel:${contact.phone}`} className="hover:text-amber-400 underline">
                                {contact.phone}
                              </a>
                            </div>
                            {contact.address && (
                              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-300">
                                <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                                <span>{contact.address}</span>
                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] text-amber-400 hover:underline font-semibold inline-flex items-center gap-0.5 ml-1"
                                  title="Ver en Google Maps"
                                >
                                  <span>[Mapa]</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              </div>
                            )}
                            {contact.email && (
                              <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-sky-300">
                                <Mail className="w-3 h-3 text-sky-400 shrink-0" />
                                <a href={`mailto:${contact.email}`} className="hover:underline">
                                  {contact.email}
                                </a>
                              </div>
                            )}
                            {contact.notes && (
                              <div className="text-[10px] text-slate-400 italic mt-1">
                                "{contact.notes}"
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenEditContact(contact)}
                              className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 flex items-center gap-1"
                              title="Editar nombre, teléfono, domicilio o correo"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Editar</span>
                            </button>
                            {isDeleted && (
                              <button
                                type="button"
                                onClick={() => handleRestoreContact(contact.id)}
                                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow flex items-center gap-1"
                                title="Regresar prospecto a la cartera activa del asesor"
                              >
                                <RefreshCw className="w-3 h-3" />
                                Reactivar
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 space-y-2 text-[10px] text-slate-400">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
                              <UserCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span className="text-slate-400 font-semibold shrink-0">Asignar / Pasar a:</span>
                              <select
                                value={contact.userId}
                                onChange={(e) => handleReassignContact(contact.id, e.target.value)}
                                className="flex-1 bg-slate-900 border border-amber-500/40 hover:border-amber-400 rounded-lg px-2 py-1 text-[11px] text-white font-semibold focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
                              >
                                <optgroup label="Vendedores / Asesores Comerciales">
                                  {advisors.map(adv => (
                                    <option key={adv.id} value={adv.id}>
                                      👤 {adv.name}
                                    </option>
                                  ))}
                                </optgroup>
                                <optgroup label="Dirección General">
                                  {allUsers.filter(u => u.role === 'admin' || u.role === 'super_admin').map(adm => (
                                    <option key={adm.id} value={adm.id}>
                                      👑 {adm.name} (Dirección)
                                    </option>
                                  ))}
                                </optgroup>
                              </select>
                            </div>

                            <div className="flex items-center gap-2">
                              <div>
                                <span className="text-slate-500">Estatus: </span>
                                <span className="capitalize text-amber-400/90 font-semibold">{contact.status}</span>
                              </div>
                              {contact.deletedAt && (
                                <div className="text-amber-400/80 text-[9px]">
                                  Descartado: {contact.deletedAt.split('T')[0]}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* 4. SUBTAB: GESTIÓN DE ASESORES */}
      {activeSubTab === 'vendedores' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white font-serif flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-amber-400" />
                Módulo Super Admin: Gestión de Vendedores
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Da de alta nuevos asesores comerciales y asigna sucursales y metas
              </p>
            </div>
            <button
              onClick={() => setIsCreatingAdvisor(!isCreatingAdvisor)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-md transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isCreatingAdvisor ? 'Cerrar' : '+ Crear Vendedor'}</span>
            </button>
          </div>

          {isCreatingAdvisor && (
            <form onSubmit={handleCreateSalesperson} className="p-3.5 bg-slate-850 rounded-xl border border-amber-500/40 space-y-3 text-xs animate-in fade-in">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                Nuevo Asesor Comercial
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={newAdvName}
                    onChange={(e) => {
                      setNewAdvName(e.target.value);
                      if (!newAdvUsername) {
                        setNewAdvUsername(e.target.value.toLowerCase().replace(/\s+/g, '.'));
                      }
                    }}
                    placeholder="Ej. Martín Guerrero Pérez"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Usuario de Acceso *</label>
                  <input
                    type="text"
                    required
                    value={newAdvUsername}
                    onChange={(e) => setNewAdvUsername(e.target.value.toLowerCase().trim())}
                    placeholder="Ej. martin.guerrero o mguerrero"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Contraseña Inicial *</label>
                  <input
                    type="text"
                    required
                    value={newAdvPassword}
                    onChange={(e) => setNewAdvPassword(e.target.value)}
                    placeholder="Contraseña para que entre"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Correo Institucional (opcional)</label>
                  <input
                    type="email"
                    value={newAdvEmail}
                    onChange={(e) => setNewAdvEmail(e.target.value)}
                    placeholder="martin.guerrero@funeraleshernandez.com"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Teléfono Móvil (10 dígitos)</label>
                  <input
                    type="tel"
                    value={newAdvPhone}
                    onChange={(e) => setNewAdvPhone(e.target.value)}
                    placeholder="442 555 4321"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Sucursal Asignada</label>
                  <select
                    value={newAdvBranch}
                    onChange={(e) => setNewAdvBranch(e.target.value as BranchId)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Meta Diaria Contactos</label>
                  <input
                    type="number"
                    value={newAdvTargetContacts}
                    onChange={(e) => setNewAdvTargetContacts(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Meta Diaria Citas</label>
                  <input
                    type="number"
                    value={newAdvTargetAppointments}
                    onChange={(e) => setNewAdvTargetAppointments(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-bold py-2 rounded-xl text-xs uppercase"
                >
                  Registrar en el Sistema
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreatingAdvisor(false)}
                  className="px-3 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Plantilla de Asesores Registrados ({advisors.length})
            </span>
            {advisors.map(adv => {
              const branch = branches.find(b => b.id === adv.branch);

              return (
                <div
                  key={adv.id}
                  className="bg-slate-850 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-amber-400 text-xs">
                      {adv.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{adv.name}</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                          adv.active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {adv.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-300 flex items-center gap-2 mt-0.5 flex-wrap">
                        <span>Usuario: <strong className="font-mono text-amber-300">{adv.username || adv.email.split('@')[0]}</strong></span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          Clave: 
                          {editingPasswordUserId === adv.id ? (
                            <span className="inline-flex items-center gap-1">
                              <input
                                type="text"
                                autoFocus
                                value={tempNewPassword}
                                onChange={(e) => setTempNewPassword(e.target.value)}
                                placeholder="Nueva clave"
                                className="bg-slate-900 border border-amber-400 rounded px-1.5 py-0.5 text-[10px] font-mono text-white w-24"
                              />
                              <button
                                onClick={() => handleUpdatePassword(adv.id)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-1.5 py-0.5 rounded text-[10px] font-bold"
                              >
                                Guardar
                              </button>
                              <button
                                onClick={() => setEditingPasswordUserId(null)}
                                className="bg-slate-700 text-slate-300 px-1 py-0.5 rounded text-[10px]"
                              >
                                ✕
                              </button>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1">
                              <strong className="font-mono text-white bg-slate-900 px-1.5 py-0.2 rounded border border-slate-750">
                                {adv.password || '123'}
                              </strong>
                              <button
                                onClick={() => {
                                  setEditingPasswordUserId(adv.id);
                                  setTempNewPassword(adv.password || '123');
                                }}
                                className="text-[9px] text-amber-400 hover:underline ml-0.5"
                              >
                                [Editar]
                              </button>
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {branch?.shortName} • {adv.email} • Tel: {adv.phone}
                      </div>
                      <div className="text-[10px] text-amber-400/90 mt-0.5">
                        Metas: {adv.targetDailyContacts || 20} contactos / {adv.targetDailyAppointments || 3} citas día
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    <button
                      onClick={() => handleToggleUserActive(adv.id)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                      title={adv.active ? 'Pausar asesor' : 'Activar asesor'}
                    >
                      {adv.active ? (
                        <ToggleRight className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="w-4 h-4 text-rose-400" />
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setSelectedAdvisorId(adv.id);
                        setActiveSubTab('radar');
                      }}
                      className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold flex items-center gap-1"
                      title="Ver bitácora en vivo de este asesor"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Ver Radar</span>
                    </button>

                    <button
                      onClick={() => handleDeleteUser(adv.id, adv.name)}
                      className="p-1.5 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-lg text-xs"
                      title="Eliminar asesor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cuentas de Dirección y Administración */}
          <div className="space-y-2 pt-4 border-t border-slate-800">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5" />
              <span>Equipo de Dirección y Administración ({allUsers.filter(u => u.role === 'admin' || u.role === 'super_admin').length})</span>
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {allUsers.filter(u => u.role === 'admin' || u.role === 'super_admin').map(leader => (
                <div
                  key={leader.id}
                  className="bg-slate-850 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-2.5"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{leader.name}</span>
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold uppercase">
                        {leader.role === 'super_admin' ? 'Super Admin' : 'Dirección'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>Usuario: <strong className="font-mono text-amber-300">{leader.username || leader.name.toLowerCase()}</strong></span>
                      <span>•</span>
                      <span>
                        Clave: 
                        {editingPasswordUserId === leader.id ? (
                          <span className="inline-flex items-center gap-1 ml-1">
                            <input
                              type="text"
                              autoFocus
                              value={tempNewPassword}
                              onChange={(e) => setTempNewPassword(e.target.value)}
                              placeholder="Nueva clave"
                              className="bg-slate-900 border border-amber-400 rounded px-1.5 py-0.5 text-[10px] font-mono text-white w-24"
                            />
                            <button
                              onClick={() => handleUpdatePassword(leader.id)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white px-1.5 py-0.5 rounded text-[10px] font-bold"
                            >
                              Guardar
                            </button>
                            <button
                              onClick={() => setEditingPasswordUserId(null)}
                              className="bg-slate-700 text-slate-300 px-1 py-0.5 rounded text-[10px]"
                            >
                              ✕
                            </button>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 ml-1">
                            <span className="font-mono text-slate-300">••••••</span>
                            <button
                              onClick={() => {
                                setEditingPasswordUserId(leader.id);
                                setTempNewPassword(leader.password || 'admin123');
                              }}
                              className="text-amber-400 hover:underline text-[9px] font-semibold"
                            >
                              [Editar]
                            </button>
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. SUBTAB: NUBE CLOUD Y MULTI-DISPOSITIVO */}
      {activeSubTab === 'nube' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white font-serif flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-amber-400" />
                Sincronización en la Nube (Multi-Dispositivo)
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Conecta todas las sucursales para que los dueños vean el Radar en vivo desde cualquier teléfono o PC
              </p>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Conectado</span>
            </span>
          </div>

          <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Database className="w-4 h-4 text-amber-400" />
                <span>Base de Datos Cloud: Supabase / PostgreSQL</span>
              </span>
              <span className="text-[10px] text-amber-400 font-mono">Activo</span>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">URL de la Nube (Supabase URL):</label>
              <input
                type="text"
                value={cloudConfig.supabaseUrl}
                onChange={(e) => setCloudConfig({ ...cloudConfig, supabaseUrl: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Clave de Acceso (Anon Key):</label>
              <input
                type="password"
                value={cloudConfig.supabaseAnonKey}
                onChange={(e) => setCloudConfig({ ...cloudConfig, supabaseAnonKey: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSaveCloudConfig}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 rounded-xl text-xs uppercase"
              >
                Guardar Configuración
              </button>
              <button
                onClick={handleTestCloudSync}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-xs flex items-center gap-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isTestingCloud ? 'animate-spin' : ''}`} />
                <span>{isTestingCloud ? 'Verificando...' : 'Sincronizar Ahora'}</span>
              </button>
            </div>
          </div>

          {/* 1-Click SQL Script Generator */}
          <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-300 text-[11px]">
                Script SQL Automático para Supabase
              </span>
              <button
                onClick={copySupabaseSQL}
                className="text-[10px] bg-slate-800 hover:bg-slate-750 text-amber-400 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1 font-semibold"
              >
                {copiedSql ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSql ? '¡Copiado!' : 'Copiar SQL'}</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              Copia y pega este script en el editor SQL de tu proyecto Supabase para inicializar las tablas de vendedores, contactos, actividades y cortes diarios al instante.
            </p>
          </div>
        </div>
      )}

      {/* 6. SUBTAB: CONFIGURACIÓN MODULAR DE PAQUETES */}
      {activeSubTab === 'configuracion' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-4">
          <div className="border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-serif flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-amber-400" />
              Gestor Modular de Paquetes y Precios
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Cambia nombres, descripciones y precios en vivo. Modifica cuál es el anclaje High-Ticket sin alterar la lógica de negocio.
            </p>
          </div>

          <div className="space-y-3">
            {packages.map(pkg => {
              const isEditing = editingPkgId === pkg.id;

              return (
                <div
                  key={pkg.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    pkg.isAnchor
                      ? 'border-amber-500/50 bg-amber-500/5'
                      : 'border-slate-800 bg-slate-850'
                  }`}
                >
                  {isEditing ? (
                    <div className="space-y-2 text-xs">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Nombre del Paquete</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Subtítulo / Propuesta de Valor</label>
                        <input
                          type="text"
                          value={editSubtitle}
                          onChange={(e) => setEditSubtitle(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Precio al Público ($ MXN)</label>
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(Number(e.target.value))}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={handleSavePackage}
                          className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-1.5 rounded-lg text-xs"
                        >
                          Guardar Cambios
                        </button>
                        <button
                          onClick={() => setEditingPkgId(null)}
                          className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs">{pkg.name}</span>
                            {pkg.isAnchor && (
                              <span className="text-[9px] bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold px-2 py-0.2 rounded-full uppercase">
                                ★ Anclaje High Ticket
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{pkg.subtitle}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-extrabold text-amber-400 font-mono">
                            {formatCurrency(pkg.price)}
                          </span>
                        </div>
                      </div>

                      <ul className="mt-2 text-[10px] text-slate-400 space-y-0.5 list-disc pl-4">
                        {pkg.features.slice(0, 3).map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>

                      <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                        <button
                          onClick={() => handleToggleAnchor(pkg.id)}
                          className={`text-[10px] px-2 py-1 rounded font-medium flex items-center gap-1 ${
                            pkg.isAnchor
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{pkg.isAnchor ? 'Anclaje Activo' : 'Fijar como Anclaje'}</span>
                        </button>

                        <button
                          onClick={() => handleStartEditPackage(pkg)}
                          className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3 text-amber-400" />
                          <span>Editar Precio / Nombre</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Editar Ficha del Prospecto (Admin) */}
      {editingContact && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-5 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-serif">
                  Editar Datos del Prospecto
                </h3>
              </div>
              <button
                onClick={() => setEditingContact(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedContact} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={editContactName}
                  onChange={(e) => setEditContactName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Teléfono Móvil (10 dígitos)</label>
                <input
                  type="tel"
                  value={editContactPhone}
                  onChange={(e) => setEditContactPhone(e.target.value.replace(/[^\d]/g, '').slice(0, 10))}
                  placeholder="4421234567"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Domicilio / Colonia</label>
                <input
                  type="text"
                  value={editContactAddress}
                  onChange={(e) => setEditContactAddress(e.target.value)}
                  placeholder="Calle, número, colonia y referencias"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={editContactEmail}
                  onChange={(e) => setEditContactEmail(e.target.value)}
                  placeholder="cliente@correo.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Notas / Observaciones</label>
                <textarea
                  rows={2}
                  value={editContactNotes}
                  onChange={(e) => setEditContactNotes(e.target.value)}
                  placeholder="Notas sobre interés del cliente, horario preferido, etc."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 shadow-md"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingContact(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Cambiar Mi Contraseña */}
      {isChangeMyPasswordOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-5 w-full max-w-sm shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-serif">
                  Cambiar Mi Contraseña
                </h3>
              </div>
              <button
                onClick={() => setIsChangeMyPasswordOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-[11px] text-slate-300">
              Usuario activo: <strong className="text-white">{currentUser.name}</strong> (@{currentUser.username || currentUser.email.split('@')[0]})
            </p>

            <form onSubmit={handleChangeMyPasswordSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">
                  Nueva Contraseña *
                </label>
                <div className="relative">
                  <input
                    type={showMyPassword ? 'text' : 'password'}
                    required
                    value={myNewPassword}
                    onChange={(e) => {
                      setMyNewPassword(e.target.value);
                      if (changeMyPassError) setChangeMyPassError('');
                    }}
                    placeholder="Mínimo 4 caracteres"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-3 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMyPassword(!showMyPassword)}
                    className="absolute right-2.5 top-2 text-slate-500 hover:text-slate-300"
                  >
                    {showMyPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">
                  Confirmar Nueva Contraseña *
                </label>
                <input
                  type={showMyPassword ? 'text' : 'password'}
                  required
                  value={myConfirmPassword}
                  onChange={(e) => {
                    setMyConfirmPassword(e.target.value);
                    if (changeMyPassError) setChangeMyPassError('');
                  }}
                  placeholder="Repite tu nueva contraseña"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              {changeMyPassError && (
                <div className="text-[11px] text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2 rounded-lg">
                  {changeMyPassError}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 rounded-xl text-xs transition-all shadow-md"
                >
                  Guardar Contraseña
                </button>
                <button
                  type="button"
                  onClick={() => setIsChangeMyPasswordOpen(false)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
