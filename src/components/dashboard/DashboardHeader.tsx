import { Box, Typography, Button, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Building2, UserPlus, Link as LinkIcon, UserCog } from 'lucide-react';

const DashboardHeader = () => {
  const navigate = useNavigate();
  const { data: profile } = useUserProfile();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 12) {
      return 'Bom dia';
    }
    if (hour >= 12 && hour < 18) {
      return 'Boa tarde';
    }
    return 'Boa noite';
  };

  const quickAccessLinks = [
    { text: 'Adicionar Unidade', icon: <Building2 size={20} />, path: '/unidades' },
    { text: 'Adicionar Franqueado', icon: <UserPlus size={20} />, path: '/franqueados' },
    { text: 'Criar Vínculo', icon: <LinkIcon size={20} />, path: '/franqueados-unidades' },
    { text: 'Gerenciar Usuários', icon: <UserCog size={20} />, path: '/configuracoes' },
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: 'text.primary' }}>
        {getGreeting()}, {profile?.full_name || 'Usuário'}!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Aqui está um resumo do que está acontecendo no seu sistema.
      </Typography>

      <Box>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: '1.1rem' }}>
          Acesso Rápido
        </Typography>
        <Grid container spacing={2}>
          {quickAccessLinks.map((link) => (
            <Grid item xs={12} sm={6} md={3} key={link.text}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={link.icon}
                onClick={() => navigate(link.path)}
                sx={{ 
                  justifyContent: 'flex-start', 
                  py: 1.5, 
                  textTransform: 'none',
                  borderColor: 'divider',
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    borderColor: 'primary.main',
                    color: 'primary.main'
                  }
                }}
              >
                {link.text}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default DashboardHeader;