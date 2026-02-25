-- Tabela de franqueados
CREATE TABLE franqueados (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cnpj TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de cobranças
CREATE TABLE cobrancas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  franqueado_id UUID REFERENCES franqueados(id) ON DELETE CASCADE,
  valor NUMERIC(10, 2) NOT NULL,
  vencimento DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'atrasado', 'cancelado')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE franqueados ENABLE ROW LEVEL SECURITY;
ALTER TABLE cobrancas ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público (sem auth)
CREATE POLICY "Acesso público franqueados" ON franqueados FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público cobranças" ON cobrancas FOR ALL USING (true) WITH CHECK (true);

-- Dados de exemplo
INSERT INTO franqueados (nome, cnpj) VALUES
  ('Oakberry Jardins', '12345678000101'),
  ('Oakberry Vila Madalena', '23456789000102'),
  ('Oakberry Pinheiros', '34567890000103'),
  ('Oakberry Moema', '45678901000104'),
  ('Oakberry Itaim', '56789012000105');

INSERT INTO cobrancas (franqueado_id, valor, vencimento, status) VALUES
  ((SELECT id FROM franqueados WHERE nome = 'Oakberry Jardins'), 5000.00, '2026-03-15', 'pendente'),
  ((SELECT id FROM franqueados WHERE nome = 'Oakberry Vila Madalena'), 4500.00, '2026-03-15', 'pendente'),
  ((SELECT id FROM franqueados WHERE nome = 'Oakberry Pinheiros'), 5200.00, '2026-02-15', 'pago'),
  ((SELECT id FROM franqueados WHERE nome = 'Oakberry Moema'), 4800.00, '2026-02-15', 'atrasado'),
  ((SELECT id FROM franqueados WHERE nome = 'Oakberry Itaim'), 5500.00, '2026-01-15', 'pago'),
  ((SELECT id FROM franqueados WHERE nome = 'Oakberry Jardins'), 5000.00, '2026-02-15', 'pago'),
  ((SELECT id FROM franqueados WHERE nome = 'Oakberry Vila Madalena'), 4500.00, '2026-01-15', 'cancelado');
