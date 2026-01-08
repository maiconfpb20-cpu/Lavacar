
import React from 'react';
import { DollarSign, Clock, CheckCircle2, ListFilter } from 'lucide-react';
import DashboardCard from './DashboardCard.tsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Booking } from '../types.ts';

const data = [
  { name: 'Seg', total: 400 },
  { name: 'Ter', total: 700 },
  { name: 'Qua', total: 550 },
  { name: 'Qui', total: 900 },
  { name: 'Sex', total: 1100 },
  { name: 'Sab', total: 1400 },
  { name: 'Dom', total: 800 },
];

const Dashboard: React.FC<{ bookings: Booking[] }> = ({ bookings }) => {
  const activeFila = bookings.filter(b => b.status === 'Pendente' || b.status === 'Em Andamento').length;
  const completedToday = bookings.filter(b => {
    const isCompleted = b.status === 'Concluído';
    const isToday = new Date(b.date).toDateString() === new Date().toDateString();
    return isCompleted && isToday;
  }).length;
  
  const totalRevenue = bookings
    .filter(b => b.status === 'Concluído')
    .reduce((acc, b) => acc + b.price, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10">
        <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Dashboard</h2>
        <p className="text-blue-600 text-sm font-bold tracking-widest uppercase mt-1">Gestão Profissional</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          label="Faturamento\nReal" 
          value={`R$ ${totalRevenue.toFixed(2)}`} 
          icon={<DollarSign size={24} />} 
          iconBg="bg-blue-50" 
          iconColor="text-blue-500"
        />
        <DashboardCard 
          label="Fila\nAtiva" 
          value={activeFila} 
          icon={<ListFilter size={24} />} 
          iconBg="bg-orange-50" 
          iconColor="text-orange-500"
        />
        <DashboardCard 
          label="Entregues\nHoje" 
          value={completedToday} 
          icon={<CheckCircle2 size={24} />} 
          iconBg="bg-emerald-50" 
          iconColor="text-emerald-500"
        />
        <DashboardCard 
          label="Tempo\nMédio" 
          value="45 min" 
          icon={<Clock size={24} />} 
          iconBg="bg-purple-50" 
          iconColor="text-purple-500"
        />
      </div>

      <div className="mt-12 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Desempenho Semanal</h3>
            <p className="text-slate-400 text-sm">Volume de veículos atendidos por dia</p>
          </div>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
              <YAxis hide />
              <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="total" radius={[6, 6, 0, 0]} barSize={40}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 5 ? '#2563eb' : '#cbd5e1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
