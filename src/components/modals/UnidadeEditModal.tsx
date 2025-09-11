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
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel
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
    group_name: '',
    store_model: '',
    store_phase: '',
    address: '',
    number_address: '',
    address_complement: '',
    neighborhood: '',
    city: '',
    uf: '',
    postal_code: '',
    phone: '',
    email: '',
    has_parking: false,
    parking_spots: 0,
    has_partner_parking: false,
    partner_parking_address: '',
    cnpj: '',
    instagram_profile: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (unidade) {
      setFormData({
        group_name: unidade.group_name || '',
        store_model: unidade.store_model || '',
        store_phase: unidade.store_phase || '',
        address: unidade.address || '',
        number_address: unidade.number_address || '',
        address_complement: unidade.address_complement || '',
        neighborhood: unidade.neighborhood || '',
        city: unidade.city || '',
        uf: unidade.uf || '',
        postal_code: unidade.postal_code || '',
        phone: unidade.phone || '',
        email: unidade.email || '',
        has_parking: unidade.has_parking || false,
        parking_spots: unidade.parking_spots || 0,
        has_partner_parking: unidade.has_partner_parking || false,
        partner_parking_address: unidade.partner_parking_address || '',
        cnpj: unidade.cnpj || '',
        instagram_profile: unidade.instagram_profile || ''
      });
    }
  }, [unidade]);

  const fetchAddressByCEP = async (cep: string) => {
    try {
      const cleanCEP = cep.replace(/\D/g, '');
      if (cleanCEP.length !== 8) return;

      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast.error('CEP não encontrado');
        return;
      }

      setFormData(prev => ({
        ...prev,
        address: data.logradouro || '',
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        uf: data.uf || ''
      }));

      toast.success('Endereço preenchido automaticamente');
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      toast.error('Erro ao buscar informações do CEP');
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Se desmarcar "has_partner_parking", limpar o endereço do estacionamento parceiro
      if (field === 'has_partner_parking' && !value) {
        newData.partner_parking_address = '';
      }
      
      return newData;
    });

    // Se o campo for CEP e tiver 8 dígitos, buscar endereço
    if (field === 'postal_code') {
      const cleanCEP = value.replace(/\D/g, '');
      if (cleanCEP.length === 8) {
        fetchAddressByCEP(cleanCEP);
      }
    }
  };

  const validateForm = () => {
    // Validar constraint do estacionamento parceiro
    if (formData.has_partner_parking && !formData.partner_parking_address?.trim()) {
      toast.error('Quando "Possui Estacionamento Parceiro" está marcado, é obrigatório informar o endereço do estacionamento parceiro.');
      return false;
    }
    
    if (!formData.has_partner_parking && formData.partner_parking_address?.trim()) {
      toast.error('Quando "Possui Estacionamento Parceiro" não está marcado, o endereço do estacionamento parceiro deve ficar vazio.');
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    // Validar antes de enviar
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        ...formData,
        parking_spots: formData.parking_spots ? Number(formData.parking_spots) : null,
        // Garantir que partner_parking_address seja null se has_partner_parking for false
        partner_parking_address: formData.has_partner_parking ? formData.partner_parking_address : null
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
      console.error('Erro ao salvar:', error);
      
      // Tratar erros específicos do banco
      if (error.message?.includes('chk_partner_parking_address_when_flag')) {
        toast.error('Erro de validação: Se "Possui Estacionamento Parceiro" estiver marcado, é obrigatório informar o endereço. Se não estiver marcado, o endereço deve ficar vazio.');
      } else if (error.message?.includes('violates check constraint')) {
        toast.error('Erro de validação: Verifique se todos os campos obrigatórios estão preenchidos corretamente.');
      } else {
        toast.error('Erro ao atualizar unidade: ' + error.message);
      }
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
              label="Nome da Unidade"
              value={formData.group_name}
              onChange={(e) => handleInputChange('group_name', e.target.value)}
            />
            <FormControl fullWidth>
              <InputLabel>Modelo da Loja</InputLabel>
              <Select
                value={formData.store_model}
                label="Modelo da Loja"
                onChange={(e) => handleInputChange('store_model', e.target.value)}
              >
                <MenuItem value="junior">Junior</MenuItem>
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="padrao">Padrão</MenuItem>
                <MenuItem value="intermediaria">Intermediária</MenuItem>
                <MenuItem value="mega_store">Mega Store</MenuItem>
                <MenuItem value="pontinha">Pontinha</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Fase da Loja</InputLabel>
              <Select
                value={formData.store_phase}
                label="Fase da Loja"
                onChange={(e) => handleInputChange('store_phase', e.target.value)}
              >
                <MenuItem value="implantacao">Implantação</MenuItem>
                <MenuItem value="operacao">Operação</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="CNPJ"
              value={formData.cnpj}
              onChange={(e) => handleInputChange('cnpj', e.target.value)}
            />
          </Stack>

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
              label="Número"
              value={formData.number_address}
              onChange={(e) => handleInputChange('number_address', e.target.value)}
            />
            <TextField
              fullWidth
              label="Complemento"
              value={formData.address_complement}
              onChange={(e) => handleInputChange('address_complement', e.target.value)}
            />
            <TextField
              fullWidth
              label="Bairro"
              value={formData.neighborhood}
              onChange={(e) => handleInputChange('neighborhood', e.target.value)}
            />
          </Stack>
          
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Cidade"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
            />
            <TextField
              fullWidth
              label="UF"
              value={formData.uf}
              onChange={(e) => handleInputChange('uf', e.target.value)}
              inputProps={{ maxLength: 2 }}
            />
            <TextField
              fullWidth
              label="CEP"
              value={formData.postal_code}
              onChange={(e) => handleInputChange('postal_code', e.target.value)}
              helperText="Digite o CEP para preencher automaticamente os campos de endereço"
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

          <TextField
            fullWidth
            label="Instagram"
            value={formData.instagram_profile}
            onChange={(e) => handleInputChange('instagram_profile', e.target.value)}
          />

          <Divider />
          
          <Typography variant="h6">Estacionamento</Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.has_parking}
                  onChange={(e) => handleInputChange('has_parking', e.target.checked)}
                />
              }
              label="Possui Estacionamento"
            />
            {formData.has_parking && (
              <TextField
                fullWidth
                label="Número de Vagas"
                type="number"
                value={formData.parking_spots}
                onChange={(e) => handleInputChange('parking_spots', e.target.value)}
              />
            )}
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.has_partner_parking}
                  onChange={(e) => handleInputChange('has_partner_parking', e.target.checked)}
                />
              }
              label="Possui Estacionamento Parceiro"
            />
          </Stack>

          {formData.has_partner_parking && (
            <TextField
              fullWidth
              required
              label="Endereço do Estacionamento Parceiro"
              value={formData.partner_parking_address}
              onChange={(e) => handleInputChange('partner_parking_address', e.target.value)}
              helperText="Campo obrigatório quando 'Possui Estacionamento Parceiro' estiver marcado"
              error={formData.has_partner_parking && !formData.partner_parking_address?.trim()}
            />
          )}
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