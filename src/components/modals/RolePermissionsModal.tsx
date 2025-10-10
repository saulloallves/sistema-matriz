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
  Checkbox,
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

  const [localPermissions, setLocalPermissions] = useState<Record<string, any>>({});

  useEffect(() => {
    if (rolePermissions.length > 0 && permissionTables.length > 0) {
      const perms: Record<string, any> = {};
      permissionTables.forEach((table) => {
        const rolePerms = rolePermissions.find(
          (rp) => rp.role === role && rp.table_name === table.table_name
        );
        perms[table.table_name] = {
          can_create: rolePerms?.can_create || false,
          can_read: rolePerms?.can_read || false,
          can_update: rolePerms?.can_update || false,
          can_delete: rolePerms?.can_delete || false,
        };
      });
      setLocalPermissions(perms);
    }
  }, [rolePermissions, permissionTables, role]);

  const handlePermissionChange = (
    tableName: string,
    permission: 'can_create' | 'can_read' | 'can_update' | 'can_delete',
    value: boolean
  ) => {
    setLocalPermissions((prev) => ({
      ...prev,
      [tableName]: {
        ...prev[tableName],
        [permission]: value,
      },
    }));
  };

  const handleSave = () => {
    Object.entries(localPermissions).forEach(([tableName, perms]) => {
      updateRolePermission({
        role,
        table_name: tableName,
        can_create: perms.can_create,
        can_read: perms.can_read,
        can_update: perms.can_update,
        can_delete: perms.can_delete,
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

  // Admin sempre tem acesso total - não pode ser editado
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
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
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
                <TableCell align="center"><strong>Criar</strong></TableCell>
                <TableCell align="center"><strong>Visualizar</strong></TableCell>
                <TableCell align="center"><strong>Editar</strong></TableCell>
                <TableCell align="center"><strong>Excluir</strong></TableCell>
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
                    <Checkbox
                      checked={localPermissions[table.table_name]?.can_create || false}
                      onChange={(e) =>
                        handlePermissionChange(table.table_name, 'can_create', e.target.checked)
                      }
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Checkbox
                      checked={localPermissions[table.table_name]?.can_read || false}
                      onChange={(e) =>
                        handlePermissionChange(table.table_name, 'can_read', e.target.checked)
                      }
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Checkbox
                      checked={localPermissions[table.table_name]?.can_update || false}
                      onChange={(e) =>
                        handlePermissionChange(table.table_name, 'can_update', e.target.checked)
                      }
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Checkbox
                      checked={localPermissions[table.table_name]?.can_delete || false}
                      onChange={(e) =>
                        handlePermissionChange(table.table_name, 'can_delete', e.target.checked)
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
