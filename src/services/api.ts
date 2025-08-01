export async function createJob(job: any) {
  const res = await fetch(`${API_URL}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(job)
  });
  if (!res.ok) throw new Error('İş eklenemedi');
  return res.json();
}
export async function createForm(form: any) {
  const res = await fetch(`${API_URL}/forms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form)
  });
  if (!res.ok) throw new Error('Form eklenemedi');
  return res.json();
}

export async function updateForm(id: string, form: any) {
  const res = await fetch(`${API_URL}/forms/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form)
  });
  if (!res.ok) throw new Error('Form güncellenemedi');
  return res.json();
}
// Basit API servis fonksiyonları (fetch tabanlı)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export async function fetchUsers() {
  const res = await fetch(`${API_URL}/users`);
  if (!res.ok) throw new Error('Kullanıcılar alınamadı');
  const users = await res.json();
  
  // Backend'den gelen snake_case verileri camelCase'e çevir
  return users.map((user: any) => ({
    ...user,
    firstName: user.first_name,
    lastName: user.last_name,
    displayName: user.display_name,
    unitId: user.unit_id,
    profileImageBase64: user.profile_image_base64,
    birthDate: user.birth_date,
    socialMedia: typeof user.social_media === 'string' ? JSON.parse(user.social_media) : user.social_media,
    isActive: user.is_active,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
    // Backend alanlarını da koru
    first_name: user.first_name,
    last_name: user.last_name,
    display_name: user.display_name,
    unit_id: user.unit_id,
    profile_image_base64: user.profile_image_base64,
    birth_date: user.birth_date,
    social_media: user.social_media,
    is_active: user.is_active,
    created_at: user.created_at,
    updated_at: user.updated_at,
  }));
}

export async function fetchUnits() {
  const res = await fetch(`${API_URL}/units`);
  if (!res.ok) throw new Error('Birimler alınamadı');
  return res.json();
}

export async function fetchForms() {
  const res = await fetch(`${API_URL}/forms`);
  if (!res.ok) throw new Error('Formlar alınamadı');
  return res.json();
}

export async function fetchJobs() {
  const res = await fetch(`${API_URL}/jobs`);
  if (!res.ok) throw new Error('İşler alınamadı');
  return res.json();
}

export async function login(username: string, password: string) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) throw new Error('Giriş başarısız');
  return res.json();
}
