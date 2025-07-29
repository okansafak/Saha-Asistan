import React from 'react';
import type { Job } from '../data/jobs';
import type { User } from '../data/users';
import { demoUnits, type Unit } from '../data/units';

interface Props {
  job: Job;
  users: User[];
  currentUser: User;
  onDelegate: (jobId: string, newUserId: string) => void;
}

// Alt birimleri de dahil ederek birim id'lerini döndürür
function getUnitAndChildren(unitId: string, units: Unit[]): string[] {
  const children = units.filter(u => u.parentId === unitId);
  return [unitId, ...children.flatMap(c => getUnitAndChildren(c.id, units))];
}

const JobDelegate: React.FC<Props> = ({ job, users, currentUser, onDelegate }) => {
  const [selectedUnit, setSelectedUnit] = React.useState('');
  const [newUserId, setNewUserId] = React.useState('');
  const canDelegate = currentUser.id === job.assignedTo && (currentUser.role === 'manager' || currentUser.role === 'superadmin');

  // Yöneticinin birimi (id veya name olabilir)
  const managerUnit = currentUser.unit;
  // Tüm birimler (demoUnits)
  const units: Unit[] = demoUnits;

  // Yöneticinin birimi ve alt birimleri
  const allowedUnitIds = managerUnit ? getUnitAndChildren(
    units.find(u => u.id === managerUnit) ? managerUnit : (units.find(u => u.name === managerUnit)?.id || ''),
    units
  ) : [];

  // Seçilen birim ve altındaki kullanıcılar
  const availableUsers = users.filter(u =>
    u.id !== currentUser.id &&
    selectedUnit && (u.unit === selectedUnit || units.find(x => x.id === selectedUnit)?.name === u.unit)
  );

  if (!canDelegate) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-300 rounded p-3 my-2">
      <div className="mb-2 font-semibold">İşi Devret</div>
      <select className="border p-2 rounded w-full mb-2" value={selectedUnit} onChange={e => { setSelectedUnit(e.target.value); setNewUserId(''); }}>
        <option value="">Birim/Altbirim Seç</option>
        {allowedUnitIds.map(uid => {
          const unit = units.find(u => u.id === uid);
          return unit ? <option key={uid} value={uid}>{unit.name}</option> : null;
        })}
      </select>
      <select className="border p-2 rounded w-full" value={newUserId} onChange={e => setNewUserId(e.target.value)} disabled={!selectedUnit}>
        <option value="">Kişi Seç</option>
        {availableUsers.map(u => (
          <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
        ))}
      </select>
      <button
        className="bg-yellow-600 text-white py-1 px-4 rounded mt-2 w-full disabled:opacity-50"
        disabled={!newUserId}
        onClick={() => {
          if (newUserId) onDelegate(job.id, newUserId);
        }}
      >
        Devret
      </button>
    </div>
  );
};

export default JobDelegate;
