"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArrowLeft } from "lucide-react";

const ESTADOS_BR = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

export default function NovoFranqueadoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nome: "",
    cnpj: "",
    email: "",
    telefone: "",
    razao_social: "",
    responsavel: "",
    cidade: "",
    estado: "",
    bairro: "",
    status_loja: "Aberta",
    data_abertura: "",
  });

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.nome.trim() || !form.cnpj.trim()) {
      setError("Nome e CNPJ são obrigatórios.");
      return;
    }

    setLoading(true);

    const payload: Record<string, string | null> = {
      nome: form.nome.trim(),
      cnpj: form.cnpj.trim(),
      email: form.email.trim() || null,
      telefone: form.telefone.trim() || null,
      razao_social: form.razao_social.trim() || null,
      responsavel: form.responsavel.trim() || null,
      cidade: form.cidade.trim() || null,
      estado: form.estado || null,
      bairro: form.bairro.trim() || null,
      status_loja: form.status_loja,
      data_abertura: form.data_abertura || null,
    };

    const { error: insertError } = await supabase.from("franqueados").insert(payload);

    if (insertError) {
      setError(insertError.message || "Erro ao cadastrar franqueado.");
      setLoading(false);
      return;
    }

    router.push("/cadastro");
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/cadastro"
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Franqueados
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 font-medium">Novo Franqueado</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h1 className="text-lg font-semibold text-gray-900">Novo Franqueado</h1>
          <p className="text-sm text-gray-500 mt-0.5">Preencha os dados do franqueado</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Dados obrigatórios */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Nome *"
              value={form.nome}
              onChange={(v) => updateField("nome", v)}
              placeholder="Nome do franqueado"
              required
            />
            <Field
              label="CPF/CNPJ *"
              value={form.cnpj}
              onChange={(v) => updateField("cnpj", v)}
              placeholder="000.000.000-00"
              required
            />
            <Field
              label="E-mail"
              type="email"
              value={form.email}
              onChange={(v) => updateField("email", v)}
              placeholder="email@exemplo.com"
            />
            <Field
              label="Telefone"
              value={form.telefone}
              onChange={(v) => updateField("telefone", v)}
              placeholder="(00) 00000-0000"
            />
          </div>

          {/* Dados complementares */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Dados complementares</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Razão Social"
                value={form.razao_social}
                onChange={(v) => updateField("razao_social", v)}
                placeholder="Razão social da empresa"
              />
              <Field
                label="Responsável"
                value={form.responsavel}
                onChange={(v) => updateField("responsavel", v)}
                placeholder="Nome do responsável"
              />
              <Field
                label="Cidade"
                value={form.cidade}
                onChange={(v) => updateField("cidade", v)}
                placeholder="Cidade"
              />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Estado</label>
                <select
                  value={form.estado}
                  onChange={(e) => updateField("estado", e.target.value)}
                  className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition-all focus-visible:border-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/30"
                >
                  <option value="">Selecione...</option>
                  {ESTADOS_BR.map((uf) => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>
              <Field
                label="Bairro"
                value={form.bairro}
                onChange={(v) => updateField("bairro", v)}
                placeholder="Bairro"
              />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Status da Loja</label>
                <select
                  value={form.status_loja}
                  onChange={(e) => updateField("status_loja", e.target.value)}
                  className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition-all focus-visible:border-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/30"
                >
                  <option value="Aberta">Aberta</option>
                  <option value="Fechada">Fechada</option>
                  <option value="Vendida">Vendida</option>
                </select>
              </div>
              <Field
                label="Data de Abertura"
                type="date"
                value={form.data_abertura}
                onChange={(v) => updateField("data_abertura", v)}
                placeholder=""
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push("/cadastro")}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Cadastrando..." : "Cadastrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all focus-visible:border-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/30"
      />
    </div>
  );
}
