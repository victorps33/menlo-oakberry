"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, type Franqueado } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Plus, Trash2, Pencil, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 10;

export default function CadastroPage() {
  const [franqueados, setFranqueados] = useState<Franqueado[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  async function fetchFranqueados() {
    setLoading(true);
    let query = supabase
      .from("franqueados")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (search) {
      query = query.or(`nome.ilike.%${search}%,cnpj.ilike.%${search}%`);
    }

    const { data, count, error } = await query;
    if (!error) {
      setFranqueados(data || []);
      setTotal(count || 0);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchFranqueados();
  }, [page, search]);

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este franqueado?")) return;
    await supabase.from("franqueados").delete().eq("id", id);
    fetchFranqueados();
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cadastro</h1>
          <p className="text-sm text-muted-foreground">
            Gerenciamento de Franqueados
          </p>
        </div>
        <Link href="/cadastro/novo">
          <Button className="bg-menlo-orange hover:bg-menlo-orange-hover text-white rounded-full px-6">
            <Plus className="mr-2 h-4 w-4" />
            Novo Franqueado
          </Button>
        </Link>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <div className="mb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar franqueado..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="pl-10 rounded-full border-border"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Nome</TableHead>
              <TableHead className="font-semibold">CNPJ</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : franqueados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  Nenhum franqueado encontrado
                </TableCell>
              </TableRow>
            ) : (
              franqueados.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>{f.nome}</TableCell>
                  <TableCell>{f.cnpj}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link href={`/cadastro/${f.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(f.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Linhas das páginas{" "}
            <span className="mx-1 inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs">
              {PAGE_SIZE}
            </span>{" "}
            Exibindo {page + 1} de {totalPages || 1}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
