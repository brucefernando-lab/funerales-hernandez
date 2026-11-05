import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, Crown, KeyRound, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';

interface AdminLoginViewProps {
  onSuccess: () => void;
  onGoToAdvisorLogin: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({ onSuccess, onGoToAdvisorLogin }) => {
  const { allUsers, switchDemoUser } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const MASTER_PIN = '7788';

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setError('');
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const verifyPin = (inputPin: string) => {
    if (inputPin === MASTER_PIN) {
      const owner = allUsers.find(u => u.role === 'super_admin') || allUsers.find(u => u.role === 'admin');
      if (owner) {
        switchDemoUser(owner.id);
        setError('');
        onSuccess();
      }
    } else {
      setError('PIN de Propietario Incorrecto. Acceso denegado.');
      setPin('');
    }
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
            <span>Acceso Reservado • Dirección y Propietarios</span>
          </div>
          <p className="text-xs text-slate-400">
            Supervisión General, Radar de Asesores y Auditoría de Cortes
          </p>
        </div>

        {/* PIN Security Card */}
        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="text-center">
            <span className="text-xs text-slate-300 font-semibold block">
              Ingresa la Clave Maestra de Seguridad
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              4 dígitos numéricos confidenciales
            </span>
          </div>

          {/* PIN Dots Indicator */}
          <div className="flex justify-center items-center gap-3 py-2">
            {[0, 1, 2, 3].map((index) => {
              const isFilled = pin.length > index;
              return (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    isFilled
                      ? 'bg-amber-400 shadow-md shadow-amber-400/50 scale-110'
                      : 'border-2 border-slate-700 bg-slate-800'
                  }`}
                />
              );
            })}
          </div>

          {error && (
            <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl text-center flex items-center justify-center gap-1.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyPress(num)}
                className="h-12 rounded-xl bg-slate-800 hover:bg-slate-750 active:bg-amber-500 active:text-slate-950 border border-slate-700 text-lg font-bold text-white transition-all shadow-sm focus:outline-none"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="h-12 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs font-semibold transition-all focus:outline-none"
            >
              Borrar
            </button>
            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              className="h-12 rounded-xl bg-slate-800 hover:bg-slate-750 active:bg-amber-500 active:text-slate-950 border border-slate-700 text-lg font-bold text-white transition-all shadow-sm focus:outline-none"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="h-12 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs font-semibold transition-all focus:outline-none"
            >
              ⌫
            </button>
          </div>

          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-2.5 text-[10px] text-amber-300/80 text-center">
            <span>Clave Maestra de Demostración: <strong className="font-mono text-amber-400">7788</strong></span>
          </div>
        </div>

        {/* Return to Advisor Login Link */}
        <div className="text-center pt-2">
          <button
            onClick={onGoToAdvisorLogin}
            className="text-xs text-slate-400 hover:text-amber-400 flex items-center justify-center gap-1.5 mx-auto transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Regresar al Portal de Asesores (/login)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
