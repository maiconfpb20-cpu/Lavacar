
import React from 'react';
import { Booking, Expense } from '../types';
import { DollarSign, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';

interface AdminFinanceiroProps {
  bookings: Booking[];
  expenses: Expense[];
}

const AdminFinanceiro: React.FC<AdminFinanceiroProps> = ({ bookings, expenses }) => {
  const completed = bookings.filter(b => b.status === 'Concluído');
  const totalRevenue = completed.reduce((acc, b) => acc + b.price, 0);
  
  // Gastos Efetivados (Pagos)
  const paidExpenses = expenses.filter(e => e.status === 'Pago').reduce((acc, b) => acc + b.amount, 0);
  
  // Contas a Pagar (Pendentes)
  const pendingExpenses = expenses.filter(e => e.status === 'Pendente').reduce((acc, b) => acc + b.amount, 0);
  
  const netProfit = totalRevenue - paidExpenses;
  
  const ticketMedio = completed.length > 0 ? totalRevenue / completed.length : 0;
  
  const categoriesMap = new Map();
  completed.forEach(b => {
    categoriesMap.set(b.category, (categoriesMap.get(b.category) || 0) + b.price);
  });

  const expenseCategoriesMap = new Map();
  expenses.forEach(e => {
    expenseCategoriesMap.set(e.category, (expenseCategoriesMap.get(e.category) || 0) + e.amount);
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10">
        <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Financeiro Geral</h2>
        <p className="text-blue-600 text-sm font-bold tracking-widest uppercase mt-1">Gestão de Receita e Resultados</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Entradas Brutas</p>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">R$ {totalRevenue.toFixed(2)}</h3>
            <div className="flex items-center gap-1 text-emerald-500 font-bold text-[9px] uppercase">
              <ArrowUpRight size={12} /> Serviços Concluídos
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gastos Efetivados</p>
            <h3 className="text-2xl font-black text-red-600 tracking-tight mb-2">R$ {paidExpenses.toFixed(2)}</h3>
            <div className="flex items-center gap-1 text-red-400 font-bold text-[9px] uppercase">
              <ArrowDownRight size={12} /> Saídas Pagas
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-orange-100 shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Contas a Pagar</p>
            <h3 className="text-2xl font-black text-orange-600 tracking-tight mb-2">R$ {pendingExpenses.toFixed(2)}</h3>
            <div className="flex items-center gap-1 text-orange-400 font-bold text-[9px] uppercase">
              <Clock size={12} /> Pendente (Crédito)
            </div>
          </div>
        </div>

        <div className="bg-[#0f172a] p-6 rounded-[2.5rem] shadow-2xl shadow-slate-200 text-white relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Saldo em Caixa</p>
            <h3 className={`text-2xl font-black tracking-tight mb-2 ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              R$ {netProfit.toFixed(2)}
            </h3>
            <div className="flex items-center gap-2 text-slate-400 font-bold text-[9px] uppercase">
              <Wallet size={12} /> Disponível Real
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h4 className="font-black text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-500" /> Receita por Categoria
          </h4>
          <div className="space-y-4">
            {Array.from(categoriesMap.entries()).length === 0 ? (
               <p className="text-center py-10 text-slate-300 font-bold uppercase text-[10px]">Sem entradas</p>
            ) : (
              Array.from(categoriesMap.entries()).map(([cat, val]) => (
                <div key={cat}>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
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
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h4 className="font-black text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-2">
            <TrendingDown size={20} className="text-red-500" /> Gastos Totais (Pagos + Pendentes)
          </h4>
          <div className="space-y-4">
            {Array.from(expenseCategoriesMap.entries()).length === 0 ? (
               <p className="text-center py-10 text-slate-300 font-bold uppercase text-[10px]">Sem saídas</p>
            ) : (
              Array.from(expenseCategoriesMap.entries()).map(([cat, val]) => (
                <div key={cat}>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                    <span className="text-slate-500">{cat}</span>
                    <span className="text-slate-800">R$ {val.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-red-500 h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${(val / (paidExpenses + pendingExpenses)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFinanceiro;
