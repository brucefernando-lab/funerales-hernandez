import React, { useState } from 'react';
import { Contact, ContactSource, ContactStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { Search, Phone, MessageCircle, Plus, Users, UserCheck, ShieldAlert, Sparkles } from 'lucide-react';

interface ContactsViewProps {
  contacts: Contact[];
  onOpenQuickCaptureWithContact: (contact: { id: string; name: string; phone: string }) => void;
  onOpenNewCapture: () => void;
}

export const ContactsView: React.FC<ContactsViewProps> = ({
  contacts,
  onOpenQuickCaptureWithContact,
  onOpenNewCapture
}) => {
  const { currentUser, currentBranch } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [sourceFilter, setSourceFilter] = useState<string>('todos');

  // Filter contacts belonging to current advisor
  const userContacts = contacts.filter(c => c.userId === currentUser.id);

  const filtered = userContacts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'todos' || c.status === statusFilter;
    const matchesSource = sourceFilter === 'todos' || c.source === sourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
  });

  return (
    <div className="space-y-4 pb-24 text-slate-100">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white font-serif uppercase tracking-wide">
            Cartera de Contactos
          </h2>
          <p className="text-xs text-slate-400">
            {userContacts.length} prospectos y clientes en seguimiento
          </p>
        </div>
        <button
          onClick={onOpenNewCapture}
          className="text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded-xl shadow-md transition-colors"
        >
          + Nuevo
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nombre o teléfono..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Status Filters */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        {[
          { id: 'todos', label: 'Todos' },
          { id: 'prospecto', label: 'Prospectos' },
          { id: 'cita', label: 'En Cita' },
          { id: 'cliente', label: 'Clientes (Cerrados)' },
          { id: 'descartado', label: 'Descartados' }
        ].map(st => (
          <button
            key={st.id}
            onClick={() => setStatusFilter(st.id)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all font-medium ${
              statusFilter === st.id
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {/* Contact Cards List (Responsive Grid for Mobile & Desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filtered.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400">
            <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p>No se encontraron contactos con los filtros seleccionados.</p>
          </div>
        ) : (
          filtered.map(contact => {
            const cleanPhone = contact.phone.replace(/[^\d]/g, '');
            const whatsappPhone = cleanPhone.length === 10 ? `52${cleanPhone}` : cleanPhone;
            const message = encodeURIComponent(
              `Hola ${contact.name}, le saluda ${currentUser.name.split(' ')[0]} de Funerales Hernández (${currentBranch.shortName}). Espero se encuentre muy bien.`
            );

            return (
              <div
                key={contact.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-sm space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        contact.status === 'cliente' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        contact.status === 'cita' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                        contact.status === 'descartado' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {contact.status}
                      </span>
                      <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700 capitalize">
                        Origen: {contact.source}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white font-serif mt-1">
                      {contact.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">{contact.phone}</p>
                  </div>

                  <span className="text-[10px] text-slate-500">
                    Reg: {contact.createdAt}
                  </span>
                </div>

                {contact.notes && (
                  <p className="text-xs text-slate-400 bg-slate-800/40 p-2 rounded-lg border border-slate-800 italic">
                    "{contact.notes}"
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                  <a
                    href={`tel:${cleanPhone}`}
                    className="flex-1 flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 py-1.5 rounded-xl text-xs font-medium"
                  >
                    <Phone className="w-3.5 h-3.5 text-sky-400" />
                    <span>Llamar</span>
                  </a>

                  <a
                    href={`https://wa.me/${whatsappPhone}?text=${message}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 py-1.5 rounded-xl text-xs font-medium"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp</span>
                  </a>

                  <button
                    onClick={() => onOpenQuickCaptureWithContact({ id: contact.id, name: contact.name, phone: contact.phone })}
                    className="flex-1 flex items-center justify-center gap-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 py-1.5 rounded-xl text-xs font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                    <span>Actividad</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
