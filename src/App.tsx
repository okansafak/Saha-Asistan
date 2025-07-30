// cursorRules:
// - Çıkış butonu her zaman sağ üst köşede, sabit ve üstte olmalı, içerik ve başlıklarla çakışmamalı.
// - Başlıklar ortalı veya içerik kutusunun başında, butonlar hizalı ve modern olmalı.
// - Kullanıcı listesi geniş ve ferah olmalı, responsive tasarım korunmalı.
// - Tüm modallar ve kutular sade, modern ve okunaklı olmalı.
// - Kodda bu kurallara uygunluk gözetilmeli.

import JobCreateForm from './components/JobCreateForm';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { DataGrid } from '@mui/x-data-grid';
import FormBuilder from './components/FormBuilder';
import Sidebar, { type SidebarSection } from './components/Sidebar';
import UnitList from './components/UnitList';

import React from 'react';
import MapComponent from './components/MapComponent';
import LoginScreen from './components/LoginScreen';

import { fetchUsers, fetchUnits, fetchForms, fetchJobs } from './services/api';
import { addUnit } from './services/unitApi';
import { addUser } from './services/userApi';
import type { User, UserRole } from './data/users';
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
  // Kullanıcı ekleme/düzenleme modal state
  const [editUser, setEditUser] = useState<User | null | {}>(null);

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
                        social = typeof u.social_media === 'string' ? JSON.parse(u.social_media) : (u.social_media || {});
                      } catch { social = {}; }
                      const hasAnySocial = !!(social.x || social.instagram || social.facebook || social.tiktok);
                      const safe = v => (v === undefined || v === null || v === '') ? '-' : v;
                      return {
                        id: u.id,
                        ad: safe(u.first_name),
                        soyad: safe(u.last_name),
                        kullaniciAdi: safe(u.username),
                        gorunenAd: safe(u.display_name),
                        rol: safe(u.role),
                        birim: safe(unitName),
                        email: safe(u.email),
                        telefon: safe(u.phone),
                        cinsiyet: safe(u.gender),
                        dogumTarihi: safe(u.birth_date),
                        profilResmi: (u.profile_image_base64 && u.profile_image_base64 !== '-' && u.profile_image_base64 !== '') ? u.profile_image_base64 : '-',
                        sosyalMedya: hasAnySocial ? social : '-',
                        adres: safe(u.address),
                        notlar: safe(u.notes),
                        durum: u.is_active !== false ? 'Aktif' : 'Pasif',
                        kayitTarihi: (u.created_at && u.created_at !== '-' && u.created_at !== '' && u.created_at !== null) ? new Date(u.created_at).toLocaleString() : '-',
                        guncellemeTarihi: (u.updated_at && u.updated_at !== '-' && u.updated_at !== '' && u.updated_at !== null) ? new Date(u.updated_at).toLocaleString() : '-',
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
              />
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
