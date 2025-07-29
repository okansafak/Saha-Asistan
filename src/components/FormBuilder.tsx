import React, { useState } from 'react';

interface Field {
  label: string;
  type: string;
}

interface Form {
  id: string;
  title: string;
  fields: Field[];
}

interface Props {
  forms: Form[];
  onCreate: (form: Omit<Form, 'id'>) => void;
  onUpdate: (id: string, form: Partial<Form>) => void;
}

const fieldTypes = [
  { value: 'text', label: 'Metin' },
  { value: 'number', label: 'Sayı' },
  { value: 'date', label: 'Tarih' },
  { value: 'select', label: 'Seçim' },
];

const FormBuilder: React.FC<Props> = ({ forms, onCreate, onUpdate }) => {
  const [title, setTitle] = useState('');
  const [fields, setFields] = useState<Field[]>([]);
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldType, setFieldType] = useState('text');

  const addField = () => {
    if (fieldLabel) {
      setFields([...fields, { label: fieldLabel, type: fieldType }]);
      setFieldLabel('');
      setFieldType('text');
    }
  };

  const handleCreate = () => {
    if (title && fields.length) {
      onCreate({ title, fields });
      setTitle('');
      setFields([]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-blue-100">
        <h2 className="text-xl font-bold text-blue-700 mb-4">Yeni Form Oluştur</h2>
        <input
          className="border border-blue-200 rounded-lg px-4 py-2 w-full mb-3 focus:ring-2 focus:ring-blue-400 outline-none"
          placeholder="Form Başlığı"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <div className="mb-4">
          <div className="font-semibold text-blue-600 mb-2">Form Alanları</div>
          <div className="flex gap-2 mb-2">
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
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              type="button"
              onClick={addField}
            >
              Alan Ekle
            </button>
          </div>
          <ul className="space-y-1">
            {fields.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                <span className="font-medium text-blue-700">{f.label}</span>
                <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs">{f.type}</span>
                <button
                  className="ml-2 text-red-500 hover:text-red-700 text-xs"
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
          onClick={handleCreate}
          disabled={!title || !fields.length}
        >
          Formu Kaydet
        </button>
        <div className="text-xs text-gray-400 mt-4">
          Not: Form doldurulurken atanacak kişi, dolduran kişi, birim vb. meta bilgiler otomatik olarak arkaplanda kaydedilecektir.
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow p-6 border border-blue-100">
        <h3 className="font-bold text-lg text-blue-700 mb-2">Kayıtlı Formlar</h3>
        <ul className="divide-y">
          {forms.map(f => (
            <li key={f.id} className="py-3 flex flex-col gap-1">
              <div className="font-semibold text-blue-800">{f.title}</div>
              <div className="flex flex-wrap gap-2">
                {f.fields.map((fld, idx) => (
                  <span key={idx} className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs">
                    {fld.label} <span className="text-gray-400">({fld.type})</span>
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FormBuilder;
