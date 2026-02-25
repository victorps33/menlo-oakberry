"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, type Franqueado, type Cobranca } from "@/lib/supabase";
import { KpiSkeleton, TableSkeleton } from "@/components/ui/skeleton";
import { MetricCard } from "@/components/ui/metric-card";
import { cn } from "@/lib/cn";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Building2,
  Calendar,
  User,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Clock,
} from "lucide-react";

const fmtBRL = (val: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

const fmtDate = (dateStr: string) =>
  new Intl.DateTimeFormat("pt-BR").format(new Date(dateStr));

const statusLojaConfig: Record<string, { bg: string; text: string; dot: string }> = {
  Aberta:  { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  Fechada: { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-500" },
  Vendida: { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-500" },
};

const cobrancaStatusColors: Record<string, { bg: string; text: string }> = {
  Aberta:    { bg: "bg-blue-50",    text: "text-blue-700" },
  Vencida:   { bg: "bg-red-50",     text: "text-red-700" },
  Paga:      { bg: "bg-emerald-50", text: "text-emerald-700" },
  Cancelada: { bg: "bg-gray-100",   text: "text-gray-500" },
};

export default function ClienteDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const [franqueado, setFranqueado] = useState<Franqueado | null>(null);
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [franqueadoRes, cobrancasRes] = await Promise.all([
        supabase
          .from("franqueados")
          .select("*")
          .eq("id", params.id)
          .single(),
        supabase
          .from("cobrancas")
          .select("*")
          .eq("franqueado_id", params.id)
          .order("vencimento", { ascending: false }),
      ]);

      if (franqueadoRes.data) setFranqueado(franqueadoRes.data);
      if (cobrancasRes.data) setCobrancas(cobrancasRes.data);
      setLoading(false);
    }
    load();
  }, [params.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/cadastro" className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Franqueados
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-400">Carregando...</span>
        </div>
        <KpiSkeleton count={4} />
        <TableSkeleton rows={5} cols={6} />
      </div>
    );
  }

  if (!franqueado) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/cadastro" className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Franqueados
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-medium">Não encontrado</span>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-12 text-center">
          <AlertTriangle className="h-8 w-8 text-amber-400 mx-auto mb-3" />
          <p className="text-sm text-gray-500">
            O franqueado com este ID não foi encontrado na base.
          </p>
          <Link
            href="/cadastro"
            className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Voltar para cadastro
          </Link>
        </div>
      </div>
    );
  }

  const sc = statusLojaConfig[franqueado.status_loja] ?? statusLojaConfig.Aberta;

  const valorEmitido = cobrancas.reduce((s, c) => s + Number(c.valor), 0);
  const valorRecebido = cobrancas
    .filter((c) => c.status === "Paga")
    .reduce((s, c) => s + Number(c.valor_pago || c.valor), 0);
  const valorAberto = cobrancas
    .filter((c) => c.status === "Aberta" || c.status === "Vencida")
    .reduce((s, c) => s + (Number(c.valor) - Number(c.valor_pago || 0)), 0);
  const vencidas = cobrancas.filter((c) => c.status === "Vencida");
  const valorVencido = vencidas.reduce((s, c) => s + (Number(c.valor) - Number(c.valor_pago || 0)), 0);
  const pagas = cobrancas.filter((c) => c.status === "Paga").length;
  const inadimplencia = valorEmitido > 0 ? (valorVencido / valorEmitido) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/cadastro" className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Franqueados
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 font-medium">{franqueado.nome}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900 truncate">
            {franqueado.nome}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {franqueado.razao_social} · {franqueado.cnpj}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/cadastro/${franqueado.id}/editar`}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
          >
            Editar
          </Link>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
              sc.bg,
              sc.text
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", sc.dot)} />
            {franqueado.status_loja}
          </span>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={<DollarSign className="h-4 w-4" />}
          title="Emitido"
          value={fmtBRL(valorEmitido)}
          subtitle={`${cobrancas.length} cobranças`}
          className="animate-in stagger-1"
        />
        <MetricCard
          icon={<TrendingUp className="h-4 w-4" />}
          title="Recebido"
          value={fmtBRL(valorRecebido)}
          subtitle={`${pagas} pagas`}
          className="animate-in stagger-2"
        />
        <MetricCard
          icon={<AlertTriangle className="h-4 w-4" />}
          title="Em Aberto"
          value={fmtBRL(valorAberto)}
          subtitle={`${vencidas.length} vencidas (${fmtBRL(valorVencido)})`}
          variant={valorAberto > 0 ? "danger" : "default"}
          className="animate-in stagger-3"
        />
        <MetricCard
          icon={<Clock className="h-4 w-4" />}
          title="Inadimplência"
          value={`${inadimplencia.toFixed(1)}%`}
          subtitle={`${vencidas.length} cobranças vencidas`}
          className="animate-in stagger-4"
        />
      </div>

      {/* Informações */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Informações</h3>
        <div className="grid gap-3 sm:grid-cols-2 text-sm">
          <div className="flex items-center gap-3 text-gray-600">
            <User className="h-4 w-4 text-gray-400 shrink-0" />
            <span>{franqueado.responsavel || "—"}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <Phone className="h-4 w-4 text-gray-400 shrink-0" />
            <span>{franqueado.telefone || "—"}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <Mail className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="truncate">{franqueado.email || "—"}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
            <span>
              {franqueado.bairro && franqueado.cidade
                ? `${franqueado.bairro}, ${franqueado.cidade}/${franqueado.estado}`
                : "—"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <Building2 className="h-4 w-4 text-gray-400 shrink-0" />
            <span>Loja {franqueado.status_loja}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
            <span>
              {franqueado.data_abertura
                ? `Aberta em ${fmtDate(franqueado.data_abertura)}`
                : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Charges table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">
            Cobranças ({cobrancas.length})
          </h3>
        </div>

        {cobrancas.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-gray-400">Nenhuma cobrança registrada.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-5 py-3 font-medium text-xs text-gray-400 uppercase tracking-wide">Descrição</th>
                  <th className="px-4 py-3 font-medium text-xs text-gray-400 uppercase tracking-wide">Categoria</th>
                  <th className="px-4 py-3 font-medium text-xs text-gray-400 uppercase tracking-wide">Vencimento</th>
                  <th className="px-4 py-3 font-medium text-xs text-gray-400 uppercase tracking-wide text-right">Valor</th>
                  <th className="px-4 py-3 font-medium text-xs text-gray-400 uppercase tracking-wide text-right">Aberto</th>
                  <th className="px-4 py-3 font-medium text-xs text-gray-400 uppercase tracking-wide">Pagamento</th>
                  <th className="px-4 py-3 font-medium text-xs text-gray-400 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody>
                {cobrancas.map((c) => {
                  const sc2 = cobrancaStatusColors[c.status] ?? cobrancaStatusColors.Aberta;
                  const valorAbertoC = Number(c.valor) - Number(c.valor_pago || 0);
                  return (
                    <tr
                      key={c.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-900 truncate max-w-[200px]">{c.descricao}</p>
                        <p className="text-xs text-gray-400">{c.competencia}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{c.categoria}</td>
                      <td className="px-4 py-3 text-gray-600 tabular-nums">{fmtDate(c.vencimento)}</td>
                      <td className="px-4 py-3 text-right text-gray-900 tabular-nums font-medium">{fmtBRL(Number(c.valor))}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        <span className={valorAbertoC > 0 && c.status !== "Paga" ? "text-red-600 font-medium" : "text-gray-400"}>
                          {valorAbertoC > 0 && c.status !== "Paga" ? fmtBRL(valorAbertoC) : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{c.forma_pagamento}</td>
                      <td className="px-4 py-3">
                        <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", sc2.bg, sc2.text)}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
