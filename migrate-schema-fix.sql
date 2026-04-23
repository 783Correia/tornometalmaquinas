-- Correções de schema — rodar no SQL Editor do Supabase NOVO

alter table categories add column if not exists woo_id integer;
alter table brands add column if not exists woo_id integer;
alter table products add column if not exists updated_at timestamptz default now();
alter table customers add column if not exists created_at timestamptz default now();
alter table customers add column if not exists updated_at timestamptz default now();
alter table orders add column if not exists updated_at timestamptz default now();

-- leads: id é uuid no banco antigo, não integer
drop table if exists leads;
create table leads (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  empresa text default '',
  contato text default '',
  email text default '',
  estado text default '',
  source text default '',
  status text default 'novo',
  valor_compra numeric,
  notas text,
  created_at timestamptz default now()
);
alter table leads enable row level security;

-- admins: tem email e created_at
alter table admins add column if not exists email text;
alter table admins add column if not exists created_at timestamptz default now();
