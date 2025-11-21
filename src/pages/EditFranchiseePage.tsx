/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
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
import { toast, Toaster } from "react-hot-toast";
import { Link2Off, Upload, Trash2, User } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const steps = ["Identificação", "Verificação de Segurança", "Edição dos Dados"];

interface EditFranchiseePageProps {
  cpfFromUrl?: string | null;
}

export default function EditFranchiseePage({
  cpfFromUrl = null,
}: EditFranchiseePageProps) {
  const isMobile = useIsMobile();
  const [activeStep, setActiveStep] = useState(0);
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

  const handleIdentifierSubmit = async () => {
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
  };

  useEffect(() => {
    if (cpfFromUrl) {
      handleIdentifierSubmit();
    }
  }, [cpfFromUrl]);

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
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar código.");
    } finally {
      setLoading(false);
    }
  };

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
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6">Identificação</Typography>
            <Typography sx={{ mb: 3 }}>
              Para começar, informe seu CPF/RNM ou o CNPJ da sua unidade.
            </Typography>
            <TextField
              label="CPF/RNM ou CNPJ"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            <Button
              onClick={handleIdentifierSubmit}
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Buscar Cadastro"}
            </Button>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6">Verificação de Segurança</Typography>
            <Typography sx={{ mb: 3 }}>
              Para editar seus dados, precisamos confirmar sua identidade.
            </Typography>
            {!verificationType ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Button
                    variant="contained"
                    onClick={() => handleRequestOtp("phone")}
                    disabled={loading || !franchiseeData?.contact}
                    fullWidth
                  >
                    Verificar por Telefone (SMS)
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box>
                <TextField
                  label="Código de Verificação"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  fullWidth
                  sx={{ mb: 2 }}
                />
                <Button
                  onClick={handleVerifyOtp}
                  variant="contained"
                  disabled={loading || otp.length < 6}
                >
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    "Verificar Código"
                  )}
                </Button>
              </Box>
            )}
          </Box>
        );
      case 2:
        return (
          <form onSubmit={handleSubmit}>
            {/* === DADOS DO FRANQUEADO === */}
            <Typography variant="h5" gutterBottom>
              Dados Pessoais
            </Typography>
            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: "repeat(12, 1fr)",
              }}
            >
              <Box sx={{ gridColumn: { xs: "span 12", md: "span 6" } }}>
                <TextField
                  name="full_name"
                  label="Nome Completo"
                  value={franchiseeData.full_name}
                  onChange={(e) => handleChange(e, "franchisee")}
                  fullWidth
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
                />
              </Box>

              {/* Profile Image Upload Section */}
              <Box sx={{ gridColumn: "span 12", display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, my: 2 }}>
                <Typography variant="subtitle1">Foto de Perfil</Typography>
                <Avatar
                  src={avatarPreview || undefined}
                  sx={{ width: 120, height: 120 }}
                >
                  <User size={60} />
                </Avatar>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/*"
                  hidden
                />
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<Upload size={16} />}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Alterar Foto
                  </Button>
                  {avatarPreview && (
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Trash2 size={16} />}
                      onClick={handleRemoveAvatar}
                    >
                      Remover
                    </Button>
                  )}
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  JPG, PNG ou GIF. Máx 5MB.
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 4 }} />
            <Typography variant="h5" gutterBottom>
              Endereço Pessoal
            </Typography>
            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: "repeat(12, 1fr)",
              }}
            >
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

            <Divider sx={{ my: 4 }} />
            <Typography variant="h5" gutterBottom>
              Dados Profissionais
            </Typography>
            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: "repeat(12, 1fr)",
              }}
            >
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

            {/* === DADOS DAS UNIDADES === */}
            <Divider sx={{ my: 4 }} />
            <Typography variant="h5" gutterBottom>
              Unidades Vinculadas
            </Typography>

            {!isPrincipal && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Você é um sócio e pode editar apenas seus dados pessoais e
                vínculos. A edição dos dados da unidade é permitida apenas ao
                sócio principal.
              </Alert>
            )}

            {unitsData.map((unit, index) => (
              <Paper
                key={unit.id}
                sx={{
                  p: 2,
                  mb: 2,
                  border: unlinkedUnitIds.includes(unit.id)
                    ? "2px solid red"
                    : "1px solid #ddd",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography variant="h6">
                      {unit.fantasy_name || `Unidade ${unit.group_code}`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Código: {unit.group_code} | {unit.city}/{unit.uf}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      onClick={() => handleOpenEditModal(unit)}
                      disabled={!isPrincipal}
                    >
                      Editar Dados da Unidade
                    </Button>
                    <Button
                      variant={
                        unlinkedUnitIds.includes(unit.id)
                          ? "contained"
                          : "outlined"
                      }
                      color="error"
                      startIcon={<Link2Off />}
                      onClick={() => toggleUnlinkUnit(unit.id)}
                    >
                      {unlinkedUnitIds.includes(unit.id)
                        ? "Manter Vínculo"
                        : "Romper Vínculo"}
                    </Button>
                  </Stack>
                </Box>
              </Paper>
            ))}

            {/* Unit Edit Modal */}
            <Dialog
              open={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              maxWidth="md"
              fullWidth
            >
              <DialogTitle>Editar Unidade: {editingUnit?.fantasy_name}</DialogTitle>
              <DialogContent dividers>
                {editingUnit && (
                  <Box
                    sx={{
                      display: "grid",
                      gap: 2,
                      gridTemplateColumns: "repeat(12, 1fr)",
                      mt: 1,
                    }}
                  >
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
                    {/* Add other unit fields as needed */}
                  </Box>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
                <Button onClick={handleSaveUnit} variant="contained">
                  Salvar Alterações
                </Button>
              </DialogActions>
            </Dialog>



            <Button
              type="submit"
              variant="contained"
              sx={{ mt: 4 }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                "Enviar Alterações para Aprovação"
              )}
            </Button>
          </form >
        );
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: (theme) =>
          theme.palette.mode === "dark" ? "#111827" : "rgb(252, 252, 255)",
      }}
    >
      <Toaster position="top-center" />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Editar Dados Cadastrais</Typography>
        </Toolbar>
      </AppBar>
      <Container
        component={Paper}
        sx={{ p: isMobile ? 2 : 4, mt: isMobile ? 2 : 4 }}
      >
        <Stepper
          activeStep={activeStep}
          sx={{ mb: 4 }}
          orientation={isMobile ? "vertical" : "horizontal"}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {renderStepContent()}
      </Container>
    </Box>
  );
}
