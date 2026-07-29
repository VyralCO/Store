-- ============================================================
-- VYRAL — Migration v3
-- Fluxo completo: settings, estoque inicial, novos status de
-- pedido, tratamento de custom uploads e fila pública de DTF.
-- Rode no SQL Editor do Supabase (ou via CLI: db query --linked -f).
-- ============================================================

-- ─── SETTINGS (chave/valor) ───────────────────────────────
create table if not exists public.settings (
  key         text primary key,
  value       text,
  updated_at  timestamptz not null default now()
);

insert into public.settings (key, value) values
  ('custom_price_center', '129'),
  ('custom_price_full',   '149')
on conflict (key) do nothing;

-- ─── TSHIRT_STOCK: estoque inicial ────────────────────────
-- `stock` = disponível (real). `initial_stock` = total já comprado.
-- vendido = initial_stock - stock.
alter table public.tshirt_stock
  add column if not exists initial_stock integer not null default 0;

-- Alinha initial_stock ao stock atual na primeira migração
update public.tshirt_stock
  set initial_stock = greatest(initial_stock, stock)
  where initial_stock < stock;

-- ─── ORDERS: novos status ─────────────────────────────────
alter table public.orders drop constraint if exists orders_status_check;

-- Migra valores antigos para o novo modelo
update public.orders set status = 'aguardando_pagamento' where status = 'pending';
update public.orders set status = 'fila_dtf'             where status = 'paid';
update public.orders set status = 'fila_dtf'             where status = 'producing';
update public.orders set status = 'enviado'              where status = 'shipped';
update public.orders set status = 'enviado'              where status = 'delivered';
update public.orders set status = 'cancelado'            where status = 'cancelled';

alter table public.orders
  add constraint orders_status_check
  check (status in (
    'aguardando_arte',
    'aguardando_pagamento',
    'fila_dtf',
    'enviado_grafica',
    'estampado',
    'enviado',
    'cancelado'
  ));

alter table public.orders
  alter column status set default 'aguardando_pagamento';

-- Marca se o pedido é personalizado (tem itens custom)
alter table public.orders
  add column if not exists is_custom boolean not null default false;

-- ─── CUSTOM_UPLOADS: dados da personalização ──────────────
alter table public.custom_uploads
  add column if not exists layout        text,
  add column if not exists color         text,
  add column if not exists size          text,
  add column if not exists price         numeric(10,2),
  add column if not exists dtf_file_path text,
  add column if not exists order_id      uuid references public.orders(id) on delete set null;

-- ─── ORDER_ITEMS: DTF + cor ───────────────────────────────
alter table public.order_items
  add column if not exists dtf_file_path text,
  add column if not exists color         text;

-- ─── DTF_QUEUE: fila pública para a gráfica ───────────────
create table if not exists public.dtf_queue (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid references public.orders(id) on delete set null,
  order_item_id uuid references public.order_items(id) on delete set null,
  dtf_url       text not null,
  label         text,
  day           date not null default current_date,
  status        text not null default 'pendente' check (status in ('pendente','baixado')),
  created_at    timestamptz not null default now()
);

create index if not exists idx_dtf_queue_day    on public.dtf_queue (day);
create index if not exists idx_dtf_queue_status on public.dtf_queue (status);

-- ─── RLS ──────────────────────────────────────────────────
alter table public.settings   enable row level security;
alter table public.dtf_queue  enable row level security;

-- settings: leitura pública (preços aparecem no site)
drop policy if exists "public read settings" on public.settings;
create policy "public read settings"
  on public.settings for select
  using (true);

-- dtf_queue: leitura pública (gráfica acessa /dtf sem login)
drop policy if exists "public read dtf_queue" on public.dtf_queue;
create policy "public read dtf_queue"
  on public.dtf_queue for select
  using (true);
