import { useState, useMemo } from 'react';
import { Box, IconButton, CircularProgress, Card, CardContent, Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { Eye, Edit, Trash2, Briefcase } from 'lucide-react';
import { DataTable } from '@/components/crud/DataTable';
import { useCargosLoja, CargoLoja } from '@/hooks/useCargosLoja';

interface ActionCellProps {
  row: CargoLoja;
  onView: (cargo: CargoLoja) => void;
  onEdit: (cargo: CargoLoja) => void;
  onDelete: (cargo: CargoLoja) => void;
}

function ActionCell({ row, onView, onEdit, onDelete }: ActionCellProps) {
  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <IconButton size="small" onClick={() => onView(row)} sx={{ color: 'info.main' }}>
        <Eye size={16} />
      </IconButton>
      <IconButton size="small" onClick={() => onEdit(row)} sx={{ color: 'warning.main' }}>
        <Edit size={16} />
      </IconButton>
      <IconButton size="small" onClick={() => onDelete(row)} sx={{ color: 'error.main' }}>
        <Trash2 size={16} />
      </IconButton>
    </Box>
  );
}

function createColumns(
  onView: (cargo: CargoLoja) => void,
  onEdit: (cargo: CargoLoja) => void,
  onDelete: (cargo: CargoLoja) => void
): GridColDef[] {
  return [
    {
      field: 'role',
      headerName: 'Cargo',
      flex: 1,
      minWidth: 300,
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 120,
      sortable: false,
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

export default function CargosLojaPage() {
  const { cargos, isLoading, deleteCargo } = useCargosLoja();
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedCargo, setSelectedCargo] = useState<CargoLoja | null>(null);

  const statsCards = useMemo(() => (
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
      <Card sx={{ flex: 1 }}>
        <CardContent sx={{ py: 2 }}>
          <Typography variant="h5">{cargos.length}</Typography>
          <Typography color="text.secondary" variant="body2">Total de Cargos</Typography>
        </CardContent>
      </Card>
    </Box>
  ), [cargos]);

  const handleView = (cargo: CargoLoja) => {
    setSelectedCargo(cargo);
    setViewModalOpen(true);
  };

  const handleEdit = (cargo: CargoLoja) => {
    setSelectedCargo(cargo);
    setEditModalOpen(true);
  };

  const handleDelete = (cargo: CargoLoja) => {
    if (window.confirm(`Tem certeza que deseja remover o cargo ${cargo.role}?`)) {
      deleteCargo(cargo.id);
    }
  };

  const handleAdd = () => {
    setAddModalOpen(true);
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
        data={cargos}
        onAdd={handleAdd}
        searchPlaceholder="Pesquisar cargos..."
        title="Cargos de Loja"
        titleIcon={<Briefcase size={32} />}
        description="Gerencie os cargos disponíveis para funcionários de loja"
        loading={isLoading}
        customCards={statsCards}
      />
    </Box>
  );
}
