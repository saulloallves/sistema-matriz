import { useState, useEffect } from 'react';
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
import { ColaboradorLoja } from '@/hooks/useColaboradoresLoja';
import { formatCPF, formatPhone, formatCEP, formatMoneyInput, unformatMoney, removeMask } from '@/utils/formatters';
import toast from 'react-hot-toast';

const colaboradorSchema = z.object({
  employee_name: z.string().min(3),
  cpf: z.string().min(14),
  email: z.string().email(),
  phone: z.string().min(14),
  birth_date: z.string().min(1),
  position_id: z.string().min(1),
  admission_date: z.string().min(1),
  salary: z.string().min(1),
  web_password: z.string().min(6),
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

interface ColaboradorLojaEditModalProps {
  open: boolean;
  onClose: () => void;
  colaborador: ColaboradorLoja | null;
  onSave: (data: any) => void;
  isLoading?: boolean;
}

export const ColaboradorLojaEditModal = ({
  open,
  onClose,
  colaborador,
  onSave,
  isLoading = false,
}: ColaboradorLojaEditModalProps) => {
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
  });

  useEffect(() => {
    if (colaborador && open) {
      reset({
        employee_name: colaborador.employee_name,
        cpf: formatCPF(colaborador.cpf),
        email: colaborador.email,
        phone: formatPhone(colaborador.phone),
        birth_date: colaborador.birth_date,
        position_id: colaborador.position_id,
        admission_date: colaborador.admission_date,
        salary: colaborador.salary,
        web_password: colaborador.web_password,
        instagram_profile: colaborador.instagram_profile || '',
        address: colaborador.address || '',
        number_address: colaborador.number_address || '',
        address_complement: colaborador.address_complement || '',
        neighborhood: colaborador.neighborhood || '',
        city: colaborador.city || '',
        state: colaborador.state || '',
        uf: colaborador.uf || '',
        postal_code: colaborador.postal_code ? formatCEP(colaborador.postal_code) : '',
        meal_voucher_active: colaborador.meal_voucher_active,
        meal_voucher_value: colaborador.meal_voucher_value || '',
        transport_voucher_active: colaborador.transport_voucher_active,
        transport_voucher_value: colaborador.transport_voucher_value || '',
        health_plan: colaborador.health_plan,
        basic_food_basket_active: colaborador.basic_food_basket_active,
        basic_food_basket_value: colaborador.basic_food_basket_value || '',
        cost_assistance_active: colaborador.cost_assistance_active,
        cost_assistance_value: colaborador.cost_assistance_value || '',
        cash_access: colaborador.cash_access,
        evaluation_access: colaborador.evaluation_access,
        training: colaborador.training,
        support: colaborador.support,
        lgpd_term: colaborador.lgpd_term,
        confidentiality_term: colaborador.confidentiality_term,
        system_term: colaborador.system_term,
      });
    }
  }, [colaborador, open, reset]);

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
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Editar Colaborador de Loja</Typography>
        <IconButton onClick={onClose} size="small">
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            📋 Dados Pessoais
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}>
            <Controller name="employee_name" control={control} render={({ field }) => <TextField {...field} label="Nome Completo" fullWidth required error={!!errors.employee_name} helperText={errors.employee_name?.message} />} />
            <Controller name="cpf" control={control} render={({ field }) => <TextField {...field} label="CPF" fullWidth required error={!!errors.cpf} helperText={errors.cpf?.message} onChange={(e) => field.onChange(formatCPF(e.target.value))} />} />
            <Controller name="birth_date" control={control} render={({ field }) => <TextField {...field} label="Data de Nascimento" type="date" fullWidth required InputLabelProps={{ shrink: true }} />} />
            <Controller name="email" control={control} render={({ field }) => <TextField {...field} label="Email" type="email" fullWidth required />} />
            <Controller name="phone" control={control} render={({ field }) => <TextField {...field} label="Telefone" fullWidth required onChange={(e) => field.onChange(formatPhone(e.target.value))} />} />
            <Controller name="instagram_profile" control={control} render={({ field }) => <TextField {...field} label="Instagram" fullWidth />} />
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            💼 Dados Profissionais
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}>
            <Controller name="position_id" control={control} render={({ field }) => <TextField {...field} select label="Cargo" fullWidth required>{cargos?.map((cargo) => <MenuItem key={cargo.id} value={cargo.id}>{cargo.role}</MenuItem>)}</TextField>} />
            <Controller name="admission_date" control={control} render={({ field }) => <TextField {...field} label="Data de Admissão" type="date" fullWidth required InputLabelProps={{ shrink: true }} />} />
            <Controller name="salary" control={control} render={({ field }) => <TextField {...field} label="Salário" fullWidth required onChange={(e) => field.onChange(formatMoneyInput(e.target.value))} InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }} />} />
            <Controller name="web_password" control={control} render={({ field }) => <TextField {...field} label="Senha do Sistema" type="password" fullWidth required />} />
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            📍 Endereço
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' }, gap: 2, mb: 2 }}>
            <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 4' } }}><Controller name="postal_code" control={control} render={({ field }) => <TextField {...field} label="CEP" fullWidth onChange={(e) => field.onChange(formatCEP(e.target.value))} InputProps={{ endAdornment: <InputAdornment position="end"><IconButton onClick={() => field.value && fetchCEP(field.value)} disabled={loadingCep} size="small"><Search size={18} /></IconButton></InputAdornment> }} />} /></Box>
            <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 8' } }}><Controller name="address" control={control} render={({ field }) => <TextField {...field} label="Endereço" fullWidth />} /></Box>
            <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 3' } }}><Controller name="number_address" control={control} render={({ field }) => <TextField {...field} label="Número" fullWidth />} /></Box>
            <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 5' } }}><Controller name="address_complement" control={control} render={({ field }) => <TextField {...field} label="Complemento" fullWidth />} /></Box>
            <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 4' } }}><Controller name="neighborhood" control={control} render={({ field }) => <TextField {...field} label="Bairro" fullWidth />} /></Box>
            <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 6' } }}><Controller name="city" control={control} render={({ field }) => <TextField {...field} label="Cidade" fullWidth />} /></Box>
            <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 4' } }}><Controller name="state" control={control} render={({ field }) => <TextField {...field} label="Estado" fullWidth />} /></Box>
            <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 2' } }}><Controller name="uf" control={control} render={({ field }) => <TextField {...field} label="UF" fullWidth inputProps={{ maxLength: 2 }} />} /></Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            🎁 Benefícios
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}>
            <Box><Controller name="meal_voucher_active" control={control} render={({ field }) => <FormControlLabel control={<Switch {...field} checked={field.value} />} label="Vale Refeição" />} />{watch('meal_voucher_active') && <Controller name="meal_voucher_value" control={control} render={({ field }) => <TextField {...field} label="Valor" fullWidth size="small" onChange={(e) => field.onChange(formatMoneyInput(e.target.value))} InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }} />} />}</Box>
            <Box><Controller name="transport_voucher_active" control={control} render={({ field }) => <FormControlLabel control={<Switch {...field} checked={field.value} />} label="Vale Transporte" />} />{watch('transport_voucher_active') && <Controller name="transport_voucher_value" control={control} render={({ field }) => <TextField {...field} label="Valor" fullWidth size="small" onChange={(e) => field.onChange(formatMoneyInput(e.target.value))} InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }} />} />}</Box>
            <Box><Controller name="health_plan" control={control} render={({ field }) => <FormControlLabel control={<Switch {...field} checked={field.value} />} label="Plano de Saúde" />} /></Box>
            <Box><Controller name="basic_food_basket_active" control={control} render={({ field }) => <FormControlLabel control={<Switch {...field} checked={field.value} />} label="Cesta Básica" />} />{watch('basic_food_basket_active') && <Controller name="basic_food_basket_value" control={control} render={({ field }) => <TextField {...field} label="Valor" fullWidth size="small" onChange={(e) => field.onChange(formatMoneyInput(e.target.value))} InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }} />} />}</Box>
            <Box><Controller name="cost_assistance_active" control={control} render={({ field }) => <FormControlLabel control={<Switch {...field} checked={field.value} />} label="Auxílio Custo" />} />{watch('cost_assistance_active') && <Controller name="cost_assistance_value" control={control} render={({ field }) => <TextField {...field} label="Valor" fullWidth size="small" onChange={(e) => field.onChange(formatMoneyInput(e.target.value))} InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }} />} />}</Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            🔐 Acessos & Termos
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1 }}>
            <Controller name="cash_access" control={control} render={({ field }) => <FormControlLabel control={<Switch {...field} checked={field.value} />} label="Acesso ao Caixa" />} />
            <Controller name="evaluation_access" control={control} render={({ field }) => <FormControlLabel control={<Switch {...field} checked={field.value} />} label="Avaliação" />} />
            <Controller name="training" control={control} render={({ field }) => <FormControlLabel control={<Switch {...field} checked={field.value} />} label="Treinamento" />} />
            <Controller name="support" control={control} render={({ field }) => <FormControlLabel control={<Switch {...field} checked={field.value} />} label="Suporte" />} />
            <Controller name="lgpd_term" control={control} render={({ field }) => <FormControlLabel control={<Switch {...field} checked={field.value} />} label="Termo LGPD" />} />
            <Controller name="confidentiality_term" control={control} render={({ field }) => <FormControlLabel control={<Switch {...field} checked={field.value} />} label="Confidencialidade" />} />
            <Controller name="system_term" control={control} render={({ field }) => <FormControlLabel control={<Switch {...field} checked={field.value} />} label="Termo Sistema" />} />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={isLoading}>{isLoading ? 'Salvando...' : 'Salvar Alterações'}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
