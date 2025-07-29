import type { Unit } from '../data/units';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export async function fetchUnits(): Promise<Unit[]> {
  const res = await fetch(`${API_URL}/units`);
  if (!res.ok) throw new Error('Birimler alınamadı');
  return res.json();
}

export async function addUnit(unit: Omit<Unit, 'id'>): Promise<Unit> {
  const res = await fetch(`${API_URL}/units`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(unit),
  });
  if (!res.ok) throw new Error('Birim eklenemedi');
  return res.json();
}

export async function updateUnit(id: string, unit: Partial<Unit>): Promise<Unit> {
  const res = await fetch(`${API_URL}/units/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(unit),
  });
  if (!res.ok) throw new Error('Birim güncellenemedi');
  return res.json();
}

export async function deleteUnit(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/units/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Birim silinemedi');
}
