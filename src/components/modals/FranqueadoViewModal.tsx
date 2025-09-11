import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Tabs,
  Tab,
  Typography,
  Chip,
  Divider,
  Avatar,
} from '@mui/material';
import {
  X,
  User,
  Briefcase,
  FileText,
  Users,
  DollarSign,
} from 'lucide-react';
import { useState } from 'react';
import { Tables } from '@/integrations/supabase/types';

type Franqueado = Tables<"franqueados">;

interface FranqueadoViewModalProps {
  open: boolean;
  onClose: () => void;
  franqueado: Franqueado | null;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`franqueado-tabpanel-${index}`}
      aria-labelledby={`franqueado-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `franqueado-tab-${index}`,
    'aria-controls': `franqueado-tabpanel-${index}`,
  };
}

const InfoItem = ({ label, value, fullWidth = false }: { label: string; value: any; fullWidth?: boolean }) => (
  <Box sx={{ mb: 2, ...(fullWidth ? {} : { width: '48%', display: 'inline-block', mr: '2%' }) }}>
    <Typography variant="caption" color="text.secondary" fontWeight="medium">
      {label}
    </Typography>
    <Typography variant="body2" sx={{ mt: 0.5 }}>
      {value || '-'}
    </Typography>
  </Box>
);

const ChipItem = ({ label, value, color = "default" }: { label: string; value: any; color?: any }) => (
  <Box sx={{ mb: 2, width: '48%', display: 'inline-block', mr: '2%' }}>
    <Typography variant="caption" color="text.secondary" fontWeight="medium">
      {label}
    </Typography>
    <Box sx={{ mt: 0.5 }}>
      <Chip
        label={value || 'Não informado'}
        color={value ? color : "default"}
        size="small"
      />
    </Box>
  </Box>
);

export const FranqueadoViewModal = ({ open, onClose, franqueado }: FranqueadoViewModalProps) => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (!franqueado) return null;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR');
  };

  const formatDateOnly = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2);
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
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 48, height: 48 }}>
            {getInitials(franqueado.full_name)}
          </Avatar>
          <Box>
            <Typography variant="h5" component="div">
              {franqueado.full_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {franqueado.contact}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} edge="end">
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ px: 3 }}
          >
            <Tab icon={<User size={16} />} label="Dados Pessoais" {...a11yProps(0)} />
            <Tab icon={<Briefcase size={16} />} label="Profissional" {...a11yProps(1)} />
            <Tab icon={<DollarSign size={16} />} label="Financeiro" {...a11yProps(2)} />
            <Tab icon={<Users size={16} />} label="Referência" {...a11yProps(3)} />
            <Tab icon={<FileText size={16} />} label="Termos" {...a11yProps(4)} />
          </Tabs>
        </Box>

        {/* Dados Pessoais */}
        <TabPanel value={tabValue} index={0}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Informações Básicas
            </Typography>
            
            <InfoItem label="Nome Completo" value={franqueado.full_name} fullWidth />
            <InfoItem label="Contato" value={franqueado.contact} />
            <InfoItem label="CPF/RNM" value={franqueado.cpf_rnm} />
            <InfoItem label="Nacionalidade" value={franqueado.nationality} />
            <InfoItem label="Data de Nascimento" value={franqueado.birth_date ? formatDateOnly(franqueado.birth_date) : null} />
            <InfoItem label="Endereço" value={franqueado.address} fullWidth />
            
            <ChipItem 
              label="Tipo de Proprietário" 
              value={franqueado.owner_type}
              color="primary"
            />
            
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Metadados
            </Typography>
            
            <InfoItem label="Data de Cadastro" value={formatDate(franqueado.created_at)} />
            <InfoItem label="Última Atualização" value={formatDate(franqueado.updated_at)} />
          </Box>
        </TabPanel>

        {/* Profissional */}
        <TabPanel value={tabValue} index={1}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Experiência Profissional
            </Typography>
            
            <InfoItem label="Profissão Anterior" value={franqueado.previous_profession} />
            <InfoItem label="Faixa Salarial Anterior" value={franqueado.previous_salary_range} />
            <InfoItem label="Educação" value={franqueado.education} />
            <InfoItem label="Como Conheceu" value={franqueado.discovery_source} />
            
            <ChipItem 
              label="Foi Empreendedor" 
              value={franqueado.was_entrepreneur ? "Sim" : "Não"}
              color={franqueado.was_entrepreneur ? "success" : "default"}
            />
            <ChipItem 
              label="Possui Outras Atividades" 
              value={franqueado.has_other_activities ? "Sim" : "Não"}
              color={franqueado.has_other_activities ? "warning" : "default"}
            />
            
            {franqueado.has_other_activities && (
              <InfoItem 
                label="Descrição das Outras Atividades" 
                value={franqueado.other_activities_description} 
                fullWidth 
              />
            )}
            
            <InfoItem label="Disponibilidade" value={franqueado.availability} fullWidth />
          </Box>
        </TabPanel>

        {/* Financeiro */}
        <TabPanel value={tabValue} index={2}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Informações Contratuais e Financeiras
            </Typography>
            
            <ChipItem 
              label="Status do Contrato" 
              value={franqueado.is_in_contract ? "Ativo" : "Inativo"}
              color={franqueado.is_in_contract ? "success" : "error"}
            />
            <ChipItem 
              label="Recebe Pró-labore" 
              value={franqueado.receives_prolabore ? "Sim" : "Não"}
              color={franqueado.receives_prolabore ? "success" : "default"}
            />
            
            {franqueado.receives_prolabore && franqueado.prolabore_value && (
              <InfoItem 
                label="Valor do Pró-labore" 
                value={`R$ ${franqueado.prolabore_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                fullWidth
              />
            )}
          </Box>
        </TabPanel>

        {/* Referência */}
        <TabPanel value={tabValue} index={3}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Informações de Referência
            </Typography>
            
            <ChipItem 
              label="Foi Referenciado" 
              value={franqueado.was_referred ? "Sim" : "Não"}
              color={franqueado.was_referred ? "info" : "default"}
            />
            
            {franqueado.was_referred && (
              <>
                <InfoItem label="Nome do Referenciador" value={franqueado.referrer_name} />
                <InfoItem label="Código da Unidade do Referenciador" value={franqueado.referrer_unit_code} />
              </>
            )}
          </Box>
        </TabPanel>

        {/* Termos */}
        <TabPanel value={tabValue} index={4}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Aceite de Termos
            </Typography>
            
            <ChipItem 
              label="Termo do Sistema" 
              value={franqueado.system_term_accepted ? "Aceito" : "Não Aceito"}
              color={franqueado.system_term_accepted ? "success" : "error"}
            />
            <ChipItem 
              label="Termo de Confidencialidade" 
              value={franqueado.confidentiality_term_accepted ? "Aceito" : "Não Aceito"}
              color={franqueado.confidentiality_term_accepted ? "success" : "error"}
            />
            <ChipItem 
              label="Termo LGPD" 
              value={franqueado.lgpd_term_accepted ? "Aceito" : "Não Aceito"}
              color={franqueado.lgpd_term_accepted ? "success" : "error"}
            />
            
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Acesso ao Sistema
            </Typography>
            
            <InfoItem label="Possui Senha de Acesso" value={franqueado.web_password ? "Sim" : "Não"} />
            <InfoItem label="URL da Imagem de Perfil" value={franqueado.profile_image} fullWidth />
          </Box>
        </TabPanel>
      </DialogContent>
    </Dialog>
  );
};