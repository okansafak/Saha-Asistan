import JobCreateForm from './components/JobCreateForm';
import FormBuilder from './components/FormBuilder';

import React from 'react';
import MapComponent from './components/MapComponent';
import LoginScreen from './components/LoginScreen';
import UnitList from './components/UnitList';
import AdminPanel from './components/AdminPanel';
import { demoUsers, type User, type UserRole } from './data/users';
import { demoUnits, type Unit } from './data/units';

import JobDelegate from './components/JobDelegate';
import JobHistory from './components/JobHistory';
import JobEditForm from './components/JobEditForm';

function App() {
  const [forms, setForms] = React.useState<any[]>([]);
  const [jobs, setJobs] = React.useState<any[]>([]);
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [users, setUsers] = React.useState<User[]>(demoUsers);
  const [units, setUnits] = React.useState<Unit[]>(demoUnits);

  if (!currentUser) {
    return <LoginScreen onLogin={setCurrentUser} users={users} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-blue-700">Saha Asistan</h1>
          <span className="text-gray-600">{currentUser.name} ({currentUser.role})</span>
          <button className="ml-4 px-3 py-1 bg-gray-200 rounded" onClick={() => setCurrentUser(null)}>Çıkış</button>
        </div>
        {/* Sadece superadmin birim ve kullanıcı yönetimi görebilir */}
        {currentUser.role === 'superadmin' && (
          <>
            <AdminPanel
              units={units}
              onAddUser={user => setUsers(prev => [...prev, { ...user, id: Date.now().toString(), role: user.role as UserRole }])}
              onAddUnit={unit => setUnits(prev => [...prev, { ...unit, id: Date.now().toString() }])}
            />
            <div className="mb-6">
              <UnitList users={users} units={units} />
            </div>
          </>
        )}
        {(currentUser.role === 'superadmin' || currentUser.role === 'manager') && (
          <>
            <FormBuilder
              forms={forms.length ? forms : [{ id: 'default', title: 'Varsayılan İş Formu', fields: [] }]}
              onCreate={form => setForms(prev => [...prev, { id: Date.now().toString(), ...form }])}
              onUpdate={(id, form) => setForms(prev => prev.map(f => f.id === id ? { ...f, ...form } : f))}
            />
            <JobCreateForm
              users={users}
              units={units}
              forms={forms.length ? forms : [{ id: 'default', title: 'Varsayılan İş Formu', fields: [] }]}
              currentUser={currentUser}
              onCreate={job => setJobs(prev => [
                ...prev,
                {
                  id: Date.now().toString(),
                  ...job,
                  status: 'atandi',
                  formData: {},
                  history: [{ date: new Date().toISOString(), action: 'Oluşturuldu', userId: currentUser.id }],
                },
              ])}
            />
          </>
        )}

        {/* İş Listesi ve Devretme/Geçmiş */}
        <div className="my-6">
          <h2 className="text-lg font-bold mb-2">İşler</h2>
          {jobs.length === 0 && <div className="text-gray-500">Henüz iş yok.</div>}
          <div className="space-y-4">
            {jobs.map(job => (
              <div key={job.id} className="bg-white rounded shadow p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-blue-700">{job.title}</div>
                    <div className="text-xs text-gray-500">{job.formTitle}</div>
                  </div>
                  <div className="text-sm text-gray-600">Durum: {job.status}</div>
                </div>
                <div className="text-sm text-gray-700 mt-1">{job.description}</div>
                <div className="mt-2">
                  <span className="text-xs text-gray-500">Atanan: {users.find(u=>u.id===job.assignedTo)?.name}</span>
                  <span className="text-xs text-gray-400 ml-2">Birim: {units.find(u=>u.id===job.unitId)?.name}</span>
                </div>
                {/* Devretme */}
                <JobDelegate
                  job={job}
                  users={users}
                  currentUser={currentUser}
                  onDelegate={(jobId, newUserId) => {
                    setJobs(prev => prev.map(j =>
                      j.id === jobId
                        ? {
                            ...j,
                            assignedTo: newUserId,
                            history: [
                              ...j.history,
                              {
                                date: new Date().toISOString(),
                                action: 'Devredildi',
                                userId: currentUser.id,
                                details: `${users.find(u=>u.id===newUserId)?.name} kişisine devredildi`,
                              },
                            ],
                          }
                        : j
                    ));
                  }}
                />
                {/* Form ve durum düzenleme: sadece atanan kişi */}
                <JobEditForm
                  job={job}
                  users={users}
                  units={units}
                  forms={forms.length ? forms : [{ id: 'default', title: 'Varsayılan İş Formu', fields: [] }]}
                  currentUser={currentUser}
                  onUpdate={(jobId, updated) => {
                    setJobs(prev => prev.map(j =>
                      j.id === jobId
                        ? {
                            ...j,
                            ...updated,
                            history: [
                              ...j.history,
                              {
                                date: new Date().toISOString(),
                                action: 'Güncellendi',
                                userId: currentUser.id,
                                details: 'Form veya durum güncellendi',
                              },
                            ],
                          }
                        : j
                    ));
                  }}
                />
                {/* Geçmiş */}
                <JobHistory job={job} users={users} />
              </div>
            ))}
          </div>
        </div>
        <MapComponent />
      </div>
    </div>
  );
}

export default App
