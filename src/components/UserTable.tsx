import React, { useState } from 'react';
import type { ChangeEvent } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TablePagination from '@mui/material/TablePagination';
import TextField from '@mui/material/TextField';
import type { User } from '../data/users';
import type { Unit } from '../data/units';


interface UserTableProps {
  users: User[];
  units: Unit[];
  onEdit: (user: User) => void;
}

const columns = [
  { key: 'profileImageBase64', label: 'Profil Resmi' },
  { key: 'socialMedia', label: 'Sosyal Medya' },
  { key: 'address', label: 'Adres' },
  { key: 'notes', label: 'Notlar' },
  { key: 'isActive', label: 'Durum' },
  { key: 'createdAt', label: 'Kayıt Tarihi' },
  { key: 'updatedAt', label: 'Güncelleme Tarihi' },
];

// Eğer tüm alanlar gösterilecekse, columns dizisini aşağıdaki gibi tam sırayla yapın:
// Profil Resmi, Sosyal Medya, Ad, Soyad, Görünen Ad, Kullanıcı Adı, Rol, Birim, E-posta, Telefon, Cinsiyet, Doğum Tarihi, Adres, Notlar, Durum, Kayıt Tarihi, Güncelleme Tarihi
// columns = [
//   { key: 'profileImageBase64', label: 'Profil Resmi' },
//   { key: 'socialMedia', label: 'Sosyal Medya' },
//   { key: 'first_name', label: 'Ad' },
//   { key: 'last_name', label: 'Soyad' },
//   { key: 'displayName', label: 'Görünen Ad' },
//   { key: 'username', label: 'Kullanıcı Adı' },
//   { key: 'role', label: 'Rol' },
//   { key: 'unit', label: 'Birim' },
//   { key: 'email', label: 'E-posta' },
//   { key: 'phone', label: 'Telefon' },
//   { key: 'gender', label: 'Cinsiyet' },
//   { key: 'birthDate', label: 'Doğum Tarihi' },
//   { key: 'address', label: 'Adres' },
//   { key: 'notes', label: 'Notlar' },
//   { key: 'isActive', label: 'Durum' },
//   { key: 'createdAt', label: 'Kayıt Tarihi' },
//   { key: 'updatedAt', label: 'Güncelleme Tarihi' },
// ];

const UserTable: React.FC<UserTableProps> = ({ users, units, onEdit }) => {
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState<string>('');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (colKey: string) => {
    if (orderBy === colKey) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(colKey);
      setOrder('asc');
    }
  };

  const handleFilterChange = (key: string) => (e: ChangeEvent<HTMLInputElement>) => {
    setFilters(f => ({ ...f, [key]: e.target.value }));
    setPage(0);
  };


  const filtered = users.filter(user =>
    columns.every(col => {
      const val =
        col.key === 'unit'
          ? units.find(u => u.id === (user as any).unit_id || u.id === (user as any).unit)?.name || ''
          : col.key === 'displayName'
          ? ((user as any).displayName || (user as any).name || '')
          : col.key === 'isActive'
          ? (user.isActive !== false ? 'Aktif' : 'Pasif')
          : col.key === 'birthDate'
          ? (user.birthDate ? new Date(user.birthDate).toLocaleDateString('tr-TR') : '')
          : col.key === 'createdAt'
          ? (user.createdAt ? new Date(user.createdAt).toLocaleString('tr-TR') : '')
          : col.key === 'updatedAt'
          ? (user.updatedAt ? new Date(user.updatedAt).toLocaleString('tr-TR') : '')
          : (user as any)[col.key] || '';
      return (filters[col.key] || '').length === 0 || (val + '').toLowerCase().includes((filters[col.key] || '').toLowerCase());
    })
  );

  const sorted = orderBy
    ? [...filtered].sort((a, b) => {
        let aVal: any;
        let bVal: any;
        if (orderBy === 'unit') {
          aVal = units.find(u => u.id === (a as any).unit_id || u.id === (a as any).unit)?.name || '';
          bVal = units.find(u => u.id === (b as any).unit_id || u.id === (b as any).unit)?.name || '';
        } else if (orderBy === 'displayName') {
          aVal = (a as any).displayName || (a as any).name || '';
          bVal = (b as any).displayName || (b as any).name || '';
        } else if (orderBy === 'isActive') {
          aVal = a.isActive !== false ? 'Aktif' : 'Pasif';
          bVal = b.isActive !== false ? 'Aktif' : 'Pasif';
        } else if (orderBy === 'birthDate') {
          aVal = a.birthDate ? new Date(a.birthDate).getTime() : 0;
          bVal = b.birthDate ? new Date(b.birthDate).getTime() : 0;
        } else if (orderBy === 'createdAt' || orderBy === 'updatedAt') {
          aVal = a[orderBy] ? new Date(a[orderBy] as any).getTime() : 0;
          bVal = b[orderBy] ? new Date(b[orderBy] as any).getTime() : 0;
        } else {
          aVal = (a as any)[orderBy] || '';
          bVal = (b as any)[orderBy] || '';
        }
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        return order === 'asc' ? aVal - bVal : bVal - aVal;
      })
    : filtered;

  const paged = sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#dbeafe' }}>
            <TableCell sx={{ position: 'sticky', left: 0, background: '#dbeafe', zIndex: 2, fontWeight: 700 }}>#</TableCell>
            {columns.map(col => (
              <TableCell
                key={col.key}
                onClick={() => handleSort(col.key)}
                sx={{ cursor: 'pointer', userSelect: 'none', fontWeight: 700 }}
              >
                {col.label}
                {orderBy === col.key ? (
                  order === 'asc' ? ' ▲' : ' ▼'
                ) : ''}
              </TableCell>
            ))}
            <TableCell>İşlem</TableCell>
          </TableRow>
          <TableRow>
            <TableCell />
            {columns.map(col => (
              <TableCell key={col.key}>
                <TextField
                  size="small"
                  variant="standard"
                  value={filters[col.key] || ''}
                  onChange={handleFilterChange(col.key)}
                  placeholder={col.label}
                  fullWidth
                />
              </TableCell>
            ))}
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {paged.map((user, idx) => (
            <TableRow key={user.id} sx={{ backgroundColor: (page * rowsPerPage + idx) % 2 === 0 ? 'white' : '#f3f6f9' }}>
              <TableCell sx={{ position: 'sticky', left: 0, background: (page * rowsPerPage + idx) % 2 === 0 ? 'white' : '#f3f6f9', zIndex: 1 }}>{page * rowsPerPage + idx + 1}</TableCell>
              {columns.map(col => {
                let value: React.ReactNode = '-';
                if (col.key === 'profileImageBase64') {
                  value = user.profileImageBase64 ? (
                    <img src={user.profileImageBase64} alt="Profil" style={{ width: 32, height: 32, borderRadius: 8 }} />
                  ) : '-';
                } else if (col.key === 'socialMedia') {
                  value = user.socialMedia && (user.socialMedia.x || user.socialMedia.instagram || user.socialMedia.facebook || user.socialMedia.tiktok) ? (
                    <span style={{ display: 'flex', gap: 6 }}>
                      {user.socialMedia.x && <a href={user.socialMedia.x} target="_blank" rel="noopener noreferrer" title="X">X</a>}
                      {user.socialMedia.instagram && <a href={user.socialMedia.instagram} target="_blank" rel="noopener noreferrer" title="Instagram">IG</a>}
                      {user.socialMedia.facebook && <a href={user.socialMedia.facebook} target="_blank" rel="noopener noreferrer" title="Facebook">FB</a>}
                      {user.socialMedia.tiktok && <a href={user.socialMedia.tiktok} target="_blank" rel="noopener noreferrer" title="TikTok">TT</a>}
                    </span>
                  ) : '-';
                } else if (col.key === 'address') {
                  value = user.address || '-';
                } else if (col.key === 'notes') {
                  value = user.notes || '-';
                } else if (col.key === 'isActive') {
                  value = user.isActive !== false ? 'Aktif' : 'Pasif';
                } else if (col.key === 'createdAt') {
                  value = user.createdAt ? new Date(user.createdAt).toLocaleString('tr-TR') : '-';
                } else if (col.key === 'updatedAt') {
                  value = user.updatedAt ? new Date(user.updatedAt).toLocaleString('tr-TR') : '-';
                }
                return <TableCell key={col.key}>{value}</TableCell>;
              })}
              <TableCell>
                <button onClick={() => onEdit(user)} style={{ background: '#2563eb', color: '#fff', border: 0, borderRadius: 6, padding: '4px 12px', fontWeight: 600, cursor: 'pointer' }}>Düzenle</button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={filtered.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        rowsPerPageOptions={[5, 10, 20, 50]}
        labelRowsPerPage="Satır / sayfa"
      />
    </TableContainer>
  );
};

export default UserTable;
