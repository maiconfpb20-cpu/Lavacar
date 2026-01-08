
import React, { useState, useEffect } from 'react';
import { 
  UserPlus, ShieldCheck, Mail, DollarSign, 
  Plus, Minus, Calculator, X, Save, Trash2, Edit3, CheckCircle2, Wallet, History, Users, Receipt, AlertCircle
} from 'lucide-react';
import { StaffMember, StaffPayment } from '../types';

interface AdminFuncionariosProps {
  staff: StaffMember[];
  setStaff: React.Dispatch<React.SetStateAction<StaffMember[]>>;
}

const AdminFuncionarios: React.FC<AdminFuncionariosProps> = ({ staff, setStaff }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState<number | null>(null);

  const [formData, setFormData] = useState<Partial<StaffMember>>({
    name: '',
    role: '',
    email: '',
    status: 'Ativo',
    dailyRate: 80,
    workedDays: 0,
    totalPaid: 0,
    paymentHistory: []
  });

  // Limpar mensagem de sucesso após 3 segundos
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const openModal = (member?: StaffMember) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        ...member,
        paymentHistory: member.paymentHistory || []
      });
    } else {
      setEditingMember(null);
      setFormData({
        name: '',
        role: '',
        email: '',
        status: 'Ativo',
        dailyRate: 80,
        workedDays: 0,
        totalPaid: 0,
        paymentHistory: []
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMember(null);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMember) {
      setStaff(prev => prev.map(m => m.id === editingMember.id ? { ...m, ...formData } as StaffMember : m));
    } else {
      const newMember: StaffMember = {
        ...(formData as Omit<StaffMember, 'id'>),
        id: Date.now(),
        totalPaid: 0,
        workedDays: formData.workedDays || 0,
        paymentHistory: []
      } as StaffMember;
      setStaff(prev => [...prev, newMember]);
    }
    closeModal();
  };

  const handleDeleteMember = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    if (window.confirm('Tem certeza que deseja remover este funcionário permanentemente?')) {
      setStaff(current => current.filter(m => m.id !== id));
      if (editingMember?.id === id) closeModal();
    }
  };

  const handleDayChange = (id: number, delta: number) => {
    setStaff(prev => prev.map(member => {
      if (member.id === id) {
        const newDays = Math.max(0, member.workedDays + delta);
        return { ...member, workedDays: newDays };
      }
      return member;
    }));
  };

  const updateStaffDailyRate = (id: number, rate: number) => {
    setStaff(prev => prev.map(member => 
      member.id === id ? { ...member, dailyRate: rate } : member
    ));
  };

  const handlePayment = (member: StaffMember) => {
    const amountToPay = member.dailyRate * member.workedDays;
    
    if (amountToPay <= 0) {
      alert("Este funcionário não possui dias trabalhados para receber pagamento.");
      return;
    }

    if (window.confirm(`Deseja confirmar o pagamento de R$ ${amountToPay.toFixed(2)} para ${member.name}? Isso resetará os dias trabalhados.`)) {
      setPayingId(member.id);

      const newPayment: StaffPayment = {
        id: Math.random().toString(36).substr(2, 6).toUpperCase(),
        amount: amountToPay,
        date: new Date().toISOString()
      };

      // Atualização imediata do estado
      setStaff(prev => prev.map(m => {
        if (m.id === member.id) {
          const currentHistory = m.paymentHistory || [];
          return {
            ...m,
            totalPaid: (m.totalPaid || 0) + amountToPay,
            workedDays: 0,
            paymentHistory: [newPayment, ...currentHistory]
          };
        }
        return m;
      }));

      // Feedback visual
      setShowSuccess(member.id);
      setPayingId(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Gestão de Equipe</h2>
          <p className="text-blue-600 text-sm font-bold tracking-widest uppercase mt-1">Controle de Pagamentos e Histórico</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
        >
          <UserPlus size={16} /> Adicionar Membro
        </button>
      </header>

      {staff.length === 0 ? (
        <div className="bg-white p-20 rounded-[2.5rem] border border-slate-100 text-center flex flex-col items-center gap-4 animate-in fade-in duration-500">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
            <Users size={48} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Equipe Vazia</h3>
            <p className="text-slate-400 text-sm font-medium mt-1">Cadastre seus funcionários para gerenciar diárias e pagamentos.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {staff.map((member) => (
            <div key={member.id} className={`bg-white p-6 rounded-[2.5rem] border-2 transition-all duration-300 flex flex-col group ${showSuccess === member.id ? 'border-emerald-500 shadow-xl shadow-emerald-500/10' : 'border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50'}`}>
              
              {/* Header do Card */}
              <div className="flex flex-col items-center text-center mb-6 relative">
                <div className="absolute right-0 top-0">
                  <button 
                    onClick={() => openModal(member)}
                    className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                  >
                    <Edit3 size={18} />
                  </button>
                </div>

                <div className="relative mb-4">
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-2xl font-black uppercase transition-colors ${showSuccess === member.id ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                    {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 border-4 border-white rounded-full ${member.status === 'Ativo' ? 'bg-emerald-500' : 'bg-orange-400'}`}></div>
                </div>
                
                <h4 className="font-black text-slate-800 uppercase tracking-tight mb-1">{member.name}</h4>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
                  {member.role}
                </span>
              </div>

              {/* Área de Cálculo */}
              <div className="bg-slate-50 p-5 rounded-3xl space-y-4 flex-1">
                <div className="flex items-center justify-between">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Calculator size={14} className="text-blue-600" /> Folha Atual
                  </h5>
                  {showSuccess === member.id && (
                    <span className="text-[9px] font-black text-emerald-600 uppercase animate-pulse">Pagamento Realizado!</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Valor Diária</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">R$</span>
                      <input 
                        type="number" 
                        className="w-full bg-white border-none rounded-xl pl-8 pr-2 py-2 text-xs font-black text-slate-800 focus:ring-2 focus:ring-blue-500"
                        value={member.dailyRate}
                        onChange={(e) => updateStaffDailyRate(member.id, Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Dias Pendentes</label>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleDayChange(member.id, -1)} className="p-1.5 bg-white rounded-lg text-slate-400 hover:text-red-500 shadow-sm"><Minus size={14} /></button>
                      <span className="flex-1 text-center font-black text-slate-800 text-sm">{member.workedDays}</span>
                      <button onClick={() => handleDayChange(member.id, 1)} className="p-1.5 bg-white rounded-lg text-slate-400 hover:text-emerald-500 shadow-sm"><Plus size={14} /></button>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Saldo a Pagar</p>
                    <p className={`text-xl font-black tracking-tight ${member.workedDays > 0 ? 'text-blue-600' : 'text-slate-300'}`}>
                      R$ {(member.dailyRate * member.workedDays).toFixed(2)}
                    </p>
                  </div>
                  <div className={`p-2 rounded-xl ${member.workedDays > 0 ? 'bg-blue-600/10 text-blue-600' : 'bg-slate-200 text-slate-400'}`}>
                    <Wallet size={20} />
                  </div>
                </div>

                {/* Histórico Interno */}
                <div className="pt-4 border-t border-slate-200">
                   <h6 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                     <Receipt size={12} /> Histórico Recente
                   </h6>
                   <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1 scrollbar-hide">
                     {member.paymentHistory && member.paymentHistory.length > 0 ? (
                       member.paymentHistory.slice(0, 5).map((pay) => (
                         <div key={pay.id} className="bg-white/60 p-2 rounded-xl border border-slate-200 flex items-center justify-between animate-in slide-in-from-top-1">
                           <div>
                             <p className="text-[8px] font-black text-slate-800">PAG-#{pay.id}</p>
                             <p className="text-[7px] font-bold text-slate-400 uppercase">{new Date(pay.date).toLocaleDateString()}</p>
                           </div>
                           <span className="text-[10px] font-black text-emerald-600">+ R$ {pay.amount.toFixed(2)}</span>
                         </div>
                       ))
                     ) : (
                       <div className="py-4 text-center">
                         <p className="text-[8px] text-slate-300 font-black uppercase tracking-widest italic">Nenhum pagamento efetuado</p>
                       </div>
                     )}
                   </div>
                   <div className="mt-3 flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                      <span className="text-[8px] font-black text-slate-400 uppercase">Acumulado Pago</span>
                      <span className="text-[11px] font-black text-slate-800">R$ {(member.totalPaid || 0).toFixed(2)}</span>
                   </div>
                </div>
              </div>

              {/* Botão de Ação Principal */}
              <button 
                onClick={() => handlePayment(member)}
                disabled={payingId === member.id || member.workedDays === 0}
                className={`w-full mt-4 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  showSuccess === member.id
                  ? 'bg-emerald-500 text-white'
                  : member.workedDays > 0
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-[0.98]'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                }`}
              >
                {showSuccess === member.id ? (
                  <><CheckCircle2 size={16} /> Pago e Resetado!</>
                ) : payingId === member.id ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : member.workedDays === 0 ? (
                  <><AlertCircle size={14} /> Saldo Zerado</>
                ) : (
                  <><DollarSign size={16} /> Efetuar Pagamento</>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Cadastro/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <header className="bg-blue-600 p-6 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl"><UserPlus size={20} /></div>
                <div>
                  <h3 className="font-black uppercase tracking-tight text-lg">{editingMember ? 'Editar' : 'Novo'} Funcionário</h3>
                  <p className="text-xs text-white/70 font-bold uppercase tracking-widest">Informações Profissionais</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X size={24} /></button>
            </header>

            <form onSubmit={handleSaveMember} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nome Completo</label>
                  <input required className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-black text-slate-800 focus:ring-4 focus:ring-blue-500/5" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Função</label>
                    <input required className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-black text-slate-800 focus:ring-4 focus:ring-blue-500/5" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Status</label>
                    <select className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-black text-slate-800" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                      <option value="Ativo">Ativo</option>
                      <option value="Em Pausa">Em Pausa</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">E-mail de Contato</label>
                  <input required type="email" className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-black text-slate-800 focus:ring-4 focus:ring-blue-500/5" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Valor Diária (R$)</label>
                    <input required type="number" className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-black text-slate-800 focus:ring-4 focus:ring-blue-500/5" value={formData.dailyRate} onChange={e => setFormData({...formData, dailyRate: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Dias Iniciais</label>
                    <input required type="number" className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-black text-slate-800 focus:ring-4 focus:ring-blue-500/5" value={formData.workedDays} onChange={e => setFormData({...formData, workedDays: Number(e.target.value)})} />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                {editingMember && (
                  <button type="button" onClick={(e) => handleDeleteMember(e as any, editingMember.id)} className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={24} /></button>
                )}
                <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"><Save size={20} className="inline mr-2" /> Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFuncionarios;
