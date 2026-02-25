-- =============================================
-- MENLO OAKBERRY — Full Schema (drop & recreate)
-- =============================================

-- Drop existing tables (reverse dependency order)
DROP TABLE IF EXISTS cobrancas CASCADE;
DROP TABLE IF EXISTS franqueados CASCADE;
DROP TABLE IF EXISTS franqueadora CASCADE;

-- =============================================
-- 1. Franqueadora (company card)
-- =============================================
CREATE TABLE franqueadora (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  razao_social TEXT,
  cnpj TEXT,
  email TEXT,
  email_secundario TEXT,
  endereco TEXT,
  celular TEXT,
  celular_secundario TEXT,
  telefone TEXT,
  telefone_secundario TEXT,
  responsavel TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 2. Franqueados (franchise units)
-- =============================================
CREATE TABLE franqueados (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cnpj TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  razao_social TEXT,
  cidade TEXT,
  estado TEXT,
  bairro TEXT,
  responsavel TEXT,
  status_loja TEXT DEFAULT 'Aberta' CHECK (status_loja IN ('Aberta', 'Fechada', 'Vendida')),
  data_abertura DATE,
  franqueadora_id UUID REFERENCES franqueadora(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 3. Cobranças (charges)
-- =============================================
CREATE TABLE cobrancas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  franqueado_id UUID REFERENCES franqueados(id) ON DELETE CASCADE,
  valor NUMERIC(10, 2) NOT NULL,
  vencimento DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Aberta' CHECK (status IN ('Aberta', 'Vencida', 'Paga', 'Cancelada')),
  descricao TEXT,
  categoria TEXT CHECK (categoria IN ('Royalties', 'FNP', 'Taxa de Franquia', 'Produto', 'Serviço')),
  forma_pagamento TEXT CHECK (forma_pagamento IN ('Boleto', 'Pix', 'Cartão')),
  nf_emitida BOOLEAN DEFAULT false,
  competencia TEXT,
  paid_at TIMESTAMPTZ,
  valor_pago NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- RLS (public access, no auth)
-- =============================================
ALTER TABLE franqueadora ENABLE ROW LEVEL SECURITY;
ALTER TABLE franqueados ENABLE ROW LEVEL SECURITY;
ALTER TABLE cobrancas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso público franqueadora" ON franqueadora FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público franqueados" ON franqueados FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público cobranças" ON cobrancas FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- Seed Data
-- =============================================

-- Franqueadora
INSERT INTO franqueadora (nome, razao_social, cnpj, email, endereco, celular, responsavel) VALUES
  ('Oakberry Brasil', 'Oakberry Açaí Franchising Ltda', '11.222.333/0001-44', 'contato@oakberry.com.br', 'Av. Paulista, 1000 - São Paulo/SP', '(11) 99999-0000', 'João Silva');

-- Franqueados
INSERT INTO franqueados (nome, cnpj, email, telefone, razao_social, cidade, estado, bairro, responsavel, status_loja, data_abertura, franqueadora_id) VALUES
  ('Oakberry Jardins',        '12.345.678/0001-01', 'jardins@oakberry.com',      '(11) 91111-1111', 'Oakberry Jardins Ltda',        'São Paulo',       'SP', 'Jardins',        'Maria Santos',     'Aberta',  '2023-03-15', (SELECT id FROM franqueadora LIMIT 1)),
  ('Oakberry Vila Madalena',  '23.456.789/0001-02', 'vilamadalena@oakberry.com',  '(11) 92222-2222', 'Oakberry Vila Madalena Ltda',  'São Paulo',       'SP', 'Vila Madalena',  'Pedro Oliveira',   'Aberta',  '2023-06-01', (SELECT id FROM franqueadora LIMIT 1)),
  ('Oakberry Pinheiros',      '34.567.890/0001-03', 'pinheiros@oakberry.com',     '(11) 93333-3333', 'Oakberry Pinheiros Ltda',      'São Paulo',       'SP', 'Pinheiros',      'Ana Costa',        'Aberta',  '2023-09-20', (SELECT id FROM franqueadora LIMIT 1)),
  ('Oakberry Moema',          '45.678.901/0001-04', 'moema@oakberry.com',         '(11) 94444-4444', 'Oakberry Moema Ltda',          'São Paulo',       'SP', 'Moema',          'Carlos Ferreira',  'Fechada',  '2022-11-10', (SELECT id FROM franqueadora LIMIT 1)),
  ('Oakberry Itaim',          '56.789.012/0001-05', 'itaim@oakberry.com',         '(11) 95555-5555', 'Oakberry Itaim Ltda',          'São Paulo',       'SP', 'Itaim Bibi',     'Luciana Almeida',  'Aberta',  '2024-01-08', (SELECT id FROM franqueadora LIMIT 1)),
  ('Oakberry Leblon',         '67.890.123/0001-06', 'leblon@oakberry.com',        '(21) 96666-6666', 'Oakberry Leblon Ltda',         'Rio de Janeiro',  'RJ', 'Leblon',         'Roberto Nascimento','Aberta',  '2024-04-22', (SELECT id FROM franqueadora LIMIT 1)),
  ('Oakberry Barra',          '78.901.234/0001-07', 'barra@oakberry.com',         '(21) 97777-7777', 'Oakberry Barra Ltda',          'Rio de Janeiro',  'RJ', 'Barra da Tijuca','Fernanda Lima',    'Vendida',  '2023-01-05', (SELECT id FROM franqueadora LIMIT 1)),
  ('Oakberry Savassi',        '89.012.345/0001-08', 'savassi@oakberry.com',       '(31) 98888-8888', 'Oakberry Savassi Ltda',        'Belo Horizonte',  'MG', 'Savassi',        'Marcos Pereira',   'Aberta',  '2024-07-15', (SELECT id FROM franqueadora LIMIT 1)),
  ('Oakberry Boa Viagem',     '90.123.456/0001-09', 'boaviagem@oakberry.com',     '(81) 99999-9999', 'Oakberry Boa Viagem Ltda',     'Recife',          'PE', 'Boa Viagem',     'Juliana Rocha',    'Aberta',  '2024-10-01', (SELECT id FROM franqueadora LIMIT 1)),
  ('Oakberry Moinhos',        '01.234.567/0001-10', 'moinhos@oakberry.com',       '(51) 90000-0000', 'Oakberry Moinhos Ltda',        'Porto Alegre',    'RS', 'Moinhos de Vento','Thiago Martins',  'Aberta',  '2025-01-20', (SELECT id FROM franqueadora LIMIT 1));

-- Cobranças (mix of statuses, categories, payment methods, competências)
INSERT INTO cobrancas (franqueado_id, valor, vencimento, status, descricao, categoria, forma_pagamento, nf_emitida, competencia, paid_at, valor_pago) VALUES
  -- Jan/2026
  ((SELECT id FROM franqueados WHERE nome = 'Oakberry Jardins'),       5000.00, '2026-01-15', 'Paga',      'Royalties Janeiro',      'Royalties',        'Boleto',  true,  'Jan/2026', '2026-01-14T10:00:00Z', 5000.00),
  ((SELECT id FROM franqueados WHERE nome = 'Oakberry Vila Madalena'), 4500.00, '2026-01-15', 'Paga',      'Royalties Janeiro',      'Royalties',        'Pix',     true,  'Jan/2026', '2026-01-15T09:00:00Z', 4500.00),
  ((SELECT id FROM franqueados WHERE nome = 'Oakberry Pinheiros'),     5200.00, '2026-01-15', 'Paga',      'Royalties Janeiro',      'Royalties',        'Boleto',  true,  'Jan/2026', '2026-01-13T14:00:00Z', 5200.00),
  ((SELECT id FROM franqueados WHERE nome = 'Oakberry Moema'),         4800.00, '2026-01-15', 'Cancelada', 'Royalties Janeiro',      'Royalties',        'Boleto',  false, 'Jan/2026', NULL, 0),
  ((SELECT id FROM franqueados WHERE nome = 'Oakberry Itaim'),         5500.00, '2026-01-15', 'Paga',      'Royalties Janeiro',      'Royalties',        'Cartão',  true,  'Jan/2026', '2026-01-15T16:00:00Z', 5500.00),
  ((SELECT id FROM franqueados WHERE nome = 'Oakberry Leblon'),        6000.00, '2026-01-15', 'Paga',      'Royalties Janeiro',      'Royalties',        'Pix',     true,  'Jan/2026', '2026-01-14T11:00:00Z', 6000.00),
  ((SELECT id FROM franqueados WHERE nome = 'Oakberry Savassi'),       4200.00, '2026-01-15', 'Paga',      'Royalties Janeiro',      'Royalties',        'Boleto',  false, 'Jan/2026', '2026-01-16T08:00:00Z', 4200.00),
  ((SELECT id FROM franqueados WHERE nome = 'Oakberry Jardins'),       1200.00, '2026-01-20', 'Paga',      'FNP Janeiro',            'FNP',              'Boleto',  true,  'Jan/2026', '2026-01-19T10:00:00Z', 1200.00),
  ((SELECT id FROM franqueados WHERE nome = 'Oakberry Vila Madalena'), 1100.00, '2026-01-20', 'Paga',      'FNP Janeiro',            'FNP',              'Pix',     false, 'Jan/2026', '2026-01-20T09:00:00Z', 1100.00),

  -- Fev/2026
  ((SELECT id FROM franqueados WHERE nome = 'Oakberry Jardins'),       5000.00, '2026-02-15', 'Paga',      'Royalties Fevereiro',    'Royalties',        'Boleto',  true,  'Fev/2026', '2026-02-14T10:00:00Z', 5000.00),
  ((SELECT id FROM franqueados WHERE nome = 'Oakberry Vila Madalena'), 4500.00, '2026-02-15', 'Vencida',   'Royalties Fevereiro',    'Royalties',        'Boleto',  false, 'Fev/2026', NULL, 0),
  ((SELECT id FROM franqueados WHERE nome = 'Oakberry Pinheiros'),     5200.00, '2026-02-15', 'Paga',      'Royalties Fevereiro',    'Royalties',        'Pix',     true,  'Fev/2026', '2026-02-15T09:00:00Z', 5200.00),
  ((SELECT id FROM franqueados WHERE nome = 'Oakberry Moema'),         4800.00, '2026-02-15', 'Vencida',   'Royalties Fevereiro',    'Royalties',        'Boleto',  false, 'Fev/2026', NULL, 0),
  ((SELECT id FROM franqueados WHERE nome = 'Oakberry Itaim'),         5500.00, '2026-02-15', 'Paga',      'Royalties Fevereiro',    'Royalties',        'Cartão',  true,  'Fev/2026', '2026-02-15T16:00:00Z', 5500.00),
  ((SELECT id FROM franqueados WHERE nome = 'Oakberry Leblon'),        6000.00, '2026-02-15', 'Paga',      'Royalties Fevereiro',    'Royalties',        'Pix',     true,  'Fev/2026', '2026-02-14T11:00:00Z', 6000.00),
  ((SELECT id FROM franqueados WHERE nome = 'Oakberry Barra'),         5800.00, '2026-02-15', 'Cancelada', 'Royalties Fevereiro',    'Royalties',        'Boleto',  false, 'Fev/2026', NULL, 0),
  ((SELECT id FROM franqueados WHERE nome = 'Oakberry Savassi'),       4200.00, '2026-02-15', 'Aberta',    'Royalties Fevereiro',    'Royalties',        'Boleto',  false, 'Fev/2026', NULL, 0),
  ((SELECT id FROM franqueados WHERE nome = 'Oakberry Boa Viagem'),    3800.00, '2026-02-15', 'Aberta',    'Royalties Fevereiro',    'Royalties',        'Pix',     false, 'Fev/2026', NULL, 0),
  ((SELECT id FROM franqueados WHERE nome = 'Oakberry Moinhos'),       4000.00, '2026-02-15', 'Aberta',    'Royalties Fevereiro',    'Royalties',        'Boleto',  false, 'Fev/2026', NULL, 0),
  ((SELECT id FROM franqueados WHERE nome = 'Oakberry Jardins'),       1200.00, '2026-02-20', 'Aberta',    'FNP Fevereiro',          'FNP',              'Boleto',  false, 'Fev/2026', NULL, 0),
  ((SELECT id FROM franqueados WHERE nome = 'Oakberry Vila Madalena'), 1100.00, '2026-02-20', 'Vencida',   'FNP Fevereiro',          'FNP',              'Pix',     false, 'Fev/2026', NULL, 0),
  ((SELECT id FROM franqueados WHERE nome = 'Oakberry Pinheiros'),     1300.00, '2026-02-20', 'Paga',      'FNP Fevereiro',          'FNP',              'Boleto',  true,  'Fev/2026', '2026-02-19T10:00:00Z', 1300.00),

  -- Mar/2026
  ((SELECT id FROM franqueados WHERE nome = 'Oakberry Jardins'),       5000.00, '2026-03-15', 'Aberta',    'Royalties Março',        'Royalties',        'Boleto',  false, 'Mar/2026', NULL, 0),
  ((SELECT id FROM franqueados WHERE nome = 'Oakberry Vila Madalena'), 4500.00, '2026-03-15', 'Aberta',    'Royalties Março',        'Royalties',        'Pix',     false, 'Mar/2026', NULL, 0),
  ((SELECT id FROM franqueados WHERE nome = 'Oakberry Pinheiros'),     5200.00, '2026-03-15', 'Aberta',    'Royalties Março',        'Royalties',        'Boleto',  false, 'Mar/2026', NULL, 0),
  ((SELECT id FROM franqueados WHERE nome = 'Oakberry Itaim'),         5500.00, '2026-03-15', 'Aberta',    'Royalties Março',        'Royalties',        'Cartão',  false, 'Mar/2026', NULL, 0),
  ((SELECT id FROM franqueados WHERE nome = 'Oakberry Leblon'),        6000.00, '2026-03-15', 'Aberta',    'Royalties Março',        'Royalties',        'Pix',     false, 'Mar/2026', NULL, 0),

  -- Taxa de Franquia
  ((SELECT id FROM franqueados WHERE nome = 'Oakberry Moinhos'),      45000.00, '2025-12-15', 'Paga',      'Taxa de Franquia',       'Taxa de Franquia', 'Boleto',  true,  'Dez/2025', '2025-12-10T10:00:00Z', 45000.00),
  ((SELECT id FROM franqueados WHERE nome = 'Oakberry Boa Viagem'),   42000.00, '2024-09-15', 'Paga',      'Taxa de Franquia',       'Taxa de Franquia', 'Pix',     true,  'Set/2024', '2024-09-14T10:00:00Z', 42000.00);
