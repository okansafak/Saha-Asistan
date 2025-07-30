
import React, { useState } from 'react';
import { login } from '../services/api';
import type { User } from '../data/users';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import MapIcon from '@mui/icons-material/Map';

interface Props {
  onLogin: (user: User) => void;
  users: User[];
}


const LoginScreen: React.FC<Props> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(username, password);
      if (result.success && result.user) {
        // Beni hatırla seçiliyse localStorage, değilse sessionStorage'a yaz
        if (remember) {
          localStorage.setItem('currentUser', JSON.stringify(result.user));
        } else {
          sessionStorage.setItem('currentUser', JSON.stringify(result.user));
        }
        onLogin(result.user);
      } else {
        setError('Kullanıcı adı veya şifre hatalı');
      }
    } catch (err) {
      setError('Giriş başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" sx={{ background: 'linear-gradient(135deg, #60a5fa 0%, #a5b4fc 100%)' }}>
      <Box width="100%" maxWidth={400} p={2}>
        <Paper elevation={6} sx={{ borderRadius: 4, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box display="flex" alignItems="center" justifyContent="center" sx={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)', mb: 3 }}>
            <MapIcon sx={{ color: 'white', fontSize: 48 }} />
          </Box>
          <Typography variant="h4" fontWeight={900} color="primary" mb={1} sx={{ letterSpacing: '-1px' }}>Saha Asistan</Typography>
          <Typography variant="subtitle1" color="primary" mb={3}>Giriş Paneli</Typography>
          <Box component="form" width="100%" onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Kullanıcı Adı"
              value={username}
              onChange={e => setUsername(e.target.value)}
              margin="normal"
              autoFocus
              autoComplete="username"
              InputProps={{ startAdornment: <PersonOutlineIcon color="primary" sx={{ mr: 1 }} /> }}
            />
            <TextField
              fullWidth
              label="Şifre"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              margin="normal"
              autoComplete="current-password"
              InputProps={{ startAdornment: <LockOutlinedIcon color="primary" sx={{ mr: 1 }} /> }}
            />
            {error && <Typography color="error" variant="body2" align="center" sx={{ mt: 1, mb: 2, fontWeight: 600 }}>{error}</Typography>}
            <FormControlLabel
              control={<Checkbox checked={remember} onChange={e => setRemember(e.target.checked)} color="primary" />}
              label={<Typography variant="body2" color="textSecondary">Beni Hatırla</Typography>}
              sx={{ mb: 2, mt: 1 }}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              color="primary"
              disabled={!username || !password || loading}
              sx={{ fontWeight: 700, py: 1.5, borderRadius: 2, mt: 1 }}
            >
              {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </Button>
          </Box>
        </Paper>
        <Typography variant="caption" color="textSecondary" align="center" display="block" mt={4}>
          © {new Date().getFullYear()} <b style={{ color: '#2563eb' }}>Saha Asistan</b> | Powered by <b style={{ color: '#6366f1' }}>OpenLayers</b>
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginScreen;
