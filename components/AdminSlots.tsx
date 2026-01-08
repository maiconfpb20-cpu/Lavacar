
import React, { useState } from 'react';
import { Calendar, Clock, Plus, Trash2, CalendarCheck } from 'lucide-react';
import { AvailableSlot } from '../types';

interface AdminSlotsProps {
  slots: AvailableSlot[];
  onAddSlot: (date: string, time: string) => void;
  onRemoveSlot: (id: string) => void;
}

const AdminSlots: React.FC<AdminSlotsProps> = ({ slots, onAddSlot, onRemoveSlot }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) return;
    onAddSlot(date, time);
    setTime('');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10">
        <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Configuração de Horários</h2>
        <p className="text-blue-600 text-sm font-bold tracking-widest uppercase mt-1">Gerencie a agenda disponível para os clientes</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário de Adição */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Plus className="text-blue-600" size={20} />
              Adicionar Horário
            </h3>
            
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Data</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl pl-10 pr-4 py-3 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Horário</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl pl-10 pr-4 py-3 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
            >
              Liberar Horário
            </button>
          </form>
        </div>

        {/* Lista de Horários */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Horários Ativos no Portal</h3>
              <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                {slots.length} Disponíveis
              </span>
            </div>
            
            <div className="max-h-[500px] overflow-y-auto">
              {slots.length === 0 ? (
                <div className="p-20 text-center flex flex-col items-center gap-4">
                  <CalendarCheck className="text-slate-200" size={64} />
                  <p className="text-slate-400 font-medium">Nenhum horário liberado.<br/>Clientes não conseguirão agendar.</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 sticky top-0">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Horário</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {slots.sort((a,b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)).map((slot) => (
                      <tr key={slot.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-700">
                          {new Date(slot.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 font-bold text-blue-600">
                          {slot.time}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => onRemoveSlot(slot.id)}
                            className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSlots;
