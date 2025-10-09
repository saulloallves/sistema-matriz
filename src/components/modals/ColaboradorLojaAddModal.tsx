import { useState } from 'react';
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
  MenuItem,
  Divider,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Search } from 'lucide-react';
import { useCargosLoja } from '@/hooks/useCargosLoja';
import { formatCPF, formatPhone, formatCEP, formatMoneyInput, unformatMoney, removeMask } from '@/utils/formatters';
import toast from 'react-hot-toast';

const colaboradorSchema = z.object({
  employee_name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  cpf: z.string().min(14, 'CPF inválido'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(14, 'Telefone inválido'),
  birth_date: z.string().min(1, 'Data de nascimento obrigatória'),
  position_id: z.string().min(1, 'Selecione um cargo'),
  admission_date: z.string().min(1, 'Data de admissão obrigatória'),
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
  lgpd_term: z.boolean().refine(val => val === true, 'Aceite do termo LGPD obrigatório'),
  confidentiality_term: z.boolean().refine(val => val === true, 'Aceite do termo de confidencialidade obrigatório'),
  system_term: z.boolean().refine(val => val === true, 'Aceite do termo do sistema obrigatório'),
});

type ColaboradorFormData = z.infer<typeof colaboradorSchema>;

interface ColaboradorLojaAddModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  isLoading?: boolean;
}

export const ColaboradorLojaAddModal = ({
  open,
  onClose,
  onSave,
  isLoading = false,
}: ColaboradorLojaAddModalProps) => {
  const { cargos } = useCargosLoja();
  const [loadingCep, setLoadingCep] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ColaboradorFormData>({
    resolver: zodResolver(colaboradorSchema),
    defaultValues: {
      employee_name: '',
      cpf: '',
      email: '',
      phone: '',
      birth_date: '',
      position_id: '',
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
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const fetchCEP = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    setLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast.error('CEP não encontrado');
        return;
      }

      setValue('address', data.logradouro);
      setValue('neighborhood', data.bairro);
      setValue('city', data.localidade);
      setValue('state', data.localidade);
      setValue('uf', data.uf);
      toast.success('CEP encontrado!');
    } catch (error) {
      toast.error('Erro ao buscar CEP');
    } finally {
      setLoadingCep(false);
    }
  };

  const onSubmit = (data: ColaboradorFormData) => {
    const formattedData = {
      ...data,
      cpf: removeMask(data.cpf),
      phone: removeMask(data.phone),
      postal_code: data.postal_code ? removeMask(data.postal_code) : null,
      salary: unformatMoney(data.salary),
      meal_voucher_value: data.meal_voucher_active && data.meal_voucher_value 
        ? unformatMoney(data.meal_voucher_value) 
        : null,
      transport_voucher_value: data.transport_voucher_active && data.transport_voucher_value
        ? unformatMoney(data.transport_voucher_value)
        : null,
      basic_food_basket_value: data.basic_food_basket_active && data.basic_food_basket_value
        ? unformatMoney(data.basic_food_basket_value)
        : null,
      cost_assistance_value: data.cost_assistance_active && data.cost_assistance_value
        ? unformatMoney(data.cost_assistance_value)
        : null,
    };
    onSave(formattedData);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Adicionar Colaborador de Loja</Typography>
        <IconButton onClick={handleClose} size="small">
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          {/* Dados Pessoais */}
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 1 }}>
            📋 Dados Pessoais
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}>
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
            <Controller
              name="cpf"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="CPF"
                  fullWidth
                  required
                  error={!!errors.cpf}
                  helperText={errors.cpf?.message}
                  onChange={(e) => field.onChange(formatCPF(e.target.value))}
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
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.birth_date}
                  helperText={errors.birth_date?.message}
                />
              )}
            />
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email"
                  type="email"
                  fullWidth
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
                  fullWidth
                  required
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                  onChange={(e) => field.onChange(formatPhone(e.target.value))}
                />
              )}
            />
            <Controller
              name="instagram_profile"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Instagram (opcional)"
                  fullWidth
                />
              )}
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Dados Profissionais */}
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            💼 Dados Profissionais
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}>
            <Controller
              name="position_id"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Cargo"
                  fullWidth
                  required
                  error={!!errors.position_id}
                  helperText={errors.position_id?.message}
                >
                  {cargos?.map((cargo) => (
                    <MenuItem key={cargo.id} value={cargo.id}>
                      {cargo.role}
                    </MenuItem>
                  ))}
                </TextField>
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
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.admission_date}
                  helperText={errors.admission_date?.message}
                />
              )}
            />
            <Controller
              name="salary"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Salário"
                  fullWidth
                  required
                  error={!!errors.salary}
                  helperText={errors.salary?.message}
                  onChange={(e) => field.onChange(formatMoneyInput(e.target.value))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  }}
                />
              )}
            />
            <Controller
              name="web_password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Senha do Sistema"
                  type="password"
                  fullWidth
                  required
                  error={!!errors.web_password}
                  helperText={errors.web_password?.message}
                />
              )}
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Endereço */}
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            📍 Endereço
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' }, gap: 2, mb: 2 }}>
            <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 4' } }}>
              <Controller
                name="postal_code"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="CEP"
                    fullWidth
                    onChange={(e) => {
                      const formatted = formatCEP(e.target.value);
                      field.onChange(formatted);
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => field.value && fetchCEP(field.value)}
                            disabled={loadingCep}
                            size="small"
                          >
                            <Search size={18} />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 8' } }}>
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Endereço" fullWidth />
                )}
              />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 3' } }}>
              <Controller
                name="number_address"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Número" fullWidth />
                )}
              />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 5' } }}>
              <Controller
                name="address_complement"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Complemento" fullWidth />
                )}
              />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 4' } }}>
              <Controller
                name="neighborhood"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Bairro" fullWidth />
                )}
              />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 6' } }}>
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Cidade" fullWidth />
                )}
              />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 4' } }}>
              <Controller
                name="state"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Estado" fullWidth />
                )}
              />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 2' } }}>
              <Controller
                name="uf"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="UF" fullWidth inputProps={{ maxLength: 2 }} />
                )}
              />
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Benefícios */}
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            🎁 Benefícios
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}>
            <Box>
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
              {watch('meal_voucher_active') && (
                <Controller
                  name="meal_voucher_value"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Valor"
                      fullWidth
                      size="small"
                      onChange={(e) => field.onChange(formatMoneyInput(e.target.value))}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                      }}
                    />
                  )}
                />
              )}
            </Box>
            <Box>
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
              {watch('transport_voucher_active') && (
                <Controller
                  name="transport_voucher_value"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Valor"
                      fullWidth
                      size="small"
                      onChange={(e) => field.onChange(formatMoneyInput(e.target.value))}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                      }}
                    />
                  )}
                />
              )}
            </Box>
            <Box>
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
            </Box>
            <Box>
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
              {watch('basic_food_basket_active') && (
                <Controller
                  name="basic_food_basket_value"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Valor"
                      fullWidth
                      size="small"
                      onChange={(e) => field.onChange(formatMoneyInput(e.target.value))}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                      }}
                    />
                  )}
                />
              )}
            </Box>
            <Box>
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
              {watch('cost_assistance_active') && (
                <Controller
                  name="cost_assistance_value"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Valor"
                      fullWidth
                      size="small"
                      onChange={(e) => field.onChange(formatMoneyInput(e.target.value))}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                      }}
                    />
                  )}
                />
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Acessos */}
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            🔐 Acessos
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}>
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

          <Divider sx={{ my: 3 }} />

          {/* Termos */}
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            📄 Termos (Obrigatórios)
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box>
              <Controller
                name="lgpd_term"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="Termo LGPD *"
                  />
                )}
              />
              {errors.lgpd_term && (
                <Typography variant="caption" color="error" display="block">
                  {errors.lgpd_term.message}
                </Typography>
              )}
            </Box>
            <Box>
              <Controller
                name="confidentiality_term"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="Termo de Confidencialidade *"
                  />
                )}
              />
              {errors.confidentiality_term && (
                <Typography variant="caption" color="error" display="block">
                  {errors.confidentiality_term.message}
                </Typography>
              )}
            </Box>
            <Box>
              <Controller
                name="system_term"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="Termo do Sistema *"
                  />
                )}
              />
              {errors.system_term && (
                <Typography variant="caption" color="error" display="block">
                  {errors.system_term.message}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
