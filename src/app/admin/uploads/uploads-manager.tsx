"use client";

import { useState, useTransition } from "react";
import { updateUploadStatus } from "../actions";

interface Upload {
  id: string;
  customer_email: string | null;
  original_path: string;
  preview_path: string | null;
  file_name: string;
  status: string;
  rejection_reason: string | null;
  created_at: string;
}

export function UploadsManager({ uploads: initial }: { uploads: Upload[] }) {
  const [uploads] = useState(initial);
  const [filter, setFilter] = useState("all");
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const filtered =
    filter === "all" ? uploads : uploads.filter((u) => u.status === filter);

  const counts = {
    all: uploads.length,
    pending: uploads.filter((u) => u.status === "pending").length,
    approved: uploads.filter((u) => u.status === "approved").length,
    rejected: uploads.filter((u) => u.status === "rejected").length,
  };

  function handleApprove(id: string) {
    startTransition(async () => {
      try {
        await updateUploadStatus(id, "approved");
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

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

  return (
    <>
      <h1 className="adm-page-title">Uploads de Clientes</h1>

      {error && <div className="adm-error" style={{ marginBottom: 16 }}>{error}</div>}

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
              <th>Status</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "#555" }}>
                  Nenhum upload encontrado
                </td>
              </tr>
            )}
            {filtered.map((u) => (
              <tr key={u.id}>
                <td>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={u.preview_path ?? u.original_path}
                    alt={u.file_name}
                    className="adm-img-preview"
                  />
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: "#fff" }}>
                    {u.file_name}
                  </div>
                  <a
                    href={u.original_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: "0.7rem", color: "#ff2d55" }}
                  >
                    Baixar original ↗
                  </a>
                </td>
                <td>{u.customer_email ?? "—"}</td>
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
                  {u.status === "pending" && (
                    <div className="adm-actions">
                      <button
                        className="adm-btn primary sm"
                        onClick={() => handleApprove(u.id)}
                        disabled={isPending}
                      >
                        Aprovar
                      </button>
                      <button
                        className="adm-btn danger sm"
                        onClick={() => setRejectId(u.id)}
                      >
                        Rejeitar
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
