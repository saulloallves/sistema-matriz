/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Avatar,
  CircularProgress,
  Divider,
  InputAdornment,
  Alert,
  Grid,
  Stack
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Save, User, Upload, Trash2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

const profileSchema = z.object({
  full_name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  phone_number: z.string().min(10, 'O telefone deve ser válido'),
  email: z.string().email('O e-mail deve ser válido'),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine(data => {
  if (data.password && data.password.length < 6) return false;
  return true;
}, {
  message: 'A nova senha deve ter pelo menos 6 caracteres',
  path: ['password'],
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface UserProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export const UserProfileModal = ({ open, onClose }: UserProfileModalProps) => {
  const { user } = useAuth();
  const { data: profile, isLoading: isLoadingProfile } = useUserProfile();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (profile && open) {
      reset({
        full_name: profile.full_name || '',
        phone_number: profile.phone_number || '',
        email: user?.email || '',
      });
      setAvatarPreview(profile.avatar_url || null);
      setAvatarFile(null);
    }
  }, [profile, user, open, reset]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user || !profile?.avatar_url) return;
    
    setIsSaving(true);
    try {
      const filePath = profile.avatar_url.split('/').pop();
      if (filePath) {
        const { error: removeError } = await supabase.storage
          .from('internal_users')
          .remove([`${user.id}/${filePath}`]);
        if (removeError) throw removeError;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('user_id', user.id);
      if (updateError) throw updateError;

      toast.success('Foto de perfil removida!');
      setAvatarFile(null);
      setAvatarPreview(null);
      queryClient.invalidateQueries({ queryKey: ['user-profile', user.id] });
    } catch (error: any) {
      toast.error('Erro ao remover foto: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    setIsSaving(true);
    try {
      // 1. Atualizar dados de autenticação (email/senha)
      if (data.email !== user.email || data.password) {
        const authUpdate: any = {};
        if (data.email !== user.email) authUpdate.email = data.email;
        if (data.password) authUpdate.password = data.password;
        
        const { error: authError } = await supabase.auth.updateUser(authUpdate);
        if (authError) throw authError;
        if (data.email !== user.email) {
          toast.success('E-mail de confirmação enviado para o novo endereço!');
        }
        if (data.password) {
          toast.success('Senha atualizada com sucesso!');
        }
      }

      // 2. Lidar com a foto de perfil
      let avatarUrl = profile?.avatar_url;
      if (avatarFile) {
        const fileName = `${Date.now()}_${avatarFile.name}`;
        const filePath = `${user.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('internal_users')
          .upload(filePath, avatarFile, { upsert: true });
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('internal_users')
          .getPublicUrl(filePath);
        avatarUrl = urlData.publicUrl;
      }

      // 3. Atualizar dados do perfil
      const profileUpdate = {
        full_name: data.full_name,
        phone_number: data.phone_number,
        avatar_url: avatarUrl,
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('user_id', user.id);
      if (profileError) throw profileError;

      toast.success('Perfil atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['user-profile', user.id] });
      onClose();
    } catch (error: any) {
      toast.error('Erro ao atualizar perfil: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Gerenciar Perfil</Typography>
        <IconButton onClick={onClose}><X size={20} /></IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          {isLoadingProfile ? <CircularProgress /> : (
            <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
              <Box sx={{ flex: '0 0 auto', textAlign: 'center', minWidth: { md: 200 } }}>
                <Avatar src={avatarPreview || undefined} sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}>
                  <User size={60} />
                </Avatar>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/*"
                  hidden
                />
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Upload size={16} />}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Alterar
                  </Button>
                  {avatarPreview && (
                    <IconButton color="error" onClick={handleRemoveAvatar} size="small">
                      <Trash2 size={16} />
                    </IconButton>
                  )}
                </Box>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  JPG, PNG ou GIF. Máx 2MB.
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Stack spacing={3}>
                  <Controller
                    name="full_name"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label="Nome Completo" fullWidth error={!!errors.full_name} helperText={errors.full_name?.message} />
                    )}
                  />
                  <Controller
                    name="phone_number"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label="Telefone" fullWidth error={!!errors.phone_number} helperText={errors.phone_number?.message} />
                    )}
                  />
                  <Divider />
                  <Typography variant="subtitle1" fontWeight="bold">Credenciais de Acesso</Typography>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label="E-mail" type="email" fullWidth error={!!errors.email} helperText={errors.email?.message} />
                    )}
                  />
                  {user?.email !== watch('email') && (
                    <Alert severity="info">
                      Um e-mail de confirmação será enviado para o novo endereço.
                    </Alert>
                  )}
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Nova Senha (opcional)"
                        type={showPassword ? 'text' : 'password'}
                        fullWidth
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                    )}
                  />
                  <Controller
                    name="confirmPassword"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label="Confirmar Nova Senha" type="password" fullWidth error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message} />
                    )}
                  />
                </Stack>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={isSaving || (!isDirty && !avatarFile)} startIcon={isSaving ? <CircularProgress size={16} /> : <Save size={16} />}>
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};