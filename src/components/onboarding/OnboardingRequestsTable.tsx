import { useMemo, useState } from 'react';
import {
  Box,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  Menu,
  MenuItem,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import { Eye, FileCheck, FileX, MoreHorizontal } from 'lucide-react';
import { OnboardingRequest, OnboardingStatus, OnboardingRequestType } from '../../types/onboarding';
import { formatCPF, formatCNPJ } from '../../utils/formatters';
import { format } from 'date-fns';
import { ptBR as dateFnsPtBR } from 'date-fns/locale';

interface OnboardingRequestsTableProps {
  requests: OnboardingRequest[];
  loading: boolean;
  onView: (request: OnboardingRequest) => void;
  onApprove: (request: OnboardingRequest) => void;
  onReject: (request: OnboardingRequest) => void;
}

/**
 * Retorna a cor do chip de status
 */
const getStatusColor = (status: OnboardingStatus): 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' => {
  const colors: Record<OnboardingStatus, 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'> = {
    pending: 'warning',
    processing: 'info',
    approved: 'success',
    rejected: 'error',
    error: 'error',
  };
  return colors[status] || 'default';
};

/**
 * Retorna o label traduzido do status
 */
const getStatusLabel = (status: OnboardingStatus): string => {
  const labels: Record<OnboardingStatus, string> = {
    pending: 'Pendente',
    processing: 'Processando',
    approved: 'Aprovado',
    rejected: 'Rejeitado',
    error: 'Erro',
  };
  return labels[status] || status;
};

/**
 * Retorna o label traduzido do tipo de request
 */
const getRequestTypeLabel = (type: OnboardingRequestType): string => {
  const labels: Record<OnboardingRequestType, string> = {
    new_franchisee_new_unit: 'Novo Franq. + Nova Unid.',
    existing_franchisee_new_unit: 'Franq. Existente + Nova Unid.',
    new_franchisee_existing_unit: 'Novo Franq. + Unid. Existente',
  };
  return labels[type] || type;
};

/**
 * Componente de célula de ações com menu dropdown
 */
const ActionCell = ({ 
  row, 
  onView, 
  onApprove, 
  onReject 
}: { 
  row: OnboardingRequest; 
  onView: (request: OnboardingRequest) => void; 
  onApprove: (request: OnboardingRequest) => void; 
  onReject: (request: OnboardingRequest) => void; 
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

  const handleApprove = () => {
    onApprove(row);
    handleClose();
  };

  const handleReject = () => {
    onReject(row);
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
        {row.status === 'pending' && (
          <>
            <MenuItem onClick={handleApprove} sx={{ color: 'success.main' }}>
              <FileCheck size={18} style={{ marginRight: 8 }} />
              Aprovar
            </MenuItem>
            <MenuItem onClick={handleReject} sx={{ color: 'error.main' }}>
              <FileX size={18} style={{ marginRight: 8 }} />
              Rejeitar
            </MenuItem>
          </>
        )}
      </Menu>
    </Box>
  );
};

/**
 * Tabela de solicitações de onboarding com ações
 */
const OnboardingRequestsTable = ({
  requests,
  loading,
  onView,
  onApprove,
  onReject,
}: OnboardingRequestsTableProps) => {
  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'request_number',
        headerName: 'Protocolo',
        flex: 1.5,
        minWidth: 160,
        renderCell: (params) => (
          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
            {params.value}
          </Typography>
        ),
      },
      {
        field: 'full_name',
        headerName: 'Nome',
        flex: 2,
        minWidth: 200,
        valueGetter: (value, row) => row.form_data?.full_name || '-',
      },
      {
        field: 'cpf',
        headerName: 'CPF',
        flex: 1.5,
        minWidth: 140,
        valueGetter: (value, row) => formatCPF(row.franchisee_cpf),
      },
      {
        field: 'cnpj',
        headerName: 'CNPJ',
        flex: 1.5,
        minWidth: 160,
        valueGetter: (value, row) => formatCNPJ(row.unit_cnpj),
      },
      {
        field: 'unit_name',
        headerName: 'Unidade',
        flex: 2.5,
        minWidth: 220,
        valueGetter: (value, row) => row.form_data?.group_name || '-',
      },
      {
        field: 'request_type',
        headerName: 'Tipo',
        flex: 2,
        minWidth: 180,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Tooltip title={getRequestTypeLabel(params.value)}>
            <Chip
              label={getRequestTypeLabel(params.value)}
              size="small"
              variant="outlined"
              sx={{ 
                maxWidth: '100%',
                '& .MuiChip-label': {
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                },
              }}
            />
          </Tooltip>
        ),
      },
      {
        field: 'status',
        headerName: 'Status',
        flex: 1,
        minWidth: 120,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Chip
            label={getStatusLabel(params.value)}
            color={getStatusColor(params.value)}
            size="small"
          />
        ),
      },
      {
        field: 'submitted_at',
        headerName: 'Data',
        flex: 1.5,
        minWidth: 140,
        valueGetter: (value) => {
          try {
            return format(new Date(value), "dd/MM/yyyy HH:mm", { locale: dateFnsPtBR });
          } catch {
            return '-';
          }
        },
      },
      {
        field: 'actions',
        headerName: 'Ações',
        flex: 0.8,
        minWidth: 80,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <ActionCell
            row={params.row}
            onView={onView}
            onApprove={onApprove}
            onReject={onReject}
          />
        ),
      },
    ],
    [onView, onApprove, onReject]
  );

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={requests}
        columns={columns}
        loading={loading}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 10, page: 0 },
          },
        }}
        pageSizeOptions={[10, 25, 50]}
        localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        disableRowSelectionOnClick
        sx={{
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-cell:focus-within': {
            outline: 'none',
          },
          '& .MuiDataGrid-row': {
            minHeight: '60px !important',
          },
          '& .MuiDataGrid-cell': {
            display: 'flex',
            alignItems: 'center',
          },
        }}
      />
    </Box>
  );
};

export default OnboardingRequestsTable;
