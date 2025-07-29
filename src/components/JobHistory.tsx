import React from 'react';
import type { Job } from '../data/jobs';
import type { User } from '../data/users';

interface Props {
  job: Job;
  users: User[];
}

const JobHistory: React.FC<Props> = ({ job, users }) => {
  return (
    <div className="bg-gray-100 rounded p-3 my-2">
      <div className="font-semibold mb-2">İş Geçmişi</div>
      <ul className="text-sm space-y-1">
        {job.history.map((h, i) => {
          const user = users.find(u => u.id === h.userId);
          return (
            <li key={i} className="flex items-center gap-2">
              <span className="text-gray-600">{new Date(h.date).toLocaleString('tr-TR')}</span>
              <span className="font-medium">{h.action}</span>
              {user && <span className="text-blue-700">{user.name}</span>}
              {h.details && <span className="text-gray-500">- {h.details}</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default JobHistory;
