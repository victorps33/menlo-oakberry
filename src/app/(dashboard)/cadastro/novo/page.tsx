"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArrowLeft } from "lucide-react";

export default function NovoFranqueadoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nome: "",
    cnpj: "",
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

    const { error: insertError } = await supabase.from("franqueados").insert({
      nome: form.nome.trim(),
      cnpj: form.cnpj.trim(),
    });

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Nome *</label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => updateField("nome", e.target.value)}
                placeholder="Nome do franqueado"
                required
                className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all focus-visible:border-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/30"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">CNPJ *</label>
              <input
                type="text"
                value={form.cnpj}
                onChange={(e) => updateField("cnpj", e.target.value)}
                placeholder="00.000.000/0000-00"
                required
                className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all focus-visible:border-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/30"
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
              className="px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Cadastrando..." : "Cadastrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
