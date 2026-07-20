-- ============================================================
-- VYRAL — Schema do banco de dados (Supabase / Postgres)
-- Rode este arquivo no SQL Editor do Supabase.
-- ============================================================

-- Extensão para gerar UUIDs
create extension if not exists "pgcrypto";

-- ============================================================
-- PRODUCTS — catálogo de peças
-- ============================================================
create table if not exists public.products (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  name         text not null,
  category     text not null,               -- ex: "Oversized · Preta"
  color        text not null,               -- 'preta' | 'branca' | 'meme'
  price        numeric(10,2) not null,      -- preço atual
  old_price    numeric(10,2),               -- preço antigo (riscado), opcional
  badge        text,                        -- 'DROP' | 'HYPE' | 'MEME' | null
  badge_cyan   boolean not null default false,
  description  text not null,
  image_path   text not null,               -- ex: "/assets/produtos/seppuku.jpg"
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- VARIANTS — estoque por tamanho (P/M/G/GG/XG)
-- ============================================================
create table if not exists public.variants (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  size        text not null check (size in ('P','M','G','GG','XG')),
  stock       integer not null default 0 check (stock >= 0),
  unique (product_id, size)
);

-- ============================================================
-- ORDERS — pedidos
-- ============================================================
create table if not exists public.orders (
  id                 uuid primary key default gen_random_uuid(),
  order_number       text not null unique,          -- código legível ex: VYRAL-2026-0001
  status             text not null default 'pending' -- pending|paid|shipped|cancelled
                       check (status in ('pending','paid','shipped','cancelled')),
  customer_name      text,
  customer_email     text,
  customer_phone     text,
  shipping_address   jsonb,                          -- {cep, rua, numero, ...}
  subtotal           numeric(10,2) not null default 0,
  shipping_cost      numeric(10,2) not null default 0,
  total              numeric(10,2) not null default 0,
  mp_preference_id   text,                           -- id da preference do Mercado Pago
  mp_payment_id      text,                           -- id do pagamento confirmado (via webhook)
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ============================================================
-- ORDER_ITEMS — itens de cada pedido
-- ============================================================
create table if not exists public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  product_id    uuid references public.products(id) on delete set null,
  product_name  text not null,          -- snapshot do nome (histórico)
  size          text not null,
  unit_price    numeric(10,2) not null, -- snapshot do preço
  quantity      integer not null check (quantity > 0),
  image_path    text
);

-- ============================================================
-- ÍNDICES
-- ============================================================
create index if not exists idx_products_slug   on public.products (slug);
create index if not exists idx_products_color  on public.products (color);
create index if not exists idx_variants_product on public.variants (product_id);
create index if not exists idx_order_items_order on public.order_items (order_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.products    enable row level security;
alter table public.variants    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- Catálogo é público para leitura (produtos ativos)
drop policy if exists "public read products" on public.products;
create policy "public read products"
  on public.products for select
  using (active = true);

drop policy if exists "public read variants" on public.variants;
create policy "public read variants"
  on public.variants for select
  using (true);

-- Orders e order_items: SEM políticas públicas.
-- Só acessíveis via service_role (server-side), que ignora RLS.
