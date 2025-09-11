import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Switch,
  FormControlLabel,
  Typography,
  Divider,
  IconButton,
  Stack
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

interface UnidadeEditModalProps {
  open: boolean;
  onClose: () => void;
  unidade: any;
  onUpdate: () => void;
}

export const UnidadeEditModal: React.FC<UnidadeEditModalProps> = ({
  open,
  onClose,
  unidade,
  onUpdate
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    status: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    phone: '',
    email: '',
    manager: '',
    opening_hours: '',
    capacity: '',
    has_parking: false,
    has_wifi: false,
    has_accessibility: false,
    description: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (unidade) {
      setFormData({
        name: unidade.name || '',
        type: unidade.type || '',
        status: unidade.status || '',
        address: unidade.address || '',
        city: unidade.city || '',
        state: unidade.state || '',
        postal_code: unidade.postal_code || '',
        phone: unidade.phone || '',
        email: unidade.email || '',
        manager: unidade.manager || '',
        opening_hours: unidade.opening_hours || '',
        capacity: unidade.capacity?.toString() || '',
        has_parking: unidade.has_parking || false,
        has_wifi: unidade.has_wifi || false,
        has_accessibility: unidade.has_accessibility || false,
        description: unidade.description || ''
      });
    }
  }, [unidade]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updateData = {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : null
      };

      const { error } = await supabase
        .from('unidades')
        .update(updateData)
        .eq('id', unidade.id);

      if (error) throw error;

      toast.success('Unidade atualizada com sucesso!');
      onUpdate();
      onClose();
    } catch (error: any) {
      toast.error('Erro ao atualizar unidade: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Editar Unidade</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <Typography variant="h6">Dados Básicos</Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Nome"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
            <TextField
              fullWidth
              label="Tipo"
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
            />
          </Stack>
          
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Status"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
            />
            <TextField
              fullWidth
              label="Gerente"
              value={formData.manager}
              onChange={(e) => handleInputChange('manager', e.target.value)}
            />
          </Stack>

          <TextField
            fullWidth
            label="Descrição"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
          />

          <Divider />
          
          <Typography variant="h6">Endereço</Typography>
          <TextField
            fullWidth
            label="Endereço"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
          />
          
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Cidade"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
            />
            <TextField
              fullWidth
              label="Estado"
              value={formData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
            />
            <TextField
              fullWidth
              label="CEP"
              value={formData.postal_code}
              onChange={(e) => handleInputChange('postal_code', e.target.value)}
            />
          </Stack>

          <Divider />
          
          <Typography variant="h6">Contato</Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Telefone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </Stack>

          <Divider />
          
          <Typography variant="h6">Operações</Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Horário de Funcionamento"
              value={formData.opening_hours}
              onChange={(e) => handleInputChange('opening_hours', e.target.value)}
            />
            <TextField
              fullWidth
              label="Capacidade"
              type="number"
              value={formData.capacity}
              onChange={(e) => handleInputChange('capacity', e.target.value)}
            />
          </Stack>

          <Typography variant="subtitle1">Facilidades</Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.has_parking}
                  onChange={(e) => handleInputChange('has_parking', e.target.checked)}
                />
              }
              label="Estacionamento"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.has_wifi}
                  onChange={(e) => handleInputChange('has_wifi', e.target.checked)}
                />
              }
              label="Wi-Fi"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.has_accessibility}
                  onChange={(e) => handleInputChange('has_accessibility', e.target.checked)}
                />
              }
              label="Acessibilidade"
            />
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={loading}
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};