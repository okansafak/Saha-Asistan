
import React, { useState } from 'react';
import type { User, UserRole } from '../data/users';
import type { Unit } from '../data/units';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
// ...existing code...

interface Props {
  onAddUser: (user: Omit<User, 'id'>) => void;
  onAddUnit: (unit: Omit<Unit, 'id'>) => void;
  units: Unit[];
  users?: User[];
}

interface AdminPanelProps extends Props {
  onClose?: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onAddUser, onAddUnit, units, users = [], onClose }) => {
  const [error, setError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [profileImageBase64, setProfileImageBase64] = useState('');
  const [socialMedia, setSocialMedia] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('personel');
  const [userUnitId, setUserUnitId] = useState('');
  const [isActive, setIsActive] = useState(true);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-0 mb-8 max-w-3xl mx-auto mt-6 border border-gray-100">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', padding: '20px 32px 12px 32px' }}>
        <h2 style={{ fontWeight: 700, fontSize: 22, color: '#2563eb', margin: 0 }}>Kullanıcı Ekle</h2>
        {onClose && (
          <button type="button" aria-label="Kapat" onClick={onClose} style={{ background: 'none', border: 0, fontSize: 28, color: '#64748b', cursor: 'pointer', lineHeight: 1, padding: 0 }}>&times;</button>
        )}
      </div>
      <form onSubmit={e => {
        e.preventDefault();
        setError(null);
        if (!firstName || !lastName || !username || !password || !userRole || !userUnitId) {
          setError('Tüm alanlar zorunlu!');
          return;
        }
        const exists = users.some(u =>
          u &&
          typeof u.first_name === 'string' &&
          typeof u.last_name === 'string' &&
          typeof u.unit === 'string' &&
          u.first_name.trim().toLowerCase() === firstName.trim().toLowerCase() &&
          u.last_name.trim().toLowerCase() === lastName.trim().toLowerCase() &&
          u.unit === userUnitId
        );
        if (exists) {
          setError('Bu birimde aynı ad ve soyad ile bir kullanıcı zaten var!');
          return;
        }
        const usernameExists = users.some(u => typeof u.username === 'string' && u.username.trim().toLowerCase() === username.trim().toLowerCase());
        if (usernameExists) {
          setError('Bu kullanıcı adı zaten kullanılıyor!');
          return;
        }
        onAddUser({
          first_name: firstName,
          last_name: lastName,
          display_name: displayName || '',
          phone: phone || '',
          email: email || '',
          gender: gender || '',
          birth_date: birthDate || '',
          profile_image_base64: profileImageBase64 || '',
          social_media: socialMedia ? (() => { try { return JSON.parse(socialMedia); } catch { return {}; } })() : {},
          address: address || '',
          notes: notes || '',
          unit_id: userUnitId,
          username,
          password,
          role: String(userRole),
          is_active: isActive
        } as any);
        setFirstName(''); setLastName(''); setDisplayName(''); setPhone(''); setEmail(''); setGender(''); setBirthDate(''); setProfileImageBase64(''); setSocialMedia(''); setAddress(''); setNotes(''); setUsername(''); setPassword(''); setUserRole('personel'); setUserUnitId(''); setIsActive(true);
      }}>
        <Grid container spacing={2} direction="column" sx={{ padding: '24px 32px 8px 32px' }}>
          <Grid item xs={12} sm={6}>
            <TextField label="Ad" value={firstName} onChange={e=>setFirstName(e.target.value)} fullWidth required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Soyad" value={lastName} onChange={e=>setLastName(e.target.value)} fullWidth required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Görünen Ad (Opsiyonel)" value={displayName} onChange={e=>setDisplayName(e.target.value)} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Telefon" value={phone} onChange={e=>setPhone(e.target.value)} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="E-posta" value={email} onChange={e=>setEmail(e.target.value)} fullWidth type="email" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="gender-label">Cinsiyet</InputLabel>
              <Select labelId="gender-label" value={gender} label="Cinsiyet" onChange={e=>setGender(e.target.value)}>
                <MenuItem value="">Belirtilmedi</MenuItem>
                <MenuItem value="male">Erkek</MenuItem>
                <MenuItem value="female">Kadın</MenuItem>
                <MenuItem value="other">Diğer</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Doğum Tarihi" type="date" value={birthDate} onChange={e=>setBirthDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Profil Resmi (JPEG/PNG)</label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onloadend = () => {
                  setProfileImageBase64(reader.result as string);
                };
                reader.readAsDataURL(file);
              }}
              style={{ display: 'block', marginBottom: 8 }}
            />
            {profileImageBase64 && (
              <img src={profileImageBase64} alt="Profil Önizleme" style={{ maxWidth: 80, maxHeight: 80, borderRadius: 8, marginTop: 4 }} />
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Sosyal Medya (JSON)" value={socialMedia} onChange={e=>setSocialMedia(e.target.value)} fullWidth helperText={'Örn: {"twitter":"@kullanici"}'} />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Adres" value={address} onChange={e=>setAddress(e.target.value)} fullWidth multiline minRows={2} />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Notlar" value={notes} onChange={e=>setNotes(e.target.value)} fullWidth multiline minRows={2} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Kullanıcı Adı" value={username} onChange={e=>setUsername(e.target.value)} fullWidth required autoComplete="username" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Şifre" type="password" value={password} onChange={e=>setPassword(e.target.value)} fullWidth required autoComplete="new-password" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel id="user-role-label">Rol</InputLabel>
              <Select labelId="user-role-label" value={userRole || 'personel'} label="Rol" onChange={e => setUserRole((e.target.value || 'personel') as UserRole)}>
                <MenuItem value="personel">Personel</MenuItem>
                <MenuItem value="manager">Yönetici</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel id="user-unit-label">Birim</InputLabel>
              <Select labelId="user-unit-label" value={userUnitId} label="Birim" onChange={e=>setUserUnitId(e.target.value)}>
                <MenuItem value="">Birim Seç</MenuItem>
                {units.map(u=>(<MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel control={<Switch checked={isActive} onChange={e=>setIsActive(e.target.checked)} color="primary" />} label="Aktif mi?" />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ fontWeight: 700, py: 1.5, borderRadius: 2, mt: 2 }}>Kullanıcı Ekle</Button>
          </Grid>
        </Grid>
      </form>
    </div>
  );
};

export default AdminPanel;
