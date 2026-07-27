"use client";

import { useState } from "react";
import { updateTshirtStock } from "@/app/admin/actions";

const COLORS = ["preta", "branca"] as const;
const SIZES = ["P", "M", "G", "GG", "XG"] as const;

interface StockRow {
  id: string;
  color: string;
  size: string;
  stock: number;
}

export function StockManager({ stock }: { stock: StockRow[] }) {
  const [values, setValues] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    for (const c of COLORS) {
      for (const s of SIZES) {
        const row = stock.find((r) => r.color === c && r.size === s);
        map[`${c}-${s}`] = row?.stock ?? 0;
      }
    }
    return map;
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  function set(color: string, size: string, val: number) {
    setValues((prev) => ({ ...prev, [`${color}-${size}`]: Math.max(0, val) }));
  }

  async function save() {
    setSaving(true);
    setMsg("");
    try {
      const items = COLORS.flatMap((c) =>
        SIZES.map((s) => ({ color: c, size: s, stock: values[`${c}-${s}`] })),
      );
      await updateTshirtStock(items);
      setMsg("Estoque salvo com sucesso!");
    } catch (err) {
      setMsg((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const totalPreta = SIZES.reduce((s, sz) => s + (values[`preta-${sz}`] ?? 0), 0);
  const totalBranca = SIZES.reduce((s, sz) => s + (values[`branca-${sz}`] ?? 0), 0);

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
        Gerencie o estoque de camisetas em branco (matéria-prima). As vendas descontam daqui automaticamente.
      </p>

      {COLORS.map((color) => (
        <div key={color} style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#fff", fontSize: "1.1rem", marginBottom: 12, textTransform: "capitalize" }}>
            Camiseta {color === "preta" ? "Preta 🖤" : "Branca 🤍"}
            <span style={{ color: "#555", fontSize: "0.8rem", marginLeft: 12 }}>
              Total: {color === "preta" ? totalPreta : totalBranca} peças
            </span>
          </h2>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  {SIZES.map((s) => (
                    <th key={s} style={{ textAlign: "center", width: "20%" }}>{s}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {SIZES.map((s) => (
                    <td key={s} style={{ textAlign: "center" }}>
                      <input
                        type="number"
                        min={0}
                        value={values[`${color}-${s}`]}
                        onChange={(e) => set(color, s, Number(e.target.value))}
                        style={{
                          width: 80,
                          background: "#0a0a0f",
                          border: "1px solid #1e1e2a",
                          borderRadius: 8,
                          padding: "8px 12px",
                          color: "#fff",
                          textAlign: "center",
                          fontSize: "1rem",
                        }}
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </>
  );
}
