import React, { useEffect } from 'react';
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
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { MessageSquare } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWhatsAppGroups, useUnidades } from '@/hooks/useWhatsAppGroups';
import { WhatsAppGroupUpdate, WhatsAppGroupKind, whatsappGroupKindLabels, WhatsAppGroupWithUnidade } from '@/types/whatsapp';

const groupSchema = z.object({
  unit_id: z.string().min(1, 'Unidade é obrigatória'),
  kind: z.enum(['main', 'ai', 'intensive_support', 'colab', 'complaining', 'notifications', 'purchasing_phase'] as const, {
    errorMap: () => ({ message: 'Tipo de grupo é obrigatório' })
  }),
  group_id: z.string().min(1, 'ID do grupo é obrigatório').regex(/^[a-zA-Z0-9@._-]+$/, 'ID do grupo deve conter apenas letras, números e os caracteres: @ . _ -'),
});

type GroupFormData = z.infer<typeof groupSchema>;

interface WhatsAppGroupEditModalProps {
  open: boolean;
  onClose: () => void;
  group: WhatsAppGroupWithUnidade | null;
}

export const WhatsAppGroupEditModal: React.FC<WhatsAppGroupEditModalProps> = ({
  open,
  onClose,
  group
}) => {
  const { updateGroup, isUpdating } = useWhatsAppGroups();
  const { unidades, isLoadingUnidades } = useUnidades();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<GroupFormData>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      unit_id: '',
      kind: 'main',
      group_id: ''
    }
  });

  useEffect(() => {
    if (group && open) {
      reset({
        unit_id: group.unit_id,
        kind: group.kind as WhatsAppGroupKind,
        group_id: group.group_id
      });
    }
  }, [group, open, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: GroupFormData) => {
    if (!group) return;
    
    try {
      await updateGroup({ 
        id: group.id, 
        data: data as WhatsAppGroupUpdate 
      });
      handleClose();
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const groupTypeOptions: { value: WhatsAppGroupKind; label: string }[] = [
    { value: 'main', label: whatsappGroupKindLabels.main },
    { value: 'ai', label: whatsappGroupKindLabels.ai },
    { value: 'intensive_support', label: whatsappGroupKindLabels.intensive_support },
    { value: 'colab', label: whatsappGroupKindLabels.colab },
    { value: 'complaining', label: whatsappGroupKindLabels.complaining },
    { value: 'notifications', label: whatsappGroupKindLabels.notifications },
    { value: 'purchasing_phase', label: whatsappGroupKindLabels.purchasing_phase },
  ];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <MessageSquare size={24} />
            <Typography variant="h6">Editar Grupo WhatsApp</Typography>
          </Box>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Controller
              name="unit_id"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.unit_id}>
                  <InputLabel>Unidade *</InputLabel>
                  <Select
                    {...field}
                    label="Unidade *"
                    disabled={isLoadingUnidades}
                  >
                    {unidades.map((unidade) => (
                      <MenuItem key={unidade.id} value={unidade.id}>
                        {unidade.group_code} - {unidade.group_name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.unit_id && (
                    <FormHelperText>{errors.unit_id.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />

            <Controller
              name="kind"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.kind}>
                  <InputLabel>Tipo de Grupo *</InputLabel>
                  <Select
                    {...field}
                    label="Tipo de Grupo *"
                  >
                    {groupTypeOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.kind && (
                    <FormHelperText>{errors.kind.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />

            <Controller
              name="group_id"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  required
                  label="ID do Grupo WhatsApp"
                  error={!!errors.group_id}
                  helperText={errors.group_id?.message || 'Ex: grupo_principal_123, suporte@unidade1'}
                  placeholder="grupo_principal_123"
                />
              )}
            />

            <Box sx={{ 
              backgroundColor: 'info.light', 
              p: 2, 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'info.main'
            }}>
              <Typography variant="body2" color="info.dark">
                <strong>Importante:</strong> Cada unidade pode ter apenas um grupo de cada tipo. 
                O ID do grupo deve ser único e seguir o padrão de identificação usado no WhatsApp.
              </Typography>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} color="inherit">
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="contained"
            disabled={isUpdating}
          >
            {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};