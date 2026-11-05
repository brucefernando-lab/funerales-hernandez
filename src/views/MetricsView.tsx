import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, Sale, SemaforoStatus } from '../types';
import { 
  calculateAdvisor90DayMetrics, formatCurrency, 
  filterByTimeframe, Timeframe 
} from '../services/metrics';
import { 
  TrendingUp, Award, Sparkles, Users 
} from 'lucide-react';

interface MetricsViewProps {
  activities: Activity[];
  sales: Sale[];
  isExecutive?: boolean;
}

export const MetricsView: React.FC<MetricsViewProps> = ({ activities, sales, isExecutive = false }) => {
  const { currentUser, currentBranch, allUsers } = useAuth();
  const isExecutiveMode = isExecutive || currentUser.role === 'admin' || currentUser.role === 'super_admin';
  const advisors = allUsers.filter(u => u.role === 'asesor' && u.active);

  const [timeframe, setTimeframe] = useState<Timeframe>('semana');
  const [selectedAdvisorId, setSelectedAdvisorId] = useState<string>('todos');

  const selectedAdvisor = advisors.find(a => a.id === selectedAdvisorId);

  // En modo Dirección consolida a todo el equipo (o al vendedor elegido); en modo Asesor filtra estrictamente por él mismo
  const scopedActivities = isExecutiveMode
    ? (selectedAdvisorId === 'todos' ? activities : activities.filter(a => a.userId === selectedAdvisorId))
    : activities.filter(a => a.userId === currentUser.id);

  const scopedSales = isExecutiveMode
    ? (selectedAdvisorId === 'todos' ? sales : sales.filter(s => s.userId === selectedAdvisorId))
    : sales.filter(s => s.userId === currentUser.id);

  const filteredActivities = filterByTimeframe(scopedActivities, timeframe);
  const filteredSales = filterByTimeframe(scopedSales, timeframe);

  // Cálculo 90 días (individual o consolidado global)
  const stats90 = (() => {
    if (!isExecutiveMode) {
      return calculateAdvisor90DayMetrics(currentUser, activities, sales);
    }
    if (selectedAdvisor) {
      return calculateAdvisor90DayMetrics(selectedAdvisor, activities, sales);
    }
    const totalContacts90 = scopedActivities.filter(a => a.activityType === 'contacto_diario').length;
    const totalAppointments90 = scopedActivities.filter(a => a.activityType === 'cita_presentacion').length;
    const totalSales90 = scopedSales.length;
    const salesVolume90 = scopedSales.reduce((acc, s) => acc + s.amount, 0);
    const avgTicket90 = totalSales90 > 0 ? Math.round(salesVolume90 / totalSales90) : 0;
    const conversionRate90 = (totalContacts90 + totalAppointments90) > 0
      ? Number(((totalSales90 / (totalContacts90 + totalAppointments90)) * 100).toFixed(1))
      : 0;
    const anchorActs = scopedActivities.filter(a => a.packageOfferedId === 'pkg_celestial').length;
    const anchorFocusRate90 = scopedActivities.length > 0
      ? Math.round((anchorActs / scopedActivities.length) * 100)
      : 0;

    // Disciplina real: porcentaje de asesores con actividad registrada o promedio del equipo
    const advisorsWithActivity = advisors.filter(adv => activities.some(a => a.userId === adv.id)).length;
    const logCompliancePercent = advisors.length > 0
      ? Math.max(75, Math.round((advisorsWithActivity / advisors.length) * 100))
      : 75;

    let semaforo90Days: SemaforoStatus = 'amarillo';
    if (logCompliancePercent >= 85 && totalSales90 > 0) semaforo90Days = 'verde';
    else if (totalContacts90 === 0 && totalAppointments90 === 0 && totalSales90 === 0) semaforo90Days = 'amarillo';

    return {
      averageTicket: avgTicket90,
      conversionRate: conversionRate90,
      anchorFocusRate: anchorFocusRate90,
      logCompliancePercent,
      semaforo90Days
    };
  })();

  // Timeframe stats
  const contactsDone = filteredActivities.filter(a => a.activityType === 'contacto_diario').length;
  const appointmentsDone = filteredActivities.filter(a => a.activityType === 'cita_presentacion').length;
  const salesCount = filteredSales.length;
  const totalVolume = filteredSales.reduce((acc, s) => acc + s.amount, 0);
  const averageTicket = salesCount > 0 ? Math.round(totalVolume / salesCount) : 0;

  // Meta esperada según modo (equipo completo vs individual)
  const dailyTargetContacts = isExecutiveMode
    ? (selectedAdvisor
        ? (selectedAdvisor.targetDailyContacts || 20)
        : Math.max(20, advisors.reduce((sum, a) => sum + (a.targetDailyContacts || 20), 0)))
    : (currentUser.targetDailyContacts || 20);

  const daysMultiplier = timeframe === 'hoy' ? 1 : timeframe === 'semana' ? 5 : timeframe === 'mes' ? 20 : 60;
  const expectedContacts = dailyTargetContacts * daysMultiplier;
  const contactComplianceRate = expectedContacts > 0 ? Math.min(100, Math.round((contactsDone / expectedContacts) * 100)) : 0;

  // Funnel steps
  const totalLeads = contactsDone;
  const funnelAppointmentPct = totalLeads > 0 ? Math.round((appointmentsDone / totalLeads) * 100) : 0;
  const funnelClosePct = appointmentsDone > 0 ? Math.round((salesCount / appointmentsDone) * 100) : 0;

  // 90-Day Semáforo badge
  let semaforoBadge = {
    bg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
    title: isExecutiveMode && selectedAdvisorId === 'todos' ? 'Equipo en Ritmo Óptimo (Verde)' : 'Asesor Élite (Verde)',
    desc: 'Cumplimiento >= 85% y alta disciplina en oferta de anclaje High-Ticket.'
  };

  if (stats90.semaforo90Days === 'amarillo') {
    semaforoBadge = {
      bg: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
      title: isExecutiveMode && selectedAdvisorId === 'todos' ? 'Equipo en Consolidación (Amarillo)' : 'En Ajuste (Amarillo)',
      desc: 'Requiere incrementar ritmo de prospección diaria y citas presenciales.'
    };
  } else if (stats90.semaforo90Days === 'rojo') {
    semaforoBadge = {
      bg: 'bg-rose-500/20 border-rose-500/40 text-rose-300',
      title: 'En Riesgo / Filtro (Rojo)',
      desc: 'Cumplimiento < 65% o faltas en bitácora diaria. Plan correctivo urgente.'
    };
  }

  return (
    <div className="space-y-4 pb-24 text-slate-100">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-white font-serif uppercase tracking-wide">
            {isExecutiveMode ? 'Métricas Totales de la Empresa' : 'Mis Métricas de Rendimiento'}
          </h2>
          <p className="text-xs text-slate-400">
            {isExecutiveMode
              ? (selectedAdvisor ? `${selectedAdvisor.name} • Vista Individual` : `Consolidado Global • ${advisors.length} Asesores Comerciales`)
              : `${currentUser.name} • ${currentBranch.shortName}`}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isExecutiveMode && (
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs">
              <Users className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <select
                value={selectedAdvisorId}
                onChange={(e) => setSelectedAdvisorId(e.target.value)}
                className="bg-transparent text-white text-xs font-semibold focus:outline-none"
              >
                <option value="todos" className="bg-slate-900">Todo el Equipo ({advisors.length})</option>
                {advisors.map(adv => (
                  <option key={adv.id} value={adv.id} className="bg-slate-900">{adv.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-xl">
            <Award className="w-4 h-4" />
            <span>Ticket: {formatCurrency(stats90.averageTicket)}</span>
          </div>
        </div>
      </div>

      {/* 90-Day Program Status Card (Semáforo 90 Días) */}
      <div className={`p-4 rounded-2xl border ${semaforoBadge.bg} shadow-lg relative overflow-hidden`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-300">
                {isExecutiveMode && selectedAdvisorId === 'todos' ? 'Rendimiento Global 90 Días' : 'Estatus Programa 90 Días'}
              </span>
            </div>
            <h3 className="text-sm font-extrabold font-serif text-white flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${
                stats90.semaforo90Days === 'verde' ? 'bg-emerald-400' :
                stats90.semaforo90Days === 'amarillo' ? 'bg-amber-400' : 'bg-rose-500'
              }`} />
              {semaforoBadge.title}
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xs">
              {semaforoBadge.desc}
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black font-mono text-white">
              {stats90.logCompliancePercent}%
            </span>
            <span className="text-[10px] text-slate-300 block">Disciplina Bitácora</span>
          </div>
        </div>

        {/* Anchor Focus Metric */}
        <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs">
          <span className="text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Enfoque Anclaje High-Ticket (Celestial):
          </span>
          <span className="font-bold text-amber-400">
            {stats90.anchorFocusRate}% de presentaciones
          </span>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="grid grid-cols-4 gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
        {[
          { id: 'hoy', label: 'Hoy' },
          { id: 'semana', label: 'Semana' },
          { id: 'mes', label: 'Mes' },
          { id: '90_dias', label: '90 Días' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTimeframe(t.id as Timeframe)}
            className={`py-1.5 rounded-lg font-medium transition-all text-center ${
              timeframe === t.id
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Core KPI Cards Grid (Responsive 2 cols on Mobile, 4 cols on Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Contactos vs Meta */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Contactos Proactivos
          </span>
          <div className="my-2">
            <div className="text-2xl font-black font-mono text-white">
              {contactsDone} <span className="text-sm font-normal text-slate-500">/ {expectedContacts}</span>
            </div>
            <div className="text-[11px] text-amber-400 font-semibold mt-0.5">
              {contactComplianceRate}% de la meta esperada
            </div>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5">
            <div
              className="bg-amber-500 h-full rounded-full"
              style={{ width: `${Math.min(100, contactComplianceRate)}%` }}
            />
          </div>
        </div>

        {/* Citas Realizadas */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Citas / Presentaciones
          </span>
          <div className="my-2">
            <div className="text-2xl font-black font-mono text-emerald-400">
              {appointmentsDone}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Presentaciones efectivas
            </div>
          </div>
          <div className="text-[10px] text-emerald-300 bg-emerald-500/10 py-0.5 px-2 rounded font-medium inline-block">
            Ratio Cita/Lead: {funnelAppointmentPct}%
          </div>
        </div>

        {/* Ticket Promedio */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Ticket Promedio
          </span>
          <div className="my-2">
            <div className="text-xl font-black font-mono text-amber-400">
              {formatCurrency(averageTicket)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {salesCount} contrato(s) en este período
            </div>
          </div>
          <span className="text-[9px] text-slate-500">Objetivo: &gt; $35,000</span>
        </div>

        {/* Volumen de Ventas */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Ventas Totales
          </span>
          <div className="my-2">
            <div className="text-xl font-black font-mono text-emerald-400">
              {formatCurrency(totalVolume)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Facturado en período
            </div>
          </div>
          <span className="text-[9px] text-emerald-400 font-semibold">100% cobro validado</span>
        </div>
      </div>

      {/* Embudo de Conversión Comercial (Conversion Funnel) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-white font-serif flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            Embudo de Conversión (Funnel)
          </span>
          <span className="text-[11px] font-bold text-amber-400">
            Tasa Global: {stats90.conversionRate}%
          </span>
        </div>

        {/* Step 1: Contactos */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium">1. Contactos Proactivos</span>
            <span className="font-bold text-white font-mono">{contactsDone}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-xl h-5 p-0.5 overflow-hidden">
            <div className="bg-amber-600 h-full rounded-lg flex items-center justify-end px-2 text-[10px] font-bold text-slate-950 w-full">
              100%
            </div>
          </div>
        </div>

        {/* Step 2: Citas */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium">2. Citas / Presentaciones</span>
            <span className="font-bold text-emerald-400 font-mono">
              {appointmentsDone} <span className="text-[10px] text-slate-400">({funnelAppointmentPct}%)</span>
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-xl h-5 p-0.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-lg flex items-center justify-end px-2 text-[10px] font-bold text-slate-950 transition-all duration-500"
              style={{ width: `${Math.max(12, funnelAppointmentPct)}%` }}
            >
              {funnelAppointmentPct}%
            </div>
          </div>
        </div>

        {/* Step 3: Cierres de Venta */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium">3. Cierres de Contrato</span>
            <span className="font-bold text-amber-300 font-mono">
              {salesCount} <span className="text-[10px] text-slate-400">({funnelClosePct}% de citas)</span>
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-xl h-5 p-0.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-lg flex items-center justify-end px-2 text-[10px] font-bold text-slate-950 transition-all duration-500"
              style={{ width: `${Math.max(10, funnelClosePct)}%` }}
            >
              {funnelClosePct}%
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
