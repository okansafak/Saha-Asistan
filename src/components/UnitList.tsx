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

interface Props {
  users: User[];
  units: Unit[];
  onAddUnit: (unit: Partial<Unit>) => void;
  onEditUnit: (unit: Unit) => void;
}

const UnitList: React.FC<Props> = ({ users, units, onAddUnit, onEditUnit }) => {
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
    // Kök birimler: parentId yok veya null/undefined
    const children = units.filter(u => (parentId === undefined ? !u.parentId : u.parentId === parentId));
    if (children.length === 0) return null;
    return (
      <ul style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}>
        {children.map(unit => (
          <li key={unit.id} style={{ marginBottom: 14 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: level === 0 ? '#f8fafc' : '#f3f6fa',
              borderRadius: level === 0 ? 16 : 12,
              boxShadow: level === 0 ? '0 2px 8px #0001' : '0 1px 4px #0001',
              padding: level === 0 ? '14px 22px' : '10px 18px',
              border: '1.5px solid #e5e7eb',
              marginLeft: level === 0 ? 0 : 24,
              position: 'relative',
              minWidth: 220,
            }}>
              <span style={{ fontWeight: 600, color: '#2563eb', fontSize: 17 }}>{unit.name}</span>
              <Button size="small" variant="outlined" sx={{ ml: 2, fontWeight: 600, borderRadius: 2, minWidth: 80 }} onClick={() => handleOpenEdit(unit)}>Düzenle</Button>
              <Button size="small" variant="contained" sx={{ ml: 1, fontWeight: 600, borderRadius: 2, minWidth: 120 }} onClick={() => handleOpenAdd(unit.id)}>Alt Birim Ekle</Button>
              <div style={{ flex: 1 }} />
            </div>
            {/* Alt birimler üst birimin kutusu içinde, daha açık arka plan ve iç içe kutu ile gösterilir */}
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
    </Box>
  );
};

export default UnitList;
