"use client";

import { useEffect, useState } from "react";
import { supabase, type Franqueadora } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Building2,
  Pencil,
  Loader2,
  ChevronDown,
  Plus,
  Mail,
  MapPin,
  User,
} from "lucide-react";
import { cn } from "@/lib/cn";

const EMPTY_FORM = {
  nome: "",
  razao_social: "",
  cnpj: "",
  email: "",
  email_secundario: "",
  endereco: "",
  celular: "",
  celular_secundario: "",
  telefone: "",
  telefone_secundario: "",
  responsavel: "",
};

export function FranqueadoraCard() {
  const [data, setData] = useState<Franqueadora | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchData = async () => {
    try {
      const { data: row } = await supabase
        .from("franqueadora")
        .select("*")
        .limit(1)
        .single();
      setData(row);
      if (!row) setExpanded(true);
      if (row) {
        setForm({
          nome: row.nome || "",
          razao_social: row.razao_social || "",
          cnpj: row.cnpj || "",
          email: row.email || "",
          email_secundario: row.email_secundario || "",
          endereco: row.endereco || "",
          celular: row.celular || "",
          celular_secundario: row.celular_secundario || "",
          telefone: row.telefone || "",
          telefone_secundario: row.telefone_secundario || "",
          responsavel: row.responsavel || "",
        });
      }
    } catch {
      setExpanded(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDialog = () => {
    if (data) {
      setForm({
        nome: data.nome || "",
        razao_social: data.razao_social || "",
        cnpj: data.cnpj || "",
        email: data.email || "",
        email_secundario: data.email_secundario || "",
        endereco: data.endereco || "",
        celular: data.celular || "",
        celular_secundario: data.celular_secundario || "",
        telefone: data.telefone || "",
        telefone_secundario: data.telefone_secundario || "",
        responsavel: data.responsavel || "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (data) {
        const { data: updated } = await supabase
          .from("franqueadora")
          .update(form)
          .eq("id", data.id)
          .select()
          .single();
        if (updated) setData(updated);
      } else {
        const { data: created } = await supabase
          .from("franqueadora")
          .insert(form)
          .select()
          .single();
        if (created) setData(created);
      }
      setDialogOpen(false);
    } catch {
      // silent fail
    } finally {
      setFormLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isComplete = data ? !!(data.nome && data.razao_social && data.email) : false;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-3">
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" aria-hidden="true" />
          <span className="text-sm text-gray-400">Carregando dados da franqueadora...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Header — sempre visível, clicável para expandir/colapsar */}
        <button
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100">
              <Building2 className="h-4 w-4 text-gray-600" aria-hidden="true" />
            </div>
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold text-gray-900">Dados da Franqueadora</h2>
              {data ? (
                <>
                  <span
                    className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                      isComplete
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    )}
                  >
                    {isComplete ? "Completo" : "Incompleto"}
                  </span>
                  {!expanded && (
                    <span className="text-sm text-gray-400 hidden sm:inline">
                      {data.nome}
                    </span>
                  )}
                </>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-500">
                  Não cadastrado
                </span>
              )}
            </div>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-gray-400 transition-transform",
              expanded && "rotate-180"
            )}
            aria-hidden="true"
          />
        </button>

        {/* Conteúdo — colapsável */}
        {expanded && (
          <div className="px-6 pb-5 border-t border-gray-100">
            {data ? (
              <div className="pt-4 space-y-4">
                {/* Row 1: Primary info */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Nome</p>
                    <p className="text-sm font-medium text-gray-900">{data.nome}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">CNPJ</p>
                    <p className="text-sm text-gray-900 tabular-nums">{data.cnpj || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Razão Social</p>
                    <p className="text-sm text-gray-900">{data.razao_social}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Responsável</p>
                    <p className="text-sm text-gray-900 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-gray-300" aria-hidden="true" />
                      {data.responsavel || "—"}
                    </p>
                  </div>
                </div>

                {/* Row 2: Contact info */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t border-gray-50">
                  <div className="space-y-1">
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">E-mail</p>
                    <p className="text-sm text-gray-900 flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-gray-300 shrink-0" aria-hidden="true" />
                      <span className="truncate">{data.email}</span>
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Endereço</p>
                    <p className="text-sm text-gray-900 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-gray-300 shrink-0" aria-hidden="true" />
                      <span className="truncate">{data.endereco || "—"}</span>
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Button variant="outline" size="sm" onClick={handleOpenDialog}>
                    <Pencil className="mr-2 h-3.5 w-3.5" />
                    Editar cadastro
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 mb-3">
                  <Building2 className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Nenhuma franqueadora cadastrada
                </p>
                <p className="text-xs text-gray-400 mb-4 max-w-xs">
                  Cadastre os dados da franqueadora para começar a gerenciar seus franqueados.
                </p>
                <Button size="sm" onClick={handleOpenDialog}>
                  <Plus className="mr-2 h-3.5 w-3.5" />
                  Cadastrar franqueadora
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de edição */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle>
              {data ? "Editar Franqueadora" : "Cadastrar Franqueadora"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-gray-500">
              <span className="text-red-500">*</span> Campos obrigatórios
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fq-nome">
                  Nome <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fq-nome"
                  name="nome"
                  autoComplete="organization"
                  value={form.nome}
                  onChange={(e) => updateField("nome", e.target.value)}
                  placeholder="Nome da franqueadora…"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fq-cnpj">CNPJ</Label>
                <Input
                  id="fq-cnpj"
                  name="cnpj"
                  value={form.cnpj}
                  onChange={(e) => updateField("cnpj", e.target.value)}
                  placeholder="00.000.000/0000-00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fq-razao_social">
                  Razão Social <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fq-razao_social"
                  name="razao_social"
                  value={form.razao_social}
                  onChange={(e) => updateField("razao_social", e.target.value)}
                  placeholder="Razão social…"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fq-email">
                  E-mail <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fq-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  spellCheck={false}
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="email@exemplo.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fq-email_secundario">E-mail secundário</Label>
                <Input
                  id="fq-email_secundario"
                  name="email_secundario"
                  type="email"
                  spellCheck={false}
                  value={form.email_secundario}
                  onChange={(e) => updateField("email_secundario", e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="fq-endereco">Endereço</Label>
                <Input
                  id="fq-endereco"
                  name="endereco"
                  autoComplete="street-address"
                  value={form.endereco}
                  onChange={(e) => updateField("endereco", e.target.value)}
                  placeholder="Endereço completo…"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fq-responsavel">Responsável</Label>
                <Input
                  id="fq-responsavel"
                  name="responsavel"
                  autoComplete="name"
                  value={form.responsavel}
                  onChange={(e) => updateField("responsavel", e.target.value)}
                  placeholder="Nome do responsável…"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fq-celular">Celular</Label>
                <Input
                  id="fq-celular"
                  name="celular"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={form.celular}
                  onChange={(e) => updateField("celular", e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fq-celular_secundario">Celular secundário</Label>
                <Input
                  id="fq-celular_secundario"
                  name="celular_secundario"
                  type="tel"
                  inputMode="tel"
                  value={form.celular_secundario}
                  onChange={(e) => updateField("celular_secundario", e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fq-telefone">Telefone</Label>
                <Input
                  id="fq-telefone"
                  name="telefone"
                  type="tel"
                  inputMode="tel"
                  value={form.telefone}
                  onChange={(e) => updateField("telefone", e.target.value)}
                  placeholder="(00) 0000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fq-telefone_secundario">Telefone secundário</Label>
                <Input
                  id="fq-telefone_secundario"
                  name="telefone_secundario"
                  type="tel"
                  inputMode="tel"
                  value={form.telefone_secundario}
                  onChange={(e) => updateField("telefone_secundario", e.target.value)}
                  placeholder="(00) 0000-0000"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
