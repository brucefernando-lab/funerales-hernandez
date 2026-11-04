import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCircle2, Lock, Mail, ArrowRight, Sparkles, Crown, KeyRound, AlertCircle, Info } from 'lucide-react';

interface LoginViewProps {
  onSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
  const { allUsers, login, switchDemoUser, branches } = useAuth();
  
  // Tab: 'asesores' vs 'duenos'
  const [activePortal, setActivePortal] = useState<'asesores' | 'duenos'>('asesores');

  // Advisor form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [advisorError, setAdvisorError] = useState('');

  // Owner PIN form
  const [ownerPin, setOwnerPin] = useState('');
  const [ownerError, setOwnerError] = useState('');

  const MASTER_PIN = '7788';

  const handleAdvisorLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setAdvisorError('Ingresa tu correo institucional.');
      return;
    }
    const ok = login(email);
    if (ok) {
      setAdvisorError('');
      onSuccess();
    } else {
      setAdvisorError('Correo o asesor no encontrado en el sistema.');
    }
  };

  const handleOwnerPinLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (ownerPin === MASTER_PIN) {
      const owner = allUsers.find(u => u.role === 'super_admin');
      if (owner) {
        switchDemoUser(owner.id);
        setOwnerError('');
        onSuccess();
      }
    } else {
      setOwnerError('PIN Maestro incorrecto. Acceso denegado a propietarios.');
    }
  };

  const handleQuickAdvisor = (userId: string) => {
    switchDemoUser(userId);
    onSuccess();
  };

  const advisors = allUsers.filter(u => u.role === 'asesor');

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-8 text-slate-100">
      <div className="w-full max-w-sm space-y-5">
        
        {/* Official Logo Banner */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <img
              src="/logo.png"
              alt="Funerales Hernández"
              className="h-20 w-auto object-contain drop-shadow-xl"
            />
          </div>
          <p className="text-xs text-amber-400 font-semibold flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Programa Comercial de 90 Días</span>
          </p>
          <p className="text-[11px] text-slate-400">
            Disciplina Operativa • Elevación del Ticket • Supervisión 3 Sucursales
          </p>
        </div>

        {/* Portal Switch Tabs: Asesores vs Dueños */}
        <div className="grid grid-cols-2 gap-1 bg-slate-900 p-1 rounded-2xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setActivePortal('asesores')}
            className={`py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
              activePortal === 'asesores'
                ? 'bg-slate-800 text-sky-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCircle2 className="w-4 h-4" />
            <span>Asesores</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePortal('duenos')}
            className={`py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
              activePortal === 'duenos'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-400" />
            <span>Dueños / Dirección</span>
          </button>
        </div>

        {/* PORTAL 1: ASESORES DE VENTA */}
        {activePortal === 'asesores' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in">
            <div className="border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white block">Acceso de Asesores Comerciales</span>
              <span className="text-[10px] text-slate-400">
                Cada asesor solo puede ver su propia cartera, citas y metas personales.
              </span>
            </div>

            <form onSubmit={handleAdvisorLogin} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-300 block mb-1">Correo Institucional</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="carlos.mendoza@funeraleshernandez.com"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-300 block mb-1">Contraseña</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {advisorError && (
                <div className="text-[11px] text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2 rounded-lg">
                  {advisorError}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 text-xs font-serif uppercase tracking-wider"
              >
                <span>Entrar como Asesor</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Click for Registered Advisors */}
            <div className="pt-2 border-t border-slate-800 space-y-1.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                Asesores en Turno (Acceso Rápido):
              </span>
              <div className="space-y-1">
                {advisors.map(adv => {
                  const branch = branches.find(b => b.id === adv.branch);
                  return (
                    <button
                      key={adv.id}
                      type="button"
                      onClick={() => handleQuickAdvisor(adv.id)}
                      className="w-full text-left p-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700 flex items-center justify-between text-xs transition-all"
                    >
                      <div>
                        <div className="font-semibold text-white">{adv.name}</div>
                        <div className="text-[10px] text-slate-400">{branch?.shortName}</div>
                      </div>
                      <span className="text-[10px] text-sky-400 font-bold bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                        Ingresar
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* PORTAL 2: DUEÑOS Y DIRECCIÓN (PROTEGIDO POR PIN / CLAVE MAESTRA) */}
        {activePortal === 'duenos' && (
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in">
            <div className="border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <Crown className="w-4 h-4" />
                <span>Acceso Restringido a Propietarios</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Los asesores no pueden ingresar a esta sección sin la Clave Maestra.
              </p>
            </div>

            <form onSubmit={handleOwnerPinLogin} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[10px] text-slate-300 block mb-1">
                  PIN Maestro de Propietario (4 dígitos)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-amber-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    maxLength={4}
                    value={ownerPin}
                    onChange={(e) => setOwnerPin(e.target.value.replace(/[^\d]/g, ''))}
                    placeholder="PIN: 7788"
                    className="w-full bg-slate-800 border border-amber-500/40 rounded-xl pl-9 pr-3 py-2 text-sm text-center font-mono font-bold tracking-widest text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {ownerError && (
                <div className="text-[11px] text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2 rounded-lg flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{ownerError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-slate-950 font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 text-xs font-serif uppercase tracking-wider"
              >
                <Lock className="w-4 h-4" />
                <span>Desbloquear Panel Dueños</span>
              </button>
            </form>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 text-[10px] text-amber-200/90 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-amber-400" />
                <span>Protección de Confidencialidad:</span>
              </div>
              <p>
                PIN Maestro predeterminado de prueba: <b className="text-amber-400 font-mono text-xs">7788</b>.
              </p>
              <p className="text-slate-400">
                Al ingresar con este PIN, se desbloquea la visión de todas las llamadas, prospectos de todas las sucursales, facturación y la creación de nuevos vendedores.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-[10px] text-slate-500">
          Funerales Hernández • 3 Sucursales Activas: Matriz Centro, Jardines del Valle, Puerta Real.
        </div>

      </div>
    </div>
  );
};
