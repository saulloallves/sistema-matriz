import { Box, Typography } from '@mui/material';

const Index = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h2" component="h1" sx={{ mb: 2, fontWeight: 'bold' }}>
          Welcome to Your Blank App
        </Typography>
        <Typography variant="h5" color="text.secondary">
          Start building your amazing project here!
        </Typography>
      </Box>
    </Box>
  );
};

export default Index;