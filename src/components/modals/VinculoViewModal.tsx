import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
} from '@mui/material';
import { 
  Person, 
  Store, 
  Phone, 
  Business, 
  LocationOn, 
  CalendarToday,
  TrendingUp
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FranqueadoUnidade } from '@/hooks/useFranqueadosUnidades';

interface VinculoViewModalProps {
  open: boolean;
  onClose: () => void;
  vinculo: FranqueadoUnidade;
}

const VinculoViewModal = ({ open, onClose, vinculo }: VinculoViewModalProps) => {
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
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box>
          <Typography variant="h6" fontWeight="bold">
            Detalhes do Vínculo
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Visualize as informações completas do vínculo
          </Typography>
        </Box>
        <Chip 
          label={vinculo.unidade_is_active ? 'Ativo' : 'Inativo'}
          color={vinculo.unidade_is_active ? 'success' : 'error'}
          variant="outlined"
        />
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Seções do Franqueado e Unidade */}
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {/* Seção do Franqueado */}
            <Box sx={{ flex: 1, minWidth: 300 }}>
              <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Person color="primary" />
                    <Typography variant="h6" fontWeight="bold">
                      Franqueado
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Avatar 
                      src={vinculo.franqueado_profile_image || undefined}
                      sx={{ width: 64, height: 64 }}
                    >
                      {getInitials(vinculo.franqueado_full_name)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="medium">
                        {vinculo.franqueado_full_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {vinculo.franqueado_owner_type}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Phone fontSize="small" color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Contato
                      </Typography>
                      <Typography variant="body2">
                        {vinculo.franqueado_contact_masked}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Business fontSize="small" color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Status Contratual
                      </Typography>
                      <Chip 
                        label={vinculo.franqueado_is_in_contract ? 'Em Contrato' : 'Sem Contrato'}
                        size="small"
                        color={vinculo.franqueado_is_in_contract ? 'success' : 'warning'}
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Seção da Unidade */}
            <Box sx={{ flex: 1, minWidth: 300 }}>
              <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Store color="primary" />
                    <Typography variant="h6" fontWeight="bold">
                      Unidade
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" fontWeight="medium">
                      {vinculo.unidade_group_code} - {vinculo.unidade_group_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {vinculo.unidade_fantasy_name || 'Nome fantasia não informado'}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <LocationOn fontSize="small" color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Localização
                      </Typography>
                      <Typography variant="body2">
                        {vinculo.unidade_city}, {vinculo.unidade_state}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Business fontSize="small" color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Modelo da Loja
                      </Typography>
                      <Typography variant="body2">
                        {vinculo.unidade_store_model}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <TrendingUp fontSize="small" color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Fase da Loja
                      </Typography>
                      <Chip 
                        label={vinculo.unidade_store_phase}
                        size="small"
                        color={vinculo.unidade_store_phase === 'operacao' ? 'success' : 'warning'}
                        variant="outlined"
                      />
                    </Box>
                  </Box>

                  {vinculo.unidade_cnpj && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Business fontSize="small" color="action" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          CNPJ
                        </Typography>
                        <Typography variant="body2" fontFamily="monospace">
                          {vinculo.unidade_cnpj}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Informações do Vínculo */}
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <CalendarToday color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Informações do Vínculo
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Data de Criação
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {format(new Date(vinculo.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Última Atualização
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {format(new Date(vinculo.updated_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    ID do Vínculo
                  </Typography>
                  <Typography variant="body1" fontFamily="monospace">
                    #{vinculo.id}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip 
                    label={vinculo.unidade_is_active ? 'Vínculo Ativo' : 'Vínculo Inativo'}
                    color={vinculo.unidade_is_active ? 'success' : 'error'}
                    variant="outlined"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="contained">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VinculoViewModal;