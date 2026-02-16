
import React, { useState } from 'react';
import { Booking, VEHICLE_DATABASE, BRANDS, VehicleCategory, BookingStatus } from '../types';
import { 
  Search, FileText, Calendar, Filter, Plus, Edit3, Trash2, X, Save, 
  ChevronDown, Tag, User, Phone, DollarSign, Clock, Car, CheckCircle2 
} from 'lucide-react';

interface AdminHistoricoProps {
  bookings: Booking[];
  onUpdateBooking: (id: string, updates: Partial<Booking>) => void;
  onAddManualBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => void;
  onRemoveBooking: (id: string) => void;
}

const AdminHistorico: React.FC<AdminHistoricoProps> = ({ bookings, onUpdateBooking, onAddManualBooking, onRemoveBooking }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBrandOpen, setIsBrandOpen] = useState(false);
  const [brandSearch, setBrandSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    carBrand: '',
    carModel: '',
    category: '' as VehicleCategory | '',
    plate: '',
    service: 'LAVAGEM COMPLETA',
    price: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    status: 'Concluído' as BookingStatus
  });

  const history = bookings.filter(b => b.status === 'Concluído' || b.status === 'Cancelado');

  const filteredHistory = history
    .filter(b => 
      b.plate.toLowerCase().includes(searchTerm.toLowerCase()) || 
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime());

  const filteredBrands = BRANDS.filter(b => b.toLowerCase().includes(brandSearch.toLowerCase()));

  const handleOpenModal = (booking?: Booking) => {
    if (booking) {
      setEditingId(booking.id);
      setFormData({
        customerName: booking.customerName,
        phone: booking.phone,
        carBrand: booking.carBrand,
        carModel: booking.carModel,
        category: booking.category,
        plate: booking.plate,
        service: booking.service,
        price: booking.price.toString(),
        date: booking.date,
        time: booking.time,
        status: booking.status
      });
    } else {
      setEditingId(null);
      setFormData({
        customerName: '',
        phone: '',
        carBrand: '',
        carModel: '',
        category: '',
        plate: '',
        service: 'LAVAGEM COMPLETA',
        price: '',
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        status: 'Concluído'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.plate || !formData.category || !formData.price) return;

    const bookingData = {
      ...formData,
      category: formData.category as VehicleCategory,
      price: Number(formData.price)
    };

    if (editingId) {
      onUpdateBooking(editingId, bookingData);
    } else {
      onAddManualBooking(bookingData);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Histórico Geral</h2>
          <p className="text-blue-600 text-sm font-bold tracking-widest uppercase mt-1">Relatórios e Lançamentos Retroativos</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              className="bg-white border-2 border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-sm text-slate-900 font-bold focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 outline-none w-64 md:w-80 transition-all" 
              placeholder="Buscar por placa ou cliente..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95"
          >
            <Plus size={16} /> Lançamento Retroativo
          </button>
        </div>
      </header>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data / Hora</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Veículo / Placa</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Serviço</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-slate-300 font-bold uppercase tracking-widest">Nenhum registro encontrado</td>
                </tr>
              ) : (
                filteredHistory.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <p className="text-xs font-bold text-slate-700">{new Date(v.date + 'T00:00:00').toLocaleDateString()}</p>
                      <p className="text-[10px] text-slate-400 font-medium">às {v.time}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-black text-slate-800 uppercase">{v.carModel}</p>
                      <p className="text-[10px] font-black text-blue-600 tracking-widest">{v.plate}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-xs font-bold text-slate-600">{v.customerName}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-xs font-bold text-slate-500">{v.service}</p>
                    </td>
                    <td className="px-6 py-5 font-black text-slate-800 text-sm">R$ {v.price.toFixed(2)}</td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${v.status === 'Concluído' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleOpenModal(v)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="Editar Lançamento">
                          <Edit3 size={18} />
                        </button>
                        <button onClick={() => onRemoveBooking(v.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Excluir Registro">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE LANÇAMENTO / EDIÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <header className="bg-slate-900 p-6 flex items-center justify-between text-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  {editingId ? <Edit3 size={20} /> : <Plus size={20} />}
                </div>
                <div>
                  <h3 className="font-black uppercase tracking-tight text-lg">{editingId ? 'Editar Lavagem' : 'Lançamento Retroativo'}</h3>
                  <p className="text-xs text-white/70 font-bold uppercase tracking-widest">Informações Históricas</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X size={24} />
              </button>
            </header>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cliente</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input required className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-5 py-4 text-sm font-black text-slate-800" placeholder="Nome do Cliente" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input required className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-5 py-4 text-sm font-black text-slate-800" placeholder="(00) 00000-0000" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                </div>
                
                <div className="space-y-1.5 relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Marca</label>
                  <button type="button" onClick={() => setIsBrandOpen(!isBrandOpen)} className="w-full flex items-center justify-between p-4 bg-slate-50 border-none rounded-2xl text-left">
                    <span className="text-sm font-black uppercase text-slate-800">{formData.carBrand || "Selecione..."}</span>
                    <ChevronDown size={16} className="text-slate-400" />
                  </button>
                  {isBrandOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 shadow-2xl rounded-2xl z-50 overflow-hidden">
                      <div className="p-2 border-b border-slate-50 flex items-center gap-2">
                        <Search size={14} className="text-slate-400" />
                        <input className="w-full bg-transparent border-none text-xs font-bold p-1 outline-none" placeholder="Buscar..." value={brandSearch} onChange={e => setBrandSearch(e.target.value)} />
                      </div>
                      <div className="max-h-40 overflow-y-auto">
                        {filteredBrands.map(b => (
                          <button key={b} type="button" onClick={() => { setFormData({...formData, carBrand: b, carModel: ''}); setIsBrandOpen(false); }} className="w-full px-4 py-2 text-left hover:bg-blue-50 text-xs font-bold text-slate-600 uppercase">{b}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Modelo</label>
                  <input required className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-black text-slate-800" placeholder="Ex: Corolla" value={formData.carModel} onChange={e => setFormData({...formData, carModel: e.target.value})} />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Placa</label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input required className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-5 py-4 text-sm font-black text-slate-800 uppercase tracking-widest" placeholder="ABC1234" value={formData.plate} onChange={e => setFormData({...formData, plate: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoria</label>
                  <select required className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-black text-slate-800" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as VehicleCategory})}>
                    <option value="">Selecione...</option>
                    <option value="Hatch">Hatch</option>
                    <option value="SEDA">Sedã</option>
                    <option value="SUV">SUV</option>
                    <option value="CAMINHONETE">Pick-up</option>
                    <option value="Moto">Moto</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={18} className="text-slate-600" />
                  <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Data e Hora do Serviço</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data</label>
                    <input type="date" className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-black text-slate-800 shadow-sm" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Horário</label>
                    <input type="time" className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-black text-slate-800 shadow-sm" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign size={18} className="text-blue-600" />
                  <h4 className="text-[10px] font-black text-blue-800 uppercase tracking-widest">Serviço e Valor Final</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Serviço</label>
                    <input required className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-black text-slate-800 shadow-sm" placeholder="Ex: Lavagem Completa + Cera" value={formData.service} onChange={e => setFormData({...formData, service: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor Cobrado (R$)</label>
                    <input required type="number" step="0.01" className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-black text-slate-800 shadow-sm" placeholder="0.00" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                <Save size={20} /> {editingId ? 'Salvar Edição' : 'Registrar no Histórico'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHistorico;
