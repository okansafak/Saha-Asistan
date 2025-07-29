import React, { useState } from 'react';
import type { User } from '../data/users';
import type { Unit } from '../data/units';

interface Props {
  onAddUser: (user: Omit<User, 'id'>) => void;
  onAddUnit: (unit: Omit<Unit, 'id'>) => void;
  units: Unit[];
}

const AdminPanel: React.FC<Props> = ({ onAddUser, onAddUnit, units }) => {
  // Kullanıcı ekleme
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('personel');
  const [userUnit, setUserUnit] = useState('');
  // Birim ekleme
  const [unitName, setUnitName] = useState('');
  const [parentUnit, setParentUnit] = useState('');

  return (
    <div className="bg-white rounded shadow p-4 mb-6">
      <h3 className="font-bold mb-2">Kullanıcı Ekle</h3>
      <form className="flex flex-col gap-2 mb-4" onSubmit={e => {e.preventDefault(); if(userName && userUnit) {onAddUser({name:userName,role:userRole,unit:userUnit}); setUserName(''); setUserUnit('');}}}>
        <input className="border p-2 rounded" placeholder="Ad Soyad" value={userName} onChange={e=>setUserName(e.target.value)} />
        <select className="border p-2 rounded" value={userRole} onChange={e=>setUserRole(e.target.value)}>
          <option value="personel">Personel</option>
          <option value="manager">Yönetici</option>
        </select>
        <select className="border p-2 rounded" value={userUnit} onChange={e=>setUserUnit(e.target.value)}>
          <option value="">Birim Seç</option>
          {units.map(u=>(<option key={u.id} value={u.name}>{u.name}</option>))}
        </select>
        <button className="bg-blue-600 text-white py-2 rounded mt-2" type="submit">Kullanıcı Ekle</button>
      </form>
      <h3 className="font-bold mb-2">Birim Ekle</h3>
      <form className="flex flex-col gap-2" onSubmit={e => {
        e.preventDefault();
        if(unitName) {
          onAddUnit(parentUnit ? { name: unitName, parentId: parentUnit } : { name: unitName });
          setUnitName('');
          setParentUnit('');
        }
      }}>
        <input className="border p-2 rounded" placeholder="Birim Adı" value={unitName} onChange={e=>setUnitName(e.target.value)} />
        <select className="border p-2 rounded" value={parentUnit} onChange={e=>setParentUnit(e.target.value)}>
          <option value="">Üst Birim (yok)</option>
          {units.map(u=>(<option key={u.id} value={u.id}>{u.name}</option>))}
        </select>
        <button className="bg-green-600 text-white px-4 rounded" type="submit">Ekle</button>
      </form>
    </div>
  );
};

export default AdminPanel;
