"use client";

import { useState, useTransition } from "react";
import { createDesign, updateDesign, deleteDesign } from "../actions";

interface Design {
  id: string;
  name: string;
  category: string;
  image_path: string;
  active: boolean;
  created_at: string;
}

export function DesignsManager({ designs: initial }: { designs: Design[] }) {
  const [designs] = useState(initial);
  const [editing, setEditing] = useState<Design | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const categories = [...new Set(designs.map((d) => d.category))];
  const filtered =
    filter === "all" ? designs : designs.filter((d) => d.category === filter);

  function handleCreate(formData: FormData) {
    setError("");
    startTransition(async () => {
      try {
        await createDesign(formData);
        setShowNew(false);
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  function handleUpdate(formData: FormData) {
    if (!editing) return;
    setError("");
    startTransition(async () => {
      try {
        await updateDesign(editing.id, formData);
        setEditing(null);
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Deletar esta estampa?")) return;
    startTransition(async () => {
      try {
        await deleteDesign(id);
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  return (
    <>
      <div className="adm-page-header">
        <h1 className="adm-page-title" style={{ marginBottom: 0 }}>
          Estampas ({designs.length})
        </h1>
        <button className="adm-btn primary" onClick={() => setShowNew(true)}>
          + Nova Estampa
        </button>
      </div>

      {error && <div className="adm-error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="adm-filters">
        <button
          className={`adm-filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          Todas
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`adm-filter-btn ${filter === cat ? "active" : ""}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 16,
        }}
      >
        {filtered.map((d) => (
          <div key={d.id} className="adm-card" style={{ padding: 0, overflow: "hidden" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={d.image_path}
              alt={d.name}
              style={{ width: "100%", height: 180, objectFit: "cover" }}
            />
            <div style={{ padding: 14 }}>
              <div style={{ fontWeight: 600, color: "#fff", fontSize: "0.9rem" }}>
                {d.name}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#666", margin: "4px 0 8px" }}>
                {d.category}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className={`adm-status ${d.active ? "paid" : "cancelled"}`}>
                  {d.active ? "Ativa" : "Inativa"}
                </span>
                <div className="adm-actions">
                  <button className="adm-btn ghost sm" onClick={() => setEditing(d)}>
                    Editar
                  </button>
                  <button className="adm-btn danger sm" onClick={() => handleDelete(d.id)}>
                    ×
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="adm-empty">
          <h3>Nenhuma estampa encontrada</h3>
          <p>Cadastre estampas para disponibilizar na personalização</p>
        </div>
      )}

      {/* New Design Modal */}
      {showNew && (
        <div className="adm-modal-overlay" onClick={() => setShowNew(false)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Nova Estampa</h3>
            <form className="adm-form" action={handleCreate}>
              <DesignForm />
              <div className="adm-actions">
                <button type="submit" className="adm-btn primary" disabled={isPending}>
                  {isPending ? "Salvando..." : "Criar Estampa"}
                </button>
                <button type="button" className="adm-btn ghost" onClick={() => setShowNew(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Design Modal */}
      {editing && (
        <div className="adm-modal-overlay" onClick={() => setEditing(null)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Editar Estampa</h3>
            <form className="adm-form" action={handleUpdate}>
              <DesignForm design={editing} />
              <div className="adm-actions">
                <button type="submit" className="adm-btn primary" disabled={isPending}>
                  {isPending ? "Salvando..." : "Salvar"}
                </button>
                <button type="button" className="adm-btn ghost" onClick={() => setEditing(null)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function DesignForm({ design }: { design?: Design }) {
  return (
    <>
      <div className="adm-field">
        <label>Nome da Estampa</label>
        <input name="name" required defaultValue={design?.name} placeholder="Nome da estampa" />
      </div>
      <div className="adm-field">
        <label>Categoria</label>
        <input
          name="category"
          required
          defaultValue={design?.category ?? "geral"}
          placeholder="anime, meme, minimalista..."
        />
      </div>
      <div className="adm-field">
        <label>Caminho da Imagem</label>
        <input
          name="image_path"
          required
          defaultValue={design?.image_path}
          placeholder="/assets/estampas/nome.png ou URL do Storage"
        />
      </div>
      <div className="adm-field">
        <label>
          <input name="active" type="checkbox" defaultChecked={design?.active ?? true} />{" "}
          Ativa (visível na galeria)
        </label>
      </div>
    </>
  );
}
