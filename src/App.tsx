import JobCreateForm from './components/JobCreateForm';
import FormBuilder from './components/FormBuilder';
import Sidebar, { type SidebarSection } from './components/Sidebar';

import React from 'react';
import MapComponent from './components/MapComponent';
import LoginScreen from './components/LoginScreen';
import AdminPanel from './components/AdminPanel';

import { fetchUsers, fetchUnits, fetchForms, fetchJobs } from './services/api';
import { addUnit } from './services/unitApi';
import { addUser } from './services/userApi';
import type { User, UserRole } from './data/users';
import type { Unit } from './data/units';

import JobDelegate from './components/JobDelegate';
import JobHistory from './components/JobHistory';
import JobEditForm from './components/JobEditForm';
import UserRow from './components/UserRow';

function App() {
  const [forms, setForms] = React.useState<any[]>([]);
  const [jobs, setJobs] = React.useState<any[]>([]);
  const [currentUser, setCurrentUser] = React.useState<User | null>(() => {
    const stored = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  });
  const [sidebarSection, setSidebarSection] = React.useState<SidebarSection>('users');
  const [users, setUsers] = React.useState<User[]>([]);
  const [units, setUnits] = React.useState<Unit[]>([]);

  React.useEffect(() => {
    fetchUsers().then(setUsers).catch(() => setUsers([]));
    fetchUnits().then(setUnits).catch(() => setUnits([]));
    fetchForms().then(setForms).catch(() => setForms([]));
    fetchJobs().then(setJobs).catch(() => setJobs([]));
  }, []);

  // Oturum değiştiğinde localStorage'a yaz
  React.useEffect(() => {
    if (currentUser) {
      // Eğer localStorage'da yoksa sessionStorage'a yazılmış olabilir, ikisini de temizlemeden önce kontrol et
      if (!localStorage.getItem('currentUser')) {
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
      }
    } else {
      localStorage.removeItem('currentUser');
      sessionStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  if (!currentUser) {
    return <LoginScreen onLogin={setCurrentUser} users={users} />;
  }

  // Superadmin için yeni layout
  if (currentUser.role === 'superadmin') {
    return (
      <div className="min-h-screen flex bg-gray-50">
        <Sidebar selected={sidebarSection} onSelect={setSidebarSection} />
        <main className="flex-1 p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-blue-700">Saha Asistan Yönetim</h1>
            <span className="text-gray-600">{currentUser.name} ({currentUser.role})</span>
            <button className="ml-4 px-3 py-1 bg-gray-200 rounded" onClick={() => setCurrentUser(null)}>Çıkış</button>
          </div>
          {sidebarSection === 'users' && (
            <>
              <AdminPanel
                units={units}
                users={users}
                onAddUser={async user => {
                  try {
                    // user: Omit<User, 'id'>, may include legacy name field, but addUser expects first_name, last_name
                    const { first_name, last_name, unit_id, username, password, role } = user as any;
                    await addUser({ first_name, last_name, unit_id, username, password, role });
                    const updated = await fetchUsers();
                    setUsers(updated);
                  } catch (e) {
                    // Hata yönetimi eklenebilir
                  }
                }}
                onAddUnit={async unit => {
                  try {
                    await addUnit(unit);
                    const updated = await fetchUnits();
                    setUnits(updated);
                  } catch (e) {
                    // Hata yönetimi eklenebilir
                  }
                }}
              />
              <div className="mb-6">
                <h2 className="font-bold text-lg mb-2">Kullanıcılar</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-xl shadow text-sm">
                    <thead>
                      <tr className="bg-blue-50 text-blue-700">
                        <th className="p-2 text-left">Ad</th>
                        <th className="p-2 text-left">Soyad</th>
                        <th className="p-2 text-left">Kullanıcı Adı</th>
                        <th className="p-2 text-left">Rol</th>
                        <th className="p-2 text-left">Birim</th>
                        <th className="p-2 text-left">E-posta</th>
                        <th className="p-2 text-left">Telefon</th>
                        <th className="p-2 text-left">Durum</th>
                        <th className="p-2 text-left">İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <UserRow key={u.id} user={u} units={units} onUpdate={async (id, data) => {
                          try {
                            await import('./services/userApi').then(m => m.updateUser(id, data));
                            const updated = await fetchUsers();
                            setUsers(updated);
                          } catch (e) {}
                        }} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
          {sidebarSection === 'units' && (
            <>
              <AdminPanel
                units={units}
                users={users}
                onAddUser={async user => {
                  try {
                    const { first_name, last_name, unit_id, username, password, role } = user as any;
                    const newUser = await addUser({ first_name, last_name, unit_id, username, password, role });
                    setUsers(prev => [...prev, newUser]);
                  } catch (e) {
                    // Hata yönetimi eklenebilir
                  }
                }}
                onAddUnit={async unit => {
                  try {
                    const newUnit = await addUnit(unit);
                    setUnits(prev => [...prev, newUnit]);
                  } catch (e) {
                    // Hata yönetimi eklenebilir
                  }
                }}
              />
              <div className="mb-6">
                <h2 className="font-bold text-lg mb-2">Birimler</h2>
                <ul className="divide-y bg-white rounded-xl shadow">
                  {units.map(u => (
                    <li key={u.id} className="flex justify-between items-center px-4 py-2">
                      <span>{u.name}</span>
                      <span className="text-xs text-gray-500">{u.parentId ? `Üst: ${units.find(x=>x.id===u.parentId)?.name}` : ''}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
          {sidebarSection === 'forms' && (
            <>
              <FormBuilder
                forms={forms.length ? forms : [{ id: 'default', title: 'Varsayılan İş Formu', fields: [] }]}
                onCreate={form => setForms(prev => [...prev, { id: Date.now().toString(), ...form }])}
                onUpdate={(id, form) => setForms(prev => prev.map(f => f.id === id ? { ...f, ...form } : f))}
              />
              <div className="mb-6">
                <h2 className="font-bold text-lg mb-2">Formlar</h2>
                <ul className="divide-y bg-white rounded-xl shadow">
                  {forms.map(f => (
                    <li key={f.id} className="flex justify-between items-center px-4 py-2">
                      <span>{f.title || f.name}</span>
                      <span className="text-xs text-gray-500">Alan: {f.fields?.length || 0}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </main>
      </div>
    );
  }

  // Diğer roller için eski layout
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-blue-700">Saha Asistan</h1>
          <span className="text-gray-600">{currentUser.name} ({currentUser.role})</span>
          <button className="ml-4 px-3 py-1 bg-gray-200 rounded" onClick={() => setCurrentUser(null)}>Çıkış</button>
        </div>
        {(['superadmin', 'manager'].includes(currentUser.role)) && (
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
              <React.Fragment key={job.id}>
                <div className="bg-white rounded shadow p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-blue-700">{job.title}</div>
                      <div className="text-xs text-gray-500">{job.formTitle}</div>
                    </div>
                    <div className="text-sm text-gray-600">Durum: {job.status}</div>
                  </div>
                  <div className="text-sm text-gray-700 mt-1">{job.description}</div>
                  <div className="mt-2">
                    <span className="text-xs text-gray-500">Atanan: {users.find((u:any)=>u.id===job.assignedTo)?.name}</span>
                    <span className="text-xs text-gray-400 ml-2">Birim: {units.find((u:any)=>u.id===job.unitId)?.name}</span>
                  </div>
                  {/* Devretme */}
                  <JobDelegate
                    job={job}
                    users={users}
                    units={units}
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
                                  details: `${users.find((u:any)=>u.id===newUserId)?.name} kişisine devredildi`,
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
              </React.Fragment>
            ))}
          </div>
        </div>
        <MapComponent />
      </div>
    </div>
  );
}

export default App
