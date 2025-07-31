// cursorRules:
// - Çıkış butonu her zaman sağ üst köşede, sabit ve üstte olmalı, içerik ve başlıklarla çakışmamalı.
// - Başlıklar ortalı veya içerik kutusunun başında, butonlar hizalı ve modern olmalı.
// - Kullanıcı listesi geniş ve ferah olmalı, responsive tasarım korunmalı.
// - Tüm modallar ve kutular sade, modern ve okunaklı olmalı.
// - Kodda bu kurallara uygunluk gözetilmeli.

import JobCreateForm from './components/JobCreateForm';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
// ...existing code...
import { DataGrid } from '@mui/x-data-grid';
import FormBuilder from './components/FormBuilder';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Sidebar, { type SidebarSection } from './components/Sidebar';
import UnitList from './components/UnitList';

import React from 'react';
import MapComponent from './components/MapComponent';
import LoginScreen from './components/LoginScreen';

import { fetchUsers, fetchUnits, fetchForms, fetchJobs, createForm, updateForm, createJob } from './services/api';
// ...existing code...
  // ...existing code...
import { addUnit } from './services/unitApi';
import { addUser } from './services/userApi';
import type { User } from './data/users';
import type { Unit } from './data/units';

import JobDelegate from './components/JobDelegate';
import JobHistory from './components/JobHistory';
import JobEditForm from './components/JobEditForm';
// import UserRow from './components/UserRow';
import { FaXTwitter, FaInstagram, FaFacebook, FaTiktok } from 'react-icons/fa6';
import { useState } from 'react';
import UserEditModal from './components/UserEditModal';
import { updateUser } from './services/userApi';

function App() {
  // İş ekleme modalı için state
  const [jobCreateOpen, setJobCreateOpen] = useState(false);
  // Form silme fonksiyonu (App fonksiyonu içinde, setForms erişimi var)
  async function deleteForm(id: string) {
    await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/forms/${id}`, { method: 'DELETE' });
    setForms(prev => prev.filter((f: any) => f.id !== id));
  }
  const [createFormOpen, setCreateFormOpen] = React.useState(false);
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
  // ...existing code...
  // DataGrid pagination state
  const [userTablePagination, setUserTablePagination] = React.useState<{ page: number; pageSize: number }>({ page: 0, pageSize: 10 });
  // Kullanıcı ekleme/düzenleme modal state
  const [editUser, setEditUser] = useState<User | null | {}>(null);
  // Form düzenleme için state
  const [editForm, setEditForm] = useState<any | null>(null);

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
            p: { xs: 2, md: 4 },
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            marginLeft: '240px',
            overflowX: 'auto',
            width: 'calc(100vw - 240px)',
            boxSizing: 'border-box',
            alignItems: 'center',
            background: '#f8fafc',
          }}
        >
          {sidebarSection === 'users' && (
            <Box sx={{ width: '100%', maxWidth: 1300, mx: 'auto', mt: { xs: 2, md: 4 }, position: 'relative' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <h2 style={{ fontWeight: 700, fontSize: 26, color: '#2563eb', margin: 0 }}>Kullanıcılar</h2>
                <Button variant="contained" color="primary" onClick={() => setEditUser({})} sx={{ fontWeight: 700, borderRadius: 2, minWidth: 160, height: 44, fontSize: 16 }}>KULLANICI EKLE</Button>
              </Box>
              {/* Çıkış butonu sabit sağ üstte */}
              <Box sx={{ position: 'fixed', top: 24, right: 32, zIndex: 2000 }}>
                <button style={{ padding: '8px 20px', background: '#e0e7ef', borderRadius: 8, border: 0, fontWeight: 600, cursor: 'pointer', fontSize: 16, boxShadow: '0 2px 8px #0001' }} onClick={() => setCurrentUser(null)}>Çıkış</button>
              </Box>
              <Box sx={{ width: '100%', background: '#fff', borderRadius: 3, boxShadow: '0 2px 12px #0001', p: { xs: 1, md: 2 }, minWidth: 1100, maxWidth: 1300, mx: 'auto', mb: 4 }}>
                <DataGrid
                    rows={users.map(u => {
                      const unitId = (u as any).unit_id || u.unit;
                      const unitName = unitId ? (units.find(unit => unit.id === unitId)?.name || '-') : '-';
                      let social = {};
                      try {
                    social = typeof u.socialMedia === 'string' ? JSON.parse(u.socialMedia) : (u.socialMedia || {});
                      } catch { social = {}; }
                    const hasAnySocial = !!((social as any).x || (social as any).instagram || (social as any).facebook || (social as any).tiktok);
                    const safe = (v: any) => (v === undefined || v === null || v === '') ? '-' : v;
                      return {
                        id: u.id,
                        ad: safe(u.first_name),
                        soyad: safe(u.last_name),
                        kullaniciAdi: safe(u.username),
                      gorunenAd: safe(u.name),
                        rol: safe(u.role),
                        birim: safe(unitName),
                        email: safe(u.email),
                        telefon: safe(u.phone),
                        cinsiyet: safe(u.gender),
                      dogumTarihi: safe(u.birthDate),
                      profilResmi: (u.profileImageBase64 && u.profileImageBase64 !== '-' && u.profileImageBase64 !== '') ? u.profileImageBase64 : '-',
                      sosyalMedya: hasAnySocial ? social : '-',
                        adres: safe(u.address),
                        notlar: safe(u.notes),
                      durum: u.isActive !== false ? 'Aktif' : 'Pasif',
                      kayitTarihi: (u.createdAt && u.createdAt !== '-' && u.createdAt !== '' && u.createdAt !== null) ? new Date(u.createdAt).toLocaleString() : '-',
                      guncellemeTarihi: (u.updatedAt && u.updatedAt !== '-' && u.updatedAt !== '' && u.updatedAt !== null) ? new Date(u.updatedAt).toLocaleString() : '-',
                        actions: u,
                      };
                    })}
                    columns={[
                      { field: 'ad', headerName: 'Ad', minWidth: 100, flex: 1 },
                      { field: 'soyad', headerName: 'Soyad', minWidth: 100, flex: 1 },
                      { field: 'kullaniciAdi', headerName: 'Kullanıcı Adı', minWidth: 120, flex: 1 },
                      { field: 'gorunenAd', headerName: 'Görünen Ad', minWidth: 120, flex: 1 },
                      { field: 'rol', headerName: 'Rol', minWidth: 90, flex: 1 },
                      { field: 'birim', headerName: 'Birim', minWidth: 120, flex: 1 },
                      { field: 'email', headerName: 'E-posta', minWidth: 140, flex: 1 },
                      { field: 'telefon', headerName: 'Telefon', minWidth: 100, flex: 1 },
                      { field: 'cinsiyet', headerName: 'Cinsiyet', minWidth: 80, flex: 1 },
                      { field: 'dogumTarihi', headerName: 'Doğum Tarihi', minWidth: 110, flex: 1 },
                      { field: 'profilResmi', headerName: 'Profil Resmi', minWidth: 80, flex: 1, renderCell: params => params.value && params.value !== '-' ? <img src={params.value} alt="Profil" style={{ width: 32, height: 32, borderRadius: 8 }} /> : '-' },
                      { field: 'sosyalMedya', headerName: 'Sosyal Medya', minWidth: 120, flex: 1, renderCell: params => {
                        if (params.value === '-') return '-';
                        const s = params.value || {};
                        return (
                          <span style={{ display: 'flex', gap: 6 }}>
                            {s.x && <a href={s.x} target="_blank" rel="noopener noreferrer" title="X"><FaXTwitter /></a>}
                            {s.instagram && <a href={s.instagram} target="_blank" rel="noopener noreferrer" title="Instagram"><FaInstagram /></a>}
                            {s.facebook && <a href={s.facebook} target="_blank" rel="noopener noreferrer" title="Facebook"><FaFacebook /></a>}
                            {s.tiktok && <a href={s.tiktok} target="_blank" rel="noopener noreferrer" title="TikTok"><FaTiktok /></a>}
                          </span>
                        );
                      }},
                      { field: 'adres', headerName: 'Adres', minWidth: 120, flex: 1 },
                      { field: 'notlar', headerName: 'Notlar', minWidth: 120, flex: 1 },
                      { field: 'durum', headerName: 'Durum', minWidth: 80, flex: 1 },
                      { field: 'kayitTarihi', headerName: 'Kayıt Tarihi', minWidth: 140, flex: 1 },
                      { field: 'guncellemeTarihi', headerName: 'Güncelleme Tarihi', minWidth: 140, flex: 1 },
                      { field: 'actions', headerName: '', minWidth: 90, flex: 1, renderCell: params => <Button variant="outlined" size="small" onClick={() => setEditUser(params.value)}>Düzenle</Button> },
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
              <Dialog open={editUser !== null} onClose={() => setEditUser(null)} maxWidth="md" fullWidth>
                <DialogContent sx={{ p: 0 }}>
                  <UserEditModal
                    user={editUser}
                    units={units}
                    onClose={() => setEditUser(null)}
                    onSave={async (userData) => {
                      if (editUser && typeof editUser === 'object' && 'id' in editUser && editUser.id) {
                        await updateUser(editUser.id, userData);
                      } else {
                        await addUser(userData);
                      }
                      const updated = await fetchUsers();
                      setUsers(updated);
                      setEditUser(null);
                    }}
                  />
                </DialogContent>
              </Dialog>
            </Box>
          )}
          {sidebarSection === 'jobs' && (
            <Box sx={{ width: '100%', maxWidth: 1300, mx: 'auto', mt: { xs: 2, md: 4 }, position: 'relative' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <h2 style={{ fontWeight: 700, fontSize: 26, color: '#2563eb', margin: 0 }}>İşler</h2>
                <Button variant="contained" color="primary" onClick={() => setJobCreateOpen(true)} sx={{ fontWeight: 700, borderRadius: 2, minWidth: 160, height: 44, fontSize: 16 }}>Yeni İş Ekle</Button>
              </Box>
              {/* İş ekleme modalı */}
              <Dialog open={!!jobCreateOpen} onClose={() => setJobCreateOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Yeni İş Ekle</DialogTitle>
                <DialogContent>
                  <JobCreateForm
                    users={users}
                    units={units}
                    forms={forms}
                    currentUser={currentUser}
                    onCreate={async job => {
                      await createJob(job);
                      const updated = await fetchJobs();
                      setJobs(updated);
                      setJobCreateOpen(false);
                    }}
                  />
                </DialogContent>
              </Dialog>
              <Box sx={{ background: '#fff', borderRadius: 3, boxShadow: '0 2px 12px #0001', p: { xs: 2, md: 3 }, minWidth: 400, maxWidth: 1300, mx: 'auto', mt: 3 }}>
                {jobs.length === 0 && <div className="text-gray-500">Henüz iş yok.</div>}
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {jobs.map(job => (
                    <li key={job.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', padding: '12px 0' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 17, color: '#2563eb' }}>{job.title}</div>
                        <div style={{ fontSize: 13, color: '#64748b' }}>Açıklama: {job.description}</div>
                        <div style={{ fontSize: 13, color: '#64748b' }}>Atanan: {users.find(u => u.id === job.assignedTo)?.name || '-'}</div>
                        <div style={{ fontSize: 13, color: '#64748b' }}>Birim: {units.find(u => u.id === job.unitId)?.name || '-'}</div>
                        <div style={{ fontSize: 13, color: '#64748b' }}>Durum: {job.status}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </Box>
            </Box>
          )}
// jobs modal state
const [jobCreateOpen, setJobCreateOpen] = useState(false);
          {sidebarSection === 'units' && (
            <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto', mt: 4 }}>
              <UnitList
                users={users}
                units={units}
                onAddUnit={async (unit: Partial<Unit>) => {
                  try {
                    const newUnit = await addUnit(unit as any);
                    setUnits(prev => [...prev, newUnit]);
                  } catch (e) {}
                }}
                onEditUnit={async (unit: Unit) => {
                  try {
                    // updateUnit fonksiyonu ile backend'e gönder
                    const updated = await (await import('./services/unitApi')).updateUnit(unit.id, unit);
                    setUnits(prev => prev.map(u => u.id === unit.id ? updated : u));
                  } catch (e) {}
                }}
                onDeleteUnitSuccess={async () => {
                  const updated = await (await import('./services/unitApi')).fetchUnits();
                  setUnits(updated);
                }}
              />
            </Box>
          )}
          {sidebarSection === 'forms' && (
            <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto', mt: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontWeight: 700, fontSize: 28, color: '#2563eb', margin: 0 }}>Formlar</h2>
                <Button variant="contained" sx={{ fontWeight: 700, borderRadius: 2, minWidth: 160, height: 44, fontSize: 16 }} onClick={() => setCreateFormOpen(true)}>Form Oluştur</Button>
              </div>
              {/* Form oluşturma modalı */}
              <Dialog open={!!createFormOpen} onClose={() => setCreateFormOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Yeni Form Oluştur</DialogTitle>
                <DialogContent>
                  <FormBuilder
                    forms={[]}
                    onCreate={async form => {
                      const newForm = await createForm(form);
                      setForms(prev => [...prev, newForm]);
                      setCreateFormOpen(false);
                    }}
                    onUpdate={() => {}}
                  />
                </DialogContent>
              </Dialog>
              <Box sx={{ background: '#fff', borderRadius: 3, boxShadow: '0 2px 12px #0001', p: { xs: 2, md: 3 }, minWidth: 400, maxWidth: 900, mx: 'auto' }}>
                <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 12, color: '#2563eb' }}>Kayıtlı Formlar</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {forms.map(f => (
                    <li key={f.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', padding: '12px 0' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 17, color: '#2563eb' }}>{f.title || f.name}</div>
                        <div style={{ fontSize: 13, color: '#64748b' }}>Alan: {f.fields?.length || 0}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Button variant="outlined" size="small" onClick={() => setEditForm(f)} sx={{ fontWeight: 600, borderRadius: 2 }}>Düzenle</Button>
                        <Button variant="outlined" color="error" size="small" onClick={() => deleteForm(f.id)} sx={{ fontWeight: 600, borderRadius: 2 }}>Sil</Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </Box>
              {/* Form düzenleme modalı */}
              <Dialog open={!!editForm} onClose={() => setEditForm(null)} maxWidth="sm" fullWidth>
                <DialogTitle>Formu Düzenle</DialogTitle>
                <DialogContent>
                  {editForm && (
                    <FormBuilder
                      forms={[editForm]}
                      onCreate={() => {}}
                      onUpdate={async (id, form) => {
                        const updated = await updateForm(id, form);
                        setForms(prev => prev.map(f => f.id === id ? updated : f));
                        setEditForm(null);
                      }}
                      onDelete={async (id) => {
                        await deleteForm(id);
                        setEditForm(null);
                      }}
                      editMode
                    />
                  )}
                </DialogContent>
              </Dialog>
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
