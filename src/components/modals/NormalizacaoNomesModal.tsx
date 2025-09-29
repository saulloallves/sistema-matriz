import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
} from '@mui/material';
import { Button, Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { RefreshCw, Database, CheckCircle } from 'lucide-react';
import { useNormalizacaoUnidades } from '@/hooks/useNormalizacaoUnidades';

interface NormalizacaoNomesModalProps {
  open: boolean;
  onClose: () => void;
}

export const NormalizacaoNomesModal: React.FC<NormalizacaoNomesModalProps> = ({
  open,
  onClose,
}) => {
  const {
    unidadesParaNormalizacao,
    isLoading,
    refetch,
    normalizarUnidade,
    normalizarTodas,
    isNormalizandoUnidade,
    isNormalizandoTodas,
  } = useNormalizacaoUnidades();

  const columns: GridColDef[] = [
    {
      field: 'group_code',
      headerName: 'Código',
      width: 100,
      type: 'number',
    },
    {
      field: 'nome_atual',
      headerName: 'Nome Atual (Incorreto)',
      flex: 1,
      minWidth: 250,
      renderCell: (params) => (
        <Box sx={{ color: 'error.main', fontWeight: 'medium' }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: 'nome_correto',
      headerName: 'Nome Correto',
      flex: 1,
      minWidth: 250,
      renderCell: (params) => (
        <Box sx={{ color: 'success.main', fontWeight: 'medium' }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Button
          size="small"
          variant="outlined"
          color="primary"
          onClick={() => normalizarUnidade(params.row.group_code)}
          disabled={isNormalizandoUnidade || isNormalizandoTodas}
          startIcon={<CheckCircle size={16} />}
        >
          Normalizar
        </Button>
      ),
    },
  ];

  const handleRefresh = () => {
    refetch();
  };

  const handleNormalizarTodas = () => {
    if (unidadesParaNormalizacao.length > 0) {
      normalizarTodas();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '600px' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Database size={24} />
          Normalização de Nomes das Unidades
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Esta funcionalidade identifica unidades com nomes divergentes entre as tabelas 
            'unidades' e 'unidades_old', permitindo normalizar os nomes com base nos dados 
            corretos da tabela 'unidades_old'.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Card variant="outlined" sx={{ flex: 1 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {unidadesParaNormalizacao.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Unidades para Normalizar
                </Typography>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ flex: 1 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Chip
                  label={unidadesParaNormalizacao.length === 0 ? "Tudo Normalizado" : "Normalização Pendente"}
                  color={unidadesParaNormalizacao.length === 0 ? "success" : "warning"}
                  variant="outlined"
                />
              </CardContent>
            </Card>
          </Box>
        </Box>

        {isLoading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography>Carregando unidades...</Typography>
          </Box>
        ) : unidadesParaNormalizacao.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle size={48} color="green" />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Todas as unidades estão normalizadas!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Não há divergências entre os nomes nas tabelas.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={unidadesParaNormalizacao}
              columns={columns}
              getRowId={(row) => row.group_code}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
              }}
              pageSizeOptions={[10, 25, 50]}
              disableRowSelectionOnClick
              sx={{
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button 
          onClick={handleRefresh}
          startIcon={<RefreshCw size={16} />}
          disabled={isLoading}
        >
          Atualizar
        </Button>
        
        {unidadesParaNormalizacao.length > 0 && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleNormalizarTodas}
            disabled={isNormalizandoTodas || isNormalizandoUnidade}
            startIcon={<Database size={16} />}
          >
            {isNormalizandoTodas ? 'Normalizando...' : `Normalizar Todas (${unidadesParaNormalizacao.length})`}
          </Button>
        )}
        
        <Button onClick={onClose} variant="outlined">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};