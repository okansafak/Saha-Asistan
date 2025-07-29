import React, { useState } from 'react';
import type { User } from '../data/users';

interface Props {
  onLogin: (user: User) => void;
  users: User[];
}

const LoginScreen: React.FC<Props> = ({ onLogin, users }) => {
  const [selected, setSelected] = useState<string>('');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow w-full max-w-xs">
        <h2 className="text-xl font-bold mb-4 text-center">Kullanıcı Girişi</h2>
        <select
          className="w-full mb-4 p-2 border rounded"
          value={selected}
          onChange={e => setSelected(e.target.value)}
        >
          <option value="">Kullanıcı Seçiniz</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.role})
            </option>
          ))}
        </select>
        <button
          className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
          disabled={!selected}
          onClick={() => {
            const user = users.find(u => u.id === selected);
            if (user) onLogin(user);
          }}
        >
          Giriş Yap
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;
