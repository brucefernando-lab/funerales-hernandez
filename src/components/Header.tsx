import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BranchId } from '../types';
import { 
  Building2, ChevronDown, UserCircle2, ShieldCheck, Crown, Check, 
  LogOut, Calendar, Calculator, CheckSquare, BarChart3, Users, Plus, ExternalLink 
} from 'lucide-react';
import { NavTab } from './BottomNav';

interface HeaderProps {
  onLogout?: () => void;
  activeTab?: NavTab;
  onTabChange?: (tab: NavTab) => void;
  onOpenQuickCapture?: () => void;
  pendingTasksCount?: number;
  isExecutivePortal?: boolean;
  onGoToAdvisorPortal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onLogout,
  activeTab = 'hoy',
  onTabChange,
  onOpenQuickCapture,
  pendingTasksCount = 0,
  isExecutivePortal = false,
  onGoToAdvisorPortal
}) => {
  const { currentUser, branches, currentBranch, setCurrentBranchId, allUsers, switchDemoUser } = useAuth();
  const [showBranchMenu, setShowBranchMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // If in executive portal, show full users list; otherwise STRICTLY show only advisors
  const visibleUsers = isExecutivePortal 
    ? allUsers 
    : allUsers.filter(u => u.role === 'asesor');

  const handleSelectUser = (userId: string) => {
    switchDemoUser(userId);
    setShowUserMenu(false);
  };

  // Nav items: on advisor portal, NO ADMIN TAB EVER.
  const navItems: { id: NavTab; label: string; icon: any; badge?: number }[] = isExecutivePortal
    ? [
        { id: 'admin' as NavTab, label: 'Panel Dirección', icon: ShieldCheck },
        { id: 'cotizador', label: 'Catálogo de Precios', icon: Calculator },
        { id: 'metricas', label: 'Métricas Globales', icon: BarChart3 }
      ]
    : [
        { id: 'hoy', label: 'Hoy', icon: Calendar },
        { id: 'cotizador', label: 'Cotizador', icon: Calculator },
        { id: 'pendientes', label: 'Pendientes', icon: CheckSquare, badge: pendingTasksCount },
        { id: 'contactos', label: 'Cartera', icon: Users },
        { id: 'metricas', label: 'Métricas', icon: BarChart3 }
      ];

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white px-3.5 md:px-6 py-2.5 shadow-md">
      <div className="max-w-md md:max-w-6xl lg:max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo & Tag */}
        <div className="flex items-center gap-3 shrink-0">
          <img
            src="/logo.png"
            alt="Funerales Hernández"
            className="h-9 md:h-10 w-auto max-w-[135px] object-contain drop-shadow"
          />
          <div className="hidden lg:block border-l border-slate-800 pl-3">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
              {isExecutivePortal ? 'Dirección General' : 'Comercial Integral'}
            </span>
            <span className="text-[11px] text-slate-400">
              {isExecutivePortal ? 'Panel de Control y Supervisión' : 'Oficina de Ventas Multisede'}
            </span>
          </div>
        </div>

        {/* Desktop Navigation Tabs (Visible on screens >= 768px) */}
        {onTabChange && (
          <nav className="hidden md:flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                  {item.badge && item.badge > 0 ? (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold leading-none ${
                      isActive ? 'bg-slate-950 text-white' : 'bg-rose-500 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        )}

        {/* Right side controls */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Executive Portal Switch button (if inside /admin, to return to /login) */}
          {isExecutivePortal && onGoToAdvisorPortal && (
            <button
              onClick={onGoToAdvisorPortal}
              className="hidden sm:flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-750 text-amber-300 border border-amber-500/30 px-2.5 py-1.5 rounded-lg font-medium transition-colors"
              title="Abrir vista de asesor"
            >
              <span>Ver como Asesor</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Desktop Quick Capture Button (Only on advisor portal) */}
          {!isExecutivePortal && onOpenQuickCapture && (
            <button
              onClick={onOpenQuickCapture}
              className="hidden md:flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm transition-transform active:scale-95"
              title="Captura rápida (<20s)"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Captura</span>
            </button>
          )}

          {/* Branch Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setShowBranchMenu(!showBranchMenu);
                setShowUserMenu(false);
              }}
              className="flex items-center gap-1 text-xs bg-slate-800/90 hover:bg-slate-700/80 border border-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg transition-colors font-medium"
              title="Capilla o sede actual"
            >
              <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="max-w-[85px] md:max-w-[130px] truncate">{currentBranch.shortName}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showBranchMenu && (
              <div className="absolute right-0 mt-2 w-64 md:w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 text-xs animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-amber-400 border-b border-slate-800">
                  Capillas y Sedes Operativas
                </div>
                {branches.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setCurrentBranchId(b.id as BranchId);
                      setShowBranchMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800 transition-colors ${
                      currentBranch.id === b.id ? 'text-amber-400 bg-amber-500/10 font-semibold' : 'text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs">{b.name}</div>
                      <div className="text-[10px] text-slate-400">{b.address}</div>
                    </div>
                    {currentBranch.id === b.id && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile Menu (Super admin completely hidden for advisors!) */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowBranchMenu(false);
              }}
              className="flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-700/80 border border-slate-700 px-2.5 py-1.5 rounded-lg transition-colors"
              title="Mi perfil de usuario"
            >
              <UserCircle2 className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-semibold text-slate-200 hidden sm:inline">
                {currentUser?.name ? currentUser.name.split(' ')[0] : 'Usuario'}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-bold uppercase bg-sky-500/20 text-sky-300">
                {isExecutivePortal ? 'Dirección' : 'Asesor'}
              </span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 text-xs animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-2 border-b border-slate-800">
                  <div className="font-bold text-white text-xs">{currentUser?.name || 'Usuario'}</div>
                  <div className="text-[10px] text-slate-400">
                    {isExecutivePortal ? '👑 Dirección General' : `Asesor Comercial Multisede`}
                  </div>
                </div>

                {/* In Executive portal, allow owner to see registered accounts; for normal advisors, ONLY show their profile and logout */}
                {isExecutivePortal ? (
                  <>
                    <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Cuentas Registradas
                    </div>

                    {visibleUsers.map((u) => {
                      const isSelected = currentUser.id === u.id;
                      const branchInfo = branches.find(b => b.id === u.branch);

                      return (
                        <button
                          key={u.id}
                          onClick={() => handleSelectUser(u.id)}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800 transition-colors ${
                            isSelected ? 'bg-amber-500/10 text-amber-400 font-semibold' : 'text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border bg-slate-800 text-slate-300 border-slate-700">
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-xs font-medium text-white">{u.name}</div>
                              <div className="text-[10px] text-slate-400">
                                {u.role === 'super_admin' ? 'Dueño' : `Asesor • ${branchInfo?.shortName || ''}`}
                              </div>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </>
                ) : (
                  <div className="px-3 py-2 text-xs text-slate-400 space-y-1">
                    <div>Usuario: <strong className="text-white font-mono">{currentUser.username || currentUser.email.split('@')[0]}</strong></div>
                    <div>Correo: <span className="text-slate-300">{currentUser.email}</span></div>
                    <div className="text-[10px] text-amber-400">Sesión comercial activa y segura</div>
                  </div>
                )}

                {onLogout && (
                  <div className="p-1 border-t border-slate-800 mt-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
