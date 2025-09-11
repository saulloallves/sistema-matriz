import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Search, Bell, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";

export function Header() {
  return (
    <header className="h-16 border-b bg-card/50 backdrop-blur-sm flex items-center gap-4 px-6">
      <SidebarTrigger className="p-2 hover:bg-muted rounded-lg transition-colors" />
      
      <div className="flex-1 flex items-center gap-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Pesquisar registros..." 
            className="pl-10 bg-background/50 border-muted focus:border-primary"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="p-2">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="p-2">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}