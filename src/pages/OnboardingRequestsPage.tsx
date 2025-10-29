import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Card,
  Stack,
} from '@mui/material';
import { FileText, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import OnboardingKPICard from '../components/onboarding/OnboardingKPICard';
import OnboardingRequestsTable from '../components/onboarding/OnboardingRequestsTable';
import OnboardingViewModal from '../components/modals/OnboardingViewModal';
import OnboardingRejectModal from '../components/modals/OnboardingRejectModal';
import { useOnboardingRequests } from '../hooks/useOnboardingRequests';
import { useOnboardingStats } from '../hooks/useOnboardingStats';
import { useOnboardingApproval } from '../hooks/useOnboardingApproval';
import { OnboardingRequest, OnboardingStatus } from '../types/onboarding';

/**
 * Página principal de aprovação de cadastros de onboarding
 * Exibe KPIs, lista de solicitações e permite aprovar/rejeitar
 */
const OnboardingRequestsPage = () => {
  const [statusFilter, setStatusFilter] = useState<OnboardingStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<OnboardingRequest | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  // Buscar dados
  const { data: stats, isLoading: statsLoading } = useOnboardingStats();
  const { data: requests, isLoading: requestsLoading } = useOnboardingRequests(
    statusFilter === 'all' ? undefined : statusFilter
  );
  const approvalMutation = useOnboardingApproval();

  // Handlers
  const handleView = (request: OnboardingRequest) => {
    setSelectedRequest(request);
    setViewModalOpen(true);
  };

  const handleApprove = (request: OnboardingRequest) => {
    if (window.confirm(`Deseja realmente aprovar o cadastro ${request.request_number}?\n\nEsta ação irá criar os registros no sistema.`)) {
      approvalMutation.mutate({
        requestId: request.id,
        action: 'approve',
      });
    }
  };

  const handleReject = (request: OnboardingRequest) => {
    setSelectedRequest(request);
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = (rejectionReason: string) => {
    if (selectedRequest) {
      approvalMutation.mutate({
        requestId: selectedRequest.id,
        action: 'reject',
        rejectionReason,
      });
      setRejectModalOpen(false);
      setSelectedRequest(null);
    }
  };

  // Filtrar requests por busca
  const filteredRequests = requests?.filter((request) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase().replace(/[.\-/]/g, '');
    
    return (
      request.request_number.toLowerCase().includes(searchLower) ||
      request.franchisee_cpf.replace(/[.\-/]/g, '').includes(searchLower) ||
      request.franchisee_email.toLowerCase().includes(searchLower) ||
      request.unit_cnpj.replace(/[.\-/]/g, '').includes(searchLower) ||
      request.form_data.full_name?.toLowerCase().includes(searchLower) ||
      request.form_data.group_name?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Aprovação de Cadastros
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gerencie as solicitações de cadastro vindas do sistema de onboarding
        </Typography>
      </Box>

      {/* KPIs */}
      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(5, 1fr)',
          },
          gap: 3,
          mb: 4,
        }}
      >
        <OnboardingKPICard
          title="Total"
          value={stats?.total || 0}
          icon={FileText}
          color="#3b82f6"
          loading={statsLoading}
        />
        <OnboardingKPICard
          title="Pendentes"
          value={stats?.pending || 0}
          icon={Clock}
          color="#f59e0b"
          loading={statsLoading}
        />
        <OnboardingKPICard
          title="Aprovados"
          value={stats?.approved || 0}
          icon={CheckCircle}
          color="#10b981"
          loading={statsLoading}
        />
        <OnboardingKPICard
          title="Rejeitados"
          value={stats?.rejected || 0}
          icon={XCircle}
          color="#ef4444"
          loading={statsLoading}
        />
        <OnboardingKPICard
          title="Atrasados"
          value={stats?.pending_over_48h || 0}
          icon={AlertTriangle}
          color="#dc2626"
          subtitle="Pendentes há mais de 48h"
          loading={statsLoading}
        />
      </Box>

      {/* Filtros */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Buscar"
            placeholder="Protocolo, CPF, Email, CNPJ ou Nome"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ minWidth: { xs: '100%', sm: 350 } }}
          />
          <TextField
            select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OnboardingStatus | 'all')}
            size="small"
            sx={{ minWidth: { xs: '100%', sm: 200 } }}
          >
            <MenuItem value="all">Todos</MenuItem>
            <MenuItem value="pending">Pendentes</MenuItem>
            <MenuItem value="processing">Processando</MenuItem>
            <MenuItem value="approved">Aprovados</MenuItem>
            <MenuItem value="rejected">Rejeitados</MenuItem>
            <MenuItem value="error">Com Erro</MenuItem>
          </TextField>
        </Box>
      </Card>

      {/* Tabela */}
      <Card>
        <OnboardingRequestsTable
          requests={filteredRequests || []}
          loading={requestsLoading || approvalMutation.isPending}
          onView={handleView}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </Card>

      {/* Modais */}
      {selectedRequest && (
        <>
          <OnboardingViewModal
            open={viewModalOpen}
            onClose={() => {
              setViewModalOpen(false);
              setSelectedRequest(null);
            }}
            request={selectedRequest}
            onApprove={() => {
              setViewModalOpen(false);
              handleApprove(selectedRequest);
            }}
            onReject={() => {
              setViewModalOpen(false);
              handleReject(selectedRequest);
            }}
          />
          <OnboardingRejectModal
            open={rejectModalOpen}
            onClose={() => {
              setRejectModalOpen(false);
              setSelectedRequest(null);
            }}
            onSubmit={handleRejectSubmit}
            requestNumber={selectedRequest.request_number}
          />
        </>
      )}
    </Box>
  );
};

export default OnboardingRequestsPage;
