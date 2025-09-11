import { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Chip, 
  IconButton, 
  Menu, 
  MenuItem,
  Avatar,
  CircularProgress
} from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { DataTable } from "@/components/crud/DataTable";
import { FranqueadoViewModal } from "@/components/modals/FranqueadoViewModal";
import { FranqueadoEditModal } from "@/components/modals/FranqueadoEditModal";
import { FranqueadoAddModal } from "@/components/modals/FranqueadoAddModal";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import toast from 'react-hot-toast';

type Franqueado = Tables<"franqueados">;

const ActionCell = ({ row, onView, onEdit }: { row: any; onView: (franqueado: Franqueado) => void; onEdit: (franqueado: Franqueado) => void }) => {
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
    <Box sx={{ display: 'flex', gap: 0.5 }}>
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
          Excluir
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default function FranqueadosPage() {
  const [data, setData] = useState<Franqueado[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFranqueado, setSelectedFranqueado] = useState<Franqueado | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    loadFranqueados();
  }, []);

  const loadFranqueados = async () => {
    try {
      setLoading(true);
      const { data: franqueados, error } = await supabase
        .from("franqueados")
        .select("*")
        .order("full_name", { ascending: true });

      if (error) {
        throw error;
      }

      setData(franqueados || []);
    } catch (error) {
      console.error("Erro ao carregar franqueados:", error);
      toast.error("Erro ao carregar franqueados");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setAddModalOpen(true);
  };

  const handleEdit = (franqueado: Franqueado) => {
    setSelectedFranqueado(franqueado);
    setEditModalOpen(true);
  };

  const handleDelete = (franqueado: Franqueado) => {
    toast("Funcionalidade de excluir em desenvolvimento");
  };

  const handleView = (franqueado: Franqueado) => {
    setSelectedFranqueado(franqueado);
    setViewModalOpen(true);
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


  const columns: GridColDef[] = [
    {
      field: "full_name",
      headerName: "Nome",
      flex: 3,
      minWidth: 250,
      renderCell: (params) => {
        const franqueado = params.row;
        const initials = franqueado.full_name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .slice(0, 2);

        return (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            height: '100%',
            py: 1
          }}>
            <Avatar sx={{ width: 32, height: 32 }}>
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
                {franqueado.contact}
              </Typography>
            </Box>
          </Box>
        );
      },
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
          if (type === 'principal') return 'Principal';
          if (type === 'socio') return 'Sócio';
          return type;
        };
        
        const getChipColor = (type: string) => {
          if (type === 'socio') return 'primary';
          return 'secondary';
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
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {date.toLocaleDateString("pt-BR")}
          </Typography>
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
      renderCell: (params) => <ActionCell row={params.row} onView={handleView} onEdit={handleEdit} />,
    },
  ];

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
        searchPlaceholder="Pesquisar franqueados..."
        title="Franqueados"
        description="Gerencie todos os franqueados do sistema"
        loading={loading}
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
        onUpdate={loadFranqueados}
      />

      <FranqueadoAddModal
        open={addModalOpen}
        onClose={handleCloseAddModal}
        onUpdate={loadFranqueados}
      />
    </>
  );
}