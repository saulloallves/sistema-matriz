import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
} from '@mui/material';
import { 
  DataGrid, 
  GridColDef, 
  GridToolbar,
  GridPaginationModel,
} from '@mui/x-data-grid';
import { ptBR } from "@mui/x-data-grid/locales";
import {
  Plus,
  Search,
  Filter,
  Download,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface DataTableProps {
  columns: GridColDef[];
  data: any[];
  onAdd?: () => void;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  searchPlaceholder?: string;
  title?: string;
  titleIcon?: React.ReactNode;
  description?: string;
  loading?: boolean;
  customCards?: React.ReactNode;
}

export function DataTable({
  columns,
  data,
  onAdd,
  onEdit,
  onDelete,
  searchPlaceholder = "Pesquisar...",
  title,
  titleIcon,
  description,
  loading = false,
  customCards,
}: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const filteredData = data.filter((row) =>
    Object.values(row).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const finalColumns = columns;

  const handleExport = () => {
    toast("Funcionalidade de exportar ainda está em desenvolvimento", {
      icon: "🚧",
      duration: 3000,
    });
  };

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      width: '100%',
      overflow: 'hidden'
    }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            {title && (
              <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2, fontWeight: 600 }}>
                {titleIcon}
                {title}
              </Typography>
            )}
            {description && <Typography variant="body1" color="text.secondary">{description}</Typography>}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<Download size={16} />} size="small" onClick={handleExport}>Exportar</Button>
            {onAdd && <Button variant="contained" startIcon={<Plus size={16} />} onClick={onAdd}>Adicionar</Button>}
          </Box>
        </Box>

        {customCards || (
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Card sx={{ flex: 1 }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h5">{data.length}</Typography>
                <Typography color="text.secondary" variant="body2">Total de registros</Typography>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1 }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h5">{filteredData.length}</Typography>
                <Typography color="text.secondary" variant="body2">Registros filtrados</Typography>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1 }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h5">{Math.ceil(filteredData.length / paginationModel.pageSize)}</Typography>
                <Typography color="text.secondary" variant="body2">Total de páginas</Typography>
              </CardContent>
            </Card>
          </Box>
        )}

        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment> }}
          />
        </Box>
      </Box>

      <Card sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        width: '100%',
        overflow: 'hidden'
      }}>
        <DataGrid
          rows={filteredData}
          columns={finalColumns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
          pageSizeOptions={[5, 10, 25, 50]}
          loading={loading}
          slots={{ toolbar: GridToolbar }}
          getRowId={(row) => row.id || Math.random()}
          sx={{ 
            border: 0,
            width: '100%',
            overflow: 'hidden',
            '& .MuiDataGrid-root': {
              overflow: 'hidden'
            },
            '& .MuiDataGrid-main': {
              overflow: 'hidden'
            },
            '& .MuiDataGrid-columnsContainer': {
              width: '100% !important'
            },
            '& .MuiDataGrid-virtualScroller': {
              width: '100% !important'
            },
            '& .MuiDataGrid-columnHeaders': {
              width: '100% !important'
            }
          }}
          disableRowSelectionOnClick
        />
      </Card>
    </Box>
  );
}