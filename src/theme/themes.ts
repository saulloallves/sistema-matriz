import { createTheme } from "@mui/material/styles";

// Tema Claro (Padrão) - Baseado no muiTheme existente
export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#ffc31a", // Amarelo Girafa
      light: "#ffd04d",
      dark: "#cc9c15",
      contrastText: "#6b3a10", // Marrom Girafa
    },
    secondary: {
      main: "#ff9923", // Laranja Mancha
      light: "#ffad52",
      dark: "#cc7a1c",
      contrastText: "#fff",
    },
    info: {
      main: "#00aeff", // Azul do Céu
      light: "#33bfff",
      dark: "#008bcc",
      contrastText: "#fff",
    },
    error: {
      main: "#d32f2f",
      light: "#ef5350",
      dark: "#c62828",
      contrastText: "#fff",
    },
    warning: {
      main: "#6b3a10", // Marrom Girafa
      light: "#8a5020",
      dark: "#4d2a0c",
      contrastText: "#fff",
    },
    background: {
      default: "#fafafa",
      paper: "#fff",
    },
    text: {
      primary: "#333333",
      secondary: "#666666",
    },
  },
  typography: {
    fontFamily: '"Poppins", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
});

// Tema Escuro
export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#ffc31a", // Amarelo Girafa
    },
    secondary: {
      main: "#ff9923", // Laranja Mancha
    },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
    text: {
      primary: "#ffffff",
      secondary: "#b3b3b3",
    },
  },
  typography: {
    fontFamily: '"Poppins", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
});
