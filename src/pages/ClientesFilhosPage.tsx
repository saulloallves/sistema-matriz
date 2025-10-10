import { useState, useMemo } from 'react';
import { Box, Chip, IconButton, CircularProgress, Card, CardContent, Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { Eye, Edit, Trash2, Users } from 'lucide-react';
import { DataTable } from '@/components/crud/DataTable';
import { useClientesFilhos, ClienteFilho } from '@/hooks/useClientesFilhos';
import { format } from 'date-fns';

interface ActionCellProps {
  row: ClienteFilho;
  onView: (filho: ClienteFilho) => void;
  onEdit: (filho: ClienteFilho) => void;
  onDelete: (filho: ClienteFilho) => void;
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
  onView: (filho: ClienteFilho) => void,
  onEdit: (filho: ClienteFilho) => void,
  onDelete: (filho: ClienteFilho) => void
): GridColDef[] {
  return [
    {
      field: 'name',
      headerName: 'Nome',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'cpf',
      headerName: 'CPF',
      width: 150,
    },
    {
      field: 'gender',
      headerName: 'Gênero',
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small"
          color={params.value === 'Masculino' ? 'primary' : 'secondary'}
        />
      ),
    },
    {
      field: 'age',
      headerName: 'Idade',
      width: 80,
    },
    {
      field: 'school_grade',
      headerName: 'Série Escolar',
      width: 150,
    },
    {
      field: 'shirt_number',
      headerName: 'Tamanho Camisa',
      width: 130,
    },
    {
      field: 'birth_date',
      headerName: 'Data Nascimento',
      width: 150,
      renderCell: (params) => params.value ? format(new Date(params.value), 'dd/MM/yyyy') : '-',
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

export default function ClientesFilhosPage() {
  const { clientesFilhos, isLoading, deleteClienteFilho } = useClientesFilhos();
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedFilho, setSelectedFilho] = useState<ClienteFilho | null>(null);

  const statsCards = useMemo(() => (
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
      <Card sx={{ flex: 1 }}>
        <CardContent sx={{ py: 2 }}>
          <Typography variant="h5">{clientesFilhos.length}</Typography>
          <Typography color="text.secondary" variant="body2">Total de Filhos</Typography>
        </CardContent>
      </Card>
      <Card sx={{ flex: 1 }}>
        <CardContent sx={{ py: 2 }}>
          <Typography variant="h5">
            {clientesFilhos.filter(f => f.gender === 'Masculino').length}
          </Typography>
          <Typography color="text.secondary" variant="body2">Masculino</Typography>
        </CardContent>
      </Card>
      <Card sx={{ flex: 1 }}>
        <CardContent sx={{ py: 2 }}>
          <Typography variant="h5">
            {clientesFilhos.filter(f => f.gender === 'Feminino').length}
          </Typography>
          <Typography color="text.secondary" variant="body2">Feminino</Typography>
        </CardContent>
      </Card>
    </Box>
  ), [clientesFilhos]);

  const handleView = (filho: ClienteFilho) => {
    setSelectedFilho(filho);
    setViewModalOpen(true);
  };

  const handleEdit = (filho: ClienteFilho) => {
    setSelectedFilho(filho);
    setEditModalOpen(true);
  };

  const handleDelete = (filho: ClienteFilho) => {
    if (window.confirm(`Tem certeza que deseja remover ${filho.name}?`)) {
      deleteClienteFilho(filho.id);
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
        data={clientesFilhos}
        onAdd={handleAdd}
        searchPlaceholder="Pesquisar filhos de clientes..."
        title="Filhos de Clientes"
        titleIcon={<Users size={32} />}
        description="Gerencie os filhos dos clientes"
        loading={isLoading}
        customCards={statsCards}
      />
    </Box>
  );
}
