-- ============================================================
-- VYRAL — Migração: novo modelo (estampas + estoque de camisetas)
-- Rode no SQL Editor do Supabase (Dashboard > SQL Editor > New Query)
-- ============================================================

-- 1) Nova tabela: categories
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  slug        text not null unique,
  created_at  timestamptz not null default now()
);

-- 2) Nova tabela: tshirt_stock
create table if not exists public.tshirt_stock (
  id      uuid primary key default gen_random_uuid(),
  color   text not null check (color in ('preta','branca')),
  size    text not null check (size in ('P','M','G','GG','XG')),
  stock   integer not null default 0 check (stock >= 0),
  unique (color, size)
);

-- Pré-popular com estoque zerado
insert into public.tshirt_stock (color, size, stock) values
  ('preta', 'P', 0), ('preta', 'M', 0), ('preta', 'G', 0), ('preta', 'GG', 0), ('preta', 'XG', 0),
  ('branca', 'P', 0), ('branca', 'M', 0), ('branca', 'G', 0), ('branca', 'GG', 0), ('branca', 'XG', 0)
on conflict (color, size) do nothing;

-- 3) Alterar tabela products: adicionar novas colunas
alter table public.products add column if not exists category_id uuid references public.categories(id) on delete set null;
alter table public.products add column if not exists keywords text;
alter table public.products add column if not exists available_black boolean not null default true;
alter table public.products add column if not exists available_white boolean not null default false;
alter table public.products add column if not exists dtf_black_path text;
alter table public.products add column if not exists dtf_white_path text;
alter table public.products add column if not exists mockup_black_path text;
alter table public.products add column if not exists mockup_white_path text;

-- 4) Migrar dados existentes: mover image_path → mockup correspondente
update public.products set mockup_black_path = image_path where color = 'preta' and mockup_black_path is null;
update public.products set mockup_white_path = image_path where color = 'branca' and mockup_white_path is null;
update public.products set mockup_black_path = image_path where color = 'meme' and mockup_black_path is null;
update public.products set available_white = true, available_black = false where color = 'branca';
update public.products set available_black = true where color = 'preta' or color = 'meme';

-- 5) Remover colunas obsoletas (category texto, color, image_path)
alter table public.products drop column if exists category;
alter table public.products drop column if exists color;
alter table public.products drop column if exists image_path;

-- 6) Remover tabelas obsoletas
drop table if exists public.variants cascade;
drop table if exists public.designs cascade;

-- 7) Novos índices
create index if not exists idx_products_category on public.products (category_id);
create index if not exists idx_categories_slug on public.categories (slug);
create index if not exists idx_tshirt_stock_color on public.tshirt_stock (color);

-- Remover índices antigos (ignora se não existem)
drop index if exists idx_products_color;
drop index if exists idx_variants_product;
drop index if exists idx_designs_category;
drop index if exists idx_designs_active;

-- 8) RLS para novas tabelas
alter table public.categories enable row level security;
alter table public.tshirt_stock enable row level security;

drop policy if exists "public read categories" on public.categories;
create policy "public read categories"
  on public.categories for select
  using (true);

drop policy if exists "public read tshirt_stock" on public.tshirt_stock;
create policy "public read tshirt_stock"
  on public.tshirt_stock for select
  using (true);

-- Remover policies de tabelas deletadas (ignora erros)
drop policy if exists "public read variants" on public.variants;
drop policy if exists "public read designs" on public.designs;
