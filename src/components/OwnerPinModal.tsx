import React, { useState } from 'react';
import { ShieldCheck, Lock, X, AlertCircle, KeyRound } from 'lucide-react';

interface OwnerPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  masterPin?: string;
}

export const OwnerPinModal: React.FC<OwnerPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  masterPin = '7788'
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setError(false);

      if (newPin.length === 4) {
        if (newPin === masterPin) {
          setTimeout(() => {
            onSuccess();
            setPin('');
            onClose();
          }, 150);
        } else {
          setError(true);
          setTimeout(() => setPin(''), 500);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xs bg-slate-900 border border-amber-500/40 rounded-2xl p-5 shadow-2xl text-slate-100 text-center space-y-4">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Lock className="w-4 h-4" />
            <span>Seguridad de Dueños</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Instructions */}
        <div className="space-y-1">
          <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <KeyRound className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white font-serif">
            Ingrese PIN Maestro de Acceso
          </h3>
          <p className="text-[11px] text-slate-400">
            Panel exclusivo para propietarios y directores.
          </p>
        </div>

        {/* PIN Dots Display */}
        <div className="flex justify-center gap-3 py-2">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                  error
                    ? 'border-rose-500 bg-rose-500 animate-bounce'
                    : isFilled
                    ? 'border-amber-400 bg-amber-400 scale-110 shadow-sm shadow-amber-400/50'
                    : 'border-slate-700 bg-slate-800'
                }`}
              />
            );
          })}
        </div>

        {error && (
          <div className="text-[11px] text-rose-400 flex items-center justify-center gap-1 font-semibold">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>PIN Incorrecto. Intente nuevamente.</span>
          </div>
        )}

        <div className="text-[10px] text-slate-500 bg-slate-800/40 py-1 px-2 rounded border border-slate-800">
          PIN Maestro Predeterminado: <b className="text-amber-400 font-mono">7788</b>
        </div>

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => handleDigit(d)}
              className="py-3 bg-slate-800 hover:bg-slate-750 text-white font-bold rounded-xl text-base border border-slate-700 active:scale-95 transition-all"
            >
              {d}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPin('')}
            className="py-3 bg-slate-800/50 text-slate-400 hover:text-white rounded-xl text-xs border border-slate-700/50"
          >
            Limpiar
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="py-3 bg-slate-800 hover:bg-slate-750 text-white font-bold rounded-xl text-base border border-slate-700 active:scale-95 transition-all"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="py-3 bg-slate-800/50 text-slate-400 hover:text-white rounded-xl text-xs border border-slate-700/50"
          >
            ⌫
          </button>
        </div>

      </div>
    </div>
  );
};
