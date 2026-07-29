"use client";

import { useState, useTransition } from "react";
import { ORDER_STATUS_LABELS } from "@/lib/format";
import { sendOrderToGrafica, setOrderItemDtf, uploadFileToStorage, updateOrderStatus } from "../actions";

interface Order {
  id: string;
  order_number: string;
  status: string;
  customer_name: string | null;
  is_custom: boolean | null;
  created_at: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_name: string;
  size: string;
  color: string | null;
  quantity: number;
  dtf_file_path: string | null;
  is_custom: boolean;
}

const TAB_FILTERS = [
  { key: "fila_dtf", label: "Fila DTF" },
  { key: "enviado_grafica", label: "Enviado p/ Gráfica" },
  { key: "estampado", label: "Estampado" },
] as const;

export function ProductionManager({
  orders: initial,
  orderItems,
}: {
  orders: Order[];
  orderItems: OrderItem[];
}) {
  const [orders] = useState(initial);
  const [tab, setTab] = useState<string>("fila_dtf");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [uploadingItem, setUploadingItem] = useState<string | null>(null);

  const filtered = orders.filter((o) => o.status === tab);
  const counts: Record<string, number> = {};
  TAB_FILTERS.forEach((t) => {
    counts[t.key] = orders.filter((o) => o.status === t.key).length;
  });

  function getItems(orderId: string) {
    return orderItems.filter((i) => i.order_id === orderId);
  }

  function handleSendToGrafica(orderId: string) {
    startTransition(async () => {
      try {
        await sendOrderToGrafica(orderId);
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  function handleMarkEstampado(orderId: string) {
    startTransition(async () => {
      try {
        await updateOrderStatus(orderId, "estampado");
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  function handleMarkEnviado(orderId: string) {
    startTransition(async () => {
      try {
        await updateOrderStatus(orderId, "enviado");
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  async function handleDtfFile(itemId: string, file: File) {
    setUploadingItem(itemId);
    setError("");
    try {
      const ext = file.name.split(".").pop() ?? "png";
      const path = `dtf/item-${itemId}-${Date.now()}.${ext}`;
      const fd = new FormData();
      fd.append("file", file);
      const url = await uploadFileToStorage("designs-public", path, fd);
      await setOrderItemDtf(itemId, url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploadingItem(null);
    }
  }

  return (
    <>
      <h1 className="adm-page-title">Produção DTF</h1>

      {error && <div className="adm-error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="adm-filters">
        {TAB_FILTERS.map((t) => (
          <button
            key={t.key}
            className={`adm-filter-btn ${tab === t.key ? "active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label} ({counts[t.key]})
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={{ color: "#555", textAlign: "center", marginTop: 48 }}>
          Nenhum pedido neste status.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
        {filtered.map((order) => {
          const items = getItems(order.id);
          const allHaveDtf = items.every((i) => !!i.dtf_file_path);
          return (
            <div
              key={order.id}
              style={{
                background: "#0d0d14",
                border: "1px solid #1e1e2a",
                borderRadius: 12,
                padding: 20,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: "1rem" }}>
                    {order.order_number}
                  </span>
                  <span style={{ color: "#666", marginLeft: 12, fontSize: "0.8rem" }}>
                    {order.customer_name}
                  </span>
                  {order.is_custom && (
                    <span style={{ color: "#ff2d55", marginLeft: 8, fontSize: "0.75rem", fontWeight: 600 }}>
                      CUSTOM
                    </span>
                  )}
                </div>
                <span className={`adm-status ${order.status}`}>
                  {ORDER_STATUS_LABELS[order.status] ?? order.status}
                </span>
              </div>

              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Cor</th>
                      <th>Tam.</th>
                      <th>Qtd.</th>
                      <th>DTF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td style={{ color: "#fff" }}>{item.product_name}</td>
                        <td style={{ textTransform: "capitalize" }}>{item.color ?? "—"}</td>
                        <td>{item.size}</td>
                        <td>{item.quantity}</td>
                        <td>
                          {item.dtf_file_path ? (
                            <a
                              href={item.dtf_file_path}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "#00ff88", fontSize: "0.8rem" }}
                            >
                              Arquivo ✓
                            </a>
                          ) : (
                            <label
                              className="adm-btn ghost sm"
                              style={{ cursor: "pointer", fontSize: "0.75rem" }}
                            >
                              {uploadingItem === item.id ? "..." : "Upload DTF"}
                              <input
                                type="file"
                                accept="image/*,.pdf"
                                hidden
                                disabled={uploadingItem === item.id}
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) handleDtfFile(item.id, f);
                                }}
                              />
                            </label>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                {order.status === "fila_dtf" && (
                  <button
                    className="adm-btn primary sm"
                    onClick={() => handleSendToGrafica(order.id)}
                    disabled={isPending || !allHaveDtf}
                    title={!allHaveDtf ? "Todos os itens precisam ter o DTF anexado" : ""}
                  >
                    Enviar para Gráfica
                  </button>
                )}
                {order.status === "enviado_grafica" && (
                  <button
                    className="adm-btn primary sm"
                    onClick={() => handleMarkEstampado(order.id)}
                    disabled={isPending}
                  >
                    Marcar como Estampado
                  </button>
                )}
                {order.status === "estampado" && (
                  <button
                    className="adm-btn primary sm"
                    onClick={() => handleMarkEnviado(order.id)}
                    disabled={isPending}
                  >
                    Marcar como Enviado
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
