import type { Unit } from '../data/units';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export async function fetchUnits(): Promise<Unit[]> {
  const res = await fetch(`${API_URL}/units`);
  if (!res.ok) throw new Error('Birimler alınamadı');
  const units = await res.json();
  
  // Backend'den gelen parent_id'yi parentId'ye çevir
  return units.map((unit: any) => ({
    ...unit,
    parentId: unit.parent_id || unit.parentId
  }));
}

export async function addUnit(unit: Omit<Unit, 'id'>): Promise<Unit> {
  // Frontend'den gelen parentId'yi backend için parent_id'ye çevir
  const unitForApi: any = {
    name: unit.name,
    parent_id: unit.parentId || null
  };
  
  console.log('Frontend\'den gelen unit verisi:', unit);
  console.log('API\'ye gönderilen unit verisi:', unitForApi);
  
  const res = await fetch(`${API_URL}/units`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(unitForApi),
  });
  
  console.log('API Response Status:', res.status);
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Birim ekleme hatası:', errorText);
    throw new Error(`Birim eklenemedi: ${errorText}`);
  }
  const result = await res.json();
  
  console.log('Backend\'den dönen result:', result);
  
  // Geri dönen veriyi normalize et
  return {
    ...result,
    parentId: result.parent_id || result.parentId
  };
}

export async function updateUnit(id: string, unit: Partial<Unit>): Promise<Unit> {
  // Frontend'den gelen parentId'yi backend için parent_id'ye çevir
  const unitForApi: any = {
    name: unit.name
  };
  
  if (unit.parentId !== undefined) {
    unitForApi.parent_id = unit.parentId;
  }
  
  console.log('Güncelleme için API\'ye gönderilen veri:', unitForApi);
  
  const res = await fetch(`${API_URL}/units/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(unitForApi),
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Birim güncelleme hatası:', errorText);
    throw new Error('Birim güncellenemedi');
  }
  const result = await res.json();
  
  console.log('Güncelleme sonrası backend\'den dönen result:', result);
  
  // Geri dönen veriyi normalize et
  return {
    ...result,
    parentId: result.parent_id || result.parentId
  };
}

export async function deleteUnit(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/units/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Birim silinemedi');
}
