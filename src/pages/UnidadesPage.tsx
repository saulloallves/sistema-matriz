import { useState, useEffect, useMemo } from "react";
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
  CardContent
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
  TrendingUp 
} from 'lucide-react';
import { DataTable } from "@/components/crud/DataTable";
import { UnidadeViewModal } from "@/components/modals/UnidadeViewModal";
import { UnidadeEditModal } from "@/components/modals/UnidadeEditModal";
import { UnidadeAddModal } from "@/components/modals/UnidadeAddModal";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import toast from 'react-hot-toast';

type Unidade = Tables<"unidades">;

const ActionCell = ({ row, onView, onEdit }: { row: any; onView: (unidade: Unidade) => void; onEdit: (unidade: Unidade) => void }) => {
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
        <MenuItem onClick={handleView}>
          <Eye size={18} style={{ marginRight: 8 }} />
          Visualizar
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <Edit size={18} style={{ marginRight: 8 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <Trash2 size={18} style={{ marginRight: 8 }} />
          Inativar
        </MenuItem>
      </Menu>
    </Box>
  );
};

const createColumns = (onView: (unidade: Unidade) => void, onEdit: (unidade: Unidade) => void): GridColDef[] => [
  {
    field: "group_code",
    headerName: "Código",
    width: 120,
    renderCell: (params) => (
      <Chip
        label={params.value}
        variant="outlined"
        size="small"
        sx={{ fontFamily: 'monospace' }}
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
    field: "store_model",
    headerName: "Modelo",
    flex: 1.5,
    minWidth: 150,
    renderCell: (params) => {
      const colorMap: Record<string, string> = {
        junior: "default",
        light: "secondary", 
        padrao: "primary",
        intermediaria: "info",
        mega_store: "error",
        pontinha: "warning"
      };
      
      const labelMap: Record<string, string> = {
        junior: "Junior",
        light: "Light",
        padrao: "Padrão",
        intermediaria: "Intermediária",
        mega_store: "Mega Store",
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
    renderCell: (params) => (
      <Chip
        label={params.value === "operacao" ? "Operação" : "Implantação"}
        color={params.value === "operacao" ? "success" : "warning"}
        size="small"
      />
    ),
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
    width: 80,
    renderCell: (params) => (
      <Typography 
        variant="body2" 
        sx={{ 
          fontFamily: 'monospace',
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
    field: "actions",
    headerName: "Ações",
    width: 120,
    sortable: false,
    filterable: false,
    renderCell: (params) => <ActionCell row={params.row} onView={onView} onEdit={onEdit} />,
  },
];

export default function UnidadesPage() {
  const [data, setData] = useState<Unidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedUnidade, setSelectedUnidade] = useState<Unidade | null>(null);

  useEffect(() => {
    loadUnidades();
  }, []);

  const loadUnidades = async () => {
    try {
      setLoading(true);
      const { data: unidades, error } = await supabase
        .from("unidades")
        .select("*")
        .order("group_code", { ascending: true });

      if (error) {
        throw error;
      }

      setData(unidades || []);
    } catch (error) {
      console.error("Erro ao carregar unidades:", error);
      toast.error("Erro ao carregar unidades");
    } finally {
      setLoading(false);
    }
  };

  const statsCards = useMemo(() => {
    const totalUnidades = data.length;
    const unidadesOperacao = data.filter(u => u.store_phase === 'operacao').length;
    const unidadesImplantacao = data.filter(u => u.store_phase === 'implantacao').length;
    const unidadesPadrao = data.filter(u => u.store_model === 'padrao').length;
    const unidadesMegaStore = data.filter(u => u.store_model === 'mega_store').length;
    const unidadesAtivas = data.filter(u => u.sales_active || u.purchases_active).length;

    const cardData = [
      {
        title: "Total de Unidades",
        value: totalUnidades,
        icon: "Building2",
        color: "primary.main",
        bgColor: "primary.light",
        iconBg: "primary.main"
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
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: 3, 
        mb: 3 
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
                height: '100%'
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
              </CardContent>
            </Card>
          );
        })}
      </Box>
    );
  }, [data]);

  const handleView = (unidade: Unidade) => {
    setSelectedUnidade(unidade);
    setViewModalOpen(true);
  };

  const handleEdit = (unidade: Unidade) => {
    setSelectedUnidade(unidade);
    setEditModalOpen(true);
  };

  const handleDelete = (unidade: Unidade) => {
    toast("Funcionalidade de excluir em desenvolvimento");
  };

  const handleAdd = () => {
    setAddModalOpen(true);
  };

  const columns = createColumns(handleView, handleEdit);

  if (loading) {
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
        data={data}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Pesquisar unidades..."
        title="Unidades"
        description="Gerencie todas as unidades do sistema"
        loading={loading}
        customCards={statsCards}
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
        onUpdate={loadUnidades}
      />
      
      <UnidadeAddModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={loadUnidades}
      />
    </>
  );
}