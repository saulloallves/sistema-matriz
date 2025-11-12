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
import { CheckCircle, AlertTriangle, Database, ArrowRight, Users } from 'lucide-react';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import toast from 'react-hot-toast';
import { useAnalisarEstados, useCorrigirEstados, useAnalisarEstadosFranqueados, useCorrigirEstadosFranqueados } from '@/hooks/useCorrecaoEstados';

const PREVIEW_LIMIT = 15;

export const NormalizacaoEstados = () => {
  const { data, isLoading } = useAnalisarEstados();
  const { mutate: corrigirUnidades, isPending: isCorrigindoUnidades } = useCorrigirEstados();

  const { data: dataFranqueados, isLoading: isLoadingFranqueados } = useAnalisarEstadosFranqueados();
  const { mutate: corrigirFranqueados, isPending: isCorrigindoFranqueados } = useCorrigirEstadosFranqueados();

  const [tipo, setTipo] = useState<'unidades' | 'franqueados'>('unidades');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [correcaoConcluida, setCorrecaoConcluida] = useState(false);

  const handleCorrigir = () => {
    if (tipo === 'unidades') {
      if (!data?.incorretas || data.incorretas.length === 0) return;
      corrigirUnidades(data.incorretas, {
        onSuccess: () => { setCorrecaoConcluida(true); setDialogOpen(false); toast.success('Unidades corrigidas com sucesso'); },
        onError: (error) => { console.error('Erro ao corrigir:', error); toast.error('Erro ao corrigir unidades'); },
      });
    } else {
      if (!dataFranqueados?.incorretas || dataFranqueados.incorretas.length === 0) return;
      corrigirFranqueados(dataFranqueados.incorretas, {
        onSuccess: () => { setCorrecaoConcluida(true); setDialogOpen(false); toast.success('Franqueados corrigidos com sucesso'); },
        onError: (error) => { console.error('Erro ao corrigir:', error); toast.error('Erro ao corrigir franqueados'); },
      });
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Database size={20} />
            Normalização de Estados (UF → Estado)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Corrija inconsistências entre o campo UF e o nome do Estado em Unidades e Franqueados.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <ToggleButtonGroup
            value={tipo}
            exclusive
            onChange={(_, val) => val && setTipo(val)}
            size="small"
            aria-label="selecionar tipo para normalização"
          >
            <ToggleButton value="unidades" aria-label="unidades">Unidades</ToggleButton>
            <ToggleButton value="franqueados" aria-label="franqueados">Franqueados</ToggleButton>
          </ToggleButtonGroup>

          {(isLoading || isLoadingFranqueados) && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={16} />
              <Typography variant="caption" color="text.secondary">Carregando análise...</Typography>
            </Box>
          )}
        </Box>

        {correcaoConcluida && (
          <Alert severity="success" sx={{ mb: 2 }}>
            ✅ Correção concluída com sucesso! {(tipo === 'unidades' ? (data?.incorretas.length || 0) : (dataFranqueados?.incorretas.length || 0))} {(tipo === 'unidades' ? 'unidades' : 'franqueados')} foram atualizados.
          </Alert>
        )}

        {/* Cards de Estatísticas */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 2 }}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {tipo === 'unidades' ? <Database size={32} color="#2196f3" /> : <Users size={32} color="#9c27b0" />}
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {tipo === 'unidades' ? (data?.estatisticas.totalUnidades ?? '-') : (dataFranqueados?.estatisticas.totalFranqueados ?? '-')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {tipo === 'unidades' ? 'Total de Unidades' : 'Total de Franqueados'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AlertTriangle size={32} color="#f44336" />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'error.main' }}>
                    {tipo === 'unidades' ? (data?.estatisticas.totalIncorretas ?? '-') : (dataFranqueados?.estatisticas.totalIncorretas ?? '-')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {tipo === 'unidades' ? 'Unidades Incorretas' : 'Franqueados Incorretos'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircle size={32} color="#4caf50" />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'success.main' }}>
                    {tipo === 'unidades' ? (data?.estatisticas.totalCorretas ?? '-') : (dataFranqueados?.estatisticas.totalCorretas ?? '-')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {tipo === 'unidades' ? 'Unidades Corretas' : 'Franqueados Corretos'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Distribuição por UF */}
        {(tipo === 'unidades' ? data?.estatisticas.porUF : dataFranqueados?.estatisticas.porUF) && Object.keys(tipo === 'unidades' ? (data?.estatisticas.porUF || {}) : (dataFranqueados?.estatisticas.porUF || {})).length > 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Distribuição de erros por UF:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Object.entries(tipo === 'unidades' ? (data!.estatisticas.porUF) : (dataFranqueados!.estatisticas.porUF)).map(([uf, count]) => (
                <Chip key={uf} label={`${uf}: ${count}`} size="small" color="warning" />
              ))}
            </Box>
          </Alert>
        )}

        {/* Botão de Correção */}
        {((tipo === 'unidades' && data?.incorretas && data.incorretas.length > 0) || (tipo === 'franqueados' && dataFranqueados?.incorretas && dataFranqueados.incorretas.length > 0)) && !correcaoConcluida && (
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              color={tipo === 'unidades' ? 'error' : 'secondary'}
              size="medium"
              onClick={() => setDialogOpen(true)}
              disabled={tipo === 'unidades' ? isCorrigindoUnidades : isCorrigindoFranqueados}
              startIcon={(tipo === 'unidades' ? isCorrigindoUnidades : isCorrigindoFranqueados) ? <CircularProgress size={18} /> : <CheckCircle />}
              sx={{ px: 3, py: 1 }}
            >
              {(tipo === 'unidades' ? isCorrigindoUnidades : isCorrigindoFranqueados) ? 'Corrigindo...' : `Corrigir ${(tipo === 'unidades' ? data?.incorretas.length : dataFranqueados?.incorretas.length) || 0} ${(tipo === 'unidades' ? 'Unidades' : 'Franqueados')}`}
            </Button>
          </Box>
        )}

        {/* Tabela de Preview - Unidades */}
        {tipo === 'unidades' && data?.incorretas && data.incorretas.length > 0 && (
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 1 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Unidade</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Cidade</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>UF</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Estado Atual</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>→</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Estado Correto</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.incorretas.slice(0, PREVIEW_LIMIT).map((unidade) => (
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
        )}
        {tipo === 'unidades' && data?.incorretas && data.incorretas.length > PREVIEW_LIMIT && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mb: 1 }}>
            Mostrando {PREVIEW_LIMIT} de {data.incorretas.length} unidades. Todas serão corrigidas ao clicar no botão.
          </Typography>
        )}

        {/* Tabela de Preview - Franqueados */}
        {tipo === 'franqueados' && dataFranqueados?.incorretas && dataFranqueados.incorretas.length > 0 && (
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 1 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Franqueado</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Cidade</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>UF</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Estado Atual</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>→</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Estado Correto</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dataFranqueados.incorretas.slice(0, PREVIEW_LIMIT).map((f) => (
                  <TableRow key={f.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{f.full_name}</Typography>
                    </TableCell>
                    <TableCell>{f.city || '-'}</TableCell>
                    <TableCell>
                      <Chip label={f.uf} size="small" color="secondary" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="error.main">{f.state || '(vazio)'}</Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <ArrowRight size={16} color="#666" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>{f.estadoCorreto}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {tipo === 'franqueados' && dataFranqueados?.incorretas && dataFranqueados.incorretas.length > PREVIEW_LIMIT && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mb: 1 }}>
            Mostrando {PREVIEW_LIMIT} de {dataFranqueados.incorretas.length} franqueados. Todos serão corrigidos ao clicar no botão.
          </Typography>
        )}

        {/* Mensagem se tudo estiver correto */}
        {((tipo === 'unidades' && data?.incorretas && data.incorretas.length === 0) || (tipo === 'franqueados' && dataFranqueados?.incorretas && dataFranqueados.incorretas.length === 0)) && (
          <Alert severity="success" sx={{ textAlign: 'center', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              ✅ Tudo Normalizado
            </Typography>
            <Typography variant="body2">
              {tipo === 'unidades' ? 'Todas as unidades' : 'Todos os franqueados'} já estão com o campo "state" correto.
            </Typography>
          </Alert>
        )}

        {/* Dialog de Confirmação */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogTitle>⚠️ Confirmar Normalização</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Você está prestes a corrigir <strong>{tipo === 'unidades' ? (data?.incorretas.length || 0) : (dataFranqueados?.incorretas.length || 0)} {tipo === 'unidades' ? 'unidades' : 'franqueados'}</strong>.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Esta ação irá atualizar o campo "state" de todos os {tipo === 'unidades' ? 'unidades' : 'franqueados'} listados.
              Tem certeza que deseja continuar?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)} disabled={tipo === 'unidades' ? isCorrigindoUnidades : isCorrigindoFranqueados}>
              Cancelar
            </Button>
            <Button
              onClick={handleCorrigir}
              variant="contained"
              color={tipo === 'unidades' ? 'error' : 'secondary'}
              disabled={tipo === 'unidades' ? isCorrigindoUnidades : isCorrigindoFranqueados}
              startIcon={(tipo === 'unidades' ? isCorrigindoUnidades : isCorrigindoFranqueados) ? <CircularProgress size={16} /> : null}
            >
              {(tipo === 'unidades' ? isCorrigindoUnidades : isCorrigindoFranqueados) ? 'Corrigindo...' : 'Sim, Corrigir Tudo'}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default NormalizacaoEstados;
