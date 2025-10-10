import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Autocomplete,
  TextField,
  Card,
  CardContent,
  Avatar,
  Chip,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFranqueadosUnidades, FranqueadoUnidade, CreateFranqueadoUnidadeData } from '@/hooks/useFranqueadosUnidades';

const vinculoEditSchema = z.object({
  franqueado_id: z.string().min(1, 'Selecione um franqueado'),
  unidade_id: z.string().min(1, 'Selecione uma unidade'),
});

interface VinculoEditModalProps {
  open: boolean;
  onClose: () => void;
  vinculo: FranqueadoUnidade;
}

const VinculoEditModal = ({ open, onClose, vinculo }: VinculoEditModalProps) => {
  const [selectedFranqueado, setSelectedFranqueado] = useState<any>(null);
  const [selectedUnidade, setSelectedUnidade] = useState<any>(null);

  const { 
    franqueadosDisponiveis, 
    unidadesDisponiveis, 
    updateVinculo, 
    isUpdating 
  } = useFranqueadosUnidades();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateFranqueadoUnidadeData>({
    resolver: zodResolver(vinculoEditSchema),
    defaultValues: {
      franqueado_id: vinculo.franqueado_id,
      unidade_id: vinculo.unidade_id,
    },
  });

  useEffect(() => {
    if (open && vinculo) {
      // Encontrar o franqueado selecionado
      const franqueado = franqueadosDisponiveis.find(f => f.id === vinculo.franqueado_id);
      setSelectedFranqueado(franqueado || null);
      setValue('franqueado_id', vinculo.franqueado_id);

      // Encontrar a unidade selecionada
      const unidade = unidadesDisponiveis.find(u => u.id === vinculo.unidade_id);
      setSelectedUnidade(unidade || null);
      setValue('unidade_id', vinculo.unidade_id);
    }
  }, [open, vinculo, franqueadosDisponiveis, unidadesDisponiveis, setValue]);

  const handleClose = () => {
    reset();
    setSelectedFranqueado(null);
    setSelectedUnidade(null);
    onClose();
  };

  const onSubmit = async (data: CreateFranqueadoUnidadeData) => {
    try {
      await updateVinculo({ 
        id: vinculo.id, 
        data: {
          franqueado_id: data.franqueado_id,
          unidade_id: data.unidade_id,
        }
      });
      handleClose();
    } catch (error) {
      console.error('Error updating vinculo:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          Editar Vínculo
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Altere o franqueado ou unidade deste vínculo
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Seleções */}
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              {/* Seleção de Franqueado */}
              <Box sx={{ flex: 1, minWidth: 300 }}>
                <Typography variant="subtitle2" gutterBottom fontWeight="medium">
                  Franqueado *
                </Typography>
                <Controller
                  name="franqueado_id"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      options={franqueadosDisponiveis}
                      getOptionLabel={(option) => option.full_name || ''}
                      value={selectedFranqueado}
                      onChange={(_, value) => {
                        setSelectedFranqueado(value);
                        field.onChange(value?.id || '');
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Buscar franqueado..."
                          error={!!errors.franqueado_id}
                          helperText={errors.franqueado_id?.message}
                          fullWidth
                        />
                      )}
                      renderOption={(props, option) => (
                        <Box component="li" {...props}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                            <Avatar 
                              src={option.profile_image || undefined}
                              sx={{ width: 32, height: 32 }}
                            >
                              {getInitials(option.full_name)}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" fontWeight="medium">
                                {option.full_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {option.contact_masked} • {option.owner_type}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      )}
                      noOptionsText="Nenhum franqueado encontrado"
                    />
                  )}
                />
              </Box>

              {/* Seleção de Unidade */}
              <Box sx={{ flex: 1, minWidth: 300 }}>
                <Typography variant="subtitle2" gutterBottom fontWeight="medium">
                  Unidade *
                </Typography>
                <Controller
                  name="unidade_id"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      options={unidadesDisponiveis}
                      getOptionLabel={(option) => `${option.group_code} - ${option.group_name}` || ''}
                      value={selectedUnidade}
                      onChange={(_, value) => {
                        setSelectedUnidade(value);
                        field.onChange(value?.id || '');
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Buscar unidade..."
                          error={!!errors.unidade_id}
                          helperText={errors.unidade_id?.message}
                          fullWidth
                        />
                      )}
                      renderOption={(props, option) => (
                        <Box component="li" {...props}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" fontWeight="medium">
                                {option.group_code} - {option.group_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {option.city}, {option.state} • {option.store_model}
                              </Typography>
                            </Box>
                            <Chip 
                              label={option.store_phase} 
                              size="small" 
                              variant="outlined"
                              color={option.store_phase === 'operacao' ? 'success' : 'warning'}
                            />
                          </Box>
                        </Box>
                      )}
                      noOptionsText="Nenhuma unidade encontrada"
                    />
                  )}
                />
              </Box>
            </Box>

            {/* Preview da Seleção Atual */}
            {(selectedFranqueado || selectedUnidade) && (
              <Box>
                <Typography variant="subtitle2" gutterBottom fontWeight="medium">
                  Preview do Vínculo Atualizado
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {selectedFranqueado && (
                    <Box sx={{ flex: 1, minWidth: 280 }}>
                      <Card variant="outlined" sx={{ borderRadius: 2 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar 
                              src={selectedFranqueado.profile_image || undefined}
                              sx={{ width: 48, height: 48 }}
                            >
                              {getInitials(selectedFranqueado.full_name)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {selectedFranqueado.full_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {selectedFranqueado.contact_masked}
                              </Typography>
                              <br />
                              <Chip 
                                label={selectedFranqueado.owner_type} 
                                size="small" 
                                variant="outlined"
                                color="primary"
                              />
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Box>
                  )}

                  {selectedUnidade && (
                    <Box sx={{ flex: 1, minWidth: 280 }}>
                      <Card variant="outlined" sx={{ borderRadius: 2 }}>
                        <CardContent>
                          <Typography variant="body2" fontWeight="medium">
                            {selectedUnidade.group_code} - {selectedUnidade.group_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {selectedUnidade.city}, {selectedUnidade.state}
                          </Typography>
                          <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                            <Chip 
                              label={selectedUnidade.store_model} 
                              size="small" 
                              variant="outlined"
                            />
                            <Chip 
                              label={selectedUnidade.store_phase} 
                              size="small" 
                              variant="outlined"
                              color={selectedUnidade.store_phase === 'operacao' ? 'success' : 'warning'}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={handleClose} 
            variant="outlined"
            disabled={isUpdating}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isUpdating}
            sx={{ minWidth: 120 }}
          >
            {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default VinculoEditModal;