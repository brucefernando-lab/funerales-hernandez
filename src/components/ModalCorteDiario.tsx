import React, { useState } from 'react';
import { 
  X, CheckCircle2, AlertTriangle, ShieldCheck, 
  Calendar, Clock, DollarSign, Award, Send 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DailyMetrics, DailyReport } from '../types';
import { formatCurrency } from '../services/metrics';
import { storage, getTodayDateString } from '../services/storage';
import confetti from 'canvas-confetti';

interface ModalCorteDiarioProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: DailyMetrics;
  onSuccess: (report: DailyReport) => void;
}

export const ModalCorteDiario: React.FC<ModalCorteDiarioProps> = ({
  isOpen,
  onClose,
  metrics,
  onSuccess
}) => {
  const { currentUser, currentBranch } = useAuth();
  const [dailyNotes, setDailyNotes] = useState('');
  const [signature, setSignature] = useState(currentUser.name);

  if (!isOpen) return null;

  const todayStr = getTodayDateString();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const report: DailyReport = {
      id: `rpt_${currentUser.id}_${todayStr}`,
      userId: currentUser.id,
      userName: currentUser.name,
      branch: currentBranch.id,
      date: todayStr,
      submittedAt: new Date().toISOString(),
      contactsCount: metrics.contactsCompleted,
      contactsTarget: metrics.contactsTarget,
      appointmentsCount: metrics.appointmentsCompleted,
      appointmentsTarget: metrics.appointmentsTarget,
      salesVolume: metrics.salesVolume,
      salesCount: metrics.salesCount,
      referralsCount: 0,
      semaforo: metrics.semaforo,
      overallScore: metrics.overallScore,
      dailyNotes: dailyNotes.trim(),
      signature: `${signature.trim()} • Verificado Plataforma`
    };

    storage.saveDailyReport(report);

    if (metrics.semaforo === 'verde') {
      confetti({ particleCount: 80, spread: 60 });
    }

    onSuccess(report);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-slate-900 border border-amber-500/40 rounded-2xl p-5 shadow-2xl text-slate-100 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-serif">
                Corte Diario de Jornada
              </h2>
              <p className="text-[10px] text-amber-400 font-medium">Registro Oficial en Plataforma (8:00 PM)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Advisor Details */}
        <div className="bg-slate-850 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <div className="font-bold text-white">{currentUser.name}</div>
            <div className="text-[10px] text-slate-400">{currentBranch.shortName}</div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">{todayStr}</span>
            <span className="text-[10px] text-amber-400 font-mono font-bold">Corte de Jornada</span>
          </div>
        </div>

        {/* Live Metrics Summary */}
        <div className="grid grid-cols-2 gap-2 text-center text-xs">
          <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700">
            <span className="text-[10px] text-slate-400 block">Contactos Diarios</span>
            <span className="text-sm font-extrabold text-white font-mono">
              {metrics.contactsCompleted} <span className="text-xs text-slate-500">/ {metrics.contactsTarget}</span>
            </span>
            <span className="text-[9px] text-amber-400 block mt-0.5">
              {metrics.contactsProgressPercent}% de meta
            </span>
          </div>

          <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700">
            <span className="text-[10px] text-slate-400 block">Citas Realizadas</span>
            <span className="text-sm font-extrabold text-emerald-400 font-mono">
              {metrics.appointmentsCompleted} <span className="text-xs text-slate-500">/ {metrics.appointmentsTarget}</span>
            </span>
            <span className="text-[9px] text-emerald-300 block mt-0.5">
              {metrics.appointmentsProgressPercent}% de meta
            </span>
          </div>

          <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700">
            <span className="text-[10px] text-slate-400 block">Ventas Hoy</span>
            <span className="text-sm font-extrabold text-amber-400 font-mono">
              {formatCurrency(metrics.salesVolume)}
            </span>
            <span className="text-[9px] text-slate-400 block mt-0.5">
              {metrics.salesCount} contrato(s)
            </span>
          </div>

          <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700">
            <span className="text-[10px] text-slate-400 block">Semáforo del Día</span>
            <span className={`text-xs font-extrabold uppercase px-2 py-0.5 rounded-full inline-block mt-0.5 ${
              metrics.semaforo === 'verde' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
              metrics.semaforo === 'amarillo' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
              'bg-rose-500/20 text-rose-300 border border-rose-500/40'
            }`}>
              {metrics.semaforo} ({metrics.overallScore}%)
            </span>
          </div>
        </div>

        {/* Reflection Notes */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="text-[10px] text-slate-300 block mb-1">
              Comentarios del Asesor / Logro o Reto del Día:
            </label>
            <textarea
              rows={2}
              value={dailyNotes}
              onChange={(e) => setDailyNotes(e.target.value)}
              placeholder="Ej. Cumplí meta de llamadas por la mañana. 2 clientes interesados en cremación con Paquete Celestial..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-300 block mb-1">
              Firma Digital de Entrega:
            </label>
            <input
              type="text"
              required
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-serif"
            />
          </div>

          <div className="pt-1">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-slate-950 font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 text-xs font-serif uppercase tracking-wider"
            >
              <Send className="w-4 h-4" />
              <span>Registrar Corte en Plataforma</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
