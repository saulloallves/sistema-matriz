import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  LayoutDashboard,
  Store,
  User,
  Users,
  MessageCircle,
  Calendar,
  Settings,
  HelpCircle,
} from 'lucide-react';

const menuItems = [
  { text: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { text: 'Unidades', icon: Store, path: '/unidades' },
  { text: 'Franqueados', icon: User, path: '/franqueados' },
  { text: 'Franqueados/Unidades', icon: Users, path: '/franqueados-unidades' },
  { text: 'Grupos WhatsApp', icon: MessageCircle, path: '/grupos-whatsapp' },
  { text: 'Evento Seguidores', icon: Calendar, path: '/evento-seguidores' },
  { text: 'Ajuda', icon: HelpCircle, path: '/ajuda' },
  { text: 'Configurações', icon: Settings, path: '/configuracoes' },
];

const AppSidebar = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const activeIndex = menuItems.findIndex(item => item.path === location.pathname);

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
        height: 'calc(100vh - 64px)',
        width: '88px',
        zIndex: 1200,
        border: '1px solid rgba(0,0,0,0.05)',
      }}
    >
      <Box
        component="nav"
        sx={{
          position: 'relative',
          height: '100%',
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
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const isHovered = hoveredIndex === index;
            
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
                  sx={{
                    '& .MuiTooltip-tooltip': {
                      backgroundColor: '#406ff3',
                      color: '#fff',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      borderRadius: '17.5px',
                      padding: '12px 16px',
                      marginLeft: '16px !important',
                    },
                    '& .MuiTooltip-arrow': {
                      color: '#406ff3',
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
                      color: isActive ? '#fff' : '#6a778e',
                      transition: 'all 250ms ease',
                      borderRadius: '17.5px',
                      zIndex: 2,
                      '&:hover': {
                        color: '#fff',
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
          
          {/* Animated background indicator */}
          <Box
            sx={{
              content: '""',
              position: 'absolute',
              opacity: activeIndex >= 0 || hoveredIndex !== null ? 1 : 0,
              zIndex: 1,
              top: 0,
              left: '16px',
              width: '56px',
              height: '56px',
              background: '#406ff3',
              borderRadius: '17.5px',
              transition: 'all 250ms cubic-bezier(1, 0.2, 0.1, 1.2)',
              transform: `translateY(${((hoveredIndex !== null ? hoveredIndex : activeIndex) * 60)}px)`,
              animation: hoveredIndex !== null ? 'gooeyEffect 250ms ease 1' : 'none',
              '@keyframes gooeyEffect': {
                '0%': {
                  transform: `translateY(${((hoveredIndex !== null ? hoveredIndex : activeIndex) * 60)}px) scale(1, 1)`,
                },
                '50%': {
                  transform: `translateY(${((hoveredIndex !== null ? hoveredIndex : activeIndex) * 60)}px) scale(0.5, 1.5)`,
                },
                '100%': {
                  transform: `translateY(${((hoveredIndex !== null ? hoveredIndex : activeIndex) * 60)}px) scale(1, 1)`,
                }
              }
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default AppSidebar;