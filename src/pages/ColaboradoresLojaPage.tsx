import { useState, useMemo } from 'react';
import { Box, Chip, IconButton, CircularProgress, Card, CardContent, Typography, Menu, MenuItem } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { Eye, Edit, Trash2, Users, Check, X, MoreHorizontal } from 'lucide-react';
import { DataTable } from '@/components/crud/DataTable';
import { useColaboradoresLoja, ColaboradorLoja } from '@/hooks/useColaboradoresLoja';
import { ColaboradorLojaAddModal } from '@/components/modals/ColaboradorLojaAddModal';
import { ColaboradorLojaEditModal } from '@/components/modals/ColaboradorLojaEditModal';
import { ColaboradorLojaViewModal } from '@/components/modals/ColaboradorLojaViewModal';
import { format } from 'date-fns';
import { formatCurrency } from '@/utils/formatters';

interface ActionCellProps {
  row: ColaboradorLoja;
  onView: (colab: ColaboradorLoja) => void;
  onEdit: (colab: ColaboradorLoja) => void;
  onDelete: (colab: ColaboradorLoja) => void;
}

function ActionCell({ row, onView, onEdit, onDelete }: ActionCellProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action: () => void) => {
    action();
    handleClose();
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <IconButton size="small" onClick={handleClick}>
        <MoreHorizontal size={16} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={() => handleAction(() => onView(row))}>
          <Eye size={16} style={{ marginRight: 8 }} />
          Visualizar
        </MenuItem>
        <MenuItem onClick={() => handleAction(() => onEdit(row))}>
          <Edit size={16} style={{ marginRight: 8 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={() => handleAction(() => onDelete(row))}>
          <Trash2 size={16} style={{ marginRight: 8 }} />
          Excluir
        </MenuItem>
      </Menu>
    </Box>
  );
}

function createColumns(
  onView: (colab: ColaboradorLoja) => void,
  onEdit: (colab: ColaboradorLoja) => void,
  onDelete: (colab: ColaboradorLoja) => void
): GridColDef[] {
  return [
    {
      field: 'employee_name',
      headerName: 'Nome',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'cpf',
      headerName: 'CPF',
      width: 140,
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'phone',
      headerName: 'Telefone',
      width: 140,
    },
    {
      field: 'admission_date',
      headerName: 'Data Admissão',
      width: 130,
      renderCell: (params) => params.value ? format(new Date(params.value), 'dd/MM/yyyy') : '-',
    },
    {
      field: 'salary',
      headerName: 'Salário',
      width: 120,
      renderCell: (params) => formatCurrency(params.value),
    },
    {
      field: 'health_plan',
      headerName: 'Plano de Saúde',
      width: 140,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          icon={params.value ? <Check size={16} /> : <X size={16} />}
          label={params.value ? 'Sim' : 'Não'}
          color={params.value ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 120,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <ActionCell
          row={params.row}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ),
    },
  ];
}

export default function ColaboradoresLojaPage() {
  const { 
    colaboradores, 
    isLoading, 
    deleteColaborador, 
    createColaborador, 
    updateColaborador,
    isCreating,
    isUpdating
  } = useColaboradoresLoja();
  
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedColaborador, setSelectedColaborador] = useState<ColaboradorLoja | null>(null);

  const statsCards = useMemo(() => (
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
      <Card sx={{ flex: 1 }}>
        <CardContent sx={{ py: 2 }}>
          <Typography variant="h5">{colaboradores.length}</Typography>
          <Typography color="text.secondary" variant="body2">Total de Colaboradores</Typography>
        </CardContent>
      </Card>
      <Card sx={{ flex: 1 }}>
        <CardContent sx={{ py: 2 }}>
          <Typography variant="h5">
            {colaboradores.filter(c => c.health_plan).length}
          </Typography>
          <Typography color="text.secondary" variant="body2">Com Plano de Saúde</Typography>
        </CardContent>
      </Card>
      <Card sx={{ flex: 1 }}>
        <CardContent sx={{ py: 2 }}>
          <Typography variant="h5">
            {colaboradores.filter(c => c.meal_voucher_active).length}
          </Typography>
          <Typography color="text.secondary" variant="body2">Com Vale Refeição</Typography>
        </CardContent>
      </Card>
    </Box>
  ), [colaboradores]);

  const handleView = (colab: ColaboradorLoja) => {
    setSelectedColaborador(colab);
    setViewModalOpen(true);
  };

  const handleEdit = (colab: ColaboradorLoja) => {
    setSelectedColaborador(colab);
    setEditModalOpen(true);
  };

  const handleDelete = (colab: ColaboradorLoja) => {
    if (window.confirm(`Tem certeza que deseja remover o colaborador ${colab.employee_name}?`)) {
      deleteColaborador(colab.id);
    }
  };

  const handleAdd = () => {
    setAddModalOpen(true);
  };

  const handleSaveNew = (data: any) => {
    createColaborador(data, {
      onSuccess: () => setAddModalOpen(false)
    });
  };

  const handleSaveUpdate = (data: any) => {
    if (!selectedColaborador) return;
    updateColaborador({ id: selectedColaborador.id, ...data }, {
      onSuccess: () => setEditModalOpen(false)
    });
  };

  const columns = createColumns(handleView, handleEdit, handleDelete);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
      <DataTable
        columns={columns}
        data={colaboradores}
        onAdd={handleAdd}
        searchPlaceholder="Pesquisar colaboradores de loja..."
        title="Colaboradores de Loja"
        titleIcon={<Users size={32} />}
        description="Gerencie os funcionários das lojas/unidades"
        loading={isLoading}
        customCards={statsCards}
      />

      <ColaboradorLojaAddModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleSaveNew}
        isLoading={isCreating}
      />

      {selectedColaborador && (
        <>
          <ColaboradorLojaEditModal
            open={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            colaborador={selectedColaborador}
            onSave={handleSaveUpdate}
            isLoading={isUpdating}
          />
          <ColaboradorLojaViewModal
            open={viewModalOpen}
            onClose={() => setViewModalOpen(false)}
            colaborador={selectedColaborador}
            onEdit={() => {
              setViewModalOpen(false);
              handleEdit(selectedColaborador);
            }}
          />
        </>
      )}
    </Box>
  );
}