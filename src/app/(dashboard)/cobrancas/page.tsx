"use client";

import { useState, useMemo, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { FilterEmptyState } from "@/components/layout/FilterEmptyState";
import { DataEmptyState } from "@/components/layout/DataEmptyState";
import { MetricCard } from "@/components/ui/metric-card";
import { Pagination } from "@/components/ui/pagination";
import { FilterPillGroup } from "@/components/ui/filter-pills";
import { KpiSkeleton } from "@/components/ui/skeleton";
import { SearchBar } from "@/components/ui/search-bar";
import { getStatusClasses } from "@/components/ui/status-badge";
import { cn } from "@/lib/cn";
import { supabase, type Cobranca } from "@/lib/supabase";
import {
  ChevronDown,
  ChevronUp,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Clock,
  FileText,
  CreditCard,
  QrCode,
  Receipt,
} from "lucide-react";

const PAYMENT_ICONS: Record<string, React.ReactNode> = {
  Boleto: <FileText className="h-3.5 w-3.5" />,
  Pix: <QrCode className="h-3.5 w-3.5" />,
  Cartão: <CreditCard className="h-3.5 w-3.5" />,
};

const NF_CATEGORIES = ["Royalties", "FNP"];

type SortKey = "vencimento" | "valor" | "cliente";
type SortDir = "asc" | "desc";

type CobrancaWithCliente = Cobranca & { cliente: string };

export default function CobrancasPage() {
  const [allCobrancas, setAllCobrancas] = useState<CobrancaWithCliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompetencia, setSelectedCompetencia] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoriaFilter, setCategoriaFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("vencimento");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("cobrancas")
        .select("*, franqueados(nome)")
        .order("vencimento", { ascending: false });
      if (data) {
        const mapped = data.map((c) => ({
          ...c,
          cliente: (c.franqueados as { nome: string } | null)?.nome || "—",
        })) as CobrancaWithCliente[];
        setAllCobrancas(mapped);
      }
      setLoading(false);
    }
    load();
  }, []);

  // Derive competências from data
  const competencias = useMemo(() => {
    const set = new Set<string>();
    allCobrancas.forEach((c) => { if (c.competencia) set.add(c.competencia); });
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return Array.from(set).sort((a, b) => {
      const [mesA, anoA] = a.split("/");
      const [mesB, anoB] = b.split("/");
      return (parseInt(anoB) * 12 + meses.indexOf(mesB)) - (parseInt(anoA) * 12 + meses.indexOf(mesA));
    }).map((c) => {
      const [mes, ano] = c.split("/");
      return { label: `${mes}/${ano.slice(2)}`, value: c };
    });
  }, [allCobrancas]);

  const cobrancasFiltradas = useMemo(() => {
    return selectedCompetencia === "all"
      ? allCobrancas
      : allCobrancas.filter((c) => c.competencia === selectedCompetencia);
  }, [selectedCompetencia, allCobrancas]);

  const filtered = useMemo(() => {
    let list = [...cobrancasFiltradas];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.cliente.toLowerCase().includes(q) ||
          (c.descricao || "").toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") list = list.filter((c) => c.status === statusFilter);
    if (categoriaFilter !== "all") list = list.filter((c) => c.categoria === categoriaFilter);

    list.sort((a, b) => {
      let av: string | number;
      let bv: string | number;
      if (sortKey === "cliente") {
        av = a.cliente;
        bv = b.cliente;
      } else if (sortKey === "valor") {
        av = Number(a.valor);
        bv = Number(b.valor);
      } else {
        av = a.vencimento;
        bv = b.vencimento;
      }
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });

    return list;
  }, [search, statusFilter, categoriaFilter, sortKey, sortDir, cobrancasFiltradas]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginatedRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, categoriaFilter, selectedCompetencia, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setCategoriaFilter("all");
  }

  const hasActiveFilters = search !== "" || statusFilter !== "all" || categoriaFilter !== "all";
  const selectedLabel = selectedCompetencia === "all"
    ? "Todas"
    : competencias.find((c) => c.value === selectedCompetencia)?.label || "";
  const periodLabel = selectedCompetencia === "all"
    ? "Todas as competências"
    : `Competência: ${selectedLabel}`;

  // Stats
  const stats = useMemo(() => {
    const totalEmitido = cobrancasFiltradas.reduce((s, c) => s + Number(c.valor), 0);
    const totalPago = cobrancasFiltradas.filter((c) => c.status === "Paga").reduce((s, c) => s + Number(c.valor), 0);
    const abertas = cobrancasFiltradas.filter((c) => c.status === "Aberta");
    const vencidas = cobrancasFiltradas.filter((c) => c.status === "Vencida");
    const valorAberto = abertas.reduce((s, c) => s + (Number(c.valor) - Number(c.valor_pago || 0)), 0);
    const valorVencido = vencidas.reduce((s, c) => s + (Number(c.valor) - Number(c.valor_pago || 0)), 0);
    return {
      total: cobrancasFiltradas.length,
      totalEmitido,
      totalPago,
      valorAberto,
      valorVencido,
      aberta: abertas.length,
      paga: cobrancasFiltradas.filter((c) => c.status === "Paga").length,
      vencida: vencidas.length,
    };
  }, [cobrancasFiltradas]);

  const fmtBRL = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (
      sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
    ) : (
      <ChevronDown className="h-3 w-3 opacity-30" />
    );

  function isOverdue(dateStr: string, status: string): boolean {
    if (status !== "Vencida") return false;
    return new Date(dateStr) < new Date();
  }

  function canEmitNf(c: CobrancaWithCliente): boolean {
    return !c.nf_emitida && NF_CATEGORIES.includes(c.categoria || "");
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Cobranças" />
        <KpiSkeleton count={4} />
      </div>
    );
  }

  if (allCobrancas.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Cobranças" />
        <DataEmptyState
          title="Nenhuma cobrança encontrada"
          description="Crie sua primeira cobrança para começar a gerenciar seus recebimentos."
          icon={<Receipt className="h-6 w-6 text-gray-400" />}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <PageHeader
          title="Cobranças"
          period={periodLabel}
        />

        <FilterPillGroup
          options={[
            { key: "all", label: "Todas" },
            ...competencias.map((c) => ({ key: c.value, label: c.label })),
          ]}
          value={selectedCompetencia}
          onChange={setSelectedCompetencia}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            className="animate-in stagger-1"
            icon={<DollarSign className="h-4 w-4" />}
            title="Total Emitido"
            value={fmtBRL(stats.totalEmitido)}
            subtitle={`${selectedLabel} · ${stats.total} cobranças`}
          />
          <MetricCard
            className="animate-in stagger-2"
            icon={<TrendingUp className="h-4 w-4" />}
            title="Total Recebido"
            value={fmtBRL(stats.totalPago)}
            subtitle={`${selectedLabel} · ${stats.paga} pagas`}
          />
          <MetricCard
            className="animate-in stagger-3"
            icon={<Clock className="h-4 w-4" />}
            title="Em Aberto"
            value={fmtBRL(stats.valorAberto)}
            subtitle={`${selectedLabel} · ${stats.aberta} a vencer`}
          />
          <MetricCard
            className="animate-in stagger-4"
            icon={<AlertTriangle className="h-4 w-4" />}
            title="Vencido"
            value={fmtBRL(stats.valorVencido)}
            subtitle={`${selectedLabel} · ${stats.vencida} vencidas`}
            variant={stats.valorVencido > 0 ? "danger" : "default"}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <SearchBar
            value={search}
            onValueChange={setSearch}
            placeholder="Buscar por cliente, descrição ou ID…"
            wrapperClassName="flex-1 min-w-[200px] max-w-sm"
          />
          <FilterPillGroup
            options={[
              { key: "all", label: "Todos" },
              { key: "Aberta", label: "Aberta" },
              { key: "Vencida", label: "Vencida" },
              { key: "Paga", label: "Paga" },
              { key: "Cancelada", label: "Cancelada" },
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
          />
          <FilterPillGroup
            options={[
              { key: "all", label: "Todas" },
              { key: "Royalties", label: "Royalties" },
              { key: "FNP", label: "FNP" },
              { key: "Taxa de Franquia", label: "Taxa de Franquia" },
            ]}
            value={categoriaFilter}
            onChange={setCategoriaFilter}
          />
        </div>
      </div>

      <div>
        {filtered.length === 0 ? (
          <FilterEmptyState
            message={
              hasActiveFilters
                ? "Nenhuma cobrança encontrada para os filtros selecionados."
                : "Nenhuma cobrança emitida neste período."
            }
            suggestion={
              hasActiveFilters
                ? "Tente ajustar os filtros ou selecionar outro período."
                : undefined
            }
            onClear={hasActiveFilters ? clearFilters : undefined}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-sm" aria-label="Lista de cobranças">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="border-b border-gray-100 text-left">
                    <th className="px-4 py-3 font-medium text-xs text-muted-foreground uppercase tracking-wide">Cobrança</th>
                    <th className="px-4 py-3 font-medium text-xs text-muted-foreground uppercase tracking-wide">
                      <button onClick={() => toggleSort("cliente")} className="inline-flex items-center gap-1">
                        Cliente <SortIcon k="cliente" />
                      </button>
                    </th>
                    <th className="px-4 py-3 font-medium text-xs text-muted-foreground uppercase tracking-wide">
                      <button onClick={() => toggleSort("vencimento")} className="inline-flex items-center gap-1">
                        Vencimento <SortIcon k="vencimento" />
                      </button>
                    </th>
                    <th className="px-4 py-3 font-medium text-xs text-muted-foreground uppercase tracking-wide">Pagamento</th>
                    <th className="px-4 py-3 font-medium text-xs text-muted-foreground uppercase tracking-wide text-right">
                      <button onClick={() => toggleSort("valor")} className="inline-flex items-center gap-1">
                        Valor <SortIcon k="valor" />
                      </button>
                    </th>
                    <th className="px-4 py-3 font-medium text-xs text-muted-foreground uppercase tracking-wide">Forma</th>
                    <th className="px-4 py-3 font-medium text-xs text-muted-foreground uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 font-medium text-xs text-muted-foreground uppercase tracking-wide text-center">NF</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRows.map((c) => (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 text-sm">{c.descricao || c.id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">{c.categoria}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{c.cliente}</td>
                      <td className={cn(
                        "px-4 py-3 text-sm",
                        isOverdue(c.vencimento, c.status) ? "text-red-600 font-medium" : "text-gray-600"
                      )}>
                        {new Date(c.vencimento + "T12:00:00").toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {c.paid_at ? (
                          <span className="text-emerald-600">
                            {new Date(c.paid_at).toLocaleDateString("pt-BR")}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900 font-medium tabular-nums">
                        {fmtBRL(Number(c.valor))}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                          {PAYMENT_ICONS[c.forma_pagamento || ""] || null}
                          {c.forma_pagamento}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("px-2.5 py-1 text-xs font-medium rounded-full border", getStatusClasses(c.status))}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {c.nf_emitida ? (
                          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700">
                            Emitida
                          </span>
                        ) : canEmitNf(c) ? (
                          <span className="text-xs font-medium text-primary">
                            Pendente
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
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
    </div>
  );
}
