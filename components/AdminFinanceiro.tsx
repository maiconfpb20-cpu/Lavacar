
import React from 'react';
import { Booking } from '../types';
import { DollarSign, TrendingUp, CreditCard, PieChart, ArrowUpRight } from 'lucide-react';

interface AdminFinanceiroProps {
  bookings: Booking[];
}

const AdminFinanceiro: React.FC<AdminFinanceiroProps> = ({ bookings }) => {
  const completed = bookings.filter(b => b.status === 'Concluído');
  const totalRevenue = completed.reduce((acc, b) => acc + b.price, 0);
  const ticketMedio = completed.length > 0 ? totalRevenue / completed.length : 0;
  
  const categoriesMap = new Map();
  completed.forEach(b => {
    categoriesMap.set(b.category, (categoriesMap.get(b.category) || 0) + b.price);
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10">
        <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Financeiro</h2>
        <p className="text-blue-600 text-sm font-bold tracking-widest uppercase mt-1">Gestão de Receita e Resultados</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div className="bg-[#0f172a] p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200 text-white relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Faturamento Total</p>
            <h3 className="text-4xl font-black tracking-tight mb-8">R$ {totalRevenue.toFixed(2)}</h3>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <ArrowUpRight size={16} /> 12% em relação ao mês anterior
            </div>
          </div>
          <DollarSign size={120} className="absolute -right-10 -bottom-10 text-white/5" />
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ticket Médio</p>
          <h3 className="text-4xl font-black text-slate-800 tracking-tight mb-8">R$ {ticketMedio.toFixed(2)}</h3>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-tight">Valor por veículo atendido</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Serviços Concluídos</p>
          <h3 className="text-4xl font-black text-blue-600 tracking-tight mb-8">{completed.length}</h3>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-tight">Total de entregas pagas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h4 className="font-black text-slate-800 uppercase tracking-tight mb-6">Receita por Categoria</h4>
          <div className="space-y-4">
            {Array.from(categoriesMap.entries()).map(([cat, val]) => (
              <div key={cat}>
                <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-2">
                  <span className="text-slate-500">{cat}</span>
                  <span className="text-slate-800">R$ {val.toFixed(2)}</span>
                </div>
                <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${(val / totalRevenue) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-emerald-50/50 p-8 rounded-[2.5rem] border border-emerald-100 shadow-sm flex flex-col justify-center items-center text-center">
          <TrendingUp size={48} className="text-emerald-500 mb-4" />
          <h4 className="text-xl font-black text-emerald-800 uppercase tracking-tight mb-2">Dica de Gestão</h4>
          <p className="text-emerald-600 text-sm font-medium leading-relaxed max-w-xs">
            A categoria que mais gera receita é sua prioridade. Considere promoções para aumentar o ticket médio de outras categorias.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminFinanceiro;
