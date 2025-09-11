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

type Unidade = Tables<"unidades">;

const ActionCell = ({ row }: { row: any }) => {
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
};

const columns: GridColDef[] = [
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
      <Typography variant="body2" fontWeight="medium">
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
      return (
        <Chip
          label={params.value}
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
      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
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
    renderCell: (params) => <ActionCell row={params.row} />,
  },
];

export default function UnidadesPage() {
  const [data, setData] = useState<Unidade[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleAdd = () => {
    toast("Funcionalidade de adicionar em desenvolvimento");
  };

  const handleEdit = (unidade: Unidade) => {
    toast("Funcionalidade de editar em desenvolvimento");
  };

  const handleDelete = (unidade: Unidade) => {
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
      searchPlaceholder="Pesquisar unidades..."
      title="Unidades"
      description="Gerencie todas as unidades do sistema"
      loading={loading}
    />
  );
}