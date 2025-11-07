import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { CheckCircle, AlertTriangle, Database, ArrowRight } from 'lucide-react';
import { useAnalisarEstados, useCorrigirEstados } from '../hooks/useCorrecaoEstados';

const CorrecaoEstadosPage = () => {
  const { data, isLoading } = useAnalisarEstados();
  const { mutate: corrigir, isPending: isCorrigindo } = useCorrigirEstados();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [correcaoConcluida, setCorrecaoConcluida] = useState(false);

  const handleCorrigir = () => {
    if (!data?.incorretas || data.incorretas.length === 0) return;

    corrigir(data.incorretas, {
      onSuccess: () => {
        setCorrecaoConcluida(true);
        setDialogOpen(false);
      },
      onError: (error) => {
        console.error('Erro ao corrigir:', error);
        alert('Erro ao corrigir unidades. Verifique o console.');
      },
    });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          🔧 Correção de Estados - Massa
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Ferramenta temporária para corrigir campo "state" com cidades em vez de estados
        </Typography>
      </Box>

      {/* Alerta de Conclusão */}
      {correcaoConcluida && (
        <Alert severity="success" sx={{ mb: 3 }}>
          ✅ Correção concluída com sucesso! {data?.incorretas.length} unidades foram atualizadas.
          Você pode fechar esta página e deletar os arquivos temporários.
        </Alert>
      )}

      {/* Cards de Estatísticas */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Database size={40} color="#2196f3" />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {data?.estatisticas.totalUnidades || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total de Unidades
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AlertTriangle size={40} color="#f44336" />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'error.main' }}>
                  {data?.estatisticas.totalIncorretas || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Unidades Incorretas
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CheckCircle size={40} color="#4caf50" />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                  {data?.estatisticas.totalCorretas || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Unidades Corretas
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Distribuição por UF */}
      {data?.estatisticas.porUF && Object.keys(data.estatisticas.porUF).length > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            Distribuição de erros por UF:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {Object.entries(data.estatisticas.porUF).map(([uf, count]) => (
              <Chip key={uf} label={`${uf}: ${count}`} size="small" color="warning" />
            ))}
          </Box>
        </Alert>
      )}

      {/* Botão de Correção */}
      {data?.incorretas && data.incorretas.length > 0 && !correcaoConcluida && (
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="error"
            size="large"
            onClick={() => setDialogOpen(true)}
            disabled={isCorrigindo}
            startIcon={isCorrigindo ? <CircularProgress size={20} /> : <CheckCircle />}
            sx={{ px: 4, py: 1.5 }}
          >
            {isCorrigindo ? 'Corrigindo...' : `Corrigir ${data.incorretas.length} Unidades`}
          </Button>
        </Box>
      )}

      {/* Tabela de Preview */}
      {data?.incorretas && data.incorretas.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              📋 Preview das Correções
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Unidade</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Cidade</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>UF</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Estado Atual (Incorreto)</TableCell>
                    <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>→</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Estado Correto</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.incorretas.slice(0, 50).map((unidade) => (
                    <TableRow key={unidade.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {unidade.group_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {unidade.group_code}
                        </Typography>
                      </TableCell>
                      <TableCell>{unidade.city || '-'}</TableCell>
                      <TableCell>
                        <Chip label={unidade.uf} size="small" color="primary" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="error.main">
                          {unidade.state || '(vazio)'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <ArrowRight size={16} color="#666" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                          {unidade.estadoCorreto}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {data.incorretas.length > 50 && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
                Mostrando 50 de {data.incorretas.length} unidades. Todas serão corrigidas ao clicar no botão.
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* Mensagem se tudo estiver correto */}
      {data?.incorretas && data.incorretas.length === 0 && (
        <Alert severity="success" sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            ✅ Tudo Correto!
          </Typography>
          <Typography variant="body2">
            Todas as unidades já estão com o campo "state" correto.
          </Typography>
        </Alert>
      )}

      {/* Dialog de Confirmação */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>⚠️ Confirmar Correção em Massa</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Você está prestes a corrigir <strong>{data?.incorretas.length} unidades</strong>.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Esta ação irá atualizar o campo "state" de todas as unidades listadas.
            Tem certeza que deseja continuar?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={isCorrigindo}>
            Cancelar
          </Button>
          <Button
            onClick={handleCorrigir}
            variant="contained"
            color="error"
            disabled={isCorrigindo}
            startIcon={isCorrigindo ? <CircularProgress size={16} /> : null}
          >
            {isCorrigindo ? 'Corrigindo...' : 'Sim, Corrigir Tudo'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CorrecaoEstadosPage;
