import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, Sparkles, Building2, UserCircle2 } from 'lucide-react';

interface AdvisorLoginViewProps {
  onSuccess: () => void;
}

export const AdvisorLoginView: React.FC<AdvisorLoginViewProps> = ({ onSuccess }) => {
  const { allUsers, login, switchDemoUser, branches } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Strictly filter only advisors (NO super_admin or admin in this list)
  const advisors = allUsers.filter(u => u.role === 'asesor');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Por favor ingresa tu correo institucional de asesor.');
      return;
    }
    const targetUser = advisors.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (targetUser) {
      login(targetUser.email);
      setError('');
      onSuccess();
    } else {
      setError('No se encontró un asesor activo con este correo.');
    }
  };

  const handleQuickAdvisor = (userId: string) => {
    switchDemoUser(userId);
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-8 text-slate-100 font-sans selection:bg-amber-600 selection:text-white">
      <div className="w-full max-w-sm space-y-5 animate-in fade-in duration-300">
        
        {/* Official Oval Logo Banner */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <img
              src="/logo.png"
              alt="Funerales Hernández"
              className="h-20 w-auto object-contain drop-shadow-xl"
            />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Portal de Asesores Comerciales</span>
          </span>
          <p className="text-xs text-slate-400 font-medium">
            Programa Comercial de Acompañamiento 90 Días
          </p>
        </div>

        {/* Advisor Sign-in Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="border-b border-slate-800 pb-2">
            <h2 className="text-sm font-bold text-white font-serif">Iniciar Sesión de Trabajo</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Ingresa tus credenciales para acceder a tu bitácora, citas y cotizador.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="text-[11px] text-slate-300 block mb-1 font-medium">
                Correo Institucional
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="carlos.mendoza@funeraleshernandez.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-300 block mb-1 font-medium">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {error && (
              <div className="text-[11px] text-rose-400 bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider"
            >
              <span>Acceder al Tablero</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          {/* Quick Select for Registered Advisors */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
              Seleccionar tu Nombre (Acceso Rápido):
            </span>
            <div className="space-y-1.5">
              {advisors.map((adv) => {
                const branch = branches.find(b => b.id === adv.branch);
                return (
                  <button
                    key={adv.id}
                    type="button"
                    onClick={() => handleQuickAdvisor(adv.id)}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700 flex items-center justify-between text-xs transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-700 text-amber-400 flex items-center justify-center font-bold text-xs border border-slate-600 group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
                        {adv.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-white group-hover:text-amber-300 transition-colors">
                          {adv.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {branch?.shortName || 'Oficina Comercial'}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-amber-400 font-bold bg-slate-900/80 px-2 py-0.5 rounded-lg border border-slate-700">
                      Entrar →
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[10px] text-slate-500 space-y-0.5">
          <p>Funerales Hernández • Oficina Comercial de Ventas</p>
          <p>Atención y Cotización Multisede</p>
        </div>

      </div>
    </div>
  );
};
