import { useState, useMemo } from 'react';
import { Box, IconButton, CircularProgress, Card, CardContent, Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { Eye, Edit, Trash2, Shield } from 'lucide-react';
import { DataTable } from '@/components/crud/DataTable';
import { usePermissoes, Permissao } from '@/hooks/usePermissoes';

interface ActionCellProps {
  row: Permissao;
  onView: (permissao: Permissao) => void;
  onEdit: (permissao: Permissao) => void;
  onDelete: (permissao: Permissao) => void;
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
  onView: (permissao: Permissao) => void,
  onEdit: (permissao: Permissao) => void,
  onDelete: (permissao: Permissao) => void
): GridColDef[] {
  return [
    {
      field: 'level',
      headerName: 'Nível de Permissão',
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

export default function PermissoesPage() {
  const { permissoes, isLoading, deletePermissao } = usePermissoes();
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedPermissao, setSelectedPermissao] = useState<Permissao | null>(null);

  const statsCards = useMemo(() => (
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
      <Card sx={{ flex: 1 }}>
        <CardContent sx={{ py: 2 }}>
          <Typography variant="h5">{permissoes.length}</Typography>
          <Typography color="text.secondary" variant="body2">Total de Permissões</Typography>
        </CardContent>
      </Card>
    </Box>
  ), [permissoes]);

  const handleView = (permissao: Permissao) => {
    setSelectedPermissao(permissao);
    setViewModalOpen(true);
  };

  const handleEdit = (permissao: Permissao) => {
    setSelectedPermissao(permissao);
    setEditModalOpen(true);
  };

  const handleDelete = (permissao: Permissao) => {
    if (window.confirm(`Tem certeza que deseja remover a permissão ${permissao.level}?`)) {
      deletePermissao(permissao.id);
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
        data={permissoes}
        onAdd={handleAdd}
        searchPlaceholder="Pesquisar permissões..."
        title="Permissões"
        titleIcon={<Shield size={32} />}
        description="Gerencie os níveis de permissão do sistema"
        loading={isLoading}
        customCards={statsCards}
      />
    </Box>
  );
}
