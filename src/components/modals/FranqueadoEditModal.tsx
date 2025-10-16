import { useState, useEffect, useCallback, useMemo } from 'react';
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
  CircularProgress,
  Alert
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Save, User, MapPin, RefreshCw, Search } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesUpdate } from "@/integrations/supabase/types";
import toast from 'react-hot-toast';
import { useFranqueadosUnidades } from '@/hooks/useFranqueadosUnidades';
import { generateSystemPassword } from '@/utils/passwordGenerator';

type Franqueado = Tables<"franqueados">;

interface FranqueadoEditModalProps {
  open: boolean;
  onClose: () => void;
  franqueado: Franqueado | null;
  onUpdate: () => void;
}

const franqueadoSchema = z.object({
  full_name: z.string().min(1, "Nome completo é obrigatório"),
  cpf_rnm: z.string().optional(),
  nationality: z.string().optional(),
  birth_date: z.string().optional(),
  address: z.string().optional(),
  number_address: z.string().optional(),
  address_complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  uf: z.string().optional(),
  postal_code: z.string().optional(),
  owner_type: z.enum(['Principal', 'Sócio'], {
    required_error: "Tipo de proprietário é obrigatório"
  }),
  contact: z.string().min(1, "Contato é obrigatório"),
  availability: z.string().optional(),
  education: z.string().optional(),
  previous_profession: z.string().optional(),
  previous_salary_range: z.string().optional(),
  discovery_source: z.string().optional(),
  referrer_name: z.string().optional(),
  referrer_unit_code: z.string().optional(),
  other_activities_description: z.string().optional(),
  prolabore_value: z.number().optional(),
  profile_image: z.string().optional(),
  is_in_contract: z.boolean(),
  receives_prolabore: z.boolean(),
  has_other_activities: z.boolean(),
  was_entrepreneur: z.boolean(),
  was_referred: z.boolean(),
  lgpd_term_accepted: z.boolean(),
  confidentiality_term_accepted: z.boolean(),
  system_term_accepted: z.boolean(),
  is_active_system: z.boolean(),
  systems_password: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number().optional()
  ),
});

type FranqueadoFormData = z.infer<typeof franqueadoSchema>;

export function FranqueadoEditModal({ open, onClose, franqueado, onUpdate }: FranqueadoEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  
  const { vinculos } = useFranqueadosUnidades();
  
  const unidadesVinculadas = useMemo(() => {
    if (!franqueado) return [];
    return vinculos.filter(v => v.franqueado_id === franqueado.id);
  }, [vinculos, franqueado]);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FranqueadoFormData>({
    resolver: zodResolver(franqueadoSchema),
    defaultValues: {
      full_name: '',
      cpf_rnm: '',
      nationality: '',
      birth_date: '',
      address: '',
      number_address: '',
      address_complement: '',
      neighborhood: '',
      city: '',
      state: '',
      uf: '',
      postal_code: '',
      owner_type: 'Principal',
      contact: '',
      availability: '',
      education: '',
      previous_profession: '',
      previous_salary_range: '',
      discovery_source: '',
      referrer_name: '',
      referrer_unit_code: '',
      other_activities_description: '',
      prolabore_value: 0,
      profile_image: '',
      is_in_contract: false,
      receives_prolabore: false,
      has_other_activities: false,
      was_entrepreneur: false,
      was_referred: false,
      lgpd_term_accepted: false,
      confidentiality_term_accepted: false,
      system_term_accepted: false,
      is_active_system: true,
      systems_password: undefined
    }
  });

  const receives_prolabore = watch('receives_prolabore');
  const was_referred = watch('was_referred');
  const has_other_activities = watch('has_other_activities');

  // API CEP integration
  const fetchAddressByCep = useCallback(async () => {
    const cep = watch('postal_code');
    const cleanCEP = cep?.replace(/\D/g, '') || '';

    if (cleanCEP.length !== 8) {
      toast.error('Por favor, insira um CEP válido com 8 dígitos.');
      return;
    }
    
    try {
      setCepLoading(true);
      const { data, error } = await supabase.functions.invoke('cep-lookup', {
        queryString: { cep: cleanCEP }
      });

      if (error) throw error;
      
      if (data.erro) {
        toast.error('CEP não encontrado');
        return;
      }
      
      // Preencher automaticamente os campos de endereço
      setValue('address', data.logradouro || '');
      setValue('neighborhood', data.bairro || '');
      setValue('city', data.localidade || '');
      setValue('state', data.localidade || '');
      setValue('uf', data.uf || '');
      
      toast.success('Endereço preenchido automaticamente!');
    } catch (error: any) {
      console.error('Erro ao buscar CEP:', error);
      toast.error('Erro ao buscar informações do CEP: ' + error.message);
    } finally {
      setCepLoading(false);
    }
  }, [watch, setValue]);

  useEffect(() => {
    if (franqueado && open) {
      reset({
        full_name: franqueado.full_name || '',
        cpf_rnm: franqueado.cpf_rnm || '',
        nationality: franqueado.nationality || '',
        birth_date: franqueado.birth_date || '',
        address: franqueado.address || '',
        number_address: (franqueado as any).number_address || '',
        address_complement: (franqueado as any).address_complement || '',
        neighborhood: (franqueado as any).neighborhood || '',
        city: (franqueado as any).city || '',
        state: (franqueado as any).state || '',
        uf: (franqueado as any).uf || '',
        postal_code: (franqueado as any).postal_code || '',
        owner_type: franqueado.owner_type as 'Principal' | 'Sócio',
        contact: franqueado.contact || '',
        availability: franqueado.availability || '',
        education: franqueado.education || '',
        previous_profession: franqueado.previous_profession || '',
        previous_salary_range: franqueado.previous_salary_range || '',
        discovery_source: franqueado.discovery_source || '',
        referrer_name: franqueado.referrer_name || '',
        referrer_unit_code: franqueado.referrer_unit_code || '',
        other_activities_description: franqueado.other_activities_description || '',
        prolabore_value: franqueado.prolabore_value || 0,
        profile_image: franqueado.profile_image || '',
        
        is_in_contract: franqueado.is_in_contract || false,
        receives_prolabore: franqueado.receives_prolabore || false,
        has_other_activities: franqueado.has_other_activities || false,
        was_entrepreneur: franqueado.was_entrepreneur || false,
        was_referred: franqueado.was_referred || false,
        lgpd_term_accepted: franqueado.lgpd_term_accepted || false,
        confidentiality_term_accepted: franqueado.confidentiality_term_accepted || false,
        system_term_accepted: franqueado.system_term_accepted || false,
        is_active_system: (franqueado as any).is_active_system || true,
        systems_password: (franqueado as any).systems_password || undefined
      });
    }
  }, [franqueado, open, reset]);

  const onSubmit = async (data: FranqueadoFormData) => {
    if (!franqueado) return;

    try {
      setLoading(true);

      const updatePayload: TablesUpdate<'franqueados'> = {
        full_name: data.full_name,
        cpf_rnm: data.cpf_rnm || null,
        nationality: data.nationality || null,
        birth_date: data.birth_date || null,
        address: data.address || null,
        number_address: data.number_address || null,
        address_complement: data.address_complement || null,
        neighborhood: data.neighborhood || null,
        city: data.city || null,
        state: data.state || null,
        uf: data.uf || null,
        postal_code: data.postal_code || null,
        owner_type: data.owner_type,
        contact: data.contact,
        availability: data.availability || null,
        education: data.education || null,
        previous_profession: data.previous_profession || null,
        previous_salary_range: data.previous_salary_range || null,
        discovery_source: data.discovery_source || null,
        referrer_name: data.referrer_name || null,
        referrer_unit_code: data.referrer_unit_code || null,
        other_activities_description: data.other_activities_description || null,
        prolabore_value: data.receives_prolabore ? data.prolabore_value : null,
        profile_image: data.profile_image || null,
        is_in_contract: data.is_in_contract,
        receives_prolabore: data.receives_prolabore,
        has_other_activities: data.has_other_activities,
        was_entrepreneur: data.was_entrepreneur,
        was_referred: data.was_referred,
        lgpd_term_accepted: data.lgpd_term_accepted,
        confidentiality_term_accepted: data.confidentiality_term_accepted,
        system_term_accepted: data.system_term_accepted,
        is_active_system: data.is_active_system,
        updated_at: new Date().toISOString()
      };

      // Only include password if it has been changed
      if (data.systems_password && data.systems_password !== franqueado.systems_password) {
        updatePayload.systems_password = data.systems_password;
      }

      const { error } = await supabase
        .from("franqueados")
        .update(updatePayload)
        .eq("id", franqueado.id);

      if (error) {
        throw error;
      }

      toast.success("Franqueado atualizado com sucesso!");
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar franqueado:", error);
      toast.error("Erro ao atualizar franqueado");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleGeneratePassword = () => {
    if (unidadesVinculadas.length === 0) {
      toast.error('Franqueado sem unidades vinculadas');
      return;
    }
    
    const groupCode = unidadesVinculadas[0].unidade_group_code;
    const novaSenha = generateSystemPassword(groupCode);
    
    setValue('systems_password', novaSenha);
    toast.success(`Senha gerada: ${novaSenha}`);
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
          <User size={24} />
          <Typography variant="h6">
            Editar Franqueado: {franqueado?.full_name}
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
                  name="full_name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nome Completo"
                      fullWidth
                      error={!!errors.full_name}
                      helperText={errors.full_name?.message}
                      required
                    />
                  )}
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Controller
                    name="cpf_rnm"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="CPF/RNM"
                        sx={{ flex: 1 }}
                        error={!!errors.cpf_rnm}
                        helperText={errors.cpf_rnm?.message}
                      />
                    )}
                  />
                  
                  <Controller
                    name="nationality"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Nacionalidade"
                        sx={{ flex: 1 }}
                        error={!!errors.nationality}
                        helperText={errors.nationality?.message}
                      />
                    )}
                  />
                </Box>

                <Controller
                  name="birth_date"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Data de Nascimento"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.birth_date}
                      helperText={errors.birth_date?.message}
                    />
                  )}
                />

                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Endereço (Logradouro)"
                      fullWidth
                      error={!!errors.address}
                      helperText={errors.address?.message}
                    />
                  )}
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
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
                  
                  <Controller
                    name="address_complement"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Complemento"
                        sx={{ flex: 1 }}
                        error={!!errors.address_complement}
                        helperText={errors.address_complement?.message}
                      />
                    )}
                  />
                </Box>

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
                  
                  <Controller
                    name="postal_code"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="CEP"
                        sx={{ flex: 1 }}
                        placeholder="00000000"
                        inputProps={{ 
                          maxLength: 8,
                          pattern: '[0-9]*'
                        }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={fetchAddressByCep}
                                edge="end"
                                disabled={cepLoading}
                              >
                                {cepLoading ? <CircularProgress size={20} /> : <Search size={20} />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                        error={!!errors.postal_code}
                        helperText={errors.postal_code?.message || 'Digite 8 números e clique na lupa'}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          field.onChange(value);
                        }}
                      />
                    )}
                  />
                </Box>
              </Box>
            </Box>

            {/* Dados de Contato */}
            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                Contato
              </Typography>
              
              <Controller
                name="contact"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Telefone/WhatsApp"
                    fullWidth
                    required
                    error={!!errors.contact}
                    helperText={errors.contact?.message}
                  />
                )}
              />
            </Box>

            {/* Dados Profissionais */}
            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                Dados Profissionais
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Controller
                    name="owner_type"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Tipo de Proprietário"
                        select
                        sx={{ flex: 1 }}
                        required
                        error={!!errors.owner_type}
                        helperText={errors.owner_type?.message}
                      >
                        <MenuItem value="Principal">Principal</MenuItem>
                        <MenuItem value="Sócio">Sócio</MenuItem>
                      </TextField>
                    )}
                  />

                  <Controller
                    name="availability"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Disponibilidade"
                        sx={{ flex: 1 }}
                        error={!!errors.availability}
                        helperText={errors.availability?.message}
                      />
                    )}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Controller
                    name="education"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Escolaridade"
                        sx={{ flex: 1 }}
                        error={!!errors.education}
                        helperText={errors.education?.message}
                      />
                    )}
                  />

                  <Controller
                    name="previous_profession"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Profissão Anterior"
                        sx={{ flex: 1 }}
                        error={!!errors.previous_profession}
                        helperText={errors.previous_profession?.message}
                      />
                    )}
                  />
                </Box>

                 <Box sx={{ display: 'flex', gap: 2 }}>
                   <Controller
                     name="discovery_source"
                     control={control}
                     render={({ field }) => (
                       <TextField
                         {...field}
                         label="Como conheceu a franquia"
                         sx={{ flex: 1 }}
                         error={!!errors.discovery_source}
                         helperText={errors.discovery_source?.message}
                       />
                     )}
                   />

                   <Controller
                     name="previous_salary_range"
                     control={control}
                     render={({ field }) => (
                       <TextField
                         {...field}
                         label="Faixa Salarial Anterior"
                         sx={{ flex: 1 }}
                         error={!!errors.previous_salary_range}
                         helperText={errors.previous_salary_range?.message}
                       />
                     )}
                   />
                 </Box>
               </Box>
             </Box>

            {/* Pró-labore */}
            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                Pró-labore
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Controller
                  name="receives_prolabore"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      }
                      label="Recebe Pró-labore"
                    />
                  )}
                />

                {receives_prolabore && (
                  <Controller
                    name="prolabore_value"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Valor do Pró-labore"
                        type="number"
                        fullWidth
                        InputProps={{
                          startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                        }}
                        error={!!errors.prolabore_value}
                        helperText={errors.prolabore_value?.message}
                      />
                    )}
                  />
                )}
              </Box>
            </Box>

            {/* Status e Configurações */}
            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                Status e Configurações
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Controller
                  name="is_in_contract"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      }
                      label="Em Contrato"
                    />
                  )}
                />

                <Controller
                  name="was_entrepreneur"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      }
                      label="Foi Empreendedor"
                    />
                  )}
                />

                <Controller
                  name="has_other_activities"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      }
                      label="Possui Outras Atividades"
                    />
                  )}
                />

                {has_other_activities && (
                  <Controller
                    name="other_activities_description"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Descrição das Outras Atividades"
                        fullWidth
                        multiline
                        rows={2}
                        error={!!errors.other_activities_description}
                        helperText={errors.other_activities_description?.message}
                      />
                    )}
                  />
                )}
              </Box>
            </Box>

            {/* Dados do Sistema */}
            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                Dados do Sistema
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Controller
                  name="profile_image"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="URL da Foto de Perfil"
                      fullWidth
                      error={!!errors.profile_image}
                      helperText={errors.profile_image?.message}
                    />
                  )}
                 />

                 <Controller
                   name="is_active_system"
                   control={control}
                   render={({ field }) => (
                     <FormControlLabel
                       control={
                         <Switch
                           checked={field.value}
                           onChange={field.onChange}
                         />
                       }
                       label="Sistema Ativo"
                     />
                   )}
                 />
               </Box>
            </Box>

            {/* Referência */}
            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                Indicação
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Controller
                  name="was_referred"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      }
                      label="Foi Indicado"
                    />
                  )}
                />

                {was_referred && (
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Controller
                      name="referrer_name"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Nome do Indicador"
                          sx={{ flex: 1 }}
                          error={!!errors.referrer_name}
                          helperText={errors.referrer_name?.message}
                        />
                      )}
                    />

                    <Controller
                      name="referrer_unit_code"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Código da Unidade do Indicador"
                          sx={{ flex: 1 }}
                          error={!!errors.referrer_unit_code}
                          helperText={errors.referrer_unit_code?.message}
                        />
                      )}
                    />
                  </Box>
                )}
              </Box>
            </Box>

              {/* Senha do Sistema */}
              <Box>
                <Typography variant="h6" gutterBottom color="primary">
                  Senha do Sistema
                </Typography>
                
                {unidadesVinculadas.length === 0 ? (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Este franqueado não possui unidades vinculadas. Vincule a uma unidade para gerar a senha automaticamente.
                  </Alert>
                ) : (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Unidade Principal: {unidadesVinculadas[0].unidade_group_name} (Código: {unidadesVinculadas[0].unidade_group_code})
                  </Alert>
                )}
                
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Controller
                    name="systems_password"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        value={field.value ? String(field.value) : ''}
                        label="Senha do Sistema"
                        fullWidth
                        placeholder="Clique em 'Gerar' para criar uma senha"
                        InputProps={{
                          readOnly: true,
                          sx: { 
                            fontSize: '1.1rem',
                            letterSpacing: '0.1em'
                          }
                        }}
                        helperText="Senha gerada automaticamente baseada no código da unidade"
                      />
                    )}
                  />
                  
                  <Button
                    variant="contained"
                    onClick={handleGeneratePassword}
                    disabled={unidadesVinculadas.length === 0}
                    startIcon={<RefreshCw size={18} />}
                    sx={{ minWidth: 120, height: 56 }}
                  >
                    Gerar
                  </Button>
                </Box>
              </Box>

              {/* Termos e Condições */}
              <Box>
                <Typography variant="h6" gutterBottom color="primary">
                  Termos e Condições
                </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Controller
                  name="lgpd_term_accepted"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      }
                      label="Termo LGPD Aceito"
                    />
                  )}
                />

                <Controller
                  name="confidentiality_term_accepted"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      }
                      label="Termo de Confidencialidade Aceito"
                    />
                  )}
                />

                <Controller
                  name="system_term_accepted"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      }
                      label="Termo do Sistema Aceito"
                    />
                  )}
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={handleClose} variant="outlined">
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<Save size={16} />}
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}