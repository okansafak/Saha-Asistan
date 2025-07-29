export type UserRole = 'superadmin' | 'manager' | 'personel';

export interface User {
  id: string;
  name: string;
  username?: string;
  role: UserRole;
  unit?: string; // Birim adı veya ID'si
  email?: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  birthDate?: string;
  address?: string;
  profileImageUrl?: string;
  socialMedia?: Record<string, string>;
  notes?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

