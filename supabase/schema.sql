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
-- DESIGNS — banco de estampas cadastradas pelo admin
-- ============================================================
create table if not exists public.designs (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  category    text not null default 'geral',     -- tag/categoria da estampa
  image_path  text not null,                      -- caminho no Storage
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- CUSTOM_UPLOADS — artes enviadas por clientes (Monte a sua)
-- ============================================================
create table if not exists public.custom_uploads (
  id                uuid primary key default gen_random_uuid(),
  customer_id       uuid references auth.users(id) on delete set null,
  customer_email    text,
  original_path     text not null,                 -- caminho no Storage (arquivo original)
  preview_path      text,                          -- caminho do preview (sem fundo)
  file_name         text not null,
  status            text not null default 'pending'
                      check (status in ('pending','approved','rejected')),
  rejection_reason  text,
  order_item_id     uuid,                          -- vinculado após pedido
  created_at        timestamptz not null default now()
);

-- ============================================================
-- ORDERS — pedidos
-- ============================================================
create table if not exists public.orders (
  id                 uuid primary key default gen_random_uuid(),
  order_number       text not null unique,          -- código legível ex: VYRAL-2026-0001
  customer_id        uuid references auth.users(id) on delete set null,
  status             text not null default 'pending'
                       check (status in ('pending','paid','producing','shipped','delivered','cancelled')),
  customer_name      text,
  customer_email     text,
  customer_phone     text,
  shipping_address   jsonb,                          -- {cep, rua, numero, ...}
  subtotal           numeric(10,2) not null default 0,
  shipping_cost      numeric(10,2) not null default 0,
  total              numeric(10,2) not null default 0,
  tracking_code      text,                           -- código de rastreio
  notes              text,                           -- observações internas
  mp_preference_id   text,
  mp_payment_id      text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ============================================================
-- ORDER_ITEMS — itens de cada pedido
-- ============================================================
create table if not exists public.order_items (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references public.orders(id) on delete cascade,
  product_id      uuid references public.products(id) on delete set null,
  product_name    text not null,
  size            text not null,
  unit_price      numeric(10,2) not null,
  quantity        integer not null check (quantity > 0),
  image_path      text,
  is_custom       boolean not null default false,
  custom_upload_id uuid references public.custom_uploads(id) on delete set null,
  design_id       uuid references public.designs(id) on delete set null
);

-- ============================================================
-- PRODUCTION_QUEUE — fila de produção DTF
-- ============================================================
create table if not exists public.production_queue (
  id              uuid primary key default gen_random_uuid(),
  order_item_id   uuid not null references public.order_items(id) on delete cascade,
  order_id        uuid not null references public.orders(id) on delete cascade,
  status          text not null default 'waiting'
                    check (status in ('waiting','art_approved','dtf_printed','stamped','packed','shipped')),
  art_file_path   text,                              -- arquivo final para impressão DTF
  batch_id        text,                              -- agrupamento por lote de impressão
  notes           text,
  started_at      timestamptz,
  completed_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- ADMIN_USERS — controle de acesso ao painel admin
-- ============================================================
create table if not exists public.admin_users (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade unique,
  email       text not null,
  role        text not null default 'admin' check (role in ('admin','manager')),
  created_at  timestamptz not null default now()
);

-- ============================================================
-- ÍNDICES
-- ============================================================
create index if not exists idx_products_slug        on public.products (slug);
create index if not exists idx_products_color       on public.products (color);
create index if not exists idx_variants_product     on public.variants (product_id);
create index if not exists idx_order_items_order    on public.order_items (order_id);
create index if not exists idx_designs_category     on public.designs (category);
create index if not exists idx_designs_active       on public.designs (active);
create index if not exists idx_custom_uploads_status on public.custom_uploads (status);
create index if not exists idx_production_status    on public.production_queue (status);
create index if not exists idx_production_batch     on public.production_queue (batch_id);
create index if not exists idx_orders_status        on public.orders (status);
create index if not exists idx_orders_customer      on public.orders (customer_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.products          enable row level security;
alter table public.variants          enable row level security;
alter table public.orders            enable row level security;
alter table public.order_items       enable row level security;
alter table public.designs           enable row level security;
alter table public.custom_uploads    enable row level security;
alter table public.production_queue  enable row level security;
alter table public.admin_users       enable row level security;

-- Catálogo é público para leitura (produtos ativos)
drop policy if exists "public read products" on public.products;
create policy "public read products"
  on public.products for select
  using (active = true);

drop policy if exists "public read variants" on public.variants;
create policy "public read variants"
  on public.variants for select
  using (true);

-- Designs ativos são públicos (galeria na personalização)
drop policy if exists "public read designs" on public.designs;
create policy "public read designs"
  on public.designs for select
  using (active = true);

-- Cliente pode ver seus próprios uploads
drop policy if exists "own uploads" on public.custom_uploads;
create policy "own uploads"
  on public.custom_uploads for select
  using (auth.uid() = customer_id);

-- Cliente pode criar uploads
drop policy if exists "insert uploads" on public.custom_uploads;
create policy "insert uploads"
  on public.custom_uploads for insert
  with check (auth.uid() = customer_id);

-- Cliente pode ver seus próprios pedidos
drop policy if exists "own orders" on public.orders;
create policy "own orders"
  on public.orders for select
  using (auth.uid() = customer_id);

-- Cliente pode ver itens dos seus pedidos
drop policy if exists "own order items" on public.order_items;
create policy "own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.customer_id = auth.uid()
    )
  );

-- Admin/service_role bypassa RLS automaticamente.
-- Orders, order_items, production_queue, admin_users:
-- sem políticas públicas — só acessíveis via service_role (server-side).

-- Admin pode ver seu próprio registro (necessário para middleware)
drop policy if exists "own admin record" on public.admin_users;
create policy "own admin record"
  on public.admin_users for select
  using (auth.uid() = user_id);
