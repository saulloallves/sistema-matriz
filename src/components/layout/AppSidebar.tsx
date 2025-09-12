import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import {
  Box,
  Tooltip,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  LayoutDashboard,
  Store,
  User as UserIcon,
  Users,
  MessageCircle,
  Calendar,
  Settings,
} from 'lucide-react';

const menuItems = [
  { text: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { text: 'Unidades', icon: Store, path: '/unidades' },
  { text: 'Franqueados', icon: UserIcon, path: '/franqueados' },
  { text: 'Vínculos', icon: Users, path: '/franqueados-unidades' },
  { text: 'Grupos WhatsApp', icon: MessageCircle, path: '/grupos-whatsapp' },
  { text: 'Evento Seguidores', icon: Calendar, path: '/evento-seguidores' },
  { text: 'Configurações', icon: Settings, path: '/configuracoes' },
];

const AppSidebar = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { data: profile } = useUserProfile();

  const activeIndex = menuItems.findIndex(item => item.path === location.pathname);
  const currentIndicatorIndex = hoveredIndex !== null ? hoveredIndex : activeIndex;

  const handleUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorEl(null);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        left: 16,
        background: '#fff',
        borderRadius: '10px',
        padding: '16px 0',
        boxShadow: '0 0 40px rgba(0,0,0,0.03)',
        height: 'calc(100vh - 32px)',
        width: '88px',
        zIndex: 1200,
        border: '1px solid rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
        <Box
          component="nav"
          sx={{
            position: 'relative',
            flex: 1,
          }}
        >
        <Box
          component="ul"
          sx={{
            position: 'relative',
            listStyle: 'none',
            margin: 0,
            padding: 0,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          {/* Animated background indicator */}
          <Box
            sx={{
              position: 'absolute',
              opacity: currentIndicatorIndex >= 0 ? 1 : 0,
              zIndex: 1,
              top: 0,
              left: '16px',
              width: '56px',
              height: '56px',
              background: '#406ff3',
              borderRadius: '17.5px',
              transition: 'all 300ms cubic-bezier(0.4, 0.0, 0.2, 1)',
              transform: `translateY(${currentIndicatorIndex * 60}px)`,
              willChange: 'transform',
            }}
          />

          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const isHovered = hoveredIndex === index;
            // Ícone fica branco apenas se está sendo hovered OU se está ativo E não há hover em outro item
            const shouldBeWhite = isHovered || (isActive && hoveredIndex === null);
            
            return (
              <Box
                key={item.text}
                component="li"
                sx={{
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <Tooltip 
                  title={item.text} 
                  placement="right"
                  arrow
                  slotProps={{
                    tooltip: {
                      sx: {
                        backgroundColor: '#406ff3',
                        color: '#fff',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        borderRadius: '17.5px',
                        padding: '12px 16px',
                        marginLeft: '16px !important',
                      }
                    },
                    arrow: {
                      sx: {
                        color: '#406ff3',
                      }
                    }
                  }}
                >
                  <IconButton
                    onClick={() => navigate(item.path)}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    sx={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '56px',
                      width: '56px',
                      color: shouldBeWhite ? '#fff' : '#6a778e',
                      transition: 'color 300ms ease',
                      borderRadius: '17.5px',
                      zIndex: 2,
                      backgroundColor: 'transparent',
                      '&:hover': {
                        backgroundColor: 'transparent',
                      },
                    }}
                  >
                    <Icon size={20} />
                  </IconButton>
                </Tooltip>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* User Menu Section */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center',
        paddingBottom: 2,
        paddingTop: 1,
      }}>
        <Divider sx={{ 
          width: '56px', 
          marginBottom: 2,
          backgroundColor: 'rgba(0,0,0,0.1)' 
        }} />
      </Box>
      
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center',
        paddingBottom: 1,
      }}>
        <Tooltip 
          title="Perfil do usuário" 
          placement="right"
          arrow
          slotProps={{
            tooltip: {
              sx: {
                backgroundColor: '#406ff3',
                color: '#fff',
                fontSize: '0.875rem',
                fontWeight: 600,
                borderRadius: '17.5px',
                padding: '12px 16px',
                marginLeft: '16px !important',
              }
            },
            arrow: {
              sx: {
                color: '#406ff3',
              }
            }
          }}
        >
          <IconButton
            onClick={handleUserMenu}
            sx={{ 
              padding: 0,
              '&:hover': {
                backgroundColor: 'transparent',
              }
            }}
          >
            <Avatar 
              sx={{ 
                width: 40, 
                height: 40, 
                bgcolor: '#406ff3',
                borderRadius: '10px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                }
              }}
            >
              <UserIcon size={18} />
            </Avatar>
          </IconButton>
        </Tooltip>
        
        <Menu
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'center',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'center',
            horizontal: 'left',
          }}
          open={Boolean(anchorEl)}
          onClose={handleCloseUserMenu}
          PaperProps={{
            sx: {
              borderRadius: '10px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              border: '1px solid rgba(0,0,0,0.05)',
              ml: 2,
            }
          }}
        >
          <MenuItem 
            sx={{
              borderRadius: '6px',
              margin: '4px 8px',
              cursor: 'default',
              '&:hover': {
                backgroundColor: 'transparent',
              }
            }}
          >
            {profile?.full_name || 'Usuário'}
          </MenuItem>
          <MenuItem 
            onClick={async () => {
              handleCloseUserMenu();
              await signOut();
            }}
            sx={{
              borderRadius: '6px',
              margin: '4px 8px',
              color: '#d32f2f',
              '&:hover': {
                backgroundColor: 'rgba(211, 47, 47, 0.1)',
              }
            }}
          >
            Sair
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default AppSidebar;