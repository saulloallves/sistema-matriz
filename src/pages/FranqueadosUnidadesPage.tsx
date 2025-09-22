import { useState, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { 
  MoreHorizontal,
  Eye as Visibility, 
  Edit, 
  Delete,
  Link as LinkIcon,
  Store,
  TrendingUp,
  Users,
  Shield
} from 'lucide-react';
import { DataTable } from "@/components/crud/DataTable";
import { useFranqueadosUnidades, FranqueadoUnidade } from '@/hooks/useFranqueadosUnidades';
import { useUserRole } from '@/hooks/useFranqueados';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import VinculoAddModal from '@/components/modals/VinculoAddModal';
import VinculoEditModal from '@/components/modals/VinculoEditModal';
import VinculoViewModal from '@/components/modals/VinculoViewModal';
import toast from 'react-hot-toast';

const ActionCell = ({ row, onView, onEdit, onDelete, isAdmin, isDeleting }: { 
  row: FranqueadoUnidade; 
  onView: (vinculo: FranqueadoUnidade) => void; 
  onEdit: (vinculo: FranqueadoUnidade) => void;
  onDelete: (id: number) => void;
  isAdmin: boolean;
  isDeleting: boolean;
}) => {
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

  const handleDelete = () => {
    onDelete(row.id);
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
          <Visibility size={18} style={{ marginRight: 8 }} />
          Visualizar
        </MenuItem>
        {isAdmin && (
          <>
            <MenuItem onClick={handleEdit}>
              <Edit size={18} style={{ marginRight: 8 }} />
              Editar
            </MenuItem>
            <MenuItem onClick={handleDelete} disabled={isDeleting}>
              <Delete size={18} style={{ marginRight: 8 }} />
              Remover
            </MenuItem>
          </>
        )}
      </Menu>
    </Box>
  );
};

const FranqueadosUnidadesPage = () => {
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [selectedVinculo, setSelectedVinculo] = useState<FranqueadoUnidade | null>(null);

  const { 
    vinculos, 
    isLoading: dataLoading, 
    deleteVinculo, 
    isDeleting 
  } = useFranqueadosUnidades();
  const { isAdmin, isFranqueado, userRole, isLoading: roleLoading } = useUserRole();

  const handleAdd = () => {
    if (!isAdmin()) {
      toast.error("Apenas administradores podem criar vínculos");
      return;
    }
    setOpenAddModal(true);
  };

  const handleView = (vinculo: FranqueadoUnidade) => {
    setSelectedVinculo(vinculo);
    setOpenViewModal(true);
  };

  const handleEdit = (vinculo: FranqueadoUnidade) => {
    if (!isAdmin()) {
      toast.error("Apenas administradores podem editar vínculos");
      return;
    }
    setSelectedVinculo(vinculo);
    setOpenEditModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!isAdmin()) {
      toast.error("Apenas administradores podem remover vínculos");
      return;
    }
    if (window.confirm('Tem certeza que deseja remover este vínculo?')) {
      await deleteVinculo(id);
    }
  };

  const handleCloseViewModal = () => {
    setOpenViewModal(false);
    setSelectedVinculo(null);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedVinculo(null);
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
  };

  // Estatísticas dos vínculos
  const statsCards = useMemo(() => {
    if (!vinculos || !Array.isArray(vinculos) || vinculos.length === 0) {
      return null;
    }

    const totalVinculos = vinculos.length;
    const vinculosAtivos = vinculos.filter(v => v?.unidade_is_active).length;
    const franqueadosVinculados = new Set(vinculos.map(v => v.franqueado_id)).size;
    const unidadesVinculadas = new Set(vinculos.map(v => v.unidade_id)).size;
    const vinculosOperacao = vinculos.filter(v => v?.unidade_store_phase === 'operacao').length;
    const vinculosComContrato = vinculos.filter(v => v?.franqueado_is_in_contract).length;

    const cardData = [
      {
        title: "Total de Vínculos",
        value: totalVinculos,
        icon: "LinkIcon",
        color: "primary.main",
        bgColor: "primary.light",
        iconBg: "primary.main"
      },
      {
        title: "Vínculos Ativos",
        value: vinculosAtivos,
        icon: "TrendingUp",
        color: "success.main",
        bgColor: "success.light",
        iconBg: "success.main"
      },
      {
        title: "Franqueados Vinculados",
        value: franqueadosVinculados,
        icon: "Users",
        color: "info.main",
        bgColor: "info.light",
        iconBg: "info.main"
      },
      {
        title: "Unidades Vinculadas",
        value: unidadesVinculadas,
        icon: "Store",
        color: "warning.main",
        bgColor: "warning.light",
        iconBg: "warning.main"
      },
      {
        title: "Em Operação",
        value: vinculosOperacao,
        icon: "TrendingUp",
        color: "secondary.main",
        bgColor: "secondary.light",
        iconBg: "secondary.main"
      },
      {
        title: "Com Contrato",
        value: vinculosComContrato,
        icon: "Users",
        color: "error.main",
        bgColor: "error.light",
        iconBg: "error.main"
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
              case "LinkIcon":
                return <LinkIcon size={24} />;
              case "TrendingUp":
                return <TrendingUp size={24} />;
              case "Users":
                return <Users size={24} />;
              case "Store":
                return <Store size={24} />;
              default:
                return <LinkIcon size={24} />;
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
  }, [vinculos]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const columns: GridColDef[] = [
    {
      field: 'franqueado',
      headerName: 'Franqueado',
      flex: 3,
      minWidth: 280,
      renderCell: (params) => (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          height: '100%',
          py: 1
        }}>
          <Avatar 
            src={params.row.franqueado_profile_image || undefined}
            sx={{ width: 32, height: 32 }}
          >
            {getInitials(params.row.franqueado_full_name)}
          </Avatar>
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="body2" fontWeight="medium" sx={{ lineHeight: 1.2 }}>
              {params.row.franqueado_full_name}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.1 }}>
              {params.row.franqueado_contact_masked}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'unidade',
      headerName: 'Unidade',
      flex: 3,
      minWidth: 300,
      renderCell: (params) => (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          height: '100%',
          py: 1
        }}>
          <Typography variant="body2" fontWeight="medium" sx={{ lineHeight: 1.2 }}>
            {params.row.unidade_group_code} - {params.row.unidade_group_name}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.1 }}>
            {params.row.unidade_city}, {params.row.unidade_state}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'franqueado_owner_type',
      headerName: 'Tipo',
      flex: 1,
      minWidth: 120,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Chip 
          label={params.row.franqueado_owner_type} 
          size="small" 
          variant="outlined"
          color={
            params.row.franqueado_owner_type === 'Sócio' 
              ? 'secondary' 
              : params.row.franqueado_owner_type === 'Principal' 
                ? 'info' 
                : 'primary'
          }
        />
      ),
    },
    {
      field: 'unidade_store_phase',
      headerName: 'Fase da Loja',
      flex: 1.5,
      minWidth: 130,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Chip 
          label={params.row.unidade_store_phase} 
          size="small" 
          variant="outlined"
          color={params.row.unidade_store_phase === 'operacao' ? 'success' : 'warning'}
        />
      ),
    },
    {
      field: 'created_at',
      headerName: 'Criado em',
      flex: 1,
      minWidth: 120,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Typography variant="caption">
          {format(new Date(params.row.created_at), 'dd/MM/yyyy', { locale: ptBR })}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 120,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <ActionCell 
          row={params.row} 
          onView={handleView} 
          onEdit={handleEdit} 
          onDelete={handleDelete}
          isAdmin={isAdmin()}
          isDeleting={isDeleting}
        />
      ),
    },
  ];

  // Show loading state for both data and role
  if (dataLoading || roleLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show security warning for non-admin users
  const showSecurityAlert = !isAdmin() && userRole;

  return (
    <>
      {showSecurityAlert && (
        <Alert 
          severity="info" 
          icon={<Shield />}
          sx={{ mb: 2 }}
        >
          {isFranqueado() 
            ? "Você está visualizando dados com acesso restrito. Alguns campos sensíveis estão mascarados por segurança."
            : "Acesso limitado: Você não tem permissão para visualizar todos os dados dos vínculos."
          }
        </Alert>
      )}
      
      <DataTable
        columns={columns}
        data={vinculos || []}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Pesquisar vínculos..."
        title="Vínculos Franqueados-Unidades"
        titleIcon={<Users size={32} color="#1976d2" />}
        description="Gerencie os vínculos entre franqueados e suas unidades"
        loading={dataLoading || isDeleting}
        customCards={statsCards || undefined}
      />

      {/* Modais */}
      <VinculoAddModal
        open={openAddModal}
        onClose={handleCloseAddModal}
      />

      {selectedVinculo && (
        <>
          <VinculoEditModal
            open={openEditModal}
            onClose={handleCloseEditModal}
            vinculo={selectedVinculo}
          />

          <VinculoViewModal
            open={openViewModal}
            onClose={handleCloseViewModal}
            vinculo={selectedVinculo}
          />
        </>
      )}
    </>
  );
};

export default FranqueadosUnidadesPage;