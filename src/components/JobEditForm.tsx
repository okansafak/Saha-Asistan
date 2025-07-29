import React, { useState } from 'react';
import type { Job } from '../data/jobs';
import type { User } from '../data/users';
import type { Unit } from '../data/units';
import type { FormField } from './FormBuilder';

interface Props {
  job: Job;
  users: User[];
  units: Unit[];
  forms: { id: string; title: string; fields: FormField[] }[];
  currentUser: User;
  onUpdate: (jobId: string, updated: Partial<Job>) => void;
}

const JobEditForm: React.FC<Props> = ({ job, users, units, forms, currentUser, onUpdate }) => {
  const isEditable = job.assignedTo === currentUser.id;
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(job.formData || {});
  const [status, setStatus] = useState(job.status);
  const [description, setDescription] = useState(job.description);
  const selectedForm = forms.find(f => f.id === job.formId);

  if (!isEditable) return null;

  if (!editing) {
    return (
      <button className="bg-yellow-500 text-white px-3 py-1 rounded mt-2" onClick={() => setEditing(true)}>
        Formu/Durumu Güncelle
      </button>
    );
  }

  return (
    <form className="flex flex-col gap-2 mt-2 bg-yellow-50 p-3 rounded" onSubmit={e => {
      e.preventDefault();
      onUpdate(job.id, { formData, status, description });
      setEditing(false);
    }}>
      <div className="font-semibold">İş Formu Alanları</div>
      {selectedForm && selectedForm.fields.map(field => {
        const value = formData?.[field.id] ?? '';
        if (field.type === 'text' || field.type === 'number') {
          return (
            <input
              key={field.id}
              className="border p-2 rounded"
              placeholder={field.label}
              type={field.type === 'number' ? 'number' : 'text'}
              value={value}
              onChange={e => setFormData(f => ({ ...f, [field.id]: e.target.value }))}
            />
          );
        }
        if (field.type === 'date' || field.type === 'time') {
          return (
            <input
              key={field.id}
              className="border p-2 rounded"
              placeholder={field.label}
              type={field.type}
              value={value}
              onChange={e => setFormData(f => ({ ...f, [field.id]: e.target.value }))}
            />
          );
        }
        if (field.type === 'select' || field.type === 'radio') {
          return (
            <select
              key={field.id}
              className="border p-2 rounded"
              value={value}
              onChange={e => setFormData(f => ({ ...f, [field.id]: e.target.value }))}
            >
              <option value="">{field.label}</option>
              {field.options?.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          );
        }
        if (field.type === 'checkbox') {
          return (
            <div key={field.id} className="flex flex-col gap-1">
              <span className="text-xs font-semibold">{field.label}</span>
              {field.options?.map(opt => (
                <label key={opt} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={Array.isArray(value) ? value.includes(opt) : false}
                    onChange={e => {
                      setFormData(f => {
                        const arr = Array.isArray(f[field.id]) ? f[field.id] : [];
                        if (e.target.checked) return { ...f, [field.id]: [...arr, opt] };
                        return { ...f, [field.id]: arr.filter((v: string) => v !== opt) };
                      });
                    }}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          );
        }
        if (field.type === 'yesno') {
          return (
            <select
              key={field.id}
              className="border p-2 rounded"
              value={value}
              onChange={e => setFormData(f => ({ ...f, [field.id]: e.target.value }))}
            >
              <option value="">{field.label}</option>
              <option value="evet">Evet</option>
              <option value="hayir">Hayır</option>
            </select>
          );
        }
        // photo, signature, rating gibi alanlar için placeholder
        return (
          <div key={field.id} className="text-xs text-gray-400 italic">{field.label} ({field.type}) alanı desteklenmiyor</div>
        );
      })}
      <textarea className="border p-2 rounded" placeholder="Açıklama" value={description} onChange={e=>setDescription(e.target.value)} />
      <select className="border p-2 rounded" value={status} onChange={e=>setStatus(e.target.value as any)}>
        <option value="atandi">Atandı</option>
        <option value="basladi">Başlandı</option>
        <option value="devam">Devam Ediyor</option>
        <option value="tamamlandi">Tamamlandı</option>
        <option value="beklemede">Beklemede</option>
        <option value="iptal">İptal</option>
      </select>
      <button className="bg-green-600 text-white py-2 rounded mt-2" type="submit">Kaydet</button>
      <button className="bg-gray-300 text-gray-700 py-2 rounded mt-2" type="button" onClick={()=>setEditing(false)}>Vazgeç</button>
    </form>
  );
};

export default JobEditForm;
