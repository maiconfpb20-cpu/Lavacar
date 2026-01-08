
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CustomerPortal from './components/CustomerPortal';
import AdminAgendamentos from './components/AdminAgendamentos';
import AdminSlots from './components/AdminSlots';
import AdminVeiculos from './components/AdminVeiculos';
import AdminFilaEspera from './components/AdminFilaEspera';
import AdminHistorico from './components/AdminHistorico';
import AdminFuncionarios from './components/AdminFuncionarios';
import AdminClientes from './components/AdminClientes';
import AdminFinanceiro from './components/AdminFinanceiro';
import Login from './components/Login';
import AIChat from './components/AIChat';
import { MenuSection, Booking, BookingStatus, AvailableSlot, StaffMember, Client } from './types';
import { Menu, X, Lock } from 'lucide-react';

const initialStaff: StaffMember[] = [];

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<MenuSection>(MenuSection.Dashboard);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState<'admin' | 'customer' | 'login'>('customer');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff);
  const [clients, setClients] = useState<Client[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([
    { id: '1', date: '2025-05-20', time: '09:00' },
    { id: '2', date: '2025-05-20', time: '10:30' },
    { id: '3', date: '2025-05-21', time: '14:00' },
    { id: '4', date: '2025-05-22', time: '08:00' },
    { id: '5', date: '2025-05-22', time: '16:30' },
  ]);

  // Sincronizar clientes a partir de bookings sempre que bookings mudar
  useEffect(() => {
    const customerMap = new Map<string, Client>();
    
    clients.forEach(c => customerMap.set(c.phone, c));

    bookings.forEach(b => {
      const existing = customerMap.get(b.phone);
      if (existing) {
        customerMap.set(b.phone, {
          ...existing,
          name: b.customerName,
          preferredCar: b.carModel,
          preferredPlate: b.plate,
          visitCount: bookings.filter(x => x.phone === b.phone).length,
          totalSpent: bookings.filter(x => x.phone === b.phone && x.status === 'Concluído').reduce((acc, curr) => acc + curr.price, 0),
          lastVisit: b.date > (existing.lastVisit || '') ? b.date : existing.lastVisit
        });
      } else {
        customerMap.set(b.phone, {
          id: Math.random().toString(36).substr(2, 9),
          name: b.customerName,
          phone: b.phone,
          preferredCar: b.carModel,
          preferredPlate: b.plate,
          visitCount: 1,
          totalSpent: b.status === 'Concluído' ? b.price : 0,
          lastVisit: b.date,
          createdAt: new Date()
        });
      }
    });

    const newList = Array.from(customerMap.values());
    if (JSON.stringify(newList) !== JSON.stringify(clients)) {
      setClients(newList);
    }
  }, [bookings]);

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
      case MenuSection.Dashboard:
        return <Dashboard bookings={bookings} />;
      case MenuSection.Agendamentos:
        return <AdminAgendamentos bookings={bookings} onUpdateStatus={updateBookingStatus} />;
      case MenuSection.FilaDeEspera:
        return <AdminFilaEspera bookings={bookings} onUpdateStatus={updateBookingStatus} onAddBooking={addBooking} />;
      case MenuSection.Historico:
        return <AdminHistorico bookings={bookings} />;
      case MenuSection.Funcionarios:
        return <AdminFuncionarios staff={staff} setStaff={setStaff} />;
      case MenuSection.Clientes:
        return <AdminClientes clients={clients} onAddClient={addClient} />;
      case MenuSection.Veiculos:
        return <AdminVeiculos bookings={bookings} />;
      case MenuSection.Financeiro:
        return <AdminFinanceiro bookings={bookings} />;
      case MenuSection.Configuracoes:
        return (
          <AdminSlots 
            slots={availableSlots} 
            onAddSlot={addAvailableSlot} 
            onRemoveSlot={removeAvailableSlot} 
          />
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] text-slate-400">
            <h2 className="text-xl font-bold mb-2">Módulo {activeSection}</h2>
            <p>Esta funcionalidade está sendo implementada.</p>
          </div>
        );
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
    return (
      <Login 
        onLoginSuccess={handleLoginSuccess} 
        onBack={() => setViewMode('customer')} 
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] overflow-hidden relative font-['Inter']">
      <div 
        className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:hidden'
        }`}
      >
        <Sidebar 
          activeSection={activeSection} 
          onSectionChange={(section) => {
            setActiveSection(section);
            if (window.innerWidth < 1024) setIsSidebarOpen(false);
          }} 
          onLogout={handleLogout}
        />
      </div>
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-100">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:text-blue-600 transition-colors"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm font-black text-slate-800 uppercase tracking-tight">LavaCar Pro</span>
              <span className="text-slate-200">/</span>
              <span className="text-xs font-black text-blue-600 uppercase tracking-widest">{activeSection}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button 
              onClick={() => setViewMode('customer')}
              className="text-slate-400 hover:text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] mr-4"
            >
              Portal do Cliente
            </button>
            <div className="w-9 h-9 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
              <Lock size={14} />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#f8fafc]">
          {renderAdminContent()}
        </main>
      </div>

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {isAuthenticated && viewMode === 'admin' && <AIChat />}
    </div>
  );
};

export default App;
