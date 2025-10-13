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

export const UnidadeFilterDrawer = ({
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
            Filtros Avançados
          </Typography>
          <IconButton onClick={onClose}>
            <X size={20} />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 3 }} />

        <Box sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
          <Typography variant="subtitle2" gutterBottom>Status</Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel>Modelo da Loja</InputLabel>
            <Select
              value={filters.store_model || ''}
              label="Modelo da Loja"
              onChange={(e) => handleInputChange('store_model', e.target.value)}
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
              value={filters.store_phase || ''}
              label="Fase da Loja"
              onChange={(e) => handleInputChange('store_phase', e.target.value)}
            >
              <MenuItem value=""><em>Todas</em></MenuItem>
              <MenuItem value="implantacao">Implantação</MenuItem>
              <MenuItem value="operacao">Operação</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.is_active === undefined ? '' : String(filters.is_active)}
              label="Status"
              onChange={(e) => handleInputChange('is_active', e.target.value === '' ? undefined : e.target.value === 'true')}
            >
              <MenuItem value=""><em>Todos</em></MenuItem>
              <MenuItem value="true">Ativo</MenuItem>
              <MenuItem value="false">Inativo</MenuItem>
            </Select>
          </FormControl>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom>Localização</Typography>
          <TextField
            fullWidth
            margin="normal"
            label="Cidade"
            value={filters.city || ''}
            onChange={(e) => handleInputChange('city', e.target.value)}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Estado"
            value={filters.state || ''}
            onChange={(e) => handleInputChange('state', e.target.value)}
          />
          <TextField
            fullWidth
            margin="normal"
            label="UF"
            value={filters.uf || ''}
            onChange={(e) => handleInputChange('uf', e.target.value)}
            inputProps={{ maxLength: 2 }}
          />

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom>Outros</Typography>
          <TextField
            fullWidth
            margin="normal"
            label="CNPJ"
            value={filters.cnpj || ''}
            onChange={(e) => handleInputChange('cnpj', e.target.value)}
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