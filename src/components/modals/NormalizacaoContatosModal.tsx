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
import { useNormalizacaoContatos } from '@/hooks/useNormalizacaoContatos';
import { Phone, CheckCircle, RefreshCw } from 'lucide-react';

interface NormalizacaoContatosModalProps {
  open: boolean;
  onClose: () => void;
}

export function NormalizacaoContatosModal({ open, onClose }: NormalizacaoContatosModalProps) {
  const {
    contatosParaNormalizacao,
    isLoading,
    isNormalizandoContato,
    isNormalizandoTodas,
    refetch,
    normalizarContato,
    normalizarTodos,
  } = useNormalizacaoContatos();

  const columns: GridColDef[] = [
    {
      field: 'nome_franqueado',
      headerName: 'Franqueado',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'contato_atual',
      headerName: 'Contato Atual (Incorreto)',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{
            color: 'error.main',
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'contato_normalizado',
      headerName: 'Contato Normalizado',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{
            color: 'success.main',
            fontWeight: 'bold',
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Button
          size="small"
          variant="outlined"
          color="primary"
          disabled={isNormalizandoContato || isNormalizandoTodas}
          onClick={() => normalizarContato(params.row.franqueado_id)}
        >
          Normalizar
        </Button>
      ),
    },
  ];

  const handleRefresh = () => {
    refetch();
  };

  const handleNormalizarTodas = async () => {
    await normalizarTodos();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Phone size={24} />
          Normalização de Contatos dos Franqueados
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 2 }}>
          <Alert severity="info">
            Esta ferramenta identifica e corrige contatos que contêm caracteres especiais,
            deixando apenas números. Exemplo: (11) 98765-4321 → 11987654321
          </Alert>

          {isLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : contatosParaNormalizacao.length > 0 ? (
            <>
              <Box display="flex" gap={2} mb={2}>
                <Card sx={{ flex: 1 }}>
                  <CardContent>
                    <Typography variant="h6" color="error">
                      {contatosParaNormalizacao.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Contatos com formatação incorreta
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              <Box sx={{ height: 400, width: '100%' }}>
                <DataGrid
                  rows={contatosParaNormalizacao}
                  columns={columns}
                  getRowId={(row) => row.franqueado_id}
                  pageSizeOptions={[5, 10, 25]}
                  initialState={{
                    pagination: { paginationModel: { pageSize: 10 } },
                  }}
                  disableRowSelectionOnClick
                  loading={isNormalizandoContato || isNormalizandoTodas}
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
                Todos os contatos estão normalizados!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Não há contatos com caracteres especiais para corrigir.
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleRefresh}
          startIcon={<RefreshCw size={16} />}
          disabled={isLoading || isNormalizandoContato || isNormalizandoTodas}
        >
          Atualizar
        </Button>

        {contatosParaNormalizacao.length > 0 && (
          <Button
            onClick={handleNormalizarTodas}
            variant="contained"
            color="primary"
            disabled={isNormalizandoContato || isNormalizandoTodas}
            startIcon={isNormalizandoTodas ? <CircularProgress size={16} /> : <Phone size={16} />}
          >
            {isNormalizandoTodas ? 'Normalizando...' : 'Normalizar Todos'}
          </Button>
        )}

        <Button onClick={onClose} variant="outlined">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}