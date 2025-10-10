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
  CardContent
} from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  MessageSquare,
  Building2,
  Bot,
  Users,
  AlertTriangle,
  Bell,
  ShoppingCart
} from 'lucide-react';
import { DataTable } from "@/components/crud/DataTable";
import { WhatsAppGroupViewModal } from "@/components/modals/WhatsAppGroupViewModal";
import { WhatsAppGroupEditModal } from "@/components/modals/WhatsAppGroupEditModal";
import { WhatsAppGroupAddModal } from "@/components/modals/WhatsAppGroupAddModal";
import { useWhatsAppGroups } from "@/hooks/useWhatsAppGroups";
import { WhatsAppGroupWithUnidade, whatsappGroupKindLabels, whatsappGroupKindColors } from "@/types/whatsapp";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

const ActionCell = ({ 
  row, 
  onView, 
  onEdit, 
  onDelete 
}: { 
  row: WhatsAppGroupWithUnidade; 
  onView: (group: WhatsAppGroupWithUnidade) => void; 
  onEdit: (group: WhatsAppGroupWithUnidade) => void; 
  onDelete: (group: WhatsAppGroupWithUnidade) => void 
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

  const handleDelete = () => {
    onDelete(row);
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
        <MenuItem onClick={handleDelete}>
          <Trash2 size={18} style={{ marginRight: 8 }} />
          Excluir
        </MenuItem>
      </Menu>
    </Box>
  );
};

const createColumns = (
  onView: (group: WhatsAppGroupWithUnidade) => void, 
  onEdit: (group: WhatsAppGroupWithUnidade) => void, 
  onDelete: (group: WhatsAppGroupWithUnidade) => void
): GridColDef[] => [
  {
    field: "unidade_info",
    headerName: "Unidade",
    flex: 2.5,
    minWidth: 200,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <Chip
          label={`${params.row.unidade_code} - ${params.row.unidade_name}`}
          variant="outlined"
          size="small"
          color="primary"
          sx={{ 
            maxWidth: '100%',
            '& .MuiChip-label': {
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              maxWidth: '160px'
            }
          }}
        />
      </Box>
    ),
  },
  {
    field: "kind",
    headerName: "Tipo de Grupo",
    flex: 1.8,
    minWidth: 160,
    headerAlign: 'center',
    align: 'center',
    renderCell: (params) => (
      <Chip
        label={whatsappGroupKindLabels[params.value as keyof typeof whatsappGroupKindLabels]}
        color={whatsappGroupKindColors[params.value as keyof typeof whatsappGroupKindColors] as any}
        size="small"
      />
    ),
  },
  {
    field: "group_id",
    headerName: "ID do Grupo",
    flex: 2,
    minWidth: 180,
    renderCell: (params) => (
      <Typography 
        variant="body2" 
        sx={{ 
          fontFamily: 'monospace',
          fontSize: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          height: '100%',
          wordBreak: 'break-all'
        }}
      >
        {params.value}
      </Typography>
    ),
  },
  {
    field: "created_at",
    headerName: "Criado em",
    flex: 1.5,
    minWidth: 140,
    headerAlign: 'center',
    align: 'center',
    renderCell: (params) => (
      <Typography 
        variant="body2" 
        sx={{ 
          display: 'flex',
          alignItems: 'center',
          height: '100%',
          fontSize: '0.875rem'
        }}
      >
        {format(new Date(params.value), 'dd/MM/yyyy', { locale: ptBR })}
      </Typography>
    ),
  },
  {
    field: "actions",
    headerName: "Ações",
    width: 80,
    headerAlign: 'center',
    sortable: false,
    filterable: false,
    renderCell: (params) => <ActionCell row={params.row} onView={onView} onEdit={onEdit} onDelete={onDelete} />,
  },
];

export default function GruposWhatsAppPage() {
  const { groups, isLoading, deleteGroup } = useWhatsAppGroups();
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<WhatsAppGroupWithUnidade | null>(null);

  const statsCards = useMemo(() => {
    const totalGroups = groups.length;
    const groupsByType = groups.reduce((acc, group) => {
      acc[group.kind] = (acc[group.kind] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const uniqueUnits = new Set(groups.map(g => g.unit_id)).size;
    const mainGroups = groupsByType.main || 0;
    const aiGroups = groupsByType.ai || 0;
    const supportGroups = groupsByType.intensive_support || 0;

    const cardData = [
      {
        title: "Total de Grupos",
        value: totalGroups,
        icon: "MessageSquare",
        color: "primary.main",
        bgColor: "primary.light",
      },
      {
        title: "Unidades com Grupos",
        value: uniqueUnits,
        icon: "Building2",
        color: "success.main",
        bgColor: "success.light",
      },
      {
        title: "Grupos Principais",
        value: mainGroups,
        icon: "Users",
        color: "info.main",
        bgColor: "info.light",
      },
      {
        title: "Grupos IA",
        value: aiGroups,
        icon: "Bot",
        color: "secondary.main",
        bgColor: "secondary.light",
      },
      {
        title: "Suporte Intensivo",
        value: supportGroups,
        icon: "AlertTriangle",
        color: "warning.main",
        bgColor: "warning.light",
      },
      {
        title: "Notificações",
        value: groupsByType.notifications || 0,
        icon: "Bell",
        color: "error.main",
        bgColor: "error.light",
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
              case "MessageSquare":
                return <MessageSquare size={24} />;
              case "Building2":
                return <Building2 size={24} />;
              case "Users":
                return <Users size={24} />;
              case "Bot":
                return <Bot size={24} />;
              case "AlertTriangle":
                return <AlertTriangle size={24} />;
              case "Bell":
                return <Bell size={24} />;
              case "ShoppingCart":
                return <ShoppingCart size={24} />;
              default:
                return <MessageSquare size={24} />;
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
  }, [groups]);

  const handleView = (group: WhatsAppGroupWithUnidade) => {
    setSelectedGroup(group);
    setViewModalOpen(true);
  };

  const handleEdit = (group: WhatsAppGroupWithUnidade) => {
    setSelectedGroup(group);
    setEditModalOpen(true);
  };

  const handleDelete = async (group: WhatsAppGroupWithUnidade) => {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o grupo "${whatsappGroupKindLabels[group.kind as keyof typeof whatsappGroupKindLabels]}" da unidade "${group.unidade_name}"?`
    );
    
    if (confirmed) {
      try {
        await deleteGroup(group.id);
      } catch (error) {
        // Error is handled in the hook
      }
    }
  };

  const handleAdd = () => {
    setAddModalOpen(true);
  };

  const columns = createColumns(handleView, handleEdit, handleDelete);

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
        title="Grupos WhatsApp"
        titleIcon={<MessageSquare size={28} color="#1976d2" />}
        description="Gerencie os grupos WhatsApp vinculados às unidades"
        columns={columns}
        data={groups}
        onAdd={handleAdd}
        loading={isLoading}
        searchPlaceholder="Buscar por unidade, tipo ou ID do grupo..."
        customCards={statsCards}
      />

      <WhatsAppGroupViewModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        group={selectedGroup}
      />

      <WhatsAppGroupEditModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        group={selectedGroup}
      />

      <WhatsAppGroupAddModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />
    </>
  );
}