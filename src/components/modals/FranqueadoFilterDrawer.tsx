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

export const FranqueadoFilterDrawer = ({
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
            Filtros de Franqueados
          </Typography>
          <IconButton onClick={onClose}>
            <X size={20} />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 3 }} />

        <Box sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
          <Typography variant="subtitle2" gutterBottom>Status Contratual</Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel>Tipo de Proprietário</InputLabel>
            <Select
              value={filters.owner_type || ''}
              label="Tipo de Proprietário"
              onChange={(e) => handleInputChange('owner_type', e.target.value)}
            >
              <MenuItem value=""><em>Todos</em></MenuItem>
              <MenuItem value="principal">Principal</MenuItem>
              <MenuItem value="socio">Sócio</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Status do Contrato</InputLabel>
            <Select
              value={filters.is_in_contract === undefined ? '' : String(filters.is_in_contract)}
              label="Status do Contrato"
              onChange={(e) => handleInputChange('is_in_contract', e.target.value === '' ? undefined : e.target.value === 'true')}
            >
              <MenuItem value=""><em>Todos</em></MenuItem>
              <MenuItem value="true">Ativo</MenuItem>
              <MenuItem value="false">Inativo</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Recebe Pró-labore</InputLabel>
            <Select
              value={filters.receives_prolabore === undefined ? '' : String(filters.receives_prolabore)}
              label="Recebe Pró-labore"
              onChange={(e) => handleInputChange('receives_prolabore', e.target.value === '' ? undefined : e.target.value === 'true')}
            >
              <MenuItem value=""><em>Todos</em></MenuItem>
              <MenuItem value="true">Sim</MenuItem>
              <MenuItem value="false">Não</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Foi Indicado</InputLabel>
            <Select
              value={filters.was_referred === undefined ? '' : String(filters.was_referred)}
              label="Foi Indicado"
              onChange={(e) => handleInputChange('was_referred', e.target.value === '' ? undefined : e.target.value === 'true')}
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

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom>Outros</Typography>
          <TextField
            fullWidth
            margin="normal"
            label="Disponibilidade"
            placeholder="Ex: integral"
            value={filters.availability || ''}
            onChange={(e) => handleInputChange('availability', e.target.value)}
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