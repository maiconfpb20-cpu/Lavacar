
import React, { useState } from 'react';
import { Client } from '../types';
import { Users, Phone, Star, UserPlus, X, Save, Car, Tag } from 'lucide-react';

interface AdminClientesProps {
  clients: Client[];
  onAddClient: (client: Omit<Client, 'id' | 'visitCount' | 'totalSpent' | 'createdAt'>) => void;
}

const AdminClientes: React.FC<AdminClientesProps> = ({ clients, onAddClient }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    preferredCar: '',
    preferredPlate: ''
  });

  const sortedCustomers = [...clients].sort((a, b) => b.totalSpent - a.totalSpent);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    onAddClient(formData);
    setFormData({ name: '', phone: '', preferredCar: '', preferredPlate: '' });
    setIsModalOpen(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Clientes</h2>
          <p className="text-blue-600 text-sm font-bold tracking-widest uppercase mt-1">Fidelidade e Cadastro</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
        >
          <UserPlus size={16} /> Novo Cliente
        </button>
      </header>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">WhatsApp</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Visitas</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Gasto Total</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Veículo Preferencial</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nível</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sortedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-300 font-bold uppercase tracking-widest">Nenhum cliente cadastrado</td>
                </tr>
              ) : (
                sortedCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <p className="font-black text-slate-800 uppercase text-sm tracking-tight">{c.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold">
                        {c.lastVisit ? `Último serviço em ${new Date(c.lastVisit + 'T00:00:00').toLocaleDateString()}` : 'Sem visitas registradas'}
                      </p>
                    </td>
                    <td className="px-6 py-5 font-bold text-slate-600 text-sm">{c.phone}</td>
                    <td className="px-6 py-5 text-center">
                      <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-black">{c.visitCount}x</span>
                    </td>
                    <td className="px-6 py-5 font-black text-slate-800 text-sm">R$ {c.totalSpent.toFixed(2)}</td>
                    <td className="px-6 py-5">
                       {c.preferredCar ? (
                         <div className="flex flex-col">
                           <span className="text-[10px] font-black text-slate-500 uppercase">{c.preferredCar}</span>
                           <span className="text-[9px] text-blue-500 font-black tracking-widest">{c.preferredPlate}</span>
                         </div>
                       ) : (
                         <span className="text-[10px] text-slate-300 font-bold italic">Não informado</span>
                       )}
                    </td>
                    <td className="px-6 py-5">
                      {c.visitCount >= 3 ? (
                        <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600 uppercase bg-emerald-50 px-2 py-1 rounded-full w-fit">
                          <Star size={10} fill="currentColor" /> Cliente VIP
                        </span>
                      ) : (
                        <span className="text-[9px] font-black text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded-full w-fit">
                          {c.visitCount > 0 ? 'Recorrente' : 'Novo Cadastro'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Adicionar Cliente */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <header className="bg-blue-600 p-6 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 className="font-black uppercase tracking-tight text-lg">Novo Cliente</h3>
                  <p className="text-xs text-white/70 font-bold uppercase tracking-widest">Cadastro Manual</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X size={24} />
              </button>
            </header>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      required 
                      className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-5 py-4 text-sm font-black text-slate-800 focus:ring-4 focus:ring-blue-500/5 transition-all" 
                      placeholder="Ex: Pedro Henrique"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telefone (WhatsApp)</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      required 
                      className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-5 py-4 text-sm font-black text-slate-800 focus:ring-4 focus:ring-blue-500/5 transition-all" 
                      placeholder="(00) 00000-0000"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center justify-between">
                      Carro <span className="text-[8px] opacity-50 italic">Opcional</span>
                    </label>
                    <div className="relative">
                      <Car className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-5 py-4 text-sm font-black text-slate-800 focus:ring-4 focus:ring-blue-500/5 transition-all" 
                        placeholder="Ex: Corolla"
                        value={formData.preferredCar}
                        onChange={e => setFormData({...formData, preferredCar: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center justify-between">
                      Placa <span className="text-[8px] opacity-50 italic">Opcional</span>
                    </label>
                    <div className="relative">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-5 py-4 text-sm font-black text-slate-800 focus:ring-4 focus:ring-blue-500/5 transition-all uppercase tracking-widest" 
                        placeholder="ABC1234"
                        value={formData.preferredPlate}
                        onChange={e => setFormData({...formData, preferredPlate: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                <Save size={20} /> Cadastrar Cliente
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClientes;
