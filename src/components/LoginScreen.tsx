import React, { useState } from 'react';
import { HiUser, HiLockClosed } from 'react-icons/hi';
import { FaMapMarkedAlt } from 'react-icons/fa';
import { login } from '../services/api';
import type { User } from '../data/users';

interface Props {
  onLogin: (user: User) => void;
  users: User[];
}


const LoginScreen: React.FC<Props> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(username, password);
      if (result.success && result.user) {
        // Beni hatırla seçiliyse localStorage, değilse sessionStorage'a yaz
        if (remember) {
          localStorage.setItem('currentUser', JSON.stringify(result.user));
        } else {
          sessionStorage.setItem('currentUser', JSON.stringify(result.user));
        }
        onLogin(result.user);
      } else {
        setError('Kullanıcı adı veya şifre hatalı');
      }
    } catch (err) {
      setError('Giriş başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-400 via-blue-200 to-indigo-200">
      {/* Büyük blur arka plan efekti */}
      <div className="absolute -z-10 left-1/2 top-1/2 w-[700px] h-[700px] bg-blue-300 opacity-30 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute -z-10 right-0 top-0 w-1/3 h-1/3 bg-indigo-200 opacity-40 rounded-bl-3xl blur-2xl" />
      <div className="w-full max-w-md p-0 sm:p-8">
        <div className="bg-white/90 rounded-3xl shadow-2xl border border-blue-100/60 backdrop-blur-xl px-8 py-10 flex flex-col items-center animate-fade-in">
          <div className="flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 mb-6 shadow-lg border-4 border-white">
            <FaMapMarkedAlt className="text-white text-5xl drop-shadow-lg" />
          </div>
          <h1 className="text-4xl font-black text-blue-700 mb-1 tracking-tight drop-shadow">Saha Asistan</h1>
          <h2 className="text-lg font-semibold text-blue-500 mb-8 tracking-wide">Giriş Paneli</h2>
          <form className="w-full" onSubmit={handleLogin}>
            <div className="relative mb-6">
              <span className="absolute left-4 top-3 text-blue-400">
                <HiUser />
              </span>
              <input
                className="w-full pl-12 pr-4 py-3 border border-blue-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50/60 text-gray-700 font-medium placeholder:text-gray-400 shadow-sm transition"
                placeholder="Kullanıcı Adı"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoFocus
                autoComplete="username"
              />
            </div>
            <div className="relative mb-6">
              <span className="absolute left-4 top-3 text-blue-400">
                <HiLockClosed />
              </span>
              <input
                className="w-full pl-12 pr-4 py-3 border border-blue-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50/60 text-gray-700 font-medium placeholder:text-gray-400 shadow-sm transition"
                placeholder="Şifre"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            {error && <div className="text-red-600 text-xs mb-4 text-center font-semibold animate-shake">{error}</div>}
            <label className="flex items-center gap-2 mb-4 select-none">
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="accent-blue-600 w-4 h-4" />
              <span className="text-sm text-gray-600">Beni Hatırla</span>
            </label>
            <button
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg transition-all duration-200 ease-in-out transform hover:scale-[1.04] active:scale-95 disabled:opacity-50 mt-2 tracking-wide text-lg"
              type="submit"
              disabled={!username || !password || loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                  Giriş Yapılıyor...
                </span>
              ) : 'Giriş Yap'}
            </button>
          </form>
        </div>
        <div className="mt-10 text-xs text-gray-400 select-none text-center">© {new Date().getFullYear()} <span className="font-semibold text-blue-700">Saha Asistan</span> | Powered by <span className="text-indigo-500 font-bold">OpenLayers</span></div>
      </div>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.7s cubic-bezier(.4,0,.2,1) both; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(40px);} to { opacity: 1; transform: none; } }
        .animate-shake { animation: shake 0.3s linear; }
        @keyframes shake { 10%, 90% { transform: translateX(-2px); } 20%, 80% { transform: translateX(4px); } 30%, 50%, 70% { transform: translateX(-8px); } 40%, 60% { transform: translateX(8px); } }
      `}</style>
    </div>
  );
};

export default LoginScreen;
