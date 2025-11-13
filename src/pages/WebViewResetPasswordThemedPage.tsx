import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Button,
  TextField,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  InputAdornment,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";
import { Mail, KeyRound, CheckCircle } from "lucide-react";
import Logo from "@/assets/logo-principal.png";
import toast, { Toaster } from "react-hot-toast";

const lightTheme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
    primary: {
      main: "#f59e42",
    },
  },
  shape: { borderRadius: 16 },
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
    primary: {
      main: "#f59e42",
    },
  },
  shape: { borderRadius: 16 },
});

interface WebViewResetPasswordThemedPageProps {
  themeMode: "light" | "dark";
}

export default function WebViewResetPasswordThemedPage({
  themeMode,
}: WebViewResetPasswordThemedPageProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const selectedTheme = themeMode === "dark" ? darkTheme : lightTheme;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Por favor, informe seu email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Email inválido");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: resetError } = await supabase.functions.invoke(
        "reset-user-password",
        {
          body: { email },
        }
      );

      if (resetError) {
        console.error("Erro ao resetar senha:", resetError);
        toast.error(
          resetError.message || "Erro ao resetar senha. Tente novamente."
        );
        setIsSubmitting(false);
        return;
      }

      setSuccess(true);
      toast.success("Nova senha gerada e enviada!");
    } catch (error: unknown) {
      console.error("Erro ao processar reset de senha:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Ocorreu um erro inesperado.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemeProvider theme={selectedTheme}>
      <CssBaseline />
      <Toaster position="top-center" />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          p: 2,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            maxWidth: "450px",
            width: "100%",
            borderRadius: "20px",
          }}
        >
          <Box
            component="img"
            src={Logo}
            alt="Logo"
            sx={{ width: 120, height: "auto", mb: 3 }}
          />
          <KeyRound
            size={40}
            color={selectedTheme.palette.primary.main}
            style={{ marginBottom: "16px" }}
          />
          <Typography
            variant="h5"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            Resetar Senha
          </Typography>

          {success ? (
            <Alert
              severity="success"
              icon={<CheckCircle />}
              sx={{ mt: 2, width: "100%", borderRadius: "12px" }}
            >
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Senha resetada com sucesso!
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Uma nova senha foi enviada para o seu WhatsApp e E-mail
                cadastrados.
              </Typography>
            </Alert>
          ) : (
            <>
              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                sx={{ mb: 3 }}
              >
                Digite seu e-mail cadastrado para receber uma nova senha gerada
                automaticamente.
              </Typography>
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ mt: 1, width: "100%" }}
              >
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Endereço de e-mail"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail
                          size={20}
                          color={selectedTheme.palette.primary.main}
                        />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: "12px" }}
                  disabled={isSubmitting || !email}
                >
                  {isSubmitting ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Enviar Nova Senha"
                  )}
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </ThemeProvider>
  );
}
