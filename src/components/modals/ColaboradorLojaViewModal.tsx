import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, IconButton, Chip, Tabs, Tab } from '@mui/material';
import { useState } from 'react';
import { X, Edit } from 'lucide-react';
import { ColaboradorLoja } from '@/hooks/useColaboradoresLoja';
import { useCargosLoja } from '@/hooks/useCargosLoja';
import { formatCPF, formatPhone, formatCEP, formatDate } from '@/utils/formatters';

interface ColaboradorLojaViewModalProps {
  open: boolean;
  onClose: () => void;
  colaborador: ColaboradorLoja | null;
  onEdit: (colaborador: ColaboradorLoja) => void;
}

const InfoItem = ({ label, value }: { label: string; value: string | number | undefined | null }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="caption" color="text.secondary">{label}</Typography>
    <Typography variant="body1">{value || '-'}</Typography>
  </Box>
);

export const ColaboradorLojaViewModal = ({ open, onClose, colaborador, onEdit }: ColaboradorLojaViewModalProps) => {
  const [tab, setTab] = useState(0);
  const { cargos } = useCargosLoja();

  if (!colaborador) return null;

  const cargo = cargos?.find(c => c.id === colaborador.position_id);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Detalhes do Colaborador</Typography>
        <IconButton onClick={onClose} size="small"><X size={20} /></IconButton>
      </DialogTitle>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
        <Tab label="Dados Pessoais" />
        <Tab label="Profissional" />
        <Tab label="Endereço" />
        <Tab label="Benefícios" />
        <Tab label="Acessos & Termos" />
      </Tabs>

      <DialogContent dividers>
        {tab === 0 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <InfoItem label="Nome Completo" value={colaborador.employee_name} />
            <InfoItem label="CPF" value={formatCPF(colaborador.cpf)} />
            <InfoItem label="Data de Nascimento" value={formatDate(colaborador.birth_date)} />
            <InfoItem label="Email" value={colaborador.email} />
            <InfoItem label="Telefone" value={formatPhone(colaborador.phone)} />
            <InfoItem label="Instagram" value={colaborador.instagram_profile} />
          </Box>
        )}

        {tab === 1 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <InfoItem label="Cargo" value={cargo?.role} />
            <InfoItem label="Data de Admissão" value={formatDate(colaborador.admission_date)} />
            <InfoItem label="Salário" value={`R$ ${colaborador.salary}`} />
          </Box>
        )}

        {tab === 2 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <InfoItem label="CEP" value={colaborador.postal_code ? formatCEP(colaborador.postal_code) : '-'} />
            <InfoItem label="Endereço" value={colaborador.address} />
            <InfoItem label="Número" value={colaborador.number_address} />
            <InfoItem label="Complemento" value={colaborador.address_complement} />
            <InfoItem label="Bairro" value={colaborador.neighborhood} />
            <InfoItem label="Cidade" value={colaborador.city} />
            <InfoItem label="Estado" value={colaborador.state} />
            <InfoItem label="UF" value={colaborador.uf} />
          </Box>
        )}

        {tab === 3 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box><Typography variant="caption" color="text.secondary">Vale Refeição</Typography><Box sx={{ mt: 1 }}><Chip label={colaborador.meal_voucher_active ? `R$ ${colaborador.meal_voucher_value}` : 'Não'} color={colaborador.meal_voucher_active ? 'success' : 'default'} size="small" /></Box></Box>
            <Box><Typography variant="caption" color="text.secondary">Vale Transporte</Typography><Box sx={{ mt: 1 }}><Chip label={colaborador.transport_voucher_active ? `R$ ${colaborador.transport_voucher_value}` : 'Não'} color={colaborador.transport_voucher_active ? 'success' : 'default'} size="small" /></Box></Box>
            <Box><Typography variant="caption" color="text.secondary">Plano de Saúde</Typography><Box sx={{ mt: 1 }}><Chip label={colaborador.health_plan ? 'Sim' : 'Não'} color={colaborador.health_plan ? 'success' : 'default'} size="small" /></Box></Box>
            <Box><Typography variant="caption" color="text.secondary">Cesta Básica</Typography><Box sx={{ mt: 1 }}><Chip label={colaborador.basic_food_basket_active ? `R$ ${colaborador.basic_food_basket_value}` : 'Não'} color={colaborador.basic_food_basket_active ? 'success' : 'default'} size="small" /></Box></Box>
            <Box><Typography variant="caption" color="text.secondary">Auxílio Custo</Typography><Box sx={{ mt: 1 }}><Chip label={colaborador.cost_assistance_active ? `R$ ${colaborador.cost_assistance_value}` : 'Não'} color={colaborador.cost_assistance_active ? 'success' : 'default'} size="small" /></Box></Box>
          </Box>
        )}

        {tab === 4 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box><Typography variant="caption" color="text.secondary">Acesso ao Caixa</Typography><Box sx={{ mt: 1 }}><Chip label={colaborador.cash_access ? 'Sim' : 'Não'} color={colaborador.cash_access ? 'success' : 'default'} size="small" /></Box></Box>
            <Box><Typography variant="caption" color="text.secondary">Avaliação</Typography><Box sx={{ mt: 1 }}><Chip label={colaborador.evaluation_access ? 'Sim' : 'Não'} color={colaborador.evaluation_access ? 'success' : 'default'} size="small" /></Box></Box>
            <Box><Typography variant="caption" color="text.secondary">Treinamento</Typography><Box sx={{ mt: 1 }}><Chip label={colaborador.training ? 'Sim' : 'Não'} color={colaborador.training ? 'success' : 'default'} size="small" /></Box></Box>
            <Box><Typography variant="caption" color="text.secondary">Suporte</Typography><Box sx={{ mt: 1 }}><Chip label={colaborador.support ? 'Sim' : 'Não'} color={colaborador.support ? 'success' : 'default'} size="small" /></Box></Box>
            <Box><Typography variant="caption" color="text.secondary">Termo LGPD</Typography><Box sx={{ mt: 1 }}><Chip label={colaborador.lgpd_term ? 'Aceito' : 'Não Aceito'} color={colaborador.lgpd_term ? 'success' : 'error'} size="small" /></Box></Box>
            <Box><Typography variant="caption" color="text.secondary">Termo Confidencialidade</Typography><Box sx={{ mt: 1 }}><Chip label={colaborador.confidentiality_term ? 'Aceito' : 'Não Aceito'} color={colaborador.confidentiality_term ? 'success' : 'error'} size="small" /></Box></Box>
            <Box><Typography variant="caption" color="text.secondary">Termo Sistema</Typography><Box sx={{ mt: 1 }}><Chip label={colaborador.system_term ? 'Aceito' : 'Não Aceito'} color={colaborador.system_term ? 'success' : 'error'} size="small" /></Box></Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
        <Button variant="contained" startIcon={<Edit size={18} />} onClick={() => onEdit(colaborador)}>Editar</Button>
      </DialogActions>
    </Dialog>
  );
};
