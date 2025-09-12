import { useState } from 'react';
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
  CircularProgress
} from '@mui/material';
import { Chip } from '@mui/material';
import { UserPlus, Settings, Shield, Mail, Users } from 'lucide-react';
import { useUserManagement } from '@/hooks/useUserManagement';
import { useUsers } from '@/hooks/useUsers';
import { User } from '@/types/user';
import { DataTable } from '@/components/crud/DataTable';
import UserEditModal from '@/components/modals/UserEditModal';
import { GridColDef } from '@mui/x-data-grid';

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

const CriacaoUsuarioTab = () => {
  const { createUser, isCreating, reset } = useUserManagement();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    notes: ''
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

    // Limpar telefone (apenas números)
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
      notes: ''
    });
    setErrors({});
    reset();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando o usuário começar a digitar
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

  return (
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

            <Box sx={{ display: 'flex', alignItems: 'center', p: 2, backgroundColor: 'info.light', borderRadius: 1 }}>
              <Typography variant="body2" color="info.dark">
                <strong>Senha:</strong> Será gerada automaticamente e enviada via WhatsApp e Email
              </Typography>
            </Box>
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
  );
};

const GerenciamentoUsuariosTab = () => {
  const { users, isLoading, updateUser, isUpdating, deleteUser, isDeleting } = useUsers();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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

  const handleDelete = (user: User) => {
    if (window.confirm(`Tem certeza que deseja excluir o usuário ${user.full_name}?`)) {
      deleteUser(user.id);
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'full_name',
      headerName: 'Nome Completo',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'phone_number',
      headerName: 'Telefone',
      width: 150,
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
      field: 'status',
      headerName: 'Status',
      width: 120,
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
      field: 'created_at',
      headerName: 'Criado em',
      width: 120,
      valueFormatter: (value) => {
        if (!value) return '';
        return new Date(value).toLocaleDateString('pt-BR');
      }
    },
    {
      field: 'notes',
      headerName: 'Observações',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '100%'
        }}>
          {params.value || '-'}
        </Typography>
      )
    }
  ];

  return (
    <>
      <DataTable
        title="Gerenciamento de Usuários"
        titleIcon={<Users size={20} />}
        description="Visualize e gerencie todos os usuários do sistema"
        data={users}
        columns={columns}
        loading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <UserEditModal
        open={editModalOpen}
        onClose={handleEditClose}
        user={selectedUser}
        onSave={handleEditSave}
        isLoading={isUpdating}
      />
    </>
  );
};

const ConfiguracoesPage = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Settings size={32} color="#1976d2" />
          Configurações
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gerencie as configurações do sistema e usuários
        </Typography>
      </Box>

      {/* Tabs Container */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="configurações tabs"
            sx={{ px: 2 }}
          >
            <Tab 
              icon={<UserPlus size={18} />} 
              label="Criar Usuário" 
              iconPosition="start"
              sx={{ textTransform: 'none', fontWeight: 500 }}
            />
            <Tab 
              icon={<Users size={18} />} 
              label="Gerenciar Usuários" 
              iconPosition="start"
              sx={{ textTransform: 'none', fontWeight: 500 }}
            />
            <Tab 
              icon={<Shield size={18} />} 
              label="Permissões" 
              iconPosition="start"
              sx={{ textTransform: 'none', fontWeight: 500 }}
              disabled
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
              disabled
            />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <Box sx={{ p: 3 }}>
          <TabPanel value={tabValue} index={0}>
            <CriacaoUsuarioTab />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <GerenciamentoUsuariosTab />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Gerenciamento de Permissões
                </Typography>
                <Typography color="text.secondary">
                  Esta funcionalidade será implementada em breve.
                </Typography>
              </CardContent>
            </Card>
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
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Configurações do Sistema
                </Typography>
                <Typography color="text.secondary">
                  Esta funcionalidade será implementada em breve.
                </Typography>
              </CardContent>
            </Card>
          </TabPanel>
        </Box>
      </Paper>
    </Box>
  );
};

export default ConfiguracoesPage;