import { useState, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Paper,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Chip,
  IconButton,
  Alert
} from '@mui/material';
import { 
  UserPlus, 
  Settings, 
  Shield, 
  Mail, 
  Users, 
  Edit, 
  UserX, 
  UserCheck, 
  Database, 
  RefreshCw, 
  Phone, 
  Webhook, 
  Power, 
  Plus, 
  Trash2,
  UserCog,
  Eye,
  Check,
  X
} from 'lucide-react';
import { useUserManagement } from '@/hooks/useUserManagement';
import { useUsers } from '@/hooks/useUsers';
import { User } from '@/types/user';
import { DataTable } from '@/components/crud/DataTable';
import UserEditModal from '@/components/modals/UserEditModal';
import { NormalizacaoNomesModal } from '@/components/modals/NormalizacaoNomesModal';
import { NormalizacaoContatosModal } from '@/components/modals/NormalizacaoContatosModal';
import NormalizacaoPessoasModal from '@/components/modals/NormalizacaoPessoasModal';
import { useNormalizacaoUnidades } from '@/hooks/useNormalizacaoUnidades';
import { useNormalizacaoContatos } from '@/hooks/useNormalizacaoContatos';
import { useNormalizacaoPessoas } from '@/hooks/useNormalizacaoPessoas';
import { GridColDef } from '@mui/x-data-grid';
import { useWebhookSubscriptions, WebhookSubscription } from '@/hooks/useWebhookSubscriptions';
import { useWebhookDeliveryLogs } from '@/hooks/useWebhookDeliveryLogs';
import { WebhookAddModal } from '@/components/modals/WebhookAddModal';
import { WebhookEditModal } from '@/components/modals/WebhookEditModal';
import { Tooltip } from '@mui/material';
import { RolePermissionsModal } from '@/components/modals/RolePermissionsModal';
import { UserPermissionsModal } from '@/components/modals/UserPermissionsModal';
import { useTablePermissions } from '@/hooks/useTablePermissions';
import { useUserRoles, AppRole } from '@/hooks/useUserRoles';
import { useColaboradoresInterno, ColaboradorInterno } from '@/hooks/useColaboradoresInterno';
import ColaboradorInternoViewModal from '@/components/modals/ColaboradorInternoViewModal';
import { ColaboradorInternoAddModal } from '@/components/modals/ColaboradorInternoAddModal';
import { ColaboradorInternoEditModal } from '@/components/modals/ColaboradorInternoEditModal';
import toast from 'react-hot-toast';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index }: TabPanelProps) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`configuracoes-tabpanel-${index}`}
      aria-labelledby={`configuracoes-tab-${index}`}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const GerenciamentoUsuariosTab = () => {
  const { users, isLoading, updateUser, isUpdating, toggleUserStatus, isTogglingStatus } = useUsers();
  const { createUser, isCreating, reset } = useUserManagement();
  const { userRoles, getRoleByUserId, getRoleLabel } = useUserRoles();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    notes: '',
    role: 'admin' as AppRole
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Nome completo é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Telefone é obrigatório';
    } else if (!/^\d{10,11}$/.test(formData.phone_number.replace(/\D/g, ''))) {
      newErrors.phone_number = 'Telefone deve ter 10 ou 11 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const cleanPhone = formData.phone_number.replace(/\D/g, '');
    
    createUser({
      ...formData,
      phone_number: cleanPhone,
      notes: formData.notes.trim() || undefined
    });
  };

  const handleCancel = () => {
    setFormData({
      full_name: '',
      email: '',
      phone_number: '',
      notes: '',
      role: 'admin' as AppRole
    });
    setErrors({});
    reset();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleEditClose = () => {
    setEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleEditSave = (id: string, updates: Partial<User>) => {
    updateUser({ id, updates });
    handleEditClose();
  };

  const handleToggleStatus = (user: User) => {
    const newStatus = user.status === 'ativo' ? 'inativo' : 'ativo';
    const action = newStatus === 'ativo' ? 'ativar' : 'inativar';
    
    if (window.confirm(`Tem certeza que deseja ${action} o usuário ${user.full_name}?`)) {
      toggleUserStatus({ id: user.id, newStatus });
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'full_name',
      headerName: 'Nome Completo',
      flex: 1,
      minWidth: 180,
    },
    {
      field: 'phone_number',
      headerName: 'Telefone',
      flex: 0.6,
      minWidth: 140,
      valueFormatter: (value) => {
        if (!value) return '';
        const numbers = String(value).replace(/\D/g, '');
        if (numbers.length <= 10) {
          return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      }
    },
    {
      field: 'email',
      headerName: 'E-mail',
      flex: 1.2,
      minWidth: 200,
    },
    {
      field: 'role',
      headerName: 'Perfil',
      flex: 0.5,
      minWidth: 130,
      renderCell: (params) => {
        const role = getRoleByUserId(params.row.user_id);
        return (
          <Chip
            label={role ? getRoleLabel(role) : 'Sem perfil'}
            color={role === 'admin' ? 'primary' : role === 'operador' ? 'secondary' : 'default'}
            size="small"
            variant="outlined"
          />
        );
      }
    },
    {
      field: 'created_at',
      headerName: 'Criado em',
      flex: 0.5,
      minWidth: 120,
      valueFormatter: (value) => {
        if (!value) return '';
        return new Date(value).toLocaleDateString('pt-BR');
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.4,
      minWidth: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value === 'ativo' ? 'Ativo' : 'Inativo'}
          color={params.value === 'ativo' ? 'success' : 'default'}
          size="small"
          variant={params.value === 'ativo' ? 'filled' : 'outlined'}
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Ações',
      flex: 0.8,
      minWidth: 180,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Button
            size="small"
            variant="outlined"
            color="primary"
            startIcon={<Edit size={16} />}
            onClick={() => handleEdit(params.row)}
            disabled={isUpdating || isTogglingStatus}
            sx={{ minWidth: 'auto', px: 1 }}
          >
            Editar
          </Button>
          <Button
            size="small"
            variant="outlined"
            color={params.row.status === 'ativo' ? 'warning' : 'success'}
            startIcon={params.row.status === 'ativo' ? <UserX size={16} /> : <UserCheck size={16} />}
            onClick={() => handleToggleStatus(params.row)}
            disabled={isUpdating || isTogglingStatus}
            sx={{ minWidth: 'auto', px: 1 }}
          >
            {params.row.status === 'ativo' ? 'Inativar' : 'Ativar'}
          </Button>
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <DataTable
        title="Usuários do Sistema"
        titleIcon={<Users size={20} />}
        description="Visualize e gerencie todos os usuários cadastrados"
        data={users}
        columns={columns}
        loading={isLoading}
      />

      <Card>
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <UserPlus size={20} />
              Criar Novo Usuário
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Crie um novo usuário para acessar o sistema. A senha será gerada automaticamente e enviada via WhatsApp e Email.
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <TextField
                fullWidth
                label="Nome Completo"
                variant="outlined"
                placeholder="Digite o nome completo"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                error={!!errors.full_name}
                helperText={errors.full_name}
                disabled={isCreating}
                required
              />
              
              <TextField
                fullWidth
                label="Email"
                type="email"
                variant="outlined"
                placeholder="Digite o email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
                disabled={isCreating}
                required
              />

              <TextField
                fullWidth
                label="Telefone (WhatsApp)"
                variant="outlined"
                placeholder="(11) 99999-9999"
                value={formatPhone(formData.phone_number)}
                onChange={(e) => handleInputChange('phone_number', e.target.value)}
                error={!!errors.phone_number}
                helperText={errors.phone_number || 'Usado para enviar as credenciais via WhatsApp'}
                disabled={isCreating}
                required
              />

              <FormControl fullWidth disabled={isCreating}>
                <InputLabel>Perfil do Usuário</InputLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  label="Perfil do Usuário"
                >
                  <MenuItem value="admin">Administrador</MenuItem>
                  <MenuItem value="operador">Operador</MenuItem>
                  <MenuItem value="franqueado">Franqueado</MenuItem>
                  <MenuItem value="user">Usuário</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <TextField
              fullWidth
              label="Observações"
              multiline
              rows={3}
              variant="outlined"
              placeholder="Observações sobre o usuário (opcional)"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              disabled={isCreating}
            />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined" 
                size="large" 
                onClick={handleCancel}
                disabled={isCreating}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                variant="contained" 
                size="large" 
                startIcon={isCreating ? <CircularProgress size={18} /> : <UserPlus size={18} />}
                disabled={isCreating}
              >
                {isCreating ? 'Criando Usuário...' : 'Criar Usuário'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <UserEditModal
        open={editModalOpen}
        onClose={handleEditClose}
        user={selectedUser}
        onSave={handleEditSave}
        isLoading={isUpdating}
      />
    </Box>
  );
};

const GerenciamentoColaboradoresInternosTab = () => {
  const { colaboradores, isLoading, deleteColaborador, createColaborador, updateColaborador, isCreating } = useColaboradoresInterno();
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedColaborador, setSelectedColaborador] = useState<ColaboradorInterno | null>(null);

  const statsCards = useMemo(() => (
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
      <Card sx={{ flex: 1 }}>
        <CardContent sx={{ py: 2 }}>
          <Typography variant="h5">{colaboradores.length}</Typography>
          <Typography color="text.secondary" variant="body2">Total de Colaboradores</Typography>
        </CardContent>
      </Card>
      <Card sx={{ flex: 1 }}>
        <CardContent sx={{ py: 2 }}>
          <Typography variant="h5">
            {colaboradores.filter(c => c.health_plan).length}
          </Typography>
          <Typography color="text.secondary" variant="body2">Com Plano de Saúde</Typography>
        </CardContent>
      </Card>
      <Card sx={{ flex: 1 }}>
        <CardContent sx={{ py: 2 }}>
          <Typography variant="h5">
            {colaboradores.filter(c => c.meal_voucher_active).length}
          </Typography>
          <Typography color="text.secondary" variant="body2">Com Vale Refeição</Typography>
        </CardContent>
      </Card>
    </Box>
  ), [colaboradores]);

  const handleView = (colab: ColaboradorInterno) => {
    setSelectedColaborador(colab);
    setViewModalOpen(true);
  };

  const handleEdit = (colab: ColaboradorInterno) => {
    setSelectedColaborador(colab);
    setEditModalOpen(true);
  };

  const handleDelete = (colab: ColaboradorInterno) => {
    if (window.confirm(`Tem certeza que deseja remover o colaborador ${colab.employee_name}?`)) {
      deleteColaborador(colab.id);
    }
  };

  const handleAdd = () => {
    setAddModalOpen(true);
  };

  const handleSave = async (data: any) => {
    await createColaborador(data);
    setAddModalOpen(false);
  };

  const columns: GridColDef[] = [
    {
      field: 'employee_name',
      headerName: 'Nome',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'cpf',
      headerName: 'CPF',
      width: 140,
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'phone',
      headerName: 'Telefone',
      width: 140,
    },
    {
      field: 'admission_date',
      headerName: 'Data Admissão',
      width: 130,
      renderCell: (params) => {
        if (!params.value) return '-';
        const [year, month, day] = params.value.split('-');
        return `${day}/${month}/${year}`;
      },
    },
    {
      field: 'salary',
      headerName: 'Salário',
      width: 120,
      renderCell: (params) => `R$ ${params.value}`,
    },
    {
      field: 'health_plan',
      headerName: 'Plano de Saúde',
      width: 140,
      renderCell: (params) => (
        <Chip
          icon={params.value ? <Check size={16} /> : <X size={16} />}
          label={params.value ? 'Sim' : 'Não'}
          color={params.value ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', height: '100%' }}>
          <IconButton size="small" onClick={() => handleView(params.row)} sx={{ color: 'info.main' }}>
            <Eye size={16} />
          </IconButton>
          <IconButton size="small" onClick={() => handleEdit(params.row)} sx={{ color: 'warning.main' }}>
            <Edit size={16} />
          </IconButton>
          <IconButton size="small" onClick={() => handleDelete(params.row)} sx={{ color: 'error.main' }}>
            <Trash2 size={16} />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <DataTable
        columns={columns}
        data={colaboradores}
        onAdd={handleAdd}
        searchPlaceholder="Pesquisar colaboradores internos..."
        title="Colaboradores Internos"
        titleIcon={<UserCog size={32} />}
        description="Gerencie os funcionários da Cresci e Perdi"
        loading={isLoading}
        customCards={statsCards}
      />
      
      <ColaboradorInternoViewModal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedColaborador(null);
        }}
        colaborador={selectedColaborador}
        onEdit={() => {
          setViewModalOpen(false);
          if (selectedColaborador) {
            handleEdit(selectedColaborador);
          }
        }}
      />

      <ColaboradorInternoEditModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedColaborador(null);
        }}
        colaborador={selectedColaborador}
        onUpdate={(id, data) => updateColaborador({ id, ...data })}
      />

      {addModalOpen && (
        <ColaboradorInternoAddModal
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onSave={handleSave}
          isLoading={isCreating}
        />
      )}
    </Box>
  );
};

const PermissoesTab = () => {
  const { users, isLoading: isLoadingUsers } = useUsers();
  const { permissionTables, rolePermissions, isLoading: isLoadingPermissions } = useTablePermissions();
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [userPermModalOpen, setUserPermModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'operador' | 'user' | 'franqueado' | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const roles = [
    { value: 'admin', label: 'Administrador', description: 'Acesso total ao sistema', color: 'error.main' },
    { value: 'operador', label: 'Operador', description: 'Visualização de dados sem edição', color: 'info.main' },
    { value: 'user', label: 'Usuário', description: 'Acesso limitado personalizado', color: 'success.main' },
  ];

  const handleConfigureRole = (role: 'admin' | 'operador' | 'user' | 'franqueado') => {
    setSelectedRole(role);
    setRoleModalOpen(true);
  };

  const handleConfigureUser = (user: User) => {
    setSelectedUser(user);
    setUserPermModalOpen(true);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Card>
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Shield size={20} />
              Permissões por Perfil
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure as permissões padrão para cada perfil de usuário no sistema.
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            {roles.map((role) => (
              <Card variant="outlined" key={role.value}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ color: role.color, mb: 0.5 }}>
                          {role.label}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {role.description}
                        </Typography>
                      </Box>
                      <Shield size={24} style={{ color: role.color }} />
                    </Box>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => handleConfigureRole(role.value as any)}
                      disabled={isLoadingPermissions}
                    >
                      Configurar Permissões
                    </Button>
                  </CardContent>
                </Card>
            ))}
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Users size={20} />
              Permissões Específicas de Usuário
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure permissões individuais que sobrescrevem as permissões do perfil.
            </Typography>
          </Box>

          <DataTable
            title=""
            data={users}
            columns={[
              {
                field: 'full_name',
                headerName: 'Nome',
                flex: 1,
                minWidth: 180,
              },
              {
                field: 'email',
                headerName: 'Email',
                flex: 1,
                minWidth: 200,
              },
              {
                field: 'status',
                headerName: 'Status',
                flex: 0.4,
                minWidth: 100,
                align: 'center',
                headerAlign: 'center',
                renderCell: (params) => (
                  <Chip
                    label={params.value === 'ativo' ? 'Ativo' : 'Inativo'}
                    color={params.value === 'ativo' ? 'success' : 'default'}
                    size="small"
                    variant={params.value === 'ativo' ? 'filled' : 'outlined'}
                  />
                ),
              },
              {
                field: 'actions',
                headerName: 'Ações',
                flex: 0.6,
                minWidth: 150,
                align: 'center',
                headerAlign: 'center',
                sortable: false,
                renderCell: (params) => (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Shield size={16} />}
                    onClick={() => handleConfigureUser(params.row)}
                  >
                    Configurar
                  </Button>
                ),
              },
            ]}
            loading={isLoadingUsers}
            searchPlaceholder="Buscar usuário..."
          />
        </CardContent>
      </Card>

      {selectedRole && (
        <RolePermissionsModal
          open={roleModalOpen}
          onClose={() => {
            setRoleModalOpen(false);
            setSelectedRole(null);
          }}
          role={selectedRole}
          roleDisplayName={roles.find((r) => r.value === selectedRole)?.label || ''}
        />
      )}

      {selectedUser && (
        <UserPermissionsModal
          open={userPermModalOpen}
          onClose={() => {
            setUserPermModalOpen(false);
            setSelectedUser(null);
          }}
          userId={selectedUser.user_id}
          userName={selectedUser.full_name}
        />
      )}
    </Box>
  );
};

const RealtimeWebhooksTab = () => {
  const [realtimeSubTab, setRealtimeSubTab] = useState(0);
  
  const {
    webhooks,
    isLoading,
    createWebhook,
    isCreating,
    updateWebhook,
    isUpdating,
    deleteWebhook,
    isDeleting,
    toggleWebhook,
    isToggling,
  } = useWebhookSubscriptions();

  const {
    logs,
    isLoading: isLoadingLogs,
    deleteLog,
    isDeleting: isDeletingLog,
    deleteAllLogs,
    isDeletingAll
  } = useWebhookDeliveryLogs();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookSubscription | null>(null);

  const handleEdit = (webhook: WebhookSubscription) => {
    setSelectedWebhook(webhook);
    setEditModalOpen(true);
  };

  const handleDelete = (webhook: WebhookSubscription) => {
    const displayName = webhook.nickname || webhook.endpoint_url;
    if (window.confirm(`Tem certeza que deseja remover o webhook "${displayName}"?`)) {
      deleteWebhook(webhook.id);
    }
  };

  const handleToggle = (webhook: WebhookSubscription) => {
    toggleWebhook({ id: webhook.id, enabled: !webhook.enabled });
  };

  const columns: GridColDef[] = [
    {
      field: 'endpoint_url',
      headerName: 'Webhook',
      flex: 1.5,
      minWidth: 300,
      renderCell: (params: any) => {
        const webhook = params.row as WebhookSubscription;
        return (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: webhook.nickname ? 600 : 400 }}>
              {webhook.nickname || webhook.endpoint_url}
            </Typography>
            {webhook.nickname && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {webhook.endpoint_url}
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      field: 'topic',
      headerName: 'Tópico',
      flex: 0.8,
      minWidth: 150,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          variant="outlined"
          color={params.value === 'generic' ? 'primary' : 'default'}
        />
      ),
    },
    {
      field: 'enabled',
      headerName: 'Status',
      flex: 0.4,
      minWidth: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Ativo' : 'Inativo'}
          color={params.value ? 'success' : 'default'}
          size="small"
          variant={params.value ? 'filled' : 'outlined'}
        />
      ),
    },
    {
      field: 'created_at',
      headerName: 'Criado em',
      flex: 0.6,
      minWidth: 140,
      valueFormatter: (value) => {
        if (!value) return '';
        return new Date(value).toLocaleDateString('pt-BR');
      },
    },
    {
      field: 'actions',
      headerName: 'Ações',
      flex: 1,
      minWidth: 220,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Button
            size="small"
            variant="outlined"
            color={params.row.enabled ? 'warning' : 'success'}
            startIcon={<Power size={16} />}
            onClick={() => handleToggle(params.row)}
            disabled={isToggling || isDeleting}
            sx={{ minWidth: 'auto', px: 1 }}
          >
            {params.row.enabled ? 'Desativar' : 'Ativar'}
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="primary"
            startIcon={<Edit size={16} />}
            onClick={() => handleEdit(params.row)}
            disabled={isUpdating || isDeleting}
            sx={{ minWidth: 'auto', px: 1 }}
          >
            Editar
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<Trash2 size={16} />}
            onClick={() => handleDelete(params.row)}
            disabled={isDeleting || isUpdating}
            sx={{ minWidth: 'auto', px: 1 }}
          >
            Remover
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Webhook size={20} />
              Sincronização Real-time
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure webhooks para receber eventos de alterações nas tabelas em tempo real e visualize os logs de entregas.
            </Typography>
          </Box>

          <Tabs 
            value={realtimeSubTab} 
            onChange={(_, newValue) => setRealtimeSubTab(newValue)}
            sx={{ mb: 2 }}
          >
            <Tab label="Webhooks" />
            <Tab label="Logs de Entrega" />
          </Tabs>

          {realtimeSubTab === 0 && (
            <>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Card variant="outlined" sx={{ flex: 1 }}>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="h4" color="primary">
                      {isLoading ? '-' : webhooks.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Webhooks Cadastrados
                    </Typography>
                  </CardContent>
                </Card>

                <Card variant="outlined" sx={{ flex: 1 }}>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="h4" color="success.main">
                      {isLoading ? '-' : webhooks.filter((w) => w.enabled).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Webhooks Ativos
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              <Button
                variant="contained"
                color="primary"
                startIcon={<Plus size={18} />}
                onClick={() => setAddModalOpen(true)}
                disabled={isCreating}
              >
                Adicionar Webhook
              </Button>
            </>
          )}

          {realtimeSubTab === 1 && (
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Card variant="outlined" sx={{ flex: 1 }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color="primary">
                    {isLoadingLogs ? '-' : logs.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total de Logs
                  </Typography>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ flex: 1 }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color="success.main">
                    {isLoadingLogs ? '-' : logs.filter((l) => l.success).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Entregas com Sucesso
                  </Typography>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ flex: 1 }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color="error.main">
                    {isLoadingLogs ? '-' : logs.filter((l) => !l.success).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Falhas
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          )}
        </CardContent>
      </Card>

      {realtimeSubTab === 0 && (
        <>
          <DataTable
            title="Webhooks Cadastrados"
            titleIcon={<Database size={20} />}
            description="Gerencie os webhooks que receberão eventos de sincronização"
            data={webhooks}
            columns={columns}
            loading={isLoading}
          />

          <WebhookAddModal
            open={addModalOpen}
            onClose={() => setAddModalOpen(false)}
            onSave={(webhook) => createWebhook(webhook)}
            isLoading={isCreating}
          />

          <WebhookEditModal
            open={editModalOpen}
            onClose={() => {
              setEditModalOpen(false);
              setSelectedWebhook(null);
            }}
            webhook={selectedWebhook}
            onSave={(id, updates) => updateWebhook({ id, updates })}
            isLoading={isUpdating}
          />
        </>
      )}

      {realtimeSubTab === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Trash2 size={16} />}
              onClick={() => {
                if (window.confirm('Tem certeza que deseja apagar todos os logs?')) {
                  deleteAllLogs();
                }
              }}
              disabled={isDeletingAll || logs.length === 0}
            >
              Limpar Todos os Logs
            </Button>
          </Box>

          <DataTable
            title="Logs de Entrega de Webhooks"
            titleIcon={<Database size={20} />}
            description="Histórico de todas as entregas de webhooks realizadas pelo sistema"
            columns={[
              { 
                field: 'dispatched_at', 
                headerName: 'Data/Hora', 
                flex: 0.8,
                minWidth: 180,
                renderCell: (params: any) => {
                  if (!params.row.dispatched_at) return 'N/A';
                  const date = new Date(params.row.dispatched_at);
                  return date.toLocaleString('pt-BR');
                }
              },
              { 
                field: 'subscription_id', 
                headerName: 'Webhook', 
                flex: 1,
                minWidth: 200,
                renderCell: (params: any) => {
                  const webhook = webhooks.find(w => w.id === params.row.subscription_id);
                  if (!webhook) return 'N/A';
                  const displayName = webhook.nickname || webhook.endpoint_url;
                  return (
                    <Tooltip title={webhook.endpoint_url}>
                      <span style={{ cursor: 'pointer' }}>
                        {displayName}
                      </span>
                    </Tooltip>
                  );
                }
              },
              { 
                field: 'status_code', 
                headerName: 'Status', 
                flex: 0.4,
                minWidth: 100,
                align: 'center',
                headerAlign: 'center',
                renderCell: (params: any) => (
                  <Chip 
                    label={params.row.status_code || 'N/A'}
                    color={params.row.success ? 'success' : 'error'}
                    size="small"
                  />
                )
              },
              { 
                field: 'success', 
                headerName: 'Resultado', 
                flex: 0.5,
                minWidth: 120,
                align: 'center',
                headerAlign: 'center',
                renderCell: (params: any) => (
                  <Chip 
                    label={params.row.success ? 'Sucesso' : 'Falha'}
                    color={params.row.success ? 'success' : 'error'}
                    size="small"
                    variant="outlined"
                  />
                )
              },
              { 
                field: 'attempt', 
                headerName: 'Tentativa', 
                flex: 0.4,
                minWidth: 100,
                align: 'center',
                headerAlign: 'center',
              },
              {
                field: 'request_body',
                headerName: 'Request',
                flex: 1,
                minWidth: 200,
                renderCell: (params: any) => {
                  const table = params.row.request_body?.table || 'N/A';
                  const fullText = JSON.stringify(params.row.request_body, null, 2);
                  return (
                    <Tooltip title={<pre style={{ fontSize: '11px' }}>{fullText}</pre>}>
                      <span style={{ cursor: 'pointer' }}>Tabela: {table}</span>
                    </Tooltip>
                  );
                }
              },
              {
                field: 'response_body',
                headerName: 'Response',
                flex: 1,
                minWidth: 250,
                renderCell: (params: any) => {
                  if (!params.row.response_body) return 'N/A';
                  
                  let displayText = params.row.response_body;
                  try {
                    const parsed = JSON.parse(params.row.response_body);
                    displayText = parsed.message || parsed.code || displayText;
                  } catch (e) {
                    // Keep original if not JSON
                  }
                  
                  return (
                    <Tooltip title={<pre style={{ fontSize: '11px' }}>{params.row.response_body}</pre>}>
                      <span style={{ cursor: 'pointer' }}>
                        {displayText.length > 50 ? displayText.substring(0, 50) + '...' : displayText}
                      </span>
                    </Tooltip>
                  );
                }
              },
              {
                field: 'error_message',
                headerName: 'Erro',
                flex: 0.8,
                minWidth: 200,
                renderCell: (params: any) => {
                  if (!params.row.error_message) return '-';
                  return (
                    <Tooltip title={params.row.error_message}>
                      <span style={{ color: 'red', cursor: 'pointer' }}>
                        {params.row.error_message.substring(0, 30)}...
                      </span>
                    </Tooltip>
                  );
                }
              }
            ]}
            data={logs}
            searchPlaceholder="Buscar logs..."
            loading={isLoadingLogs}
            onDelete={(log) => {
              if (window.confirm('Tem certeza que deseja deletar este log?')) {
                deleteLog(log.id);
              }
            }}
          />
        </Box>
      )}
    </Box>
  );
};

const ConfiguracoesPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [normalizacaoModalOpen, setNormalizacaoModalOpen] = useState(false);
  const [normalizacaoContatosModalOpen, setNormalizacaoContatosModalOpen] = useState(false);
  const [normalizacaoPessoasModalOpen, setNormalizacaoPessoasModalOpen] = useState(false);
  const { unidadesParaNormalizacao, isLoading: isLoadingNormalizacao } = useNormalizacaoUnidades();
  const { contatosParaNormalizacao, isLoading: isLoadingNormalizacaoContatos } = useNormalizacaoContatos();
  const { pessoasParaNormalizacao, isLoading: isLoadingNormalizacaoPessoas } = useNormalizacaoPessoas();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Settings size={32} color="#1976d2" />
          Configurações
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gerencie as configurações do sistema e usuários
        </Typography>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="configurações tabs"
            sx={{ px: 2 }}
          >
            <Tab 
              icon={<Users size={18} />} 
              label="Gerenciar Usuários" 
              iconPosition="start"
              sx={{ textTransform: 'none', fontWeight: 500 }}
            />
            <Tab 
              icon={<UserCog size={18} />} 
              label="Colab. Internos" 
              iconPosition="start"
              sx={{ textTransform: 'none', fontWeight: 500 }}
            />
            <Tab 
              icon={<Shield size={18} />} 
              label="Permissões" 
              iconPosition="start"
              sx={{ textTransform: 'none', fontWeight: 500 }}
            />
            <Tab 
              icon={<Mail size={18} />} 
              label="Notificações" 
              iconPosition="start"
              sx={{ textTransform: 'none', fontWeight: 500 }}
              disabled
            />
            <Tab 
              icon={<Settings size={18} />} 
              label="Sistema" 
              iconPosition="start"
              sx={{ textTransform: 'none', fontWeight: 500 }}
            />
            <Tab 
              icon={<Webhook size={18} />} 
              label="Real-time" 
              iconPosition="start"
              sx={{ textTransform: 'none', fontWeight: 500 }}
            />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          <TabPanel value={tabValue} index={0}>
            <GerenciamentoUsuariosTab />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <GerenciamentoColaboradoresInternosTab />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <PermissoesTab />
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Configurações de Notificações
                </Typography>
                <Typography color="text.secondary">
                  Esta funcionalidade será implementada em breve.
                </Typography>
              </CardContent>
            </Card>
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Card>
                <CardContent>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Database size={20} />
                      Normalização de Nomes das Unidades
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Identifique e corrija divergências nos nomes das unidades usando os dados da tabela de referência.
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <Card variant="outlined" sx={{ flex: 1 }}>
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="h4" color="primary">
                          {isLoadingNormalizacao ? '-' : unidadesParaNormalizacao.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Unidades para Normalizar
                        </Typography>
                      </CardContent>
                    </Card>

                    <Card variant="outlined" sx={{ flex: 1 }}>
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Chip
                          label={
                            isLoadingNormalizacao 
                              ? "Carregando..." 
                              : unidadesParaNormalizacao.length === 0 
                                ? "Tudo Normalizado" 
                                : "Normalização Pendente"
                          }
                          color={
                            isLoadingNormalizacao 
                              ? "default" 
                              : unidadesParaNormalizacao.length === 0 
                                ? "success" 
                                : "warning"
                          }
                          variant="outlined"
                        />
                      </CardContent>
                    </Card>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<RefreshCw size={18} />}
                      onClick={() => setNormalizacaoModalOpen(true)}
                      disabled={isLoadingNormalizacao}
                    >
                      Verificar Unidades para Normalização
                    </Button>
                  </Box>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Phone size={20} />
                      Normalização de Contatos dos Franqueados
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Identifique e corrija contatos que contêm caracteres especiais, deixando apenas números.
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <Card variant="outlined" sx={{ flex: 1 }}>
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="h4" color="primary">
                          {isLoadingNormalizacaoContatos ? '-' : contatosParaNormalizacao.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Contatos para Normalizar
                        </Typography>
                      </CardContent>
                    </Card>

                    <Card variant="outlined" sx={{ flex: 1 }}>
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Chip
                          label={
                            isLoadingNormalizacaoContatos 
                              ? "Carregando..." 
                              : contatosParaNormalizacao.length === 0 
                                ? "Tudo Normalizado" 
                                : "Normalização Pendente"
                          }
                          color={
                            isLoadingNormalizacaoContatos 
                              ? "default" 
                              : contatosParaNormalizacao.length === 0 
                                ? "success" 
                                : "warning"
                          }
                          variant="outlined"
                        />
                      </CardContent>
                    </Card>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<RefreshCw size={18} />}
                      onClick={() => setNormalizacaoContatosModalOpen(true)}
                      disabled={isLoadingNormalizacaoContatos}
                    >
                      Verificar Contatos para Normalização
                    </Button>
                  </Box>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Users size={20} />
                      Normalização de Nomes de Pessoas
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Normalize nomes de franqueados, clientes e colaboradores para o formato Title Case (primeira letra maiúscula).
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <Card variant="outlined" sx={{ flex: 1 }}>
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="h4" color="primary">
                          {isLoadingNormalizacaoPessoas ? '-' : pessoasParaNormalizacao.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Nomes para Normalizar
                        </Typography>
                      </CardContent>
                    </Card>

                    <Card variant="outlined" sx={{ flex: 1 }}>
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <Chip
                          label={
                            isLoadingNormalizacaoPessoas 
                              ? "Carregando..." 
                              : pessoasParaNormalizacao.length === 0 
                                ? "Tudo Normalizado" 
                                : "Normalização Pendente"
                          }
                          color={
                            isLoadingNormalizacaoPessoas 
                              ? "default" 
                              : pessoasParaNormalizacao.length === 0 
                                ? "success" 
                                : "warning"
                          }
                          variant="outlined"
                        />
                      </CardContent>
                    </Card>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<RefreshCw size={18} />}
                      onClick={() => setNormalizacaoPessoasModalOpen(true)}
                      disabled={isLoadingNormalizacaoPessoas}
                    >
                      Verificar Nomes para Normalização
                    </Button>
                  </Box>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Outras Configurações
                  </Typography>
                  <Typography color="text.secondary">
                    Outras funcionalidades do sistema serão implementadas em breve.
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={5}>
            <RealtimeWebhooksTab />
          </TabPanel>
        </Box>
      </Paper>

      <NormalizacaoNomesModal
        open={normalizacaoModalOpen}
        onClose={() => setNormalizacaoModalOpen(false)}
      />
      <NormalizacaoContatosModal
        open={normalizacaoContatosModalOpen}
        onClose={() => setNormalizacaoContatosModalOpen(false)}
      />
      <NormalizacaoPessoasModal
        open={normalizacaoPessoasModalOpen}
        onClose={() => setNormalizacaoPessoasModalOpen(false)}
      />
    </Box>
  );
};

export default ConfiguracoesPage;