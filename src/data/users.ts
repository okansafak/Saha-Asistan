export type UserRole = 'superadmin' | 'manager' | 'personel';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  displayName?: string;
  username?: string;
  role: UserRole;
  unit?: string; // Birim adı veya ID'si
  unitId?: string;
  email?: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  birthDate?: string;
  address?: string;
  profileImageBase64?: string;
  socialMedia?: Record<string, string>;
  notes?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // name alanı eski veriler için, yeni eklemelerde kullanılmaz
  name?: string;
  // Backend snake_case alanları
  display_name?: string;
  unit_id?: string;
  profile_image_base64?: string;
  birth_date?: string;
  social_media?: any;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

