
import React from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  ListOrdered, 
  History, 
  Users, 
  Car, 
  Wallet,
  LogOut,
  Droplet,
  Settings,
  UserCheck
} from 'lucide-react';
import { MenuSection } from '../types';

interface SidebarProps {
  activeSection: MenuSection;
  onSectionChange: (section: MenuSection) => void;
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange, onLogout }) => {
  const menuItems = [
    { id: MenuSection.Dashboard, label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: MenuSection.Agendamentos, label: 'Agendamentos', icon: <CalendarDays size={20} /> },
    { id: MenuSection.FilaDeEspera, label: 'Fila de Espera', icon: <ListOrdered size={20} /> },
    { id: MenuSection.Historico, label: 'Histórico', icon: <History size={20} /> },
    { id: MenuSection.Funcionarios, label: 'Funcionários', icon: <UserCheck size={20} /> },
    { id: MenuSection.Clientes, label: 'Clientes', icon: <Users size={20} /> },
    { id: MenuSection.Veiculos, label: 'Veículos', icon: <Car size={20} /> },
    { id: MenuSection.Financeiro, label: 'Financeiro', icon: <Wallet size={20} /> },
    { id: MenuSection.Configuracoes, label: 'Configurações', icon: <Settings size={20} /> },
  ];

  return (
    <div className="w-64 h-full bg-[#0f172a] text-slate-400 flex flex-col p-4 shadow-2xl lg:shadow-none">
      {/* Logo Section */}
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
          <Droplet className="text-white fill-current" size={24} />
        </div>
        <h1 className="text-white text-xl font-bold tracking-tight">LavaCar Pro</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeSection === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            {item.icon}
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="mt-auto space-y-2 pt-4 border-t border-slate-800">
        <div className="px-4 py-3 bg-slate-800/30 rounded-xl flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Online</span>
        </div>
        
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium text-sm">Sair</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
