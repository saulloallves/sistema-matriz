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
  InputAdornment,
  IconButton,
  Divider,
  CircularProgress
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Save, UserPlus, Eye, EyeOff, Search } from 'lucide-react';
import { formatCPF, formatPhone, formatCEP, removeMask } from '@/utils/formatters';
import { useCargosInterno } from '@/hooks/useCargosInterno';
import toast from 'react-hot-toast';

interface ColaboradorInternoAddModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  isLoading: boolean;
}

const colaboradorSchema = z.object({
  employee_name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  cpf: z.string().min(14, 'CPF inválido'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(14, 'Telefone inválido'),
  birth_date: z.string().min(1, 'Data de nascimento é obrigatória'),
  position_id: z.string().min(1, 'Selecione um cargo'),
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
  lgpd_term: z.boolean().refine(val => val === true, {
    message: 'É obrigatório aceitar o termo LGPD'
  }),
  confidentiality_term: z.boolean().refine(val => val === true, {
    message: 'É obrigatório aceitar o termo de confidencialidade'
  }),
  system_term: z.boolean().refine(val => val === true, {
    message: 'É obrigatório aceitar o termo do sistema'
  }),
});

type ColaboradorFormData = z.infer<typeof colaboradorSchema>;

export function ColaboradorInternoAddModal({ 
  open, 
  onClose, 
  onSave, 
  isLoading 
}: ColaboradorInternoAddModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [searchingCEP, setSearchingCEP] = useState(false);
  const { cargos } = useCargosInterno();

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
    }
  });

  const meal_voucher_active = watch('meal_voucher_active');
  const transport_voucher_active = watch('transport_voucher_active');
  const basic_food_basket_active = watch('basic_food_basket_active');
  const cost_assistance_active = watch('cost_assistance_active');

  const searchCEP = async () => {
    const cep = watch('postal_code');
    if (!cep) return;
    
    const cleanCEP = removeMask(cep);
    if (cleanCEP.length !== 8) {
      toast.error('CEP deve ter 8 dígitos');
      return;
    }

    setSearchingCEP(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast.error('CEP não encontrado');
        return;
      }

      setValue('address', data.logradouro || '');
      setValue('neighborhood', data.bairro || '');
      setValue('city', data.localidade || '');
      setValue('state', data.estado || '');
      setValue('uf', data.uf || '');
      toast.success('Endereço preenchido automaticamente');
    } catch (error) {
      toast.error('Erro ao buscar CEP');
    } finally {
      setSearchingCEP(false);
    }
  };

  const onSubmit = (data: ColaboradorFormData) => {
    const formattedData = {
      ...data,
      cpf: removeMask(data.cpf),
      phone: removeMask(data.phone),
      postal_code: data.postal_code ? removeMask(data.postal_code) : null,
      meal_voucher_value: data.meal_voucher_active && data.meal_voucher_value ? data.meal_voucher_value : null,
      transport_voucher_value: data.transport_voucher_active && data.transport_voucher_value ? data.transport_voucher_value : null,
      basic_food_basket_value: data.basic_food_basket_active && data.basic_food_basket_value ? data.basic_food_basket_value : null,
      cost_assistance_value: data.cost_assistance_active && data.cost_assistance_value ? data.cost_assistance_value : null,
    };
    onSave(formattedData);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
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
          <UserPlus size={24} />
          <Typography variant="h6">
            Adicionar Colaborador Interno
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
                📋 Dados Pessoais
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
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
                      label="Instagram"
                      fullWidth
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
                💼 Dados Profissionais
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Controller
                    name="position_id"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Cargo"
                        select
                        sx={{ flex: 1 }}
                        required
                        error={!!errors.position_id}
                        helperText={errors.position_id?.message}
                      >
                        {cargos.map((cargo) => (
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
                        InputProps={{
                          startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                        }}
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
                        label="Senha do Sistema"
                        type={showPassword ? 'text' : 'password'}
                        sx={{ flex: 1 }}
                        required
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
                        error={!!errors.web_password}
                        helperText={errors.web_password?.message}
                      />
                    )}
                  />
                </Box>
              </Box>
            </Box>

            {/* Endereço */}
            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                📍 Endereço
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Controller
                    name="postal_code"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="CEP"
                        sx={{ flex: 2 }}
                        value={formatCEP(field.value || '')}
                        onChange={(e) => field.onChange(e.target.value)}
                        error={!!errors.postal_code}
                        helperText={errors.postal_code?.message}
                      />
                    )}
                  />

                  <Button
                    variant="outlined"
                    onClick={searchCEP}
                    disabled={searchingCEP}
                    sx={{ flex: 1, height: '56px' }}
                    startIcon={searchingCEP ? <CircularProgress size={18} /> : <Search size={18} />}
                  >
                    Buscar
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Controller
                    name="address"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Endereço"
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
                      fullWidth
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
                        sx={{ flex: 2 }}
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
                        sx={{ flex: 2 }}
                        error={!!errors.city}
                        helperText={errors.city?.message}
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
                🎁 Benefícios
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Controller
                    name="meal_voucher_active"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={field.value}
                            onChange={field.onChange}
                          />
                        }
                        label="Vale Refeição"
                      />
                    )}
                  />
                  {meal_voucher_active && (
                    <Controller
                      name="meal_voucher_value"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Valor Vale Refeição"
                          fullWidth
                          sx={{ mt: 1 }}
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
                        control={
                          <Switch
                            checked={field.value}
                            onChange={field.onChange}
                          />
                        }
                        label="Vale Transporte"
                      />
                    )}
                  />
                  {transport_voucher_active && (
                    <Controller
                      name="transport_voucher_value"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Valor Vale Transporte"
                          fullWidth
                          sx={{ mt: 1 }}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                          }}
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
                      control={
                        <Switch
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      }
                      label="Plano de Saúde"
                    />
                  )}
                />

                <Box>
                  <Controller
                    name="basic_food_basket_active"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={field.value}
                            onChange={field.onChange}
                          />
                        }
                        label="Cesta Básica"
                      />
                    )}
                  />
                  {basic_food_basket_active && (
                    <Controller
                      name="basic_food_basket_value"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Valor Cesta Básica"
                          fullWidth
                          sx={{ mt: 1 }}
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
                        control={
                          <Switch
                            checked={field.value}
                            onChange={field.onChange}
                          />
                        }
                        label="Auxílio Custo"
                      />
                    )}
                  />
                  {cost_assistance_active && (
                    <Controller
                      name="cost_assistance_value"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Valor Auxílio Custo"
                          fullWidth
                          sx={{ mt: 1 }}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                          }}
                        />
                      )}
                    />
                  )}
                </Box>
              </Box>
            </Box>

            {/* Acessos */}
            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                🔑 Acessos e Permissões
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Controller
                  name="cash_access"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      }
                      label="Acesso ao Caixa"
                    />
                  )}
                />

                <Controller
                  name="evaluation_access"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      }
                      label="Acesso à Avaliação"
                    />
                  )}
                />

                <Controller
                  name="training"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      }
                      label="Treinamento"
                    />
                  )}
                />

                <Controller
                  name="support"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      }
                      label="Suporte"
                    />
                  )}
                />
              </Box>
            </Box>

            {/* Termos */}
            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                📄 Termos e Condições
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Controller
                  name="lgpd_term"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={field.onChange}
                          color={errors.lgpd_term ? 'error' : 'primary'}
                        />
                      }
                      label={
                        <Typography color={errors.lgpd_term ? 'error' : 'inherit'}>
                          Termo LGPD *
                        </Typography>
                      }
                    />
                  )}
                />
                {errors.lgpd_term && (
                  <Typography color="error" variant="caption" sx={{ ml: 2 }}>
                    {errors.lgpd_term.message}
                  </Typography>
                )}

                <Controller
                  name="confidentiality_term"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={field.onChange}
                          color={errors.confidentiality_term ? 'error' : 'primary'}
                        />
                      }
                      label={
                        <Typography color={errors.confidentiality_term ? 'error' : 'inherit'}>
                          Termo de Confidencialidade *
                        </Typography>
                      }
                    />
                  )}
                />
                {errors.confidentiality_term && (
                  <Typography color="error" variant="caption" sx={{ ml: 2 }}>
                    {errors.confidentiality_term.message}
                  </Typography>
                )}

                <Controller
                  name="system_term"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={field.onChange}
                          color={errors.system_term ? 'error' : 'primary'}
                        />
                      }
                      label={
                        <Typography color={errors.system_term ? 'error' : 'inherit'}>
                          Termo do Sistema *
                        </Typography>
                      }
                    />
                  )}
                />
                {errors.system_term && (
                  <Typography color="error" variant="caption" sx={{ ml: 2 }}>
                    {errors.system_term.message}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button 
            onClick={handleClose} 
            variant="outlined"
            startIcon={<X size={18} />}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={18} /> : <Save size={18} />}
          >
            {isLoading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
