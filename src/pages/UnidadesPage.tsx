import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

type Unidade = Tables<"unidades">;

const columns: ColumnDef<Unidade>[] = [
  {
    accessorKey: "group_code",
    header: "Código",
    cell: ({ row }) => (
      <div className="font-mono text-sm bg-muted px-2 py-1 rounded">
        {row.getValue("group_code")}
      </div>
    ),
  },
  {
    accessorKey: "group_name",
    header: "Nome",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("group_name")}</div>
    ),
  },
  {
    accessorKey: "store_model",
    header: "Modelo",
    cell: ({ row }) => {
      const model = row.getValue("store_model") as string;
      const variants: Record<string, string> = {
        junior: "secondary",
        light: "outline", 
        padrao: "default",
        intermediaria: "secondary",
        mega_store: "destructive",
        pontinha: "outline"
      };
      return (
        <Badge variant={variants[model] as any || "default"}>
          {model}
        </Badge>
      );
    },
  },
  {
    accessorKey: "store_phase",
    header: "Fase",
    cell: ({ row }) => {
      const phase = row.getValue("store_phase") as string;
      return (
        <Badge variant={phase === "operacao" ? "default" : "secondary"}>
          {phase === "operacao" ? "Operação" : "Implantação"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "city",
    header: "Cidade",
  },
  {
    accessorKey: "uf",
    header: "UF",
    cell: ({ row }) => (
      <div className="font-mono text-sm">{row.getValue("uf")}</div>
    ),
  },
  {
    accessorKey: "phone",
    header: "Telefone",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const unidade = row.original;

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

export default function UnidadesPage() {
  const [data, setData] = useState<Unidade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUnidades();
  }, []);

  const loadUnidades = async () => {
    try {
      setLoading(true);
      const { data: unidades, error } = await supabase
        .from("unidades")
        .select("*")
        .order("group_code", { ascending: true });

      if (error) {
        throw error;
      }

      setData(unidades || []);
    } catch (error) {
      console.error("Erro ao carregar unidades:", error);
      toast.error("Erro ao carregar unidades");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    toast.info("Funcionalidade de adicionar em desenvolvimento");
  };

  const handleEdit = (unidade: Unidade) => {
    toast.info("Funcionalidade de editar em desenvolvimento");
  };

  const handleDelete = (unidade: Unidade) => {
    toast.info("Funcionalidade de excluir em desenvolvimento");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Carregando unidades...</div>
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
      searchPlaceholder="Pesquisar unidades..."
      title="Unidades"
      description="Gerencie todas as unidades e lojas do sistema"
    />
  );
}