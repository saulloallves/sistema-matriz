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
import { MoreHoriz, Edit, Delete, Visibility } from '@mui/icons-material';
import { DataTable } from "@/components/crud/DataTable";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import toast from 'react-hot-toast';

type Franqueado = Tables<"franqueados">;

const columns: GridColDef[] = [
  {
    field: "full_name",
    headerName: "Nome",
    width: 250,
    renderCell: (params) => {
      const franqueado = params.row;
      const initials = franqueado.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2);

      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32 }}>
            {initials}
          </Avatar>
          <Box>
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
    width: 120,
    renderCell: (params) => (
      <Chip
        label={params.value}
        color="secondary"
        size="small"
      />
    ),
  },
  {
    field: "is_in_contract",
    headerName: "Contrato",
    width: 120,
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
    width: 140,
    renderCell: (params) => {
      const receives = params.value;
      const prolaboreValue = params.row.prolabore_value;
      
      return (
        <Box>
          <Chip
            label={receives ? "Sim" : "Não"}
            color={receives ? "success" : "default"}
            size="small"
          />
          {receives && prolaboreValue && (
            <Typography variant="caption" display="block" color="text.secondary">
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
    width: 150,
    renderCell: (params) => (
      <Typography variant="body2">
        {params.value || "-"}
      </Typography>
    ),
  },
  {
    field: "created_at",
    headerName: "Cadastro",
    width: 120,
    renderCell: (params) => {
      const date = new Date(params.value);
      return (
        <Typography variant="body2" color="text.secondary">
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
    renderCell: (params) => {
      const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

      const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
      };

      const handleClose = () => {
        setAnchorEl(null);
      };

      return (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton onClick={handleClick} size="small" color="primary">
            <MoreHoriz />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>
              <Visibility sx={{ mr: 1, fontSize: 18 }} />
              Visualizar
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <Edit sx={{ mr: 1, fontSize: 18 }} />
              Editar
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <Delete sx={{ mr: 1, fontSize: 18 }} />
              Excluir
            </MenuItem>
          </Menu>
        </Box>
      );
    },
  },
];

export default function FranqueadosPage() {
  const [data, setData] = useState<Franqueado[]>([]);
  const [loading, setLoading] = useState(true);

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
    toast("Funcionalidade de adicionar em desenvolvimento");
  };

  const handleEdit = (franqueado: Franqueado) => {
    toast("Funcionalidade de editar em desenvolvimento");
  };

  const handleDelete = (franqueado: Franqueado) => {
    toast("Funcionalidade de excluir em desenvolvimento");
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
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
  );
}