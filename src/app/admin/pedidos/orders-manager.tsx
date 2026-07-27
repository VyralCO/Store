"use client";

import { useState, useTransition } from "react";
import { formatMoney } from "@/lib/format";
import { updateOrderStatus, updateOrderTracking } from "../actions";

interface Order {
  id: string;
  order_number: string;
  status: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_address: Record<string, string> | null;
  subtotal: number;
  shipping_cost: number;
  total: number;
  tracking_code: string | null;
  notes: string | null;
  created_at: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_name: string;
  size: string;
  unit_price: number;
  quantity: number;
  image_path: string | null;
  is_custom: boolean;
}

const STATUSES = ["pending", "paid", "producing", "shipped", "delivered", "cancelled"] as const;
const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  paid: "Pago",
  producing: "Produzindo",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

export function OrdersManager({
  orders: initial,
  orderItems,
}: {
  orders: Order[];
  orderItems: OrderItem[];
}) {
  const [orders] = useState(initial);
  const [filter, setFilter] = useState("all");
  const [detail, setDetail] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const counts: Record<string, number> = { all: orders.length };
  STATUSES.forEach((s) => {
    counts[s] = orders.filter((o) => o.status === s).length;
  });

  const selectedOrder = detail ? orders.find((o) => o.id === detail) : null;
  const selectedItems = detail ? orderItems.filter((i) => i.order_id === detail) : [];

  function handleStatusChange(orderId: string, status: string) {
    startTransition(async () => {
      try {
        await updateOrderStatus(orderId, status);
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  function handleTrackingSave(orderId: string) {
    startTransition(async () => {
      try {
        await updateOrderTracking(orderId, trackingInput);
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  return (
    <>
      <h1 className="adm-page-title">Pedidos</h1>

      {error && <div className="adm-error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="adm-filters">
        <button
          className={`adm-filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          Todos ({counts.all})
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            className={`adm-filter-btn ${filter === s ? "active" : ""}`}
            onClick={() => setFilter(s)}
          >
            {STATUS_LABELS[s]} ({counts[s]})
          </button>
        ))}
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Itens</th>
              <th>Total</th>
              <th>Status</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", color: "#555" }}>
                  Nenhum pedido encontrado
                </td>
              </tr>
            )}
            {filtered.map((o) => {
              const items = orderItems.filter((i) => i.order_id === o.id);
              return (
                <tr key={o.id}>
                  <td style={{ fontWeight: 600, color: "#fff" }}>
                    {o.order_number}
                  </td>
                  <td>
                    <div>{o.customer_name}</div>
                    <div style={{ fontSize: "0.7rem", color: "#666" }}>
                      {o.customer_email}
                    </div>
                  </td>
                  <td>{items.length} item(s)</td>
                  <td>{formatMoney(Number(o.total))}</td>
                  <td>
                    <span className={`adm-status ${o.status}`}>
                      {STATUS_LABELS[o.status]}
                    </span>
                  </td>
                  <td>{new Date(o.created_at).toLocaleDateString("pt-BR")}</td>
                  <td>
                    <button
                      className="adm-btn ghost sm"
                      onClick={() => {
                        setDetail(o.id);
                        setTrackingInput(o.tracking_code ?? "");
                      }}
                    >
                      Ver detalhes
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="adm-modal-overlay" onClick={() => setDetail(null)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 700 }}>
            <h3>Pedido {selectedOrder.order_number}</h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div>
                <div className="adm-card-label">Cliente</div>
                <div style={{ color: "#fff" }}>{selectedOrder.customer_name}</div>
                <div style={{ fontSize: "0.8rem", color: "#888" }}>{selectedOrder.customer_email}</div>
                <div style={{ fontSize: "0.8rem", color: "#888" }}>{selectedOrder.customer_phone}</div>
              </div>
              <div>
                <div className="adm-card-label">Endereço</div>
                {selectedOrder.shipping_address && (
                  <div style={{ fontSize: "0.8rem", color: "#ccc" }}>
                    {selectedOrder.shipping_address.rua}, {selectedOrder.shipping_address.numero}
                    {selectedOrder.shipping_address.complemento ? ` - ${selectedOrder.shipping_address.complemento}` : ""}
                    <br />
                    {selectedOrder.shipping_address.bairro} — {selectedOrder.shipping_address.cidade}/{selectedOrder.shipping_address.estado}
                    <br />
                    CEP: {selectedOrder.shipping_address.cep}
                  </div>
                )}
              </div>
            </div>

            <div className="adm-card-label">Itens</div>
            <div className="adm-table-wrap" style={{ marginBottom: 16 }}>
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Tam.</th>
                    <th>Qtd.</th>
                    <th>Preço</th>
                    <th>Custom</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedItems.map((item) => (
                    <tr key={item.id}>
                      <td style={{ color: "#fff" }}>{item.product_name}</td>
                      <td>{item.size}</td>
                      <td>{item.quantity}</td>
                      <td>{formatMoney(Number(item.unit_price))}</td>
                      <td>{item.is_custom ? "Sim" : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
              <div className="adm-card" style={{ padding: 12 }}>
                <div className="adm-card-label">Subtotal</div>
                <div style={{ color: "#fff", fontWeight: 600 }}>
                  {formatMoney(Number(selectedOrder.subtotal))}
                </div>
              </div>
              <div className="adm-card" style={{ padding: 12 }}>
                <div className="adm-card-label">Frete</div>
                <div style={{ color: "#fff", fontWeight: 600 }}>
                  {Number(selectedOrder.shipping_cost) === 0
                    ? "Grátis"
                    : formatMoney(Number(selectedOrder.shipping_cost))}
                </div>
              </div>
              <div className="adm-card" style={{ padding: 12 }}>
                <div className="adm-card-label">Total</div>
                <div style={{ color: "#ff2d55", fontWeight: 900 }}>
                  {formatMoney(Number(selectedOrder.total))}
                </div>
              </div>
            </div>

            <div className="adm-field-row" style={{ marginBottom: 16 }}>
              <div className="adm-field">
                <label>Status</label>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                  disabled={isPending}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>
              <div className="adm-field">
                <label>Código de Rastreio</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    placeholder="BR123456789XX"
                  />
                  <button
                    className="adm-btn primary sm"
                    onClick={() => handleTrackingSave(selectedOrder.id)}
                    disabled={isPending}
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </div>

            <button className="adm-btn ghost" onClick={() => setDetail(null)}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
