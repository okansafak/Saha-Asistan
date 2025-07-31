import React, { useState } from 'react';
import type { User, UserRole } from '../data/users';
import type { Unit } from '../data/units';

interface Props {
  user: User;
  units: Unit[];
  onUpdate: (id: string, data: Partial<User>) => void;
}

const UserRow: React.FC<Props> = ({ user, units, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    username: user.username || '',
    role: user.role,
    unit: user.unit || '',
    email: user.email || '',
    phone: user.phone || '',
    isActive: user.isActive !== false,
  });
  const [deleting, setDeleting] = useState(false);

  const handleSave = () => {
    onUpdate(user.id, form);
    setEditing(false);
  };

  const handleDelete = async () => {
    if (user.role === 'superadmin') return;
    setDeleting(true);
    try {
      await import('../services/userApi').then(m => m.deleteUser(user.id));
    } catch (e) {}
    setDeleting(false);
  };

  if (editing) {
    return (
      <tr className="bg-yellow-50">
        <td className="p-2"><input className="border p-1 rounded w-full" value={form.first_name} onChange={e=>setForm(f=>({...f, first_name: e.target.value}))} /></td>
        <td className="p-2"><input className="border p-1 rounded w-full" value={form.last_name} onChange={e=>setForm(f=>({...f, last_name: e.target.value}))} /></td>
        <td className="p-2"><input className="border p-1 rounded w-full" value={form.username} onChange={e=>setForm(f=>({...f, username: e.target.value}))} /></td>
        <td className="p-2">
          <select className="border p-1 rounded w-full" value={form.role} onChange={e=>setForm(f=>({...f, role: e.target.value as UserRole}))}>
            <option value="personel">Personel</option>
            <option value="manager">Yönetici</option>
            <option value="superadmin">Superadmin</option>
          </select>
        </td>
        <td className="p-2">
          <select className="border p-1 rounded w-full" value={form.unit} onChange={e=>setForm(f=>({...f, unit: e.target.value}))}>
            <option value="">Seç</option>
            {units.map(u=>(<option key={u.id} value={u.id}>{u.name}</option>))}
          </select>
        </td>
        <td className="p-2"><input className="border p-1 rounded w-full" value={form.email} onChange={e=>setForm(f=>({...f, email: e.target.value}))} /></td>
        <td className="p-2"><input className="border p-1 rounded w-full" value={form.phone} onChange={e=>setForm(f=>({...f, phone: e.target.value}))} /></td>
        <td className="p-2 text-center"><input type="checkbox" checked={form.isActive} onChange={e=>setForm(f=>({...f, isActive: e.target.checked}))} /></td>
        <td className="p-2 flex gap-2">
          <button className="bg-green-600 text-white px-2 py-1 rounded" onClick={handleSave}>Kaydet</button>
          <button className="bg-gray-300 px-2 py-1 rounded" onClick={()=>setEditing(false)}>Vazgeç</button>
          {user.role !== 'superadmin' && (
            <button className="bg-red-600 text-white px-2 py-1 rounded" onClick={handleDelete} disabled={deleting}>{deleting ? 'Siliniyor...' : 'Sil'}</button>
          )}
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td className="p-2">{user.first_name}</td>
      <td className="p-2">{user.last_name}</td>
      <td className="p-2">{user.username}</td>
      <td className="p-2">{user.role}</td>
      <td className="p-2">{units.find(u=>u.id==user.unit)?.name || user.unit || '-'}</td>
      <td className="p-2">{user.email || '-'}</td>
      <td className="p-2">{user.phone || '-'}</td>
      <td className="p-2">{user.gender || '-'}</td>
      <td className="p-2">{user.birthDate ? new Date(user.birthDate).toLocaleDateString('tr-TR') : '-'}</td>
      <td className="p-2 text-center">
        {user.profileImageBase64 ? (
          <img src={user.profileImageBase64} alt="Profil" className="w-8 h-8 rounded-full object-cover mx-auto" />
        ) : '-' }
      </td>
      <td className="p-2">
        {user.socialMedia ? (
          <div className="flex gap-1">
            {user.socialMedia.x && <span title="X">🕊️</span>}
            {user.socialMedia.tiktok && <span title="Tiktok">🎵</span>}
            {user.socialMedia.facebook && <span title="Facebook">📘</span>}
            {user.socialMedia.instagram && <span title="Instagram">📸</span>}
          </div>
        ) : '-' }
      </td>
      <td className="p-2">{user.address || '-'}</td>
      <td className="p-2">{user.notes || '-'}</td>
      <td className="p-2 text-center">{user.isActive !== false ? 'Aktif' : 'Pasif'}</td>
      <td className="p-2">{user.createdAt ? new Date(user.createdAt).toLocaleString('tr-TR') : '-'}</td>
      <td className="p-2">{user.updatedAt ? new Date(user.updatedAt).toLocaleString('tr-TR') : '-'}</td>
      <td className="p-2 flex gap-2">
        <button className="bg-blue-600 text-white px-2 py-1 rounded" onClick={()=>setEditing(true)}>Düzenle</button>
        {user.role !== 'superadmin' && (
          <button className="bg-red-600 text-white px-2 py-1 rounded" onClick={handleDelete} disabled={deleting}>{deleting ? 'Siliniyor...' : 'Sil'}</button>
        )}
      </td>
    </tr>
  );
};

export default UserRow;
