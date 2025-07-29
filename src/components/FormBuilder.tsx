import React, { useState } from 'react';

export type FormFieldType = 'text' | 'number' | 'select' | 'radio' | 'checkbox' | 'date' | 'time' | 'photo' | 'signature' | 'rating' | 'yesno';

export interface FormField {
  id: string;
  label: string;
  type: FormFieldType;
  options?: string[]; // select, radio, checkbox için
}

interface Props {
  forms: { id: string; title: string; fields: FormField[] }[];
  onCreate: (form: { title: string; fields: FormField[] }) => void;
  onUpdate: (id: string, form: { title: string; fields: FormField[] }) => void;
}

const fieldTypeLabels: Record<FormFieldType, string> = {
  text: 'Metin',
  number: 'Sayı',
  select: 'Seçim Listesi',
  radio: 'Tek Seçim',
  checkbox: 'Çoklu Seçim',
  date: 'Tarih',
  time: 'Saat',
  photo: 'Fotoğraf',
  signature: 'İmza',
  rating: 'Derecelendirme',
  yesno: 'Evet/Hayır',
};


const FormBuilder: React.FC<Props> = ({ forms, onCreate, onUpdate }) => {
  const [formTitle, setFormTitle] = useState('');
  const [fields, setFields] = useState<FormField[]>([]);
  const [label, setLabel] = useState('');
  const [type, setType] = useState<FormFieldType>('text');
  const [options, setOptions] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  const addField = () => {
    if (!label) return;
    setFields(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        label,
        type,
        options: ['select', 'radio', 'checkbox'].includes(type) ? options.split(',').map(o=>o.trim()).filter(Boolean) : undefined,
      },
    ]);
    setLabel('');
    setType('text');
    setOptions('');
  };

  return (
    <div className="bg-white rounded shadow p-4 mb-6">
      <h3 className="font-bold mb-2">{editId ? 'Formu Düzenle' : 'Yeni Form Oluştur'}</h3>
      <div className="flex flex-col gap-2 mb-4">
        <input className="border p-2 rounded font-bold" placeholder="Form Başlığı" value={formTitle} onChange={e=>setFormTitle(e.target.value)} />
      </div>
      <h4 className="font-semibold mb-2">Form Alanları</h4>
      <div className="flex flex-col gap-2 mb-4">
        <input className="border p-2 rounded" placeholder="Alan Başlığı" value={label} onChange={e=>setLabel(e.target.value)} />
        <select className="border p-2 rounded" value={type} onChange={e=>setType(e.target.value as FormFieldType)}>
          {Object.entries(fieldTypeLabels).map(([k,v])=>(<option key={k} value={k}>{v}</option>))}
        </select>
        {['select','radio','checkbox'].includes(type) && (
          <input className="border p-2 rounded" placeholder="Seçenekler (virgülle ayır)" value={options} onChange={e=>setOptions(e.target.value)} />
        )}
        <button className="bg-blue-600 text-white py-2 rounded mt-2" type="button" onClick={addField}>Alan Ekle</button>
      </div>
      <ul className="mb-4">
        {fields.map(f=>(
          <li key={f.id} className="mb-1 flex items-center gap-2">
            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{fieldTypeLabels[f.type]}</span>
            <span>{f.label}</span>
            {f.options && <span className="text-xs text-gray-500">[{f.options.join(', ')}]</span>}
            <button className="text-red-500 ml-2" onClick={()=>setFields(fields.filter(x=>x.id!==f.id))}>Sil</button>
          </li>
        ))}
      </ul>
      {editId ? (
        <button className="bg-yellow-600 text-white px-4 py-2 rounded" disabled={fields.length===0 || !formTitle} onClick={()=>{
          onUpdate(editId, { title: formTitle, fields });
          setEditId(null); setFormTitle(''); setFields([]);
        }}>Formu Güncelle</button>
      ) : (
        <button className="bg-green-600 text-white px-4 py-2 rounded" disabled={fields.length===0 || !formTitle} onClick={()=>{
          onCreate({ title: formTitle, fields });
          setFormTitle(''); setFields([]);
        }}>Formu Kaydet</button>
      )}
      <div className="text-xs text-gray-500 mt-4">
        <b>Not:</b> Form doldurulurken atanacak kişi, dolduran kişi, birim vb. meta bilgiler otomatik olarak arkaplanda kaydedilecektir.
      </div>
      <div className="mt-6">
        <h4 className="font-semibold mb-2">Kayıtlı Formlar</h4>
        <ul className="mb-2">
          {forms.filter(f=>f.id!=="default").map(f=>(
            <li key={f.id} className="mb-1 flex items-center gap-2">
              <span className="font-bold text-blue-700">{f.title}</span>
              <button className="text-xs text-yellow-700 border border-yellow-400 rounded px-2 py-1 ml-2" onClick={()=>{
                setEditId(f.id); setFormTitle(f.title); setFields(f.fields);
              }}>Düzenle</button>
            </li>
          ))}
        </ul>
      </div>
      <div className="text-xs text-gray-500 mt-4">
        <b>Not:</b> Form doldurulurken atanacak kişi, dolduran kişi, birim vb. meta bilgiler otomatik olarak arkaplanda kaydedilecektir.
      </div>
    </div>
  );
};

export default FormBuilder;
