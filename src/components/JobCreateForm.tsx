import React, { useState } from 'react';
import type { User } from '../data/users';
import type { Unit } from '../data/units';
import type { FormField } from './FormBuilder';

interface Props {
  users: User[];
  units: Unit[];
  forms: { id: string; title: string; fields: FormField[] }[];
  currentUser: User;
  onCreate: (job: any) => void;
}


const JobCreateForm: React.FC<Props> = ({ users, units, forms, currentUser, onCreate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [formId, setFormId] = useState(forms[0]?.id || '');
  const [assignedTo, setAssignedTo] = useState('');
  const [unitId, setUnitId] = useState('');
  // Default alanlar
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [priority, setPriority] = useState<'acil' | 'normal' | 'dusuk'>('normal');
  const [jobType, setJobType] = useState('');
  const [status, setStatus] = useState('atandi');

  // Haritadan konum seçimi için basit bir simülasyon (gerçek harita ile entegre edilebilir)
  const handleSelectLocation = () => {
    // Demo: Ankara koordinatı
    setLocation({ lat: 39.9208, lon: 32.8541 });
  };

  // Seçili formun alanları (default hariç)
  const selectedForm = forms.find(f => f.id === formId);
  const [customFields, setCustomFields] = useState<Record<string, any>>({});

  // customFields state'ini formId değişince sıfırla
  React.useEffect(() => {
    setCustomFields({});
  }, [formId]);

  return (
    <div className="bg-white rounded shadow p-4 mb-6">
      <h3 className="font-bold mb-2">Yeni İş Oluştur</h3>
      <form className="flex flex-col gap-2" onSubmit={e => {
        e.preventDefault();
        if (!title || !assignedTo || !formId) return;
        onCreate({
          title,
          description,
          formId,
          formTitle: forms.find(f=>f.id===formId)?.title || '',
          assignedTo,
          assignedBy: currentUser.id,
          unitId,
          address,
          location,
          priority,
          jobType,
          status,
          updatedAt: new Date().toISOString(),
          updatedBy: currentUser.id,
          formData: customFields,
        });
        setTitle(''); setDescription(''); setFormId(forms[0]?.id || ''); setAssignedTo(''); setUnitId('');
        setAddress(''); setLocation(null); setPriority('normal'); setJobType(''); setStatus('atandi');
        setCustomFields({});
      }}>
        <input className="border p-2 rounded" placeholder="İş Başlığı" value={title} onChange={e=>setTitle(e.target.value)} />
        <textarea className="border p-2 rounded" placeholder="Açıklama" value={description} onChange={e=>setDescription(e.target.value)} />
        <select className="border p-2 rounded" value={formId} onChange={e=>setFormId(e.target.value)}>
          <option value="default">Varsayılan İş Formu</option>
          {forms.filter(f => f.id !== 'default').map(f => (
            <option key={f.id} value={f.id}>{f.title}</option>
          ))}
        </select>

        {/* Dinamik form alanları */}
        {formId !== 'default' && selectedForm && selectedForm.fields.map(field => {
          const value = customFields[field.id] ?? '';
          if (field.type === 'text' || field.type === 'number') {
            return (
              <input
                key={field.id}
                className="border p-2 rounded"
                placeholder={field.label}
                type={field.type === 'number' ? 'number' : 'text'}
                value={value}
                onChange={e => setCustomFields(f => ({ ...f, [field.id]: e.target.value }))}
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
                onChange={e => setCustomFields(f => ({ ...f, [field.id]: e.target.value }))}
              />
            );
          }
          if (field.type === 'select' || field.type === 'radio') {
            return (
              <select
                key={field.id}
                className="border p-2 rounded"
                value={value}
                onChange={e => setCustomFields(f => ({ ...f, [field.id]: e.target.value }))}
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
                        setCustomFields(f => {
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
                onChange={e => setCustomFields(f => ({ ...f, [field.id]: e.target.value }))}
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

        {/* Default alanlar */}
        <input className="border p-2 rounded" placeholder="Adres" value={address} onChange={e=>setAddress(e.target.value)} />
        <div className="flex gap-2 items-center">
          <button type="button" className="border px-2 py-1 rounded bg-gray-100" onClick={handleSelectLocation}>Haritadan Konum Seç</button>
          {location && <span className="text-xs text-gray-600">Lat: {location.lat}, Lon: {location.lon}</span>}
        </div>
        <select className="border p-2 rounded" value={priority} onChange={e=>setPriority(e.target.value as any)}>
          <option value="acil">Acil</option>
          <option value="normal">Normal</option>
          <option value="dusuk">Düşük</option>
        </select>
        <select className="border p-2 rounded" value={status} onChange={e=>setStatus(e.target.value as any)}>
          <option value="atandi">Atandı</option>
          <option value="basladi">Başlandı</option>
          <option value="devam">Devam Ediyor</option>
          <option value="tamamlandi">Tamamlandı</option>
          <option value="beklemede">Beklemede</option>
          <option value="iptal">İptal</option>
        </select>
        <input className="border p-2 rounded" placeholder="İş Türü (örn. Rutin Bakım, Arıza)" value={jobType} onChange={e=>setJobType(e.target.value)} />
        <select className="border p-2 rounded" value={unitId} onChange={e=>setUnitId(e.target.value)}>
          <option value="">Birim Seç</option>
          {units.map(u=>(<option key={u.id} value={u.id}>{u.name}</option>))}
        </select>
        <select className="border p-2 rounded" value={assignedTo} onChange={e=>setAssignedTo(e.target.value)}>
          <option value="">Kişi Seç</option>
          {users
            .filter(u => {
              if (!unitId) return true;
              // user.unit birim id'si olmalı, fallback olarak birim adı da kontrol edilir
              const unitMatch = u.unit === unitId;
              // Ayrıca birim adı ile id eşleşmesi de kontrol edilebilir (eski veriler için)
              const unitObj = units.find(x => x.id === unitId);
              const nameMatch = unitObj && u.unit === unitObj.name;
              return unitMatch || nameMatch;
            })
            .map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
            ))}
        </select>
        <button className="bg-blue-600 text-white py-2 rounded mt-2" type="submit">İşi Oluştur</button>
      </form>
    </div>
  );
};

export default JobCreateForm;
