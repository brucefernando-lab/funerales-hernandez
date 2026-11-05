import React from 'react';
import { Calendar, Calculator, CheckSquare, Plus, BarChart3, ShieldCheck, Crown, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type NavTab = 'hoy' | 'cotizador' | 'pendientes' | 'metricas' | 'contactos' | 'admin';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenQuickCapture: () => void;
  pendingTasksCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenQuickCapture,
  pendingTasksCount
}) => {
  const { currentUser } = useAuth();
  const isSuperAdmin = currentUser.role === 'super_admin';
  const isAdmin = currentUser.role === 'admin' || isSuperAdmin;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 pb-safe">
      <div className="max-w-md mx-auto px-1 py-1 flex items-center justify-around relative">
        {/* Tab Hoy */}
        <button
          onClick={() => onTabChange('hoy')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all duration-200 ${
            activeTab === 'hoy'
              ? 'text-amber-400 scale-105 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Hoy</span>
          {activeTab === 'hoy' && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5" />
          )}
        </button>

        {/* Tab Cotizador (Simulador) */}
        <button
          onClick={() => onTabChange('cotizador')}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all duration-200 ${
            activeTab === 'cotizador'
              ? 'text-amber-400 scale-105 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calculator className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Cotizador</span>
          {activeTab === 'cotizador' && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5" />
          )}
        </button>

        {/* Floating Quick Action CTA (+) */}
        <div className="relative -top-4">
          <button
            onClick={onOpenQuickCapture}
            className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 text-slate-950 shadow-lg shadow-amber-500/30 flex items-center justify-center active:scale-95 transition-transform border-4 border-slate-900 focus:outline-none group"
            title="Registrar Actividad (<20 seg)"
          >
            <Plus className="w-6 h-6 stroke-[3] group-hover:rotate-90 transition-transform duration-200" />
          </button>
          <span className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-amber-400 uppercase tracking-tighter whitespace-nowrap">
            Captura
          </span>
        </div>

        {/* Tab Pendientes */}
        <button
          onClick={() => onTabChange('pendientes')}
          className={`relative flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all duration-200 ${
            activeTab === 'pendientes'
              ? 'text-amber-400 scale-105 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <CheckSquare className="w-5 h-5 mb-0.5" />
            {pendingTasksCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-slate-900">
                {pendingTasksCount > 9 ? '9+' : pendingTasksCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Pendientes</span>
          {activeTab === 'pendientes' && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5" />
          )}
        </button>

        {/* Tab Cartera / Métricas / Dueños */}
        {isAdmin ? (
          <button
            onClick={() => onTabChange('admin')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all duration-200 ${
              activeTab === 'admin'
                ? 'text-amber-400 scale-105 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isSuperAdmin ? (
              <Crown className="w-5 h-5 mb-0.5 text-amber-400" />
            ) : (
              <ShieldCheck className="w-5 h-5 mb-0.5" />
            )}
            <span className="text-[10px] tracking-tight">
              {isSuperAdmin ? 'Dueños' : 'Dirección'}
            </span>
            {activeTab === 'admin' && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5" />
            )}
          </button>
        ) : (
          <button
            onClick={() => onTabChange('metricas')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all duration-200 ${
              activeTab === 'metricas'
                ? 'text-amber-400 scale-105 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Métricas</span>
            {activeTab === 'metricas' && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5" />
            )}
          </button>
        )}
      </div>
    </nav>
  );
};
