import { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { usePermissionCheck } from '@/hooks/usePermissionCheck';
import {
  Box,
  Tooltip,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Collapse,
  Skeleton
} from '@mui/material';
import {
  LayoutDashboard,
  Store,
  User as UserIcon,
  Users,
  MessageCircle,
  Calendar,
  Settings,
  UserCog,
  Briefcase,
  Key,
  Shield,
  Baby,
  ChevronDown,
  ChevronRight,
  Building2,
  UserCircle,
  Lock,
  Radio,
} from 'lucide-react';

interface MenuItemType {
  text: string;
  icon: any;
  path?: string;
  children?: MenuItemType[];
  permissionTable?: string;
}

const menuItems: MenuItemType[] = [
  { text: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { 
    text: 'Unidades', 
    icon: Building2,
    permissionTable: 'unidades',
    children: [
      { text: 'Unidades', icon: Store, path: '/unidades', permissionTable: 'unidades' },
      { text: 'Vínculos', icon: Users, path: '/franqueados-unidades', permissionTable: 'franqueados_unidades' },
    ]
  },
  { 
    text: 'Franqueados', 
    icon: UserCircle,
    permissionTable: 'franqueados',
    children: [
      { text: 'Franqueados', icon: UserIcon, path: '/franqueados', permissionTable: 'franqueados' },
      { text: 'Filhos', icon: Baby, path: '/franqueados-filhos', permissionTable: 'franqueados_filhos' },
    ]
  },
  { 
    text: 'Clientes', 
    icon: Users,
    permissionTable: 'clientes',
    children: [
      { text: 'Clientes', icon: Users, path: '/clientes', permissionTable: 'clientes' },
      { text: 'Filhos', icon: Baby, path: '/clientes-filhos', permissionTable: 'clientes_filhos' },
    ]
  },
  { 
    text: 'RH', 
    icon: UserCog,
    permissionTable: 'colaboradores_loja',
    children: [
      { text: 'Colab. Loja', icon: Users, path: '/colaboradores-loja', permissionTable: 'colaboradores_loja' },
      { text: 'Cargos Loja', icon: Briefcase, path: '/cargos-loja', permissionTable: 'cargos_loja' },
    ]
  },
  { 
    text: 'Segurança', 
    icon: Lock,
    permissionTable: 'senhas',
    children: [
      { text: 'Senhas', icon: Key, path: '/senhas', permissionTable: 'senhas' },
      { text: 'Permissões', icon: Shield, path: '/permissoes', permissionTable: 'permissoes' },
    ]
  },
  { 
    text: 'Comunicação', 
    icon: Radio,
    permissionTable: 'unidades_grupos_whatsapp',
    children: [
      { text: 'Grupos WhatsApp', icon: MessageCircle, path: '/grupos-whatsapp', permissionTable: 'unidades_grupos_whatsapp' },
      { text: 'Evento Seguidores', icon: Calendar, path: '/evento-seguidores', permissionTable: 'evento_seguidores' },
    ]
  },
];

const AppSidebar = () => {
  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({});
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { data: profile } = useUserProfile();
  const { getPermission, isLoading: isLoadingPermissions } = usePermissionCheck();

  const visibleMenuItems = useMemo(() => {
    if (isLoadingPermissions) {
      return [];
    }
    return menuItems.filter(item => {
      if (!item.permissionTable) return true; // Always show items without a permission requirement (like Dashboard)
      return getPermission(item.permissionTable, 'read');
    }).map(item => {
      if (item.children) {
        return {
          ...item,
          children: item.children.filter(child => getPermission(child.permissionTable!, 'read'))
        };
      }
      return item;
    });
  }, [isLoadingPermissions, getPermission]);

  const toggleGroup = (groupText: string) => {
    setExpandedGroups(prev => ({ [groupText]: !prev[groupText] }));
  };

  const isActiveRoute = (path?: string, children?: MenuItemType[]) => {
    if (path) return location.pathname === path;
    if (children) return children.some(child => location.pathname === child.path);
    return false;
  };

  const handleUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorEl(null);
  };

  const renderMenuItem = (item: MenuItemType, index: number) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedGroups[item.text];
    const isActive = isActiveRoute(item.path, item.children);
    const Icon = item.icon;

    if (hasChildren) {
      return (
        <Box key={index}>
          <Tooltip title={item.text} placement="right" arrow>
            <IconButton
              onClick={() => toggleGroup(item.text)}
              sx={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                position: 'relative',
                zIndex: 2,
                color: isActive ? '#fff' : 'text.secondary',
                backgroundColor: isActive ? 'primary.main' : 'transparent',
                '&:hover': {
                  backgroundColor: isActive ? 'primary.dark' : 'action.hover',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Icon size={20} />
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </Box>
            </IconButton>
          </Tooltip>
          <Collapse in={isExpanded}>
            <Box sx={{ pl: 1, mt: 0.5 }}>
              {item.children?.map((child, childIndex) => {
                const ChildIcon = child.icon;
                return (
                  <Tooltip key={childIndex} title={child.text} placement="right" arrow>
                    <IconButton
                      onClick={() => child.path && navigate(child.path)}
                      sx={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '10px',
                        mb: 0.5,
                        color: location.pathname === child.path ? '#fff' : 'text.secondary',
                        backgroundColor: location.pathname === child.path ? 'primary.main' : 'transparent',
                        '&:hover': {
                          backgroundColor: location.pathname === child.path ? 'primary.dark' : 'action.hover',
                        },
                      }}
                    >
                      <ChildIcon size={18} />
                    </IconButton>
                  </Tooltip>
                );
              })}
            </Box>
          </Collapse>
        </Box>
      );
    }

    return (
      <Tooltip key={index} title={item.text} placement="right" arrow>
        <IconButton
          onClick={() => item.path && navigate(item.path)}
          sx={{
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            position: 'relative',
            zIndex: 2,
            color: isActive ? '#fff' : 'text.secondary',
            backgroundColor: isActive ? 'primary.main' : 'transparent',
            '&:hover': {
              backgroundColor: isActive ? 'primary.dark' : 'action.hover',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <Icon size={20} />
        </IconButton>
      </Tooltip>
    );
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        left: 16,
        background: '#fff',
        borderRadius: '10px',
        padding: '16px',
        boxShadow: '0 0 40px rgba(0,0,0,0.03)',
        height: 'calc(100vh - 32px)',
        width: '88px',
        zIndex: 1200,
        border: '1px solid rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        overflowX: 'hidden',
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(0,0,0,0.1)',
          borderRadius: '4px',
        },
      }}
    >
      <Box
        component="nav"
        sx={{
          flex: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          {isLoadingPermissions ? (
            Array.from(new Array(7)).map((_, index) => (
              <Skeleton key={index} variant="rectangular" width={56} height={56} sx={{ borderRadius: '12px' }} />
            ))
          ) : (
            visibleMenuItems.map((item, index) => renderMenuItem(item, index))
          )}
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {!isLoadingPermissions && getPermission('permissoes', 'read') && (
          <Tooltip title="Configurações" placement="right" arrow>
            <IconButton
              onClick={() => navigate('/configuracoes')}
              sx={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                color: location.pathname === '/configuracoes' ? '#fff' : 'text.secondary',
                backgroundColor: location.pathname === '/configuracoes' ? 'primary.main' : 'transparent',
                '&:hover': {
                  backgroundColor: location.pathname === '/configuracoes' ? 'primary.dark' : 'action.hover',
                },
              }}
            >
              <Settings size={20} />
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title={profile?.full_name || user?.email || 'Usuário'} placement="right" arrow>
          <IconButton
            onClick={handleUserMenu}
            sx={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'primary.main',
                fontSize: '1rem',
              }}
            >
              {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
            </Avatar>
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseUserMenu}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          <MenuItem disabled>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ fontWeight: 600 }}>{profile?.full_name || 'Usuário'}</Box>
              <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>{user?.email}</Box>
            </Box>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => {
            signOut();
            handleCloseUserMenu();
          }}>
            Sair
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default AppSidebar;