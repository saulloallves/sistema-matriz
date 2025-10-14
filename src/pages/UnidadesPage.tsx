import { useState, useMemo } from "react";
import { 
  Box, 
  Typography, 
  Chip, 
  IconButton, 
  Menu, 
  MenuItem,
  CircularProgress,
  Card,
  CardContent,
  Button,
  Badge
} from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Building2, 
  Play, 
  Construction, 
  Crown, 
  Zap, 
  TrendingUp,
  Filter
} from 'lucide-react';
import { DataTable } from "@/components/crud/DataTable";
import { UnidadeViewModal } from "@/components/modals/UnidadeViewModal";
import { UnidadeEditModal } from "@/components/modals/UnidadeEditModal";
import { UnidadeAddModal } from "@/components/modals/UnidadeAddModal";
import { UnidadeFilterDrawer } from "@/components/modals/UnidadeFilterDrawer";
import { useUnidades } from "@/hooks/useUnidades";
import { Tables } from "@/integrations/supabase/types";
import toast from 'react-hot-toast';

type Unidade = Tables<"unidades">;

interface FilterState {
  store_model?: string;
  store_phase?: string;
  is_active?: boolean;
  city?: string;
  state?: string;
  uf?: string;
  cnpj?: string;
}

const ActionCell = ({ row, onView, onEdit, onToggleStatus }: { row: any; onView: (unidade: Unidade) => void; onEdit: (unidade: Unidade) => void; onToggleStatus: (unidade: Unidade) => void }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      gap: 0.5, 
      alignItems: 'center', 
      height: '100%',
      justifyContent: 'center'
    }}>
      <IconButton onClick={handleClick} size="small" color="primary">
        <MoreHorizontal size={20} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={() => { onView(row); handleClose(); }}>
          <Eye size={18} style={{ marginRight: 8 }} />
          Visualizar
        </MenuItem>
        <MenuItem onClick={() => { onEdit(row); handleClose(); }}>
          <Edit size={18} style={{ marginRight: 8 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={() => { onToggleStatus(row); handleClose(); }}>
          <Trash2 size={18} style={{ marginRight: 8 }} />
          {row.is_active ? 'Inativar' : 'Ativar'}
        </MenuItem>
      </Menu>
    </Box>
  );
};

const createColumns = (onView: (unidade: Unidade) => void, onEdit: (unidade: Unidade) => void, onToggleStatus: (unidade: Unidade) => void): GridColDef[] => [
  {
    field: "group_code",
    headerName: "Código",
    width: 90,
    headerAlign: 'center',
    align: 'center',
    renderCell: (params) => (
      <Chip
        label={params.value}
        variant="outlined"
        size="small"
      />
    ),
  },
  {
    field: "group_name",
    headerName: "Nome",
    flex: 3,
    minWidth: 200,
    renderCell: (params) => (
      <Typography 
        variant="body2" 
        fontWeight="medium"
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          height: '100%' 
        }}
      >
        {params.value}
      </Typography>
    ),
  },
  {
    field: "phone",
    headerName: "Telefone",
    flex: 2,
    minWidth: 140,
  },
  {
    field: "city",
    headerName: "Cidade",
    flex: 2,
    minWidth: 150,
  },
  {
    field: "uf",
    headerName: "UF",
    width: 60,
    headerAlign: 'center',
    align: 'center',
    renderCell: (params) => (
      <Typography 
        variant="body2" 
        sx={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          textAlign: 'center'
        }}
      >
        {params.value}
      </Typography>
    ),
  },
  {
    field: "store_model",
    headerName: "Modelo",
    flex: 1.5,
    minWidth: 150,
    headerAlign: 'center',
    align: 'center',
    renderCell: (params) => {
      const colorMap: Record<string, string> = {
        junior: "default",
        light: "secondary", 
        padrao: "primary",
        intermediaria: "info",
        'mega store': "error",
        pontinha: "warning"
      };
      
      const labelMap: Record<string, string> = {
        junior: "Junior",
        light: "Light",
        padrao: "Padrão",
        intermediaria: "Intermediária",
        'mega store': "Mega Store",
        pontinha: "Pontinha"
      };
      
      return (
        <Chip
          label={labelMap[params.value] || params.value}
          color={colorMap[params.value] as any || "default"}
          size="small"
        />
      );
    },
  },
  {
    field: "store_phase",
    headerName: "Fase",
    flex: 1.2,
    minWidth: 130,
    headerAlign: 'center',
    align: 'center',
    renderCell: (params) => (
      <Chip
        label={params.value === "operacao" ? "Operação" : "Implantação"}
        color={params.value === "operacao" ? undefined : "warning"}
        size="small"
        sx={params.value === "operacao" ? {
          backgroundColor: "#ff9923",
          color: "white",
          '& .MuiChip-label': {
            color: "white"
          }
        } : {}}
      />
    ),
  },
  {
    field: "is_active",
    headerName: "Status",
    width: 80,
    headerAlign: 'center',
    align: 'center',
    renderCell: (params) => (
      <Chip
        label={params.value ? "Ativo" : "Inativo"}
        color={params.value ? "success" : "default"}
        size="small"
        variant={params.value ? "filled" : "outlined"}
      />
    ),
  },
  {
    field: "actions",
    headerName: "Ações",
    width: 80,
    headerAlign: 'center',
    sortable: false,
    filterable: false,
    renderCell: (params) => <ActionCell row={params.row} onView={onView} onEdit={onEdit} onToggleStatus={onToggleStatus} />,
  },
];

export default function UnidadesPage() {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedUnidade, setSelectedUnidade] = useState<Unidade | null>(null);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({});

  const { 
    unidades, 
    isLoading, 
    toggleUnidadeStatus, 
    isToggling,
    createUnidade,
    isCreating,
    updateUnidade,
    isUpdating
  } = useUnidades();

  const filteredData = useMemo(() => {
    return unidades.filter(unidade => {
      return (
        (!filters.store_model || unidade.store_model === filters.store_model) &&
        (!filters.store_phase || unidade.store_phase === filters.store_phase) &&
        (filters.is_active === undefined || unidade.is_active === filters.is_active) &&
        (!filters.city || unidade.city?.toLowerCase().includes(filters.city.toLowerCase())) &&
        (!filters.state || unidade.state?.toLowerCase().includes(filters.state.toLowerCase())) &&
        (!filters.uf || unidade.uf?.toLowerCase().includes(filters.uf.toLowerCase())) &&
        (!filters.cnpj || unidade.cnpj?.includes(filters.cnpj))
      );
    });
  }, [unidades, filters]);

  const statsCards = useMemo(() => {
    const totalUnidades = unidades.length;
    const unidadesOperacao = unidades.filter(u => u.store_phase === 'operacao').length;
    const unidadesImplantacao = unidades.filter(u => u.store_phase === 'implantacao').length;
    const unidadesPadrao = unidades.filter(u => u.store_model === 'padrao').length;
    const unidadesMegaStore = unidades.filter(u => u.store_model === 'mega store').length;
    const unidadesAtivas = unidades.filter(u => u.sales_active || u.purchases_active).length;

    const cardData = [
      {
        title: "Total de Unidades",
        value: totalUnidades,
        icon: "Building2",
        color: "success.main",
        bgColor: "success.light",
        iconBg: "success.main"
      },
      {
        title: "Em Operação",
        value: unidadesOperacao,
        icon: "Play",
        color: "success.main",
        bgColor: "success.light",
        iconBg: "success.main"
      },
      {
        title: "Em Implantação",
        value: unidadesImplantacao,
        icon: "Construction",
        color: "warning.main",
        bgColor: "warning.light",
        iconBg: "warning.main"
      },
      {
        title: "Modelo Padrão",
        value: unidadesPadrao,
        icon: "Crown",
        color: "info.main",
        bgColor: "info.light",
        iconBg: "info.main"
      },
      {
        title: "Mega Store",
        value: unidadesMegaStore,
        icon: "Zap",
        color: "error.main",
        bgColor: "error.light",
        iconBg: "error.main"
      },
      {
        title: "Unidades Ativas",
        value: unidadesAtivas,
        icon: "TrendingUp",
        color: "secondary.main",
        bgColor: "secondary.light",
        iconBg: "secondary.main"
      }
    ];

    return (
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { 
          xs: '1fr', 
          sm: 'repeat(2, 1fr)', 
          md: 'repeat(3, 1fr)' 
        }, 
        gap: 3, 
        mb: 3,
        width: '100%'
      }}>
        {cardData.map((card, index) => {
          const renderIcon = () => {
            switch(card.icon) {
              case "Building2":
                return <Building2 size={24} />;
              case "Play":
                return <Play size={24} />;
              case "Construction":
                return <Construction size={24} />;
              case "Crown":
                return <Crown size={24} />;
              case "Zap":
                return <Zap size={24} />;
              case "TrendingUp":
                return <TrendingUp size={24} />;
              default:
                return <Building2 size={24} />;
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
                    backgroundColor: index === 1 ? '#ff992315' : `${card.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: index === 1 ? '#ff9923' : card.color
                  }}
                >
                  {renderIcon()}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      color: index === 1 ? '#ff9923' : card.color, 
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
                    backgroundColor: index === 1 ? '#ff9923' : card.color,
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
  }, [unidades]);

  const handleToggleStatus = async (unidade: Unidade) => {
    const action = unidade.is_active ? 'inativar' : 'ativar';
    if (window.confirm(`Tem certeza que deseja ${action} a unidade "${unidade.group_name}"?`)) {
      await toggleUnidadeStatus({ id: unidade.id, currentStatus: unidade.is_active });
    }
  };

  const handleView = (unidade: Unidade) => {
    setSelectedUnidade(unidade);
    setViewModalOpen(true);
  };

  const handleEdit = (unidade: Unidade) => {
    setSelectedUnidade(unidade);
    setEditModalOpen(true);
  };

  const handleAdd = () => {
    setAddModalOpen(true);
  };

  const handleSaveNew = async (data: any) => {
    await createUnidade(data);
    setAddModalOpen(false);
  };

  const handleSaveUpdate = async (id: string, data: any) => {
    await updateUnidade({ id, updates: data });
    setEditModalOpen(false);
  };

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const columns = createColumns(handleView, handleEdit, handleToggleStatus);
  const activeFilterCount = Object.values(filters).filter(v => v !== '' && v !== undefined).length;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={filteredData}
        onAdd={handleAdd}
        searchPlaceholder="Pesquisar por nome, código, cidade..."
        title="Unidades"
        titleIcon={<Building2 size={32} color="#E3A024" />}
        description="Gerencie todas as unidades do sistema"
        loading={isLoading || isToggling}
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
      
      <UnidadeViewModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        unidade={selectedUnidade}
      />
      
      <UnidadeEditModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        unidade={selectedUnidade}
        onUpdate={(id, data) => handleSaveUpdate(id, data)}
      />
      
      <UnidadeAddModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={handleSaveNew}
      />

      <UnidadeFilterDrawer
        open={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        initialFilters={filters}
      />
    </>
  );
}