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
import { useAnalisarEstados, useCorrigirEstados, useAnalisarEstadosFranqueados, useCorrigirEstadosFranqueados } from '../hooks/useCorrecaoEstados';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';

const CorrecaoEstadosPage = () => {
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
        onSuccess: () => { setCorrecaoConcluida(true); setDialogOpen(false); },
        onError: (error) => { console.error('Erro ao corrigir:', error); alert('Erro ao corrigir unidades. Verifique o console.'); },
      });
    } else {
      if (!dataFranqueados?.incorretas || dataFranqueados.incorretas.length === 0) return;
      corrigirFranqueados(dataFranqueados.incorretas, {
        onSuccess: () => { setCorrecaoConcluida(true); setDialogOpen(false); },
        onError: (error) => { console.error('Erro ao corrigir:', error); alert('Erro ao corrigir franqueados. Verifique o console.'); },
      });
    }
  };

  if (isLoading || isLoadingFranqueados) {
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

      {/* Toggle Tipo */}
      <Box sx={{ mb: 2 }}>
        <ToggleButtonGroup
          value={tipo}
          exclusive
          onChange={(_, val) => val && setTipo(val)}
          size="small"
        >
          <ToggleButton value="unidades">Unidades</ToggleButton>
          <ToggleButton value="franqueados">Franqueados</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Alerta de Conclusão */}
      {correcaoConcluida && (
        <Alert severity="success" sx={{ mb: 3 }}>
          ✅ Correção concluída com sucesso! {tipo === 'unidades' ? (data?.incorretas.length || 0) : (dataFranqueados?.incorretas.length || 0)} {tipo === 'unidades' ? 'unidades' : 'franqueados'} foram atualizados.
          Você pode fechar esta página e deletar os arquivos temporários.
        </Alert>
      )}

      {/* Cards de Estatísticas */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {tipo === 'unidades' ? <Database size={40} color="#2196f3" /> : <Users size={40} color="#9c27b0" />}
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {tipo === 'unidades' ? (data?.estatisticas.totalUnidades || 0) : (dataFranqueados?.estatisticas.totalFranqueados || 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {tipo === 'unidades' ? 'Total de Unidades' : 'Total de Franqueados'}
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
                  {tipo === 'unidades' ? (data?.estatisticas.totalIncorretas || 0) : (dataFranqueados?.estatisticas.totalIncorretas || 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {tipo === 'unidades' ? 'Unidades Incorretas' : 'Franqueados Incorretos'}
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
                  {tipo === 'unidades' ? (data?.estatisticas.totalCorretas || 0) : (dataFranqueados?.estatisticas.totalCorretas || 0)}
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
        <Alert severity="info" sx={{ mb: 3 }}>
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
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color={tipo === 'unidades' ? 'error' : 'secondary'}
            size="large"
            onClick={() => setDialogOpen(true)}
            disabled={tipo === 'unidades' ? isCorrigindoUnidades : isCorrigindoFranqueados}
            startIcon={(tipo === 'unidades' ? isCorrigindoUnidades : isCorrigindoFranqueados) ? <CircularProgress size={20} /> : <CheckCircle />}
            sx={{ px: 4, py: 1.5 }}
          >
            {(tipo === 'unidades' ? isCorrigindoUnidades : isCorrigindoFranqueados) ? 'Corrigindo...' : `Corrigir ${(tipo === 'unidades' ? data?.incorretas.length : dataFranqueados?.incorretas.length) || 0} ${tipo === 'unidades' ? 'Unidades' : 'Franqueados'}`}
          </Button>
        </Box>
      )}

      {/* Tabela de Preview */}
      {tipo === 'unidades' && data?.incorretas && data.incorretas.length > 0 && (
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

      {/* Tabela de Preview - Franqueados */}
      {tipo === 'franqueados' && dataFranqueados?.incorretas && dataFranqueados.incorretas.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              📋 Preview das Correções (Franqueados)
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Franqueado</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Cidade</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>UF</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Estado Atual (Incorreto)</TableCell>
                    <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>→</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Estado Correto</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataFranqueados.incorretas.slice(0, 50).map((f) => (
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
            {dataFranqueados.incorretas.length > 50 && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
                Mostrando 50 de {dataFranqueados.incorretas.length} franqueados. Todos serão corrigidos ao clicar no botão.
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* Mensagem se tudo estiver correto */}
      {(tipo === 'unidades' && data?.incorretas && data.incorretas.length === 0) || (tipo === 'franqueados' && dataFranqueados?.incorretas && dataFranqueados.incorretas.length === 0) ? (
        <Alert severity="success" sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            ✅ Tudo Correto!
          </Typography>
          <Typography variant="body2">
            {tipo === 'unidades' ? 'Todas as unidades' : 'Todos os franqueados'} já estão com o campo "state" correto.
          </Typography>
        </Alert>
      ) : null}

      {/* Dialog de Confirmação */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>⚠️ Confirmar Correção em Massa</DialogTitle>
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
    </Box>
  );
};

export default CorrecaoEstadosPage;
