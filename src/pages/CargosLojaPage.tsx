import { useState, useMemo } from 'react';
import { Box, IconButton, CircularProgress, Card, CardContent, Typography, Menu, MenuItem, Button, Badge } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { Eye, Edit, Trash2, Briefcase, MoreHorizontal } from 'lucide-react';
import { DataTable } from '@/components/crud/DataTable';
import { useCargosLoja, CargoLoja, StoreRoleEnum } from '@/hooks/useCargosLoja';
import { CargoAddModal } from '@/components/modals/CargoAddModal';
import { CargoEditModal } from '@/components/modals/CargoEditModal';
import { CargoViewModal } from '@/components/modals/CargoViewModal';

interface ActionCellProps {
  row: CargoLoja;
  onView: (cargo: CargoLoja) => void;
  onEdit: (cargo: CargoLoja) => void;
  onDelete: (cargo: CargoLoja) => void;
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
  onView: (cargo: CargoLoja) => void,
  onEdit: (cargo: CargoLoja) => void,
  onDelete: (cargo: CargoLoja) => void
): GridColDef[] {
  return [
    {
      field: 'role',
      headerName: 'Cargo',
      flex: 1,
      minWidth: 300,
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

export default function CargosLojaPage() {
  const { 
    cargos, 
    isLoading, 
    deleteCargo, 
    createCargo, 
    updateCargo,
    isCreating,
    isUpdating
  } = useCargosLoja();
  
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedCargo, setSelectedCargo] = useState<CargoLoja | null>(null);

  const statsCards = useMemo(() => {
    const cardData = {
      title: "Total de Cargos",
      value: cargos.length,
      icon: "Briefcase",
      color: "primary.main"
    };

    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', mb: 3 }}>
        <Card 
          sx={{ 
            height: '100px',
            background: 'background.paper',
            border: `1px solid ${cardData.color}20`,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 4px 20px ${cardData.color}15`,
              border: `1px solid ${cardData.color}40`
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
                backgroundColor: `${cardData.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: cardData.color
              }}
            >
              <Briefcase size={24} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="h4" 
                sx={{ 
                  color: cardData.color, 
                  fontWeight: 700,
                  mb: 0.5,
                  fontSize: '1.75rem'
                }}
              >
                {cardData.value}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.secondary',
                  fontWeight: 500,
                  fontSize: '0.875rem'
                }}
              >
                {cardData.title}
              </Typography>
            </Box>
            <Box
              sx={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                width: 4,
                backgroundColor: cardData.color,
                borderRadius: '0 12px 12px 0',
                opacity: 0.8
              }}
            />
          </CardContent>
        </Card>
      </Box>
    );
  }, [cargos]);

  const handleView = (cargo: CargoLoja) => {
    setSelectedCargo(cargo);
    setViewModalOpen(true);
  };

  const handleEdit = (cargo: CargoLoja) => {
    setSelectedCargo(cargo);
    setEditModalOpen(true);
  };

  const handleDelete = (cargo: CargoLoja) => {
    if (window.confirm(`Tem certeza que deseja remover o cargo ${cargo.role}?`)) {
      deleteCargo(cargo.id);
    }
  };

  const handleAdd = () => {
    setAddModalOpen(true);
  };

  const handleSaveNew = (data: { role: StoreRoleEnum }) => {
    createCargo(data, {
      onSuccess: () => setAddModalOpen(false)
    });
  };

  const handleSaveUpdate = (data: { role: StoreRoleEnum }) => {
    if (!selectedCargo) return;
    updateCargo({ id: selectedCargo.id, ...data }, {
      onSuccess: () => setEditModalOpen(false)
    });
  };

  const columns = createColumns(handleView, handleEdit, handleDelete);

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
        data={cargos}
        onAdd={handleAdd}
        searchPlaceholder="Pesquisar cargos..."
        title="Cargos de Loja"
        titleIcon={<Briefcase size={32} color="#E3A024" />}
        description="Gerencie os cargos disponíveis para funcionários de loja"
        loading={isLoading}
        customCards={statsCards}
      />

      <CargoAddModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleSaveNew}
        isLoading={isCreating}
      />

      {selectedCargo && (
        <>
          <CargoEditModal
            open={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            cargo={selectedCargo}
            onSave={handleSaveUpdate}
            isLoading={isUpdating}
          />
          <CargoViewModal
            open={viewModalOpen}
            onClose={() => setViewModalOpen(false)}
            cargo={selectedCargo}
          />
        </>
      )}
    </Box>
  );
}