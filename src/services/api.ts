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
  return res.json();
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
