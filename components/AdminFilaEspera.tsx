
import React, { useState, useEffect } from 'react';
import { Booking, BookingStatus, VEHICLE_DATABASE, BRANDS, VehicleCategory } from '../types';
import { 
  Clock, Play, CheckCircle, Car, User, AlertTriangle, 
  Plus, X, Save, Phone, Tag, Search, ChevronDown, MessageCircle, ExternalLink, Sparkles, Droplets, AlertCircle, DollarSign, Wrench
} from 'lucide-react';

interface AdminFilaEsperaProps {
  bookings: Booking[];
  onUpdateStatus: (id: string, status: BookingStatus) => void;
  onAddBooking: (booking: Omit<Booking, 'id' | 'status' | 'createdAt'>) => void;
}

const CATEGORY_PRICES: Record<VehicleCategory, { completa: number; interna: number }> = {
  'SUV': { completa: 85, interna: 40 },
  'CAMINHONETE': { completa: 100, interna: 50 },
  'SEDA': { completa: 75, interna: 35 },
  'Hatch': { completa: 65, interna: 30 },
  'Moto': { completa: 45, interna: 20 },
};

const AdminFilaEspera: React.FC<AdminFilaEsperaProps> = ({ bookings, onUpdateStatus, onAddBooking }) => {
  const activeBookings = bookings.filter(b => b.status === 'Pendente' || b.status === 'Em Andamento');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    carBrand: '',
    carModel: '',
    category: '' as VehicleCategory | '',
    plate: '',
    service: 'LAVAGEM COMPLETA',
    price: '',
    condition: '',
    dirtLevel: 'Normal' as 'Leve' | 'Normal' | 'Pesada',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  });

  const [isBrandOpen, setIsBrandOpen] = useState(false);
  const [brandSearch, setBrandSearch] = useState('');

  const filteredBrands = BRANDS.filter(b => b.toLowerCase().includes(brandSearch.toLowerCase()));

  // Sugerir preço quando mudar categoria ou serviço
  useEffect(() => {
    if (formData.category && formData.service) {
      const type = formData.service.includes('COMPLETA') ? 'completa' : 'interna';
      const suggestedPrice = CATEGORY_PRICES[formData.category as VehicleCategory][type];
      setFormData(prev => ({ ...prev, price: suggestedPrice.toString() }));
    }
  }, [formData.category, formData.service]);

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.plate || !formData.category || !formData.condition || !formData.price) return;
    
    onAddBooking({
      ...formData,
      category: formData.category as VehicleCategory,
      price: Number(formData.price),
      condition: `[Nível: ${formData.dirtLevel}] ${formData.condition}`
    });
    
    setIsModalOpen(false);
    setFormData({
      customerName: '',
      phone: '',
      carBrand: '',
      carModel: '',
      category: '',
      plate: '',
      service: 'LAVAGEM COMPLETA',
      price: '',
      condition: '',
      dirtLevel: 'Normal',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    });
  };

  const openWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const url = `https://api.whatsapp.com/send?phone=55${cleanPhone}`;
    window.open(url, '_blank');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Fila de Espera</h2>
          <p className="text-blue-600 text-sm font-bold tracking-widest uppercase mt-1">Gestão de Ordens de Serviço</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
        >
          <Plus size={16} /> Adicionar Lavagem
        </button>
      </header>

      {activeBookings.length === 0 ? (
        <div className="bg-white p-20 rounded-[2.5rem] border border-slate-100 text-center flex flex-col items-center gap-4">
          <Clock className="text-slate-200" size={64} />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Nenhuma O.S. Aberta</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeBookings.map((booking) => (
            <div key={booking.id} className={`bg-white rounded-[2.5rem] border-2 transition-all flex flex-col overflow-hidden ${booking.status === 'Em Andamento' ? 'border-blue-500 shadow-xl shadow-blue-500/10' : 'border-slate-100'}`}>
              <div className={`px-6 py-3 flex justify-between items-center ${booking.status === 'Em Andamento' ? 'bg-blue-500 text-white' : 'bg-slate-50 text-slate-400'}`}>
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">O.S. #{booking.id.slice(-4).toUpperCase()}</span>
                <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><Clock size={12} /> {booking.time}</span>
              </div>
              <div className="p-6 space-y-5 flex-1">
                <div className="space-y-1"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nome do Cliente</p><div className="flex items-center gap-2"><User size={16} className="text-blue-600" /><p className="text-sm font-black text-slate-800 uppercase tracking-tight">{booking.customerName}</p></div></div>
                <div className="space-y-1"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Carro</p><div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100"><Car size={20} className="text-slate-400" /><div><p className="text-xs font-black text-slate-800 uppercase">{booking.carModel}</p><p className="text-[10px] font-black text-blue-600 tracking-widest">{booking.plate}</p></div></div></div>
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Serviço</p><p className="text-xs font-bold text-slate-600 uppercase">{booking.service}</p></div>
                  <div className="space-y-1 text-right"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Valor</p><p className="text-sm font-black text-blue-600">R$ {booking.price.toFixed(2)}</p></div>
                </div>
                <div className="space-y-1"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">WhatsApp / Contato</p><button onClick={() => openWhatsApp(booking.phone)} className="w-full bg-emerald-50 text-emerald-600 p-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100 group"><MessageCircle size={16} /> {booking.phone} <ExternalLink size={12} className="opacity-50" /></button></div>
                {booking.condition && (
                  <div className={`p-3 rounded-2xl border flex items-start gap-2 ${booking.condition.includes('Pesada') ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'}`}>{booking.condition.includes('Pesada') ? <AlertTriangle className="text-red-500 mt-0.5" size={14} /> : <AlertTriangle className="text-orange-500 mt-0.5" size={14} />}<p className={`text-[10px] font-bold leading-tight ${booking.condition.includes('Pesada') ? 'text-red-700' : 'text-orange-700'}`}>{booking.condition}</p></div>
                )}
              </div>
              <div className="p-6 pt-0 flex gap-2">{booking.status === 'Pendente' ? (<button onClick={() => onUpdateStatus(booking.id, 'Em Andamento')} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"><Play size={16} /> Iniciar Lavagem</button>) : (<button onClick={() => onUpdateStatus(booking.id, 'Concluído')} className="flex-1 bg-emerald-500 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all"><CheckCircle size={16} /> Finalizar O.S.</button>)}</div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <header className="bg-blue-600 p-6 flex items-center justify-between text-white sticky top-0 z-10"><div className="flex items-center gap-3"><div className="p-2 bg-white/20 rounded-xl"><Plus size={20} /></div><div><h3 className="font-black uppercase tracking-tight text-lg">Nova Ordem de Serviço</h3><p className="text-xs text-white/70 font-bold uppercase tracking-widest">Entrada Direta na Fila</p></div></div><button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X size={24} /></button></header>
            <form onSubmit={handleManualAdd} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cliente</label><input required className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-black text-slate-800" placeholder="Nome do Cliente" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} /></div>
                <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp</label><input required className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-black text-slate-800" placeholder="(00) 00000-0000" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
                
                <div className="space-y-1.5 relative"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Marca</label><button type="button" onClick={() => setIsBrandOpen(!isBrandOpen)} className="w-full flex items-center justify-between p-4 bg-slate-50 border-none rounded-2xl text-left"><span className="text-sm font-black uppercase text-slate-800">{formData.carBrand || "Selecione..."}</span><ChevronDown size={16} className="text-slate-400" /></button>
                  {isBrandOpen && (<div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 shadow-2xl rounded-2xl z-50 overflow-hidden"><div className="p-2 border-b border-slate-50 flex items-center gap-2"><Search size={14} className="text-slate-400" /><input className="w-full bg-transparent border-none text-xs font-bold p-1 outline-none" placeholder="Buscar..." value={brandSearch} onChange={e => setBrandSearch(e.target.value)} /></div><div className="max-h-40 overflow-y-auto">{filteredBrands.map(b => (<button key={b} type="button" onClick={() => { setFormData({...formData, carBrand: b, carModel: ''}); setIsBrandOpen(false); }} className="w-full px-4 py-2 text-left hover:bg-blue-50 text-xs font-bold text-slate-600 uppercase">{b}</button>))}</div></div>)}
                </div>
                <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Modelo</label><input required className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-black text-slate-800" placeholder="Ex: Corolla" value={formData.carModel} onChange={e => setFormData({...formData, carModel: e.target.value})} /></div>
                
                <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Placa</label><input required className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-black text-slate-800 uppercase tracking-widest" placeholder="ABC1234" value={formData.plate} onChange={e => setFormData({...formData, plate: e.target.value})} /></div>
                <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoria</label><select required className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-black text-slate-800" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as VehicleCategory})}><option value="">Selecione...</option><option value="Hatch">Hatch</option><option value="SEDA">Sedã</option><option value="SUV">SUV</option><option value="CAMINHONETE">Pick-up</option><option value="Moto">Moto</option></select></div>
              </div>

              {/* Seção de Serviço e Preço Manual */}
              <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wrench size={18} className="text-blue-600" />
                  <h4 className="text-[10px] font-black text-blue-800 uppercase tracking-widest">Serviço e Valor</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Serviço</label>
                    <select 
                      className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-black text-slate-800 shadow-sm"
                      value={formData.service}
                      onChange={e => setFormData({...formData, service: e.target.value})}
                    >
                      <option value="LAVAGEM COMPLETA">LAVAGEM COMPLETA</option>
                      <option value="LIMPEZA INTERNA">LIMPEZA INTERNA</option>
                      <option value="POLIMENTO">POLIMENTO</option>
                      <option value="HIGIENIZAÇÃO">HIGIENIZAÇÃO</option>
                      <option value="OUTRO SERVIÇO">OUTRO SERVIÇO</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor Manual (R$)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600" size={18} />
                      <input 
                        required
                        type="number"
                        step="0.01"
                        className="w-full bg-white border-none rounded-2xl pl-12 pr-5 py-4 text-sm font-black text-slate-800 shadow-sm focus:ring-2 focus:ring-blue-600 transition-all"
                        placeholder="0.00"
                        value={formData.price}
                        onChange={e => setFormData({...formData, price: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Nível de Sujeira Manual */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nível de Sujeira <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'Leve', icon: <Sparkles size={16} />, label: 'Baixa', color: 'blue' },
                    { id: 'Normal', icon: <Droplets size={16} />, label: 'Média', color: 'orange' },
                    { id: 'Pesada', icon: <AlertTriangle size={16} />, label: 'Crítica', color: 'red' }
                  ].map((level) => (
                    <button key={level.id} type="button" onClick={() => setFormData({...formData, dirtLevel: level.id as any})} className={`flex flex-col items-center gap-2 py-3 rounded-2xl border-2 transition-all ${formData.dirtLevel === level.id ? `border-${level.color}-500 bg-${level.color}-50 text-${level.color}-600` : 'border-slate-50 bg-slate-50 text-slate-400'}`}>{level.icon}<span className="text-[10px] font-black uppercase">{level.label}</span></button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Situação / Observações <span className="text-red-500">*</span></label>
                <textarea required className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-blue-500/5 transition-all resize-none" rows={3} placeholder="Ex: Riscos na porta direita, bancos com manchas..." value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})} />
                {!formData.condition && <p className="text-[9px] font-black text-orange-600 uppercase mt-1 ml-1 flex items-center gap-1"><AlertCircle size={10} /> Preenchimento obrigatório da situação.</p>}
              </div>

              <button type="submit" disabled={!formData.condition || !formData.price} className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                <Save size={20} /> Emitir O.S.
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFilaEspera;
