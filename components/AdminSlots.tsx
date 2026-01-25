
import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, Clock, Plus, Trash2, CalendarCheck, ShieldCheck, 
  Lock, Save, CheckCircle2, Key, Share2, Copy, Globe, Download, Database, HardDrive, FileJson, Upload
} from 'lucide-react';
import { AvailableSlot } from '../types.ts';
import { WASH_ID } from '../services/apiService.ts';

interface AdminSlotsProps {
  slots: AvailableSlot[];
  onAddSlot: (date: string, time: string) => void;
  onRemoveSlot: (id: string) => void;
  onRestoreBackup: (data: any) => void;
}

const AdminSlots: React.FC<AdminSlotsProps> = ({ slots, onAddSlot, onRemoveSlot, onRestoreBackup }) => {
  const [activeTab, setActiveTab] = useState<'agenda' | 'seguranca' | 'sync' | 'backup'>('agenda');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinStatus, setPinStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [copySuccess, setCopySuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      return;
    }
    if (newPin !== confirmPin) {
      setPinStatus('error');
      return;
    }
    localStorage.setItem('lavacar_admin_pin', newPin);
    setCurrentPin(newPin);
    setPinStatus('success');
    setNewPin('');
    setConfirmPin('');
    setTimeout(() => setPinStatus('idle'), 3000);
  };

  const downloadBackup = () => {
    const backupData = {
      bookings: JSON.parse(localStorage.getItem(`lavacar_local_db_bookings`) || '[]'),
      staff: JSON.parse(localStorage.getItem(`lavacar_local_db_staff`) || '[]'),
      clients: JSON.parse(localStorage.getItem(`lavacar_local_db_clients`) || '[]'),
      slots: JSON.parse(localStorage.getItem(`lavacar_local_db_slots`) || '[]'),
      adminPin: localStorage.getItem('lavacar_admin_pin') || '1844',
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lavacar_pro_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (confirm('Atenção: Restaurar este backup substituirá todos os dados atuais do sistema. Deseja continuar?')) {
          onRestoreBackup(json);
        }
      } catch (err) {
        alert('Erro ao ler o arquivo de backup. Certifique-se de que é um arquivo JSON válido exportado pelo LavaCar Pro.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10">
        <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Configurações do Sistema</h2>
        <div className="flex gap-4 mt-6 border-b border-slate-200 overflow-x-auto custom-scrollbar">
          {['agenda', 'seguranca', 'sync', 'backup'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-4 px-2 text-[10px] font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${activeTab === tab ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {tab === 'agenda' && 'Agenda do Portal'}
              {tab === 'seguranca' && 'Segurança & PIN'}
              {tab === 'sync' && 'Link do Cliente'}
              {tab === 'backup' && 'Backup Offline'}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"></div>}
            </button>
          ))}
        </div>
      </header>

      {activeTab === 'backup' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                <Download size={28} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Exportar Dados</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Baixe para seu PC pessoal</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <div className="flex items-start gap-4">
                  <div className="bg-white p-3 rounded-xl text-blue-600 shadow-sm">
                    <Database size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Cópia de Segurança</p>
                    <p className="text-xs text-slate-500 mt-1">Baixe todos os agendamentos, clientes e histórico em um arquivo único.</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileJson className="text-blue-600" size={24} />
                  <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest">Formato JSON</span>
                </div>
                <button 
                  onClick={downloadBackup}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                >
                  <Download size={16} /> Baixar
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                <Upload size={28} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Restaurar Dados</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Sincronize outro dispositivo</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <div className="flex items-start gap-4">
                  <div className="bg-white p-3 rounded-xl text-orange-600 shadow-sm">
                    <HardDrive size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Importar Arquivo</p>
                    <p className="text-xs text-slate-500 mt-1">Selecione o arquivo gerado em outro dispositivo para atualizar este painel.</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                <input 
                  type="file" 
                  accept=".json" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleImportBackup} 
                />
                <div className="flex items-center gap-3">
                  <Database className="text-slate-400" size={24} />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Selecione o .json</span>
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                >
                  <Upload size={16} /> Selecionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Horário</label>
                <input type="time" required value={time} onChange={(e) => setTime(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500" />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                Confirmar Disponibilidade
              </button>
            </form>
          </div>
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">Próximos Horários Livres</h3>
                <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{slots.length} Disponíveis</span>
              </div>
              <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                {slots.length === 0 ? (
                  <div className="p-20 text-center flex flex-col items-center gap-4">
                    <CalendarCheck className="text-slate-200" size={64} />
                    <p className="text-slate-400 font-medium">Nenhum horário disponível para o portal.</p>
                  </div>
                ) : (
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Horário</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {slots.map((slot) => (
                        <tr key={slot.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-700">{new Date(slot.date + 'T00:00:00').toLocaleDateString()}</td>
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
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">PIN de Operações</h3>
            </div>
            <form onSubmit={handleUpdatePin} className="space-y-6">
              <input type="password" maxLength={4} required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-center text-3xl font-black tracking-[0.5em]" placeholder="••••" value={newPin} onChange={e => setNewPin(e.target.value)} />
              <input type="password" maxLength={4} required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-center text-3xl font-black tracking-[0.5em]" placeholder="Repita o PIN" value={confirmPin} onChange={e => setConfirmPin(e.target.value)} />
              <button type="submit" className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest transition-all ${pinStatus === 'success' ? 'bg-emerald-500' : 'bg-slate-900'} text-white`}>
                {pinStatus === 'success' ? 'PIN Atualizado!' : 'Salvar PIN'}
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'sync' && (
        <div className="max-w-2xl animate-in slide-in-from-right-4 duration-300">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-8">Link do Cliente</h3>
            <div className="bg-blue-50 p-8 rounded-[2rem] border-2 border-dashed border-blue-200 text-center">
              <p className="text-sm font-bold text-blue-600 truncate mb-4">{window.location.origin}</p>
              <button onClick={() => { navigator.clipboard.writeText(window.location.origin); setCopySuccess(true); setTimeout(() => setCopySuccess(false), 2000); }} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black uppercase text-xs">
                {copySuccess ? 'Copiado!' : 'Copiar Link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSlots;
