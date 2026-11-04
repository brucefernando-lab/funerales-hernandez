import React, { useState } from 'react';
import { Phone, MessageCircle, Calendar, Clock, MapPin, CheckCircle, RefreshCw } from 'lucide-react';
import { TaskPending } from '../types';
import { useAuth } from '../context/AuthContext';
import { getTodayDateString } from '../services/storage';

interface TaskCardProps {
  task: TaskPending;
  onComplete: (task: TaskPending) => void;
  onReschedule: (task: TaskPending, newDate: string, newTime: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onComplete, onReschedule }) => {
  const { currentUser, currentBranch } = useAuth();
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState(task.dueDate);
  const [newTime, setNewTime] = useState(task.dueTime);

  const todayStr = getTodayDateString();
  const isOverdue = !task.isCompleted && task.dueDate < todayStr;
  const isToday = task.dueDate === todayStr;

  const cleanPhone = task.contactPhone.replace(/[^\d]/g, '');
  const whatsappPhone = cleanPhone.length === 10 ? `52${cleanPhone}` : cleanPhone;

  const advisorFirstName = currentUser.name.split(' ')[0];
  const clientName = task.contactName;
  const branchName = currentBranch.shortName;

  const defaultMessage = task.taskType === 'cita'
    ? `Estimado(a) ${clientName}, le saluda ${advisorFirstName} de Funerales Hernández (${branchName}). Me pongo en contacto para confirmar los detalles de nuestra cita el día de hoy a las ${task.dueTime} hrs para revisar la previsión familiar. Quedo a sus órdenes.`
    : `Estimado(a) ${clientName}, un gusto saludarle. Le habla ${advisorFirstName} de Funerales Hernández (${branchName}). Le contacto conforme a lo acordado para dar seguimiento a la protección y previsión de su familia. ¿Le parece bien que conversemos unos minutos?`;

  const encodedMessage = encodeURIComponent(defaultMessage);
  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodedMessage}`;

  const handleSaveReschedule = () => {
    onReschedule(task, newDate, newTime);
    setIsRescheduling(false);
  };

  return (
    <div
      className={`rounded-2xl border p-3.5 transition-all shadow-sm ${
        task.isCompleted
          ? 'bg-slate-900/60 border-slate-800 opacity-60'
          : isOverdue
          ? 'bg-slate-900/90 border-rose-500/40 shadow-rose-950/20'
          : isToday
          ? 'bg-slate-900/90 border-amber-500/40 shadow-amber-950/20'
          : 'bg-slate-900/90 border-slate-800'
      }`}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                task.taskType === 'cita'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              }`}
            >
              {task.taskType === 'cita' ? 'Cita Presencial' : 'Llamada'}
            </span>

            {isOverdue && (
              <span className="text-[10px] bg-rose-500/20 text-rose-300 font-bold px-2 py-0.5 rounded-full border border-rose-500/30">
                Atrasado
              </span>
            )}

            {isToday && !task.isCompleted && (
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                Hoy
              </span>
            )}
          </div>

          <h3 className="text-sm font-bold text-white mt-1 font-serif">
            {task.contactName}
          </h3>
        </div>

        {/* Time Badge */}
        <div className="text-right shrink-0">
          <div className="flex items-center gap-1 text-xs font-semibold text-amber-400 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
            <Clock className="w-3 h-3" />
            <span>{task.dueTime}</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{task.dueDate}</div>
        </div>
      </div>

      {/* Task Location / Notes */}
      {task.location && (
        <div className="flex items-center gap-1.5 text-xs text-slate-300 mb-1.5">
          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="capitalize">Lugar: {task.location}</span>
        </div>
      )}

      {task.notes && (
        <p className="text-xs text-slate-400 bg-slate-800/40 p-2 rounded-lg border border-slate-800/80 mb-3 italic">
          "{task.notes}"
        </p>
      )}

      {/* Inline Reschedule Form */}
      {isRescheduling && (
        <div className="p-2.5 bg-slate-800 rounded-xl border border-slate-700 mb-3 space-y-2 animate-in fade-in">
          <div className="text-xs font-bold text-amber-400">Reprogramar Fecha y Hora:</div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
            />
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSaveReschedule}
              className="flex-1 bg-amber-500 text-slate-950 font-bold py-1 rounded-lg text-xs hover:bg-amber-400"
            >
              Guardar Nueva Fecha
            </button>
            <button
              onClick={() => setIsRescheduling(false)}
              className="px-2 py-1 bg-slate-700 text-slate-300 rounded-lg text-xs"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons Row */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
        <a
          href={`tel:${cleanPhone}`}
          className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 py-2 px-2.5 rounded-xl text-xs font-medium transition-colors"
          title="Llamar directamente"
        >
          <Phone className="w-3.5 h-3.5 text-sky-400" />
          <span>Llamar</span>
        </a>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 py-2 px-2.5 rounded-xl text-xs font-medium transition-colors"
          title="Enviar WhatsApp con mensaje formal prellenado"
        >
          <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>WhatsApp</span>
        </a>

        {!task.isCompleted && (
          <button
            onClick={() => setIsRescheduling(!isRescheduling)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs"
            title="Reprogramar fecha"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
          </button>
        )}

        {!task.isCompleted ? (
          <button
            onClick={() => onComplete(task)}
            className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-bold py-2 px-2 rounded-xl text-xs shadow-sm shadow-amber-500/20 active:scale-95 transition-all"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Registrar</span>
          </button>
        ) : (
          <span className="flex-1 text-center text-xs text-emerald-400 font-semibold py-2">
            ✓ Completado
          </span>
        )}
      </div>
    </div>
  );
};
