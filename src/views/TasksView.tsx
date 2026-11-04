import React, { useState } from 'react';
import { TaskPending } from '../types';
import { TaskCard } from '../components/TaskCard';
import { getTodayDateString } from '../services/storage';
import { Search, Filter, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TasksViewProps {
  tasks: TaskPending[];
  onCompleteTask: (task: TaskPending) => void;
  onRescheduleTask: (task: TaskPending, newDate: string, newTime: string) => void;
  onOpenQuickCapture: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  onCompleteTask,
  onRescheduleTask,
  onOpenQuickCapture
}) => {
  const { currentUser } = useAuth();
  const [filter, setFilter] = useState<'hoy' | 'atrasados' | 'futuros' | 'completados'>('hoy');
  const [searchTerm, setSearchTerm] = useState('');

  const todayStr = getTodayDateString();

  // Filter tasks belonging to current advisor
  const userTasks = tasks.filter(t => t.userId === currentUser.id);

  // Group calculations
  const todayTasks = userTasks.filter(t => t.dueDate === todayStr && !t.isCompleted);
  const overdueTasks = userTasks.filter(t => t.dueDate < todayStr && !t.isCompleted);
  const futureTasks = userTasks.filter(t => t.dueDate > todayStr && !t.isCompleted);
  const completedTasks = userTasks.filter(t => t.isCompleted);

  let currentList = todayTasks;
  if (filter === 'atrasados') currentList = overdueTasks;
  else if (filter === 'futuros') currentList = futureTasks;
  else if (filter === 'completados') currentList = completedTasks;

  // Search filter
  const filteredTasks = currentList.filter(t =>
    t.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.contactPhone.includes(searchTerm) ||
    (t.notes && t.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4 pb-24 text-slate-100">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white font-serif tracking-wide uppercase">
            Mis Pendientes
          </h2>
          <p className="text-xs text-slate-400">
            Citas y llamadas programadas para hoy y rezagadas
          </p>
        </div>
        <button
          onClick={onOpenQuickCapture}
          className="text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded-xl shadow-md transition-colors"
        >
          + Nueva Cita
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar cliente por nombre o teléfono..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Filter Tabs */}
      <div className="grid grid-cols-4 gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
        <button
          onClick={() => setFilter('hoy')}
          className={`py-1.5 rounded-lg font-medium transition-all flex flex-col items-center justify-center ${
            filter === 'hoy'
              ? 'bg-amber-500 text-slate-950 font-bold shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Hoy</span>
          <span className="text-[10px] opacity-90">({todayTasks.length})</span>
        </button>

        <button
          onClick={() => setFilter('atrasados')}
          className={`py-1.5 rounded-lg font-medium transition-all flex flex-col items-center justify-center ${
            filter === 'atrasados'
              ? 'bg-rose-500 text-white font-bold shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Atrasados</span>
          <span className="text-[10px] opacity-90">({overdueTasks.length})</span>
        </button>

        <button
          onClick={() => setFilter('futuros')}
          className={`py-1.5 rounded-lg font-medium transition-all flex flex-col items-center justify-center ${
            filter === 'futuros'
              ? 'bg-blue-500 text-white font-bold shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Próximos</span>
          <span className="text-[10px] opacity-90">({futureTasks.length})</span>
        </button>

        <button
          onClick={() => setFilter('completados')}
          className={`py-1.5 rounded-lg font-medium transition-all flex flex-col items-center justify-center ${
            filter === 'completados'
              ? 'bg-emerald-600 text-white font-bold shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Completos</span>
          <span className="text-[10px] opacity-90">({completedTasks.length})</span>
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="font-semibold text-slate-300">
              No hay pendientes en la categoría seleccionada
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Todos los clientes están al día o no coinciden con la búsqueda.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={onCompleteTask}
              onReschedule={onRescheduleTask}
            />
          ))
        )}
      </div>

    </div>
  );
};
