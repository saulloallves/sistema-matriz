import React, { useState, useEffect, useCallback } from 'react';
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
  InputLabel,
  InputAdornment,
  CircularProgress,
  Alert
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { 
  Info, 
  Plug, 
  Settings, 
  MapPin, 
  Phone, 
  Car, 
  Clock,
  Instagram,
  Eye,
  EyeOff,
  RefreshCw,
  Search
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { applyCnpjMask, removeCnpjMask, getCnpjValidationError } from '@/utils/cnpjUtils';
import toast from 'react-hot-toast';
import { generateSystemPassword } from '@/utils/passwordGenerator';
import { useFranqueadosUnidades } from '@/hooks/useFranqueadosUnidades';

interface UnidadeEditModalProps {
  open: boolean;
  onClose: () => void;
  unidade: any;
  onUpdate: (id: string, data: any) => Promise<void>;
}

export const UnidadeEditModal: React.FC<UnidadeEditModalProps> = ({
  open,
  onClose,
  unidade,
  onUpdate
}) => {
  const [formData, setFormData] = useState({
    group_code: '',
    group_name: '',
    store_model: '',
    store_phase: '',
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
    operation_hol: '',
    user_instagram: '',
    id_unidade: '',
    password_instagram: '',
    bearer: ''
  });
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [cnpjError, setCnpjError] = useState<string | null>(null);
  const [groupCodeLoading, setGroupCodeLoading] = useState(false);
  const [groupCodeError, setGroupCodeError] = useState<string | null>(null);
  const [groupCodeValid, setGroupCodeValid] = useState<boolean | null>(null);
  const [showInstagramPassword, setShowInstagramPassword] = useState(false);
  const [showBearerToken, setShowBearerToken] = useState(false);

  useEffect(() => {
    if (unidade && unidade.id) {
      setFormData({
        group_code: unidade.group_code?.toString() || '',
        group_name: unidade.group_name || '',
        store_model: unidade.store_model || '',
        store_phase: unidade.store_phase || '',
        store_imp_phase: unidade.store_imp_phase || '',
        ai_agent_id: unidade.ai_agent_id || '',
        notion_page_id: unidade.notion_page_id || '',
        drive_folder_id: unidade.drive_folder_id || '',
        drive_folder_link: unidade.drive_folder_link || '',
        docs_folder_id: unidade.docs_folder_id || '',
        docs_folder_link: unidade.docs_folder_link || '',
        address: unidade.address || '',
        number_address: unidade.number_address || '',
        address_complement: unidade.address_complement || '',
        neighborhood: unidade.neighborhood || '',
        city: unidade.city || '',
        state: unidade.state || '',
        uf: unidade.uf || '',
        postal_code: unidade.postal_code || '',
        phone: unidade.phone || '',
        email: unidade.email || '',
        has_parking: unidade.has_parking || false,
        parking_spots: unidade.parking_spots || 0,
        has_partner_parking: unidade.has_partner_parking || false,
        partner_parking_address: unidade.partner_parking_address || '',
        purchases_active: unidade.purchases_active || false,
        sales_active: unidade.sales_active || false,
        cnpj: unidade.cnpj ? applyCnpjMask(unidade.cnpj) : '',
        instagram_profile: unidade.instagram_profile || '',
        operation_mon: unidade.operation_mon || '',
        operation_tue: unidade.operation_tue || '',
        operation_wed: unidade.operation_wed || '',
        operation_thu: unidade.operation_thu || '',
        operation_fri: unidade.operation_fri || '',
        operation_sat: unidade.operation_sat || '',
        operation_sun: unidade.operation_sun || '',
        operation_hol: unidade.operation_hol || '',
        user_instagram: (unidade as any).user_instagram || '',
        id_unidade: (unidade as any).id_unidade || '',
        password_instagram: (unidade as any).password_instagram || '',
        bearer: (unidade as any).bearer || ''
      });
      setGroupCodeLoading(false);
      setGroupCodeError(null);
      setGroupCodeValid(null);
    }
  }, [unidade]);

  const fetchAddressByCEP = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, '');
    if (cleanCEP.length !== 8) {
      toast.error('CEP deve ter 8 dígitos.');
      return;
    }

    setCepLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cep-lookup', {
        method: 'POST',
        body: { cep: cleanCEP },
      });

      if (error) throw error;

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
    } catch (error: any) {
      console.error('Erro ao buscar CEP:', error);
      toast.error('Erro ao buscar informações do CEP: ' + error.message);
    } finally {
      setCepLoading(false);
    }
  };

  const checkGroupCodeExists = async (code: string) => {
    try {
      const numericCode = Number(code);
      
      const { data, error } = await supabase
        .from('unidades')
        .select('id, group_name')
        .eq('group_code', numericCode)
        .neq('id', unidade?.id || '');

      if (error) {
        console.error('Erro ao verificar código:', error);
        return { exists: false, unitName: null };
      }

      return {
        exists: data && data.length > 0,
        unitName: data && data.length > 0 ? data[0].group_name : null
      };
    } catch (error) {
      console.error('Erro ao verificar código:', error);
      return { exists: false, unitName: null };
    }
  };

  useEffect(() => {
    if (!unidade?.id) return;
    
    const validateGroupCode = async () => {
      const code = formData.group_code.trim();
      
      if (!code) {
        setGroupCodeLoading(false);
        setGroupCodeError(null);
        setGroupCodeValid(null);
        return;
      }

      if (code.length !== 4 || !/^\d{4}$/.test(code)) {
        setGroupCodeLoading(false);
        setGroupCodeError('O código deve ter exatamente 4 dígitos numéricos');
        setGroupCodeValid(false);
        return;
      }

      if (Number(code) === unidade?.group_code) {
        setGroupCodeLoading(false);
        setGroupCodeError(null);
        setGroupCodeValid(null);
        return;
      }

      setGroupCodeLoading(true);
      setGroupCodeError(null);
      setGroupCodeValid(null);

      const result = await checkGroupCodeExists(code);
      
      setGroupCodeLoading(false);
      
      if (result.exists) {
        setGroupCodeError(`Código já utilizado pela Unidade ${result.unitName}`);
        setGroupCodeValid(false);
      } else {
        setGroupCodeError(null);
        setGroupCodeValid(true);
      }
    };

    const timeoutId = setTimeout(validateGroupCode, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.group_code, unidade?.group_code, unidade?.id]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      if (field === 'has_partner_parking' && !value) {
        newData.partner_parking_address = '';
      }
      
      if (field === 'cnpj') {
        newData.cnpj = applyCnpjMask(value);
        const error = getCnpjValidationError(value);
        setCnpjError(error);
      }

      if (field === 'group_code') {
        const numericValue = value.replace(/\D/g, '').slice(0, 4);
        newData.group_code = numericValue;
      }
      
      return newData;
    });
  };

  const validateForm = () => {
    if (groupCodeError || groupCodeLoading) {
      if (groupCodeError) toast.error(groupCodeError);
      return false;
    }

    const currentCode = formData.group_code.trim();
    if (currentCode && currentCode !== unidade?.group_code?.toString()) {
      if (!groupCodeValid) {
        toast.error('Aguarde a validação do código da unidade ou corrija o erro');
        return false;
      }
    }

    if (formData.cnpj && cnpjError) {
      toast.error(cnpjError);
      return false;
    }
    
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
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        group_code: formData.group_code ? Number(formData.group_code) : unidade?.group_code,
        group_name: formData.group_name,
        store_model: formData.store_model,
        store_phase: formData.store_phase,
        store_imp_phase: formData.store_imp_phase,
        address: formData.address,
        number_address: formData.number_address,
        address_complement: formData.address_complement,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        uf: formData.uf,
        postal_code: formData.postal_code,
        phone: formData.phone,
        email: formData.email,
        has_parking: formData.has_parking,
        parking_spots: formData.parking_spots ? Number(formData.parking_spots) : null,
        has_partner_parking: formData.has_partner_parking,
        partner_parking_address: formData.has_partner_parking ? formData.partner_parking_address : null,
        purchases_active: formData.purchases_active,
        sales_active: formData.sales_active,
        cnpj: formData.cnpj ? removeCnpjMask(formData.cnpj) : null,
        instagram_profile: formData.instagram_profile,
        operation_mon: formData.operation_mon,
        operation_tue: formData.operation_tue,
        operation_wed: formData.operation_wed,
        operation_thu: formData.operation_thu,
        operation_fri: formData.operation_fri,
        operation_sat: formData.operation_sat,
        operation_sun: formData.operation_sun,
        operation_hol: formData.operation_hol,
        ai_agent_id: formData.ai_agent_id,
        notion_page_id: formData.notion_page_id,
        drive_folder_id: formData.drive_folder_id,
        drive_folder_link: formData.drive_folder_link,
        docs_folder_id: formData.docs_folder_id,
        docs_folder_link: formData.docs_folder_link,
        user_instagram: formData.user_instagram || null,
        id_unidade: formData.id_unidade || null,
        password_instagram: formData.password_instagram || null,
        bearer: formData.bearer || null
      };

      await onUpdate(unidade.id, updateData);
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setLoading(false);
    }
  };

  if (!unidade) {
    return null;
  }

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
          <Box display="flex" alignItems="center" gap={1}>
            <Info size={20} />
            <Typography variant="h6">Dados Básicos</Typography>
          </Box>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Código da Unidade"
              value={formData.group_code}
              onChange={(e) => handleInputChange('group_code', e.target.value)}
              error={!!groupCodeError}
              helperText={
                groupCodeLoading 
                  ? 'Verificando disponibilidade...' 
                  : groupCodeError 
                    ? groupCodeError 
                    : groupCodeValid 
                      ? 'Código disponível ✓' 
                      : 'Digite um código de 4 dígitos'
              }
              inputProps={{ 
                maxLength: 4,
                pattern: '[0-9]*'
              }}
              sx={{
                '& .MuiFormHelperText-root': {
                  color: groupCodeLoading 
                    ? 'info.main' 
                    : groupCodeError 
                      ? 'error.main' 
                      : groupCodeValid 
                        ? 'success.main' 
                        : 'text.secondary'
                }
              }}
            />
            <TextField
              fullWidth
              label="Nome da Unidade"
              value={formData.group_name}
              onChange={(e) => handleInputChange('group_name', e.target.value)}
            />
          </Stack>
          
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
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
                <MenuItem value="mega store">Mega Store</MenuItem>
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
            <FormControl fullWidth>
              <InputLabel>Fase de Implantação</InputLabel>
              <Select
                value={formData.store_imp_phase}
                label="Fase de Implantação"
                onChange={(e) => handleInputChange('store_imp_phase', e.target.value)}
              >
                <MenuItem value="integracao">Integração</MenuItem>
                <MenuItem value="treinamento">Treinamento</MenuItem>
                <MenuItem value="procura_ponto">Procura de Ponto</MenuItem>
                <MenuItem value="estruturacao">Estruturação</MenuItem>
                <MenuItem value="compras">Compras</MenuItem>
                <MenuItem value="inauguracao">Inauguração</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          
          <TextField
            fullWidth
            label="CNPJ"
            value={formData.cnpj}
            onChange={(e) => handleInputChange('cnpj', e.target.value)}
            error={!!cnpjError}
            helperText={cnpjError || 'Formato: 00.000.000/0000-00'}
            inputProps={{ maxLength: 18 }}
          />

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
              helperText="Digite 8 números e clique na lupa"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => fetchAddressByCEP(formData.postal_code)}
                      edge="end"
                      disabled={cepLoading}
                    >
                      {cepLoading ? <CircularProgress size={20} /> : <Search size={20} />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
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
              label="E-mail"
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
            <Instagram size={20} />
            <Typography variant="h6">Moderação Instagram</Typography>
          </Box>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Usuário Instagram"
              value={formData.user_instagram}
              onChange={(e) => handleInputChange('user_instagram', e.target.value)}
              placeholder="@usuario_instagram"
              helperText="Usuário para moderação (opcional)"
            />
            <TextField
              fullWidth
              label="ID da Unidade"
              value={formData.id_unidade}
              onChange={(e) => handleInputChange('id_unidade', e.target.value)}
              helperText="Identificador da unidade no sistema"
            />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              type={showInstagramPassword ? "text" : "password"}
              label="Senha Instagram"
              value={formData.password_instagram}
              onChange={(e) => handleInputChange('password_instagram', e.target.value)}
              helperText="Senha para acesso ao Instagram"
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowInstagramPassword(!showInstagramPassword)}
                    edge="end"
                    size="small"
                  >
                    {showInstagramPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </IconButton>
                )
              }}
            />
            <TextField
              fullWidth
              type={showBearerToken ? "text" : "password"}
              label="Bearer Token"
              value={formData.bearer}
              onChange={(e) => handleInputChange('bearer', e.target.value)}
              helperText="Token de autenticação para APIs"
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowBearerToken(!showBearerToken)}
                    edge="end"
                    size="small"
                  >
                    {showBearerToken ? <EyeOff size={20} /> : <Eye size={20} />}
                  </IconButton>
                )
              }}
            />
          </Stack>

          <Divider />
          
          <Box display="flex" alignItems="center" gap={1}>
            <Car size={20} />
            <Typography variant="h6">Estacionamento</Typography>
          </Box>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
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
          
          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.has_partner_parking}
                  onChange={(e) => handleInputChange('has_partner_parking', e.target.checked)}
                />
              }
              label="Possui Estacionamento Parceiro"
            />
            {formData.has_partner_parking && (
              <TextField
                fullWidth
                label="Endereço do Estacionamento Parceiro"
                value={formData.partner_parking_address}
                onChange={(e) => handleInputChange('partner_parking_address', e.target.value)}
                required
              />
            )}
          </Stack>

          <Divider />
          
          <Box display="flex" alignItems="center" gap={1}>
            <Clock size={20} />
            <Typography variant="h6">Horário de Funcionamento</Typography>
          </Box>
          <Stack spacing={2}>
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
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={loading || groupCodeLoading || !!groupCodeError}
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};