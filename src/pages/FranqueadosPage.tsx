import { useState, useMemo } from "react";
import { 
  Box, 
  Typography, 
  Chip, 
  IconButton, 
  Menu, 
  MenuItem,
  Avatar,
  CircularProgress,
  Card,
  CardContent,
  Alert,
  Button,
  Badge
} from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Users, 
  UserCheck, 
  Crown, 
  Building, 
  DollarSign, 
  Clock,
  Shield,
  Filter
} from 'lucide-react';
import { DataTable } from "@/components/crud/DataTable";
import { FranqueadoViewModal } from "@/components/modals/FranqueadoViewModal";
import { FranqueadoEditModal } from "@/components/modals/FranqueadoEditModal";
import { FranqueadoAddModal } from "@/components/modals/FranqueadoAddModal";
import { FranqueadoFilterDrawer } from "@/components/modals/FranqueadoFilterDrawer";
import { useFranqueados, useUserRole } from "@/hooks/useFranqueados";
import { Tables } from "@/integrations/supabase/types";
import toast from 'react-hot-toast';
import { formatPhone, formatCPF } from "@/utils/formatters";

type Franqueado = Tables<"franqueados">;

interface FilterState {
  owner_type?: string;
  is_in_contract?: boolean;
  receives_prolabore?: boolean;
  was_referred?: boolean;
  city?: string;
  state?: string;
  uf?: string;
  availability?: string;
}

const ActionCell = ({ row, onView, onEdit, onDelete }: { row: any; onView: (franqueado: Franqueado) => void; onEdit: (franqueado: Franqueado) => void; onDelete: (franqueado: Franqueado) => void }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleView = () => {
    onView(row);
    handleClose();
  };

  const handleEdit = () => {
    onEdit(row);
    handleClose();
  };

  const handleDeleteClick = () => {
    onDelete(row);
    handleClose();
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      gap: 0.5,
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      py: 1
    }}>
      <IconButton onClick={handleClick} size="small" color="primary">
        <MoreHorizontal size={20} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleView}>
          <Eye size={18} style={{ marginRight: 8 }} />
          Visualizar
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <Edit size={18} style={{ marginRight: 8 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <Trash2 size={18} style={{ marginRight: 8 }} />
          Excluir
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default function FranqueadosPage() {
  const { 
    franqueados, 
    isLoading: dataLoading, 
    getFranqueadoDetails, 
    deleteFranqueado,
    isDeleting 
  } = useFranqueados();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  
  const [selectedFranqueado, setSelectedFranqueado] = useState<Franqueado | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({});

  const filteredData = useMemo(() => {
    return franqueados.filter((franqueado: any) => {
      return (
        (!filters.owner_type || franqueado.owner_type === filters.owner_type) &&
        (filters.is_in_contract === undefined || franqueado.is_in_contract === filters.is_in_contract) &&
        (filters.receives_prolabore === undefined || franqueado.receives_prolabore === filters.receives_prolabore) &&
        (filters.was_referred === undefined || franqueado.was_referred === filters.was_referred) &&
        (!filters.city || franqueado.city?.toLowerCase().includes(filters.city.toLowerCase())) &&
        (!filters.uf || franqueado.uf?.toLowerCase().includes(filters.uf.toLowerCase())) &&
        (!filters.availability || franqueado.availability?.toLowerCase().includes(filters.availability.toLowerCase()))
      );
    });
  }, [franqueados, filters]);

  const handleAdd = () => {
    if (!isAdmin()) {
      toast.error("Apenas administradores podem adicionar franqueados");
      return;
    }
    setAddModalOpen(true);
  };

  const handleEdit = async (franqueado: any) => {
    try {
      const fullData = await getFranqueadoDetails(franqueado.id);
      setSelectedFranqueado(fullData);
      setEditModalOpen(true);
    } catch (error) {
      toast.error("Erro ao carregar dados do franqueado");
    }
  };

  const handleDelete = (franqueado: any) => {
    if (!isAdmin()) {
      toast.error("Apenas administradores podem excluir franqueados");
      return;
    }
    
    if (confirm(`Tem certeza que deseja excluir o franqueado "${franqueado.full_name}"? Esta ação também removerá todos os vínculos com unidades e não pode ser desfeita.`)) {
      deleteFranqueado(franqueado.id);
    }
  };

  const handleView = async (franqueado: any) => {
    try {
      const fullData = await getFranqueadoDetails(franqueado.id);
      setSelectedFranqueado(fullData);
      setViewModalOpen(true);
    } catch (error) {
      toast.error("Erro ao carregar dados do franqueado");
    }
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setSelectedFranqueado(null);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedFranqueado(null);
  };

  const handleCloseAddModal = () => {
    setAddModalOpen(false);
  };

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const statsCards = useMemo(() => {
    // Ensure franqueados is defined and is an array before filtering
    if (!franqueados || !Array.isArray(franqueados) || franqueados.length === 0) {
      return null;
    }

    const totalFranqueados = franqueados.length;
    const franqueadosAtivos = franqueados.filter(f => f?.is_in_contract).length;
    const franqueadosPrincipais = franqueados.filter(f => f?.owner_type === 'Principal').length;
    const franqueadosSócios = franqueados.filter(f => f?.owner_type === 'Sócio').length;
    const franqueadosComProlabore = franqueados.filter(f => f?.receives_prolabore).length;
    const franqueadosIntegrais = franqueados.filter(f => f?.availability === 'integral').length;

    const cardData = [
      {
        title: "Total de Franqueados",
        value: totalFranqueados,
        icon: "Users",
        color: "primary.main",
        bgColor: "primary.light",
        iconBg: "primary.main"
      },
      {
        title: "Com Contrato",
        value: franqueadosAtivos,
        icon: "UserCheck",
        color: "success.main",
        bgColor: "success.light",
        iconBg: "success.main"
      },
      {
        title: "Principais",
        value: franqueadosPrincipais,
        icon: "Crown",
        color: "warning.main",
        bgColor: "warning.light",
        iconBg: "warning.main"
      },
      {
        title: "Sócios",
        value: franqueadosSócios,
        icon: "Building",
        color: "info.main",
        bgColor: "info.light",
        iconBg: "info.main"
      },
      {
        title: "Com Pró-labore",
        value: franqueadosComProlabore,
        icon: "DollarSign",
        color: "error.main",
        bgColor: "error.light",
        iconBg: "error.main"
      },
      {
        title: "Dedicação Integral",
        value: franqueadosIntegrais,
        icon: "Clock",
        color: "secondary.main",
        bgColor: "secondary.light",
        iconBg: "secondary.main"
      }
    ];

    return (
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: 3, 
        mb: 3 
      }}>
        {cardData.map((card, index) => {
          const renderIcon = () => {
            switch(card.icon) {
              case "Users":
                return <Users size={24} />;
              case "UserCheck":
                return <UserCheck size={24} />;
              case "Crown":
                return <Crown size={24} />;
              case "Building":
                return <Building size={24} />;
              case "DollarSign":
                return <DollarSign size={24} />;
              case "Clock":
                return <Clock size={24} />;
              default:
                return <Users size={24} />;
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
                {/* Elemento decorativo moderno no lado direito */}
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
  }, [franqueados]);

  const columns: GridColDef[] = [
    {
      field: "full_name",
      headerName: "Nome",
      flex: 3,
      minWidth: 250,
      renderCell: (params) => {
        const franqueado = params.row;
        const initials = franqueado.full_name
          ?.split(" ")
          ?.map((n: string) => n[0])
          ?.join("")
          ?.slice(0, 2) || "??";

        return (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            height: '100%',
            py: 1
          }}>
            <Avatar 
              src={franqueado.profile_image || undefined}
              sx={{ width: 32, height: 32 }}
            >
              {initials}
            </Avatar>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <Typography variant="body2" fontWeight="medium">
                {franqueado.full_name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatPhone(franqueado.contact_masked || franqueado.contact)}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      field: "cpf_rnm",
      headerName: "CPF/RNM",
      flex: 1.5,
      minWidth: 150,
      valueFormatter: (value) => formatCPF(value || ''),
    },
    {
      field: "owner_type",
      headerName: "Tipo",
      flex: 1,
      minWidth: 120,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const formatOwnerType = (type: string) => {
          if (type === 'Principal') return 'Principal';
          if (type === 'Sócio') return 'Sócio';
          return type;
        };
        
        const getChipColor = (type: string) => {
          if (type === 'Principal') return 'primary';
          if (type === 'Sócio') return 'secondary';
          return 'default';
        };
        
        return (
          <Chip
            label={formatOwnerType(params.value)}
            color={getChipColor(params.value)}
            size="small"
          />
        );
      },
    },
    {
      field: "is_in_contract",
      headerName: "Contrato",
      flex: 1,
      minWidth: 120,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Chip
          label={params.value ? "Ativo" : "Inativo"}
          color={params.value ? "success" : "default"}
          size="small"
        />
      ),
    },
    {
      field: "receives_prolabore",
      headerName: "Pró-labore",
      flex: 1.5,
      minWidth: 140,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const receives = params.value;
        const prolaboreValue = params.row.prolabore_value;
        
        return (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            py: 1
          }}>
            <Chip
              label={receives ? "Sim" : "Não"}
              color={receives ? "success" : "default"}
              size="small"
            />
            {receives && prolaboreValue && (
              <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                R$ {prolaboreValue.toLocaleString()}
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      field: "availability",
      headerName: "Disponibilidade",
      flex: 1.8,
      minWidth: 150,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const formatAvailability = (availability: string) => {
          if (availability === 'integral') return 'Integral';
          return availability;
        };
        
        return (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%',
            py: 1
          }}>
            {params.value ? (
              <Chip
                label={formatAvailability(params.value)}
                color={params.value === 'integral' ? 'info' : 'default'}
                size="small"
              />
            ) : (
              <Typography variant="body2" textAlign="center">
                -
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      field: "created_at",
      headerName: "Cadastro",
      flex: 1,
      minWidth: 120,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const date = new Date(params.value);
        return (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%',
            py: 1
          }}>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              {date.toLocaleDateString("pt-BR")}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "actions",
      headerName: "Ações",
      width: 120,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => <ActionCell row={params.row} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />,
    },
  ];

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  // Show loading state for both data and role
  if (dataLoading || roleLoading) {
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
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Pesquisar por nome, CPF, telefone..."
        title="Franqueados"
        titleIcon={<Users size={32} color="#E3A024" />}
        description="Gerencie todos os franqueados do sistema"
        loading={dataLoading || isDeleting}
        customCards={statsCards || undefined}
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

      <FranqueadoViewModal
        open={viewModalOpen}
        onClose={handleCloseViewModal}
        franqueado={selectedFranqueado}
      />

      <FranqueadoEditModal
        open={editModalOpen}
        onClose={handleCloseEditModal}
        franqueado={selectedFranqueado}
        onUpdate={() => {}} // Handled by React Query cache invalidation
      />

      <FranqueadoAddModal
        open={addModalOpen}
        onClose={handleCloseAddModal}
        onUpdate={() => {}} // Handled by React Query cache invalidation
      />

      <FranqueadoFilterDrawer
        open={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        initialFilters={filters}
      />
    </>
  );
}