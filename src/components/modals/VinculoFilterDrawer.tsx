import { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  IconButton,
} from '@mui/material';
import { X, Filter } from 'lucide-react';

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
  onClearFilters: () => void;
  initialFilters: any;
}

export const VinculoFilterDrawer = ({
  open,
  onClose,
  onApplyFilters,
  onClearFilters,
  initialFilters,
}: FilterDrawerProps) => {
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const handleInputChange = (field: string, value: any) => {
    setFilters((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleClear = () => {
    setFilters({});
    onClearFilters();
    onClose();
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 350, p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Filter size={20} />
            Filtros de Vínculos
          </Typography>
          <IconButton onClick={onClose}>
            <X size={20} />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 3 }} />

        <Box sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">Filtrar por Franqueado</Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel>Tipo de Proprietário</InputLabel>
            <Select
              value={filters.franqueado_owner_type || ''}
              label="Tipo de Proprietário"
              onChange={(e) => handleInputChange('franqueado_owner_type', e.target.value)}
            >
              <MenuItem value=""><em>Todos</em></MenuItem>
              <MenuItem value="Principal">Principal</MenuItem>
              <MenuItem value="Sócio">Sócio</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Status do Contrato</InputLabel>
            <Select
              value={filters.franqueado_is_in_contract === undefined ? '' : String(filters.franqueado_is_in_contract)}
              label="Status do Contrato"
              onChange={(e) => handleInputChange('franqueado_is_in_contract', e.target.value === '' ? undefined : e.target.value === 'true')}
            >
              <MenuItem value=""><em>Todos</em></MenuItem>
              <MenuItem value="true">Em Contrato</MenuItem>
              <MenuItem value="false">Sem Contrato</MenuItem>
            </Select>
          </FormControl>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1" gutterBottom fontWeight="bold">Filtrar por Unidade</Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel>Modelo da Loja</InputLabel>
            <Select
              value={filters.unidade_store_model || ''}
              label="Modelo da Loja"
              onChange={(e) => handleInputChange('unidade_store_model', e.target.value)}
            >
              <MenuItem value=""><em>Todos</em></MenuItem>
              <MenuItem value="junior">Junior</MenuItem>
              <MenuItem value="light">Light</MenuItem>
              <MenuItem value="padrao">Padrão</MenuItem>
              <MenuItem value="intermediaria">Intermediária</MenuItem>
              <MenuItem value="mega_store">Mega Store</MenuItem>
              <MenuItem value="pontinha">Pontinha</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Fase da Loja</InputLabel>
            <Select
              value={filters.unidade_store_phase || ''}
              label="Fase da Loja"
              onChange={(e) => handleInputChange('unidade_store_phase', e.target.value)}
            >
              <MenuItem value=""><em>Todas</em></MenuItem>
              <MenuItem value="implantacao">Implantação</MenuItem>
              <MenuItem value="operacao">Operação</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Status da Unidade</InputLabel>
            <Select
              value={filters.unidade_is_active === undefined ? '' : String(filters.unidade_is_active)}
              label="Status da Unidade"
              onChange={(e) => handleInputChange('unidade_is_active', e.target.value === '' ? undefined : e.target.value === 'true')}
            >
              <MenuItem value=""><em>Todos</em></MenuItem>
              <MenuItem value="true">Ativa</MenuItem>
              <MenuItem value="false">Inativa</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            margin="normal"
            label="Cidade da Unidade"
            value={filters.unidade_city || ''}
            onChange={(e) => handleInputChange('unidade_city', e.target.value)}
          />
          <TextField
            fullWidth
            margin="normal"
            label="UF da Unidade"
            value={filters.unidade_uf || ''}
            onChange={(e) => handleInputChange('unidade_uf', e.target.value)}
            inputProps={{ maxLength: 2 }}
          />
        </Box>

        <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
          <Button fullWidth variant="outlined" onClick={handleClear}>
            Limpar Filtros
          </Button>
          <Button fullWidth variant="contained" onClick={handleApply}>
            Aplicar
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};