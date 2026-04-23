-- Schema TornoMetal — rodar no SQL Editor do Supabase NOVO (xebskockruobeovmqlhq)

-- CATEGORIAS
create table if not exists categories (
  id serial primary key,
  name text not null,
  slug text not null unique
);

-- MARCAS
create table if not exists brands (
  id serial primary key,
  name text not null,
  slug text not null unique
);

-- PRODUTOS
create table if not exists products (
  id serial primary key,
  name text not null,
  slug text not null unique,
  description text default '',
  short_description text default '',
  sku text default '',
  price numeric not null default 0,
  regular_price numeric not null default 0,
  sale_price numeric,
  weight numeric default 0,
  length numeric default 0,
  width numeric default 0,
  height numeric default 0,
  stock_quantity integer default 0,
  manage_stock boolean default true,
  status text default 'publish',
  featured boolean default false,
  category_id integer references categories(id) on delete set null,
  brand_id integer references brands(id) on delete set null,
  woo_id integer,
  created_at timestamptz default now()
);

-- IMAGENS DE PRODUTO
create table if not exists product_images (
  id serial primary key,
  product_id integer not null references products(id) on delete cascade,
  src text not null,
  alt text default '',
  position integer default 0
);

-- CLIENTES (ligado ao auth do Supabase)
create table if not exists customers (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  cpf text,
  cnpj text,
  inscricao_estadual text,
  address_street text,
  address_number text,
  address_complement text,
  address_neighborhood text,
  address_city text,
  address_state text,
  address_zip text
);

-- PEDIDOS
create table if not exists orders (
  id serial primary key,
  customer_id uuid references customers(id) on delete set null,
  status text not null default 'pending',
  total numeric not null default 0,
  shipping_cost numeric not null default 0,
  payment_method text,
  payment_status text not null default 'pending',
  tracking_code text,
  notes text,
  created_at timestamptz default now()
);

-- ITENS DO PEDIDO
create table if not exists order_items (
  id serial primary key,
  order_id integer not null references orders(id) on delete cascade,
  product_id integer references products(id) on delete set null,
  product_name text not null,
  quantity integer not null default 1,
  price numeric not null default 0
);

-- AVALIAÇÕES
create table if not exists reviews (
  id serial primary key,
  product_id integer references products(id) on delete cascade,
  customer_id uuid,
  customer_name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text default '',
  created_at timestamptz default now()
);

-- ADMINS
create table if not exists admins (
  id uuid primary key references auth.users(id) on delete cascade
);

-- LEADS
create table if not exists leads (
  id serial primary key,
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

-- SETTINGS (chave-valor para tokens Bling etc)
create table if not exists settings (
  key text primary key,
  value text not null
);

-- RLS: desabilitar nas tabelas de admin (acesso só por service_role)
alter table categories enable row level security;
alter table brands enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table customers enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table reviews enable row level security;
alter table admins enable row level security;
alter table leads enable row level security;
alter table settings enable row level security;

-- Leitura pública para produtos, categorias, marcas, imagens
create policy "Produtos públicos" on products for select using (true);
create policy "Categorias públicas" on categories for select using (true);
create policy "Marcas públicas" on brands for select using (true);
create policy "Imagens públicas" on product_images for select using (true);
create policy "Reviews públicas" on reviews for select using (true);

-- Clientes: só o próprio usuário lê/edita
create policy "Cliente lê próprios dados" on customers for select using (auth.uid() = id);
create policy "Cliente edita próprios dados" on customers for update using (auth.uid() = id);
create policy "Cliente insere próprios dados" on customers for insert with check (auth.uid() = id);

-- Pedidos: cliente vê os próprios
create policy "Cliente lê próprios pedidos" on orders for select using (auth.uid() = customer_id);
create policy "Cliente cria pedido" on orders for insert with check (auth.uid() = customer_id);
create policy "Order items: cliente lê" on order_items for select using (
  exists (select 1 from orders where orders.id = order_items.order_id and orders.customer_id = auth.uid())
);

-- Função helper para verificar admin
create or replace function is_admin()
returns boolean language sql security definer as $$
  select exists (select 1 from admins where id = auth.uid())
$$;
