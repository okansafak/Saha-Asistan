import JobCreateForm from './components/JobCreateForm';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { DataGrid } from '@mui/x-data-grid';
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
// import UserRow from './components/UserRow';

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
  // Kullanıcı ekleme dialog state
  const [userDialogOpen, setUserDialogOpen] = React.useState(false);
  // DataGrid pagination state
  const [userTablePagination, setUserTablePagination] = React.useState<{ page: number; pageSize: number }>({ page: 0, pageSize: 10 });

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
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', display: 'flex', flexDirection: 'row' }}>
        <Sidebar selected={sidebarSection} onSelect={setSidebarSection} />
        <Box
          component="main"
          sx={{
            flex: 1,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            marginLeft: '240px',
            overflowX: 'auto',
            width: 'calc(100vw - 240px)',
            boxSizing: 'border-box',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#2563eb' }}>Saha Asistan Yönetim</h1>
            <span style={{ color: '#334155' }}>{currentUser.name} ({currentUser.role})</span>
            <button style={{ marginLeft: 16, padding: '6px 16px', background: '#e0e7ef', borderRadius: 8, border: 0, fontWeight: 600, cursor: 'pointer' }} onClick={() => setCurrentUser(null)}>Çıkış</button>
          </Box>
          {sidebarSection === 'users' && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <h2 style={{ fontWeight: 700, fontSize: 20 }}>Kullanıcılar</h2>
                <Button variant="contained" color="primary" onClick={() => setUserDialogOpen(true)} sx={{ fontWeight: 700, borderRadius: 2 }}>Kullanıcı Ekle</Button>
              </Box>
              <Box sx={{ height: 520, width: '100%', minWidth: 900, maxWidth: 1200, margin: '0 auto', overflowX: 'auto', background: '#fff', borderRadius: 3, boxShadow: 2, p: 2 }}>
                <DataGrid
                  rows={users.map(u => {
                    // Try to resolve unit id from both u.unit and u.unit_id
                    const unitId = (u as any).unit_id || u.unit;
                    const unitName = unitId ? (units.find(unit => unit.id === unitId)?.name || '-') : '-';
                    return {
                      id: u.id,
                      ad: u.first_name || '-',
                      soyad: u.last_name || '-',
                      kullaniciAdi: u.username || '-',
                      rol: u.role || '-',
                      birim: unitName,
                      email: u.email || '-',
                      telefon: u.phone || '-',
                      durum: u.isActive !== false ? 'Aktif' : 'Pasif',
                    };
                  })}
                  columns={[
                    { field: 'ad', headerName: 'Ad', minWidth: 100, flex: 1, sortable: true, filterable: true },
                    { field: 'soyad', headerName: 'Soyad', minWidth: 100, flex: 1, sortable: true, filterable: true },
                    { field: 'kullaniciAdi', headerName: 'Kullanıcı Adı', minWidth: 120, flex: 1, sortable: true, filterable: true },
                    { field: 'rol', headerName: 'Rol', minWidth: 90, flex: 1, sortable: true, filterable: true },
                    { field: 'birim', headerName: 'Birim', minWidth: 120, flex: 1, sortable: true, filterable: true },
                    { field: 'email', headerName: 'E-posta', minWidth: 140, flex: 1, sortable: true, filterable: true },
                    { field: 'telefon', headerName: 'Telefon', minWidth: 100, flex: 1, sortable: true, filterable: true },
                    { field: 'durum', headerName: 'Durum', minWidth: 80, flex: 1, sortable: true, filterable: true },
                  ]}
                  pagination
                  paginationModel={userTablePagination}
                  onPaginationModelChange={setUserTablePagination}
                  pageSizeOptions={[10, 20, 50]}
                  disableRowSelectionOnClick
                  autoHeight
                  sx={{ width: '100%' }}
                />
              </Box>
              <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogContent sx={{ p: 0 }}>
                  <AdminPanel
                    units={units}
                    users={users}
                    onAddUser={async user => {
                      try {
                        const { first_name, last_name, unit_id, username, password, role } = user as any;
                        await addUser({ first_name, last_name, unit_id, username, password, role });
                        const updated = await fetchUsers();
                        setUsers(updated);
                        setUserDialogOpen(false);
                      } catch (e) {}
                    }}
                    onAddUnit={async unit => {
                      try {
                        await addUnit(unit);
                        const updated = await fetchUnits();
                        setUnits(updated);
                      } catch (e) {}
                    }}
                    onClose={() => setUserDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </Box>
          )}
          {sidebarSection === 'units' && (
            <Box>
              <AdminPanel
                units={units}
                users={users}
                onAddUser={async user => {
                  try {
                    const { first_name, last_name, unit_id, username, password, role } = user as any;
                    const newUser = await addUser({ first_name, last_name, unit_id, username, password, role });
                    setUsers(prev => [...prev, newUser]);
                  } catch (e) {}
                }}
                onAddUnit={async unit => {
                  try {
                    const newUnit = await addUnit(unit);
                    setUnits(prev => [...prev, newUnit]);
                  } catch (e) {}
                }}
              />
              <Box sx={{ mb: 4 }}>
                <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 12 }}>Birimler</h2>
                <ul style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px #0001', padding: 0, listStyle: 'none' }}>
                  {units.map(u => (
                    <li key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 18px', borderBottom: '1px solid #f1f5f9' }}>
                      <span>{u.name}</span>
                      <span style={{ fontSize: 13, color: '#64748b' }}>{u.parentId ? `Üst: ${units.find(x=>x.id===u.parentId)?.name}` : ''}</span>
                    </li>
                  ))}
                </ul>
              </Box>
            </Box>
          )}
          {sidebarSection === 'forms' && (
            <Box>
              <FormBuilder
                forms={forms.length ? forms : [{ id: 'default', title: 'Varsayılan İş Formu', fields: [] }]}
                onCreate={form => setForms(prev => [...prev, { id: Date.now().toString(), ...form }])}
                onUpdate={(id, form) => setForms(prev => prev.map(f => f.id === id ? { ...f, ...form } : f))}
              />
              <Box sx={{ mb: 4 }}>
                <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 12 }}>Formlar</h2>
                <ul style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px #0001', padding: 0, listStyle: 'none' }}>
                  {forms.map(f => (
                    <li key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 18px', borderBottom: '1px solid #f1f5f9' }}>
                      <span>{f.title || f.name}</span>
                      <span style={{ fontSize: 13, color: '#64748b' }}>Alan: {f.fields?.length || 0}</span>
                    </li>
                  ))}
                </ul>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
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
