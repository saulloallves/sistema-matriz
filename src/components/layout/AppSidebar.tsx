import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Box,
  Divider,
  IconButton,
} from '@mui/material';
import {
  LayoutDashboard,
  Store,
  User,
  Users,
  MessageCircle,
  Calendar,
  ChevronLeft,
  Menu,
} from 'lucide-react';

const DRAWER_WIDTH = 280;
const COLLAPSED_WIDTH = 70;

const menuItems = [
  { text: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { text: 'Unidades', icon: Store, path: '/unidades' },
  { text: 'Franqueados', icon: User, path: '/franqueados' },
  { text: 'Franqueados/Unidades', icon: Users, path: '/franqueados-unidades' },
  { text: 'Grupos WhatsApp', icon: MessageCircle, path: '/grupos-whatsapp' },
  { text: 'Evento Seguidores', icon: Calendar, path: '/evento-seguidores' },
];

const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleToggle = () => {
    setCollapsed(!collapsed);
  };

  const drawerWidth = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          transition: 'width 0.3s ease',
          borderRight: '1px solid #e0e0e0',
          backgroundColor: '#fff',
        },
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          px: 2,
          backgroundColor: '#1976d2',
          color: 'white',
        }}
      >
        {!collapsed && (
          <Typography variant="h6" noWrap component="div">
            CRUD System
          </Typography>
        )}
        <IconButton color="inherit" onClick={handleToggle}>
          {collapsed ? <Menu /> : <ChevronLeft />}
        </IconButton>
      </Toolbar>
      
      <Divider />
      
      <Box sx={{ overflow: 'auto', flex: 1 }}>
        <List>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    minHeight: 48,
                    justifyContent: collapsed ? 'center' : 'initial',
                    px: 2.5,
                    backgroundColor: isActive ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                    borderRight: isActive ? '3px solid #1976d2' : 'none',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.04)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: collapsed ? 'auto' : 3,
                      justifyContent: 'center',
                      color: isActive ? '#1976d2' : 'inherit',
                    }}
                  >
                    <Icon size={20} />
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={item.text}
                      sx={{
                        opacity: 1,
                        color: isActive ? '#1976d2' : 'inherit',
                        fontWeight: isActive ? 600 : 400,
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
};

export default AppSidebar;