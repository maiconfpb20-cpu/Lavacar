
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { Menu, X, Lock, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { fetchDataFromCloud, syncDataToCloud, WashData, WASH_ID } from './services/apiService.ts';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<MenuSection>(MenuSection.Dashboard);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState<'admin' | 'customer' | 'login'>('customer');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [syncError, setSyncError] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [adminPin, setAdminPin] = useState('1844');

  const skipSyncRef = useRef(true);

  // Carregamento de Dados da Nuvem
  const loadData = useCallback(async (isAuto = true) => {
    // Se já estiver sincronizando manualmente, ignora o auto
    if (isSyncing && isAuto) return;
    
    setIsSyncing(true);
    const cloudData = await fetchDataFromCloud();
    
    if (cloudData) {
      skipSyncRef.current = true; // Evita que o setStates abaixo disparem um novo sync para a nuvem
      setBookings(cloudData.bookings || []);
      setStaff(cloudData.staff || []);
      setClients(cloudData.clients || []);
      setAvailableSlots(cloudData.availableSlots || []);
      if (cloudData.adminPin) {
        setAdminPin(cloudData.adminPin);
        localStorage.setItem('lavacar_admin_pin', cloudData.adminPin);
      }
      setInitialLoadDone(true);
    } else if (!isAuto) {
      // Se falhar no manual (ex: primeira vez do app), marca como carregado para permitir salvar
      setInitialLoadDone(true);
    }
    
    setIsSyncing(false);
    setLastSync(new Date());
  }, [isSyncing]);

  // Efeito Inicial e Polling (verifica novos dados a cada 10 segundos)
  useEffect(() => {
    loadData(false);
    const interval = setInterval(() => loadData(true), 10000);
    return () => clearInterval(interval);
  }, []);

  // Sincronização de saída (Salvar na nuvem quando algo mudar localmente)
  const syncAll = useCallback(async () => {
    if (!initialLoadDone) return;
    
    setIsSyncing(true);
    const data: WashData = {
      bookings,
      staff,
      clients,
      availableSlots,
      adminPin: localStorage.getItem('lavacar_admin_pin') || adminPin
    };
    
    const success = await syncDataToCloud(data);
    setSyncError(!success);
    setIsSyncing(false);
    setLastSync(new Date());
  }, [bookings, staff, clients, availableSlots, adminPin, initialLoadDone]);

  useEffect(() => {
    if (skipSyncRef.current) {
      skipSyncRef.current = false;
      return;
    }

    const timer = setTimeout(() => {
      syncAll();
    }, 1000);
    return () => clearTimeout(timer);
  }, [bookings, staff, clients, availableSlots, adminPin, syncAll]);

  // Handlers
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
    <div className="flex min-h-screen bg-[#f8fafc] overflow-hidden relative font-['Inter']">
      <div className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:hidden'}`}>
        <Sidebar activeSection={activeSection} onSectionChange={(s) => { setActiveSection(s); if (window.innerWidth < 1024) setIsSidebarOpen(false); }} onLogout={handleLogout} />
      </div>
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-100">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:text-blue-600 transition-colors">
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm font-black text-slate-800 uppercase tracking-tight">LavaCar Pro</span>
              <span className="text-slate-200">/</span>
              <span className="text-xs font-black text-blue-600 uppercase tracking-widest">{activeSection}</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => loadData(false)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100 hover:bg-slate-100 transition-colors active:scale-95"
            >
              {isSyncing ? (
                <RefreshCw size={14} className="text-blue-500 animate-spin" />
              ) : syncError ? (
                <CloudOff size={14} className="text-red-500" />
              ) : (
                <Cloud size={14} className="text-emerald-500" />
              )}
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                {isSyncing ? 'Sincronizando...' : 'Nuvem Conectada'}
              </span>
            </button>

            <button onClick={() => setViewMode('customer')} className="hidden md:block text-slate-400 hover:text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">
              Portal do Cliente
            </button>
            <div className="w-9 h-9 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
              <Lock size={14} />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#f8fafc]">
          {!initialLoadDone ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <RefreshCw className="text-blue-600 animate-spin" size={48} />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Carregando Dados da Nuvem...</p>
            </div>
          ) : renderAdminContent()}
        </main>
      </div>

      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
      {isAuthenticated && viewMode === 'admin' && <AIChat />}
    </div>
  );
};

export default App;
