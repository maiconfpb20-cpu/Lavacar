
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar.tsx';
import Dashboard from './components/Dashboard.tsx';
import CustomerPortal from './components/CustomerPortal.tsx';
import AdminAgendamentos from './components/AdminAgendamentos.tsx';
import AdminSlots from './components/AdminSlots.tsx';
import AdminVeiculos from './components/AdminVeiculos.tsx';
import AdminFilaEspera from './components/AdminFilaEspera.tsx';
import AdminHistorico from './components/AdminHistorico.tsx';
import AdminFuncionarios from './components/AdminFuncionarios.tsx';
import AdminClientes from './components/AdminClientes.tsx';
import AdminFinanceiro from './components/AdminFinanceiro.tsx';
import Login from './components/Login.tsx';
import AIChat from './components/AIChat.tsx';
import { MenuSection, Booking, BookingStatus, AvailableSlot, StaffMember, Client } from './types.ts';
import { Menu, X, Lock, Cloud, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { syncDataToCloud, WashData, WASH_ID } from './services/apiService.ts';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<MenuSection>(MenuSection.Dashboard);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState<'admin' | 'customer' | 'login'>('customer');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const getLocalData = (key: string, defaultValue: any) => {
    const saved = localStorage.getItem(`lavacar_local_db_${key}`);
    return saved ? JSON.parse(saved) : defaultValue;
  };

  const [bookings, setBookings] = useState<Booking[]>(() => getLocalData('bookings', []));
  const [staff, setStaff] = useState<StaffMember[]>(() => getLocalData('staff', []));
  const [clients, setClients] = useState<Client[]>(() => getLocalData('clients', []));
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>(() => getLocalData('slots', []));
  const [adminPin] = useState(() => localStorage.getItem('lavacar_admin_pin') || '1844');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(`lavacar_local_db_bookings`, JSON.stringify(bookings));
    localStorage.setItem(`lavacar_local_db_staff`, JSON.stringify(staff));
    localStorage.setItem(`lavacar_local_db_clients`, JSON.stringify(clients));
    localStorage.setItem(`lavacar_local_db_slots`, JSON.stringify(availableSlots));
  }, [bookings, staff, clients, availableSlots]);

  const syncWithCloud = useCallback(async () => {
    if (!navigator.onLine) return;
    setIsSyncing(true);
    const data: WashData = {
      bookings,
      staff,
      clients,
      availableSlots,
      adminPin: localStorage.getItem('lavacar_admin_pin') || adminPin
    };
    await syncDataToCloud(data);
    setIsSyncing(false);
  }, [bookings, staff, clients, availableSlots, adminPin]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isOnline) syncWithCloud();
    }, 30000);
    return () => clearInterval(interval);
  }, [isOnline, syncWithCloud]);

  const addBooking = (newBooking: Omit<Booking, 'id' | 'status' | 'createdAt'>) => {
    const booking: Booking = {
      ...newBooking,
      id: Math.random().toString(36).substr(2, 9),
      status: 'Pendente',
      createdAt: new Date()
    };
    setBookings(prev => [...prev, booking]);
    setAvailableSlots(prev => prev.filter(s => !(s.date === newBooking.date && s.time === newBooking.time)));
  };

  const updateBookingStatus = (id: string, status: BookingStatus) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const addClient = (newClient: Omit<Client, 'id' | 'visitCount' | 'totalSpent' | 'createdAt'>) => {
    const client: Client = {
      ...newClient,
      id: Math.random().toString(36).substr(2, 9),
      visitCount: 0,
      totalSpent: 0,
      createdAt: new Date()
    };
    setClients(prev => [...prev, client]);
  };

  const addAvailableSlot = (date: string, time: string) => {
    const newSlot: AvailableSlot = {
      id: Math.random().toString(36).substr(2, 9),
      date,
      time
    };
    setAvailableSlots(prev => [...prev, newSlot]);
  };

  const removeAvailableSlot = (id: string) => {
    setAvailableSlots(prev => prev.filter(s => s.id !== id));
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setViewMode('admin');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setViewMode('customer');
  };

  const renderAdminContent = () => {
    switch (activeSection) {
      case MenuSection.Dashboard: return <Dashboard bookings={bookings} />;
      case MenuSection.Agendamentos: return <AdminAgendamentos bookings={bookings} onUpdateStatus={updateBookingStatus} />;
      case MenuSection.FilaDeEspera: return <AdminFilaEspera bookings={bookings} onUpdateStatus={updateBookingStatus} onAddBooking={addBooking} />;
      case MenuSection.Historico: return <AdminHistorico bookings={bookings} />;
      case MenuSection.Funcionarios: return <AdminFuncionarios staff={staff} setStaff={setStaff} />;
      case MenuSection.Clientes: return <AdminClientes clients={clients} onAddClient={addClient} />;
      case MenuSection.Veiculos: return <AdminVeiculos bookings={bookings} />;
      case MenuSection.Financeiro: return <AdminFinanceiro bookings={bookings} />;
      case MenuSection.Configuracoes: return <AdminSlots slots={availableSlots} onAddSlot={addAvailableSlot} onRemoveSlot={removeAvailableSlot} />;
      default: return null;
    }
  };

  if (viewMode === 'customer') {
    return (
      <CustomerPortal 
        onAddBooking={addBooking} 
        onGoToLogin={() => setViewMode('login')} 
        availableSlots={availableSlots}
      />
    );
  }

  if (viewMode === 'login' && !isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} onBack={() => setViewMode('customer')} />;
  }

  return (
    <div className="flex h-screen w-screen bg-[#f8fafc] overflow-hidden relative font-['Inter']">
      <div className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:hidden'}`}>
        <Sidebar activeSection={activeSection} onSectionChange={(s) => { setActiveSection(s); if (window.innerWidth < 1024) setIsSidebarOpen(false); }} onLogout={handleLogout} />
      </div>
      
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="h-16 flex flex-shrink-0 items-center justify-between px-6 bg-white border-b border-slate-100 z-20">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:text-blue-600 transition-colors">
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm font-black text-slate-800 uppercase tracking-tight">LavaCar Pro</span>
              <span className="bg-emerald-100 text-emerald-600 text-[9px] font-black px-2 py-0.5 rounded-md uppercase">Modo PC</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
              {isOnline ? (
                <><Wifi size={14} className="text-emerald-500" /> <span className="text-[9px] font-black uppercase text-slate-400">Online-Ready</span></>
              ) : (
                <><WifiOff size={14} className="text-orange-500" /> <span className="text-[9px] font-black uppercase text-orange-400">Salvando Localmente</span></>
              )}
            </div>

            <button 
              onClick={syncWithCloud}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-100 hover:bg-blue-100 transition-all"
            >
              {isSyncing ? <RefreshCw size={14} className="text-blue-500 animate-spin" /> : <Cloud size={14} className="text-blue-500" />}
              <span className="text-[9px] font-black uppercase tracking-widest text-blue-600">Sinc. Nuvem</span>
            </button>

            <div className="w-9 h-9 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
              <Lock size={14} />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#f8fafc] custom-scrollbar pb-20">
          {renderAdminContent()}
        </main>
      </div>

      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
      {isAuthenticated && viewMode === 'admin' && <AIChat />}
    </div>
  );
};

export default App;
