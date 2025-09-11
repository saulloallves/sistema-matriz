import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import UnidadesPage from "./pages/UnidadesPage";
import FranqueadosPage from "./pages/FranqueadosPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/unidades" element={<UnidadesPage />} />
            <Route path="/franqueados" element={<FranqueadosPage />} />
            <Route path="/franqueados-unidades" element={<div className="p-6 text-center text-muted-foreground">Página em desenvolvimento</div>} />
            <Route path="/grupos-whatsapp" element={<div className="p-6 text-center text-muted-foreground">Página em desenvolvimento</div>} />
            <Route path="/evento-seguidores" element={<div className="p-6 text-center text-muted-foreground">Página em desenvolvimento</div>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
