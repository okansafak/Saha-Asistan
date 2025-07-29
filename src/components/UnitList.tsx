import React from 'react';
import type { User } from '../data/users';
import type { Unit } from '../data/units';

interface Props {
  users: User[];
  units: Unit[];
}


function renderUnitTree(units: Unit[], users: User[], parentId?: string, level = 0) {
  return (
    <ul className={level === 0 ? '' : 'ml-4'}>
      {units.filter(u => u.parentId === parentId).map(unit => (
        <li key={unit.id} className="mb-2">
          <span className="font-semibold text-blue-700">{unit.name}</span>
          <ul className="ml-4 text-sm text-gray-700">
            {users.filter(u => u.unit === unit.name).map(u => (
              <li key={u.id}>{u.name} ({u.role})</li>
            ))}
          </ul>
          {renderUnitTree(units, users, unit.id, level + 1)}
        </li>
      ))}
    </ul>
  );
}

const UnitList: React.FC<Props> = ({ users, units }) => {
  return (
    <div className="bg-white rounded shadow p-4 mb-4">
      <h3 className="font-bold mb-2">Birimler ve Kullanıcılar</h3>
      {renderUnitTree(units, users)}
    </div>
  );
};

export default UnitList;
