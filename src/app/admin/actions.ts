"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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

export async function updateTshirtStock(items: { color: string; size: string; stock: number }[]) {
  const supabase = createAdminClient();

  for (const item of items) {
    const { error } = await supabase
      .from("tshirt_stock")
      .upsert(
        { color: item.color, size: item.size, stock: item.stock },
        { onConflict: "color,size" },
      );
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin/estoque");
}

// ─── PRODUCTS (ESTAMPAS) ───

export async function createProduct(formData: FormData) {
  const supabase = createAdminClient();
  const slug = (formData.get("slug") as string).trim().toLowerCase().replace(/\s+/g, "-");

  const { error } = await supabase.from("products").insert({
    slug,
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

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      status: "pending",
      customer_name: formData.get("name") as string,
      customer_email: formData.get("email") as string,
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

  // Insert order items
  const itemsPayload = cartItems.map((item) => ({
    order_id: order.id,
    product_name: item.name,
    size: item.size,
    unit_price: item.price,
    quantity: item.qty,
    image_path: item.imagePath,
    is_custom: item.custom ?? false,
    custom_upload_id: item.customUploadId ?? null,
    design_id: item.designId ?? null,
  }));

  const { data: insertedItems, error: itemsError } = await supabase
    .from("order_items")
    .insert(itemsPayload)
    .select("id");

  if (itemsError) throw new Error(itemsError.message);

  // Deduct from tshirt_stock
  for (const item of cartItems) {
    if (item.custom) continue;
    const { data: stockRow } = await supabase
      .from("tshirt_stock")
      .select("stock")
      .eq("color", item.color)
      .eq("size", item.size)
      .single();

    if (stockRow) {
      const newStock = Math.max(0, stockRow.stock - item.qty);
      await supabase
        .from("tshirt_stock")
        .update({ stock: newStock })
        .eq("color", item.color)
        .eq("size", item.size);
    }
  }

  // Add items to production queue
  if (insertedItems) {
    const queueItems = insertedItems.map((item) => ({
      order_item_id: item.id,
      order_id: order.id,
      status: "waiting" as const,
    }));

    await supabase.from("production_queue").insert(queueItems);
  }

  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/producao");
  revalidatePath("/admin/estoque");

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
