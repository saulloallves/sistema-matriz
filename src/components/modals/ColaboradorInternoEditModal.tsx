import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  InputAdornment,
  IconButton,
  CircularProgress
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Save, User, Eye, EyeOff } from 'lucide-react';
import { ColaboradorInterno } from '@/hooks/useColaboradoresInterno';
import { formatCPF, formatPhone, formatCEP, removeMask } from '@/utils/formatters';
import toast from 'react-hot-toast';

interface ColaboradorInternoEditModalProps {
  open: boolean;
  onClose: () => void;
  colaborador: ColaboradorInterno | null;
  onUpdate: (id: string, data: Partial<ColaboradorInterno>) => void;
}

const colaboradorSchema = z.object({
  employee_name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  cpf: z.string().min(11, 'CPF inválido'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(14, 'Telefone inválido'),
  birth_date: z.string().min(1, 'Data de nascimento é obrigatória'),
  position_name: z.string().min(2, 'Cargo deve ter no mínimo 2 caracteres'),
  admission_date: z.string().min(1, 'Data de admissão é obrigatória'),
  salary: z.string().min(1, 'Salário obrigatório'),
  web_password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  instagram_profile: z.string().optional(),
  address: z.string().optional(),
  number_address: z.string().optional(),
  address_complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  uf: z.string().optional(),
  postal_code: z.string().optional(),
  meal_voucher_active: z.boolean(),
  meal_voucher_value: z.string().optional(),
  transport_voucher_active: z.boolean(),
  transport_voucher_value: z.string().optional(),
  health_plan: z.boolean(),
  basic_food_basket_active: z.boolean(),
  basic_food_basket_value: z.string().optional(),
  cost_assistance_active: z.boolean(),
  cost_assistance_value: z.string().optional(),
  cash_access: z.boolean(),
  evaluation_access: z.boolean(),
  training: z.boolean(),
  support: z.boolean(),
  lgpd_term: z.boolean(),
  confidentiality_term: z.boolean(),
  system_term: z.boolean(),
});

type ColaboradorFormData = z.infer<typeof colaboradorSchema>;

// Função para formatar data do banco (YYYY-MM-DD) para o input type="date"
const formatDateForInput = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '';
  // Se já está no formato correto (YYYY-MM-DD), retorna direto
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  // Caso contrário, converte
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function ColaboradorInternoEditModal({
  open,
  onClose,
  colaborador,
  onUpdate
}: ColaboradorInternoEditModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [searchingCEP, setSearchingCEP] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ColaboradorFormData>({
    resolver: zodResolver(colaboradorSchema),
    defaultValues: {
      employee_name: '',
      position_name: '',
      cpf: '',
      email: '',
      phone: '',
      birth_date: '',
      admission_date: '',
      salary: '',
      web_password: '',
      instagram_profile: '',
      address: '',
      number_address: '',
      address_complement: '',
      neighborhood: '',
      city: '',
      state: '',
      uf: '',
      postal_code: '',
      meal_voucher_active: false,
      meal_voucher_value: '',
      transport_voucher_active: false,
      transport_voucher_value: '',
      health_plan: false,
      basic_food_basket_active: false,
      basic_food_basket_value: '',
      cost_assistance_active: false,
      cost_assistance_value: '',
      cash_access: false,
      evaluation_access: false,
      training: false,
      support: false,
      lgpd_term: false,
      confidentiality_term: false,
      system_term: false,
    }
  });

  const meal_voucher_active = watch('meal_voucher_active');
  const transport_voucher_active = watch('transport_voucher_active');
  const basic_food_basket_active = watch('basic_food_basket_active');
  const cost_assistance_active = watch('cost_assistance_active');
  const postal_code = watch('postal_code');

  // Buscar endereço pelo CEP
  const fetchAddressByCep = useCallback(async (cep: string) => {
    if (!cep || cep.length !== 8) return;

    try {
      setSearchingCEP(true);
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast.error('CEP não encontrado');
        return;
      }

      setValue('address', data.logradouro || '');
      setValue('neighborhood', data.bairro || '');
      setValue('city', data.localidade || '');
      setValue('state', data.localidade || '');
      setValue('uf', data.uf || '');

      toast.success('Endereço preenchido automaticamente!');
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      toast.error('Erro ao buscar informações do CEP');
    } finally {
      setSearchingCEP(false);
    }
  }, [setValue]);

  // Debounce CEP lookup
  useEffect(() => {
    if (postal_code && postal_code.length === 8) {
      const timer = setTimeout(() => {
        fetchAddressByCep(postal_code);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [postal_code, fetchAddressByCep]);

  useEffect(() => {
    if (colaborador && open) {
      reset({
        employee_name: colaborador.employee_name || '',
        position_name: colaborador.position_name || '',
        cpf: colaborador.cpf || '',
        email: colaborador.email || '',
        phone: colaborador.phone || '',
        birth_date: formatDateForInput(colaborador.birth_date),
        admission_date: formatDateForInput(colaborador.admission_date),
        salary: colaborador.salary || '',
        web_password: colaborador.web_password || '',
        instagram_profile: colaborador.instagram_profile || '',
        address: colaborador.address || '',
        number_address: colaborador.number_address || '',
        address_complement: colaborador.address_complement || '',
        neighborhood: colaborador.neighborhood || '',
        city: colaborador.city || '',
        state: colaborador.state || '',
        uf: colaborador.uf || '',
        postal_code: colaborador.postal_code || '',
        meal_voucher_active: colaborador.meal_voucher_active || false,
        meal_voucher_value: colaborador.meal_voucher_value || '',
        transport_voucher_active: colaborador.transport_voucher_active || false,
        transport_voucher_value: colaborador.transport_voucher_value || '',
        health_plan: colaborador.health_plan || false,
        basic_food_basket_active: colaborador.basic_food_basket_active || false,
        basic_food_basket_value: colaborador.basic_food_basket_value || '',
        cost_assistance_active: colaborador.cost_assistance_active || false,
        cost_assistance_value: colaborador.cost_assistance_value || '',
        cash_access: colaborador.cash_access || false,
        evaluation_access: colaborador.evaluation_access || false,
        training: colaborador.training || false,
        support: colaborador.support || false,
        lgpd_term: colaborador.lgpd_term || false,
        confidentiality_term: colaborador.confidentiality_term || false,
        system_term: colaborador.system_term || false,
      });
    }
  }, [colaborador, open, reset]);

  const onSubmit = (data: ColaboradorFormData) => {
    if (!colaborador) return;

    onUpdate(colaborador.id, {
      employee_name: data.employee_name,
      position_name: data.position_name,
      cpf: removeMask(data.cpf),
      email: data.email,
      phone: removeMask(data.phone),
      birth_date: data.birth_date,
      admission_date: data.admission_date,
      salary: data.salary,
      web_password: data.web_password,
      instagram_profile: data.instagram_profile || null,
      address: data.address || null,
      number_address: data.number_address || null,
      address_complement: data.address_complement || null,
      neighborhood: data.neighborhood || null,
      city: data.city || null,
      state: data.state || null,
      uf: data.uf || null,
      postal_code: data.postal_code ? removeMask(data.postal_code) : null,
      meal_voucher_active: data.meal_voucher_active,
      meal_voucher_value: data.meal_voucher_active ? data.meal_voucher_value : null,
      transport_voucher_active: data.transport_voucher_active,
      transport_voucher_value: data.transport_voucher_active ? data.transport_voucher_value : null,
      health_plan: data.health_plan,
      basic_food_basket_active: data.basic_food_basket_active,
      basic_food_basket_value: data.basic_food_basket_active ? data.basic_food_basket_value : null,
      cost_assistance_active: data.cost_assistance_active,
      cost_assistance_value: data.cost_assistance_active ? data.cost_assistance_value : null,
      cash_access: data.cash_access,
      evaluation_access: data.evaluation_access,
      training: data.training,
      support: data.support,
      lgpd_term: data.lgpd_term,
      confidentiality_term: data.confidentiality_term,
      system_term: data.system_term,
    });

    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: 1,
        borderColor: 'divider',
        pb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <User size={24} />
          <Typography variant="h6">
            Editar Colaborador Interno: {colaborador?.employee_name}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Dados Pessoais */}
            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                Dados Pessoais
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Controller
                  name="employee_name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nome Completo"
                      fullWidth
                      required
                      error={!!errors.employee_name}
                      helperText={errors.employee_name?.message}
                    />
                  )}
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Controller
                    name="cpf"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="CPF"
                        sx={{ flex: 1 }}
                        required
                        value={formatCPF(field.value)}
                        onChange={(e) => field.onChange(e.target.value)}
                        error={!!errors.cpf}
                        helperText={errors.cpf?.message}
                      />
                    )}
                  />

                  <Controller
                    name="birth_date"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Data de Nascimento"
                        type="date"
                        sx={{ flex: 1 }}
                        required
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.birth_date}
                        helperText={errors.birth_date?.message}
                      />
                    )}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Email"
                        type="email"
                        sx={{ flex: 1 }}
                        required
                        error={!!errors.email}
                        helperText={errors.email?.message}
                      />
                    )}
                  />

                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Telefone"
                        sx={{ flex: 1 }}
                        required
                        value={formatPhone(field.value)}
                        onChange={(e) => field.onChange(e.target.value)}
                        placeholder="(00) 00000-0000"
                        error={!!errors.phone}
                        helperText={errors.phone?.message}
                      />
                    )}
                  />
                </Box>

                <Controller
                  name="instagram_profile"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Perfil do Instagram"
                      placeholder="@usuario"
                      error={!!errors.instagram_profile}
                      helperText={errors.instagram_profile?.message}
                    />
                  )}
                />
              </Box>
            </Box>

            {/* Dados Profissionais */}
            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                Dados Profissionais
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Controller
                    name="position_name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Cargo"
                        sx={{ flex: 1 }}
                        required
                        placeholder="Ex: Gerente de RH, Analista de TI, etc."
                        error={!!errors.position_name}
                        helperText={errors.position_name?.message}
                      />
                    )}
                  />

                  <Controller
                    name="admission_date"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Data de Admissão"
                        type="date"
                        sx={{ flex: 1 }}
                        required
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.admission_date}
                        helperText={errors.admission_date?.message}
                      />
                    )}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Controller
                    name="salary"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Salário"
                        sx={{ flex: 1 }}
                        required
                        placeholder="R$ 0,00"
                        error={!!errors.salary}
                        helperText={errors.salary?.message}
                      />
                    )}
                  />

                  <Controller
                    name="web_password"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Senha Web"
                        type={showPassword ? 'text' : 'password'}
                        sx={{ flex: 1 }}
                        required
                        error={!!errors.web_password}
                        helperText={errors.web_password?.message}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                              >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Box>
              </Box>
            </Box>

            {/* Endereço */}
            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                Endereço
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Controller
                  name="postal_code"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="CEP"
                      placeholder="00000-000"
                      value={formatCEP(field.value || '')}
                      onChange={(e) => field.onChange(e.target.value)}
                      error={!!errors.postal_code}
                      helperText={errors.postal_code?.message}
                      InputProps={{
                        endAdornment: searchingCEP ? (
                          <InputAdornment position="end">
                            <CircularProgress size={20} />
                          </InputAdornment>
                        ) : null,
                      }}
                    />
                  )}
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Controller
                    name="address"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Logradouro"
                        sx={{ flex: 2 }}
                        error={!!errors.address}
                        helperText={errors.address?.message}
                      />
                    )}
                  />

                  <Controller
                    name="number_address"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Número"
                        sx={{ flex: 1 }}
                        error={!!errors.number_address}
                        helperText={errors.number_address?.message}
                      />
                    )}
                  />
                </Box>

                <Controller
                  name="address_complement"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Complemento"
                      error={!!errors.address_complement}
                      helperText={errors.address_complement?.message}
                    />
                  )}
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Controller
                    name="neighborhood"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Bairro"
                        sx={{ flex: 1 }}
                        error={!!errors.neighborhood}
                        helperText={errors.neighborhood?.message}
                      />
                    )}
                  />

                  <Controller
                    name="city"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Cidade"
                        sx={{ flex: 1 }}
                        error={!!errors.city}
                        helperText={errors.city?.message}
                      />
                    )}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Controller
                    name="state"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Estado"
                        sx={{ flex: 1 }}
                        error={!!errors.state}
                        helperText={errors.state?.message}
                      />
                    )}
                  />

                  <Controller
                    name="uf"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="UF"
                        sx={{ flex: 1 }}
                        inputProps={{ maxLength: 2 }}
                        error={!!errors.uf}
                        helperText={errors.uf?.message}
                      />
                    )}
                  />
                </Box>
              </Box>
            </Box>

            {/* Benefícios */}
            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                Benefícios
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Controller
                      name="meal_voucher_active"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={<Switch {...field} checked={field.value} />}
                          label="Vale Refeição"
                        />
                      )}
                    />
                  </Box>

                  {meal_voucher_active && (
                    <Controller
                      name="meal_voucher_value"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Valor"
                          sx={{ flex: 1 }}
                          placeholder="R$ 0,00"
                          error={!!errors.meal_voucher_value}
                          helperText={errors.meal_voucher_value?.message}
                        />
                      )}
                    />
                  )}
                </Box>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Controller
                      name="transport_voucher_active"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={<Switch {...field} checked={field.value} />}
                          label="Vale Transporte"
                        />
                      )}
                    />
                  </Box>

                  {transport_voucher_active && (
                    <Controller
                      name="transport_voucher_value"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Valor"
                          sx={{ flex: 1 }}
                          placeholder="R$ 0,00"
                          error={!!errors.transport_voucher_value}
                          helperText={errors.transport_voucher_value?.message}
                        />
                      )}
                    />
                  )}
                </Box>

                <Controller
                  name="health_plan"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} />}
                      label="Plano de Saúde"
                    />
                  )}
                />

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Controller
                      name="basic_food_basket_active"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={<Switch {...field} checked={field.value} />}
                          label="Cesta Básica"
                        />
                      )}
                    />
                  </Box>

                  {basic_food_basket_active && (
                    <Controller
                      name="basic_food_basket_value"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Valor"
                          sx={{ flex: 1 }}
                          placeholder="R$ 0,00"
                          error={!!errors.basic_food_basket_value}
                          helperText={errors.basic_food_basket_value?.message}
                        />
                      )}
                    />
                  )}
                </Box>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Controller
                      name="cost_assistance_active"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={<Switch {...field} checked={field.value} />}
                          label="Auxílio Custo"
                        />
                      )}
                    />
                  </Box>

                  {cost_assistance_active && (
                    <Controller
                      name="cost_assistance_value"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Valor"
                          sx={{ flex: 1 }}
                          placeholder="R$ 0,00"
                          error={!!errors.cost_assistance_value}
                          helperText={errors.cost_assistance_value?.message}
                        />
                      )}
                    />
                  )}
                </Box>
              </Box>
            </Box>

            {/* Acessos e Permissões */}
            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                Acessos e Permissões
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Controller
                  name="cash_access"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} />}
                      label="Acesso ao Caixa"
                    />
                  )}
                />

                <Controller
                  name="evaluation_access"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} />}
                      label="Acesso à Avaliação"
                    />
                  )}
                />

                <Controller
                  name="training"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} />}
                      label="Treinamento"
                    />
                  )}
                />

                <Controller
                  name="support"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} />}
                      label="Suporte"
                    />
                  )}
                />
              </Box>
            </Box>

            {/* Termos */}
            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                Termos
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Controller
                  name="lgpd_term"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} />}
                      label="Termo LGPD"
                    />
                  )}
                />

                <Controller
                  name="confidentiality_term"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} />}
                      label="Termo de Confidencialidade"
                    />
                  )}
                />

                <Controller
                  name="system_term"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} />}
                      label="Termo do Sistema"
                    />
                  )}
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={handleClose} variant="outlined">
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<Save size={20} />}
          >
            Salvar Alterações
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
