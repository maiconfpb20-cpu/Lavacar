
import React, { useState } from 'react';
import { Lock, User, ArrowLeft, Droplets, AlertCircle, Share2, Key } from 'lucide-react';
import { switchUnit } from '../services/apiService.ts';

interface LoginProps {
  onLoginSuccess: () => void;
  onBack: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showSyncInput, setShowSyncInput] = useState(false);
  const [syncCode, setSyncCode] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'lava1844' && password === 'lava1844') {
      onLoginSuccess();
    } else {
      setError('Credenciais incorretas. Tente novamente.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleConnectUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (syncCode.length < 5) return;
    if (confirm(`Conectar à unidade ${syncCode}? Seus dados locais serão substituídos pelos dados desta unidade.`)) {
      switchUnit(syncCode);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <button 
        onClick={onBack}
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="font-bold text-sm uppercase tracking-widest">Voltar ao Início</span>
      </button>

      <div className="w-full max-w-md bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100">
        <div className="flex flex-col items-center mb-10">
          <div className="bg-blue-600 p-4 rounded-3xl mb-4 shadow-lg shadow-blue-600/20">
            <div className="bg-blue-600 p-2 rounded-xl">
               <Droplets className="text-white" size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight text-center">LavaCar Pro Admin</h1>
          <p className="text-slate-400 text-sm font-medium mt-1">Acesso Restrito à Gestão</p>
        </div>

        {!showSyncInput ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase ml-1 tracking-widest">Usuário</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                  placeholder="Seu login"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase ml-1 tracking-widest">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                  placeholder="Sua senha"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-xl">
                <AlertCircle size={18} />
                <span className="text-xs font-bold">{error}</span>
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-[#0f172a] text-white py-5 rounded-3xl font-black text-lg shadow-xl shadow-slate-200 hover:bg-slate-800 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
            >
              ENTRAR NO PAINEL
            </button>

            <button 
              type="button"
              onClick={() => setShowSyncInput(true)}
              className="w-full flex items-center justify-center gap-2 text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline"
            >
              <Share2 size={12} /> Conectar a uma Unidade Existente
            </button>
          </form>
        ) : (
          <form onSubmit={handleConnectUnit} className="space-y-6">
            <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 mb-4">
              <p className="text-xs font-bold text-blue-700 leading-tight">
                Use o código de sincronização que aparece nas Configurações do seu aparelho principal.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase ml-1 tracking-widest">Código da Unidade</label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  required
                  autoFocus
                  value={syncCode}
                  onChange={(e) => setSyncCode(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all font-black tracking-widest uppercase"
                  placeholder="000-000"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black text-lg shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
            >
              CONECTAR AGORA
            </button>

            <button 
              type="button"
              onClick={() => setShowSyncInput(false)}
              className="w-full flex items-center justify-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:underline"
            >
              Voltar ao Login
            </button>
          </form>
        )}
      </div>

      <p className="mt-8 text-slate-300 text-xs font-bold uppercase tracking-[0.2em]">
        LavaCar Pro • Cloud Connect
      </p>
    </div>
  );
};

export default Login;
