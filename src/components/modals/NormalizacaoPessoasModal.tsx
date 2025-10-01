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
  Chip,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useNormalizacaoPessoas } from '@/hooks/useNormalizacaoPessoas';
import { CheckCircle, RefreshCw } from 'lucide-react';

interface NormalizacaoPessoasModalProps {
  open: boolean;
  onClose: () => void;
}

const NormalizacaoPessoasModal: React.FC<NormalizacaoPessoasModalProps> = ({
  open,
  onClose,
}) => {
  const {
    pessoasParaNormalizacao,
    isLoading,
    isNormalizandoPessoa,
    isNormalizandoTodos,
    refetch,
    normalizarPessoa,
    normalizarTodos,
  } = useNormalizacaoPessoas();

  const getTabelaLabel = (tabela: string) => {
    const labels: Record<string, string> = {
      'franqueados': 'Franqueados',
      'clientes': 'Clientes',
      'colaboradores_interno': 'Colaboradores Interno',
      'colaboradores_loja': 'Colaboradores Loja',
    };
    return labels[tabela] || tabela;
  };

  const columns: GridColDef[] = [
    {
      field: 'tabela',
      headerName: 'Tabela',
      width: 180,
      renderCell: (params) => (
        <Chip 
          label={getTabelaLabel(params.value)} 
          color="primary" 
          variant="outlined"
          size="small"
        />
      ),
    },
    {
      field: 'nome_atual',
      headerName: 'Nome Atual (Incorreto)',
      flex: 1,
      minWidth: 250,
    },
    {
      field: 'nome_normalizado',
      headerName: 'Nome Normalizado (Title Case)',
      flex: 1,
      minWidth: 250,
      renderCell: (params) => (
        <Typography variant="body2" color="success.main" fontWeight="medium">
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
          variant="contained"
          size="small"
          onClick={() => normalizarPessoa({ id: params.row.id, tabela: params.row.tabela })}
          disabled={isNormalizandoPessoa || isNormalizandoTodos}
        >
          Normalizar
        </Button>
      ),
    },
  ];

  const handleRefresh = () => {
    refetch();
  };

  const handleNormalizarTodos = () => {
    normalizarTodos();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" component="div">
            Normalização de Nomes de Pessoas
          </Typography>
          <Button
            startIcon={<RefreshCw size={18} />}
            onClick={handleRefresh}
            disabled={isLoading}
            size="small"
          >
            Atualizar
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          Esta ferramenta normaliza nomes para o formato <strong>Title Case</strong> 
          (primeira letra de cada palavra maiúscula, restante minúscula). 
          Exemplo: "MARCUS VINICIUS" → "Marcus Vinicius"
        </Alert>

        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        ) : pessoasParaNormalizacao.length > 0 ? (
          <>
            <Box display="flex" gap={2} mb={3}>
              <Card sx={{ flex: 1 }}>
                <CardContent>
                  <Typography variant="h4" color="primary">
                    {pessoasParaNormalizacao.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Nomes pendentes
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ flex: 1 }}>
                <CardContent>
                  <Typography variant="h4" color="success.main">
                    {pessoasParaNormalizacao.filter(p => p.tabela === 'franqueados').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Franqueados
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ flex: 1 }}>
                <CardContent>
                  <Typography variant="h4" color="info.main">
                    {pessoasParaNormalizacao.filter(p => p.tabela === 'clientes').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Clientes
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ flex: 1 }}>
                <CardContent>
                  <Typography variant="h4" color="warning.main">
                    {pessoasParaNormalizacao.filter(p => 
                      p.tabela === 'colaboradores_interno' || p.tabela === 'colaboradores_loja'
                    ).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Colaboradores
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            <DataGrid
              rows={pessoasParaNormalizacao}
              columns={columns}
              autoHeight
              disableRowSelectionOnClick
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 10 },
                },
              }}
              loading={isNormalizandoPessoa || isNormalizandoTodos}
              sx={{
                '& .MuiDataGrid-cell': {
                  py: 1,
                },
              }}
            />
          </>
        ) : (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight={200}
            gap={2}
          >
            <CheckCircle size={48} color="green" />
            <Typography variant="h6" color="success.main">
              Todos os nomes estão normalizados!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Não há nomes pendentes de normalização no momento.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isNormalizandoTodos}>
          Fechar
        </Button>
        {pessoasParaNormalizacao.length > 0 && (
          <Button
            variant="contained"
            onClick={handleNormalizarTodos}
            disabled={isNormalizandoTodos}
            startIcon={isNormalizandoTodos ? <CircularProgress size={20} /> : null}
          >
            {isNormalizandoTodos ? 'Normalizando...' : 'Normalizar Todos'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default NormalizacaoPessoasModal;
