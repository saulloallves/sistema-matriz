import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Shield } from 'lucide-react';
import { useTablePermissions } from '@/hooks/useTablePermissions';

interface RolePermissionsModalProps {
  open: boolean;
  onClose: () => void;
  role: 'admin' | 'operador' | 'user' | 'franqueado';
  roleDisplayName: string;
}

export function RolePermissionsModal({
  open,
  onClose,
  role,
  roleDisplayName,
}: RolePermissionsModalProps) {
  const { permissionTables, rolePermissions, updateRolePermission, isUpdating, isLoading } =
    useTablePermissions();

  const [localPermissions, setLocalPermissions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (rolePermissions.length > 0 && permissionTables.length > 0) {
      const perms: Record<string, boolean> = {};
      permissionTables.forEach((table) => {
        const rolePerms = rolePermissions.find(
          (rp) => rp.role === role && rp.table_name === table.table_name
        );
        perms[table.table_name] = rolePerms?.has_access || false;
      });
      setLocalPermissions(perms);
    }
  }, [rolePermissions, permissionTables, role]);

  const handlePermissionChange = (tableName: string, value: boolean) => {
    setLocalPermissions((prev) => ({
      ...prev,
      [tableName]: value,
    }));
  };

  const handleSave = () => {
    Object.entries(localPermissions).forEach(([tableName, hasAccess]) => {
      updateRolePermission({
        role,
        table_name: tableName,
        has_access: hasAccess,
      });
    });
    onClose();
  };

  if (isLoading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </Dialog>
    );
  }

  if (role === 'admin') {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Shield size={24} />
          Permissões do {roleDisplayName}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }} color="text.secondary">
            O perfil de administrador tem acesso total a todas as funcionalidades do sistema e não pode ser modificado.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Fechar</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Shield size={24} />
        Configurar Permissões: {roleDisplayName}
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 2 }} color="text.secondary">
          Defina as permissões padrão para o perfil {roleDisplayName} em cada módulo do sistema.
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Módulo</strong></TableCell>
                <TableCell align="center"><strong>Acesso Permitido</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {permissionTables.map((table) => (
                <TableRow key={table.table_name}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {table.display_name}
                    </Typography>
                    {table.description && (
                      <Typography variant="caption" color="text.secondary">
                        {table.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Switch
                      checked={localPermissions[table.table_name] || false}
                      onChange={(e) =>
                        handlePermissionChange(table.table_name, e.target.checked)
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" disabled={isUpdating}>
          {isUpdating ? <CircularProgress size={20} /> : 'Salvar Alterações'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}