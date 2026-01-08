
import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Plus, Trash2, CalendarCheck, ShieldCheck, 
  Lock, Save, CheckCircle2, Key, Share2, Copy, Globe 
} from 'lucide-react';
import { AvailableSlot } from '../types.ts';

interface AdminSlotsProps {
  slots: AvailableSlot[];
  onAddSlot: (date: string, time: string) => void;
  onRemoveSlot: (id: string) => void;
}

const AdminSlots: React.FC<AdminSlotsProps> = ({ slots, onAddSlot, onRemoveSlot }) => {
  const [activeTab, setActiveTab] = useState<'agenda' | 'seguranca' | 'sync'>('agenda');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  
  // PIN State
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinStatus, setPinStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const savedPin = localStorage.getItem('lavacar_admin_pin') || '1844';
    setCurrentPin(savedPin);
  }, []);

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) return;
    onAddSlot(date, time);
    setTime('');
  };

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      setPinStatus('error');
      alert('O PIN deve conter exatamente 4 dígitos numéricos.');
      return;
    }
    if (newPin !== confirmPin) {
      setPinStatus('error');
      alert('A confirmação do PIN não confere.');
      return;
    }

    localStorage.setItem('lavacar_admin_pin', newPin);
    setCurrentPin(newPin);
    setPinStatus('success');
    setNewPin('');
    setConfirmPin('');
    setTimeout(() => setPinStatus('idle'), 3000);
  };

  const copySyncLink = () => {
    const url = window.location.origin;
    navigator.clipboard.writeText(url);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10">
        <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Configurações do Sistema</h2>
        <div className="flex gap-4 mt-6 border-b border-slate-200 overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => setActiveTab('agenda')}
            className={`pb-4 px-2 text-[10px] font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${activeTab === 'agenda' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Agenda do Portal
            {activeTab === 'agenda' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('seguranca')}
            className={`pb-4 px-2 text-[10px] font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${activeTab === 'seguranca' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Segurança & PIN
            {activeTab === 'seguranca' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('sync')}
            className={`pb-4 px-2 text-[10px] font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${activeTab === 'sync' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Link do Cliente
            {activeTab === 'sync' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"></div>}
          </button>
        </div>
      </header>

      {activeTab === 'agenda' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
          <div className="lg:col-span-1">
            <form onSubmit={handleAddSlot} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Plus className="text-blue-600" size={20} />
                Liberar Horário
              </h3>
              
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Data</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl pl-10 pr-4 py-3 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Horário</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="time" required value={time} onChange={(e) => setTime(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl pl-10 pr-4 py-3 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                Confirmar Disponibilidade
              </button>
            </form>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">Próximos Horários Livres</h3>
                <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                  {slots.length} Disponíveis
                </span>
              </div>
              <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                {slots.length === 0 ? (
                  <div className="p-20 text-center flex flex-col items-center gap-4">
                    <CalendarCheck className="text-slate-200" size={64} />
                    <p className="text-slate-400 font-medium">Nenhum horário disponível para o portal.</p>
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
                          <td className="px-6 py-4 font-bold text-slate-700">{new Date(slot.date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                          <td className="px-6 py-4 font-bold text-blue-600">{slot.time}</td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => onRemoveSlot(slot.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
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
      )}

      {activeTab === 'seguranca' && (
        <div className="max-w-xl animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
                <Lock size={28} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">PIN de Operações</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Proteção para Pagamentos e Folha</p>
              </div>
            </div>

            <form onSubmit={handleUpdatePin} className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center justify-between mb-8">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status de Segurança</p>
                  <p className="text-sm font-bold text-emerald-600 flex items-center gap-2">
                    <ShieldCheck size={16} /> PIN Ativo no Dispositivo
                  </p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">PIN Atual</p>
                   <p className="text-sm font-black text-slate-800 tracking-[0.2em]">****</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Novo PIN (4 dígitos)</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="password" 
                      maxLength={4}
                      pattern="\d*"
                      inputMode="numeric"
                      required
                      className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 text-lg font-black tracking-[0.5em] text-slate-800 focus:ring-4 focus:ring-blue-500/5 transition-all"
                      placeholder="••••"
                      value={newPin}
                      onChange={e => setNewPin(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirmar Novo PIN</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="password" 
                      maxLength={4}
                      pattern="\d*"
                      inputMode="numeric"
                      required
                      className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 text-lg font-black tracking-[0.5em] text-slate-800 focus:ring-4 focus:ring-blue-500/5 transition-all"
                      placeholder="••••"
                      value={confirmPin}
                      onChange={e => setConfirmPin(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95 ${
                  pinStatus === 'success' 
                  ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                  : 'bg-slate-900 text-white shadow-slate-900/20 hover:bg-slate-800'
                }`}
              >
                {pinStatus === 'success' ? (
                  <><CheckCircle2 size={20} /> PIN Atualizado!</>
                ) : (
                  <><Save size={20} /> Salvar Configurações de PIN</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'sync' && (
        <div className="max-w-2xl animate-in slide-in-from-right-4 duration-300">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                <Globe size={28} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Seu Link Público</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Divulgue para seus clientes</p>
              </div>
            </div>

            <div className="bg-blue-50 p-8 rounded-[2rem] border-2 border-dashed border-blue-200 text-center space-y-6">
              <div>
                <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Link Direto para Agendamento:</p>
                <div className="bg-white p-4 rounded-2xl border border-blue-100 flex items-center gap-3 overflow-hidden shadow-sm">
                  <p className="flex-1 text-sm font-bold text-blue-600 truncate text-left">
                    {window.location.origin}
                  </p>
                  <button 
                    onClick={copySyncLink}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${copySuccess ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                  >
                    {copySuccess ? <><CheckCircle2 size={14} /> Copiado!</> : <><Copy size={14} /> Copiar Link</>}
                  </button>
                </div>
              </div>

              <div className="bg-white/50 p-6 rounded-2xl border border-blue-100/50 text-left">
                <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Share2 size={14} /> Por que esse link?
                </h4>
                <p className="text-xs font-medium text-slate-500 leading-relaxed">
                  Qualquer pessoa que acessar este endereço verá automaticamente os seus horários disponíveis e poderá agendar. Você não precisa enviar códigos ou IDs complexos.
                </p>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-600">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest">Sincronização em Tempo Real Ativa</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSlots;
