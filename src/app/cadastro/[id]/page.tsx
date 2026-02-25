"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

export default function EditarFranqueadoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [nome, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  function formatCNPJ(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 14);
    return digits
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  useEffect(() => {
    async function fetchFranqueado() {
      const { data, error } = await supabase
        .from("franqueados")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        router.push("/cadastro");
        return;
      }

      setNome(data.nome);
      setCnpj(formatCNPJ(data.cnpj));
      setLoading(false);
    }
    fetchFranqueado();
  }, [id, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from("franqueados")
      .update({
        nome,
        cnpj: cnpj.replace(/\D/g, ""),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      alert("Erro ao atualizar franqueado: " + error.message);
      setSaving(false);
      return;
    }

    router.push("/cadastro");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Carregando...
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/cadastro"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        <h1 className="text-2xl font-bold">Editar Franqueado</h1>
        <p className="text-sm text-muted-foreground">
          Atualizar dados do franqueado
        </p>
      </div>

      <div className="max-w-lg rounded-xl border bg-card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              placeholder="Nome do franqueado"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input
              id="cnpj"
              placeholder="00.000.000/0000-00"
              value={cnpj}
              onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={saving}
              className="bg-menlo-orange hover:bg-menlo-orange-hover text-white rounded-full px-6"
            >
              {saving ? "Salvando..." : "Salvar"}
            </Button>
            <Link href="/cadastro">
              <Button type="button" variant="outline" className="rounded-full px-6">
                Cancelar
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
