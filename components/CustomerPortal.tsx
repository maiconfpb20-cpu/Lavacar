
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Calendar, Clock, Car, User, Phone, CheckCircle, Droplets, 
  Lock, AlertCircle, ChevronRight, PlusCircle, FileText, 
  ChevronDown, Search, Tag, Info, Sun, Sunset, AlertTriangle, Sparkles
} from 'lucide-react';
import { Booking, AvailableSlot, VehicleCategory, VEHICLE_DATABASE, BRANDS } from '../types';

interface CustomerPortalProps {
  onAddBooking: (booking: Omit<Booking, 'id' | 'status' | 'createdAt'>) => void;
  onGoToLogin: () => void;
  availableSlots: AvailableSlot[];
}

const CATEGORY_PRICES: Record<VehicleCategory, { completa: number; interna: number }> = {
  'SUV': { completa: 85, interna: 40 },
  'CAMINHONETE': { completa: 100, interna: 50 },
  'SEDA': { completa: 75, interna: 35 },
  'Hatch': { completa: 65, interna: 30 },
  'Moto': { completa: 45, interna: 20 },
};

const CATEGORIES: { id: VehicleCategory; label: string; icon: string }[] = [
  { id: 'Moto', label: 'Moto', icon: '🏍️' },
  { id: 'Hatch', label: 'Hatch', icon: '🚗' },
  { id: 'SEDA', label: 'Sedã', icon: '🚘' },
  { id: 'SUV', label: 'SUV', icon: '🚙' },
  { id: 'CAMINHONETE', label: 'Pick-up', icon: '🛻' },
];

const QUICK_OBS = [
  "Muitos pelos de pet",
  "Rodas muito encardidas",
  "Sujeira de barro/lama",
  "Odor de cigarro",
  "Adesivos para remover",
  "Cuidado com pintura"
];

const CustomerPortal: React.FC<CustomerPortalProps> = ({ onAddBooking, onGoToLogin, availableSlots }) => {
  const [step, setStep] = useState(1);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isBrandOpen, setIsBrandOpen] = useState(false);
  const [isModelOpen, setIsModelOpen] = useState(false);
  
  const [brandSearch, setBrandSearch] = useState('');
  const [modelSearch, setModelSearch] = useState('');

  const categoryRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    carBrand: '',
    carModel: '',
    category: '' as VehicleCategory | '',
    plate: '',
    condition: '',
    dirtLevel: 'Normal' as 'Leve' | 'Normal' | 'Pesada',
    service: '',
    basePrice: 0,
    date: '',
    time: '',
    hasCera: false
  });

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [formData.condition]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) setIsCategoryOpen(false);
      if (brandRef.current && !brandRef.current.contains(event.target as Node)) setIsBrandOpen(false);
      if (modelRef.current && !modelRef.current.contains(event.target as Node)) setIsModelOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const finalPrice = useMemo(() => {
    if (!formData.service || !formData.category) return 0;
    let total = formData.basePrice;
    if (formData.hasCera) total += 15;
    if (formData.dirtLevel === 'Pesada') total += 20; 
    return total;
  }, [formData.basePrice, formData.service, formData.category, formData.hasCera, formData.dirtLevel]);

  const slotsByDate = useMemo(() => {
    const map: Record<string, string[]> = {};
    availableSlots.forEach(slot => {
      if (!map[slot.date]) map[slot.date] = [];
      map[slot.date].push(slot.time);
    });
    return map;
  }, [availableSlots]);

  const availableDates = Object.keys(slotsByDate).sort();

  const filteredBrands = useMemo(() => {
    return BRANDS.filter(b => b.toLowerCase().includes(brandSearch.toLowerCase()));
  }, [brandSearch]);

  const filteredModels = useMemo(() => {
    if (!formData.carBrand) return [];
    const models = VEHICLE_DATABASE[formData.carBrand] || [];
    return models.filter(m => m.toLowerCase().includes(modelSearch.toLowerCase()));
  }, [formData.carBrand, modelSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.time || !formData.category || !formData.condition) return;
    
    const fullService = formData.hasCera ? `${formData.service} (+ Cera)` : formData.service;
    const { basePrice, hasCera, dirtLevel, ...rest } = formData;
    
    onAddBooking({ 
      ...rest, 
      category: formData.category as VehicleCategory, 
      service: fullService,
      condition: `[Nível: ${dirtLevel}] ${formData.condition}`,
      price: finalPrice 
    });

    const businessPhone = "5541992734041";
    const formattedDate = new Date(formData.date + 'T00:00:00').toLocaleDateString('pt-BR');
    
    const message = `Olá! Acabei de realizar um agendamento pelo portal. Seguem os detalhes:

📋 *DADOS DO AGENDAMENTO*
👤 *Cliente:* ${formData.customerName}
📱 *WhatsApp:* ${formData.phone}
🚗 *Veículo:* ${formData.carBrand} ${formData.carModel} (${formData.category})
🔢 *Placa:* ${formData.plate.toUpperCase()}
📦 *Serviço:* ${fullService}
🧼 *Nível de Sujeira:* ${formData.dirtLevel}
📅 *Data:* ${formattedDate}
⏰ *Horário:* ${formData.time}
💰 *Valor Total:* R$ ${finalPrice.toFixed(2)}

📝 *Observações:* ${formData.condition}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${businessPhone}&text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    setStep(4);
  };

  const selectCategory = (cat: VehicleCategory) => {
    let newBasePrice = 0;
    if (formData.service) {
      const type = formData.service.includes('COMPLETA') ? 'completa' : 'interna';
      newBasePrice = CATEGORY_PRICES[cat][type];
    }
    setFormData({ ...formData, category: cat, basePrice: newBasePrice });
    setIsCategoryOpen(false);
  };

  const selectBrand = (brand: string) => {
    setFormData({ ...formData, carBrand: brand, carModel: '' });
    setIsBrandOpen(false);
    setBrandSearch('');
  };

  const selectModel = (model: string) => {
    setFormData({ ...formData, carModel: model });
    setIsModelOpen(false);
    setModelSearch('');
  };

  const selectService = (name: string, price: number) => {
    setFormData({ ...formData, service: name, basePrice: price });
  };

  const addQuickObs = (obs: string) => {
    setFormData(prev => ({
      ...prev,
      condition: prev.condition ? `${prev.condition}, ${obs}` : obs
    }));
  };

  const isToday = (dateStr: string) => dateStr === new Date().toISOString().split('T')[0];
  const isTomorrow = (dateStr: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return dateStr === tomorrow.toISOString().split('T')[0];
  };

  const getDayDetails = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return {
      day: date.getDate().toString().padStart(2, '0'),
      weekday: date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase(),
      month: date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase(),
    };
  };

  if (step === 4) {
    return (
      <div className="h-screen w-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500 overflow-y-auto custom-scrollbar">
        <div className="bg-emerald-100 text-emerald-600 p-6 rounded-full mb-6">
          <CheckCircle size={64} />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Agendamento Realizado!</h2>
        <p className="text-slate-500 mb-4 max-w-md">
          Obrigado, {formData.customerName.split(' ')[0]}! Abrimos o seu WhatsApp para que você possa nos enviar os detalhes do serviço.
        </p>
        <p className="text-slate-400 text-xs mb-8 uppercase font-bold tracking-widest">Aguardamos você no horário marcado!</p>
        <button onClick={() => { setFormData({ ...formData, date: '', time: '', carBrand: '', carModel: '', plate: '', condition: '', service: '', basePrice: 0, category: '', hasCera: false }); setStep(1); }} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">Novo Agendamento</button>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-slate-50 flex flex-col overflow-y-auto custom-scrollbar">
      <header className="bg-white border-b p-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
             <Droplets className="text-white" size={20} />
          </div>
          <span className="font-bold text-slate-800 tracking-tight">LavaCar Pro <span className="text-blue-600 text-[10px] font-black px-2 py-0.5 bg-blue-50 rounded-full ml-1 uppercase">Portal</span></span>
        </div>
        <button onClick={onGoToLogin} className="flex items-center gap-2 bg-slate-50 text-slate-400 hover:text-slate-600 px-4 py-2 rounded-xl text-[10px] uppercase font-black tracking-widest transition-colors">
          <Lock size={12} /> Painel Administrativo
        </button>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full p-6 py-10">
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Agende sua Lavagem</h1>
          <p className="text-slate-500 mt-1 font-medium">Estética automotiva profissional na ponta dos dedos.</p>
        </div>

        {availableSlots.length === 0 ? (
          <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-slate-100 text-center flex flex-col items-center gap-4">
            <AlertCircle className="text-orange-400" size={48} />
            <h3 className="text-xl font-bold text-slate-800">Agenda Temporariamente Indisponível</h3>
            <p className="text-slate-500 max-w-sm">No momento não temos horários vagos. Fique atento às nossas atualizações!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8 pb-40">
            {/* Passo 1: Tipo de Veículo */}
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative" ref={categoryRef}>
              <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-blue-500/20">1</div>
                Tipo de Veículo
              </h3>
              <div className="relative">
                <button type="button" onClick={() => setIsCategoryOpen(!isCategoryOpen)} className={`w-full flex items-center justify-between p-4 bg-slate-50 border-2 rounded-2xl transition-all ${isCategoryOpen ? 'border-blue-600 bg-white ring-4 ring-blue-500/5' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-3">
                    {formData.category ? (
                      <><span className="text-2xl">{CATEGORIES.find(c => c.id === formData.category)?.icon}</span><span className="text-sm font-black text-slate-800 uppercase tracking-tight">{CATEGORIES.find(c => c.id === formData.category)?.label}</span></>
                    ) : (
                      <><div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400"><Car size={18} /></div><span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Selecione o tipo...</span></>
                    )}
                  </div>
                  <ChevronDown className={`text-slate-400 transition-transform duration-300 ${isCategoryOpen ? 'rotate-180 text-blue-600' : ''}`} size={20} />
                </button>
                {isCategoryOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 shadow-2xl rounded-2xl z-50 overflow-hidden">
                    <div className="max-h-60 overflow-y-auto py-2 custom-scrollbar">
                      {CATEGORIES.map((cat) => (
                        <button key={cat.id} type="button" onClick={() => selectCategory(cat.id)} className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-blue-50 ${formData.category === cat.id ? 'bg-blue-50/50' : ''}`}>
                          <span className="text-2xl">{cat.icon}</span>
                          <div className="flex-1">
                            <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{cat.label}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Base: R$ {CATEGORY_PRICES[cat.id].interna.toFixed(2)}</p>
                          </div>
                          {formData.category === cat.id && <CheckCircle className="text-blue-600" size={18} />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Passo 2: Dados do Veículo */}
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-blue-500/20">2</div>
                Dados do Veículo
              </h3>
              <div className="space-y-5">
                <div className="relative" ref={brandRef}>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 block">Marca do Fabricante</label>
                  <button type="button" onClick={() => setIsBrandOpen(!isBrandOpen)} className={`w-full flex items-center justify-between p-4 bg-slate-50 border-2 rounded-2xl transition-all ${isBrandOpen ? 'border-blue-600 bg-white shadow-lg' : 'border-slate-100'}`}>
                    <div className="flex items-center gap-3"><Tag size={18} className={formData.carBrand ? "text-blue-600" : "text-slate-400"} /><span className={`text-sm font-black uppercase tracking-tight ${formData.carBrand ? "text-slate-800" : "text-slate-400"}`}>{formData.carBrand || "Escolha a Marca"}</span></div>
                    <ChevronDown size={20} className="text-slate-400" />
                  </button>
                  {isBrandOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 shadow-2xl rounded-2xl z-50 overflow-hidden">
                      <div className="p-3 border-b border-slate-50 flex items-center gap-2"><Search size={16} className="text-slate-400" /><input autoFocus className="w-full bg-transparent border-none text-sm font-bold p-1 outline-none text-slate-900" placeholder="Pesquisar marca..." value={brandSearch} onChange={e => setBrandSearch(e.target.value)} /></div>
                      <div className="max-h-60 overflow-y-auto py-1 custom-scrollbar">{filteredBrands.map(brand => (<button key={brand} type="button" onClick={() => selectBrand(brand)} className="w-full px-5 py-3 text-left hover:bg-blue-50 text-sm font-bold text-slate-600 transition-colors flex justify-between items-center">{brand}{formData.carBrand === brand && <CheckCircle size={14} className="text-blue-600" />}</button>))}</div>
                    </div>
                  )}
                </div>
                <div className={`relative ${!formData.carBrand ? 'opacity-50 grayscale pointer-events-none' : ''}`} ref={modelRef}>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 block">Modelo do Veículo</label>
                  <button type="button" onClick={() => setIsModelOpen(!isModelOpen)} className={`w-full flex items-center justify-between p-4 bg-slate-50 border-2 rounded-2xl transition-all ${isModelOpen ? 'border-blue-600 bg-white shadow-lg' : 'border-slate-100'}`}>
                    <div className="flex items-center gap-3"><Car size={18} className={formData.carModel ? "text-blue-600" : "text-slate-400"} /><span className={`text-sm font-black uppercase tracking-tight ${formData.carModel ? "text-slate-800" : "text-slate-400"}`}>{formData.carModel || "Escolha o Modelo"}</span></div>
                    <ChevronDown size={20} className="text-slate-400" />
                  </button>
                  {isModelOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 shadow-2xl rounded-2xl z-50 overflow-hidden">
                      <div className="p-3 border-b border-slate-50 flex items-center gap-2"><Search size={16} className="text-slate-400" /><input autoFocus className="w-full bg-transparent border-none text-sm font-bold p-1 outline-none text-slate-900" placeholder="Pesquisar modelo..." value={modelSearch} onChange={e => setModelSearch(e.target.value)} /></div>
                      <div className="max-h-60 overflow-y-auto py-1 custom-scrollbar">{filteredModels.map(model => (<button key={model} type="button" onClick={() => selectModel(model)} className="w-full px-5 py-3 text-left hover:bg-blue-50 text-sm font-bold text-slate-600 transition-colors flex justify-between items-center">{model}{formData.carModel === model && <CheckCircle size={14} className="text-blue-600" />}</button>))}</div>
                    </div>
                  )}
                </div>
                <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Placa</label><input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-black text-slate-900 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all uppercase tracking-widest" placeholder="ABC-1234" value={formData.plate} onChange={e => setFormData({...formData, plate: e.target.value})} /></div>
              </div>
            </section>

            {/* Passo 3: Escolha o Serviço */}
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-blue-500/20">3</div>
                Serviço Desejado
              </h3>
              {!formData.category ? (
                <div className="p-10 bg-blue-50/50 rounded-2xl flex flex-col items-center text-center gap-3 border-2 border-dashed border-blue-100"><div className="bg-white p-3 rounded-full text-blue-400 shadow-sm"><Info size={24} /></div><p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Defina o tipo do veículo acima</p></div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button type="button" onClick={() => selectService('LAVAGEM COMPLETA', CATEGORY_PRICES[formData.category as VehicleCategory].completa)} className={`p-5 rounded-2xl border-2 text-left transition-all ${formData.service.includes('COMPLETA') ? 'border-blue-600 bg-blue-50/50 shadow-lg scale-[1.02]' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}><p className="font-black text-slate-800 text-sm uppercase">Lavagem Completa</p><p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter mt-0.5">Interna + Externa</p><div className="mt-4 flex items-center justify-between"><p className="text-blue-600 font-black text-lg">R$ {CATEGORY_PRICES[formData.category as VehicleCategory].completa.toFixed(2)}</p>{formData.service.includes('COMPLETA') && <CheckCircle size={20} className="text-blue-600" />}</div></button>
                    <button type="button" onClick={() => selectService('LIMPEZA INTERNA', CATEGORY_PRICES[formData.category as VehicleCategory].interna)} className={`p-5 rounded-2xl border-2 text-left transition-all ${formData.service.includes('INTERNA') ? 'border-blue-600 bg-blue-50/50 shadow-lg scale-[1.02]' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}><p className="font-black text-slate-800 text-sm uppercase">Limpeza Interna</p><p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter mt-0.5">Apenas Interior</p><div className="mt-4 flex items-center justify-between"><p className="text-blue-600 font-black text-lg">R$ {CATEGORY_PRICES[formData.category as VehicleCategory].interna.toFixed(2)}</p>{formData.service.includes('INTERNA') && <CheckCircle size={20} className="text-blue-600" />}</div></button>
                  </div>
                  <button type="button" onClick={() => setFormData({...formData, hasCera: !formData.hasCera})} className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${formData.hasCera ? 'border-emerald-500 bg-emerald-50 shadow-md' : 'border-slate-100 bg-slate-50'}`}><div className="flex items-center gap-3"><PlusCircle className={formData.hasCera ? 'text-emerald-600' : 'text-slate-400'} size={24} /><span className="text-sm font-black text-slate-700 uppercase tracking-tight">Cera Protetora (+ R$ 15,00)</span></div>{formData.hasCera && <CheckCircle size={20} className="text-emerald-600" />}</button>
                </div>
              )}
            </section>

            {/* Passo 4: Estado do Veículo (OBRIGATÓRIO) */}
            <section className={`bg-white p-6 rounded-3xl shadow-sm border transition-all ${!formData.condition ? 'border-orange-400 bg-orange-50/20' : 'border-slate-100'}`}>
              <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-blue-500/20">4</div>
                Situação do Veículo <span className="text-red-500 ml-1">*</span>
              </h3>

              <div className="space-y-6">
                <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-2xl flex items-start gap-4">
                  <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
                    <AlertTriangle size={24} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black text-amber-800 uppercase tracking-tight">Atenção ao Descrever</p>
                    <p className="text-[10px] font-bold text-amber-700 leading-tight">
                      Não oculte informações sobre o estado do veículo. Caso o carro apresente condições diferentes da descrição no momento da lavagem, <span className="underline decoration-amber-400 decoration-2">o valor final poderá ser reajustado</span>.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nível de Sujeira</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'Leve', icon: <Sparkles size={16} />, label: 'Baixa', color: 'blue' },
                      { id: 'Normal', icon: <Droplets size={16} />, label: 'Média', color: 'orange' },
                      { id: 'Pesada', icon: <AlertTriangle size={16} />, label: 'Crítica', color: 'red' }
                    ].map((level) => (
                      <button 
                        key={level.id}
                        type="button" 
                        onClick={() => setFormData({...formData, dirtLevel: level.id as any})}
                        className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all ${
                          formData.dirtLevel === level.id 
                          ? `border-${level.color}-500 bg-${level.color}-50 text-${level.color}-600 shadow-sm` 
                          : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                        }`}
                      >
                        {level.icon}
                        <span className="text-[10px] font-black uppercase tracking-widest">{level.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <FileText className="absolute left-4 top-4 text-slate-400" size={18} />
                    <textarea 
                      required
                      ref={textareaRef}
                      rows={3}
                      className={`w-full bg-white border-2 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none resize-none ${!formData.condition ? 'border-orange-400 ring-4 ring-orange-500/5' : 'border-slate-100 focus:border-blue-600'}`} 
                      placeholder="Descreva detalhes como arranhões, manchas ou se o carro está muito encardido..." 
                      value={formData.condition} 
                      onChange={e => setFormData({...formData, condition: e.target.value})} 
                    />
                    {!formData.condition && (
                      <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest mt-2 ml-1 animate-pulse flex items-center gap-1">
                        <AlertCircle size={10} /> Campo Obrigatório: Descreva a situação real do veículo.
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {QUICK_OBS.map(obs => (
                      <button 
                        key={obs}
                        type="button"
                        onClick={() => addQuickObs(obs)}
                        className="text-[9px] font-black uppercase tracking-tight bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full hover:bg-blue-600 hover:text-white transition-all"
                      >
                        + {obs}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Passo 5: Agenda Inteligente */}
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-5"><div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-blue-500/20">5</div>Escolha o Melhor Horário</h3>
              <div className="space-y-8">
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2 custom-scrollbar">
                  {availableDates.map(dateStr => {
                    const { day, weekday, month } = getDayDetails(dateStr);
                    const selected = formData.date === dateStr;
                    return (
                      <button key={dateStr} type="button" onClick={() => setFormData({...formData, date: dateStr, time: ''})} className={`flex-shrink-0 w-20 flex flex-col items-center py-4 rounded-3xl border-2 transition-all duration-300 ${selected ? 'border-blue-600 bg-blue-600 text-white shadow-xl scale-[1.05]' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'}`}>
                        <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${selected ? 'text-white/70' : 'text-slate-400'}`}>{month}</span>
                        <span className="text-2xl font-black mb-1">{day}</span>
                        <span className={`text-[10px] font-black tracking-widest ${selected ? 'text-white' : 'text-slate-500'}`}>{weekday}</span>
                        {(isToday(dateStr) || isTomorrow(dateStr)) && (<span className={`mt-2 text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${selected ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'}`}>{isToday(dateStr) ? 'Hoje' : 'Amanhã'}</span>)}
                      </button>
                    );
                  })}
                </div>
                {formData.date ? (
                  <div className="space-y-6">
                    {slotsByDate[formData.date].some(t => parseInt(t) < 12) && (
                      <div className="space-y-3"><div className="flex items-center gap-2 text-slate-400"><Sun size={14} className="text-orange-400" /><span className="text-[10px] font-black uppercase tracking-widest">Manhã</span></div><div className="grid grid-cols-3 sm:grid-cols-4 gap-3">{slotsByDate[formData.date].filter(t => parseInt(t) < 12).sort().map(time => (<button key={time} type="button" onClick={() => setFormData({...formData, time})} className={`py-4 rounded-2xl text-xs font-black transition-all border-2 ${formData.time === time ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-50 bg-slate-50 text-slate-600'}`}>{time}</button>))}</div></div>
                    )}
                    {slotsByDate[formData.date].some(t => parseInt(t) >= 12) && (
                      <div className="space-y-3"><div className="flex items-center gap-2 text-slate-400"><Sunset size={14} className="text-blue-400" /><span className="text-[10px] font-black uppercase tracking-widest">Tarde</span></div><div className="grid grid-cols-3 sm:grid-cols-4 gap-3">{slotsByDate[formData.date].filter(t => parseInt(t) >= 12).sort().map(time => (<button key={time} type="button" onClick={() => setFormData({...formData, time})} className={`py-4 rounded-2xl text-xs font-black transition-all border-2 ${formData.time === time ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-50 bg-slate-50 text-slate-600'}`}>{time}</button>))}</div></div>
                    )}
                  </div>
                ) : (
                  <div className="p-10 bg-slate-50 rounded-2xl flex flex-col items-center gap-4 border-2 border-dashed border-slate-100"><Calendar className="text-slate-200" size={40} /><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selecione o dia acima</p></div>
                )}
              </div>
            </section>

            {/* Passo 6: Dados do Cliente */}
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-5"><div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-blue-500/20">6</div>Dados do Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Nome Completo</label><div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input required className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-5 py-4 text-sm font-black text-slate-900 focus:ring-4 focus:ring-blue-500/5 transition-all" placeholder="Ex: João Silva" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} /></div></div>
                <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">WhatsApp</label><div className="relative"><Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input required className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-5 py-4 text-sm font-black text-slate-900 focus:ring-4 focus:ring-blue-500/5 transition-all" placeholder="(00) 00000-0000" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div></div>
              </div>
            </section>

            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-2xl bg-white/80 backdrop-blur-xl p-5 rounded-[2.5rem] shadow-2xl border border-white/50 flex items-center justify-between gap-6 z-40">
              <div className="pl-3"><p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">Total Previsto</p><div className="flex items-baseline gap-1"><span className="text-blue-600 font-black text-lg">R$</span><p className="text-3xl font-black text-blue-600">{finalPrice.toFixed(2)}</p></div></div>
              <button type="submit" disabled={!formData.date || !formData.time || !formData.carModel || !formData.service || !formData.category || !formData.customerName || !formData.condition} className={`flex-1 sm:flex-none px-12 py-5 rounded-3xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${formData.date && formData.time && formData.carModel && formData.service && formData.category && formData.customerName && formData.condition ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-2xl shadow-blue-500/40 hover:-translate-y-1' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>AGENDAR AGORA <ChevronRight size={20} /></button>
            </div>
          </form>
        )}
      </main>
      <footer className="p-10 text-center text-slate-300 text-[10px] font-black uppercase tracking-[0.2em]">© 2025 LavaCar Pro • Gestão e Estética Profissional</footer>
    </div>
  );
};

export default CustomerPortal;
