import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  Tab,
  Tabs,
  Stack,
  IconButton,
  Alert,
  AlertTitle,
} from '@mui/material';
import { useState } from 'react';
import { X, FileCheck, FileX, User, Building, MapPin, Clock, Info, Key, Copy } from 'lucide-react';
import { OnboardingRequest } from '../../types/onboarding';
import { formatCPF, formatCNPJ, formatPhone, formatCEP, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

interface OnboardingViewModalProps {
  open: boolean;
  onClose: () => void;
  request: OnboardingRequest;
  onApprove: () => void;
  onReject: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index }: TabPanelProps) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const InfoRow = ({ label, value }: { label: string; value: string | number | boolean | undefined }) => (
  <Box sx={{ display: 'flex', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
    <Typography variant="body2" color="text.secondary" sx={{ width: '40%', fontWeight: 500 }}>
      {label}:
    </Typography>
    <Typography variant="body2" sx={{ width: '60%' }}>
      {value !== undefined && value !== null ? String(value) : '-'}
    </Typography>
  </Box>
);

/**
 * Modal de visualização completa de uma solicitação de onboarding
 * Exibe todas as informações em abas organizadas
 */
const OnboardingViewModal = ({
  open,
  onClose,
  request,
  onApprove,
  onReject,
}: OnboardingViewModalProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const formData = request.form_data;

  const getStatusColor = () => {
    switch (request.status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'processing': return 'info';
      default: return 'default';
    }
  };

  const handleCopyPassword = () => {
    const password = request.processing_result?.system_password;
    if (password) {
      navigator.clipboard.writeText(String(password));
      toast.success('Senha copiada para a área de transferência!');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { height: '90vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" component="div">
              Detalhes da Solicitação
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Protocolo: {request.request_number}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={request.status.toUpperCase()}
              color={getStatusColor()}
              size="small"
            />
            <IconButton size="small" onClick={onClose}>
              <X size={20} />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}
      >
        <Tab icon={<User size={16} />} label="Franqueado" iconPosition="start" />
        <Tab icon={<Building size={16} />} label="Unidade" iconPosition="start" />
        <Tab icon={<Clock size={16} />} label="Horários" iconPosition="start" />
        <Tab icon={<Info size={16} />} label="Outras Informações" iconPosition="start" />
      </Tabs>

      <DialogContent dividers>
        {/* Alert de senha gerada (quando aprovado) */}
        {request.status === 'approved' && request.processing_result?.system_password && (
          <Alert 
            severity="success" 
            icon={<Key size={20} />}
            sx={{ mb: 3 }}
            action={
              <IconButton
                color="inherit"
                size="small"
                onClick={handleCopyPassword}
                title="Copiar senha"
              >
                <Copy size={18} />
              </IconButton>
            }
          >
            <AlertTitle>✅ Cadastro Aprovado - Senha Gerada</AlertTitle>
            <Typography variant="body2">
              A senha do sistema para o franqueado foi gerada automaticamente:
            </Typography>
            <Box sx={{ 
              mt: 1, 
              p: 2, 
              bgcolor: 'background.default', 
              borderRadius: 1,
              fontFamily: 'monospace',
              fontSize: '1.2rem',
              fontWeight: 700,
              letterSpacing: 2,
              textAlign: 'center',
              border: '2px solid',
              borderColor: 'success.main'
            }}>
              {request.processing_result.system_password}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Esta senha é baseada no código da unidade ({request.form_data.group_code}) e já foi salva no cadastro do franqueado.
            </Typography>
          </Alert>
        )}

        {/* Alert de rejeição */}
        {request.status === 'rejected' && request.rejection_reason && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <AlertTitle>❌ Cadastro Rejeitado</AlertTitle>
            <Typography variant="body2">
              <strong>Motivo:</strong> {request.rejection_reason}
            </Typography>
          </Alert>
        )}
        {/* Aba 1: Dados do Franqueado */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ px: 3 }}>
            <Typography variant="subtitle1" gutterBottom fontWeight={600}>
              Dados Pessoais
            </Typography>
            <InfoRow label="Nome Completo" value={formData.full_name} />
            <InfoRow label="CPF/RNM" value={formatCPF(formData.cpf_rnm)} />
            <InfoRow label="Email" value={formData.email} />
            <InfoRow label="Telefone" value={formatPhone(formData.phone)} />
            <InfoRow label="Contato Alternativo" value={formatPhone(formData.contact)} />
            <InfoRow label="Data de Nascimento" value={formatDate(formData.birth_date)} />
            <InfoRow label="Nacionalidade" value={formData.nationality} />
            <InfoRow label="Escolaridade" value={formData.education} />
            <InfoRow label="Instagram" value={formData.instagram} />

            <Typography variant="subtitle1" gutterBottom fontWeight={600} sx={{ mt: 3 }}>
              Endereço do Franqueado
            </Typography>
            <InfoRow label="Endereço" value={formData.franchisee_address} />
            <InfoRow label="Número" value={formData.franchisee_number_address} />
            <InfoRow label="Complemento" value={formData.franchisee_address_complement || '-'} />
            <InfoRow label="Bairro" value={formData.franchisee_neighborhood} />
            <InfoRow label="Cidade/UF" value={`${formData.franchisee_city} / ${formData.franchisee_uf}`} />
            <InfoRow label="CEP" value={formatCEP(formData.franchisee_postal_code)} />
          </Box>
        </TabPanel>

        {/* Aba 2: Dados da Unidade */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ px: 3 }}>
            <Typography variant="subtitle1" gutterBottom fontWeight={600}>
              Informações da Unidade
            </Typography>
            <InfoRow label="CNPJ" value={formatCNPJ(formData.cnpj)} />
            <InfoRow label="Nome Fantasia" value={formData.fantasy_name} />
            <InfoRow label="Código do Grupo" value={formData.group_code} />
            <InfoRow label="Nome do Grupo" value={formData.group_name} />
            <InfoRow label="Modelo da Loja" value={formData.store_model} />
            <InfoRow label="Fase da Loja" value={formData.store_phase} />
            <InfoRow label="Fase de Implantação" value={formData.store_imp_phase} />

            <Typography variant="subtitle1" gutterBottom fontWeight={600} sx={{ mt: 3 }}>
              Endereço da Unidade
            </Typography>
            <InfoRow label="Endereço" value={formData.unit_address} />
            <InfoRow label="Número" value={formData.unit_number_address} />
            <InfoRow label="Complemento" value={formData.unit_address_complement || '-'} />
            <InfoRow label="Bairro" value={formData.unit_neighborhood} />
            <InfoRow label="Cidade/UF" value={`${formData.unit_city} / ${formData.unit_uf}`} />
            <InfoRow label="CEP" value={formatCEP(formData.unit_postal_code)} />

            <Typography variant="subtitle1" gutterBottom fontWeight={600} sx={{ mt: 3 }}>
              Estacionamento
            </Typography>
            <InfoRow label="Possui Estacionamento" value={formData.has_parking ? 'Sim' : 'Não'} />
            <InfoRow label="Vagas" value={formData.parking_spots || '-'} />
            <InfoRow label="Estacionamento Parceiro" value={formData.has_partner_parking ? 'Sim' : 'Não'} />
            <InfoRow label="Endereço do Parceiro" value={formData.partner_parking_address || '-'} />
          </Box>
        </TabPanel>

        {/* Aba 3: Horários */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ px: 3 }}>
            <Typography variant="subtitle1" gutterBottom fontWeight={600}>
              Horários de Funcionamento
            </Typography>
            <InfoRow label="Segunda-feira" value={formData.operation_mon} />
            <InfoRow label="Terça-feira" value={formData.operation_tue} />
            <InfoRow label="Quarta-feira" value={formData.operation_wed} />
            <InfoRow label="Quinta-feira" value={formData.operation_thu} />
            <InfoRow label="Sexta-feira" value={formData.operation_fri} />
            <InfoRow label="Sábado" value={formData.operation_sat} />
            <InfoRow label="Domingo" value={formData.operation_sun} />
            <InfoRow label="Feriados" value={formData.operation_hol} />
          </Box>
        </TabPanel>

        {/* Aba 4: Outras Informações */}
        <TabPanel value={activeTab} index={3}>
          <Box sx={{ px: 3 }}>
            <Typography variant="subtitle1" gutterBottom fontWeight={600}>
              Informações Profissionais
            </Typography>
            <InfoRow label="Tipo de Proprietário" value={formData.owner_type} />
            <InfoRow label="Disponibilidade" value={formData.availability} />
            <InfoRow label="Fonte de Descoberta" value={formData.discovery_source} />
            <InfoRow label="Foi Empreendedor" value={formData.was_entrepreneur ? 'Sim' : 'Não'} />
            <InfoRow label="Profissão Anterior" value={formData.previous_profession} />
            <InfoRow label="Faixa Salarial Anterior" value={formData.previous_salary_range} />
            <InfoRow label="Outras Atividades" value={formData.has_other_activities ? 'Sim' : 'Não'} />
            <InfoRow label="Descrição" value={formData.other_activities_description || '-'} />

            <Typography variant="subtitle1" gutterBottom fontWeight={600} sx={{ mt: 3 }}>
              Informações Financeiras
            </Typography>
            <InfoRow label="Recebe Pró-labore" value={formData.receives_prolabore ? 'Sim' : 'Não'} />
            <InfoRow label="Valor do Pró-labore" value={formData.prolabore_value || '-'} />

            <Typography variant="subtitle1" gutterBottom fontWeight={600} sx={{ mt: 3 }}>
              Indicação
            </Typography>
            <InfoRow label="Foi Indicado" value={formData.was_referred ? 'Sim' : 'Não'} />
            <InfoRow label="Nome do Indicador" value={formData.referrer_name || '-'} />
            <InfoRow label="Código da Unidade" value={formData.referrer_unit_code || '-'} />

            <Typography variant="subtitle1" gutterBottom fontWeight={600} sx={{ mt: 3 }}>
              Configurações da Unidade
            </Typography>
            <InfoRow label="Vendas Ativas" value={formData.sales_active ? 'Sim' : 'Não'} />
            <InfoRow label="Compras Ativas" value={formData.purchases_active ? 'Sim' : 'Não'} />

            <Typography variant="subtitle1" gutterBottom fontWeight={600} sx={{ mt: 3 }}>
              Termos Aceitos
            </Typography>
            <InfoRow label="Termo LGPD" value={formData.lgpd_term_accepted ? '✅ Aceito' : '❌ Não aceito'} />
            <InfoRow label="Termo de Sistema" value={formData.system_term_accepted ? '✅ Aceito' : '❌ Não aceito'} />
            <InfoRow label="Termo de Confidencialidade" value={formData.confidentiality_term_accepted ? '✅ Aceito' : '❌ Não aceito'} />
          </Box>
        </TabPanel>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
        <Button onClick={onClose} variant="outlined">
          Fechar
        </Button>
        {request.status === 'pending' && (
          <Stack direction="row" spacing={2}>
            <Button
              onClick={onReject}
              variant="outlined"
              color="error"
              startIcon={<FileX size={18} />}
            >
              Rejeitar
            </Button>
            <Button
              onClick={onApprove}
              variant="contained"
              color="success"
              startIcon={<FileCheck size={18} />}
            >
              Aprovar
            </Button>
          </Stack>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default OnboardingViewModal;
