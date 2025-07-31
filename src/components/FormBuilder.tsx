import React, { useState } from 'react';

export type Field = {
  label: string;
  type: string;
  options?: string[];
};

interface Form {
  id: string;
  title: string;
  fields: Field[];
}

interface Props {
  forms: Form[];
  onCreate: (form: Omit<Form, 'id'>) => void;
  onUpdate: (id: string, form: Partial<Form>) => void;
  onDelete?: (id: string) => void;
  editMode?: boolean;
}

const fieldTypes = [
  { value: 'text', label: 'Metin' },
  { value: 'number', label: 'Sayı' },
  { value: 'date', label: 'Tarih' },
  { value: 'select', label: 'Seçim' },
  { value: 'radio', label: 'Tekli Seçim' },
  { value: 'checkbox', label: 'Çoklu Seçim' },
  { value: 'yesno', label: 'Evet/Hayır' },
];


const FormBuilder: React.FC<Props> = ({ forms, onCreate, onUpdate, onDelete, editMode }) => {
  // Eğer editMode ise ilk formu düzenle, değilse yeni form oluştur
  const editing = editMode && forms.length > 0 ? forms[0] : null;
  const [title, setTitle] = useState(editing ? editing.title : '');
  const [fields, setFields] = useState<Field[]>(editing ? editing.fields : []);
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldType, setFieldType] = useState('text');
  // select, radio, checkbox için opsiyonlar
  const [fieldOptions, setFieldOptions] = useState<string>('');

  // Alan ekle
  const addField = () => {
    if (fieldLabel) {
      let field: any = { label: fieldLabel, type: fieldType };
      if (["select","radio","checkbox"].includes(fieldType)) {
        field.options = fieldOptions.split(',').map(s=>s.trim()).filter(Boolean);
      }
      setFields([...fields, field]);
      setFieldLabel('');
      setFieldType('text');
      setFieldOptions('');
    }
  };

  // Form kaydet
  const handleCreateOrUpdate = () => {
    if (title && fields.length) {
      if (editing) {
        onUpdate(editing.id, { title, fields });
      } else {
        onCreate({ title, fields });
      }
      setTitle('');
      setFields([]);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #0001', padding: 32, marginBottom: 32 }}>
        <h2 style={{ fontWeight: 700, fontSize: 22, color: '#2563eb', marginBottom: 18 }}>{editing ? 'Formu Düzenle' : 'Yeni Form Oluştur'}</h2>
        <input
          className="border border-blue-200 rounded-lg px-4 py-2 w-full mb-3 focus:ring-2 focus:ring-blue-400 outline-none"
          placeholder="Form Başlığı"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontWeight: 600, color: '#2563eb', marginBottom: 8 }}>Form Alanları</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <input
              className="border border-blue-200 rounded-lg px-3 py-2 flex-1 focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Alan Başlığı"
              value={fieldLabel}
              onChange={e => setFieldLabel(e.target.value)}
            />
            <select
              className="border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
              value={fieldType}
              onChange={e => setFieldType(e.target.value)}
            >
              {fieldTypes.map(ft => (
                <option key={ft.value} value={ft.value}>{ft.label}</option>
              ))}
            </select>
            {['select','radio','checkbox'].includes(fieldType) && (
              <input
                className="border border-blue-200 rounded-lg px-3 py-2 flex-1 focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Seçenekler (virgülle ayırın)"
                value={fieldOptions}
                onChange={e => setFieldOptions(e.target.value)}
              />
            )}
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              type="button"
              onClick={addField}
            >
              Alan Ekle
            </button>
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {fields.map((f, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, color: '#334155', marginBottom: 4 }}>
                <span style={{ fontWeight: 600, color: '#2563eb' }}>{f.label}</span>
                <span style={{ background: '#e0e7ef', color: '#2563eb', borderRadius: 6, padding: '2px 8px', fontSize: 13 }}>{f.type}</span>
                {f.options && <span style={{ color: '#64748b', fontSize: 13 }}>({f.options.join(', ')})</span>}
                <button
                  style={{ marginLeft: 8, color: '#ef4444', fontWeight: 600, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer' }}
                  type="button"
                  onClick={() => setFields(fields.filter((_, idx) => idx !== i))}
                >Kaldır</button>
              </li>
            ))}
          </ul>
        </div>
        <button
          className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50"
          type="button"
          onClick={handleCreateOrUpdate}
          disabled={!title || !fields.length}
        >
          {editing ? 'Kaydet' : 'Formu Kaydet'}
        </button>
        {editing && onDelete && (
          <button
            className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition ml-4"
            type="button"
            onClick={() => onDelete(editing.id)}
          >Sil</button>
        )}
        <div className="text-xs text-gray-400 mt-4">
          Not: Form doldurulurken atanacak kişi, dolduran kişi, birim vb. meta bilgiler otomatik olarak arkaplanda kaydedilecektir.
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;
