import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Franqueado = {
  id: string;
  nome: string;
  cnpj: string;
  created_at: string;
  updated_at: string;
};

export type Cobranca = {
  id: string;
  franqueado_id: string;
  valor: number;
  vencimento: string;
  status: "pendente" | "pago" | "atrasado" | "cancelado";
  created_at: string;
  franqueados?: {
    nome: string;
  };
};
