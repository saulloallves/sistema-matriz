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
import { useCargosLoja } from '@/hooks/useCargosLoja';

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
  onClearFilters: () => void;
  initialFilters: any;
}

export const ColaboradorLojaFilterDrawer = ({
  open,
  onClose,
  onApplyFilters,
  onClearFilters,
  initialFilters,
}: FilterDrawerProps) => {
  const [filters, setFilters] = useState(initialFilters);
  const { cargos, isLoading: isLoadingCargos } = useCargosLoja();

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
            Filtros de Colaboradores
          </Typography>
          <IconButton onClick={onClose}>
            <X size={20} />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 3 }} />

        <Box sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
          <Typography variant="subtitle2" gutterBottom>Cargo e Status</Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel>Cargo</InputLabel>
            <Select
              value={filters.position_id || ''}
              label="Cargo"
              onChange={(e) => handleInputChange('position_id', e.target.value)}
              disabled={isLoadingCargos}
            >
              <MenuItem value=""><em>Todos</em></MenuItem>
              {cargos.map((cargo) => (
                <MenuItem key={cargo.id} value={cargo.id}>{cargo.role}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom>Benefícios</Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel>Plano de Saúde</InputLabel>
            <Select
              value={filters.health_plan === undefined ? '' : String(filters.health_plan)}
              label="Plano de Saúde"
              onChange={(e) => handleInputChange('health_plan', e.target.value === '' ? undefined : e.target.value === 'true')}
            >
              <MenuItem value=""><em>Todos</em></MenuItem>
              <MenuItem value="true">Sim</MenuItem>
              <MenuItem value="false">Não</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Vale Refeição</InputLabel>
            <Select
              value={filters.meal_voucher_active === undefined ? '' : String(filters.meal_voucher_active)}
              label="Vale Refeição"
              onChange={(e) => handleInputChange('meal_voucher_active', e.target.value === '' ? undefined : e.target.value === 'true')}
            >
              <MenuItem value=""><em>Todos</em></MenuItem>
              <MenuItem value="true">Sim</MenuItem>
              <MenuItem value="false">Não</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Vale Transporte</InputLabel>
            <Select
              value={filters.transport_voucher_active === undefined ? '' : String(filters.transport_voucher_active)}
              label="Vale Transporte"
              onChange={(e) => handleInputChange('transport_voucher_active', e.target.value === '' ? undefined : e.target.value === 'true')}
            >
              <MenuItem value=""><em>Todos</em></MenuItem>
              <MenuItem value="true">Sim</MenuItem>
              <MenuItem value="false">Não</MenuItem>
            </Select>
          </FormControl>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom>Acessos e Treinamento</Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel>Acesso ao Caixa</InputLabel>
            <Select
              value={filters.cash_access === undefined ? '' : String(filters.cash_access)}
              label="Acesso ao Caixa"
              onChange={(e) => handleInputChange('cash_access', e.target.value === '' ? undefined : e.target.value === 'true')}
            >
              <MenuItem value=""><em>Todos</em></MenuItem>
              <MenuItem value="true">Sim</MenuItem>
              <MenuItem value="false">Não</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Treinamento</InputLabel>
            <Select
              value={filters.training === undefined ? '' : String(filters.training)}
              label="Treinamento"
              onChange={(e) => handleInputChange('training', e.target.value === '' ? undefined : e.target.value === 'true')}
            >
              <MenuItem value=""><em>Todos</em></MenuItem>
              <MenuItem value="true">Sim</MenuItem>
              <MenuItem value="false">Não</MenuItem>
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
            label="UF"
            value={filters.uf || ''}
            onChange={(e) => handleInputChange('uf', e.target.value)}
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