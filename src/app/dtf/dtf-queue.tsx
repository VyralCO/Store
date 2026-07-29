"use client";

import { useState, useTransition } from "react";
import { addDtfLink, deleteDtfLink } from "@/app/admin/actions";

interface DtfRow {
  id: string;
  order_id: string | null;
  order_item_id: string | null;
  dtf_url: string;
  label: string | null;
  day: string;
  status: string;
  created_at: string;
}

export function DtfQueue({ rows: initial }: { rows: DtfRow[] }) {
  const [rows] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const [newUrl, setNewUrl] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [error, setError] = useState("");

  // Group by day
  const days = [...new Set(rows.map((r) => r.day))];
  const [dayFilter, setDayFilter] = useState(days[0] ?? "");
  const filtered = dayFilter ? rows.filter((r) => r.day === dayFilter) : rows;

  // Detect admin (simple: if we can add/delete we're admin - the RLS handles security)
  const [isAdmin] = useState(true); // page is public, but actions require admin auth

  function handleAdd() {
    if (!newUrl.trim()) return;
    startTransition(async () => {
      try {
        await addDtfLink(newUrl.trim(), newLabel.trim());
        setNewUrl("");
        setNewLabel("");
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteDtfLink(id);
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050507",
        color: "#fff",
        padding: "40px 20px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 8 }}>
          Fila DTF — Impressão
        </h1>
        <p style={{ color: "#777", fontSize: "0.85rem", marginBottom: 24 }}>
          Baixe os arquivos de impressão DTF do dia. Cada linha = 1 impressão.
        </p>

        {error && (
          <div style={{ color: "#ff4444", marginBottom: 16, fontSize: "0.85rem" }}>
            {error}
          </div>
        )}

        {/* Day filter */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {days.map((d) => (
            <button
              key={d}
              onClick={() => setDayFilter(d)}
              style={{
                padding: "6px 16px",
                borderRadius: 20,
                border: dayFilter === d ? "1px solid #ff2d55" : "1px solid #2a2a3a",
                background: dayFilter === d ? "#1a0008" : "transparent",
                color: dayFilter === d ? "#ff2d55" : "#999",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              {new Date(d + "T12:00:00").toLocaleDateString("pt-BR", {
                weekday: "short",
                day: "2-digit",
                month: "2-digit",
              })}
              <span style={{ marginLeft: 6, opacity: 0.6 }}>
                ({rows.filter((r) => r.day === d).length})
              </span>
            </button>
          ))}
        </div>

        {/* Add link (admin) */}
        {isAdmin && (
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 24,
              flexWrap: "wrap",
              alignItems: "flex-end",
            }}
          >
            <input
              placeholder="URL do arquivo DTF"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="Label (opcional)"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              style={{ ...inputStyle, width: 200 }}
            />
            <button
              onClick={handleAdd}
              disabled={isPending || !newUrl.trim()}
              style={{
                padding: "10px 20px",
                borderRadius: 8,
                border: "none",
                background: "#ff2d55",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
                opacity: isPending ? 0.5 : 1,
              }}
            >
              + Adicionar
            </button>
          </div>
        )}

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.85rem",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid #1e1e2a" }}>
                <th style={th}>#</th>
                <th style={th}>Label</th>
                <th style={th}>Arquivo</th>
                <th style={th}>Status</th>
                {isAdmin && <th style={th}></th>}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: 40, color: "#555" }}>
                    Nenhum DTF na fila para este dia.
                  </td>
                </tr>
              )}
              {filtered.map((row, idx) => (
                <tr key={row.id} style={{ borderBottom: "1px solid #111" }}>
                  <td style={td}>{idx + 1}</td>
                  <td style={td}>{row.label ?? "—"}</td>
                  <td style={td}>
                    <a
                      href={row.dtf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      style={{ color: "#00ccff", textDecoration: "underline" }}
                    >
                      ⬇ Baixar
                    </a>
                  </td>
                  <td style={td}>
                    <span
                      style={{
                        color: row.status === "baixado" ? "#00ff88" : "#ffb020",
                        fontWeight: 600,
                      }}
                    >
                      {row.status === "baixado" ? "Baixado" : "Pendente"}
                    </span>
                  </td>
                  {isAdmin && (
                    <td style={td}>
                      <button
                        onClick={() => handleDelete(row.id)}
                        disabled={isPending}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ff4444",
                          cursor: "pointer",
                          fontSize: "0.8rem",
                        }}
                      >
                        ✕ Remover
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 200,
  background: "#0a0a0f",
  border: "1px solid #1e1e2a",
  borderRadius: 8,
  padding: "10px 14px",
  color: "#fff",
  fontSize: "0.85rem",
};

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 12px",
  color: "#666",
  fontWeight: 600,
  fontSize: "0.75rem",
  textTransform: "uppercase",
};

const td: React.CSSProperties = {
  padding: "12px",
};
