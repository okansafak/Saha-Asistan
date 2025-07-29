import React from 'react';
import type { Job } from '../data/jobs';
import type { User } from '../data/users';
import type { Unit } from '../data/units';
// Eğer '../data/units' dosyasında 'demoUnits' yerine 'units' veya başka bir isimle export varsa, ona göre import edin.
// Eğer 'demoUnits' hiç yoksa, ilgili array'i orada export edin veya burada doğru ismi kullanın.
// demoUnits yoksa, units array'ini burada import edin
interface Props {
  job: Job;
  users: User[];
  units: Unit[];
  currentUser: User;
  onDelegate: (jobId: string, newUserId: string) => void;
}

// Alt birimleri de dahil ederek birim id'lerini döndürür
function getUnitAndChildren(unitId: string, units: Unit[]): string[] {
  const children = units.filter((u: Unit) => u.parentId === unitId);
  return [unitId, ...children.flatMap((c: Unit) => getUnitAndChildren(c.id, units))];
}

const JobDelegate: React.FC<Props> = ({ job, users, units, currentUser, onDelegate }) => {
  const [selectedUnit, setSelectedUnit] = React.useState('');
  const [newUserId, setNewUserId] = React.useState('');
  const canDelegate = currentUser.id === job.assignedTo && (currentUser.role === 'manager' || currentUser.role === 'superadmin');

  // Yöneticinin birimi (id veya name olabilir)
  const managerUnit = currentUser.unit;
  // Tüm birimler props ile geliyor

  // Yöneticinin birimi ve alt birimleri
  const allowedUnitIds = managerUnit ? getUnitAndChildren(
    units.find((u: Unit) => u.id === managerUnit) ? managerUnit : (units.find((u: Unit) => u.name === managerUnit)?.id || ''),
    units
  ) : [];

  // Seçilen birim ve altındaki kullanıcılar
  const availableUsers = users.filter((u: User) =>
    u.id !== currentUser.id &&
    selectedUnit && (u.unit === selectedUnit || units.find((x: Unit) => x.id === selectedUnit)?.name === u.unit)
  );

  if (!canDelegate) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-300 rounded p-3 my-2">
      <div className="mb-2 font-semibold">İşi Devret</div>
      <select className="border p-2 rounded w-full mb-2" value={selectedUnit} onChange={e => { setSelectedUnit(e.target.value); setNewUserId(''); }}>
        <option value="">Birim/Altbirim Seç</option>
        {allowedUnitIds.map((uid: string) => {
          const unit = units.find((u: Unit) => u.id === uid);
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
