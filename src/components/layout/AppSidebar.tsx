import { 
  Building2, 
  Users, 
  Network, 
  MessageSquare, 
  BarChart3,
  Database
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { 
    title: "Unidades", 
    url: "/unidades", 
    icon: Building2,
    description: "Gerenciar unidades e lojas"
  },
  { 
    title: "Franqueados", 
    url: "/franqueados", 
    icon: Users,
    description: "Gerenciar franqueados"
  },
  { 
    title: "Relacionamentos", 
    url: "/franqueados-unidades", 
    icon: Network,
    description: "Franqueados x Unidades"
  },
  { 
    title: "Grupos WhatsApp", 
    url: "/grupos-whatsapp", 
    icon: MessageSquare,
    description: "Grupos de WhatsApp das unidades"
  },
  { 
    title: "Evento Seguidores", 
    url: "/evento-seguidores", 
    icon: BarChart3,
    description: "Controle de eventos"
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path + "/");

  return (
    <Sidebar className={`${collapsed ? "w-16" : "w-64"} border-r bg-card shadow-soft`} collapsible="icon">
      <SidebarContent>
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-lg shadow-soft">
              <Database className="h-5 w-5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="font-semibold text-foreground">OPUS Manager</h2>
                <p className="text-xs text-muted-foreground">Sistema de Gestão</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {!collapsed && "Gestão de Dados"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                        isActive(item.url) 
                          ? "bg-primary text-primary-foreground shadow-soft" 
                          : "hover:bg-muted/50 text-foreground"
                      }`}
                    >
                      <item.icon className={`h-4 w-4 ${isActive(item.url) ? "text-primary-foreground" : "text-muted-foreground"}`} />
                      {!collapsed && (
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{item.title}</div>
                          <div className={`text-xs truncate ${
                            isActive(item.url) 
                              ? "text-primary-foreground/80" 
                              : "text-muted-foreground"
                          }`}>
                            {item.description}
                          </div>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}