import { useState, useMemo } from 'react';
import { Box, Chip, IconButton, CircularProgress, Card, CardContent, Typography } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { Eye, Edit, Trash2, UserCog, Check, X } from 'lucide-react';
import { DataTable } from '@/components/crud/DataTable';
import { useColaboradoresInterno, ColaboradorInterno } from '@/hooks/useColaboradoresInterno';
import { format } from 'date-fns';
import ColaboradorInternoViewModal from '@/components/modals/ColaboradorInternoViewModal';
import ColaboradorInternoAddModal from '@/components/modals/ColaboradorInternoAddModal';
import toast from 'react-hot-toast';

interface ActionCellProps {
  row: ColaboradorInterno;
  onView: (colab: ColaboradorInterno) => void;
  onEdit: (colab: ColaboradorInterno) => void;
  onDelete: (colab: ColaboradorInterno) => void;
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
  onView: (colab: ColaboradorInterno) => void,
  onEdit: (colab: ColaboradorInterno) => void,
  onDelete: (colab: ColaboradorInterno) => void
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
      renderCell: (params) => `R$ ${params.value}`,
    },
    {
      field: 'health_plan',
      headerName: 'Plano de Saúde',
      width: 140,
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

export default function ColaboradoresInternoPage() {
  const { colaboradores, isLoading, deleteColaborador, createColaborador, isCreating } = useColaboradoresInterno();
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedColaborador, setSelectedColaborador] = useState<ColaboradorInterno | null>(null);

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

  const handleView = (colab: ColaboradorInterno) => {
    setSelectedColaborador(colab);
    setViewModalOpen(true);
  };

  const handleEdit = (colab: ColaboradorInterno) => {
    setSelectedColaborador(colab);
    setEditModalOpen(true);
  };

  const handleDelete = (colab: ColaboradorInterno) => {
    if (window.confirm(`Tem certeza que deseja remover o colaborador ${colab.employee_name}?`)) {
      deleteColaborador(colab.id);
    }
  };

  const handleAdd = () => {
    console.log('Opening add modal...');
    setAddModalOpen(true);
  };

  const handleSave = async (data: any) => {
    await createColaborador(data);
    setAddModalOpen(false);
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
        searchPlaceholder="Pesquisar colaboradores internos..."
        title="Colaboradores Internos"
        titleIcon={<UserCog size={32} />}
        description="Gerencie os funcionários da Cresci e Perdi"
        loading={isLoading}
        customCards={statsCards}
      />
      
      <ColaboradorInternoViewModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        colaborador={selectedColaborador}
        onEdit={() => {
          setViewModalOpen(false);
          toast.success('Modal de edição em desenvolvimento');
        }}
      />

      {addModalOpen && (
        <ColaboradorInternoAddModal
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onSave={handleSave}
          isLoading={isCreating}
        />
      )}
    </Box>
  );
}
