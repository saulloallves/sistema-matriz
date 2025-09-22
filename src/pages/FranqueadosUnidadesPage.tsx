import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Button,
  Avatar,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add, 
  Visibility, 
  Edit, 
  Delete,
  Link as LinkIcon,
  Store,
  Person as User,
  TrendingUp
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { useFranqueadosUnidades, FranqueadoUnidade } from '@/hooks/useFranqueadosUnidades';
import { useUserRole } from '@/hooks/useFranqueados';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import VinculoAddModal from '@/components/modals/VinculoAddModal';
import VinculoEditModal from '@/components/modals/VinculoEditModal';
import VinculoViewModal from '@/components/modals/VinculoViewModal';

const FranqueadosUnidadesPage = () => {
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [selectedVinculo, setSelectedVinculo] = useState<FranqueadoUnidade | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { 
    vinculos, 
    isLoading, 
    deleteVinculo, 
    isDeleting 
  } = useFranqueadosUnidades();
  const { isAdmin } = useUserRole();

  // Estatísticas
  const totalVinculos = vinculos.length;
  const vinculosAtivos = vinculos.filter(v => v.unidade_is_active).length;
  const franqueadosVinculados = new Set(vinculos.map(v => v.franqueado_id)).size;
  const unidadesVinculadas = new Set(vinculos.map(v => v.unidade_id)).size;

  // Filtrar dados baseado na busca
  const filteredVinculos = vinculos.filter(vinculo =>
    vinculo.franqueado_full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vinculo.unidade_group_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vinculo.unidade_group_code.toString().includes(searchTerm) ||
    (vinculo.unidade_city && vinculo.unidade_city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleView = (vinculo: FranqueadoUnidade) => {
    setSelectedVinculo(vinculo);
    setOpenViewModal(true);
  };

  const handleEdit = (vinculo: FranqueadoUnidade) => {
    setSelectedVinculo(vinculo);
    setOpenEditModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja remover este vínculo?')) {
      await deleteVinculo(id);
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

  const columns: GridColDef[] = [
    {
      field: 'franqueado',
      headerName: 'Franqueado',
      width: 280,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar 
            src={params.row.franqueado_profile_image || undefined}
            sx={{ width: 40, height: 40 }}
          >
            {getInitials(params.row.franqueado_full_name)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {params.row.franqueado_full_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.franqueado_contact_masked}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'unidade',
      headerName: 'Unidade',
      width: 300,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.row.unidade_group_code} - {params.row.unidade_group_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.unidade_city}, {params.row.unidade_state}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'franqueado_owner_type',
      headerName: 'Tipo',
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.row.franqueado_owner_type} 
          size="small" 
          variant="outlined"
          color="primary"
        />
      ),
    },
    {
      field: 'unidade_store_phase',
      headerName: 'Fase da Loja',
      width: 130,
      renderCell: (params) => (
        <Chip 
          label={params.row.unidade_store_phase} 
          size="small" 
          variant="outlined"
          color={params.row.unidade_store_phase === 'operacao' ? 'success' : 'warning'}
        />
      ),
    },
    {
      field: 'created_at',
      headerName: 'Criado em',
      width: 120,
      renderCell: (params) => (
        <Typography variant="caption">
          {format(new Date(params.row.created_at), 'dd/MM/yyyy', { locale: ptBR })}
        </Typography>
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Ações',
      width: 120,
      getActions: (params) => {
        const actions = [
          <GridActionsCellItem
            key="view"
            icon={
              <Tooltip title="Visualizar">
                <Visibility />
              </Tooltip>
            }
            label="Visualizar"
            onClick={() => handleView(params.row)}
          />,
        ];

        if (isAdmin) {
          actions.push(
            <GridActionsCellItem
              key="edit"
              icon={
                <Tooltip title="Editar">
                  <Edit />
                </Tooltip>
              }
              label="Editar"
              onClick={() => handleEdit(params.row)}
            />,
            <GridActionsCellItem
              key="delete"
              icon={
                <Tooltip title="Remover">
                  <Delete />
                </Tooltip>
              }
              label="Remover"
              onClick={() => handleDelete(params.row.id)}
              disabled={isDeleting}
            />
          );
        }

        return actions;
      },
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3 
      }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Vínculos Franqueados-Unidades
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gerencie os vínculos entre franqueados e suas unidades
          </Typography>
        </Box>
        
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenAddModal(true)}
            sx={{ borderRadius: 2 }}
          >
            Novo Vínculo
          </Button>
        )}
      </Box>

      {/* Cards de Estatísticas */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1, minWidth: 250 }}>
          <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                  }}
                >
                  <LinkIcon />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {totalVinculos}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total de Vínculos
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: 1, minWidth: 250 }}>
          <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: 'success.light',
                    color: 'success.contrastText',
                  }}
                >
                  <TrendingUp />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {vinculosAtivos}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Vínculos Ativos
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: 1, minWidth: 250 }}>
          <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: 'info.light',
                    color: 'info.contrastText',
                  }}
                >
                  <User />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {franqueadosVinculados}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Franqueados Vinculados
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: 1, minWidth: 250 }}>
          <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: 'warning.light',
                    color: 'warning.contrastText',
                  }}
                >
                  <Store />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {unidadesVinculadas}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Unidades Vinculadas
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* DataGrid */}
      <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <DataGrid
          rows={filteredVinculos}
          columns={columns}
          loading={isLoading}
          disableRowSelectionOnClick
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[10, 25, 50]}
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': {
              borderColor: 'divider',
            },
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: 'grey.50',
              borderColor: 'divider',
            },
          }}
        />
      </Card>

      {/* Modais */}
      <VinculoAddModal
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
      />

      {selectedVinculo && (
        <>
          <VinculoEditModal
            open={openEditModal}
            onClose={() => {
              setOpenEditModal(false);
              setSelectedVinculo(null);
            }}
            vinculo={selectedVinculo}
          />

          <VinculoViewModal
            open={openViewModal}
            onClose={() => {
              setOpenViewModal(false);
              setSelectedVinculo(null);
            }}
            vinculo={selectedVinculo}
          />
        </>
      )}
    </Box>
  );
};

export default FranqueadosUnidadesPage;