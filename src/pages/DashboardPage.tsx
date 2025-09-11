import { useState, useEffect } from "react";
import { Building2, Users, Network, MessageSquare, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DashboardStats {
  unidades: number;
  franqueados: number;
  relacionamentos: number;
  gruposWhatsapp: number;
  eventosSeguidores: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    unidades: 0,
    franqueados: 0,
    relacionamentos: 0,
    gruposWhatsapp: 0,
    eventosSeguidores: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      const [
        { count: unidadesCount },
        { count: franqueadosCount },
        { count: relacionamentosCount },
        { count: gruposWhatsappCount },
        { count: eventosSeguidoresCount },
      ] = await Promise.all([
        supabase.from("unidades").select("*", { count: "exact", head: true }),
        supabase.from("franqueados").select("*", { count: "exact", head: true }),
        supabase.from("franqueados_unidades").select("*", { count: "exact", head: true }),
        supabase.from("unidades_grupos_whatsapp").select("*", { count: "exact", head: true }),
        supabase.from("evento_seguidores").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        unidades: unidadesCount || 0,
        franqueados: franqueadosCount || 0,
        relacionamentos: relacionamentosCount || 0,
        gruposWhatsapp: gruposWhatsappCount || 0,
        eventosSeguidores: eventosSeguidoresCount || 0,
      });
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
      toast.error("Erro ao carregar estatísticas do dashboard");
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Unidades",
      description: "Total de unidades cadastradas",
      value: stats.unidades,
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Franqueados",
      description: "Total de franqueados ativos",
      value: stats.franqueados,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Relacionamentos",
      description: "Vínculos franqueados-unidades",
      value: stats.relacionamentos,
      icon: Network,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Grupos WhatsApp",
      description: "Grupos de comunicação ativos",
      value: stats.gruposWhatsapp,
      icon: MessageSquare,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Eventos Seguidores",
      description: "Controles de eventos",
      value: stats.eventosSeguidores,
      icon: BarChart3,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Visão geral do sistema de gestão OPUS Manager
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((card) => (
            <Card key={card.title} className="shadow-soft hover:shadow-medium transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {card.value.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="bg-gradient-primary rounded-lg p-6 text-primary-foreground shadow-strong">
        <h2 className="text-xl font-semibold mb-2">Bem-vindo ao OPUS Manager</h2>
        <p className="text-primary-foreground/90">
          Sistema completo de gestão para franquias. Gerencie unidades, franqueados, 
          relacionamentos e muito mais de forma eficiente e organizada.
        </p>
      </div>
    </div>
  );
}