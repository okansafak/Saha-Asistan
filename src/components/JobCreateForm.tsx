
import React, { useState } from 'react';
import type { User } from '../data/users';
import type { Unit } from '../data/units';
import type { Field } from './FormBuilder';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';

interface Props {
  users: User[];
  units: Unit[];
  forms: { id: string; title: string; fields: Field[] }[];
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
    <Box sx={{ bgcolor: '#fff', borderRadius: 2, boxShadow: 2, p: 4, maxWidth: 500, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={700} color="primary" mb={2}>Yeni İş Oluştur</Typography>
      <Box component="form" display="flex" flexDirection="column" gap={2} onSubmit={e => {
        e.preventDefault();
        if (!title || !assignedTo || !formId || !unitId) return;
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
        <TextField label="İş Başlığı" value={title} onChange={e=>setTitle(e.target.value)} required fullWidth />
        <TextField label="Açıklama" value={description} onChange={e=>setDescription(e.target.value)} multiline minRows={2} fullWidth />
        <FormControl required fullWidth>
          <InputLabel>Form Seçimi</InputLabel>
          <Select value={formId} label="Form Seçimi" onChange={e=>setFormId(e.target.value)}>
            <MenuItem value=""><em>Form Seçiniz</em></MenuItem>
            {forms.map(f => (
              <MenuItem key={f.id} value={f.id}>{f.title}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* Dinamik form alanları */}
        {formId && selectedForm && selectedForm.fields.map((field, idx) => {
          const key = `${field.label}-${idx}`;
          const value = customFields[field.label] ?? '';
          if (field.type === 'text' || field.type === 'number') {
            return (
              <TextField
                key={key}
                label={field.label}
                type={field.type === 'number' ? 'number' : 'text'}
                value={value}
                onChange={e => setCustomFields(f => ({ ...f, [field.label]: e.target.value }))}
                fullWidth
              />
            );
          }
          if (field.type === 'date' || field.type === 'time') {
            return (
              <TextField
                key={key}
                label={field.label}
                type={field.type}
                value={value}
                onChange={e => setCustomFields(f => ({ ...f, [field.label]: e.target.value }))}
                fullWidth
              />
            );
          }
          if (field.type === 'select' || field.type === 'radio') {
            return (
              <FormControl key={key} fullWidth>
                <InputLabel>{field.label}</InputLabel>
                <Select
                  value={value}
                  label={field.label}
                  onChange={e => setCustomFields(f => ({ ...f, [field.label]: e.target.value }))}
                >
                  <MenuItem value=""><em>{field.label}</em></MenuItem>
                  {field.options?.map((opt: any) => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            );
          }
          if (field.type === 'checkbox') {
            return (
              <FormGroup key={key} sx={{ pl: 1 }}>
                <Typography fontWeight={600} fontSize={14}>{field.label}</Typography>
                {field.options?.map((opt: any) => (
                  <FormControlLabel
                    key={opt}
                    control={
                      <Checkbox
                        checked={Array.isArray(value) ? value.includes(opt) : false}
                        onChange={e => {
                          setCustomFields(f => {
                            const arr = Array.isArray(f[field.label]) ? f[field.label] : [];
                            if (e.target.checked) return { ...f, [field.label]: [...arr, opt] };
                            return { ...f, [field.label]: arr.filter((v: string) => v !== opt) };
                          });
                        }}
                      />
                    }
                    label={opt}
                  />
                ))}
              </FormGroup>
            );
          }
          if (field.type === 'yesno') {
            return (
              <FormControl key={key} fullWidth>
                <InputLabel>{field.label}</InputLabel>
                <Select
                  value={value}
                  label={field.label}
                  onChange={e => setCustomFields(f => ({ ...f, [field.label]: e.target.value }))}
                >
                  <MenuItem value=""><em>Seçiniz</em></MenuItem>
                  <MenuItem value="evet">Evet</MenuItem>
                  <MenuItem value="hayir">Hayır</MenuItem>
                </Select>
              </FormControl>
            );
          }
          // photo, signature, rating gibi alanlar için placeholder
          return (
            <Typography key={key} fontSize={12} color="text.secondary" fontStyle="italic">{field.label} ({field.type}) alanı desteklenmiyor</Typography>
          );
        })}
        <TextField label="Adres" value={address} onChange={e=>setAddress(e.target.value)} fullWidth />
        <Box display="flex" gap={2} alignItems="center">
          <Button variant="outlined" onClick={handleSelectLocation}>Haritadan Konum Seç</Button>
          {location && <Typography fontSize={13} color="text.secondary">Lat: {location.lat}, Lon: {location.lon}</Typography>}
        </Box>
        <FormControl fullWidth>
          <InputLabel>Öncelik</InputLabel>
          <Select value={priority} label="Öncelik" onChange={e=>setPriority(e.target.value as any)}>
            <MenuItem value="acil">Acil</MenuItem>
            <MenuItem value="normal">Normal</MenuItem>
            <MenuItem value="dusuk">Düşük</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Durum</InputLabel>
          <Select value={status} label="Durum" onChange={e=>setStatus(e.target.value as any)}>
            <MenuItem value="atandi">Atandı</MenuItem>
            <MenuItem value="basladi">Başlandı</MenuItem>
            <MenuItem value="devam">Devam Ediyor</MenuItem>
            <MenuItem value="tamamlandi">Tamamlandı</MenuItem>
            <MenuItem value="beklemede">Beklemede</MenuItem>
            <MenuItem value="iptal">İptal</MenuItem>
          </Select>
        </FormControl>
        <TextField label="İş Türü" placeholder="İş Türü (örn. Rutin Bakım, Arıza)" value={jobType} onChange={e=>setJobType(e.target.value)} fullWidth />
        <FormControl required fullWidth>
          <InputLabel>Birim</InputLabel>
          <Select value={unitId} label="Birim" onChange={e=>setUnitId(e.target.value)}>
            <MenuItem value=""><em>Birim Seç</em></MenuItem>
            {units.map(u=>(<MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>))}
          </Select>
        </FormControl>
        <FormControl required fullWidth>
          <InputLabel>Atanacak Kişi</InputLabel>
          <Select value={assignedTo} label="Atanacak Kişi" onChange={e=>setAssignedTo(e.target.value)}>
            <MenuItem value=""><em>Kişi Seç</em></MenuItem>
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
                <MenuItem key={u.id} value={u.id}>{u.name} ({u.role})</MenuItem>
              ))}
          </Select>
        </FormControl>
        <Button variant="contained" color="primary" type="submit" sx={{ fontWeight: 700, mt: 1 }}>İşi Oluştur</Button>
      </Box>
    </Box>
  );
};

export default JobCreateForm;
