import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useParams, useSearchParams } from "react-router-dom";
import EditFranchiseePage from "./EditFranchiseePage";
import { lightTheme, darkTheme } from "../theme/themes";

export default function ThemedEditFranchiseePage() {
  const { theme } = useParams<{ theme?: string }>();
  const [searchParams] = useSearchParams();
  const cpf = searchParams.get("cpf");
  const updatePhoto = searchParams.get("update-photo") !== "false";
  const selectedTheme = theme === "dark" ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={selectedTheme}>
      <CssBaseline />
      <EditFranchiseePage cpfFromUrl={cpf} updatePhoto={updatePhoto} />
    </ThemeProvider>
  );
}
