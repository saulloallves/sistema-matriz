import React, { useState } from 'react';
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
import { 
  Info, 
  Plug, 
  Settings, 
  MapPin, 
  Phone, 
  Car, 
  Clock 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { applyCnpjMask, removeCnpjMask, getCnpjValidationError } from '@/utils/cnpjUtils';
import toast from 'react-hot-toast';

interface UnidadeAddModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: () => void;
}

export const UnidadeAddModal: React.FC<UnidadeAddModalProps> = ({
  open,
  onClose,
  onAdd
}) => {
  const [formData, setFormData] = useState({
    group_code: '',
    group_name: '',
    store_model: '',
    store_phase: 'implantacao',
    store_imp_phase: '',
    ai_agent_id: '',
    notion_page_id: '',
    drive_folder_id: '',
    drive_folder_link: '',
    docs_folder_id: '',
    docs_folder_link: '',
    address: '',
    number_address: '',
    address_complement: '',
    neighborhood: '',
    city: '',
    state: '',
    uf: '',
    postal_code: '',
    phone: '',
    email: '',
    has_parking: false,
    parking_spots: 0,
    has_partner_parking: false,
    partner_parking_address: '',
    purchases_active: false,
    sales_active: false,
    cnpj: '',
    instagram_profile: '',
    operation_mon: '',
    operation_tue: '',
    operation_wed: '',
    operation_thu: '',
    operation_fri: '',
    operation_sat: '',
    operation_sun: '',
    operation_hol: ''
  });
  const [loading, setLoading] = useState(false);
  const [cnpjError, setCnpjError] = useState<string | null>(null);

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
        state: data.estado || '',
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
      
      // Se o campo for CNPJ, aplicar máscara e validar
      if (field === 'cnpj') {
        newData.cnpj = applyCnpjMask(value);
        const error = getCnpjValidationError(value);
        setCnpjError(error);
      }
      
      // Se mudar a fase da loja para "operacao", limpar a fase de implantação
      if (field === 'store_phase' && value !== 'implantacao') {
        newData.store_imp_phase = '';
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
    // Validar campos obrigatórios
    if (!formData.group_code || !formData.group_name || !formData.store_model) {
      toast.error('Código, Nome e Modelo da Loja são obrigatórios');
      return false;
    }

    // Validar CNPJ se preenchido
    if (formData.cnpj && cnpjError) {
      toast.error(cnpjError);
      return false;
    }

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
      // Mapear apenas os campos que existem na tabela unidades
      const insertData = {
        group_code: Number(formData.group_code),
        group_name: formData.group_name,
        store_model: formData.store_model,
        store_phase: formData.store_phase,
        store_imp_phase: formData.store_phase === 'implantacao' ? formData.store_imp_phase : null,
        address: formData.address || null,
        number_address: formData.number_address || null,
        address_complement: formData.address_complement || null,
        neighborhood: formData.neighborhood || null,
        city: formData.city || null,
        state: formData.state || null,
        uf: formData.uf || null,
        postal_code: formData.postal_code || null,
        phone: formData.phone || null,
        email: formData.email || null,
        has_parking: formData.has_parking,
        parking_spots: formData.parking_spots ? Number(formData.parking_spots) : null,
        has_partner_parking: formData.has_partner_parking,
        partner_parking_address: formData.has_partner_parking ? formData.partner_parking_address : null,
        purchases_active: formData.purchases_active,
        sales_active: formData.sales_active,
        cnpj: formData.cnpj ? removeCnpjMask(formData.cnpj) : null,
        instagram_profile: formData.instagram_profile || null,
        operation_mon: formData.operation_mon || null,
        operation_tue: formData.operation_tue || null,
        operation_wed: formData.operation_wed || null,
        operation_thu: formData.operation_thu || null,
        operation_fri: formData.operation_fri || null,
        operation_sat: formData.operation_sat || null,
        operation_sun: formData.operation_sun || null,
        operation_hol: formData.operation_hol || null,
        ai_agent_id: formData.ai_agent_id || null,
        notion_page_id: formData.notion_page_id || null,
        drive_folder_id: formData.drive_folder_id || null,
        drive_folder_link: formData.drive_folder_link || null,
        docs_folder_id: formData.docs_folder_id || null,
        docs_folder_link: formData.docs_folder_link || null
      };

      const { error } = await supabase
        .from('unidades')
        .insert([insertData]);

      if (error) throw error;

      toast.success('Unidade criada com sucesso!');
      onAdd();
      onClose();
      
      // Limpar o formulário
      setFormData({
        group_code: '',
        group_name: '',
        store_model: '',
        store_phase: 'implantacao',
        store_imp_phase: '',
        ai_agent_id: '',
        notion_page_id: '',
        drive_folder_id: '',
        drive_folder_link: '',
        docs_folder_id: '',
        docs_folder_link: '',
        address: '',
        number_address: '',
        address_complement: '',
        neighborhood: '',
        city: '',
        state: '',
        uf: '',
        postal_code: '',
        phone: '',
        email: '',
        has_parking: false,
        parking_spots: 0,
        has_partner_parking: false,
        partner_parking_address: '',
        purchases_active: false,
        sales_active: false,
        cnpj: '',
        instagram_profile: '',
        operation_mon: '',
        operation_tue: '',
        operation_wed: '',
        operation_thu: '',
        operation_fri: '',
        operation_sat: '',
        operation_sun: '',
        operation_hol: ''
      });
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      
      // Tratar erros específicos do banco
      if (error.message?.includes('duplicate key')) {
        toast.error('Erro: Já existe uma unidade com este código.');
      } else if (error.message?.includes('chk_partner_parking_address_when_flag')) {
        toast.error('Erro de validação: Se "Possui Estacionamento Parceiro" estiver marcado, é obrigatório informar o endereço. Se não estiver marcado, o endereço deve ficar vazio.');
      } else if (error.message?.includes('violates check constraint')) {
        toast.error('Erro de validação: Verifique se todos os campos obrigatórios estão preenchidos corretamente.');
      } else {
        toast.error('Erro ao criar unidade: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Adicionar Nova Unidade</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Info size={20} />
            <Typography variant="h6">Dados Básicos</Typography>
          </Box>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              required
              label="Código da Unidade"
              type="number"
              value={formData.group_code}
              onChange={(e) => handleInputChange('group_code', e.target.value)}
              helperText="Código numérico único da unidade"
            />
            <TextField
              fullWidth
              required
              label="Nome da Unidade"
              value={formData.group_name}
              onChange={(e) => handleInputChange('group_name', e.target.value)}
            />
          </Stack>
          
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <FormControl fullWidth required>
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
          </Stack>
          
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <FormControl fullWidth disabled={formData.store_phase !== 'implantacao'}>
              <InputLabel>Fase de Implantação</InputLabel>
              <Select
                value={formData.store_phase === 'implantacao' ? formData.store_imp_phase : ''}
                label="Fase de Implantação"
                onChange={(e) => handleInputChange('store_imp_phase', e.target.value)}
              >
                <MenuItem value="pre_abertura">Pré-abertura</MenuItem>
                <MenuItem value="implantacao">Implantação</MenuItem>
                <MenuItem value="pos_abertura">Pós-abertura</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="CNPJ"
              value={formData.cnpj}
              onChange={(e) => handleInputChange('cnpj', e.target.value)}
              error={!!cnpjError}
              helperText={cnpjError || 'Formato: 00.000.000/0000-00'}
              inputProps={{ maxLength: 18 }}
            />
          </Stack>

          <Divider />
          
          <Box display="flex" alignItems="center" gap={1}>
            <Plug size={20} />
            <Typography variant="h6">Integrações</Typography>
          </Box>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="AI Agent ID"
              value={formData.ai_agent_id}
              onChange={(e) => handleInputChange('ai_agent_id', e.target.value)}
            />
            <TextField
              fullWidth
              label="Notion Page ID"
              value={formData.notion_page_id}
              onChange={(e) => handleInputChange('notion_page_id', e.target.value)}
            />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Drive Folder ID"
              value={formData.drive_folder_id}
              onChange={(e) => handleInputChange('drive_folder_id', e.target.value)}
            />
            <TextField
              fullWidth
              label="Drive Folder Link"
              value={formData.drive_folder_link}
              onChange={(e) => handleInputChange('drive_folder_link', e.target.value)}
            />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Docs Folder ID"
              value={formData.docs_folder_id}
              onChange={(e) => handleInputChange('docs_folder_id', e.target.value)}
            />
            <TextField
              fullWidth
              label="Docs Folder Link"
              value={formData.docs_folder_link}
              onChange={(e) => handleInputChange('docs_folder_link', e.target.value)}
            />
          </Stack>

          <Divider />
          
          <Box display="flex" alignItems="center" gap={1}>
            <Settings size={20} />
            <Typography variant="h6">Status Operacional</Typography>
          </Box>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.purchases_active}
                  onChange={(e) => handleInputChange('purchases_active', e.target.checked)}
                />
              }
              label="Compras Ativas"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.sales_active}
                  onChange={(e) => handleInputChange('sales_active', e.target.checked)}
                />
              }
              label="Vendas Ativas"
            />
          </Stack>

          <Divider />
          
          <Box display="flex" alignItems="center" gap={1}>
            <MapPin size={20} />
            <Typography variant="h6">Endereço</Typography>
          </Box>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Endereço"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
            />
            <TextField
              fullWidth
              label="Número"
              value={formData.number_address}
              onChange={(e) => handleInputChange('number_address', e.target.value)}
            />
          </Stack>
          
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
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
            <TextField
              fullWidth
              label="UF"
              value={formData.uf}
              onChange={(e) => handleInputChange('uf', e.target.value)}
              inputProps={{ maxLength: 2 }}
            />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="CEP"
              value={formData.postal_code}
              onChange={(e) => handleInputChange('postal_code', e.target.value)}
              helperText="Digite o CEP para preencher automaticamente os campos de endereço"
            />
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
          </Stack>

          <Divider />
          
          <Box display="flex" alignItems="center" gap={1}>
            <Phone size={20} />
            <Typography variant="h6">Contato</Typography>
          </Box>
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
          
          <Box display="flex" alignItems="center" gap={1}>
            <Car size={20} />
            <Typography variant="h6">Estacionamento</Typography>
          </Box>
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

          <Divider />
          
          <Box display="flex" alignItems="center" gap={1}>
            <Clock size={20} />
            <Typography variant="h6">Horários de Funcionamento</Typography>
          </Box>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Segunda-feira"
              value={formData.operation_mon}
              onChange={(e) => handleInputChange('operation_mon', e.target.value)}
              placeholder="ex: 08:00 - 18:00"
            />
            <TextField
              fullWidth
              label="Terça-feira"
              value={formData.operation_tue}
              onChange={(e) => handleInputChange('operation_tue', e.target.value)}
              placeholder="ex: 08:00 - 18:00"
            />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Quarta-feira"
              value={formData.operation_wed}
              onChange={(e) => handleInputChange('operation_wed', e.target.value)}
              placeholder="ex: 08:00 - 18:00"
            />
            <TextField
              fullWidth
              label="Quinta-feira"
              value={formData.operation_thu}
              onChange={(e) => handleInputChange('operation_thu', e.target.value)}
              placeholder="ex: 08:00 - 18:00"
            />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Sexta-feira"
              value={formData.operation_fri}
              onChange={(e) => handleInputChange('operation_fri', e.target.value)}
              placeholder="ex: 08:00 - 18:00"
            />
            <TextField
              fullWidth
              label="Sábado"
              value={formData.operation_sat}
              onChange={(e) => handleInputChange('operation_sat', e.target.value)}
              placeholder="ex: 08:00 - 18:00"
            />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Domingo"
              value={formData.operation_sun}
              onChange={(e) => handleInputChange('operation_sun', e.target.value)}
              placeholder="ex: 08:00 - 18:00"
            />
            <TextField
              fullWidth
              label="Feriados"
              value={formData.operation_hol}
              onChange={(e) => handleInputChange('operation_hol', e.target.value)}
              placeholder="ex: 08:00 - 18:00"
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
          {loading ? 'Salvando...' : 'Adicionar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};