import React, { useState } from 'react';
import { Contact } from '../types';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { 
  Search, Phone, MessageCircle, Plus, Users, Trash2, 
  MapPin, Mail, Edit3, X, Check, ExternalLink 
} from 'lucide-react';

interface ContactsViewProps {
  contacts: Contact[];
  onOpenQuickCaptureWithContact: (contact: { id: string; name: string; phone: string; address?: string; email?: string }) => void;
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
  const [sourceFilter] = useState<string>('todos');

  // Inline edit modal state
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Filter contacts belonging to current advisor (excluding archived/deleted by advisor)
  const userContacts = contacts.filter(c => c.userId === currentUser.id && !c.deletedByAdvisor);

  const filtered = userContacts.filter(c => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(searchTerm) ||
      Boolean(c.address && c.address.toLowerCase().includes(q)) ||
      Boolean(c.email && c.email.toLowerCase().includes(q));
    const matchesStatus = statusFilter === 'todos' || c.status === statusFilter;
    const matchesSource = sourceFilter === 'todos' || c.source === sourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
  });

  const handleOpenEdit = (contact: Contact) => {
    setEditingContact(contact);
    setEditName(contact.name);
    setEditPhone(contact.phone === 'Sin registrar' ? '' : contact.phone);
    setEditAddress(contact.address || '');
    setEditEmail(contact.email || '');
    setEditNotes(contact.notes || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContact || !editName.trim()) return;
    storage.saveContact({
      ...editingContact,
      name: editName.trim(),
      phone: editPhone.trim() || 'Sin registrar',
      address: editAddress.trim() || undefined,
      email: editEmail.trim().toLowerCase() || undefined,
      notes: editNotes.trim() || undefined
    });
    setEditingContact(null);
  };

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
          placeholder="Buscar por nombre, teléfono, domicilio, colonia o correo..."
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
            const mapsUrl = contact.address
              ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`
              : undefined;

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

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] text-slate-500">
                      Reg: {contact.createdAt}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(contact)}
                      className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-700"
                      title="Editar datos del prospecto"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Editar</span>
                    </button>
                  </div>
                </div>

                {(contact.address || contact.email) && (
                  <div className="space-y-1 pt-1 text-[11px] text-slate-300">
                    {contact.address && (
                      <div className="flex items-start justify-between gap-2 bg-slate-800/50 px-2.5 py-1.5 rounded-lg border border-slate-800">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>{contact.address}</span>
                        </div>
                        {mapsUrl && (
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-amber-400 hover:underline font-semibold flex items-center gap-0.5 shrink-0"
                            title="Abrir ubicación en Google Maps"
                          >
                            <span>Mapa</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    )}
                    {contact.email && (
                      <div className="flex items-center gap-1.5 bg-slate-800/50 px-2.5 py-1 rounded-lg border border-slate-800">
                        <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <a href={`mailto:${contact.email}`} className="text-sky-300 hover:underline truncate">
                          {contact.email}
                        </a>
                      </div>
                    )}
                  </div>
                )}

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
                    onClick={() => onOpenQuickCaptureWithContact({
                      id: contact.id,
                      name: contact.name,
                      phone: contact.phone,
                      address: contact.address,
                      email: contact.email
                    })}
                    className="flex-1 flex items-center justify-center gap-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 py-1.5 rounded-xl text-xs font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                    <span>Actividad</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`¿Deseas descartar el prospecto "${contact.name}" de tu agenda activa?`)) {
                        storage.softDeleteContact(contact.id);
                      }
                    }}
                    className="p-2 bg-slate-800 hover:bg-rose-950/80 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 rounded-xl text-xs transition-colors"
                    title="Descartar de mi lista activa (se conserva para la empresa)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Editar Datos del Prospecto */}
      {editingContact && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-5 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-serif">
                  Editar Ficha del Prospecto
                </h3>
              </div>
              <button
                onClick={() => setEditingContact(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Teléfono Móvil (10 dígitos)</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value.replace(/[^\d]/g, '').slice(0, 10))}
                  placeholder="4421234567"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Domicilio / Colonia</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="Calle, número, colonia y referencias"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="cliente@correo.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Notas / Observaciones</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Notas sobre interés del cliente, horario preferido, etc."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 shadow-md"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingContact(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
