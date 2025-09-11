import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/crud/DataTable";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

type Franqueado = Tables<"franqueados">;

const columns: ColumnDef<Franqueado>[] = [
  {
    accessorKey: "full_name",
    header: "Nome",
    cell: ({ row }) => {
      const franqueado = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={franqueado.profile_image || ""} />
            <AvatarFallback>
              {franqueado.full_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{franqueado.full_name}</div>
            <div className="text-sm text-muted-foreground">{franqueado.contact}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "owner_type",
    header: "Tipo",
    cell: ({ row }) => {
      const type = row.getValue("owner_type") as string;
      return (
        <Badge variant="secondary">
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "is_in_contract",
    header: "Contrato",
    cell: ({ row }) => {
      const inContract = row.getValue("is_in_contract") as boolean;
      return (
        <Badge variant={inContract ? "default" : "outline"}>
          {inContract ? "Ativo" : "Inativo"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "receives_prolabore",
    header: "Pró-labore",
    cell: ({ row }) => {
      const receives = row.getValue("receives_prolabore") as boolean;
      const value = row.original.prolabore_value;
      return (
        <div className="text-sm">
          {receives ? (
            <div>
              <Badge variant="default">Sim</Badge>
              {value && <div className="text-muted-foreground mt-1">R$ {value.toLocaleString()}</div>}
            </div>
          ) : (
            <Badge variant="outline">Não</Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "availability",
    header: "Disponibilidade",
    cell: ({ row }) => {
      const availability = row.getValue("availability") as string;
      return availability ? (
        <div className="text-sm">{availability}</div>
      ) : (
        <div className="text-muted-foreground text-sm">-</div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Cadastro",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return (
        <div className="text-sm text-muted-foreground">
          {date.toLocaleDateString("pt-BR")}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const franqueado = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="gap-2">
              <Eye className="h-4 w-4" />
              Visualizar
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <Edit className="h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-destructive">
              <Trash2 className="h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function FranqueadosPage() {
  const [data, setData] = useState<Franqueado[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFranqueados();
  }, []);

  const loadFranqueados = async () => {
    try {
      setLoading(true);
      const { data: franqueados, error } = await supabase
        .from("franqueados")
        .select("*")
        .order("full_name", { ascending: true });

      if (error) {
        throw error;
      }

      setData(franqueados || []);
    } catch (error) {
      console.error("Erro ao carregar franqueados:", error);
      toast.error("Erro ao carregar franqueados");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    toast.info("Funcionalidade de adicionar em desenvolvimento");
  };

  const handleEdit = (franqueado: Franqueado) => {
    toast.info("Funcionalidade de editar em desenvolvimento");
  };

  const handleDelete = (franqueado: Franqueado) => {
    toast.info("Funcionalidade de excluir em desenvolvimento");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Carregando franqueados...</div>
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={data}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      searchPlaceholder="Pesquisar franqueados..."
      title="Franqueados"
      description="Gerencie todos os franqueados do sistema"
    />
  );
}