import React, { useState } from 'react';
import { 
  Phone, Sparkles, TrendingUp, DollarSign, Plus, 
  Clock, AlertTriangle, ShieldCheck, ChevronRight, CheckCircle2, ClipboardCheck 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Activity, TaskPending, Sale, DailyReport } from '../types';
import { calculateDailyMetrics, formatCurrency } from '../services/metrics';
import { TaskCard } from '../components/TaskCard';
import { getTodayDateString, storage } from '../services/storage';
import { ModalCorteDiario } from '../components/ModalCorteDiario';

interface TodayViewProps {
  activities: Activity[];
  tasks: TaskPending[];
  sales: Sale[];
  onOpenQuickCapture: () => void;
  onCompleteTask: (task: TaskPending) => void;
  onRescheduleTask: (task: TaskPending, newDate: string, newTime: string) => void;
  onNavigateToTasks: () => void;
  onCorteSubmitted?: () => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  activities,
  tasks,
  sales,
  onOpenQuickCapture,
  onCompleteTask,
  onRescheduleTask,
  onNavigateToTasks,
  onCorteSubmitted
}) => {
  const { currentUser, currentBranch } = useAuth();
  const [isCorteModalOpen, setIsCorteModalOpen] = useState(false);
  const todayStr = getTodayDateString();

  const targetContacts = currentUser.targetDailyContacts || 20;
  const targetAppointments = currentUser.targetDailyAppointments || 3;

  const metrics = calculateDailyMetrics(
    currentUser.id,
    activities,
    sales,
    targetContacts,
    targetAppointments
  );

  // Check if current user already submitted corte today
  const existingReport = storage.getTodayReportForUser(currentUser.id);

  // Filter tasks for today
  const todayTasks = tasks.filter(t => t.userId === currentUser.id && t.dueDate === todayStr && !t.isCompleted);
  const overdueTasks = tasks.filter(t => t.userId === currentUser.id && t.dueDate < todayStr && !t.isCompleted);

  // Recent activities logged today
  const recentActivities = activities
    .filter(a => a.userId === currentUser.id && a.createdAt.substring(0, 10) === todayStr)
    .slice(0, 4);

  // Semáforo configuration
  let semaforoConfig = {
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    dot: 'bg-emerald-400',
    title: 'Semáforo del Día: VERDE',
    description: 'Progreso excelente (>= 80% de metas). Ritmo Élite en ejecución.',
    glow: 'shadow-emerald-500/10 border-emerald-500/30'
  };

  if (metrics.semaforo === 'amarillo') {
    semaforoConfig = {
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      dot: 'bg-amber-400 animate-pulse',
      title: 'Semáforo del Día: AMARILLO',
      description: 'En progreso (40% - 79%). Acelera el paso para alcanzar tu meta.',
      glow: 'shadow-amber-500/10 border-amber-500/30'
    };
  } else if (metrics.semaforo === 'rojo') {
    semaforoConfig = {
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      dot: 'bg-rose-400 animate-pulse',
      title: 'Semáforo del Día: ROJO',
      description: 'Alerta de disciplina (< 40%). Se requiere registro inmediato de bitácora.',
      glow: 'shadow-rose-500/10 border-rose-500/30'
    };
  }

  return (
    <div className="space-y-4 pb-24 text-slate-100">
      
      {/* 90-Day Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-2xl border border-slate-800 p-3.5 shadow-lg relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase">
              Programa de Acompañamiento 90 Días
            </span>
            <h2 className="text-base font-bold text-white font-serif mt-0.5">
              ¡Buen día, {currentUser.name.split(' ')[0]}!
            </h2>
            <p className="text-xs text-slate-400">
              {currentBranch.shortName} • Elevación de Ticket y Disciplina
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-amber-400 bg-slate-800 border border-slate-700 px-2 py-1 rounded-lg">
              Semana 4
            </span>
          </div>
        </div>
      </div>

      {/* Semáforo del Día Banner */}
      <div className={`p-3.5 rounded-2xl border ${semaforoConfig.glow} bg-slate-900/90 shadow-lg flex items-center justify-between gap-3`}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className={`w-3.5 h-3.5 rounded-full block ${semaforoConfig.dot}`} />
            <span className={`w-3.5 h-3.5 rounded-full block ${semaforoConfig.dot} absolute inset-0 animate-ping opacity-40`} />
          </div>
          <div>
            <div className="text-xs font-bold text-white tracking-wide">
              {semaforoConfig.title}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {semaforoConfig.description}
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-base font-extrabold text-white">
            {metrics.overallScore}%
          </span>
          <span className="text-[10px] text-slate-400 block">Efectividad</span>
        </div>
      </div>

      {/* Main KPI Counters Grid (X/20 and X/3) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Contactos Proactivos Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-md relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Phone className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
              Meta: 20
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-white font-mono">
                {metrics.contactsCompleted}
              </span>
              <span className="text-sm font-semibold text-slate-400">
                / {metrics.contactsTarget}
              </span>
            </div>
            <span className="text-xs font-medium text-slate-300 block mt-0.5">
              Contactos Proactivos
            </span>
          </div>

          <div className="mt-3">
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${metrics.contactsProgressPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
              <span>{metrics.contactsProgressPercent}% cumplido</span>
              <span>Faltan {Math.max(0, metrics.contactsTarget - metrics.contactsCompleted)}</span>
            </div>
          </div>
        </div>

        {/* Citas / Presentaciones Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-md relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
              Meta: 3
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-white font-mono">
                {metrics.appointmentsCompleted}
              </span>
              <span className="text-sm font-semibold text-slate-400">
                / {metrics.appointmentsTarget}
              </span>
            </div>
            <span className="text-xs font-medium text-slate-300 block mt-0.5">
              Citas / Presentación
            </span>
          </div>

          <div className="mt-3">
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${metrics.appointmentsProgressPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
              <span>{metrics.appointmentsProgressPercent}% cumplido</span>
              <span>Faltan {Math.max(0, metrics.appointmentsTarget - metrics.appointmentsCompleted)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* High-Ticket Financial Snapshot */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-850 border border-slate-800 rounded-2xl p-3.5 shadow-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5" />
            Ventas y Ticket Hoy
          </span>
          <span className="text-[10px] text-slate-400">
            {metrics.salesCount} contrato(s) cerrado(s)
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-750">
            <span className="text-[10px] text-slate-400 block">Volumen Facturado Hoy</span>
            <span className="text-sm font-extrabold text-emerald-400 font-mono">
              {formatCurrency(metrics.salesVolume)}
            </span>
          </div>
          <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-750">
            <span className="text-[10px] text-slate-400 block">Ticket Promedio Hoy</span>
            <span className="text-sm font-extrabold text-amber-400 font-mono">
              {formatCurrency(metrics.averageTicket)}
            </span>
          </div>
        </div>
      </div>

      {/* Prominent CTA Button (<20s Speed Entry) */}
      <div>
        <button
          onClick={onOpenQuickCapture}
          className="w-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-slate-950 font-black py-3.5 px-4 rounded-2xl shadow-xl shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 font-serif uppercase tracking-wider text-sm border border-amber-400/40"
        >
          <div className="w-6 h-6 rounded-full bg-slate-950 text-amber-400 flex items-center justify-center">
            <Plus className="w-4 h-4 stroke-[3]" />
          </div>
          <span>+ Registrar Actividad Rápida (&lt;20 seg)</span>
        </button>
      </div>

      {/* CORTE DIARIO DE JORNADA EN PLATAFORMA (8:00 PM) */}
      <div className="p-3.5 rounded-2xl border bg-slate-900 border-amber-500/40 shadow-lg">
        {existingReport ? (
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white block">Corte Diario Registrado en Plataforma</span>
                <span className="text-[10px] text-slate-400">
                  Entregado hoy a las {new Date(existingReport.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Score: {existingReport.overallScore}%
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsCorteModalOpen(true)}
              className="text-[10px] bg-slate-800 text-amber-300 px-2.5 py-1 rounded-lg border border-slate-700 hover:bg-slate-750"
            >
              Actualizar
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/40">
                <ClipboardCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white text-xs block">Cierre de Jornada (8:00 PM)</span>
                <span className="text-[10px] text-slate-400">
                  Firma y asienta tu corte diario oficial en la plataforma.
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsCorteModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs shrink-0 shadow-md transition-all active:scale-95"
            >
              Entregar Corte
            </button>
          </div>
        )}
      </div>

      {/* Agenda de Hoy / Alertas de Pendientes */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Agenda Prioritaria de Hoy
            </h3>
          </div>
          <button
            onClick={onNavigateToTasks}
            className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-0.5"
          >
            <span>Ver todos ({todayTasks.length + overdueTasks.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {overdueTasks.length > 0 && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-rose-300 font-semibold">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Tienes {overdueTasks.length} pendiente(s) rezagados de días anteriores</span>
            </div>
            <button
              onClick={onNavigateToTasks}
              className="text-[10px] bg-rose-500/20 text-rose-200 px-2 py-1 rounded font-bold hover:bg-rose-500/30"
            >
              Atender
            </button>
          </div>
        )}

        {todayTasks.length === 0 && overdueTasks.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center text-xs text-slate-400">
            <p>No tienes citas ni llamadas pendientes para hoy.</p>
            <p className="text-[11px] text-amber-400 mt-1">
              ¡Aprovecha para realizar llamadas proactivas hacia la meta de 20!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayTasks.slice(0, 2).map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={onCompleteTask}
                onReschedule={onRescheduleTask}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bitácora Reciente de Hoy */}
      {recentActivities.length > 0 && (
        <div className="space-y-2 pt-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Últimos Registros del Día
          </span>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-800 overflow-hidden text-xs">
            {recentActivities.map((act) => (
              <div key={act.id} className="p-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">{act.contactName}</div>
                  <div className="text-[10px] text-slate-400">
                    {act.activityType === 'cita_presentacion' ? 'Cita Presencial' : 'Llamada Proactiva'} • {act.packageOfferedName}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    act.result === 'venta_cerrada' ? 'bg-emerald-500/20 text-emerald-300' :
                    act.result === 'cita_agendada' ? 'bg-blue-500/20 text-blue-300' :
                    act.result === 'descartado' ? 'bg-rose-500/20 text-rose-300' :
                    'bg-amber-500/20 text-amber-300'
                  }`}>
                    {act.result.replace('_', ' ')}
                  </span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">
                    {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Corte Diario */}
      <ModalCorteDiario
        isOpen={isCorteModalOpen}
        onClose={() => setIsCorteModalOpen(false)}
        metrics={metrics}
        onSuccess={() => {
          if (onCorteSubmitted) onCorteSubmitted();
        }}
      />

    </div>
  );
};
