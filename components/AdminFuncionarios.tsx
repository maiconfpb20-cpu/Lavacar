
import React, { useState, useEffect, useRef } from 'react';
import { 
  UserPlus, ShieldCheck, Mail, DollarSign, 
  Plus, Minus, Calculator, X, Save, Trash2, Edit3, CheckCircle2, Wallet, History, Users, Receipt, AlertCircle, Lock, Key,
  QrCode, Copy, Landmark
} from 'lucide-react';
import { StaffMember, StaffPayment } from '../types.ts';

interface AdminFuncionariosProps {
  staff: StaffMember[];
  setStaff: React.Dispatch<React.SetStateAction<StaffMember[]>>;
}

const AdminFuncionarios: React.FC<AdminFuncionariosProps> = ({ staff, setStaff }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);
  
  const [pinValue, setPinValue] = useState('');
  const [pinError, setPinError] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'DAY' | 'PAY', memberId: number, data?: any } | null>(null);
  
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState<number | null>(null);
  const [pixData, setPixData] = useState<{ code: string, amount: number, name: string, key: string } | null>(null);
  
  const pinInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<StaffMember>>({
    name: '',
    role: '',
    email: '',
    pixKey: '',
    status: 'Ativo',
    dailyRate: 80,
    workedDays: 0,
    totalPaid: 0,
    paymentHistory: []
  });

  // Função para gerar string PIX (Simples BRCode)
  const generatePixPayload = (key: string, name: string, amount: number) => {
    const pad = (s: string) => s.length.toString().padStart(2, '0');
    const cleanKey = key.replace(/\s/g, '');
    const cleanName = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").substring(0, 25).toUpperCase();
    
    const part26 = `0014br.gov.bcb.pix01${pad(cleanKey)}${cleanKey}`;
    const part54 = amount.toFixed(2);
    const part59 = cleanName;
    const part60 = "CURITIBA";
    const part62 = "0507LAVACAR";
    
    let payload = `00020126${pad(part26)}${part26}52040000530398654${pad(part54)}${part54}5802BR59${pad(part59)}${part59}60${pad(part60)}${part60}62${pad(part62)}${part62}6304`;
    
    // Cálculo de CRC16 simplificado para o exemplo
    let crc = 0xFFFF;
    for (let i = 0; i < payload.length; i++) {
      crc ^= payload.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if (crc & 0x8000) crc = (crc << 1) ^ 0x1021;
        else crc <<= 1;
      }
    }
    const crcHex = (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
    return payload + crcHex;
  };

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  useEffect(() => {
    if (isPinModalOpen) {
      setTimeout(() => pinInputRef.current?.focus(), 100);
    }
  }, [isPinModalOpen]);

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
        pixKey: '',
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

  const requestDayChange = (id: number, delta: number) => {
    setPendingAction({ type: 'DAY', memberId: id, data: { delta } });
    setIsPinModalOpen(true);
    setPinValue('');
    setPinError(false);
  };

  const requestPayment = (member: StaffMember) => {
    const amountToPay = member.dailyRate * member.workedDays;
    if (amountToPay <= 0) {
      alert("Este funcionário não possui dias trabalhados para receber pagamento.");
      return;
    }
    if (!member.pixKey) {
      alert("Cadastre uma Chave PIX no perfil deste funcionário antes de pagar.");
      return;
    }
    setPendingAction({ type: 'PAY', memberId: member.id, data: { amountToPay, memberName: member.name, pixKey: member.pixKey } });
    setIsPinModalOpen(true);
    setPinValue('');
    setPinError(false);
  };

  const verifyPinAndExecute = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const savedPin = localStorage.getItem('lavacar_admin_pin') || '1844';

    if (pinValue === savedPin) {
      executeAction();
      setIsPinModalOpen(false);
      setPinValue('');
    } else {
      setPinError(true);
      setPinValue('');
      setTimeout(() => setPinError(false), 2000);
    }
  };

  const executeAction = () => {
    if (!pendingAction) return;

    if (pendingAction.type === 'DAY') {
      const { delta } = pendingAction.data;
      setStaff(prev => prev.map(member => {
        if (member.id === pendingAction.memberId) {
          const newDays = Math.max(0, member.workedDays + delta);
          return { ...member, workedDays: newDays };
        }
        return member;
      }));
      setPendingAction(null);
    } else if (pendingAction.type === 'PAY') {
      const { amountToPay, memberName, pixKey } = pendingAction.data;
      setPayingId(pendingAction.memberId);
      
      const newPayment: StaffPayment = {
        id: Math.random().toString(36).substr(2, 6).toUpperCase(),
        amount: amountToPay,
        date: new Date().toISOString()
      };

      setStaff(prev => prev.map(m => {
        if (m.id === pendingAction.memberId) {
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

      // Gerar Dados para o Modal PIX
      const pixCode = generatePixPayload(pixKey, memberName, amountToPay);
      setPixData({ code: pixCode, amount: amountToPay, name: memberName, key: pixKey });
      setIsPixModalOpen(true);
      
      setShowSuccess(pendingAction.memberId);
      setPayingId(null);
      setPendingAction(null);
    }
  };

  const updateStaffDailyRate = (id: number, rate: number) => {
    setStaff(prev => prev.map(member => 
      member.id === id ? { ...member, dailyRate: rate } : member
    ));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Gestão de Equipe</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-blue-600 text-sm font-bold tracking-widest uppercase">Pagamentos Protegidos via PIX</p>
            <ShieldCheck size={14} className="text-emerald-500" />
          </div>
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
            <p className="text-slate-400 text-sm font-medium mt-1">Cadastre seus funcionários para gerenciar diárias.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {staff.map((member) => (
            <div key={member.id} className={`bg-white p-6 rounded-[2.5rem] border-2 transition-all duration-300 flex flex-col group ${showSuccess === member.id ? 'border-emerald-500 shadow-xl shadow-emerald-500/10' : 'border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50'}`}>
              
              <div className="flex flex-col items-center text-center mb-6 relative">
                <div className="absolute right-0 top-0">
                  <button onClick={() => openModal(member)} className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
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
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
                    {member.role}
                  </span>
                  {member.pixKey && (
                    <span className="text-[8px] font-black text-slate-400 uppercase flex items-center gap-1">
                      <QrCode size={10} /> Chave PIX Cadastrada
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-3xl space-y-4 flex-1">
                <div className="flex items-center justify-between">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Calculator size={14} className="text-blue-600" /> Folha Atual
                  </h5>
                  <div className="flex items-center gap-1 text-[8px] font-black text-slate-300 uppercase">
                    <Lock size={10} /> PIN Protegido
                  </div>
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
                      <button onClick={() => requestDayChange(member.id, -1)} className="p-1.5 bg-white rounded-lg text-slate-400 hover:text-red-500 shadow-sm transition-transform active:scale-90"><Minus size={14} /></button>
                      <span className="flex-1 text-center font-black text-slate-800 text-sm">{member.workedDays}</span>
                      <button onClick={() => requestDayChange(member.id, 1)} className="p-1.5 bg-white rounded-lg text-slate-400 hover:text-emerald-500 shadow-sm transition-transform active:scale-90"><Plus size={14} /></button>
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
              </div>

              <button 
                onClick={() => requestPayment(member)}
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
                  <><CheckCircle2 size={16} /> Pago via PIX</>
                ) : payingId === member.id ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <><DollarSign size={16} /> Efetuar Pagamento PIX</>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE PIX QR CODE */}
      {isPixModalOpen && pixData && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <header className="bg-emerald-600 p-8 text-center text-white relative">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <QrCode size={32} />
              </div>
              <h3 className="font-black uppercase tracking-widest text-lg">Pagar Funcionário</h3>
              <p className="text-[10px] text-white/70 font-bold uppercase tracking-[0.2em] mt-2">Transação PIX Instantânea</p>
              <button onClick={() => setIsPixModalOpen(false)} className="absolute top-6 right-6 text-white/50 hover:text-white"><X size={24} /></button>
            </header>

            <div className="p-8 space-y-6 flex flex-col items-center">
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor do Pagamento</p>
                <h4 className="text-3xl font-black text-slate-800">R$ {pixData.amount.toFixed(2)}</h4>
                <p className="text-xs font-bold text-blue-600 uppercase mt-1">{pixData.name}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-[2rem] border-2 border-slate-100 relative group">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixData.code)}`}
                  alt="QR Code PIX"
                  className="w-48 h-48 rounded-xl"
                />
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl pointer-events-none">
                   <p className="text-[10px] font-black uppercase text-slate-800 bg-white px-3 py-1 rounded-full shadow-lg">Scan para Pagar</p>
                </div>
              </div>

              <div className="w-full space-y-3">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Chave Destino</p>
                  <p className="text-xs font-bold text-slate-700 truncate">{pixData.key}</p>
                </div>
                
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(pixData.code);
                    alert("Código PIX Copia e Cola copiado!");
                  }}
                  className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                >
                  <Copy size={16} /> Copiar Código PIX
                </button>
              </div>

              <button 
                onClick={() => setIsPixModalOpen(false)}
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all"
              >
                Concluir Pagamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE SEGURANÇA PIN */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
            <header className="bg-slate-900 p-8 text-center text-white relative">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-600/20 animate-bounce">
                <Lock size={32} />
              </div>
              <h3 className="font-black uppercase tracking-widest text-lg">Área Protegida</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2">Digite o PIN de Segurança para prosseguir</p>
              
              <button 
                onClick={() => { setIsPinModalOpen(false); setPendingAction(null); }} 
                className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </header>

            <form onSubmit={verifyPinAndExecute} className="p-10 space-y-8">
              <div className="space-y-4">
                <div className="flex justify-center gap-3">
                  <input 
                    ref={pinInputRef}
                    type="password" 
                    maxLength={4}
                    pattern="\d*"
                    inputMode="numeric"
                    className={`w-40 bg-slate-50 border-2 rounded-2xl px-6 py-5 text-center text-3xl font-black tracking-[0.5em] focus:ring-4 transition-all outline-none ${
                      pinError 
                      ? 'border-red-500 ring-red-500/10 animate-shake text-red-500' 
                      : 'border-slate-100 focus:border-blue-600 focus:ring-blue-500/5 text-slate-900'
                    }`}
                    placeholder="••••"
                    value={pinValue}
                    onChange={e => setPinValue(e.target.value)}
                  />
                </div>
                {pinError && (
                  <p className="text-[10px] font-black text-red-500 uppercase text-center tracking-widest animate-pulse">PIN Incorreto! Tente novamente.</p>
                )}
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Ação Pendente:</p>
                <p className="text-xs font-bold text-slate-700 uppercase">
                  {pendingAction?.type === 'DAY' ? 'Alteração de Dias Trabalhados' : `Pagamento de R$ ${pendingAction?.data?.amountToPay?.toFixed(2)}`}
                </p>
              </div>

              <button 
                type="submit" 
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 active:scale-95"
              >
                <Key size={18} /> Validar e Confirmar
              </button>
            </form>
          </div>
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

                <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Landmark size={16} className="text-blue-600" />
                    <h5 className="text-[10px] font-black text-blue-800 uppercase tracking-widest">Dados para Pagamento PIX</h5>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Chave PIX (CPF, Celular, E-mail ou Aleatória)</label>
                    <input className="w-full bg-white border-none rounded-xl px-4 py-3 text-sm font-black text-slate-800 focus:ring-4 focus:ring-blue-500/10" placeholder="Insira a chave do funcionário" value={formData.pixKey} onChange={e => setFormData({...formData, pixKey: e.target.value})} />
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
                <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"><Save size={20} className="inline mr-2" /> Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.2s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
};

export default AdminFuncionarios;
