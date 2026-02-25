"use client";

import { useState, useMemo, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Pagination } from "@/components/ui/pagination";
import { SearchBar } from "@/components/ui/search-bar";
import { StatusBadge, getStatusLabel } from "@/components/ui/status-badge";
import { cn } from "@/lib/cn";
import { supabase, type Cobranca } from "@/lib/supabase";

type StatusFilter = "all" | "pendente" | "pago" | "atrasado" | "cancelado";

const statusFilterOptions: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "pendente", label: "Aberta" },
  { key: "atrasado", label: "Vencida" },
  { key: "pago", label: "Paga" },
  { key: "cancelado", label: "Cancelada" },
];

export default function CobrancasPage() {
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("cobrancas")
        .select("*, franqueados(nome)")
        .order("vencimento", { ascending: false });

      if (!error && data) {
        setCobrancas(data as Cobranca[]);
      }
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = [...cobrancas];

    if (statusFilter !== "all") {
      list = list.filter((c) => c.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (c) =>
          (c.franqueados?.nome || "").toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q)
      );
    }

    return list;
  }, [search, statusFilter, cobrancas]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginatedRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value / 100);
  }

  function formatDate(dateStr: string) {
    return new Intl.DateTimeFormat("pt-BR").format(new Date(dateStr + "T12:00:00"));
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Cobranças" />
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-4">
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
                <div className="h-3 bg-gray-100 rounded w-1/4 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Cobranças" />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchBar
          value={search}
          onValueChange={setSearch}
          placeholder="Buscar por franqueado ou ID..."
          wrapperClassName="flex-1 min-w-[200px] max-w-sm"
        />
        <div className="flex items-center gap-1.5">
          {statusFilterOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setStatusFilter(opt.key)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-full border transition-colors",
                statusFilter === opt.key
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {cobrancas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-12 text-center">
          <p className="text-sm text-gray-400">Nenhuma cobrança encontrada.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-12 text-center">
          <p className="text-sm text-gray-400">
            Nenhuma cobrança encontrada para os filtros selecionados.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
            }}
            className="mt-3 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
          >
            Limpar filtros
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm" aria-label="Lista de cobranças">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-4 py-3 font-medium text-xs text-muted-foreground uppercase tracking-wide">
                    Franqueado
                  </th>
                  <th className="px-4 py-3 font-medium text-xs text-muted-foreground uppercase tracking-wide text-right">
                    Valor
                  </th>
                  <th className="px-4 py-3 font-medium text-xs text-muted-foreground uppercase tracking-wide">
                    Vencimento
                  </th>
                  <th className="px-4 py-3 font-medium text-xs text-muted-foreground uppercase tracking-wide">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 text-sm">
                        {c.franqueados?.nome || "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-900 font-medium tabular-nums">
                      {formatCurrency(c.valor)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 tabular-nums">
                      {formatDate(c.vencimento)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} showIcon={false} size="sm" />
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
        </div>
      )}
    </div>
  );
}
