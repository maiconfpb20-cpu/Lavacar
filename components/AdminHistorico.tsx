
import React, { useState } from 'react';
import { Booking } from '../types';
import { Search, FileText, Calendar, Filter } from 'lucide-react';

interface AdminHistoricoProps {
  bookings: Booking[];
}

const AdminHistorico: React.FC<AdminHistoricoProps> = ({ bookings }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const history = bookings.filter(b => b.status === 'Concluído' || b.status === 'Cancelado');

  const filteredHistory = history.filter(b => 
    b.plate.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Histórico</h2>
          <p className="text-blue-600 text-sm font-bold tracking-widest uppercase mt-1">Relatório Geral de Atividades</p>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            className="bg-white border-2 border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-sm text-slate-900 font-bold focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 outline-none w-80" 
            placeholder="Buscar por placa ou cliente..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data / Hora</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Veículo</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Serviço</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredHistory.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-slate-300 font-bold uppercase tracking-widest">Nenhum registro encontrado</td>
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
                    <p className="text-xs font-bold text-slate-600">{v.service}</p>
                  </td>
                  <td className="px-6 py-5 font-black text-slate-800 text-sm">R$ {v.price.toFixed(2)}</td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${v.status === 'Concluído' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                      {v.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminHistorico;
