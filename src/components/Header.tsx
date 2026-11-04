import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BranchId } from '../types';
import { Building2, ChevronDown, UserCircle2, ShieldCheck, Crown, Check, LogOut, Lock } from 'lucide-react';
import { OwnerPinModal } from './OwnerPinModal';

interface HeaderProps {
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const { currentUser, branches, currentBranch, setCurrentBranchId, allUsers, switchDemoUser } = useAuth();
  const [showBranchMenu, setShowBranchMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  const isOwner = currentUser.role === 'super_admin';
  const isAdmin = currentUser.role === 'admin' || isOwner;

  const handleSelectUser = (userId: string) => {
    const targetUser = allUsers.find(u => u.id === userId);
    if (!targetUser) return;

    // If target is Owner / Super Admin or Admin, require Master PIN for security
    if (targetUser.role === 'super_admin' || targetUser.role === 'admin') {
      setPendingUserId(userId);
      setIsPinModalOpen(true);
      setShowUserMenu(false);
    } else {
      switchDemoUser(userId);
      setShowUserMenu(false);
    }
  };

  const handlePinSuccess = () => {
    if (pendingUserId) {
      switchDemoUser(pendingUserId);
      setPendingUserId(null);
    } else {
      // Find owner
      const owner = allUsers.find(u => u.role === 'super_admin');
      if (owner) switchDemoUser(owner.id);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white px-3.5 py-2 shadow-md">
        <div className="max-w-md mx-auto flex items-center justify-between">
          
          {/* Official Oval Logo Image */}
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Funerales Hernández"
              className="h-9 w-auto max-w-[130px] object-contain drop-shadow"
            />
          </div>

          {/* Branch & User Selectors */}
          <div className="flex items-center gap-2">
            
            {/* Branch Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowBranchMenu(!showBranchMenu);
                  setShowUserMenu(false);
                }}
                className="flex items-center gap-1 text-xs bg-slate-800/90 hover:bg-slate-700/80 border border-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg transition-colors font-medium"
                title="Sucursal actual"
              >
                <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="max-w-[75px] truncate">{currentBranch.shortName}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showBranchMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 text-xs animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-amber-400 border-b border-slate-800">
                    Sucursales (3 Operativas)
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

            {/* Profile Menu with PIN Protection */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowBranchMenu(false);
                }}
                className="flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-700/80 border border-slate-700 px-2 py-1.5 rounded-lg transition-colors"
                title="Perfil y seguridad"
              >
                {isOwner ? (
                  <Crown className="w-4 h-4 text-amber-400" />
                ) : isAdmin ? (
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                ) : (
                  <UserCircle2 className="w-4 h-4 text-sky-400" />
                )}
                <span className="text-xs font-semibold text-slate-200 hidden sm:inline">
                  {currentUser.name.split(' ')[0]}
                </span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                  isOwner ? 'bg-amber-500 text-slate-950' :
                  isAdmin ? 'bg-amber-500/20 text-amber-300' : 
                  'bg-sky-500/20 text-sky-300'
                }`}>
                  {isOwner ? 'Dueño' : isAdmin ? 'Dir' : 'Vts'}
                </span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 text-xs animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <div className="font-bold text-white text-xs">{currentUser.name}</div>
                    <div className="text-[10px] text-slate-400">
                      {isOwner ? '👑 Propietario / Super Admin' : isAdmin ? 'Dirección General' : `Asesor • ${currentBranch.shortName}`}
                    </div>
                  </div>

                  {/* Switch to Owner Button (Protected by PIN) */}
                  {!isOwner && (
                    <div className="p-2 border-b border-slate-800">
                      <button
                        onClick={() => {
                          setPendingUserId(null);
                          setIsPinModalOpen(true);
                          setShowUserMenu(false);
                        }}
                        className="w-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 p-2 rounded-lg flex items-center justify-between text-xs font-semibold"
                      >
                        <span className="flex items-center gap-1.5">
                          <Crown className="w-3.5 h-3.5 text-amber-400" />
                          Acceso Dueños (Requiere PIN)
                        </span>
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                      </button>
                    </div>
                  )}

                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Cambiar Cuenta (Requiere Clave para Dueños)
                  </div>

                  {allUsers.map((u) => {
                    const isSelected = currentUser.id === u.id;
                    const branchInfo = branches.find(b => b.id === u.branch);
                    const isUO = u.role === 'super_admin';

                    return (
                      <button
                        key={u.id}
                        onClick={() => handleSelectUser(u.id)}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800 transition-colors ${
                          isSelected ? 'bg-amber-500/10 text-amber-400 font-semibold' : 'text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border ${
                            isUO ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}>
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-xs font-medium text-white flex items-center gap-1">
                              <span>{u.name}</span>
                              {isUO && <Lock className="w-3 h-3 text-amber-400" />}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {isUO ? 'Dueño (PIN 7788)' : u.role === 'admin' ? 'Dirección (PIN 7788)' : `Asesor • ${branchInfo?.shortName || ''}`}
                            </div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                      </button>
                    );
                  })}

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

      {/* Security PIN Modal */}
      <OwnerPinModal
        isOpen={isPinModalOpen}
        onClose={() => {
          setIsPinModalOpen(false);
          setPendingUserId(null);
        }}
        onSuccess={handlePinSuccess}
        masterPin="7788"
      />
    </>
  );
};
