import React, { useState } from 'react';
import type { User, UserRole } from '../data/users';
import type { Unit } from '../data/units';

interface Props {
  onAddUser: (user: Omit<User, 'id'>) => void;
  onAddUnit: (unit: Omit<Unit, 'id'>) => void;
  units: Unit[];
  users?: User[]; // Kullanıcılar listesi kontrol için
}

const AdminPanel: React.FC<Props> = ({ onAddUser, onAddUnit, units, users = [] }) => {
  // Uyarı mesajı
  const [error, setError] = useState<string | null>(null);
  // Form seçimi
  const [formType, setFormType] = useState<'user' | 'unit'>('user');
  // Kullanıcı ekleme
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('personel');
  const [userUnit, setUserUnit] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>();
  const [birthDate, setBirthDate] = useState('');
  const [address, setAddress] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isActive, setIsActive] = useState(true);
  // Birim ekleme
  const [unitName, setUnitName] = useState('');
  const [parentUnit, setParentUnit] = useState('');

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 max-w-3xl mx-auto mt-6 border border-gray-100">
      <div className="flex gap-2 mb-6">
        <button
          className={`px-5 py-2 rounded-full font-semibold transition-colors duration-150 shadow-sm border ${formType === 'user' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-50'}`}
          onClick={() => setFormType('user')}
        >Kullanıcı Ekle</button>
        <button
          className={`px-5 py-2 rounded-full font-semibold transition-colors duration-150 shadow-sm border ${formType === 'unit' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-50'}`}
          onClick={() => setFormType('unit')}
        >Birim Ekle</button>
      </div>
      {formType === 'user' && (
        <>
          <h3 className="font-bold text-xl mb-4 text-blue-700">Kullanıcı Ekle</h3>
          {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-2 text-sm">{error}</div>}
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 bg-blue-50/60 p-6 rounded-2xl shadow" onSubmit={e => {
            e.preventDefault();
            setError(null);
            if (!firstName || !lastName || !userUnit || !username || !password) return setError('Ad, soyad, birim, kullanıcı adı ve şifre zorunlu!');
            if (!userRole) return setError('Rol seçimi zorunlu!');
            // Aynı isim ve birimde kullanıcı var mı?
            const exists = users.some(u =>
              typeof u.first_name === 'string' && typeof u.last_name === 'string' && typeof u.unit === 'string' &&
              u.first_name.trim().toLowerCase() === firstName.trim().toLowerCase() &&
              u.last_name.trim().toLowerCase() === lastName.trim().toLowerCase() &&
              u.unit === userUnit
            );
            if (exists) {
              setError('Bu birimde aynı ad ve soyad ile bir kullanıcı zaten var!');
              return;
            }
            // Aynı kullanıcı adı var mı?
            const usernameExists = users.some(u => typeof u.username === 'string' && u.username.trim().toLowerCase() === username.trim().toLowerCase());
            if (usernameExists) {
              setError('Bu kullanıcı adı zaten kullanılıyor!');
              return;
            }
            // API'ye uygun payload
            onAddUser({
              first_name: firstName,
              last_name: lastName,
              unit_id: userUnit,
              username,
              password,
              role: String(userRole)
            } as any);
            setFirstName(''); setLastName(''); setUsername(''); setPassword(''); setUserRole('personel'); setUserUnit(''); setEmail(''); setPhone(''); setGender(undefined); setBirthDate(''); setAddress(''); setProfileImageUrl(''); setNotes(''); setIsActive(true);
          }}>
            <input className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-2 rounded-lg col-span-2 transition" placeholder="Ad" value={firstName} onChange={e=>setFirstName(e.target.value)} />
            <input className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-2 rounded-lg col-span-2 transition" placeholder="Soyad" value={lastName} onChange={e=>setLastName(e.target.value)} />
            <input className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-2 rounded-lg col-span-2 transition" placeholder="Kullanıcı Adı" value={username} onChange={e=>setUsername(e.target.value)} autoComplete="username" />
            <input className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-2 rounded-lg col-span-2 transition" placeholder="Şifre" type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="new-password" />
            <input className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-2 rounded-lg col-span-2 transition" placeholder="E-posta" value={email} onChange={e=>setEmail(e.target.value)} />
            <input className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-2 rounded-lg col-span-2 transition" placeholder="Telefon" value={phone} onChange={e=>setPhone(e.target.value)} />
            <select
              className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-2 rounded-lg transition"
              value={userRole || 'personel'}
              onChange={e => setUserRole((e.target.value || 'personel') as UserRole)}
              required
            >
              <option value="personel">Personel</option>
              <option value="manager">Yönetici</option>
            </select>
            <select className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-2 rounded-lg transition" value={userUnit} onChange={e=>setUserUnit(e.target.value)}>
              <option value="">Birim Seç</option>
              {units.map(u=>(<option key={u.id} value={u.id}>{u.name}</option>))}
            </select>
            <select className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-2 rounded-lg transition" value={gender || ''} onChange={e=>setGender(e.target.value as 'male' | 'female' | 'other')}>
              <option value="">Cinsiyet</option>
              <option value="male">Erkek</option>
              <option value="female">Kadın</option>
              <option value="other">Diğer</option>
            </select>
            <input className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-2 rounded-lg transition" type="date" placeholder="Doğum Tarihi" value={birthDate} onChange={e=>setBirthDate(e.target.value)} />
            <input className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-2 rounded-lg col-span-2 transition" placeholder="Adres" value={address} onChange={e=>setAddress(e.target.value)} />
            <input className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-2 rounded-lg col-span-2 transition" placeholder="Profil Fotoğrafı URL" value={profileImageUrl} onChange={e=>setProfileImageUrl(e.target.value)} />
            <textarea className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-2 rounded-lg col-span-2 transition" placeholder="Notlar" value={notes} onChange={e=>setNotes(e.target.value)} />
            <label className="flex items-center col-span-2 gap-2 text-sm mt-2">
              <input type="checkbox" checked={isActive} onChange={e=>setIsActive(e.target.checked)} className="accent-blue-600 w-4 h-4" /> Aktif mi?
            </label>
            <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg mt-2 col-span-2 font-semibold shadow transition" type="submit">Kullanıcı Ekle</button>
          </form>
        </>
      )}
      {formType === 'unit' && (
        <>
          <h3 className="font-bold text-xl mb-4 text-green-700">Birim Ekle</h3>
          {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-2 text-sm">{error}</div>}
          <form className="flex flex-col gap-4 bg-green-50/60 p-6 rounded-2xl shadow" onSubmit={e => {
            e.preventDefault();
            setError(null);
            if (!unitName) return setError('Birim adı zorunlu!');
            // Aynı isimde birim var mı?
            const exists = units.some(u => u.name.trim().toLowerCase() === unitName.trim().toLowerCase());
            if (exists) {
              setError('Bu isimde bir birim zaten var!');
              return;
            }
            onAddUnit(parentUnit ? { name: unitName, parentId: parentUnit } : { name: unitName });
            setUnitName('');
            setParentUnit('');
          }}>
            <input className="border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-100 p-2 rounded-lg transition" placeholder="Birim Adı" value={unitName} onChange={e=>setUnitName(e.target.value)} />
            <select className="border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-100 p-2 rounded-lg transition" value={parentUnit} onChange={e=>setParentUnit(e.target.value)}>
              <option value="">Üst Birim (yok)</option>
              {units.map(u=>(<option key={u.id} value={u.id}>{u.name}</option>))}
            </select>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold shadow transition" type="submit">Ekle</button>
          </form>
        </>
      )}
    </div>
  );
};

export default AdminPanel;
