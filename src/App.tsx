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
import { LoginView } from './views/LoginView';
import { ModalQuickCapture, InitialPackageData } from './components/ModalQuickCapture';
import { ToastContainer, ToastMessage } from './components/Toast';
import { storage, getTodayDateString } from './services/storage';
import { TaskPending, Activity, Sale, Contact } from './types';

export const App: React.FC = () => {
  const { currentUser } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(true);
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

  // When switching to an admin or super_admin user, if on advisor-only tab, keep it smooth
  useEffect(() => {
    const isLeadership = currentUser.role === 'admin' || currentUser.role === 'super_admin';
    if (isLeadership && activeTab === 'contactos') {
      setActiveTab('admin');
    }
  }, [currentUser]);

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

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const todayStr = getTodayDateString();
  const pendingCount = tasks.filter(t => t.userId === currentUser.id && !t.isCompleted && t.dueDate <= todayStr).length;

  if (!isLoggedIn) {
    return <LoginView onSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans selection:bg-amber-600 selection:text-white">
      {/* Toast notifications container */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Top Header (Includes responsive desktop navigation) */}
      <Header 
        onLogout={handleLogout}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenQuickCapture={() => handleOpenQuickCapture()}
        pendingTasksCount={pendingCount}
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

        {activeTab === 'admin' && (
          <AdminView
            activities={activities}
            sales={sales}
            onRefreshData={loadData}
            onShowToast={(msg) => showToast('Sistema Actualizado', msg, 'success')}
          />
        )}
      </main>

      {/* Ergonomic Bottom Navigation Bar (Mobile only, hidden on Desktop) */}
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
