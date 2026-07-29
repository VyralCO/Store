"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { generateProductMeta } from "@/lib/ai";

// ─── CATEGORIES ───

export async function createCategory(formData: FormData) {
  const supabase = createAdminClient();
  const name = (formData.get("name") as string).trim();
  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const { error } = await supabase.from("categories").insert({ name, slug });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/produtos");
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = createAdminClient();
  const name = (formData.get("name") as string).trim();
  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const { error } = await supabase.from("categories").update({ name, slug }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/produtos");
}

export async function deleteCategory(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/produtos");
}

// ─── TSHIRT STOCK ───

// `stock` = disponível (real). `initial_stock` = total comprado.
// vendido = initial_stock - stock. Ao mudar o inicial, ajustamos o
// disponível pelo mesmo delta (comprei mais → disponível sobe).
export async function saveStockLevels(
  items: { color: string; size: string; initial: number }[],
) {
  const supabase = createAdminClient();

  for (const item of items) {
    const { data: current } = await supabase
      .from("tshirt_stock")
      .select("initial_stock, stock")
      .eq("color", item.color)
      .eq("size", item.size)
      .maybeSingle();

    if (current) {
      const delta = item.initial - (current.initial_stock ?? 0);
      const newStock = Math.max(0, (current.stock ?? 0) + delta);
      const { error } = await supabase
        .from("tshirt_stock")
        .update({ initial_stock: item.initial, stock: newStock })
        .eq("color", item.color)
        .eq("size", item.size);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase
        .from("tshirt_stock")
        .insert({
          color: item.color,
          size: item.size,
          initial_stock: item.initial,
          stock: item.initial,
        });
      if (error) throw new Error(error.message);
    }
  }

  revalidatePath("/admin/estoque");
}

// ─── PRODUCTS (ESTAMPAS) ───

export async function createProduct(formData: FormData) {
  const supabase = createAdminClient();
  const slug = (formData.get("slug") as string).trim().toLowerCase().replace(/\s+/g, "-");

  const name = formData.get("name") as string;
  const categoryId = (formData.get("category_id") as string) || null;
  const mockupBlack = (formData.get("mockup_black_path") as string) || null;
  const mockupWhite = (formData.get("mockup_white_path") as string) || null;

  let description = (formData.get("description") as string) || "";
  let keywords = (formData.get("keywords") as string) || "";

  // Descrição/keywords automáticas quando não preenchidas manualmente.
  if (!description.trim() || !keywords.trim()) {
    let categoryName: string | undefined;
    if (categoryId) {
      const { data: cat } = await supabase
        .from("categories")
        .select("name")
        .eq("id", categoryId)
        .maybeSingle();
      categoryName = cat?.name;
    }
    const meta = await generateProductMeta(name, categoryName, mockupBlack ?? mockupWhite ?? undefined);
    if (!description.trim()) description = meta.description;
    if (!keywords.trim()) keywords = meta.keywords;
  }

  const { error } = await supabase.from("products").insert({
    slug,
    name,
    category_id: categoryId,
    price: Number(formData.get("price")),
    old_price: formData.get("old_price") ? Number(formData.get("old_price")) : null,
    badge: (formData.get("badge") as string) || null,
    badge_cyan: formData.get("badge_cyan") === "on",
    description,
    keywords: keywords || null,
    available_black: formData.get("available_black") === "on",
    available_white: formData.get("available_white") === "on",
    dtf_black_path: (formData.get("dtf_black_path") as string) || null,
    dtf_white_path: (formData.get("dtf_white_path") as string) || null,
    mockup_black_path: mockupBlack,
    mockup_white_path: mockupWhite,
    active: formData.get("active") !== "off",
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/produtos");
  revalidatePath("/loja");
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("products")
    .update({
      name: formData.get("name") as string,
      category_id: (formData.get("category_id") as string) || null,
      price: Number(formData.get("price")),
      old_price: formData.get("old_price") ? Number(formData.get("old_price")) : null,
      badge: (formData.get("badge") as string) || null,
      badge_cyan: formData.get("badge_cyan") === "on",
      description: formData.get("description") as string,
      keywords: (formData.get("keywords") as string) || null,
      available_black: formData.get("available_black") === "on",
      available_white: formData.get("available_white") === "on",
      dtf_black_path: (formData.get("dtf_black_path") as string) || null,
      dtf_white_path: (formData.get("dtf_white_path") as string) || null,
      mockup_black_path: (formData.get("mockup_black_path") as string) || null,
      mockup_white_path: (formData.get("mockup_white_path") as string) || null,
      active: formData.get("active") !== "off",
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/produtos");
  revalidatePath("/loja");
}

export async function deleteProduct(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/produtos");
  revalidatePath("/loja");
}

// ─── ORDERS ───

export async function updateOrderStatus(id: string, status: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/pedidos");
}

export async function updateOrderTracking(id: string, trackingCode: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("orders")
    .update({ tracking_code: trackingCode, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/pedidos");
}

// ─── PRODUCTION QUEUE ───

export async function updateProductionStatus(id: string, status: string) {
  const supabase = createAdminClient();

  const updates: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === "dtf_printed" || status === "stamped") {
    updates.started_at = updates.started_at ?? new Date().toISOString();
  }

  if (status === "shipped") {
    updates.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("production_queue")
    .update(updates)
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/producao");
}

export async function assignBatch(ids: string[], batchId: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("production_queue")
    .update({ batch_id: batchId, updated_at: new Date().toISOString() })
    .in("id", ids);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/producao");
}

// ─── CUSTOM UPLOADS ───

export async function updateUploadStatus(
  id: string,
  status: "approved" | "rejected",
  reason?: string,
) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("custom_uploads")
    .update({
      status,
      rejection_reason: status === "rejected" ? reason : null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/uploads");
}

/**
 * Processa a arte de um upload personalizado: anexa o arquivo DTF tratado,
 * aprova o upload e move o pedido vinculado para "aguardando_pagamento".
 */
export async function processCustomUpload(uploadId: string, dtfUrl: string) {
  const supabase = createAdminClient();

  const { data: upload, error: upErr } = await supabase
    .from("custom_uploads")
    .update({ dtf_file_path: dtfUrl, status: "approved" })
    .eq("id", uploadId)
    .select("id, order_id")
    .single();

  if (upErr) throw new Error(upErr.message);

  if (upload?.order_id) {
    // Anexa o DTF ao item do pedido
    await supabase
      .from("order_items")
      .update({ dtf_file_path: dtfUrl })
      .eq("custom_upload_id", uploadId);

    // Só avança se ainda estava aguardando a arte
    await supabase
      .from("orders")
      .update({ status: "aguardando_pagamento", updated_at: new Date().toISOString() })
      .eq("id", upload.order_id)
      .eq("status", "aguardando_arte");
  }

  revalidatePath("/admin/uploads");
  revalidatePath("/admin/pedidos");
}

// ─── PRICING (settings) ───

export async function getCustomPricing(): Promise<{ center: number; full: number }> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("settings")
    .select("key, value")
    .in("key", ["custom_price_center", "custom_price_full"]);

  const map = new Map((data ?? []).map((r) => [r.key, r.value]));
  return {
    center: Number(map.get("custom_price_center") ?? 129),
    full: Number(map.get("custom_price_full") ?? 149),
  };
}

export async function updateCustomPricing(center: number, full: number) {
  const supabase = createAdminClient();
  const now = new Date().toISOString();
  const { error } = await supabase.from("settings").upsert(
    [
      { key: "custom_price_center", value: String(center), updated_at: now },
      { key: "custom_price_full", value: String(full), updated_at: now },
    ],
    { onConflict: "key" },
  );
  if (error) throw new Error(error.message);
  revalidatePath("/admin/uploads");
  revalidatePath("/personalizar");
}

// ─── ORDER FLOW ───

/**
 * Confirma o pagamento de um pedido: deduz o estoque das camisetas e
 * move para a fila de impressão DTF.
 */
export async function confirmPayment(orderId: string) {
  const supabase = createAdminClient();

  const { data: order } = await supabase
    .from("orders")
    .select("id, status")
    .eq("id", orderId)
    .single();

  if (!order) throw new Error("Pedido não encontrado");
  if (order.status !== "aguardando_pagamento") {
    throw new Error("Pedido não está aguardando pagamento");
  }

  // Deduz estoque por cor + tamanho de cada item
  const { data: items } = await supabase
    .from("order_items")
    .select("color, size, quantity")
    .eq("order_id", orderId);

  for (const item of items ?? []) {
    const color = item.color ?? "preta";
    const { data: stockRow } = await supabase
      .from("tshirt_stock")
      .select("stock")
      .eq("color", color)
      .eq("size", item.size)
      .maybeSingle();

    if (stockRow) {
      const newStock = Math.max(0, stockRow.stock - item.quantity);
      await supabase
        .from("tshirt_stock")
        .update({ stock: newStock })
        .eq("color", color)
        .eq("size", item.size);
    }
  }

  await supabase
    .from("orders")
    .update({ status: "fila_dtf", updated_at: new Date().toISOString() })
    .eq("id", orderId);

  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/producao");
  revalidatePath("/admin/estoque");
}

/**
 * Anexa/atualiza o arquivo DTF final de um item de pedido.
 */
export async function setOrderItemDtf(orderItemId: string, dtfUrl: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("order_items")
    .update({ dtf_file_path: dtfUrl })
    .eq("id", orderItemId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/producao");
}

/**
 * Envia um pedido para a gráfica: gera as linhas de DTF (uma por unidade)
 * na fila pública /dtf e marca o pedido como "enviado_grafica".
 */
export async function sendOrderToGrafica(orderId: string) {
  const supabase = createAdminClient();

  const { data: order } = await supabase
    .from("orders")
    .select("id, order_number")
    .eq("id", orderId)
    .single();
  if (!order) throw new Error("Pedido não encontrado");

  const { data: items } = await supabase
    .from("order_items")
    .select("id, product_name, quantity, color, dtf_file_path, product_id")
    .eq("order_id", orderId);

  const rows: {
    order_id: string;
    order_item_id: string;
    dtf_url: string;
    label: string;
  }[] = [];

  for (const item of items ?? []) {
    let url = item.dtf_file_path;
    // Fallback: pega o DTF cadastrado no produto conforme a cor
    if (!url && item.product_id) {
      const { data: prod } = await supabase
        .from("products")
        .select("dtf_black_path, dtf_white_path")
        .eq("id", item.product_id)
        .maybeSingle();
      url = item.color === "branca" ? prod?.dtf_white_path : prod?.dtf_black_path;
    }
    if (!url) continue;

    // Uma linha por unidade (2 estampas iguais = 2 downloads)
    for (let i = 0; i < item.quantity; i++) {
      rows.push({
        order_id: orderId,
        order_item_id: item.id,
        dtf_url: url,
        label: `${order.order_number} · ${item.product_name} (${item.color ?? "preta"})`,
      });
    }
  }

  if (rows.length > 0) {
    const { error } = await supabase.from("dtf_queue").insert(rows);
    if (error) throw new Error(error.message);
  }

  await supabase
    .from("orders")
    .update({ status: "enviado_grafica", updated_at: new Date().toISOString() })
    .eq("id", orderId);

  revalidatePath("/admin/producao");
  revalidatePath("/admin/pedidos");
  revalidatePath("/dtf");
}

// ─── DTF QUEUE (fila pública) ───

export async function addDtfLink(url: string, label: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("dtf_queue")
    .insert({ dtf_url: url, label: label || null });
  if (error) throw new Error(error.message);
  revalidatePath("/dtf");
}

export async function deleteDtfLink(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("dtf_queue").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dtf");
}

// ─── CHECKOUT (client-facing) ───

export async function createOrder(formData: FormData, cartItems: {
  slug: string;
  name: string;
  size: string;
  color: string;
  price: number;
  qty: number;
  imagePath: string;
  custom?: boolean;
  customUploadId?: string;
  designId?: string;
  /** Personalizadas: dados extras para criar o registro em custom_uploads. */
  layout?: string;
  customImageUrl?: string;
  customFileName?: string;
}[]) {
  const supabase = createAdminClient();

  // Generate order number
  const now = new Date();
  const year = now.getFullYear();
  const { count } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .gte("created_at", `${year}-01-01`);

  const orderNumber = `VYRAL-${year}-${String((count ?? 0) + 1).padStart(4, "0")}`;

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const shippingCost = subtotal >= 249 ? 0 : 29.9;

  const isCustomOrder = cartItems.some((i) => i.custom);
  // Custom aguarda a arte ser tratada; normal já vai para pagamento.
  const initialStatus = isCustomOrder ? "aguardando_arte" : "aguardando_pagamento";

  const customerEmail = formData.get("email") as string;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      status: initialStatus,
      is_custom: isCustomOrder,
      customer_name: formData.get("name") as string,
      customer_email: customerEmail,
      customer_phone: formData.get("phone") as string,
      shipping_address: {
        cep: formData.get("cep"),
        rua: formData.get("rua"),
        numero: formData.get("numero"),
        complemento: formData.get("complemento"),
        bairro: formData.get("bairro"),
        cidade: formData.get("cidade"),
        estado: formData.get("estado"),
      },
      subtotal,
      shipping_cost: shippingCost,
      total: subtotal + shippingCost,
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) throw new Error(orderError?.message ?? "Erro ao criar pedido");

  // Cria registros de upload para itens personalizados e vincula ao pedido.
  const uploadIdByIndex: (string | null)[] = [];
  for (const item of cartItems) {
    if (item.custom && item.customImageUrl) {
      const { data: up } = await supabase
        .from("custom_uploads")
        .insert({
          customer_email: customerEmail,
          original_path: item.customImageUrl,
          file_name: item.customFileName ?? "arte-cliente",
          status: "pending",
          layout: item.layout ?? null,
          color: item.color,
          size: item.size,
          price: item.price,
          order_id: order.id,
        })
        .select("id")
        .single();
      uploadIdByIndex.push(up?.id ?? null);
    } else {
      uploadIdByIndex.push(item.customUploadId ?? null);
    }
  }

  // Insert order items (com cor e vínculo de upload)
  const itemsPayload = cartItems.map((item, idx) => ({
    order_id: order.id,
    product_name: item.name,
    size: item.size,
    color: item.color,
    unit_price: item.price,
    quantity: item.qty,
    image_path: item.imagePath,
    is_custom: item.custom ?? false,
    custom_upload_id: uploadIdByIndex[idx],
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(itemsPayload);

  if (itemsError) throw new Error(itemsError.message);

  // Estoque só é deduzido na confirmação do pagamento (venda efetivada).

  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/uploads");

  return { orderNumber: order.order_number, orderId: order.id };
}

// ─── UPLOAD FILE TO STORAGE ───

export async function uploadFileToStorage(
  bucket: string,
  path: string,
  file: FormData,
) {
  const supabase = createAdminClient();
  const fileData = file.get("file") as File;
  if (!fileData) throw new Error("Nenhum arquivo enviado");

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, fileData, { upsert: true });

  if (error) throw new Error(error.message);

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
  return urlData.publicUrl;
}
