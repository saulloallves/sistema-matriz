/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Paper,
  Container,
  Alert,
  AppBar,
  Toolbar,
  Stepper,
  Step,
  StepLabel,
  Switch,
  FormControlLabel,
  Divider,
  Avatar,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { toast } from "react-hot-toast";
import { Link2Off, Upload, Trash2, User, Check, ChevronRight, ArrowLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import logoHeader from "@/assets/logo-header.png";
import logoPrincipal from "@/assets/logo-principal.png";

const steps = [
  { label: "Identificação", description: "Seus dados" },
  { label: "Segurança", description: "Verificação" },
  { label: "Edição", description: "Atualização" }
];

interface EditFranchiseePageProps {
  cpfFromUrl?: string | null;
  updatePhoto?: boolean;
}

export default function EditFranchiseePage({
  cpfFromUrl = null,
  updatePhoto = true,
}: EditFranchiseePageProps) {
  const isMobile = useIsMobile();
  const [activeStep, setActiveStep] = useState(0);
  // Timer state for Resend SMS
  const [resendTimer, setResendTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [identifier, setIdentifier] = useState(cpfFromUrl || "");
  const [verificationType, setVerificationType] = useState<
    "email" | "phone" | null
  >(null);
  const [otp, setOtp] = useState("");
  const [franchiseeData, setFranchiseeData] = useState<any>(null);
  const [unitsData, setUnitsData] = useState<any[]>([]);
  const [isPrincipal, setIsPrincipal] = useState(false);
  const [unlinkedUnitIds, setUnlinkedUnitIds] = useState<string[]>([]);

  // Unit Editing State
  const [editingUnit, setEditingUnit] = useState<any>(null);
  const [modifiedUnitIds, setModifiedUnitIds] = useState<string[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Profile Image State
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleIdentifierSubmit = useCallback(async () => {
    if (!identifier) {
      toast.error("Por favor, insira um CPF/RNM ou CNPJ.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "get-franchisee-data-for-edit",
        {
          body: { identifier },
        }
      );

      if (error || !data.found) {
        toast.error(
          "Nenhum franqueado encontrado. Verifique o documento ou cadastre-se.",
          { duration: 5000 }
        );
        setTimeout(() => {
          window.location.href = "https://cadastro.girabot.com.br";
        }, 5000);
        return;
      }

      setFranchiseeData(data.franchiseeData);
      setUnitsData(data.unitsData);
      setIsPrincipal(data.franchiseeData.owner_type === "Principal");

      // Initialize avatar preview
      if (data.franchiseeData.profile_image) {
        setAvatarPreview(data.franchiseeData.profile_image);
      }

      setActiveStep(1);
      toast.success(
        "Franqueado encontrado! Prossiga com a verificação de segurança."
      );
    } catch (err) {
      toast.error("Erro ao buscar seus dados.");
    } finally {
      setLoading(false);
    }
  }, [identifier]);

  useEffect(() => {
    if (cpfFromUrl) {
      handleIdentifierSubmit();
    }
  }, [cpfFromUrl, handleIdentifierSubmit]);

  const handleRequestOtp = async (type: "email" | "phone") => {
    setLoading(true);
    setVerificationType(type);
    try {
      const channel = type === "phone" ? "sms" : "email";
      const target =
        type === "phone" ? franchiseeData.contact : franchiseeData.email;

      if (!target) {
        toast.error(
          `Não foi possível encontrar um ${type === "phone" ? "telefone" : "e-mail"
          } para verificação.`
        );
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signInWithOtp(
        type === "phone" ? { phone: target } : { email: target }
      );
      if (error) throw error;

      toast.success(`Código de verificação enviado para seu ${channel}.`);
      setResendTimer(30); // Start 30s timer
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar código.");
    } finally {
      setLoading(false);
    }
  };

  // Timer effect
  useEffect(() => {
    if (resendTimer > 0) {
      const timerId = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [resendTimer]);

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      const target =
        verificationType === "phone"
          ? franchiseeData.contact
          : franchiseeData.email;

      let error;

      if (verificationType === "phone") {
        const res = await supabase.auth.verifyOtp({
          phone: target,
          token: otp,
          type: "sms",
        });
        error = res.error;
      } else {
        const res = await supabase.auth.verifyOtp({
          email: target,
          token: otp,
          type: "email",
        });
        error = res.error;
      }

      if (error) throw error;

      toast.success("Verificação concluída com sucesso!");
      setActiveStep(2);
    } catch (err: any) {
      toast.error(err.message || "Código inválido ou expirado.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    entity: "franchisee" | "unit",
    index?: number
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    const val = type === "checkbox" ? checked : value;

    if (entity === "franchisee") {
      setFranchiseeData({ ...franchiseeData, [name]: val });
    } else if (entity === "unit" && index !== undefined) {
      const newUnitsData = [...unitsData];
      newUnitsData[index] = { ...newUnitsData[index], [name]: val };
      setUnitsData(newUnitsData);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      // Basic validation
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("A imagem deve ter no máximo 5MB.");
        return;
      }

      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setFranchiseeData({ ...franchiseeData, profile_image: null });
  };

  const toggleUnlinkUnit = (unitId: string) => {
    setUnlinkedUnitIds((prev) =>
      prev.includes(unitId)
        ? prev.filter((id) => id !== unitId)
        : [...prev, unitId]
    );
  };

  const handleOpenEditModal = (unit: any) => {
    setEditingUnit({ ...unit });
    setIsEditModalOpen(true);
  };

  const handleUnitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditingUnit((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSaveUnit = () => {
    if (!editingUnit) return;

    setUnitsData((prev) =>
      prev.map((u) => (u.id === editingUnit.id ? editingUnit : u))
    );

    if (!modifiedUnitIds.includes(editingUnit.id)) {
      setModifiedUnitIds((prev) => [...prev, editingUnit.id]);
    }

    setIsEditModalOpen(false);
    setEditingUnit(null);
    toast.success("Dados da unidade atualizados localmente.");
  };

  const generateRequestNumber = async () => {
    const { data, error } = await supabase
      .from("onboarding_requests" as any)
      .select("request_number")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error fetching last request number:", error);
      throw new Error("Failed to generate request number");
    }

    const currentYear = new Date().getFullYear();
    let nextSequence = 1;

    if (data?.request_number) {
      const parts = data.request_number.split("-");
      if (parts.length === 3 && parts[1] === currentYear.toString()) {
        const lastSequence = parseInt(parts[2], 10);
        if (!isNaN(lastSequence)) {
          nextSequence = lastSequence + 1;
        }
      }
    }

    return `ONB-${currentYear}-${nextSequence.toString().padStart(5, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalProfileImage = franchiseeData.profile_image;

      // Upload image if a new file was selected
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${franchiseeData.id}/${fileName}`; // Using franchisee ID for folder structure

        const { error: uploadError } = await supabase.storage
          .from('franchisee_profiles')
          .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('franchisee_profiles')
          .getPublicUrl(filePath);

        finalProfileImage = urlData.publicUrl;
      }

      const requestNumber = await generateRequestNumber();

      const payload = {
        franchiseeData: {
          ...franchiseeData,
          profile_image: finalProfileImage
        },
        unitsData: isPrincipal
          ? unitsData.filter((u) => modifiedUnitIds.includes(u.id) && !unlinkedUnitIds.includes(u.id))
          : undefined,
        unlinkedUnitIds: unlinkedUnitIds,
        request_number: requestNumber,
      };

      const { error } = await supabase.functions.invoke(
        "submit-franchisee-update",
        {
          body: payload,
        }
      );

      if (error) throw error;

      toast.success("Dados enviados para aprovação com sucesso!");
    } catch (err: any) {
      console.error("Erro no envio:", err);
      toast.error(err.message || "Erro ao enviar atualização.");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ textAlign: "center", py: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
              Identificação
            </Typography>
            <Typography sx={{ mb: 4, color: 'text.secondary', maxWidth: 400, mx: 'auto' }}>
              Por favor, informe seu CPF/RNM ou o CNPJ da sua unidade para buscar seus dados de cadastro.
            </Typography>
            
            <Box sx={{ maxWidth: 400, mx: 'auto' }}>
              <TextField
                label="CPF/RNM ou CNPJ"
                placeholder="Digite seu número aqui"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                fullWidth
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: 'background.default'
                  }
                }}
              />
              <Button
                onClick={handleIdentifierSubmit}
                variant="contained"
                disabled={loading}
                fullWidth
                size="large"
                sx={{ 
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1rem',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(255, 195, 26, 0.3)'
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "BUSCAR DADOS"}
              </Button>
              
              <Button 
                variant="text" 
                sx={{ mt: 2, color: 'info.main', fontWeight: 500 }}
              >
                Precisa de ajuda?
              </Button>
            </Box>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ textAlign: "center", py: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
              Verificação de Segurança
            </Typography>
            <Typography sx={{ mb: 4, color: 'text.secondary', maxWidth: 400, mx: 'auto' }}>
              Para proteger sua conta, precisamos verificar sua identidade. Por favor, solicite um código para continuar.
            </Typography>

            {!verificationType ? (
              <Box sx={{ maxWidth: 400, mx: 'auto' }}>
                <Button
                  variant="contained"
                  onClick={() => handleRequestOtp("phone")}
                  disabled={loading || !franchiseeData?.contact}
                  fullWidth
                  size="large"
                  sx={{ 
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: '1rem',
                    fontWeight: 600,
                    mb: 2,
                    boxShadow: '0 4px 12px rgba(255, 195, 26, 0.3)'
                  }}
                >
                  ENVIAR CÓDIGO SMS
                </Button>
                <Typography variant="caption" color="text.secondary">
                  Enviaremos um código de 6 dígitos para seu celular cadastrado.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ maxWidth: 400, mx: 'auto' }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Digite o código de 6 dígitos
                </Typography>
                <TextField
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  fullWidth
                  inputProps={{ 
                    maxLength: 6, 
                    style: { textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.5rem', fontWeight: 600 } 
                  }}
                  sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'background.default'
                    }
                  }}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Button
                    onClick={() => handleRequestOtp(verificationType)}
                    disabled={resendTimer > 0 || loading}
                    variant="text"
                    size="small"
                    sx={{ color: resendTimer > 0 ? 'text.disabled' : 'primary.main' }}
                  >
                    {resendTimer > 0 ? `Reenviar em ${resendTimer}s` : "Reenviar Código"}
                  </Button>
                </Box>

                <Button
                  onClick={handleVerifyOtp}
                  variant="contained"
                  disabled={loading || otp.length < 6}
                  fullWidth
                  size="large"
                  sx={{ 
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: '1rem',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(255, 195, 26, 0.3)'
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "VERIFICAR & CONTINUAR"}
                </Button>
              </Box>
            )}
          </Box>
        );
      case 2:
        return (
          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                Atualização de Dados
              </Typography>
              <Typography color="text.secondary">
                Mantenha seus dados atualizados para garantir a comunicação correta.
              </Typography>
            </Box>

            {/* === DADOS PESSOAIS === */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: 'background.default', borderRadius: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <User size={20} /> Dados Pessoais
              </Typography>
              
              <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "repeat(12, 1fr)" }}>
                {/* Profile Image Upload Section */}
                {updatePhoto && (
                  <Box sx={{ gridColumn: "span 12", display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box sx={{ position: 'relative' }}>
                      <Avatar
                        src={avatarPreview || undefined}
                        sx={{ width: 120, height: 120, border: '4px solid', borderColor: 'background.paper', boxShadow: 2 }}
                      >
                        <User size={60} />
                      </Avatar>
                      <IconButton 
                        sx={{ 
                          position: 'absolute', 
                          bottom: 0, 
                          right: 0, 
                          bgcolor: 'primary.main', 
                          color: 'primary.contrastText',
                          '&:hover': { bgcolor: 'primary.dark' }
                        }}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload size={18} />
                      </IconButton>
                    </Box>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarChange}
                      accept="image/*"
                      hidden
                    />
                    {avatarPreview && (
                      <Button
                        variant="text"
                        color="error"
                        startIcon={<Trash2 size={16} />}
                        onClick={handleRemoveAvatar}
                        size="small"
                      >
                        Remover foto
                      </Button>
                    )}
                  </Box>
                )}

                <Box sx={{ gridColumn: { xs: "span 12", md: "span 6" } }}>
                  <TextField
                    name="full_name"
                    label="Nome Completo"
                    value={franchiseeData.full_name}
                    onChange={(e) => handleChange(e, "franchisee")}
                    fullWidth
                    variant="outlined"
                  />
                </Box>
                <Box sx={{ gridColumn: { xs: "span 12", md: "span 6" } }}>
                  <TextField
                    name="email"
                    label="E-mail"
                    type="email"
                    value={franchiseeData.email}
                    onChange={(e) => handleChange(e, "franchisee")}
                    fullWidth
                  />
                </Box>
                <Box sx={{ gridColumn: { xs: "span 12", md: "span 6" } }}>
                  <TextField
                    name="contact"
                    label="Telefone"
                    value={franchiseeData.contact}
                    onChange={(e) => handleChange(e, "franchisee")}
                    fullWidth
                  />
                </Box>
                <Box sx={{ gridColumn: { xs: "span 12", md: "span 6" } }}>
                  <TextField
                    name="nationality"
                    label="Nacionalidade"
                    value={franchiseeData.nationality}
                    onChange={(e) => handleChange(e, "franchisee")}
                    fullWidth
                  />
                </Box>
                <Box sx={{ gridColumn: { xs: "span 12", md: "span 6" } }}>
                  <TextField
                    name="birth_date"
                    label="Data de Nascimento"
                    type="date"
                    value={franchiseeData.birth_date}
                    onChange={(e) => handleChange(e, "franchisee")}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
                <Box sx={{ gridColumn: { xs: "span 12", md: "span 6" } }}>
                  <TextField
                    name="instagram"
                    label="Instagram Pessoal"
                    value={franchiseeData.instagram}
                    onChange={(e) => handleChange(e, "franchisee")}
                    fullWidth
                    InputProps={{
                      startAdornment: <Typography color="text.secondary" sx={{ mr: 1 }}>@</Typography>
                    }}
                  />
                </Box>
              </Box>
            </Paper>

            {/* === ENDEREÇO === */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: 'background.default', borderRadius: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Endereço Pessoal</Typography>
              <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "repeat(12, 1fr)" }}>
                <Box sx={{ gridColumn: { xs: "span 12", sm: "span 4" } }}>
                  <TextField
                    name="postal_code"
                    label="CEP"
                    value={franchiseeData.postal_code}
                    onChange={(e) => handleChange(e, "franchisee")}
                    fullWidth
                  />
                </Box>
                <Box sx={{ gridColumn: { xs: "span 12", sm: "span 8" } }}>
                  <TextField
                    name="address"
                    label="Endereço"
                    value={franchiseeData.address}
                    onChange={(e) => handleChange(e, "franchisee")}
                    fullWidth
                  />
                </Box>
                <Box sx={{ gridColumn: { xs: "span 12", sm: "span 4" } }}>
                  <TextField
                    name="number_address"
                    label="Número"
                    value={franchiseeData.number_address}
                    onChange={(e) => handleChange(e, "franchisee")}
                    fullWidth
                  />
                </Box>
                <Box sx={{ gridColumn: { xs: "span 12", sm: "span 8" } }}>
                  <TextField
                    name="address_complement"
                    label="Complemento"
                    value={franchiseeData.address_complement || ""}
                    onChange={(e) => handleChange(e, "franchisee")}
                    fullWidth
                  />
                </Box>
                <Box sx={{ gridColumn: { xs: "span 12", sm: "span 6" } }}>
                  <TextField
                    name="neighborhood"
                    label="Bairro"
                    value={franchiseeData.neighborhood}
                    onChange={(e) => handleChange(e, "franchisee")}
                    fullWidth
                  />
                </Box>
                <Box sx={{ gridColumn: { xs: "span 12", sm: "span 4" } }}>
                  <TextField
                    name="city"
                    label="Cidade"
                    value={franchiseeData.city}
                    onChange={(e) => handleChange(e, "franchisee")}
                    fullWidth
                  />
                </Box>
                <Box sx={{ gridColumn: { xs: "span 12", sm: "span 2" } }}>
                  <TextField
                    name="uf"
                    label="UF"
                    value={franchiseeData.uf}
                    onChange={(e) => handleChange(e, "franchisee")}
                    fullWidth
                  />
                </Box>
              </Box>
            </Paper>

            {/* === DADOS PROFISSIONAIS === */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: 'background.default', borderRadius: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Dados Profissionais</Typography>
              <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "repeat(12, 1fr)" }}>
                <Box sx={{ gridColumn: { xs: "span 12", md: "span 6" } }}>
                  <TextField
                    name="education"
                    label="Educação"
                    value={franchiseeData.education}
                    onChange={(e) => handleChange(e, "franchisee")}
                    fullWidth
                  />
                </Box>
                <Box sx={{ gridColumn: { xs: "span 12", md: "span 6" } }}>
                  <TextField
                    name="previous_profession"
                    label="Profissão Anterior"
                    value={franchiseeData.previous_profession}
                    onChange={(e) => handleChange(e, "franchisee")}
                    fullWidth
                  />
                </Box>
                <Box sx={{ gridColumn: { xs: "span 12", md: "span 6" } }}>
                  <TextField
                    name="previous_salary_range"
                    label="Faixa Salarial Anterior"
                    value={franchiseeData.previous_salary_range}
                    onChange={(e) => handleChange(e, "franchisee")}
                    fullWidth
                  />
                </Box>
                <Box sx={{ gridColumn: { xs: "span 12", md: "span 6" } }}>
                  <TextField
                    name="availability"
                    label="Disponibilidade"
                    value={franchiseeData.availability}
                    onChange={(e) => handleChange(e, "franchisee")}
                    fullWidth
                  />
                </Box>

                <Box sx={{ gridColumn: { xs: "span 12", sm: "span 6" } }}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="was_entrepreneur"
                        checked={franchiseeData.was_entrepreneur}
                        onChange={(e) => handleChange(e, "franchisee")}
                      />
                    }
                    label="Já foi empreendedor?"
                  />
                </Box>

                <Box sx={{ gridColumn: { xs: "span 12", sm: "span 6" } }}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="has_other_activities"
                        checked={franchiseeData.has_other_activities}
                        onChange={(e) => handleChange(e, "franchisee")}
                      />
                    }
                    label="Possui outras atividades?"
                  />
                </Box>
                {franchiseeData.has_other_activities && (
                  <Box sx={{ gridColumn: "span 12" }}>
                    <TextField
                      name="other_activities_description"
                      label="Descrição de Outras Atividades"
                      value={franchiseeData.other_activities_description || ""}
                      onChange={(e) => handleChange(e, "franchisee")}
                      fullWidth
                      multiline
                      rows={2}
                    />
                  </Box>
                )}

                <Box sx={{ gridColumn: { xs: "span 12", sm: "span 6" } }}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="receives_prolabore"
                        checked={franchiseeData.receives_prolabore}
                        onChange={(e) => handleChange(e, "franchisee")}
                      />
                    }
                    label="Recebe Pró-labore?"
                  />
                </Box>
                {franchiseeData.receives_prolabore && (
                  <Box sx={{ gridColumn: { xs: "span 12", sm: "span 6" } }}>
                    <TextField
                      name="prolabore_amount"
                      label="Valor do Pró-labore"
                      value={franchiseeData.prolabore_amount || ""}
                      onChange={(e) => handleChange(e, "franchisee")}
                      fullWidth
                    />
                  </Box>
                )}

                <Box sx={{ gridColumn: { xs: "span 12", sm: "span 6" } }}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="was_referred"
                        checked={franchiseeData.was_referred}
                        onChange={(e) => handleChange(e, "franchisee")}
                      />
                    }
                    label="Foi referenciado?"
                  />
                </Box>
                {franchiseeData.was_referred && (
                  <>
                    <Box sx={{ gridColumn: { xs: "span 12", sm: "span 6" } }}>
                      <TextField
                        name="referrer_name"
                        label="Quem indicou?"
                        value={franchiseeData.referrer_name || ""}
                        onChange={(e) => handleChange(e, "franchisee")}
                        fullWidth
                      />
                    </Box>
                    <Box sx={{ gridColumn: { xs: "span 12", sm: "span 6" } }}>
                      <TextField
                        name="referrer_unit_code"
                        label="Código da Unidade (Quem indicou)"
                        value={franchiseeData.referrer_unit_code || ""}
                        onChange={(e) => handleChange(e, "franchisee")}
                        fullWidth
                      />
                    </Box>
                  </>
                )}
              </Box>
            </Paper>

            {/* === DADOS DAS UNIDADES === */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: 'background.default', borderRadius: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Unidades Vinculadas</Typography>

              {!isPrincipal && (
                <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                  Você é um sócio e pode editar apenas seus dados pessoais e
                  vínculos. A edição dos dados da unidade é permitida apenas ao
                  sócio principal.
                </Alert>
              )}

              {unitsData.map((unit, index) => (
                <Paper
                  key={unit.id}
                  elevation={0}
                  sx={{
                    p: 2,
                    mb: 2,
                    border: '1px solid',
                    borderColor: unlinkedUnitIds.includes(unit.id) ? 'error.main' : 'divider',
                    borderRadius: 2,
                    bgcolor: 'background.paper'
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: 'wrap',
                      gap: 2
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {unit.fantasy_name || `Unidade ${unit.group_code}`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Código: {unit.group_code} | {unit.city}/{unit.uf}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleOpenEditModal(unit)}
                        disabled={!isPrincipal}
                      >
                        Editar
                      </Button>
                      <Button
                        variant={unlinkedUnitIds.includes(unit.id) ? "contained" : "outlined"}
                        color="error"
                        size="small"
                        startIcon={<Link2Off size={16} />}
                        onClick={() => toggleUnlinkUnit(unit.id)}
                      >
                        {unlinkedUnitIds.includes(unit.id) ? "Manter" : "Romper"}
                      </Button>
                    </Stack>
                  </Box>
                </Paper>
              ))}
            </Paper>

            {/* Unit Edit Modal */}
            <Dialog
              open={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              maxWidth="md"
              fullWidth
              PaperProps={{ sx: { borderRadius: 3 } }}
            >
              <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                Editar Unidade: {editingUnit?.fantasy_name}
              </DialogTitle>
              <DialogContent sx={{ py: 3 }}>
                {editingUnit && (
                  <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "repeat(12, 1fr)", mt: 1 }}>
                    <Box sx={{ gridColumn: { xs: "span 12", md: "span 6" } }}>
                      <TextField
                        name="phone"
                        label="Telefone da Unidade"
                        value={editingUnit.phone || ""}
                        onChange={handleUnitChange}
                        fullWidth
                      />
                    </Box>
                    <Box sx={{ gridColumn: { xs: "span 12", md: "span 6" } }}>
                      <TextField
                        name="email"
                        label="E-mail da Unidade"
                        value={editingUnit.email || ""}
                        onChange={handleUnitChange}
                        fullWidth
                      />
                    </Box>
                    <Box sx={{ gridColumn: { xs: "span 12", md: "span 6" } }}>
                      <TextField
                        name="instagram_profile"
                        label="Instagram da Unidade"
                        value={editingUnit.instagram_profile || ""}
                        onChange={handleUnitChange}
                        fullWidth
                      />
                    </Box>
                  </Box>
                )}
              </DialogContent>
              <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Button onClick={() => setIsEditModalOpen(false)} color="inherit">Cancelar</Button>
                <Button onClick={handleSaveUnit} variant="contained">
                  Salvar Alterações
                </Button>
              </DialogActions>
            </Dialog>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ 
                  py: 1.5, 
                  px: 4,
                  borderRadius: 2,
                  fontSize: '1rem',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(255, 195, 26, 0.3)'
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "ENVIAR ALTERAÇÕES PARA APROVAÇÃO"}
              </Button>
            </Box>
          </form >
        );
      default:
        return null;
    }
  };


  return (
    <Box sx={{ 
      minHeight: "100vh", 
      bgcolor: "background.default",
      pb: 4
    }}>

      {/* Custom Header */}
      <Paper 
        elevation={0}
        sx={{ 
          py: 2, 
          px: 3, 
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 1100,
          bgcolor: 'background.paper'
        }}
      >
        <img 
          src={logoHeader} 
          alt="Cresci e Perdi" 
          style={{ height: 40, objectFit: 'contain' }} 
        />
      </Paper>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        {/* Custom Stepper */}
        <Box sx={{ mb: 6, px: { xs: 1, md: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            {/* Progress Bar Background */}
            <Box sx={{ 
              position: 'absolute', 
              top: 24, 
              left: 0, 
              right: 0, 
              height: 4, 
              bgcolor: 'action.hover',
              zIndex: 0,
              borderRadius: 2
            }} />
            
            {/* Active Progress Bar */}
            <Box sx={{ 
              position: 'absolute', 
              top: 24, 
              left: 0, 
              width: `${(activeStep / (steps.length - 1)) * 100}%`, 
              height: 4, 
              bgcolor: 'primary.main',
              zIndex: 0,
              borderRadius: 2,
              transition: 'width 0.5s ease-in-out'
            }} />

            {steps.map((step, index) => {
              const isActive = index === activeStep;
              const isCompleted = index < activeStep;
              
              return (
                <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, position: 'relative' }}>
                  <Box 
                    sx={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: '50%', 
                      bgcolor: isActive || isCompleted ? 'primary.main' : 'background.paper',
                      border: '4px solid',
                      borderColor: isActive || isCompleted ? 'primary.main' : 'action.disabledBackground',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isActive || isCompleted ? 'primary.contrastText' : 'text.disabled',
                      fontWeight: 'bold',
                      mb: 1,
                      transition: 'all 0.3s ease',
                      boxShadow: isActive ? '0 0 0 4px rgba(255, 195, 26, 0.2)' : 'none'
                    }}
                  >
                    {isCompleted ? <Check size={24} /> : index + 1}
                  </Box>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? 'primary.main' : 'text.secondary',
                      display: { xs: isActive ? 'block' : 'none', sm: 'block' }
                    }}
                  >
                    {step.label}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>

        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 3, md: 5 }, 
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper'
          }}
        >
          {renderStepContent()}
        </Paper>
      </Container>
    </Box>
  );
}
