"use client";

import { useState, useTransition } from "react";
import { updateProductionStatus, assignBatch } from "../actions";

interface QueueItem {
  id: string;
  order_item_id: string;
  order_id: string;
  status: string;
  art_file_path: string | null;
  batch_id: string | null;
  notes: string | null;
  created_at: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_name: string;
  size: string;
  quantity: number;
  image_path: string | null;
  is_custom: boolean;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string | null;
}

const FLOW = [
  { key: "waiting", label: "Aguardando", next: "art_approved" },
  { key: "art_approved", label: "Arte Aprovada", next: "dtf_printed" },
  { key: "dtf_printed", label: "DTF Impresso", next: "stamped" },
  { key: "stamped", label: "Estampado", next: "packed" },
  { key: "packed", label: "Embalado", next: "shipped" },
  { key: "shipped", label: "Enviado", next: null },
] as const;

const STATUS_LABELS: Record<string, string> = Object.fromEntries(
  FLOW.map((f) => [f.key, f.label]),
);

export function ProductionManager({
  queue: initial,
  orderItems,
  orders,
}: {
  queue: QueueItem[];
  orderItems: OrderItem[];
  orders: Order[];
}) {
  const [queue] = useState(initial);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [batchInput, setBatchInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const filtered =
    filter === "all" ? queue : queue.filter((q) => q.status === filter);

  const counts: Record<string, number> = { all: queue.length };
  FLOW.forEach((f) => {
    counts[f.key] = queue.filter((q) => q.status === f.key).length;
  });

  function getOrderItem(queueItem: QueueItem) {
    return orderItems.find((i) => i.id === queueItem.order_item_id);
  }

  function getOrder(queueItem: QueueItem) {
    return orders.find((o) => o.id === queueItem.order_id);
  }

  function handleAdvance(id: string, nextStatus: string) {
    startTransition(async () => {
      try {
        await updateProductionStatus(id, nextStatus);
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  function handleBatchAssign() {
    if (selected.size === 0 || !batchInput.trim()) return;
    startTransition(async () => {
      try {
        await assignBatch([...selected], batchInput.trim());
        setSelected(new Set());
        setBatchInput("");
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  function toggleSelect(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  return (
    <>
      <h1 className="adm-page-title">Fila de Produção DTF</h1>

      {error && <div className="adm-error" style={{ marginBottom: 16 }}>{error}</div>}

      {/* Batch assignment */}
      {selected.size > 0 && (
        <div
          className="adm-card"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
            padding: 12,
          }}
        >
          <span style={{ fontSize: "0.85rem", color: "#fff" }}>
            {selected.size} selecionado(s)
          </span>
          <input
            placeholder="ID do lote (ex: LOTE-001)"
            value={batchInput}
            onChange={(e) => setBatchInput(e.target.value)}
            style={{
              background: "#0a0a0f",
              border: "1px solid #1e1e2a",
              borderRadius: 8,
              padding: "6px 12px",
              color: "#fff",
              fontSize: "0.8rem",
              flex: 1,
            }}
          />
          <button
            className="adm-btn primary sm"
            onClick={handleBatchAssign}
            disabled={isPending}
          >
            Agrupar Lote
          </button>
          <button
            className="adm-btn ghost sm"
            onClick={() => setSelected(new Set())}
          >
            Limpar
          </button>
        </div>
      )}

      <div className="adm-filters">
        <button
          className={`adm-filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          Todos ({counts.all})
        </button>
        {FLOW.map((f) => (
          <button
            key={f.key}
            className={`adm-filter-btn ${filter === f.key ? "active" : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label} ({counts[f.key]})
          </button>
        ))}
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}>
                <input
                  type="checkbox"
                  checked={filtered.length > 0 && filtered.every((q) => selected.has(q.id))}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelected(new Set([...selected, ...filtered.map((q) => q.id)]));
                    } else {
                      const next = new Set(selected);
                      filtered.forEach((q) => next.delete(q.id));
                      setSelected(next);
                    }
                  }}
                />
              </th>
              <th>Pedido</th>
              <th>Produto</th>
              <th>Tam.</th>
              <th>Qtd.</th>
              <th>Custom</th>
              <th>Lote</th>
              <th>Status</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", color: "#555" }}>
                  Nenhum item na fila
                </td>
              </tr>
            )}
            {filtered.map((q) => {
              const item = getOrderItem(q);
              const order = getOrder(q);
              const flow = FLOW.find((f) => f.key === q.status);
              return (
                <tr key={q.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.has(q.id)}
                      onChange={() => toggleSelect(q.id)}
                    />
                  </td>
                  <td style={{ fontWeight: 600, color: "#fff" }}>
                    {order?.order_number ?? "—"}
                    <div style={{ fontSize: "0.7rem", color: "#666" }}>
                      {order?.customer_name}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {item?.image_path && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image_path}
                          alt=""
                          style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover" }}
                        />
                      )}
                      {item?.product_name ?? "—"}
                    </div>
                  </td>
                  <td>{item?.size}</td>
                  <td>{item?.quantity}</td>
                  <td>{item?.is_custom ? "Sim" : "—"}</td>
                  <td>
                    {q.batch_id ? (
                      <span
                        style={{
                          background: "#1a1a33",
                          color: "#6688ff",
                          padding: "2px 8px",
                          borderRadius: 12,
                          fontSize: "0.7rem",
                          fontWeight: 600,
                        }}
                      >
                        {q.batch_id}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    <span className={`adm-status ${q.status}`}>
                      {STATUS_LABELS[q.status]}
                    </span>
                  </td>
                  <td>
                    {flow?.next && (
                      <button
                        className="adm-btn primary sm"
                        onClick={() => handleAdvance(q.id, flow.next!)}
                        disabled={isPending}
                      >
                        → {STATUS_LABELS[flow.next]}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
