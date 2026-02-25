"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, type Franqueado } from "@/lib/supabase";
import { ArrowLeft } from "lucide-react";

export default function EditFranqueadoPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  const [form, setForm] = useState({
    nome: "",
    cnpj: "",
  });

  useEffect(() => {
    async function load() {
      const { data, error: fetchError } = await supabase
        .from("franqueados")
        .select("*")
        .eq("id", params.id)
        .single();

      if (fetchError || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setForm({
        nome: data.nome,
        cnpj: data.cnpj,
      });
      setLoading(false);
    }
    load();
  }, [params.id]);

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

    setSaving(true);

    const { error: updateError } = await supabase
      .from("franqueados")
      .update({
        nome: form.nome.trim(),
        cnpj: form.cnpj.trim(),
      })
      .eq("id", params.id);

    if (updateError) {
      setError(updateError.message || "Erro ao atualizar franqueado.");
      setSaving(false);
      return;
    }

    router.push("/cadastro");
  }

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
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-100 rounded w-1/4" />
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="h-10 bg-gray-100 rounded-xl" />
              <div className="h-10 bg-gray-100 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound) {
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
          <p className="text-sm text-gray-500">O franqueado não foi encontrado.</p>
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
        <span className="text-gray-900 font-medium">Editar Franqueado</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h1 className="text-lg font-semibold text-gray-900">Editar Franqueado</h1>
          <p className="text-sm text-gray-500 mt-0.5">Atualize os dados do franqueado</p>
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
              disabled={saving}
              className="px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
