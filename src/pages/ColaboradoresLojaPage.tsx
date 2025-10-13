import { useState, useMemo } from 'react';
import { Box, Chip, IconButton, CircularProgress, Card, CardContent, Typography, Menu, MenuItem, Button, Badge } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Users, 
  Check, 
  X, 
  MoreHorizontal,
  HeartPulse,
  Utensils,
  Bus,
  Wallet,
  Award,
  Filter
} from 'lucide-react';
import { DataTable } from '@/components/crud/DataTable';
import { useColaboradoresLoja, ColaboradorLoja } from '@/hooks/useColaboradoresLoja';
import { ColaboradorLojaAddModal } from '@/components/modals/ColaboradorLojaAddModal';
import { ColaboradorLojaEditModal } from '@/components/modals/ColaboradorLojaEditModal';
import { ColaboradorLojaViewModal } from '@/components/modals/ColaboradorLojaViewModal';
import { ColaboradorLojaFilterDrawer } from '@/components/modals/ColaboradorLojaFilterDrawer';
import { format } from 'date-fns';
import { formatCurrency } from '@/utils/formatters';

interface FilterState {
  position_id?: string;
  health_plan?: boolean;
  meal_voucher_active?: boolean;
  transport_voucher_active?: boolean;
  cash_access?: boolean;
  training?: boolean;
  city?: string;
  uf?: string;
}

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
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({});

  const filteredData = useMemo(() => {
    return colaboradores.filter(colab => {
      return (
        (!filters.position_id || colab.position_id === filters.position_id) &&
        (filters.health_plan === undefined || colab.health_plan === filters.health_plan) &&
        (filters.meal_voucher_active === undefined || colab.meal_voucher_active === filters.meal_voucher_active) &&
        (filters.transport_voucher_active === undefined || colab.transport_voucher_active === filters.transport_voucher_active) &&
        (filters.cash_access === undefined || colab.cash_access === filters.cash_access) &&
        (filters.training === undefined || colab.training === filters.training) &&
        (!filters.city || (colab.city && colab.city.toLowerCase().includes(filters.city.toLowerCase()))) &&
        (!filters.uf || (colab.uf && colab.uf.toLowerCase().includes(filters.uf.toLowerCase())))
      );
    });
  }, [colaboradores, filters]);

  const statsCards = useMemo(() => {
    if (!colaboradores || !Array.isArray(colaboradores)) {
      return null;
    }

    const totalColaboradores = colaboradores.length;
    const comPlanoSaude = colaboradores.filter(c => c.health_plan).length;
    const comValeRefeicao = colaboradores.filter(c => c.meal_voucher_active).length;
    const comValeTransporte = colaboradores.filter(c => c.transport_voucher_active).length;
    const comAcessoCaixa = colaboradores.filter(c => c.cash_access).length;
    const comTreinamento = colaboradores.filter(c => c.training).length;

    const cardData = [
      { title: "Total de Colaboradores", value: totalColaboradores, icon: "Users", color: "primary.main" },
      { title: "Com Plano de Saúde", value: comPlanoSaude, icon: "HeartPulse", color: "success.main" },
      { title: "Com Vale Refeição", value: comValeRefeicao, icon: "Utensils", color: "info.main" },
      { title: "Com Vale Transporte", value: comValeTransporte, icon: "Bus", color: "secondary.main" },
      { title: "Com Acesso ao Caixa", value: comAcessoCaixa, icon: "Wallet", color: "warning.main" },
      { title: "Com Treinamento", value: comTreinamento, icon: "Award", color: "error.main" },
    ];

    return (
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, 
        gap: 3, 
        mb: 3 
      }}>
        {cardData.map((card, index) => {
          const renderIcon = () => {
            switch(card.icon) {
              case "Users": return <Users size={24} />;
              case "HeartPulse": return <HeartPulse size={24} />;
              case "Utensils": return <Utensils size={24} />;
              case "Bus": return <Bus size={24} />;
              case "Wallet": return <Wallet size={24} />;
              case "Award": return <Award size={24} />;
              default: return <Users size={24} />;
            }
          };
          
          return (
            <Card 
              key={index}
              sx={{ 
                height: '100px',
                background: 'background.paper',
                border: `1px solid ${card.color}20`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 20px ${card.color}15`,
                  border: `1px solid ${card.color}40`
                }
              }}
            >
              <CardContent sx={{ 
                p: 3, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 3,
                height: '100%',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '12px',
                    backgroundColor: `${card.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: card.color
                  }}
                >
                  {renderIcon()}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      color: card.color, 
                      fontWeight: 700,
                      mb: 0.5,
                      fontSize: '1.75rem'
                    }}
                  >
                    {card.value}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.secondary',
                      fontWeight: 500,
                      fontSize: '0.875rem'
                    }}
                  >
                    {card.title}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: 4,
                    backgroundColor: card.color,
                    borderRadius: '0 12px 12px 0',
                    opacity: 0.8
                  }}
                />
              </CardContent>
            </Card>
          );
        })}
      </Box>
    );
  }, [colaboradores]);

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

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const columns = createColumns(handleView, handleEdit, handleDelete);
  const activeFilterCount = Object.values(filters).filter(v => v !== '' && v !== undefined).length;

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
        data={filteredData}
        onAdd={handleAdd}
        searchPlaceholder="Pesquisar colaboradores de loja..."
        title="Colaboradores de Loja"
        titleIcon={<Users size={32} />}
        description="Gerencie os funcionários das lojas/unidades"
        loading={isLoading}
        customCards={statsCards}
        filterComponent={
          <Badge badgeContent={activeFilterCount} color="primary">
            <Button
              variant={activeFilterCount > 0 ? "contained" : "outlined"}
              endIcon={<Filter size={16} />}
              onClick={() => setIsFilterDrawerOpen(true)}
            >
              Filtros
            </Button>
          </Badge>
        }
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

      <ColaboradorLojaFilterDrawer
        open={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        initialFilters={filters}
      />
    </Box>
  );
}