import React, { useState, useEffect } from 'react';
import { 
  X, Phone, User as UserIcon, Calendar, Clock, MapPin, 
  DollarSign, Sparkles, UserPlus, Trash2, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { 
  ContactSource, ActivityType, InteractionResult, 
  ObjectionType, TaskLocation, Referral, FuneralPackage 
} from '../types';
import { storage, getTodayDateString } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

export interface InitialPackageData {
  id: string;
  name: string;
  price: number;
  chapelId?: string;
  termSummary?: string;
}

interface ModalQuickCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  initialContact?: { name: string; phone: string; id?: string };
  initialPackage?: InitialPackageData;
}

export const ModalQuickCapture: React.FC<ModalQuickCaptureProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialContact,
  initialPackage
}) => {
  const { currentUser, currentBranch, allUsers } = useAuth();
  const isExecutive = currentUser.role === 'admin' || currentUser.role === 'super_admin';
  const advisors = allUsers.filter(u => u.role === 'asesor' && u.active);
  const [assignedUserId, setAssignedUserId] = useState<string>(currentUser.id);
  const [packages, setPackages] = useState<FuneralPackage[]>([]);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [source, setSource] = useState<ContactSource>('frio');
  const [activityType, setActivityType] = useState<ActivityType>('contacto_diario');
  const [selectedPackageId, setSelectedPackageId] = useState<string>('pkg_celestial');
  const [result, setResult] = useState<InteractionResult>('en_seguimiento');

  // Result: Cita Agendada
  const [appointmentDate, setAppointmentDate] = useState(getTodayDateString());
  const [appointmentTime, setAppointmentTime] = useState('11:00');
  const [appointmentLocation, setAppointmentLocation] = useState<TaskLocation>('sucursal');

  // Result: En Seguimiento
  const [followUpDate, setFollowUpDate] = useState(getTodayDateString(2));
  const [notes, setNotes] = useState('');

  // Result: Venta Cerrada
  const [saleAmount, setSaleAmount] = useState<number>(49500);
  const [referrals, setReferrals] = useState<Referral[]>([{ name: '', phone: '' }]);

  // Result: Descartado
  const [objection, setObjection] = useState<ObjectionType>('postergacion');

  // Validation
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAssignedUserId(currentUser.id);
      const pkgs = storage.getPackages().filter(p => p.active);
      setPackages(pkgs);

      if (initialPackage) {
        setSelectedPackageId(initialPackage.id);
        setSaleAmount(initialPackage.price);
        setActivityType('cita_presentacion');
        setNotes(initialPackage.termSummary 
          ? `Cotización: ${initialPackage.name} (${initialPackage.termSummary})` 
          : `Interés en plan: ${initialPackage.name}`
        );
      } else {
        const anchorPkg = pkgs.find(p => p.isAnchor) || pkgs[0];
        if (anchorPkg) {
          setSelectedPackageId(anchorPkg.id);
          setSaleAmount(anchorPkg.price);
        }
      }

      if (initialContact) {
        setName(initialContact.name);
        setPhone(initialContact.phone);
      } else {
        setName('');
        setPhone('');
        if (!initialPackage) setNotes('');
        setResult('en_seguimiento');
        setReferrals([{ name: '', phone: '' }]);
      }
      setPhoneError('');
    }
  }, [isOpen, initialContact, initialPackage]);

  if (!isOpen) return null;

  const handlePhoneChange = (val: string) => {
    // Keep numbers and dashes
    const cleaned = val.replace(/[^\d]/g, '').slice(0, 10);
    setPhone(cleaned);
    if (cleaned.length > 0 && cleaned.length < 10) {
      setPhoneError('Ingresa 10 dígitos (ej. 4421234567)');
    } else {
      setPhoneError('');
    }
  };

  const handlePackageSelect = (pkgId: string) => {
    setSelectedPackageId(pkgId);
    const p = packages.find(item => item.id === pkgId);
    if (p) {
      setSaleAmount(p.price);
    }
  };

  const handleAddReferral = () => {
    if (referrals.length < 5) {
      setReferrals([...referrals, { name: '', phone: '' }]);
    }
  };

  const handleRemoveReferral = (index: number) => {
    setReferrals(referrals.filter((_, i) => i !== index));
  };

  const handleUpdateReferral = (index: number, field: 'name' | 'phone', value: string) => {
    const updated = [...referrals];
    updated[index][field] = field === 'phone' ? value.replace(/[^\d]/g, '').slice(0, 10) : value;
    setReferrals(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Por favor ingresa el nombre del prospecto.');
      return;
    }
    if (phone.length > 0 && phone.length < 10) {
      setPhoneError('El teléfono debe tener 10 dígitos.');
      return;
    }

    const selectedPkg = packages.find(p => p.id === selectedPackageId) || packages[0];
    const contactId = initialContact?.id || `cnt_${Date.now()}`;
    const finalUserId = (isExecutive && assignedUserId) ? assignedUserId : currentUser.id;
    const targetUser = allUsers.find(u => u.id === finalUserId);
    const finalBranch = targetUser?.branch || currentBranch.id;

    // 1. Save or update Contact
    let contactStatus = 'prospecto';
    if (result === 'cita_agendada') contactStatus = 'cita';
    else if (result === 'venta_cerrada') contactStatus = 'cliente';
    else if (result === 'descartado') contactStatus = 'descartado';

    storage.saveContact({
      id: contactId,
      userId: finalUserId,
      branch: finalBranch,
      name: name.trim(),
      phone: phone || 'Sin registrar',
      source,
      status: contactStatus as any,
      createdAt: getTodayDateString(),
      notes: notes.trim(),
      lastInteraction: new Date().toISOString()
    });

    // 2. Save Activity
    const newActivity = {
      id: `act_${Date.now()}`,
      userId: finalUserId,
      contactId,
      contactName: name.trim(),
      contactPhone: phone,
      activityType,
      source,
      packageOfferedId: selectedPkg.id,
      packageOfferedName: selectedPkg.name,
      result,
      objection: result === 'descartado' ? objection : undefined,
      notes: notes.trim(),
      createdAt: new Date().toISOString()
    };
    storage.addActivity(newActivity);

    // 3. Conditional workflows based on interaction result
    if (result === 'cita_agendada') {
      // Auto-schedule task in "Pendientes"
      storage.saveTask({
        id: `tsk_${Date.now()}`,
        userId: finalUserId,
        contactId,
        contactName: name.trim(),
        contactPhone: phone,
        dueDate: appointmentDate,
        dueTime: appointmentTime,
        taskType: 'cita',
        location: appointmentLocation,
        isCompleted: false,
        notes: `Cita presencial (${appointmentLocation.toUpperCase()}) para presentar ${selectedPkg.name}.`,
        createdAt: new Date().toISOString()
      });
      onSuccess(`¡Cita agendada para el ${appointmentDate} a las ${appointmentTime}! Registrada en Pendientes.`);
    } else if (result === 'en_seguimiento') {
      // Schedule follow-up call
      storage.saveTask({
        id: `tsk_${Date.now()}`,
        userId: finalUserId,
        contactId,
        contactName: name.trim(),
        contactPhone: phone,
        dueDate: followUpDate,
        dueTime: '10:30',
        taskType: 'llamada',
        isCompleted: false,
        notes: notes.trim() || `Seguimiento de ${selectedPkg.name}.`,
        createdAt: new Date().toISOString()
      });
      onSuccess(`Actividad guardada. Seguimiento programado para el ${followUpDate}.`);
    } else if (result === 'venta_cerrada') {
      // Register sale
      const validReferrals = referrals.filter(r => r.name.trim().length > 0);
      storage.addSale({
        id: `sl_${Date.now()}`,
        userId: finalUserId,
        contactId,
        contactName: name.trim(),
        packageId: selectedPkg.id,
        packageName: selectedPkg.name,
        amount: Number(saleAmount) || selectedPkg.price,
        saleDate: new Date().toISOString(),
        referralsCount: validReferrals.length,
        referrals: validReferrals
      });

      // Also save referrals as new contacts in cold/referral queue
      validReferrals.forEach((ref, idx) => {
        storage.saveContact({
          id: `cnt_ref_${Date.now()}_${idx}`,
          userId: finalUserId,
          branch: finalBranch,
          name: ref.name.trim(),
          phone: ref.phone.trim(),
          source: 'referido',
          status: 'prospecto',
          createdAt: getTodayDateString(),
          notes: `Referido por cliente ${name.trim()} tras compra de ${selectedPkg.name}.`
        });
      });

      // Celebration Confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      onSuccess(`¡VENTA CERRADA EXITOSA! Contrato registrado por $${Number(saleAmount).toLocaleString('es-MX')} y ${validReferrals.length} referidos generados.`);
    } else if (result === 'descartado') {
      onSuccess(`Interacción registrada. Objeción (${objection.replace('_', ' ')}) almacenada para análisis.`);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto">
      <div 
        className="w-full max-w-lg bg-slate-900 border-t sm:border border-slate-700 sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-slate-100 animate-in slide-in-from-bottom duration-200"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
              +
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-serif uppercase tracking-wide">
                Registrar Actividad
              </h2>
              <p className="text-[11px] text-amber-400 font-medium">Captura ágil en menos de 20 seg</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
          
          {/* 1. Datos del Prospecto */}
          <div className="space-y-2 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
              1. Datos del Prospecto
            </span>

            {/* Asignación de Vendedor o Dirección */}
            {isExecutive && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5 mb-2">
                <label className="text-[10px] text-amber-300 font-bold block mb-1 uppercase tracking-wider flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                  Asignar Prospecto a:
                </label>
                <select
                  value={assignedUserId}
                  onChange={(e) => setAssignedUserId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-medium"
                >
                  <option value={currentUser.id}>👑 {currentUser.name} (Dirección General)</option>
                  <optgroup label="Asesores Comerciales">
                    {advisors.map(adv => (
                      <option key={adv.id} value={adv.id}>
                        👤 {adv.name} ({adv.branch === 'sucursal_1' ? 'Constitución' : adv.branch === 'sucursal_2' ? 'Dr. Mier' : 'Bienestar 60+'})
                      </option>
                    ))}
                  </optgroup>
                </select>
                <span className="text-[9px] text-slate-400 mt-1 block">
                  El prospecto se registrará en el CRM del vendedor elegido y quedará guardado para Dirección y en Supabase.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Nombre Completo *</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Martha Elena Rivas"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Teléfono Móvil (10 dígitos)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-2.5 top-2.5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="442 123 4567"
                    className={`w-full bg-slate-800 border rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none ${
                      phoneError ? 'border-rose-500' : 'border-slate-700 focus:border-amber-500'
                    }`}
                  />
                </div>
                {phoneError && <span className="text-[10px] text-rose-400 mt-1 block">{phoneError}</span>}
              </div>
            </div>
          </div>

          {/* 2. Origen del Contacto */}
          <div className="space-y-2 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
              2. Origen del Prospecto
            </span>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {[
                { id: 'frio', label: 'Frío / Prospección' },
                { id: 'convenio', label: 'Convenio Empresas' },
                { id: 'referido', label: 'Referido Cliente' },
                { id: 'guardia', label: 'Guardia Mostrador' },
              ].map((src) => (
                <button
                  type="button"
                  key={src.id}
                  onClick={() => setSource(src.id as ContactSource)}
                  className={`py-2 px-2 rounded-lg border text-center transition-all ${
                    source === src.id
                      ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-semibold'
                      : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  <span className="block text-[11px] leading-tight">{src.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Tipo de Registro */}
          <div className="space-y-2 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
              3. Tipo de Registro (Impacto en Meta Diaria)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setActivityType('contacto_diario')}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                  activityType === 'contacto_diario'
                    ? 'border-amber-500 bg-amber-500/15 text-white ring-1 ring-amber-500'
                    : 'border-slate-700 bg-slate-800/60 text-slate-400'
                }`}
              >
                <div className="font-bold text-xs flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  Contacto / Llamada
                </div>
                <span className="text-[10px] text-amber-300/80 font-medium">Suma a meta diaria (20)</span>
              </button>

              <button
                type="button"
                onClick={() => setActivityType('cita_presentacion')}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                  activityType === 'cita_presentacion'
                    ? 'border-emerald-500 bg-emerald-500/15 text-white ring-1 ring-emerald-500'
                    : 'border-slate-700 bg-slate-800/60 text-slate-400'
                }`}
              >
                <div className="font-bold text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Cita / Presentación
                </div>
                <span className="text-[10px] text-emerald-300/80 font-medium">Suma a meta diaria (3)</span>
              </button>
            </div>
          </div>

          {/* 4. Paquete Inicial Presentado (Anclaje High Ticket) */}
          <div className="space-y-2 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                4. Paquete Inicial Presentado
              </span>
              <span className="text-[10px] text-amber-300 font-semibold bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                Estrategia High-Ticket
              </span>
            </div>
            <div className="space-y-1.5">
              {packages.map((pkg) => {
                const isSelected = selectedPackageId === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => handlePackageSelect(pkg.id)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500'
                        : 'border-slate-700 bg-slate-800/60 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-amber-500 bg-amber-500' : 'border-slate-600'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-semibold ${isSelected ? 'text-amber-300' : 'text-slate-200'}`}>
                            {pkg.name}
                          </span>
                          {pkg.isAnchor && (
                            <span className="text-[9px] bg-gradient-to-r from-amber-500 to-amber-700 text-slate-950 font-bold px-1.5 py-0.2 rounded-full uppercase">
                              ★ Anclaje Sugerido
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">{pkg.subtitle}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-xs text-amber-400">
                        ${pkg.price.toLocaleString('es-MX')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. Resultado de la Interacción */}
          <div className="space-y-2 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
              5. Resultado de la Interacción
            </span>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {[
                { id: 'cita_agendada', label: 'Cita Agendada', color: 'border-blue-500 text-blue-300' },
                { id: 'en_seguimiento', label: 'En Seguimiento', color: 'border-amber-500 text-amber-300' },
                { id: 'venta_cerrada', label: 'Venta Cerrada', color: 'border-emerald-500 text-emerald-300' },
                { id: 'descartado', label: 'Descartado', color: 'border-rose-500 text-rose-300' },
              ].map((res) => (
                <button
                  type="button"
                  key={res.id}
                  onClick={() => setResult(res.id as InteractionResult)}
                  className={`py-2 px-1.5 rounded-lg border text-center transition-all ${
                    result === res.id
                      ? `bg-slate-700 ${res.color} font-bold ring-1`
                      : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:bg-slate-700/50'
                  }`}
                >
                  <span className="text-[11px]">{res.label}</span>
                </button>
              ))}
            </div>

            {/* DYNAMIC RESULT FIELDS */}

            {/* If CITA AGENDADA */}
            {result === 'cita_agendada' && (
              <div className="mt-3 p-3 bg-blue-950/30 border border-blue-500/30 rounded-xl space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5 text-blue-300 font-semibold text-[11px]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Programar Cita (Se guardará en 'Pendientes')</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Fecha de la Cita</label>
                    <input
                      type="date"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Hora</label>
                    <input
                      type="time"
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Lugar de la Cita</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'sucursal', label: 'Sucursal' },
                      { id: 'domicilio', label: 'Domicilio' },
                      { id: 'oficina', label: 'Oficina' }
                    ].map((loc) => (
                      <button
                        type="button"
                        key={loc.id}
                        onClick={() => setAppointmentLocation(loc.id as TaskLocation)}
                        className={`py-1.5 px-2 rounded-lg border text-center text-xs ${
                          appointmentLocation === loc.id
                            ? 'border-blue-400 bg-blue-500/20 text-blue-200 font-semibold'
                            : 'border-slate-700 bg-slate-800 text-slate-400'
                        }`}
                      >
                        {loc.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* If EN SEGUIMIENTO */}
            {result === 'en_seguimiento' && (
              <div className="mt-3 p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-[11px]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Programar Próximo Contacto</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Fecha de Próxima Llamada</label>
                    <input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Notas Rápidas</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ej. Interesado en cremación, llamar tarde"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* If VENTA CERRADA */}
            {result === 'venta_cerrada' && (
              <div className="mt-3 p-3 bg-emerald-950/30 border border-emerald-500/40 rounded-xl space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-emerald-300 font-bold text-xs">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>¡Cierre Exitoso de Contrato!</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Monto del Contrato ($ MXN) *</label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-emerald-400 absolute left-2.5 top-2.5" />
                    <input
                      type="number"
                      value={saleAmount}
                      onChange={(e) => setSaleAmount(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-emerald-500/50 rounded-lg pl-8 pr-3 py-2 text-sm font-bold text-emerald-300 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Referrals Section (1 to 5) */}
                <div className="pt-2 border-t border-emerald-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-emerald-300 flex items-center gap-1">
                      <UserPlus className="w-3.5 h-3.5" />
                      Referidos del Cliente (1 a 5)
                    </span>
                    {referrals.length < 5 && (
                      <button
                        type="button"
                        onClick={handleAddReferral}
                        className="text-[10px] bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 px-2 py-0.5 rounded font-medium"
                      >
                        + Agregar
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    {referrals.map((ref, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 w-4 font-mono">#{idx + 1}</span>
                        <input
                          type="text"
                          placeholder="Nombre del referido"
                          value={ref.name}
                          onChange={(e) => handleUpdateReferral(idx, 'name', e.target.value)}
                          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                        <input
                          type="tel"
                          placeholder="Teléfono 10 dig."
                          value={ref.phone}
                          onChange={(e) => handleUpdateReferral(idx, 'phone', e.target.value)}
                          className="w-28 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                        {referrals.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveReferral(idx)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* If DESCARTADO */}
            {result === 'descartado' && (
              <div className="mt-3 p-3 bg-rose-950/20 border border-rose-500/30 rounded-xl space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5 text-rose-300 font-semibold text-[11px]">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Seleccionar Objeción Principal</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {[
                    { id: 'precio', label: 'Precio / Presupuesto' },
                    { id: 'postergacion', label: 'Postergación / Pensarlo' },
                    { id: 'competencia', label: 'Competencia / Ya tiene' },
                    { id: 'decision_familiar', label: 'Decisión Familiar / Cónyuge' },
                    { id: 'ninguna', label: 'Ninguna / Sin interés' }
                  ].map((obj) => (
                    <button
                      type="button"
                      key={obj.id}
                      onClick={() => setObjection(obj.id as ObjectionType)}
                      className={`py-1.5 px-2 rounded-lg border text-left text-xs ${
                        objection === obj.id
                          ? 'border-rose-400 bg-rose-500/20 text-rose-200 font-semibold'
                          : 'border-slate-700 bg-slate-800 text-slate-400'
                      }`}
                    >
                      {obj.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-2 sticky bottom-0 bg-slate-900 pb-1">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-slate-950 font-bold py-3 px-4 rounded-xl shadow-lg shadow-amber-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider font-serif"
            >
              <CheckCircle2 className="w-5 h-5" />
              Guardar en Bitácora
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
