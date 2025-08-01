import type { User } from '../data/users';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export async function fetchUsers(): Promise<User[]> {
  const res = await fetch(`${API_URL}/users`);
  if (!res.ok) throw new Error('Kullanıcılar alınamadı');
  return res.json();
}

export async function addUser(user: any) {
  const res = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Bilinmeyen hata' }));
    throw new Error(errorData.error || `HTTP ${res.status}: Kullanıcı eklenemedi`);
  }
  
  return res.json();
}

export async function updateUser(id: string, user: Partial<User>) {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error('Kullanıcı güncellenemedi');
  return res.json();
}

export async function deleteUser(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Kullanıcı silinemedi');
}
