import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useParams } from "react-router-dom";
import EditFranchiseePage from "./EditFranchiseePage";
import { lightTheme, darkTheme } from "../theme/themes";

export default function ThemedEditFranchiseePage() {
  const { theme } = useParams<{ theme?: string }>();
  const selectedTheme = theme === "dark" ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={selectedTheme}>
      <CssBaseline />
      <EditFranchiseePage />
    </ThemeProvider>
  );
}
