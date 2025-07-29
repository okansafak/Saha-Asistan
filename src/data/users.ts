export type UserRole = 'superadmin' | 'manager' | 'personel';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  unit?: string; // Birim adı veya ID'si
}

export const demoUsers: User[] = [
  { id: '1', name: 'Süper Admin', role: 'superadmin' },
  { id: '2', name: 'Yönetici Ali', role: 'manager', unit: 'Birim A' },
  { id: '3', name: 'Personel Ayşe', role: 'personel', unit: 'Birim A' },
  { id: '4', name: 'Personel Veli', role: 'personel', unit: 'Birim B' },
];
