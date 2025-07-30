import React, { useState } from 'react';
import type { User } from '../data/users';
import type { Unit } from '../data/units';


import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';

interface Props {
  users: User[];
  units: Unit[];
  onAddUnit: (unit: Partial<Unit>) => void;
  onEditUnit: (unit: Unit) => void;
  onDeleteUnitSuccess?: () => void;
}

import { deleteUnit } from '../services/unitApi';

const UnitList: React.FC<Props> = ({ users, units, onAddUnit, onEditUnit, onDeleteUnitSuccess }) => {
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean, unit: Unit | null, error: string | null }>({ open: false, unit: null, error: null });
  const handleDeleteClick = (unit: Unit) => {
    // Eğer bu birime bağlı kullanıcı varsa silme
    const hasUsers = users.some(u => ((u as any).unit_id === unit.id || (u as any).unit === unit.id));
    if (hasUsers) {
      setDeleteDialog({ open: true, unit, error: 'Bu birime bağlı kullanıcı(lar) olduğu için silinemez.' });
      return;
    }
    setDeleteDialog({ open: true, unit, error: null });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.unit) return;
    try {
      await deleteUnit(deleteDialog.unit.id);
      setDeleteDialog({ open: false, unit: null, error: null });
      if (typeof onDeleteUnitSuccess === 'function') {
        onDeleteUnitSuccess();
      }
    } catch (e) {
      setDeleteDialog({ ...deleteDialog, error: 'Birim silinemedi.' });
    }
  };

  const handleDeleteCancel = () => setDeleteDialog({ open: false, unit: null, error: null });
  const [open, setOpen] = useState(false);
  const [editUnit, setEditUnit] = useState<Unit | null>(null);
  const [parentId, setParentId] = useState<string | undefined>(undefined);
  const [unitName, setUnitName] = useState('');

  const handleOpenAdd = (parentId?: string) => {
    setEditUnit(null);
    setParentId(parentId);
    setUnitName('');
    setOpen(true);
  };
  const handleOpenEdit = (unit: Unit) => {
    setEditUnit(unit);
    setUnitName(unit.name);
    setParentId(unit.parentId);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setEditUnit(null);
    setUnitName('');
    setParentId(undefined);
  };
  const handleSave = () => {
    if (unitName.trim() === '') return;
    if (editUnit) {
      onEditUnit({ ...editUnit, name: unitName });
    } else {
      onAddUnit({ name: unitName, parentId });
    }
    handleClose();
  };

  // Sadece kök birimlerden başlat, alt birimleri recursive olarak ekle
  function renderUnitTree(parentId: string | undefined = undefined, level = 0) {
    const children = units.filter(u => (parentId === undefined ? !u.parentId : u.parentId === parentId));
    if (children.length === 0) return null;
    return (
      <ul style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}>
        {children.map(unit => (
          <li key={unit.id} style={{ marginBottom: 14, position: 'relative' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: level === 0 ? '#f8fafc' : '#f3f6fa',
              borderRadius: level === 0 ? 16 : 12,
              boxShadow: level === 0 ? '0 2px 8px #0001' : '0 1px 4px #0001',
              padding: level === 0 ? '14px 22px' : '10px 18px',
              border: '1.5px solid #e5e7eb',
              marginLeft: level === 0 ? 0 : 32 * level,
              minWidth: 220,
              position: 'relative',
              transition: 'margin 0.2s',
            }}>
              <span style={{ marginRight: 10, fontSize: 18 }}>{level === 0 ? '🏢' : '└─'}</span>
              <span style={{ fontWeight: 600, color: '#2563eb', fontSize: 17 }}>{unit.name}</span>
              <Button size="small" variant="outlined" sx={{ ml: 2, fontWeight: 600, borderRadius: 2, minWidth: 80 }} onClick={() => handleOpenEdit(unit)}>Düzenle</Button>
              <Button size="small" variant="contained" sx={{ ml: 1, fontWeight: 600, borderRadius: 2, minWidth: 120 }} onClick={() => handleOpenAdd(unit.id)}>Alt Birim Ekle</Button>
              <div style={{ flex: 1 }} />
              <Button size="small" color="error" variant="outlined" sx={{ ml: 1, fontWeight: 600, borderRadius: 2, minWidth: 80 }} onClick={() => handleDeleteClick(unit)}>Sil</Button>
            </div>
            {/* Alt birimler için sol çizgi ve iç içe kutu vurgusu */}
            {units.some(u => u.parentId === unit.id) && (
              <div style={{
                position: 'absolute',
                left: level === 0 ? 24 : 32 * (level + 0.5),
                top: 38,
                bottom: 0,
                width: 2,
                background: '#e0e7ef',
                zIndex: 0,
              }} />
            )}
            <div style={{ marginTop: 6 }}>{renderUnitTree(unit.id, level + 1)}</div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <Box sx={{ width: '100%', background: '#fff', borderRadius: 3, boxShadow: '0 2px 12px #0001', p: { xs: 2, md: 3 }, minWidth: 400, maxWidth: 900, mx: 'auto', mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <h2 style={{ fontWeight: 700, fontSize: 22, color: '#2563eb', margin: 0 }}>Birimler</h2>
        <Button variant="contained" onClick={() => handleOpenAdd(undefined)} sx={{ fontWeight: 700, borderRadius: 2, minWidth: 160, height: 44, fontSize: 16 }}>KÖK BİRİM EKLE</Button>
      </Box>
      {renderUnitTree()}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editUnit ? 'Birim Düzenle' : 'Birim Ekle'}</DialogTitle>
        <DialogContent>
          <TextField label="Birim Adı" value={unitName} onChange={e => setUnitName(e.target.value)} fullWidth autoFocus sx={{ mt: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>İptal</Button>
          <Button onClick={handleSave} variant="contained">Kaydet</Button>
        </DialogActions>
      </Dialog>

      {/* Birim silme diyaloğu */}
      <Dialog open={deleteDialog.open} onClose={handleDeleteCancel}>
        <DialogTitle>Birim Sil</DialogTitle>
        <DialogContent>
          {deleteDialog.error ? (
            <Alert severity="error">{deleteDialog.error}</Alert>
          ) : (
            <>
              <div>"{deleteDialog.unit?.name}" birimini silmek istediğinize emin misiniz?</div>
              <div style={{ color: '#b91c1c', marginTop: 8, fontWeight: 500 }}>Alt birimler de silinir.</div>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Vazgeç</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={!!deleteDialog.error}>Sil</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UnitList;
