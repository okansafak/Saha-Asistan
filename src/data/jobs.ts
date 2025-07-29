import type { User } from '../data/users';
import type { Unit } from '../data/units';
import type { FormField } from './FormBuilder';

export type JobStatus = 'atandi' | 'devam' | 'tamamlandi' | 'iptal' | 'basladi' | 'beklemede';

export interface JobHistoryItem {
  date: string;
  action: string;
  userId: string;
  details?: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  formId: string;
  formTitle: string;
  assignedTo: string; // userId
  assignedBy: string; // userId
  unitId: string;
  status: JobStatus;
  formData: Record<string, any>;
  history: JobHistoryItem[];
  // Default alanlar
  address?: string;
  location?: { lat: number; lon: number };
  priority?: 'acil' | 'normal' | 'dusuk';
  jobType?: string; // ör: rutin bakım, arıza, kurulum
  updatedAt?: string;
  updatedBy?: string; // userId
}
