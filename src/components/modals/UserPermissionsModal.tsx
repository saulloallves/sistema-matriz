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
  IconButton,
} from '@mui/material';
import { User, Trash2 } from 'lucide-react';
import { useTablePermissions } from '@/hooks/useTablePermissions';
import { useUserPermissions } from '@/hooks/useUserPermissions';

interface UserPermissionsModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

export function UserPermissionsModal({
  open,
  onClose,
  userId,
  userName,
}: UserPermissionsModalProps) {
  const { permissionTables, isLoading: isLoadingTables } = useTablePermissions();
  const {
    userPermissions,
    updateUserPermission,
    deleteUserPermission,
    isUpdating,
    isDeleting,
    isLoading: isLoadingPerms,
  } = useUserPermissions(userId);

  const [localPermissions, setLocalPermissions] = useState<Record<string, any>>({});

  useEffect(() => {
    if (permissionTables.length > 0) {
      const perms: Record<string, any> = {};
      permissionTables.forEach((table) => {
        const userPerms = userPermissions.find((up) => up.table_name === table.table_name);
        perms[table.table_name] = {
          can_create: userPerms?.can_create || false,
          can_read: userPerms?.can_read || false,
          can_update: userPerms?.can_update || false,
          can_delete: userPerms?.can_delete || false,
          hasOverride: !!userPerms,
        };
      });
      setLocalPermissions(perms);
    }
  }, [userPermissions, permissionTables]);

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
        hasOverride: true,
      },
    }));
  };

  const handleRemoveOverride = (tableName: string) => {
    deleteUserPermission({ user_id: userId, table_name: tableName });
    setLocalPermissions((prev) => ({
      ...prev,
      [tableName]: {
        can_create: false,
        can_read: false,
        can_update: false,
        can_delete: false,
        hasOverride: false,
      },
    }));
  };

  const handleSave = () => {
    Object.entries(localPermissions).forEach(([tableName, perms]) => {
      if (perms.hasOverride) {
        updateUserPermission({
          user_id: userId,
          table_name: tableName,
          can_create: perms.can_create,
          can_read: perms.can_read,
          can_update: perms.can_update,
          can_delete: perms.can_delete,
        });
      }
    });
    onClose();
  };

  if (isLoadingTables || isLoadingPerms) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <User size={24} />
        Permissões Específicas: {userName}
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 2 }} color="text.secondary">
          Configure permissões específicas para este usuário. As permissões individuais substituem as permissões do perfil.
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
                <TableCell align="center"><strong>Ações</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {permissionTables.map((table) => (
                <TableRow
                  key={table.table_name}
                  sx={{
                    backgroundColor: localPermissions[table.table_name]?.hasOverride
                      ? 'action.hover'
                      : 'inherit',
                  }}
                >
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
                  <TableCell align="center">
                    {localPermissions[table.table_name]?.hasOverride && (
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveOverride(table.table_name)}
                        disabled={isDeleting}
                        sx={{ color: 'error.main' }}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    )}
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
