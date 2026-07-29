"use client";

import { useState } from "react";
import { saveStockLevels } from "@/app/admin/actions";

const COLORS = ["preta", "branca"] as const;
const SIZES = ["P", "M", "G", "GG", "XG"] as const;

interface StockRow {
  id: string;
  color: string;
  size: string;
  stock: number;
  initial_stock: number;
}

export function StockManager({ stock }: { stock: StockRow[] }) {
  // valores editáveis do estoque INICIAL (total comprado)
  const [initial, setInitial] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    for (const c of COLORS) {
      for (const s of SIZES) {
        const row = stock.find((r) => r.color === c && r.size === s);
        map[`${c}-${s}`] = row?.initial_stock ?? 0;
      }
    }
    return map;
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  function available(color: string, size: string): number {
    const row = stock.find((r) => r.color === color && r.size === size);
    if (!row) return initial[`${color}-${size}`] ?? 0;
    // disponível ajustado pela mudança de inicial ainda não salva
    const delta = (initial[`${color}-${size}`] ?? 0) - (row.initial_stock ?? 0);
    return Math.max(0, (row.stock ?? 0) + delta);
  }

  function sold(color: string, size: string): number {
    const init = initial[`${color}-${size}`] ?? 0;
    return Math.max(0, init - available(color, size));
  }

  function setInit(color: string, size: string, val: number) {
    setInitial((prev) => ({ ...prev, [`${color}-${size}`]: Math.max(0, val) }));
  }

  async function save() {
    setSaving(true);
    setMsg("");
    try {
      const items = COLORS.flatMap((c) =>
        SIZES.map((s) => ({ color: c, size: s, initial: initial[`${c}-${s}`] })),
      );
      await saveStockLevels(items);
      setMsg("Estoque salvo com sucesso!");
    } catch (err) {
      setMsg((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const totalInit = (color: string) =>
    SIZES.reduce((s, sz) => s + (initial[`${color}-${sz}`] ?? 0), 0);
  const totalAvail = (color: string) =>
    SIZES.reduce((s, sz) => s + available(color, sz), 0);
  const totalSold = (color: string) =>
    SIZES.reduce((s, sz) => s + sold(color, sz), 0);

  return (
    <>
      <div className="adm-page-header">
        <h1 className="adm-page-title" style={{ marginBottom: 0 }}>
          Estoque de Camisetas
        </h1>
        <button className="adm-btn primary" onClick={save} disabled={saving}>
          {saving ? "Salvando..." : "Salvar Estoque"}
        </button>
      </div>

      {msg && (
        <div
          className={msg.includes("sucesso") ? "adm-status paid" : "adm-error"}
          style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 8 }}
        >
          {msg}
        </div>
      )}

      <p style={{ color: "#888", fontSize: "0.85rem", marginBottom: 24 }}>
        Edite o <strong>estoque inicial</strong> (total de camisetas em branco compradas).
        Comprou mais? Aumente o número — o disponível sobe junto. O{" "}
        <strong>vendido</strong> é descontado quando o pagamento de um pedido é confirmado.
      </p>

      {COLORS.map((color) => (
        <div key={color} style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#fff", fontSize: "1.1rem", marginBottom: 12, textTransform: "capitalize" }}>
            Camiseta {color === "preta" ? "Preta 🖤" : "Branca 🤍"}
            <span style={{ color: "#555", fontSize: "0.8rem", marginLeft: 12 }}>
              Inicial: {totalInit(color)} · Vendido: {totalSold(color)} · Disponível: {totalAvail(color)}
            </span>
          </h2>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th style={{ width: 120 }}></th>
                  {SIZES.map((s) => (
                    <th key={s} style={{ textAlign: "center" }}>{s}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ color: "#888", fontWeight: 600 }}>Inicial</td>
                  {SIZES.map((s) => (
                    <td key={s} style={{ textAlign: "center" }}>
                      <input
                        type="number"
                        min={0}
                        value={initial[`${color}-${s}`]}
                        onChange={(e) => setInit(color, s, Number(e.target.value))}
                        style={{
                          width: 72,
                          background: "#0a0a0f",
                          border: "1px solid #1e1e2a",
                          borderRadius: 8,
                          padding: "8px 10px",
                          color: "#fff",
                          textAlign: "center",
                          fontSize: "1rem",
                        }}
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td style={{ color: "#888", fontWeight: 600 }}>Vendido</td>
                  {SIZES.map((s) => (
                    <td key={s} style={{ textAlign: "center", color: "#ff8888" }}>
                      {sold(color, s)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td style={{ color: "#888", fontWeight: 600 }}>Disponível</td>
                  {SIZES.map((s) => {
                    const av = available(color, s);
                    return (
                      <td
                        key={s}
                        style={{
                          textAlign: "center",
                          fontWeight: 700,
                          color: av === 0 ? "#ff2d55" : av <= 3 ? "#ffb020" : "#00ff88",
                        }}
                      >
                        {av}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </>
  );
}
