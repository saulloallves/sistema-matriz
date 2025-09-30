import { useState, useMemo } from 'react';
import { Box, Chip, IconButton, CircularProgress, Card, CardContent, Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { Eye, Edit, Trash2, Key, Check, X } from 'lucide-react';
import { DataTable } from '@/components/crud/DataTable';
import { useSenhas, Senha } from '@/hooks/useSenhas';
import { format } from 'date-fns';

interface ActionCellProps {
  row: Senha;
  onView: (senha: Senha) => void;
  onEdit: (senha: Senha) => void;
  onDelete: (senha: Senha) => void;
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
  onView: (senha: Senha) => void,
  onEdit: (senha: Senha) => void,
  onDelete: (senha: Senha) => void
): GridColDef[] {
  return [
    {
      field: 'platform',
      headerName: 'Plataforma',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'login',
      headerName: 'Login',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'password',
      headerName: 'Senha',
      width: 150,
      renderCell: () => '••••••••',
    },
    {
      field: 'a2f_active',
      headerName: '2FA',
      width: 100,
      renderCell: (params) => (
        <Chip
          icon={params.value ? <Check size={16} /> : <X size={16} />}
          label={params.value ? 'Ativo' : 'Inativo'}
          color={params.value ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'updated_at',
      headerName: 'Última Atualização',
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

export default function SenhasPage() {
  const { senhas, isLoading, deleteSenha } = useSenhas();
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedSenha, setSelectedSenha] = useState<Senha | null>(null);

  const statsCards = useMemo(() => (
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
      <Card sx={{ flex: 1 }}>
        <CardContent sx={{ py: 2 }}>
          <Typography variant="h5">{senhas.length}</Typography>
          <Typography color="text.secondary" variant="body2">Total de Senhas</Typography>
        </CardContent>
      </Card>
      <Card sx={{ flex: 1 }}>
        <CardContent sx={{ py: 2 }}>
          <Typography variant="h5">
            {senhas.filter(s => s.a2f_active).length}
          </Typography>
          <Typography color="text.secondary" variant="body2">Com 2FA Ativo</Typography>
        </CardContent>
      </Card>
    </Box>
  ), [senhas]);

  const handleView = (senha: Senha) => {
    setSelectedSenha(senha);
    setViewModalOpen(true);
  };

  const handleEdit = (senha: Senha) => {
    setSelectedSenha(senha);
    setEditModalOpen(true);
  };

  const handleDelete = (senha: Senha) => {
    if (window.confirm(`Tem certeza que deseja remover a senha de ${senha.platform}?`)) {
      deleteSenha(senha.id);
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
        data={senhas}
        onAdd={handleAdd}
        searchPlaceholder="Pesquisar senhas..."
        title="Gerenciador de Senhas"
        titleIcon={<Key size={32} />}
        description="Gerencie as credenciais de acesso dos sistemas corporativos"
        loading={isLoading}
        customCards={statsCards}
      />
    </Box>
  );
}
