import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Franqueadora = {
  id: string;
  nome: string;
  razao_social: string | null;
  cnpj: string | null;
  email: string | null;
  email_secundario: string | null;
  endereco: string | null;
  celular: string | null;
  celular_secundario: string | null;
  telefone: string | null;
  telefone_secundario: string | null;
  responsavel: string | null;
  created_at: string;
  updated_at: string;
};

export type Franqueado = {
  id: string;
  nome: string;
  cnpj: string;
  email: string | null;
  telefone: string | null;
  razao_social: string | null;
  cidade: string | null;
  estado: string | null;
  bairro: string | null;
  responsavel: string | null;
  status_loja: "Aberta" | "Fechada" | "Vendida";
  data_abertura: string | null;
  franqueadora_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Cobranca = {
  id: string;
  franqueado_id: string;
  valor: number;
  vencimento: string;
  status: "Aberta" | "Vencida" | "Paga" | "Cancelada";
  descricao: string | null;
  categoria: string | null;
  forma_pagamento: string | null;
  nf_emitida: boolean;
  competencia: string | null;
  paid_at: string | null;
  valor_pago: number;
  created_at: string;
  // Joined field
  franqueados?: {
    nome: string;
  };
};
