import React, { useState } from 'react';
import { 
  Phone, Sparkles, TrendingUp, DollarSign, Plus, 
  Clock, AlertTriangle, ShieldCheck, ChevronRight, CheckCircle2, ClipboardCheck,
  Calculator, ArrowUpRight, Award, Flame
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
  onNavigateToCotizador?: () => void;
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
  onNavigateToCotizador,
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
    <div className="space-y-5 pb-24 md:pb-12 text-slate-100">
      
      {/* 90-Day Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-2xl border border-slate-800 p-4 md:p-5 shadow-lg relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                Programa de Acompañamiento 90 Días
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">Oficina Comercial</span>
            </div>
            <h2 className="text-lg md:text-xl font-bold text-white font-serif mt-1">
              ¡Buen día, {currentUser.name}!
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Meta activa: 20 contactos proactivos y 3 citas diarias con anclaje de alto valor.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="text-xs font-mono font-bold text-amber-300 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Día Activo</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Responsive 1 col on Mobile, 12 cols on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN (7 cols on Desktop): KPIs, Semáforo, Financials, Corte */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Semáforo del Día Banner */}
          <div className={`p-4 rounded-2xl border ${semaforoConfig.glow} bg-slate-900/95 shadow-lg flex items-center justify-between gap-3`}>
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className={`w-4 h-4 rounded-full block ${semaforoConfig.dot}`} />
                <span className={`w-4 h-4 rounded-full block ${semaforoConfig.dot} absolute inset-0 animate-ping opacity-40`} />
              </div>
              <div>
                <div className="text-xs md:text-sm font-bold text-white tracking-wide">
                  {semaforoConfig.title}
                </div>
                <div className="text-[11px] md:text-xs text-slate-400 mt-0.5">
                  {semaforoConfig.description}
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-lg md:text-xl font-extrabold text-white">
                {metrics.overallScore}%
              </span>
              <span className="text-[10px] text-slate-400 block font-medium">Efectividad</span>
            </div>
          </div>

          {/* Main KPI Counters Grid (X/20 and X/3) */}
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {/* Contactos Proactivos Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  Meta: 20
                </span>
              </div>

              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl md:text-3xl font-black text-white font-mono">
                    {metrics.contactsCompleted}
                  </span>
                  <span className="text-sm font-semibold text-slate-400">
                    / {metrics.contactsTarget}
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-300 block mt-0.5">
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
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Meta: 3
                </span>
              </div>

              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl md:text-3xl font-black text-white font-mono">
                    {metrics.appointmentsCompleted}
                  </span>
                  <span className="text-sm font-semibold text-slate-400">
                    / {metrics.appointmentsTarget}
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-300 block mt-0.5">
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
          <div className="bg-gradient-to-br from-slate-900 to-slate-850 border border-slate-800 rounded-2xl p-4 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" />
                Ventas y Ticket Hoy
              </span>
              <span className="text-[10px] text-slate-400">
                {metrics.salesCount} contrato(s) cerrado(s)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-slate-850/80 p-3 rounded-xl border border-slate-750">
                <span className="text-[10px] text-slate-400 block uppercase font-medium">Volumen Facturado Hoy</span>
                <span className="text-base md:text-lg font-extrabold text-emerald-400 font-mono mt-0.5 block">
                  {formatCurrency(metrics.salesVolume)}
                </span>
              </div>
              <div className="bg-slate-850/80 p-3 rounded-xl border border-slate-750">
                <span className="text-[10px] text-slate-400 block uppercase font-medium">Ticket Promedio Hoy</span>
                <span className="text-base md:text-lg font-extrabold text-amber-400 font-mono mt-0.5 block">
                  {formatCurrency(metrics.averageTicket)}
                </span>
              </div>
            </div>
          </div>

          {/* CORTE DIARIO DE JORNADA EN PLATAFORMA (8:00 PM) */}
          <div className="p-4 rounded-2xl border bg-slate-900 border-amber-500/40 shadow-lg">
            {existingReport ? (
              <div className="flex items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-white block text-sm">Corte Diario Registrado en Plataforma</span>
                    <span className="text-[11px] text-slate-400">
                      Entregado a las {new Date(existingReport.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Score: {existingReport.overallScore}%
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsCorteModalOpen(true)}
                  className="text-xs bg-slate-800 text-amber-300 px-3 py-1.5 rounded-xl border border-slate-700 hover:bg-slate-750 font-medium shrink-0"
                >
                  Actualizar
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/40">
                    <ClipboardCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-white text-sm block">Cierre de Jornada (8:00 PM)</span>
                    <span className="text-xs text-slate-400">
                      Firma y asienta tu corte diario oficial directamente en la plataforma.
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsCorteModalOpen(true)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shrink-0 shadow-md transition-all active:scale-95"
                >
                  Entregar Corte
                </button>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN (5 cols on Desktop): Cotizador Access, Quick Action, Agenda, Bitácora */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Cotizador & Simulador Banner CTA */}
          {onNavigateToCotizador && (
            <div 
              onClick={onNavigateToCotizador}
              className="bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-transparent border border-amber-500/40 rounded-2xl p-4 shadow-lg cursor-pointer hover:border-amber-400 transition-all group relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md group-hover:scale-105 transition-transform">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 block">
                      Listas Noviembre 2026
                    </span>
                    <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                      Cotizador y Simulador de Pagos
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Muestra tarifas en vivo: Semanal, Quincenal y Contado.
                    </p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center shrink-0 border border-slate-700 group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          )}

          {/* Prominent CTA Button (<20s Speed Entry) */}
          <div>
            <button
              onClick={onOpenQuickCapture}
              className="w-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black py-3 px-4 rounded-2xl shadow-xl shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 font-serif uppercase tracking-wider text-xs md:text-sm border border-amber-400/40"
            >
              <div className="w-5 h-5 rounded-full bg-slate-950 text-amber-400 flex items-center justify-center">
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>+ Registrar Actividad (&lt;20 seg)</span>
            </button>
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
                  <span>{overdueTasks.length} pendiente(s) rezagados</span>
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
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center text-xs text-slate-400">
                <p>No tienes citas ni llamadas pendientes para hoy.</p>
                <p className="text-[11px] text-amber-400 mt-1">
                  ¡Aprovecha para realizar llamadas proactivas hacia la meta de 20!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {todayTasks.slice(0, 3).map((task) => (
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
            <div className="space-y-2 pt-1">
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

        </div>

      </div>

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
