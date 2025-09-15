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
  InputAdornment,
  IconButton
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Save, User } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import toast from 'react-hot-toast';

type Franqueado = Tables<"franqueados">;

interface FranqueadoEditModalProps {
  open: boolean;
  onClose: () => void;
  franqueado: Franqueado | null;
  onUpdate: () => void;
}

const franqueadoSchema = z.object({
  full_name: z.string().min(1, "Nome completo é obrigatório"),
  cpf_rnm: z.string().min(1, "CPF/RNM é obrigatório"),
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
  owner_type: z.enum(['principal', 'socio'], {
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
  web_password: z.string().min(1, "Senha é obrigatória"),
  is_in_contract: z.boolean(),
  receives_prolabore: z.boolean(),
  has_other_activities: z.boolean(),
  was_entrepreneur: z.boolean(),
  was_referred: z.boolean(),
  lgpd_term_accepted: z.boolean(),
  confidentiality_term_accepted: z.boolean(),
  system_term_accepted: z.boolean(),
  is_active_system: z.boolean()
});

type FranqueadoFormData = z.infer<typeof franqueadoSchema>;

export function FranqueadoEditModal({ open, onClose, franqueado, onUpdate }: FranqueadoEditModalProps) {
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
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
      owner_type: 'principal',
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
      web_password: '',
      is_in_contract: false,
      receives_prolabore: false,
      has_other_activities: false,
      was_entrepreneur: false,
      was_referred: false,
      lgpd_term_accepted: false,
      confidentiality_term_accepted: false,
      system_term_accepted: false,
      is_active_system: true
    }
  });

  const receives_prolabore = watch('receives_prolabore');
  const was_referred = watch('was_referred');
  const has_other_activities = watch('has_other_activities');

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
        owner_type: franqueado.owner_type as 'principal' | 'socio',
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
        web_password: franqueado.web_password || '',
        is_in_contract: franqueado.is_in_contract || false,
        receives_prolabore: franqueado.receives_prolabore || false,
        has_other_activities: franqueado.has_other_activities || false,
        was_entrepreneur: franqueado.was_entrepreneur || false,
        was_referred: franqueado.was_referred || false,
        lgpd_term_accepted: franqueado.lgpd_term_accepted || false,
        confidentiality_term_accepted: franqueado.confidentiality_term_accepted || false,
        system_term_accepted: franqueado.system_term_accepted || false,
        is_active_system: (franqueado as any).is_active_system || true
      });
    }
  }, [franqueado, open, reset]);

  const onSubmit = async (data: FranqueadoFormData) => {
    if (!franqueado) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from("franqueados")
        .update({
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
          web_password: data.web_password,
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
        })
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
                        error={!!errors.postal_code}
                        helperText={errors.postal_code?.message}
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
                        <MenuItem value="principal">Principal</MenuItem>
                        <MenuItem value="socio">Sócio</MenuItem>
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