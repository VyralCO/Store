"use client";

import { useState, useTransition } from "react";
import {
  updateUploadStatus,
  processCustomUpload,
  updateCustomPricing,
  uploadFileToStorage,
} from "../actions";

interface Upload {
  id: string;
  customer_email: string | null;
  original_path: string;
  preview_path: string | null;
  file_name: string;
  status: string;
  rejection_reason: string | null;
  created_at: string;
  layout: string | null;
  color: string | null;
  size: string | null;
  price: number | null;
  dtf_file_path: string | null;
  order_id: string | null;
}

const LAYOUT_LABEL: Record<string, string> = {
  center: "Centralizada",
  full: "Full",
};

export function UploadsManager({
  uploads: initial,
  pricing,
}: {
  uploads: Upload[];
  pricing: { center: number; full: number };
}) {
  const [uploads] = useState(initial);
  const [filter, setFilter] = useState("all");
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  // pricing
  const [center, setCenter] = useState(pricing.center);
  const [full, setFull] = useState(pricing.full);
  const [savingPrice, setSavingPrice] = useState(false);
  const [priceMsg, setPriceMsg] = useState("");

  // DTF upload dentro do modal
  const [uploadingDtf, setUploadingDtf] = useState(false);

  const detail = uploads.find((u) => u.id === detailId) ?? null;

  const filtered =
    filter === "all" ? uploads : uploads.filter((u) => u.status === filter);

  const counts = {
    all: uploads.length,
    pending: uploads.filter((u) => u.status === "pending").length,
    approved: uploads.filter((u) => u.status === "approved").length,
    rejected: uploads.filter((u) => u.status === "rejected").length,
  };

  function handleReject() {
    if (!rejectId) return;
    startTransition(async () => {
      try {
        await updateUploadStatus(rejectId, "rejected", rejectReason);
        setRejectId(null);
        setRejectReason("");
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  async function savePricing() {
    setSavingPrice(true);
    setPriceMsg("");
    try {
      await updateCustomPricing(center, full);
      setPriceMsg("Preços salvos!");
    } catch (e) {
      setPriceMsg((e as Error).message);
    } finally {
      setSavingPrice(false);
    }
  }

  async function handleDtfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !detail) return;
    setUploadingDtf(true);
    setError("");
    try {
      const ext = file.name.split(".").pop() ?? "png";
      const path = `dtf/${detail.id}-${Date.now()}.${ext}`;
      const fd = new FormData();
      fd.append("file", file);
      const url = await uploadFileToStorage("designs-public", path, fd);
      await processCustomUpload(detail.id, url);
      setDetailId(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploadingDtf(false);
    }
  }

  return (
    <>
      <h1 className="adm-page-title">Uploads de Clientes</h1>

      {error && <div className="adm-error" style={{ marginBottom: 16 }}>{error}</div>}

      {/* Preços das artes personalizadas */}
      <div
        style={{
          background: "#0d0d14",
          border: "1px solid #1e1e2a",
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
        }}
      >
        <h2 style={{ color: "#fff", fontSize: "1rem", marginBottom: 4 }}>
          Preços da arte personalizada
        </h2>
        <p style={{ color: "#777", fontSize: "0.8rem", marginBottom: 16 }}>
          Valores cobrados no personalizador conforme o layout escolhido pelo cliente.
        </p>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div className="adm-field" style={{ margin: 0 }}>
            <label>Centralizada (R$)</label>
            <input
              type="number"
              min={0}
              value={center}
              onChange={(e) => setCenter(Number(e.target.value))}
              style={priceInput}
            />
          </div>
          <div className="adm-field" style={{ margin: 0 }}>
            <label>Full (R$)</label>
            <input
              type="number"
              min={0}
              value={full}
              onChange={(e) => setFull(Number(e.target.value))}
              style={priceInput}
            />
          </div>
          <button className="adm-btn primary" onClick={savePricing} disabled={savingPrice}>
            {savingPrice ? "Salvando..." : "Salvar Preços"}
          </button>
          {priceMsg && (
            <span style={{ color: priceMsg.includes("!") ? "#00ff88" : "#ff4444", fontSize: "0.8rem" }}>
              {priceMsg}
            </span>
          )}
        </div>
      </div>

      <div className="adm-filters">
        {(["all", "pending", "approved", "rejected"] as const).map((f) => (
          <button
            key={f}
            className={`adm-filter-btn ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "Todos" : f === "pending" ? "Pendentes" : f === "approved" ? "Aprovados" : "Rejeitados"}{" "}
            ({counts[f]})
          </button>
        ))}
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Preview</th>
              <th>Arquivo</th>
              <th>Cliente</th>
              <th>Layout</th>
              <th>Status</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", color: "#555" }}>
                  Nenhum upload encontrado
                </td>
              </tr>
            )}
            {filtered.map((u) => (
              <tr
                key={u.id}
                onClick={() => setDetailId(u.id)}
                style={{ cursor: "pointer" }}
              >
                <td>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={u.preview_path ?? u.original_path}
                    alt={u.file_name}
                    className="adm-img-preview"
                  />
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: "#fff" }}>{u.file_name}</div>
                  {u.dtf_file_path && (
                    <span style={{ fontSize: "0.7rem", color: "#00ff88" }}>DTF pronto ✓</span>
                  )}
                </td>
                <td>{u.customer_email ?? "—"}</td>
                <td>
                  {u.layout ? LAYOUT_LABEL[u.layout] ?? u.layout : "—"}
                  {u.color && (
                    <div style={{ fontSize: "0.7rem", color: "#777" }}>
                      {u.color} · {u.size}
                    </div>
                  )}
                </td>
                <td>
                  <span className={`adm-status ${u.status}`}>{u.status}</span>
                  {u.rejection_reason && (
                    <div style={{ fontSize: "0.7rem", color: "#ff4444", marginTop: 4 }}>
                      {u.rejection_reason}
                    </div>
                  )}
                </td>
                <td>{new Date(u.created_at).toLocaleDateString("pt-BR")}</td>
                <td>
                  <button
                    className="adm-btn ghost sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDetailId(u.id);
                    }}
                  >
                    Detalhes
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className="adm-modal-overlay" onClick={() => setDetailId(null)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <h3>Arte personalizada</h3>
            <div style={{ display: "flex", gap: 20, marginTop: 12, flexWrap: "wrap" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={detail.preview_path ?? detail.original_path}
                alt={detail.file_name}
                style={{
                  width: 180,
                  height: 180,
                  objectFit: "contain",
                  background: "#000",
                  borderRadius: 12,
                  border: "1px solid #1e1e2a",
                }}
              />
              <div style={{ flex: 1, minWidth: 200, color: "#ccc", fontSize: "0.85rem", lineHeight: 1.9 }}>
                <div><strong>Arquivo:</strong> {detail.file_name}</div>
                <div><strong>Cliente:</strong> {detail.customer_email ?? "—"}</div>
                <div>
                  <strong>Layout:</strong>{" "}
                  {detail.layout ? LAYOUT_LABEL[detail.layout] ?? detail.layout : "—"}
                </div>
                <div><strong>Cor:</strong> {detail.color ?? "—"}</div>
                <div><strong>Tamanho:</strong> {detail.size ?? "—"}</div>
                {detail.price != null && (
                  <div><strong>Valor:</strong> R$ {detail.price.toFixed(2)}</div>
                )}
                <div>
                  <strong>Status:</strong>{" "}
                  <span className={`adm-status ${detail.status}`}>{detail.status}</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
              <a
                href={detail.original_path}
                target="_blank"
                rel="noopener noreferrer"
                className="adm-btn primary"
                style={{ textAlign: "center", textDecoration: "none" }}
              >
                ⬇ Baixar imagem do cliente
              </a>

              {detail.dtf_file_path ? (
                <a
                  href={detail.dtf_file_path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="adm-btn ghost"
                  style={{ textAlign: "center", textDecoration: "none" }}
                >
                  Ver arquivo DTF enviado ↗
                </a>
              ) : (
                <div
                  style={{
                    border: "1px dashed #2a2a3a",
                    borderRadius: 12,
                    padding: 20,
                    textAlign: "center",
                  }}
                >
                  <p style={{ color: "#aaa", fontSize: "0.85rem", marginBottom: 12 }}>
                    Faça o upload do arquivo DTF de impressão tratado. Isso libera o
                    pedido para pagamento.
                  </p>
                  <label className="adm-btn primary" style={{ cursor: "pointer" }}>
                    {uploadingDtf ? "Enviando..." : "Enviar arquivo DTF"}
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      hidden
                      disabled={uploadingDtf}
                      onChange={handleDtfUpload}
                    />
                  </label>
                </div>
              )}

              {detail.status === "pending" && (
                <button
                  className="adm-btn danger"
                  onClick={() => {
                    setRejectId(detail.id);
                    setDetailId(null);
                  }}
                >
                  Rejeitar arte
                </button>
              )}

              <button className="adm-btn ghost" onClick={() => setDetailId(null)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectId && (
        <div className="adm-modal-overlay" onClick={() => setRejectId(null)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Rejeitar Upload</h3>
            <div className="adm-form">
              <div className="adm-field">
                <label>Motivo da rejeição</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Ex: Resolução muito baixa para impressão DTF"
                />
              </div>
              <div className="adm-actions">
                <button
                  className="adm-btn danger"
                  onClick={handleReject}
                  disabled={isPending}
                >
                  {isPending ? "Rejeitando..." : "Confirmar Rejeição"}
                </button>
                <button className="adm-btn ghost" onClick={() => setRejectId(null)}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const priceInput: React.CSSProperties = {
  width: 120,
  background: "#0a0a0f",
  border: "1px solid #1e1e2a",
  borderRadius: 8,
  padding: "8px 12px",
  color: "#fff",
  fontSize: "1rem",
};
