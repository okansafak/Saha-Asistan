import React, { useState } from 'react';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import Box from '@mui/material/Box';
import type { User } from '../data/users';
import type { Unit } from '../data/units';

interface UserEditModalProps {
  user?: User | null;
  units: Unit[];
  onClose: () => void;
  onSave: (userData: any) => void;
}

const genderOptions = [
  { value: '', label: 'Belirtilmedi' },
  { value: 'male', label: 'Erkek' },
  { value: 'female', label: 'Kadın' },
  { value: 'other', label: 'Diğer' },
];

const emptyUser = {
  first_name: '',
  last_name: '',
  display_name: '',
  username: '',
  role: 'personel',
  unit_id: '',
  email: '',
  phone: '',
  gender: '',
  birth_date: '',
  profile_image_base64: '',
  social_media: { x: '', instagram: '', facebook: '', tiktok: '' },
  address: '',
  notes: '',
  is_active: true,
};

const UserEditModal: React.FC<UserEditModalProps> = ({ user, units, onClose, onSave }) => {
  // Sadece mevcut bir kullanıcı düzenleniyorsa isEdit true olmalı
  const isEdit = !!(user && user.id);
  const [form, setForm] = useState(() => {
    const formatDateForInput = (dateValue: any) => {
      if (!dateValue) return '';
      try {
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) return '';
        return date.toISOString().split('T')[0]; // YYYY-MM-DD format
      } catch {
        return '';
      }
    };

    return user ? {
      ...emptyUser,
      ...user,
      first_name: user.first_name,
      last_name: user.last_name,
      display_name: user.displayName || user.display_name || '',
      username: user.username || '',
      role: user.role || 'personel',
      unit_id: user.unitId || user.unit_id || user.unit || '',
      email: user.email || '',
      phone: user.phone || '',
      gender: user.gender || '',
      birth_date: formatDateForInput(user.birthDate || user.birth_date),
      profile_image_base64: user.profileImageBase64 || user.profile_image_base64 || '',
      social_media: (() => {
        let socialData = { ...emptyUser.social_media };
        
        // user.socialMedia (camelCase) kontrolü
        if (typeof user.socialMedia === 'object' && user.socialMedia) {
          socialData = { ...socialData, ...user.socialMedia };
        }
        
        // user.social_media (snake_case) kontrolü
        if (user.social_media) {
          if (typeof user.social_media === 'object') {
            socialData = { ...socialData, ...user.social_media };
          } else if (typeof user.social_media === 'string') {
            try {
              const parsed = JSON.parse(user.social_media);
              socialData = { ...socialData, ...parsed };
            } catch {
              // JSON parse hatası varsa görmezden gel
            }
          }
        }
        
        return socialData;
      })(),
      address: user.address || '',
      notes: user.notes || '',
      is_active: user.isActive !== false && user.is_active !== false,
      password: '', // şifreyi düzenlemede boş bırak
    } : { ...emptyUser, password: '' };
  });
  const [profileImageError, setProfileImageError] = useState<string | null>(null);
  const [profileImageSize, setProfileImageSize] = useState<number | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileImageError(null);
    setProfileImageSize(file.size);
    if (file.size > 10 * 1024 * 1024) {
      setProfileImageError('Dosya çok büyük (max 10mb)');
      setForm((f: any) => ({ ...f, profile_image_base64: '' }));
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((f: any) => ({ ...f, profile_image_base64: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSocialChange = (key: string, value: string) => {
    setForm((f: any) => ({ ...f, social_media: { ...f.social_media, [key]: value } }));
  };

  const handleChange = (key: string, value: any) => {
    setForm((f: any) => ({ ...f, [key]: value }));
  };

  const [formError, setFormError] = useState<string | null>(null);
  const handleSave = () => {
    // Zorunlu alanlar kontrolü
    if (!form.first_name || !form.last_name || !form.unit_id || !form.username || (!isEdit && !form.password) || !form.role) {
      setFormError('Ad, Soyad, Birim, Kullanıcı Adı, Rol ve Şifre (eklemede) zorunludur.');
      return;
    }

    // Şifre uzunluk kontrolü
    if (!isEdit && form.password && form.password.length < 6) {
      setFormError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    // Düzenlemede şifre girildiyse uzunluk kontrolü
    if (isEdit && form.password && form.password.length > 0 && form.password.length < 6) {
      setFormError('Yeni şifre en az 6 karakter olmalıdır.');
      return;
    }

    // Email format kontrolü
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setFormError('Geçerli bir e-posta adresi giriniz.');
      return;
    }

    // Telefon format kontrolü (basit)
    if (form.phone && !/^[0-9\s\-\+\(\)]{10,}$/.test(form.phone)) {
      setFormError('Geçerli bir telefon numarası giriniz.');
      return;
    }

    // Kullanıcı adı format kontrolü
    if (form.username && (form.username.length < 3 || !/^[a-zA-Z0-9_]+$/.test(form.username))) {
      setFormError('Kullanıcı adı en az 3 karakter olmalı ve sadece harf, rakam ve alt çizgi içerebilir.');
      return;
    }

    setFormError(null);
    
    // Tüm alanları snake_case olarak backend'e gönder
    const payload: any = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      display_name: form.display_name.trim(),
      username: form.username.trim().toLowerCase(),
      role: form.role,
      unit_id: Number(form.unit_id),
      email: form.email ? form.email.trim().toLowerCase() : '',
      phone: form.phone ? form.phone.trim() : '',
      gender: form.gender,
      birth_date: form.birth_date === '' ? null : form.birth_date,
      profile_image_base64: form.profile_image_base64 || '',
      social_media: form.social_media,
      address: form.address ? form.address.trim() : '',
      notes: form.notes ? form.notes.trim() : '',
      is_active: form.is_active,
    };

    // Şifre sadece gerektiğinde eklenir
    if (!isEdit) {
      payload.password = form.password;
    } else {
      if (form.password && form.password.length > 0) {
        payload.password = form.password;
      }
    }

    onSave(payload);
  };

  return (
    <form
      style={{
        padding: 0,
        minWidth: 360,
        maxWidth: 700,
        width: '100%',
        margin: '0 auto',
        boxSizing: 'border-box',
      }}
      onSubmit={e => { e.preventDefault(); handleSave(); }}
    >
      <div style={{
        padding: '32px 40px 16px 40px',
        borderBottom: '1px solid #f1f5f9',
        fontWeight: 700,
        fontSize: 22,
        color: '#2563eb',
        letterSpacing: 0.2,
        textAlign: 'left',
      }}>
        {isEdit ? 'Kullanıcıyı Düzenle' : 'Kullanıcı Ekle'}
      </div>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '24px 40px 8px 40px' }}>
        {formError && <Box sx={{ color: 'red', fontWeight: 600, fontSize: 15 }}>{formError}</Box>}
        
        <TextField 
          label="Ad" 
          value={form.first_name || ''} 
          onChange={e => handleChange('first_name', e.target.value)} 
          fullWidth 
          required 
          size="medium" 
          placeholder="Ad giriniz" 
        />
        
        <TextField 
          label="Soyad" 
          value={form.last_name || ''} 
          onChange={e => handleChange('last_name', e.target.value)} 
          fullWidth 
          required 
          size="medium" 
          placeholder="Soyad giriniz" 
        />
        
        <TextField 
          label="Görünen Ad" 
          value={form.display_name || ''} 
          onChange={e => handleChange('display_name', e.target.value)} 
          fullWidth 
          size="medium" 
          placeholder="Ekranda görünecek ad (opsiyonel)" 
        />
        
        <TextField 
          label="Kullanıcı Adı" 
          value={form.username || ''} 
          onChange={e => handleChange('username', e.target.value)} 
          fullWidth 
          required 
          size="medium" 
          placeholder="Kullanıcı adı giriniz" 
        />
        
        <FormControl fullWidth required size="medium">
          <InputLabel id="role-label">Rol</InputLabel>
          <Select labelId="role-label" value={form.role || ''} label="Rol" onChange={e => handleChange('role', e.target.value)}>
            <MenuItem value="personel">Personel</MenuItem>
            <MenuItem value="manager">Yönetici</MenuItem>
            <MenuItem value="superadmin">Superadmin</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl fullWidth required size="medium">
          <InputLabel id="unit-label">Birim</InputLabel>
          <Select labelId="unit-label" value={form.unit_id || ''} label="Birim" onChange={e => handleChange('unit_id', e.target.value)}>
            <MenuItem value="">Birim Seç</MenuItem>
            {units.map((u: any) => (<MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>))}
          </Select>
        </FormControl>
        
        <TextField 
          label="E-posta" 
          value={form.email || ''} 
          onChange={e => handleChange('email', e.target.value)} 
          fullWidth 
          type="email" 
          size="medium" 
          placeholder="ornek@eposta.com" 
        />
        
        <TextField 
          label="Telefon" 
          value={form.phone || ''} 
          onChange={e => handleChange('phone', e.target.value)} 
          fullWidth 
          size="medium" 
          placeholder="05xx xxx xx xx" 
        />
        
        <FormControl fullWidth size="medium">
          <InputLabel id="gender-label">Cinsiyet</InputLabel>
          <Select labelId="gender-label" value={form.gender || ''} label="Cinsiyet" onChange={e => handleChange('gender', e.target.value)}>
            {genderOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
          </Select>
        </FormControl>
        
        <TextField 
          label="Doğum Tarihi" 
          type="date" 
          value={form.birth_date || ''} 
          onChange={e => handleChange('birth_date', e.target.value)} 
          fullWidth 
          InputLabelProps={{ shrink: true }} 
          size="medium" 
        />
        
        <Box>
          <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Profil Resmi (JPEG/PNG)</label>
          <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'block', marginBottom: 8 }} />
          {profileImageSize !== null && (
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>
              Dosya boyutu: {(profileImageSize / 1024 / 1024).toFixed(2)} mb
            </div>
          )}
          {profileImageError && (
            <div style={{ color: 'red', fontSize: 14, marginBottom: 4 }}>{profileImageError}</div>
          )}
          {form.profile_image_base64 && !profileImageError && (
            <img src={form.profile_image_base64} alt="Profil Önizleme" style={{ maxWidth: 80, maxHeight: 80, borderRadius: 8, marginTop: 4 }} />
          )}
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <label style={{ fontWeight: 500, fontSize: 15, color: '#374151' }}>Sosyal Medya</label>
          <TextField 
            label="X (Twitter)" 
            value={form.social_media.x || ''} 
            onChange={e => handleSocialChange('x', e.target.value)} 
            fullWidth 
            size="medium" 
            placeholder="https://x.com/kullanici" 
          />
          <TextField 
            label="Instagram" 
            value={form.social_media.instagram || ''} 
            onChange={e => handleSocialChange('instagram', e.target.value)} 
            fullWidth 
            size="medium" 
            placeholder="https://instagram.com/kullanici" 
          />
          <TextField 
            label="Facebook" 
            value={form.social_media.facebook || ''} 
            onChange={e => handleSocialChange('facebook', e.target.value)} 
            fullWidth 
            size="medium" 
            placeholder="https://facebook.com/kullanici" 
          />
          <TextField 
            label="TikTok" 
            value={form.social_media.tiktok || ''} 
            onChange={e => handleSocialChange('tiktok', e.target.value)} 
            fullWidth 
            size="medium" 
            placeholder="https://tiktok.com/@kullanici" 
          />
        </Box>
        
        <TextField 
          label="Adres" 
          value={form.address || ''} 
          onChange={e => handleChange('address', e.target.value)} 
          fullWidth 
          multiline 
          minRows={2} 
          size="medium" 
          placeholder="Adres giriniz" 
        />
        
        <TextField 
          label="Notlar" 
          value={form.notes || ''} 
          onChange={e => handleChange('notes', e.target.value)} 
          fullWidth 
          multiline 
          minRows={2} 
          size="medium" 
          placeholder="Ek notlar (opsiyonel)" 
        />
        
        <FormControlLabel 
          control={<Switch checked={form.is_active || false} onChange={e => handleChange('is_active', e.target.checked)} color="primary" />} 
          label="Aktif mi?" 
        />
        
        <TextField
          label="Şifre"
          type="password"
          value={form.password || ''}
          onChange={e => handleChange('password', e.target.value)}
          fullWidth
          required={!isEdit}
          size="medium"
          placeholder={isEdit ? 'Şifreyi değiştirmek için yeni şifre girin (boş bırakılırsa değişmez)' : 'Şifre giriniz'}
        />
      </Box>
      <DialogActions sx={{ mt: 2, px: 4, pb: 3, justifyContent: 'flex-end' }}>
        <Button onClick={onClose} color="secondary" variant="outlined" sx={{ borderRadius: 2, minWidth: 110, fontWeight: 600, mr: 1 }}>Vazgeç</Button>
        <Button type="submit" variant="contained" color="primary" sx={{ borderRadius: 2, minWidth: 110, fontWeight: 700 }}>{isEdit ? 'Kaydet' : 'Ekle'}</Button>
      </DialogActions>
    </form>
  );
};

export default UserEditModal;