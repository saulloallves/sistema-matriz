import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useGeracaoSenhas } from '@/hooks/useGeracaoSenhas';
import { Key, CheckCircle, RefreshCw } from 'lucide-react';

interface GeracaoSenhasModalProps {
  open: boolean;
  onClose: () => void;
}

export function GeracaoSenhasModal({ open, onClose }: GeracaoSenhasModalProps) {
  const {
    franqueados,
    isLoading,
    isGerandoSenha,
    isGerandoTodas,
    refetch,
    gerarSenha,
    gerarTodasAsSenhas,
  } = useGeracaoSenhas();

  const columns: GridColDef[] = [
    {
      field: 'franqueado_nome',
      headerName: 'Franqueado',
      flex: 1,
      minWidth: 250,
    },
    {
      field: 'unidade_group_code',
      headerName: 'Código da Unidade Principal',
      width: 220,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 150,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          onClick={() => gerarSenha(params.row.franqueado_id)}
          disabled={isGerandoSenha || isGerandoTodas}
        >
          Gerar Senha
        </Button>
      ),
    },
  ];

  const handleRefresh = () => {
    refetch();
  };

  const handleGerarTodas = () => {
    gerarTodasAsSenhas();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Key size={24} />
          Geração de Senhas para Franqueados
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 2 }}>
          <Alert severity="info">
            Esta ferramenta lista todos os franqueados que possuem unidades vinculadas mas ainda não têm uma senha de sistema (`systems_password`). A senha é gerada com base no código da primeira unidade vinculada.
          </Alert>

          {isLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : franqueados.length > 0 ? (
            <>
              <Box display="flex" gap={2} mb={2}>
                <Card sx={{ flex: 1 }}>
                  <CardContent>
                    <Typography variant="h6" color="error">
                      {franqueados.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Franqueados sem senha
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              <Box sx={{ height: 400, width: '100%' }}>
                <DataGrid
                  rows={franqueados}
                  columns={columns}
                  getRowId={(row) => row.franqueado_id}
                  pageSizeOptions={[5, 10, 25]}
                  initialState={{
                    pagination: { paginationModel: { pageSize: 10 } },
                  }}
                  disableRowSelectionOnClick
                  loading={isGerandoSenha || isGerandoTodas}
                />
              </Box>
            </>
          ) : (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              py={6}
              gap={2}
            >
              <CheckCircle size={64} color="#4caf50" />
              <Typography variant="h6" color="success.main">
                Tudo certo por aqui!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Todos os franqueados elegíveis já possuem uma senha de sistema.
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleRefresh}
          startIcon={<RefreshCw size={16} />}
          disabled={isLoading || isGerandoSenha || isGerandoTodas}
        >
          Atualizar
        </Button>

        {franqueados.length > 0 && (
          <Button
            onClick={handleGerarTodas}
            variant="contained"
            color="primary"
            disabled={isGerandoSenha || isGerandoTodas}
            startIcon={isGerandoTodas ? <CircularProgress size={16} /> : <Key size={16} />}
          >
            {isGerandoTodas ? 'Gerando...' : 'Gerar Todas as Senhas'}
          </Button>
        )}

        <Button onClick={onClose} variant="outlined">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}