
import React, { useState } from 'react';
import { Booking, BookingStatus } from '../types';
import { Calendar, Clock, Car, User, CheckCircle2, XCircle, AlertCircle, Search } from 'lucide-react';

interface AdminAgendamentosProps {
  bookings: Booking[];
  onUpdateStatus: (id: string, status: BookingStatus) => void;
}

const AdminAgendamentos: React.FC<AdminAgendamentosProps> = ({ bookings, onUpdateStatus }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusStyle = (status: BookingStatus) => {
    switch (status) {
      case 'Pendente': return 'bg-orange-100 text-orange-600';
      case 'Em Andamento': return 'bg-blue-100 text-blue-600';
      case 'Concluído': return 'bg-emerald-100 text-emerald-600';
      case 'Cancelado': return 'bg-red-100 text-red-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const filteredBookings = bookings.filter(b => 
    b.plate.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.carModel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Agendamentos</h2>
          <p className="text-blue-600 text-sm font-bold tracking-widest uppercase mt-1">Gestão de Solicitações</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              className="bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none w-64" 
              placeholder="Placa, cliente ou modelo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Cliente / Veículo</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Categoria</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Serviço</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Agendado</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                    Nenhum agendamento encontrado.
                  </td>
                </tr>
              ) : (
                filteredBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                          <User size={20} />
                        </div>
                        <div className="max-w-[200px]">
                          <p className="font-bold text-slate-800 leading-tight">{booking.customerName}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">
                            <Car size={12} /> {booking.carModel} • {booking.plate}
                          </div>
                          {booking.condition && (
                            <div className="flex items-center gap-1.5 text-[9px] text-orange-600 font-black uppercase tracking-tight mt-1.5 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100 w-fit">
                              <AlertCircle size={10} /> {booking.condition}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                       <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-1 rounded-md uppercase tracking-widest whitespace-nowrap">
                         {booking.category}
                       </span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-700 text-sm leading-tight">{booking.service}</p>
                      <p className="text-[11px] text-blue-600 font-black mt-1">R$ {booking.price.toFixed(2)}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col text-xs font-bold text-slate-600">
                        <span>{new Date(booking.date + 'T00:00:00').toLocaleDateString()}</span>
                        <span className="text-slate-400 font-medium">às {booking.time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${getStatusStyle(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {booking.status === 'Pendente' && (
                          <button 
                            onClick={() => onUpdateStatus(booking.id, 'Em Andamento')}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" 
                            title="Iniciar"
                          >
                            <AlertCircle size={18} />
                          </button>
                        )}
                        {booking.status === 'Em Andamento' && (
                          <button 
                            onClick={() => onUpdateStatus(booking.id, 'Concluído')}
                            className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors" 
                            title="Concluir"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                        )}
                        <button 
                          onClick={() => onUpdateStatus(booking.id, 'Cancelado')}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" 
                          title="Cancelar"
                        >
                          <XCircle size={18} />
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
    </div>
  );
};

export default AdminAgendamentos;
