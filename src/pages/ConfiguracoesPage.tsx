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
import { UserPlus, Settings, Shield, Mail, Users, Edit, UserX, UserCheck, Database, RefreshCw, Phone } from 'lucide-react';
import { useUserManagement } from '@/hooks/useUserManagement';
import { useUsers } from '@/hooks/useUsers';
import { User } from '@/types/user';
import { DataTable } from '@/components/crud/DataTable';
import UserEditModal from '@/components/modals/UserEditModal';
import { NormalizacaoNomesModal } from '@/components/modals/NormalizacaoNomesModal';
import { NormalizacaoContatosModal } from '@/components/modals/NormalizacaoContatosModal';
import { useNormalizacaoUnidades } from '@/hooks/useNormalizacaoUnidades';
import { useNormalizacaoContatos } from '@/hooks/useNormalizacaoContatos';
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


const GerenciamentoUsuariosTab = () => {
  const { users, isLoading, updateUser, isUpdating, toggleUserStatus, isTogglingStatus } = useUsers();
  const { createUser, isCreating, reset } = useUserManagement();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Estados do formulário de criação
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
      {/* Seção de Listagem de Usuários */}
      <DataTable
        title="Usuários do Sistema"
        titleIcon={<Users size={20} />}
        description="Visualize e gerencie todos os usuários cadastrados"
        data={users}
        columns={columns}
        loading={isLoading}
      />

      {/* Seção de Criação de Usuário */}
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

const ConfiguracoesPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [normalizacaoModalOpen, setNormalizacaoModalOpen] = useState(false);
  const [normalizacaoContatosModalOpen, setNormalizacaoContatosModalOpen] = useState(false);
  const { unidadesParaNormalizacao, isLoading: isLoadingNormalizacao } = useNormalizacaoUnidades();
  const { contatosParaNormalizacao, isLoading: isLoadingNormalizacaoContatos } = useNormalizacaoContatos();

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
            />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <Box sx={{ p: 3 }}>
          <TabPanel value={tabValue} index={0}>
            <GerenciamentoUsuariosTab />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
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

          <TabPanel value={tabValue} index={2}>
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

          <TabPanel value={tabValue} index={3}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* Seção de Normalização de Nomes das Unidades */}
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

              {/* Seção de Normalização de Contatos */}
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

              {/* Outras configurações do sistema */}
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
        </Box>
      </Paper>

      {/* Modais de Normalização */}
      <NormalizacaoNomesModal
        open={normalizacaoModalOpen}
        onClose={() => setNormalizacaoModalOpen(false)}
      />
      <NormalizacaoContatosModal
        open={normalizacaoContatosModalOpen}
        onClose={() => setNormalizacaoContatosModalOpen(false)}
      />
    </Box>
  );
};

export default ConfiguracoesPage;