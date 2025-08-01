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
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

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
    const hasUsers = users.some(u => {
      const userUnitId = (u as any).unit_id || (u as any).unitId || u.unitId;
      return String(userUnitId) === String(unit.id);
    });
    if (hasUsers) {
      setDeleteDialog({ open: true, unit, error: 'Bu birime bağlı kullanıcılar olduğu için silinemez.' });
      return;
    }
    
    // Alt birimleri kontrol et - parent_id mapping ile
    const hasSubUnits = units.some(u => {
      const parentId = (u as any).parent_id || u.parentId;
      return parentId === unit.id;
    });
    if (hasSubUnits) {
      setDeleteDialog({ open: true, unit, error: 'Alt birimleri olan bir birim silinemez. Önce alt birimleri silin.' });
      return;
    }
    
    setDeleteDialog({ open: true, unit, error: null });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, unit: null, error: null });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.unit) return;
    try {
      await deleteUnit(deleteDialog.unit.id);
      setDeleteDialog({ open: false, unit: null, error: null });
      onDeleteUnitSuccess?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setDeleteDialog({ ...deleteDialog, error: msg });
    }
  };

  const [open, setOpen] = useState(false);
  const [editUnit, setEditUnit] = useState<Unit | null>(null);
  const [unitName, setUnitName] = useState('');
  const [parentId, setParentId] = useState<string | undefined>(undefined);

  const handleOpenAdd = (parent?: string) => {
    setParentId(parent);
    setOpen(true);
  };

  const handleOpenEdit = (unit: Unit) => {
    setEditUnit(unit);
    setUnitName(unit.name);
    // Backend'den gelen parent_id'yi de kontrol et
    const currentParentId = (unit as any).parent_id || unit.parentId;
    setParentId(currentParentId);
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
    
    console.log('handleSave çağrıldı:', { editUnit, unitName, parentId });
    
    if (editUnit) {
      // Düzenleme - mevcut parent_id'yi koruyarak güncelle
      const currentParentId = (editUnit as any).parent_id || editUnit.parentId;
      const unitToUpdate = { 
        ...editUnit, 
        name: unitName,
        parentId: parentId !== undefined ? parentId : currentParentId
      };
      console.log('Düzenleme verisi:', unitToUpdate);
      onEditUnit(unitToUpdate);
    } else {
      // Yeni ekleme
      const unitToAdd = { 
        name: unitName, 
        parentId: parentId 
      };
      console.log('Ekleme verisi:', unitToAdd);
      onAddUnit(unitToAdd);
    }
    handleClose();
  };

  // Birim hiyerarşisini tree yapısında render eden fonksiyon
  function renderUnitTree(parentId: string | undefined = undefined, level = 0, siblingMap: boolean[] = []) {
    // Backend'den gelen parent_id'yi parentId'ye çevir
    const normalizedUnits = units.map(unit => ({
      ...unit,
      parentId: (unit as any).parent_id || unit.parentId
    }));
    
    // Mevcut seviyedeki birimleri alfabetik olarak sırala
    const children = normalizedUnits
      .filter(u => (parentId === undefined ? !u.parentId : u.parentId === parentId))
      .sort((a, b) => a.name.localeCompare(b.name, 'tr-TR')); // Türkçe alfabetik sıralama
      
    if (children.length === 0) return null;
    
    return (
      <div style={{ listStyle: 'none', paddingLeft: level * 20, margin: 0 }}>
        {children.map((unit, index) => {
          const isLast = index === children.length - 1;
          const hasChildren = normalizedUnits.some(u => u.parentId === unit.id);
          
          // Bu birime bağlı kişi sayısı
          const userCount = users.filter(user => {
            const userUnitId = (user as any).unit_id || (user as any).unitId || user.unitId;
            return String(userUnitId) === String(unit.id);
          }).length;
          
          // Tree karakterlerini oluştur
          let treePrefix = '';
          siblingMap.forEach((isParentLast) => {
            treePrefix += isParentLast ? '    ' : '│   ';
          });
          
          if (level > 0) {
            treePrefix += isLast ? '└── ' : '├── ';
          }
          
          return (
            <div key={unit.id} style={{ marginBottom: 8 }}>
              {/* Ana birim container'ı */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: level === 0 
                  ? 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' 
                  : hasChildren 
                    ? 'linear-gradient(135deg, #fefefe 0%, #f9fafb 100%)' 
                    : '#ffffff',
                borderRadius: level === 0 ? 16 : 12,
                boxShadow: level === 0 
                  ? '0 8px 25px rgba(0,0,0,0.1), 0 4px 10px rgba(0,0,0,0.05)' 
                  : hasChildren 
                    ? '0 4px 15px rgba(0,0,0,0.08), 0 2px 5px rgba(0,0,0,0.04)' 
                    : '0 2px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.03)',
                padding: level === 0 ? '20px 28px' : hasChildren ? '16px 22px' : '14px 20px',
                border: level === 0 
                  ? '3px solid #cbd5e1' 
                  : hasChildren 
                    ? '2px solid #d1d5db' 
                    : '1px solid #e5e7eb',
                marginLeft: level === 0 ? 0 : 0,
                minWidth: 320,
                position: 'relative',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}>
                {/* Tree prefix görselleştirmesi */}
                <div style={{
                  fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "Consolas", "Courier New", monospace',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: level === 0 ? '#475569' : '#6b7280',
                  marginRight: '12px',
                  lineHeight: '1.3',
                  minWidth: level * 32,
                  whiteSpace: 'pre',
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}>
                  {treePrefix}
                </div>
                
                {/* Birim ikonu - seviyeye ve alt birime sahip olma durumuna göre */}
                <div style={{ 
                  marginRight: 16, 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: level === 0 ? 40 : 36,
                  height: level === 0 ? 40 : 36,
                  borderRadius: '50%',
                  background: level === 0 
                    ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                    : hasChildren 
                      ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                      : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
                }}>
                  <span style={{ 
                    fontSize: level === 0 ? 20 : 18,
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))'
                  }}>
                    {level === 0 ? '🏢' : hasChildren ? '📁' : '📄'}
                  </span>
                </div>
                
                {/* Birim adı ve istatistikler */}
                <div style={{ 
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                  }}>
                    <span style={{ 
                      fontWeight: level === 0 ? 800 : 700, 
                      color: level === 0 ? '#1e40af' : '#1f2937', 
                      fontSize: level === 0 ? 22 : 18,
                      letterSpacing: level === 0 ? '-0.025em' : '0',
                      textShadow: level === 0 ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                    }}>
                      {unit.name}
                    </span>
                    
                    {/* Alt birim sayı badge'i */}
                    {hasChildren && (
                      <span style={{
                        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                        color: '#1d4ed8',
                        fontSize: 12,
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: 16,
                        border: '1px solid #bfdbfe',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}>
                        <span style={{ fontSize: 10 }}>📊</span>
                        {normalizedUnits.filter(u => u.parentId === unit.id).length} alt birim
                      </span>
                    )}
                    
                    {/* Kişi sayısı badge'i */}
                    {userCount > 0 && (
                      <span style={{
                        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                        color: '#166534',
                        fontSize: 12,
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: 16,
                        border: '1px solid #bbf7d0',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}>
                        <span style={{ fontSize: 10 }}>👥</span>
                        {userCount} kişi
                      </span>
                    )}
                  </div>
                  
                  {/* Seviye bilgisi */}
                  {level > 0 && (
                    <span style={{
                      fontSize: 12,
                      color: '#6b7280',
                      fontWeight: 600,
                      opacity: 0.9
                    }}>
                      Seviye {level + 1}
                    </span>
                  )}
                </div>
                
                {/* Butonlar */}
                <div style={{ display: 'flex', gap: 10, marginLeft: 20 }}>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    sx={{ 
                      fontWeight: 700, 
                      borderRadius: 3, 
                      minWidth: 80, 
                      fontSize: 11,
                      height: 36,
                      textTransform: 'none'
                    }} 
                    onClick={() => handleOpenEdit(unit)}
                  >
                    Düzenle
                  </Button>
                  <Button 
                    size="small" 
                    variant="contained" 
                    sx={{ 
                      fontWeight: 700, 
                      borderRadius: 3, 
                      minWidth: 120, 
                      fontSize: 11,
                      height: 36,
                      textTransform: 'none'
                    }} 
                    onClick={() => handleOpenAdd(unit.id)}
                  >
                    Alt Birim Ekle
                  </Button>
                  <Button 
                    size="small" 
                    color="error" 
                    variant="outlined" 
                    sx={{ 
                      fontWeight: 700, 
                      borderRadius: 3, 
                      minWidth: 60, 
                      fontSize: 11,
                      height: 36,
                      textTransform: 'none'
                    }} 
                    onClick={() => handleDeleteClick(unit)}
                  >
                    Sil
                  </Button>
                </div>
              </div>
              
              {/* Alt birimler - recursive render */}
              {hasChildren && (
                <div style={{ marginTop: 6 }}>
                  {renderUnitTree(unit.id, level + 1, [...siblingMap, isLast])}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <Box sx={{ 
      width: '100%', 
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', 
      borderRadius: 4, 
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)', 
      p: { xs: 3, md: 4 }, 
      minWidth: 500, 
      maxWidth: 1200, 
      mx: 'auto', 
      mb: 6,
      border: '1px solid #e2e8f0'
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <h2 style={{ 
          fontWeight: 800, 
          fontSize: 28, 
          color: '#1e40af', 
          margin: 0,
          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          🏢 Organizasyon Yapısı
        </h2>
        <Button 
          variant="contained" 
          onClick={() => handleOpenAdd(undefined)} 
          sx={{ 
            fontWeight: 800, 
            borderRadius: 4, 
            minWidth: 180, 
            height: 48, 
            fontSize: 14,
            textTransform: 'none',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
          }}
        >
          + Ana Birim Ekle
        </Button>
      </Box>
      
      {/* Tree yapısı */}
      <div style={{ 
        background: '#ffffff', 
        borderRadius: 12, 
        padding: 24,
        border: '1px solid #e5e7eb',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        {renderUnitTree()}
      </div>

      {/* Birim ekleme/düzenleme diyaloğu */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: 20 }}>
          {editUnit ? 'Birim Düzenle' : 'Yeni Birim Ekle'}
        </DialogTitle>
        <DialogContent>
          <TextField 
            label="Birim Adı" 
            value={unitName} 
            onChange={e => setUnitName(e.target.value)} 
            fullWidth 
            autoFocus 
            sx={{ mt: 2, mb: 2 }}
            variant="outlined"
          />
          
          {/* Parent birim seçimi */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Üst Birim</InputLabel>
            <Select
              value={parentId || ''}
              onChange={(e) => setParentId(e.target.value || undefined)}
              label="Üst Birim"
            >
              <MenuItem value="">
                <em>Ana Birim (Üst birim yok)</em>
              </MenuItem>
              {units
                .filter(u => editUnit ? u.id !== editUnit.id : true) // Kendisini seçemesin
                .map(unit => (
                  <MenuItem key={unit.id} value={unit.id}>
                    {unit.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} sx={{ fontWeight: 600 }}>İptal</Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            sx={{ fontWeight: 700, minWidth: 100 }}
          >
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Birim silme diyaloğu */}
      <Dialog open={deleteDialog.open} onClose={handleDeleteCancel} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#dc2626' }}>Birim Sil</DialogTitle>
        <DialogContent>
          {deleteDialog.error ? (
            <Alert severity="error" sx={{ mt: 2 }}>{deleteDialog.error}</Alert>
          ) : (
            <p style={{ margin: '16px 0', fontSize: 16 }}>
              <strong>{deleteDialog.unit?.name}</strong> birimini silmek istediğinizden emin misiniz?
            </p>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleDeleteCancel} sx={{ fontWeight: 600 }}>İptal</Button>
          {!deleteDialog.error && (
            <Button 
              onClick={handleDeleteConfirm} 
              color="error" 
              variant="contained"
              sx={{ fontWeight: 700 }}
            >
              Sil
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UnitList;
