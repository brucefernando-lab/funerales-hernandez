import React, { useState, useMemo } from 'react';
import { 
  Building2, Calendar, DollarSign, Share2, Sparkles, Check, 
  ChevronRight, Phone, MessageSquare, Info, Filter, ArrowRight,
  ShieldCheck, Eye, Layers, Table, CheckCircle2, HeartHandshake, UserPlus
} from 'lucide-react';
import { 
  OFFICIAL_PRICE_CATALOG, 
  ChapelLocation, 
  OfficialPlan, 
  PaymentTerms 
} from '../data/officialPriceList';
import { formatCurrency } from '../services/metrics';

interface CotizadorViewProps {
  onSelectPlanToRegister?: (plan: OfficialPlan, chapelId: ChapelLocation, term?: PaymentTerms) => void;
}

export const CotizadorView: React.FC<CotizadorViewProps> = ({ onSelectPlanToRegister }) => {
  const [selectedChapelId, setSelectedChapelId] = useState<ChapelLocation>('constitucion');
  const [paymentFrequency, setPaymentFrequency] = useState<'semanal' | 'quincenal' | 'mensual' | 'contado'>('semanal');
  const [selectedTermMonths, setSelectedTermMonths] = useState<number | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'metalico' | 'cremacion' | 'madera'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTableView, setShowTableView] = useState(false);
  const [selectedPlanForDetail, setSelectedPlanForDetail] = useState<OfficialPlan | null>(null);

  // Active Chapel
  const activeChapel = useMemo(() => {
    return OFFICIAL_PRICE_CATALOG.find(c => c.id === selectedChapelId) || OFFICIAL_PRICE_CATALOG[0];
  }, [selectedChapelId]);

  // Filtered Plans
  const filteredPlans = useMemo(() => {
    return activeChapel.plans.filter(plan => {
      // Category match
      if (selectedCategory !== 'all' && plan.category !== selectedCategory) {
        return false;
      }
      // Term filter (if a specific term is selected and mode is not contado)
      if (selectedTermMonths !== 'all' && paymentFrequency !== 'contado') {
        const hasTerm = plan.terms.some(t => t.termMonths === selectedTermMonths);
        if (!hasTerm) return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          plan.name.toLowerCase().includes(q) ||
          plan.subtitle.toLowerCase().includes(q) ||
          plan.features.some(f => f.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [activeChapel, selectedCategory, selectedTermMonths, paymentFrequency, searchQuery]);

  // Helper to get payment amount for a plan
  const getDisplayRate = (plan: OfficialPlan) => {
    if (paymentFrequency === 'contado') {
      return {
        amount: plan.contado,
        label: 'Pago Único de Contado',
        termText: 'Entrega Inmediata de Póliza'
      };
    }

    // If specific term selected
    let matchingTerm: PaymentTerms | undefined;
    if (selectedTermMonths !== 'all') {
      matchingTerm = plan.terms.find(t => t.termMonths === selectedTermMonths);
    }

    // Default to promo term if exists, otherwise longest term (lowest payment)
    if (!matchingTerm) {
      const promoTerm = plan.terms.find(t => t.isPromo);
      matchingTerm = promoTerm || plan.terms[plan.terms.length - 1];
    }

    if (!matchingTerm) {
      return {
        amount: plan.contado,
        label: 'Contado',
        termText: 'Pago Único'
      };
    }

    let rate = matchingTerm.weekly;
    let label = 'Semanal';
    if (paymentFrequency === 'quincenal') {
      rate = matchingTerm.biweekly;
      label = 'Quincenal';
    } else if (paymentFrequency === 'mensual') {
      rate = matchingTerm.monthly;
      label = 'Mensual';
    }

    return {
      amount: rate,
      label: `Pago ${label}`,
      termText: `${matchingTerm.termMonths} Meses (Total: ${formatCurrency(matchingTerm.total)})`,
      matchingTerm
    };
  };

  // WhatsApp Share Message Generator
  const handleShareWhatsApp = (plan: OfficialPlan) => {
    const rateInfo = getDisplayRate(plan);
    const chapelName = activeChapel.name;

    const message = `🕊️ *FUNERALES HERNÁNDEZ* - Cotización Oficial
*Plan:* ${plan.name}
*Ubicación:* ${chapelName}
${plan.subtitle}

💰 *Inversión:*
${paymentFrequency === 'contado' 
  ? `• Precio de Contado: *${formatCurrency(plan.contado)} MXN*`
  : `• ${rateInfo.label}: *${formatCurrency(rateInfo.amount)} MXN*
• Plazo: ${rateInfo.termText}
• Opción de Contado: ${formatCurrency(plan.contado)} MXN`
}

✨ *Servicios Incluidos:*
${plan.features.map(f => `• ${f}`).join('\n')}

🔒 *Garantía Hernández:*
- Contrato 100% Transferible sin caducidad
- Atención y asesoría personalizada 24/7

Quedo a sus apreciables órdenes para brindarle toda la información y asegurar el bienestar de su familia.`;

    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-5 pb-24 text-slate-100">
      
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-2xl border border-slate-800 p-4 md:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Listas Oficiales Noviembre 2026
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">• 100% Transferibles</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white font-serif mt-1">
              Simulador y Catálogo de Planes
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-0.5">
              Presentación transparente para clientes en oficina, citas y visitas domiciliarias.
            </p>
          </div>

          {/* Toggle Table View vs Cards View (Desktop & Tablet) */}
          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              onClick={() => setShowTableView(!showTableView)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors shadow-sm"
              title="Alternar entre vista de tarjetas y tabla completa oficial"
            >
              {showTableView ? (
                <>
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>Ver Catálogo en Tarjetas</span>
                </>
              ) : (
                <>
                  <Table className="w-4 h-4 text-amber-400" />
                  <span>Ver Matriz de Precios Completa</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 1. Chapel Location Selector (3 Chapels) */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-amber-400" />
          <span>Seleccionar Capilla / Modalidad:</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {OFFICIAL_PRICE_CATALOG.map((chapel) => {
            const isSelected = selectedChapelId === chapel.id;
            return (
              <button
                key={chapel.id}
                onClick={() => setSelectedChapelId(chapel.id)}
                className={`p-3 rounded-xl text-left border transition-all duration-200 flex flex-col justify-between relative overflow-hidden ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30'
                    : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {chapel.badge}
                    </span>
                    <h3 className={`text-sm font-bold mt-1.5 font-serif ${isSelected ? 'text-amber-300' : 'text-white'}`}>
                      {chapel.shortName}
                    </h3>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {chapel.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Controls & Filtering Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 md:p-4 shadow-lg space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Frequency Selector (Semanal / Quincenal / Mensual / Contado) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            <span className="text-xs font-semibold text-slate-400 mr-1 shrink-0">Frecuencia:</span>
            {(['semanal', 'quincenal', 'mensual', 'contado'] as const).map((freq) => (
              <button
                key={freq}
                onClick={() => setPaymentFrequency(freq)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all shrink-0 ${
                  paymentFrequency === freq
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                    : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700'
                }`}
              >
                {freq === 'contado' ? '💵 De Contado' : freq}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            <span className="text-xs font-semibold text-slate-400 mr-1 shrink-0">Servicio:</span>
            {[
              { id: 'all', label: 'Todos' },
              { id: 'metalico', label: 'Metálico' },
              { id: 'cremacion', label: 'Cremación' },
              ...(selectedChapelId === 'bienestar' ? [{ id: 'madera', label: 'Madera' }] : [])
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-slate-700 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Term Filter (if not contado) */}
          {paymentFrequency !== 'contado' && (
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs font-semibold text-slate-400 mr-1">Plazo:</span>
              <select
                value={selectedTermMonths}
                onChange={(e) => setSelectedTermMonths(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="bg-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:border-amber-400"
              >
                <option value="all">Cualquier Plazo</option>
                <option value={12}>12 Meses</option>
                <option value={24}>24 Meses</option>
                <option value={36}>36 Meses</option>
                {selectedChapelId !== 'bienestar' && <option value={48}>48 Meses</option>}
                {selectedChapelId === 'dr_mier' && <option value={90}>★ 90 Meses (Promo $100)</option>}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* TABLE VIEW (Official Matrix View - ideal for Desktop & Auditing) */}
      {showTableView ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-4 py-3 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Table className="w-4 h-4 text-amber-400" />
              <span>Matriz Oficial: {activeChapel.name}</span>
            </h3>
            <span className="text-xs text-amber-400 font-medium">Noviembre 2026</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Tipo de Plan / Servicio</th>
                  <th className="px-3 py-3 text-right">Contado</th>
                  <th className="px-3 py-3 text-right">12 Meses</th>
                  <th className="px-3 py-3 text-right">24 Meses</th>
                  <th className="px-3 py-3 text-right">36 Meses</th>
                  {selectedChapelId !== 'bienestar' && <th className="px-3 py-3 text-right">48 Meses</th>}
                  {selectedChapelId === 'dr_mier' && (
                    <th className="px-3 py-3 text-right text-amber-400 font-bold bg-amber-500/10">
                      ★ Promo 90 Meses
                    </th>
                  )}
                  <th className="px-3 py-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {activeChapel.plans.map((plan) => {
                  const t12 = plan.terms.find(t => t.termMonths === 12);
                  const t24 = plan.terms.find(t => t.termMonths === 24);
                  const t36 = plan.terms.find(t => t.termMonths === 36);
                  const t48 = plan.terms.find(t => t.termMonths === 48);
                  const t90 = plan.terms.find(t => t.termMonths === 90);

                  const getCell = (t?: PaymentTerms) => {
                    if (!t) return <span className="text-slate-600">-</span>;
                    let val = t.weekly;
                    let freqLabel = 'sem';
                    if (paymentFrequency === 'quincenal') {
                      val = t.biweekly;
                      freqLabel = 'qna';
                    } else if (paymentFrequency === 'mensual') {
                      val = t.monthly;
                      freqLabel = 'mes';
                    }
                    return (
                      <div>
                        <div className="font-bold text-white">{formatCurrency(val)} <span className="text-[10px] font-normal text-slate-400">/{freqLabel}</span></div>
                        <div className="text-[10px] text-slate-500">{formatCurrency(t.total)}</div>
                      </div>
                    );
                  };

                  return (
                    <tr key={plan.id} className="hover:bg-slate-850/60 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-100 flex items-center gap-1.5">
                          {plan.isAnchor && <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                          <span>{plan.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">{plan.subtitle}</div>
                      </td>
                      <td className="px-3 py-3.5 text-right font-bold text-emerald-400">
                        {formatCurrency(plan.contado)}
                      </td>
                      <td className="px-3 py-3.5 text-right">{getCell(t12)}</td>
                      <td className="px-3 py-3.5 text-right">{getCell(t24)}</td>
                      <td className="px-3 py-3.5 text-right">{getCell(t36)}</td>
                      {selectedChapelId !== 'bienestar' && <td className="px-3 py-3.5 text-right">{getCell(t48)}</td>}
                      {selectedChapelId === 'dr_mier' && (
                        <td className="px-3 py-3.5 text-right bg-amber-500/5">
                          {t90 ? (
                            <div>
                              <div className="font-extrabold text-amber-300">
                                {formatCurrency(paymentFrequency === 'semanal' ? t90.weekly : paymentFrequency === 'quincenal' ? t90.biweekly : t90.monthly)}
                              </div>
                              <div className="text-[10px] text-amber-500 font-semibold">{formatCurrency(t90.total)}</div>
                            </div>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>
                      )}
                      <td className="px-3 py-3.5 text-center">
                        <button
                          onClick={() => handleShareWhatsApp(plan)}
                          className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 transition-colors"
                          title="Compartir por WhatsApp"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARDS VIEW (Responsive: 1 column on Mobile, 2 on Tablet, 3 on Desktop) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {filteredPlans.map((plan) => {
            const rateInfo = getDisplayRate(plan);
            const isAnchor = plan.isAnchor;
            const hasPromo = plan.terms.some(t => t.isPromo);

            return (
              <div
                key={plan.id}
                className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 ${
                  isAnchor
                    ? 'border-amber-500/50 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/30'
                    : 'border-slate-800 hover:border-slate-700 shadow-lg'
                }`}
              >
                {/* Top Badge Banner if Anchor or Promo */}
                {isAnchor && (
                  <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 px-3 py-1 text-[11px] font-extrabold tracking-wider uppercase text-center flex items-center justify-center gap-1.5 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Plan Recomendado • Mayor Valor Familiar</span>
                  </div>
                )}
                {hasPromo && !isAnchor && (
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3 py-1 text-[11px] font-extrabold tracking-wider uppercase text-center flex items-center justify-center gap-1 shadow-sm">
                    <span>★ Promoción Especial hasta 90 Meses</span>
                  </div>
                )}

                <div className="p-4 md:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Category & Status */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {plan.category === 'metalico' ? 'Ataúd Metálico' : plan.category === 'cremacion' ? 'Cremación' : 'Madera'}
                      </span>
                      <span className="text-[11px] font-medium text-emerald-400">
                        100% Transferible
                      </span>
                    </div>

                    {/* Plan Title */}
                    <h3 className="text-base md:text-lg font-bold text-white font-serif leading-tight">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {plan.subtitle}
                    </p>

                    {/* Prominent Price Display */}
                    <div className="my-4 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                      <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                        {rateInfo.label}
                      </div>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                          {formatCurrency(rateInfo.amount)}
                        </span>
                        <span className="text-xs text-slate-400">MXN</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                        <span>{rateInfo.termText}</span>
                        {paymentFrequency !== 'contado' && (
                          <span className="text-emerald-400 font-medium">
                            Contado: {formatCurrency(plan.contado)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Included Features Bullet Points */}
                    <div className="space-y-2 mb-4">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Servicios y Cobertura:
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {plan.features.slice(0, 4).map((f, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-2 leading-tight">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-3 border-t border-slate-800/80">
                    <div className="grid grid-cols-2 gap-2">
                      {/* WhatsApp Button */}
                      <button
                        onClick={() => handleShareWhatsApp(plan)}
                        className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold border border-emerald-500/40 transition-colors shadow-sm"
                        title="Enviar cotización preformateada al prospecto"
                      >
                        <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>WhatsApp</span>
                      </button>

                      {/* Detail Modal / All Terms Button */}
                      <button
                        onClick={() => setSelectedPlanForDetail(plan)}
                        className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
                        title="Ver desglose completo de plazos y letras"
                      >
                        <Info className="w-3.5 h-3.5 text-amber-400" />
                        <span>Ver Plazos</span>
                      </button>
                    </div>

                    {/* Register Sale / Lead with this plan */}
                    <button
                      onClick={() => {
                        if (onSelectPlanToRegister) {
                          onSelectPlanToRegister(plan, selectedChapelId, rateInfo.matchingTerm);
                        }
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-98"
                    >
                      <UserPlus className="w-4 h-4 stroke-[2.5]" />
                      <span>Registrar Prospecto con este Plan</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PLAN DETAIL & ALL TERMS BREAKDOWN MODAL */}
      {selectedPlanForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3.5 md:p-6 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  {activeChapel.shortName}
                </span>
                <h3 className="text-lg font-bold text-white font-serif mt-0.5">
                  {selectedPlanForDetail.name}
                </h3>
                <p className="text-xs text-slate-400">{selectedPlanForDetail.subtitle}</p>
              </div>
              <button
                onClick={() => setSelectedPlanForDetail(null)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Price Table for All Terms */}
            <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">Plazo</th>
                    <th className="p-2.5 text-right">Semanal</th>
                    <th className="p-2.5 text-right">Quincenal</th>
                    <th className="p-2.5 text-right">Mensual</th>
                    <th className="p-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  <tr className="bg-emerald-500/10 font-bold text-emerald-300">
                    <td className="p-2.5">Contado</td>
                    <td className="p-2.5 text-right">-</td>
                    <td className="p-2.5 text-right">-</td>
                    <td className="p-2.5 text-right">-</td>
                    <td className="p-2.5 text-right">{formatCurrency(selectedPlanForDetail.contado)}</td>
                  </tr>
                  {selectedPlanForDetail.terms.map((t) => (
                    <tr key={t.termMonths} className={t.isPromo ? 'bg-amber-500/10 font-bold text-amber-300' : 'hover:bg-slate-900'}>
                      <td className="p-2.5 flex items-center gap-1">
                        <span>{t.termMonths} Meses</span>
                        {t.isPromo && <span className="text-[9px] bg-amber-400 text-slate-950 px-1 rounded font-black">PROMO</span>}
                      </td>
                      <td className="p-2.5 text-right">{formatCurrency(t.weekly)}</td>
                      <td className="p-2.5 text-right">{formatCurrency(t.biweekly)}</td>
                      <td className="p-2.5 text-right">{formatCurrency(t.monthly)}</td>
                      <td className="p-2.5 text-right font-medium text-slate-400">{formatCurrency(t.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Features list */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Todo lo que incluye este plan:
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {selectedPlanForDetail.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => handleShareWhatsApp(selectedPlanForDetail)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-4 h-4" />
                <span>Compartir por WhatsApp</span>
              </button>
              <button
                onClick={() => setSelectedPlanForDetail(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
