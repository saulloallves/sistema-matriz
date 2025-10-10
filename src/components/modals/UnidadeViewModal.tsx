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
  Card,
  CardContent,
} from '@mui/material';
import {
  X,
  Info,
  Phone as ContactPhone,
  Clock,
  Link,
  MapPin,
  Instagram,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useState } from 'react';
import { Tables } from '@/integrations/supabase/types';

type Unidade = Tables<"unidades">;

interface UnidadeViewModalProps {
  open: boolean;
  onClose: () => void;
  unidade: Unidade | null;
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
      id={`unidade-tabpanel-${index}`}
      aria-labelledby={`unidade-tab-${index}`}
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
    id: `unidade-tab-${index}`,
    'aria-controls': `unidade-tabpanel-${index}`,
  };
}

const InfoItem = ({ label, value, fullWidth = false, onToggleVisibility, showValue = true }: { 
  label: string; 
  value: any; 
  fullWidth?: boolean; 
  onToggleVisibility?: () => void; 
  showValue?: boolean;
}) => (
  <Box sx={{ mb: 2, ...(fullWidth ? {} : { width: '48%', display: 'inline-block', mr: '2%' }) }}>
    <Typography variant="caption" color="text.secondary" fontWeight="medium">
      {label}
    </Typography>
    <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="body2" sx={{ flex: 1 }}>
        {value || '-'}
      </Typography>
      {onToggleVisibility && (
        <IconButton size="small" onClick={onToggleVisibility}>
          {showValue ? <EyeOff size={16} /> : <Eye size={16} />}
        </IconButton>
      )}
    </Box>
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

export const UnidadeViewModal = ({ open, onClose, unidade }: UnidadeViewModalProps) => {
  const [tabValue, setTabValue] = useState(0);
  const [showInstagramPassword, setShowInstagramPassword] = useState(false);
  const [showBearerToken, setShowBearerToken] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (!unidade) return null;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR');
  };

  const getStoreModelColor = (model: string) => {
    const colorMap: Record<string, string> = {
      junior: "default",
      light: "secondary",
      padrao: "primary",
      intermediaria: "info",
      mega_store: "error",
      pontinha: "warning"
    };
    return colorMap[model] || "default";
  };

  const getImpPhaseLabel = (phase: string | null) => {
    const phaseMap: Record<string, string> = {
      integracao: "Integração",
      treinamento: "Treinamento",
      procura_ponto: "Procura de Ponto",
      estruturacao: "Estruturação",
      compras: "Compras",
      inauguracao: "Inauguração"
    };
    return phaseMap[phase || ""] || phase || "-";
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
        <Box>
          <Typography variant="h5" component="div">
            {unidade.group_name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Código: {unidade.group_code}
          </Typography>
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
            <Tab icon={<Info size={16} />} label="Informações Básicas" {...a11yProps(0)} />
            <Tab icon={<ContactPhone size={16} />} label="Contato & Endereço" {...a11yProps(1)} />
            <Tab icon={<Clock size={16} />} label="Horários" {...a11yProps(2)} />
            <Tab icon={<Link size={16} />} label="Integrações" {...a11yProps(3)} />
            <Tab icon={<Instagram size={16} />} label="Moderação Instagram" {...a11yProps(4)} />
            <Tab icon={<MapPin size={16} />} label="Operações" {...a11yProps(5)} />
          </Tabs>
        </Box>

        {/* Informações Básicas */}
        <TabPanel value={tabValue} index={0}>
          <Box>
            <InfoItem label="Nome da Unidade" value={unidade.group_name} fullWidth />
            <InfoItem label="Código" value={unidade.group_code} />
            <InfoItem label="CNPJ" value={unidade.cnpj} />
            
            <ChipItem 
              label="Modelo da Loja" 
              value={unidade.store_model} 
              color={getStoreModelColor(unidade.store_model)}
            />
            <ChipItem 
              label="Fase da Loja" 
              value={unidade.store_phase === "operacao" ? "Operação" : "Implantação"}
              color={unidade.store_phase === "operacao" ? "success" : "warning"}
            />
            
            <InfoItem 
              label="Fase de Implantação" 
              value={getImpPhaseLabel(unidade.store_imp_phase)} 
              fullWidth 
            />
            
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Metadados
            </Typography>
            
            <InfoItem label="Data de Criação" value={formatDate(unidade.created_at)} />
            <InfoItem label="Última Atualização" value={formatDate(unidade.updated_at)} />
          </Box>
        </TabPanel>

        {/* Contato & Endereço */}
        <TabPanel value={tabValue} index={1}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Contato
            </Typography>
            
            <InfoItem label="Telefone" value={unidade.phone} />
            <InfoItem label="Email" value={unidade.email} />
            <InfoItem label="Instagram" value={unidade.instagram_profile} fullWidth />
            
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Endereço
            </Typography>
            
            <InfoItem label="Endereço" value={unidade.address} fullWidth />
            <InfoItem label="Número" value={unidade.number_address} />
            <InfoItem label="Complemento" value={unidade.address_complement} />
            <InfoItem label="Bairro" value={unidade.neighborhood} />
            <InfoItem label="Cidade" value={unidade.city} />
            <InfoItem label="Estado" value={unidade.state} />
            <InfoItem label="UF" value={unidade.uf} />
            <InfoItem label="CEP" value={unidade.postal_code} />
          </Box>
        </TabPanel>

        {/* Horários */}
        <TabPanel value={tabValue} index={2}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Horários de Funcionamento
            </Typography>
            
            <InfoItem label="Segunda-feira" value={unidade.operation_mon} />
            <InfoItem label="Terça-feira" value={unidade.operation_tue} />
            <InfoItem label="Quarta-feira" value={unidade.operation_wed} />
            <InfoItem label="Quinta-feira" value={unidade.operation_thu} />
            <InfoItem label="Sexta-feira" value={unidade.operation_fri} />
            <InfoItem label="Sábado" value={unidade.operation_sat} />
            <InfoItem label="Domingo" value={unidade.operation_sun} />
            <InfoItem label="Feriados" value={unidade.operation_hol} />
          </Box>
        </TabPanel>

        {/* Integrações */}
        <TabPanel value={tabValue} index={3}>
          <Box>
            <Typography variant="h6" gutterBottom>
              IDs de Integração
            </Typography>
            
            <InfoItem label="AI Agent ID" value={unidade.ai_agent_id} />
            <InfoItem label="Notion Page ID" value={unidade.notion_page_id} />
            
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Google Drive
            </Typography>
            
            <InfoItem label="Drive Folder ID" value={unidade.drive_folder_id} />
            <InfoItem label="Drive Folder Link" value={unidade.drive_folder_link} fullWidth />
            
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Documentos
            </Typography>
            
            <InfoItem label="Docs Folder ID" value={unidade.docs_folder_id} />
            <InfoItem label="Docs Folder Link" value={unidade.docs_folder_link} fullWidth />
          </Box>
        </TabPanel>

        {/* Moderação Instagram */}
        <TabPanel value={tabValue} index={4}>
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Instagram size={20} />
              Moderação do Instagram
            </Typography>
            
            <InfoItem label="Usuário Instagram" value={(unidade as any).user_instagram} />
            <InfoItem label="ID da Unidade" value={(unidade as any).id_unidade} />
            
            <InfoItem 
              label="Senha Instagram" 
              value={showInstagramPassword ? ((unidade as any).password_instagram || '-') : ((unidade as any).password_instagram ? '********' : '-')}
              onToggleVisibility={() => setShowInstagramPassword(!showInstagramPassword)}
              showValue={showInstagramPassword}
            />
            <InfoItem 
              label="Bearer Token" 
              value={showBearerToken ? ((unidade as any).bearer || '-') : ((unidade as any).bearer ? `${'*'.repeat(Math.max(0, ((unidade as any).bearer?.length || 0) - 8))}${(unidade as any).bearer?.slice(-8) || ''}` : '-')}
              onToggleVisibility={() => setShowBearerToken(!showBearerToken)}
              showValue={showBearerToken}
            />
          </Box>
        </TabPanel>

        {/* Operações */}
        <TabPanel value={tabValue} index={5}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Status Operacional
            </Typography>
            
            <ChipItem 
              label="Compras Ativas" 
              value={unidade.purchases_active ? "Sim" : "Não"}
              color={unidade.purchases_active ? "success" : "error"}
            />
            <ChipItem 
              label="Vendas Ativas" 
              value={unidade.sales_active ? "Sim" : "Não"}
              color={unidade.sales_active ? "success" : "error"}
            />
            
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Estacionamento
            </Typography>
            
            <ChipItem 
              label="Possui Estacionamento" 
              value={unidade.has_parking ? "Sim" : "Não"}
              color={unidade.has_parking ? "success" : "default"}
            />
            
            {unidade.has_parking && (
              <InfoItem label="Vagas de Estacionamento" value={unidade.parking_spots} />
            )}
            
            <ChipItem 
              label="Estacionamento Parceiro" 
              value={unidade.has_partner_parking ? "Sim" : "Não"}
              color={unidade.has_partner_parking ? "info" : "default"}
            />
            
            {unidade.has_partner_parking && (
              <InfoItem label="Endereço do Estacionamento Parceiro" value={unidade.partner_parking_address} fullWidth />
            )}
          </Box>
        </TabPanel>
      </DialogContent>
    </Dialog>
  );
};