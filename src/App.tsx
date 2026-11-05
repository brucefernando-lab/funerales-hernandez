import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { TodayView } from './views/TodayView';
import { CotizadorView } from './views/CotizadorView';
import { TasksView } from './views/TasksView';
import { MetricsView } from './views/MetricsView';
import { ContactsView } from './views/ContactsView';
import { AdminView } from './views/AdminView';
import { AdvisorLoginView } from './views/AdvisorLoginView';
import { AdminLoginView } from './views/AdminLoginView';
import { ModalQuickCapture, InitialPackageData } from './components/ModalQuickCapture';
import { ToastContainer, ToastMessage } from './components/Toast';
import { storage, getTodayDateString } from './services/storage';
import { TaskPending, Activity, Sale, Contact } from './types';

export const App: React.FC = () => {
  const { currentUser, allUsers, switchDemoUser } = useAuth();
  
  // URL Routing state
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname.toLowerCase());
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('fh_admin_auth') === 'true';
  });

  // Advisor login state strictly based on active sessionStorage
  const [isAdvisorLoggedIn, setIsAdvisorLoggedIn] = useState<boolean>(() => {
    return Boolean(sessionStorage.getItem('fh_advisor_session'));
  });

  const [activeTab, setActiveTab] = useState<NavTab>('hoy');
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [captureInitialContact, setCaptureInitialContact] = useState<{ id?: string; name: string; phone: string } | undefined>(undefined);
  const [captureInitialPackage, setCaptureInitialPackage] = useState<InitialPackageData | undefined>(undefined);

  // Live state from storage
  const [tasks, setTasks] = useState<TaskPending[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path.toLowerCase());
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname.toLowerCase());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const loadData = () => {
    setTasks(storage.getTasks());
    setActivities(storage.getActivities());
    setSales(storage.getSales());
    setContacts(storage.getContacts());
  };

  useEffect(() => {
    storage.initialize();
    loadData();

    const handleStorageChange = () => {
      loadData();
    };

    window.addEventListener('fh_storage_change', handleStorageChange);
    return () => window.removeEventListener('fh_storage_change', handleStorageChange);
  }, []);

  const showToast = (title: string, message?: string, type: 'success' | 'warning' | 'error' | 'info' = 'success') => {
    const newToast: ToastMessage = {
      id: `toast_${Date.now()}_${Math.random()}`,
      title,
      message,
      type
    };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 4500);
  };

  const handleDismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleOpenQuickCapture = (
    contact?: { id?: string; name: string; phone: string },
    pkg?: InitialPackageData
  ) => {
    setCaptureInitialContact(contact);
    setCaptureInitialPackage(pkg);
    setIsQuickCaptureOpen(true);
  };

  const handleCompleteTask = (task: TaskPending) => {
    handleOpenQuickCapture({
      id: task.contactId,
      name: task.contactName,
      phone: task.contactPhone
    });
    storage.completeTask(task.id);
    loadData();
  };

  const handleRescheduleTask = (task: TaskPending, newDate: string, newTime: string) => {
    const updated = {
      ...task,
      dueDate: newDate,
      dueTime: newTime
    };
    storage.saveTask(updated);
    loadData();
    showToast('Pendiente reprogramado', `Nueva fecha: ${newDate} a las ${newTime}`, 'info');
  };

  const handleAdvisorLogout = () => {
    setIsAdvisorLoggedIn(false);
    sessionStorage.removeItem('fh_advisor_session');
    navigateTo('/login');
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('fh_admin_auth');
    // Switch to first advisor for safety
    const firstAdvisor = allUsers.find(u => u.role === 'asesor');
    if (firstAdvisor) switchDemoUser(firstAdvisor.id);
    navigateTo('/admin');
  };

  const todayStr = getTodayDateString();
  const pendingCount = tasks.filter(t => t.userId === currentUser.id && !t.isCompleted && t.dueDate <= todayStr).length;

  // ROUTE 1: /admin (Exclusive URL for Owners & Leadership)
  const isAdminRoute = currentPath.startsWith('/admin');

  if (isAdminRoute) {
    if (!isAdminAuthenticated) {
      return (
        <AdminLoginView
          onSuccess={() => {
            setIsAdminAuthenticated(true);
            sessionStorage.setItem('fh_admin_auth', 'true');
            const owner = allUsers.find(u => u.role === 'super_admin');
            if (owner) switchDemoUser(owner.id);
          }}
          onGoToAdvisorLogin={() => navigateTo('/login')}
        />
      );
    }

    // Authenticated Executive Panel
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col font-sans selection:bg-amber-600 selection:text-white">
        <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
        
        <Header 
          onLogout={handleAdminLogout}
          activeTab={activeTab === 'cotizador' ? 'cotizador' : 'admin'}
          onTabChange={(tab) => setActiveTab(tab)}
          isExecutivePortal={true}
          onGoToAdvisorPortal={() => {
            const firstAdv = allUsers.find(u => u.role === 'asesor');
            if (firstAdv) {
              switchDemoUser(firstAdv.id);
              sessionStorage.setItem('fh_advisor_session', firstAdv.id);
              setIsAdvisorLoggedIn(true);
            }
            navigateTo('/login');
          }}
        />

        <main className="flex-1 max-w-md md:max-w-6xl lg:max-w-7xl w-full mx-auto px-3.5 md:px-6 pt-3.5 md:pt-6 pb-12">
          {activeTab === 'cotizador' ? (
            <CotizadorView />
          ) : (
            <AdminView
              activities={activities}
              sales={sales}
              onRefreshData={loadData}
              onShowToast={(msg) => showToast('Sistema Actualizado', msg, 'success')}
            />
          )}
        </main>
      </div>
    );
  }

  // ROUTE 2: /login (Dedicated URL for Sales Advisors)
  const isLoginRoute = currentPath.startsWith('/login');

  if (isLoginRoute && !isAdvisorLoggedIn) {
    return (
      <AdvisorLoginView
        onSuccess={() => {
          setIsAdvisorLoggedIn(true);
          navigateTo('/');
        }}
      />
    );
  }

  // If on root "/" and not logged in as advisor, show advisor login
  if (!isAdvisorLoggedIn) {
    return (
      <AdvisorLoginView
        onSuccess={() => {
          setIsAdvisorLoggedIn(true);
        }}
      />
    );
  }

  // ROUTE 3: "/" Normal Sales Advisor Workspace (Zero traces of Super Admin)
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans selection:bg-amber-600 selection:text-white">
      {/* Toast notifications container */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Top Header (Clean Advisor Mode: No super admin, no owners tab) */}
      <Header 
        onLogout={handleAdvisorLogout}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenQuickCapture={() => handleOpenQuickCapture()}
        pendingTasksCount={pendingCount}
        isExecutivePortal={false}
      />

      {/* Main View Area: Responsive for Mobile (Phone) & Desktop (Office PC) */}
      <main className="flex-1 max-w-md md:max-w-6xl lg:max-w-7xl w-full mx-auto px-3.5 md:px-6 pt-3.5 md:pt-6">
        {activeTab === 'hoy' && (
          <TodayView
            activities={activities}
            tasks={tasks}
            sales={sales}
            onOpenQuickCapture={() => handleOpenQuickCapture()}
            onCompleteTask={handleCompleteTask}
            onRescheduleTask={handleRescheduleTask}
            onNavigateToTasks={() => setActiveTab('pendientes')}
            onNavigateToCotizador={() => setActiveTab('cotizador')}
            onCorteSubmitted={() => {
              loadData();
              showToast('Corte Diario Asentado', 'Tu reporte de jornada oficial ha quedado registrado en la plataforma.', 'success');
            }}
          />
        )}

        {activeTab === 'cotizador' && (
          <CotizadorView
            onSelectPlanToRegister={(plan, chapelId, term) => {
              const chapelName = chapelId === 'constitucion' 
                ? 'Capillas Constitución' 
                : chapelId === 'dr_mier' 
                ? 'Capillas Dr. Mier' 
                : 'Plan Bienestar';

              handleOpenQuickCapture(
                undefined,
                {
                  id: plan.id,
                  name: `${plan.name} (${chapelName})`,
                  price: term ? term.total : plan.contado,
                  chapelId,
                  termSummary: term 
                    ? `${term.termMonths} Meses • Semanal: $${term.weekly.toLocaleString('es-MX')}` 
                    : 'Pago Único de Contado'
                }
              );
            }}
          />
        )}

        {activeTab === 'pendientes' && (
          <TasksView
            tasks={tasks}
            onCompleteTask={handleCompleteTask}
            onRescheduleTask={handleRescheduleTask}
            onOpenQuickCapture={() => handleOpenQuickCapture()}
          />
        )}

        {activeTab === 'metricas' && (
          <MetricsView
            activities={activities}
            sales={sales}
          />
        )}

        {activeTab === 'contactos' && (
          <ContactsView
            contacts={contacts}
            onOpenQuickCaptureWithContact={(c) => handleOpenQuickCapture(c)}
            onOpenNewCapture={() => handleOpenQuickCapture()}
          />
        )}
      </main>

      {/* Ergonomic Bottom Navigation Bar (Mobile only, strictly advisor options) */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenQuickCapture={() => handleOpenQuickCapture()}
        pendingTasksCount={pendingCount}
      />

      {/* Speed Quick Capture Modal (<20 seconds) */}
      <ModalQuickCapture
        isOpen={isQuickCaptureOpen}
        onClose={() => {
          setIsQuickCaptureOpen(false);
          setCaptureInitialPackage(undefined);
          setCaptureInitialContact(undefined);
        }}
        initialContact={captureInitialContact}
        initialPackage={captureInitialPackage}
        onSuccess={(msg) => {
          loadData();
          showToast('Registro Exitoso', msg, 'success');
        }}
      />
    </div>
  );
};
