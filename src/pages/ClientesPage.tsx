import { useState, useMemo } from 'react';
import { Box, Chip, IconButton, CircularProgress, Card, CardContent, Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { Eye, Edit, Trash2, Users } from 'lucide-react';
import { DataTable } from '@/components/crud/DataTable';
import { useClientes, Cliente } from '@/hooks/useClientes';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface ActionCellProps {
  row: Cliente;
  onView: (cliente: Cliente) => void;
  onEdit: (cliente: Cliente) => void;
  onDelete: (cliente: Cliente) => void;
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
  onView: (cliente: Cliente) => void,
  onEdit: (cliente: Cliente) => void,
  onDelete: (cliente: Cliente) => void
): GridColDef[] {
  return [
    {
      field: 'full_name',
      headerName: 'Nome Completo',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'cpf_rnm',
      headerName: 'CPF/RNM',
      width: 150,
    },
    {
      field: 'phone',
      headerName: 'Telefone',
      width: 140,
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'city',
      headerName: 'Cidade',
      width: 150,
    },
    {
      field: 'state',
      headerName: 'Estado',
      width: 100,
    },
    {
      field: 'created_at',
      headerName: 'Data de Cadastro',
      width: 150,
      renderCell: (params) => format(new Date(params.value), 'dd/MM/yyyy'),
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

export default function ClientesPage() {
  const { clientes, isLoading, deleteCliente } = useClientes();
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

  const statsCards = useMemo(() => (
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
      <Card sx={{ flex: 1 }}>
        <CardContent sx={{ py: 2 }}>
          <Typography variant="h5">{clientes.length}</Typography>
          <Typography color="text.secondary" variant="body2">Total de Clientes</Typography>
        </CardContent>
      </Card>
    </Box>
  ), [clientes]);

  const handleView = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setViewModalOpen(true);
  };

  const handleEdit = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setEditModalOpen(true);
  };

  const handleDelete = (cliente: Cliente) => {
    if (window.confirm(`Tem certeza que deseja remover o cliente ${cliente.full_name}?`)) {
      deleteCliente(cliente.id);
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
        data={clientes}
        onAdd={handleAdd}
        searchPlaceholder="Pesquisar clientes..."
        title="Clientes"
        titleIcon={<Users size={32} />}
        description="Gerencie os clientes das unidades"
        loading={isLoading}
        customCards={statsCards}
      />
    </Box>
  );
}
