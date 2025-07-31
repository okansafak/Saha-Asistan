
import React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import HiUsersIcon from '@mui/icons-material/Group';
import HiOfficeBuildingIcon from '@mui/icons-material/Business';
import HiDocumentTextIcon from '@mui/icons-material/Description';
import WorkIcon from '@mui/icons-material/Work';

export type SidebarSection = 'users' | 'units' | 'forms' | 'jobs';

const items = [
  { key: 'users', label: 'Kullanıcılar', icon: <HiUsersIcon /> },
  { key: 'units', label: 'Birimler', icon: <HiOfficeBuildingIcon /> },
  { key: 'forms', label: 'Formlar', icon: <HiDocumentTextIcon /> },
  { key: 'jobs', label: 'İşler', icon: <WorkIcon /> },
];

interface SidebarProps {
  onSelect: (section: SidebarSection) => void;
  selected: SidebarSection;
}

const Sidebar: React.FC<SidebarProps> = ({ onSelect, selected }) => (
  <Drawer
    variant="permanent"
    PaperProps={{
      sx: {
        width: 240,
        bgcolor: '#172554',
        color: '#f1f5f9',
        border: 0,
        boxShadow: 6,
        borderRadius: '0 24px 24px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: 1200,
        py: 4,
        px: 2,
      },
    }}
    sx={{ flexShrink: 0 }}
  >
    <Box mb={6} display="flex" flexDirection="column" alignItems="center" width="100%">
      <Avatar sx={{ width: 64, height: 64, bgcolor: '#2563eb', mb: 1 }}>
        <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fff" fillOpacity="0.15"/><path d="M7 17l5-5 5 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 7h10" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
      </Avatar>
      <Typography variant="h6" fontWeight={900} align="center" sx={{ letterSpacing: 1, color: '#f1f5f9' }}>Saha Asistan</Typography>
      <Typography variant="caption" sx={{ mt: 0.5, letterSpacing: 2, color: '#a5b4fc' }}>Yönetim Paneli</Typography>
    </Box>
    <List sx={{ width: '100%' }}>
      {items.map(item => (
        <ListItem key={item.key} disablePadding>
          <ListItemButton
            selected={selected === item.key}
            onClick={() => onSelect(item.key as SidebarSection)}
            sx={{
              borderRadius: 2,
              mb: 1,
              bgcolor: selected === item.key ? '#1e293b' : 'transparent',
              boxShadow: selected === item.key ? 3 : 0,
              '&:hover': { bgcolor: '#334155' },
            }}
          >
            <ListItemIcon sx={{ color: selected === item.key ? '#facc15' : '#a5b4fc', minWidth: 36 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600, color: '#f1f5f9' }} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
    <Box flex={1} />
    <Box mt={6} display="flex" flexDirection="column" alignItems="center" width="100%">
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <Avatar sx={{ width: 32, height: 32, bgcolor: '#2563eb', fontWeight: 700 }}>S</Avatar>
        <Typography variant="body2" sx={{ color: '#a5b4fc', fontWeight: 600 }}>Superadmin</Typography>
      </Box>
      <Typography variant="caption" align="center" sx={{ userSelect: 'none', color: '#a5b4fc' }}>
        © {new Date().getFullYear()} <b style={{ color: '#f1f5f9', opacity: 0.9 }}>Saha Asistan</b>
      </Typography>
    </Box>
  </Drawer>
);

export default Sidebar;
