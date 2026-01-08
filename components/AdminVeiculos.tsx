
import React from 'react';
import { Booking, VehicleCategory } from '../types';
import { Car, Search, TrendingUp, Info } from 'lucide-react';

interface AdminVeiculosProps {
  bookings: Booking[];
}

// Added interface for vehicle information to solve typing issues
interface VehicleInfo {
  plate: string;
  model: string;
  category: VehicleCategory;
  lastVisit: string;
  totalSpent: number;
  visitCount: number;
}

const AdminVeiculos: React.FC<AdminVeiculosProps> = ({ bookings }) => {
  // Obter veículos únicos
  // Explicitly typing the Map and uniqueVehicles array to fix "unknown" type errors
  const uniqueVehicles: VehicleInfo[] = Array.from(new Map<string, VehicleInfo>(bookings.map(b => [b.plate, {
    plate: b.plate,
    model: b.carModel,
    category: b.category,
    lastVisit: b.date,
    totalSpent: bookings.filter(x => x.plate === b.plate && x.status === 'Concluído').reduce((acc, curr) => acc + curr.price, 0),
    visitCount: bookings.filter(x => x.plate === b.plate).length
  }])).values());

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Veículos em Circulação</h2>
          <p className="text-blue-600 text-sm font-bold tracking-widest uppercase mt-1">Base de Dados de Frotas e Clientes</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input className="bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 min-w-[250px]" placeholder="Pesquisar por modelo ou placa..." />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-blue-50 p-3 rounded-2xl text-blue-600"><Car size={24} /></div>
            <TrendingUp size={20} className="text-emerald-500" />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total de Veículos</p>
          <p className="text-3xl font-black text-slate-800">{uniqueVehicles.length}</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-orange-50 p-3 rounded-2xl text-orange-600"><Info size={24} /></div>
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Mais Frequente</p>
          <p className="text-xl font-bold text-slate-800 truncate">
            {uniqueVehicles.sort((a,b) => b.visitCount - a.visitCount)[0]?.model || 'N/A'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-slate-100">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-50">
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Veículo / Placa</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoria</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Visitas</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ticket Total</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Última Visita</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {uniqueVehicles.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-slate-300">Nenhum veículo registrado na base.</td>
              </tr>
            ) : (
              uniqueVehicles.map((v) => (
                <tr key={v.plate} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <p className="font-bold text-slate-800">{v.model}</p>
                    <p className="text-xs text-blue-600 font-black uppercase tracking-widest">{v.plate}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100 uppercase">{v.category}</span>
                  </td>
                  <td className="px-6 py-5 font-bold text-slate-600">{v.visitCount}x</td>
                  <td className="px-6 py-5 font-black text-slate-800 text-sm">R$ {v.totalSpent.toFixed(2)}</td>
                  <td className="px-6 py-5 text-xs text-slate-500 font-medium">{new Date(v.lastVisit + 'T00:00:00').toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminVeiculos;
