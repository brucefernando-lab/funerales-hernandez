import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { User } from '../types';
import { Lock, Crown, AlertCircle, ArrowLeft, ArrowRight, User as UserIcon, Eye, EyeOff, ShieldCheck } from 'lucide-react';

interface AdminLoginViewProps {
  onSuccess: (adminUser: User) => void;
  onGoToAdvisorLogin: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({ onSuccess, onGoToAdvisorLogin }) => {
  const { switchDemoUser } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setError('Por favor ingresa tu usuario y contraseña de administración.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const adminUser = storage.authenticateAdmin(cleanUser, cleanPass);

      if (adminUser) {
        sessionStorage.setItem('fh_admin_auth', 'true');
        sessionStorage.setItem('fh_admin_session', adminUser.id);
        switchDemoUser(adminUser.id);
        setIsLoading(false);
        onSuccess(adminUser);
      } else {
        setIsLoading(false);
        setError('Usuario o contraseña administrativa incorrectos.');
      }
    }, 250);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-8 text-slate-100 font-sans selection:bg-amber-600 selection:text-white">
      <div className="w-full max-w-sm space-y-5 animate-in fade-in duration-300">
        
        {/* Discreet Executive Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <img
              src="/logo.png"
              alt="Funerales Hernández"
              className="h-16 w-auto object-contain drop-shadow-xl"
            />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Crown className="w-3.5 h-3.5" />
            <span>Acceso Reservado • Dirección General</span>
          </div>
          <p className="text-xs text-slate-400">
            Supervisión Comercial, Radar de Asesores y Control Administrativo
          </p>
        </div>

        {/* Credentials Form */}
        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="border-b border-slate-800 pb-2">
            <h2 className="text-sm font-bold text-white font-serif flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Portal de Dirección</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Ingresa tus credenciales de directivo asignadas.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Username */}
            <div>
              <label className="text-[11px] text-slate-300 block mb-1 font-semibold">
                Usuario de Dirección
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Daniel, Linda, Rosa o Bruce"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-[11px] text-slate-300 block mb-1 font-semibold">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="••••••••"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 focus:outline-none"
                  title={showPassword ? 'Ocultar' : 'Mostrar'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-tight">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider disabled:opacity-50"
            >
              <span>{isLoading ? 'Verificando...' : 'Ingresar al Panel'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          {/* Privacy Note */}
          <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 text-center">
            Acceso estrictamente confidencial para directores de Funerales Hernández.
          </div>
        </div>

        {/* Return to Advisor Login Link */}
        <div className="text-center pt-2">
          <button
            onClick={onGoToAdvisorLogin}
            className="text-xs text-slate-400 hover:text-amber-400 flex items-center justify-center gap-1.5 mx-auto transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Ir al Portal de Asesores (/login)</span>
          </button>
        </div>

      </div>
    </div>
  );
};