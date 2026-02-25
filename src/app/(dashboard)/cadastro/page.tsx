"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Pagination } from "@/components/ui/pagination";
import { SearchBar } from "@/components/ui/search-bar";
import { cn } from "@/lib/cn";
import { supabase, type Franqueado } from "@/lib/supabase";
import { Pencil, Trash2 } from "lucide-react";

export default function CadastroPage() {
  const router = useRouter();
  const [franqueados, setFranqueados] = useState<Franqueado[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);
  const pageSize = 15;

  useEffect(() => {
    loadFranqueados();
  }, []);

  async function loadFranqueados() {
    setLoading(true);
    const { data, error } = await supabase
      .from("franqueados")
      .select("*")
      .order("nome", { ascending: true });

    if (!error && data) {
      setFranqueados(data);
    }
    setLoading(false);
  }

  async function handleDelete(id: string, nome: string) {
    if (!confirm(`Tem certeza que deseja excluir "${nome}"?`)) return;
    setDeleting(id);
    const { error } = await supabase.from("franqueados").delete().eq("id", id);
    if (!error) {
      setFranqueados((prev) => prev.filter((f) => f.id !== id));
    }
    setDeleting(null);
  }

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return franqueados;
    const q = searchQuery.toLowerCase().trim();
    return franqueados.filter(
      (f) =>
        f.nome.toLowerCase().includes(q) ||
        f.cnpj.includes(q)
    );
  }, [searchQuery, franqueados]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginatedRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  function getInitials(nome: string) {
    return nome
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }

  function formatCnpj(cnpj: string) {
    // Format if it's a raw number string
    const digits = cnpj.replace(/\D/g, "");
    if (digits.length === 14) {
      return `${digits.slice(0,2)}.${digits.slice(2,5)}.${digits.slice(5,8)}/${digits.slice(8,12)}-${digits.slice(12)}`;
    }
    return cnpj;
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Cadastro" />
        <div className="space-y-3">
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-4">
                <div className="h-9 w-9 bg-gray-200 rounded-lg animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
                  <div className="h-3 bg-gray-100 rounded w-1/4 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Cadastro" />

      {/* Section: Franqueados */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Franqueados
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {franqueados.length} cadastrados
            </span>
          </h2>
          <div className="flex items-center gap-2">
            <Link
              href="/cadastro/novo"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-white bg-primary rounded-full hover:bg-primary-hover transition-colors"
            >
              Novo Franqueado
            </Link>
          </div>
        </div>
      </div>

      {franqueados.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-12 text-center">
          <p className="text-sm text-gray-400 mb-4">Nenhum franqueado cadastrado.</p>
          <Link
            href="/cadastro/novo"
            className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-medium text-white bg-primary rounded-full hover:bg-primary-hover transition-colors"
          >
            Novo Franqueado
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Search */}
          <div className="px-4 pt-4 pb-3">
            <SearchBar
              value={searchQuery}
              onValueChange={setSearchQuery}
              placeholder="Buscar por nome ou CNPJ..."
              wrapperClassName="max-w-sm"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-gray-400">
                Nenhum franqueado encontrado para &ldquo;{searchQuery}&rdquo;.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto min-h-[480px]">
                <table className="w-full min-w-[640px] text-sm" aria-label="Lista de franqueados">
                  <thead>
                    <tr className="border-b border-gray-100 text-left">
                      <th className="px-4 py-3 font-medium text-xs text-muted-foreground uppercase tracking-wide">
                        Franqueado
                      </th>
                      <th className="px-4 py-3 font-medium text-xs text-muted-foreground uppercase tracking-wide">
                        CNPJ
                      </th>
                      <th className="px-4 py-3 font-medium text-xs text-muted-foreground uppercase tracking-wide text-right">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRows.map((f) => (
                      <tr
                        key={f.id}
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/20 text-xs font-semibold text-gray-700">
                              {getInitials(f.nome)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate">
                                {f.nome}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 tabular-nums">
                          {formatCnpj(f.cnpj)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => router.push(`/cadastro/${f.id}`)}
                              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                              aria-label={`Editar ${f.nome}`}
                            >
                              <Pencil className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <button
                              onClick={() => handleDelete(f.id, f.nome)}
                              disabled={deleting === f.id}
                              className={cn(
                                "p-1.5 rounded-md transition-colors",
                                deleting === f.id
                                  ? "text-gray-300 cursor-not-allowed"
                                  : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                              )}
                              aria-label={`Excluir ${f.nome}`}
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={filtered.length}
                pageSize={pageSize}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
