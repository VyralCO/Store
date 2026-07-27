"use client";

import { useState } from "react";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  uploadFileToStorage,
} from "../actions";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductRow {
  id: string;
  slug: string;
  name: string;
  category_id: string | null;
  price: number;
  old_price: number | null;
  badge: string | null;
  badge_cyan: boolean;
  description: string;
  keywords: string | null;
  available_black: boolean;
  available_white: boolean;
  dtf_black_path: string | null;
  dtf_white_path: string | null;
  mockup_black_path: string | null;
  mockup_white_path: string | null;
  active: boolean;
  created_at: string;
  categories: { name: string } | null;
}

type ModalMode = null | "create" | "edit" | "delete";

export function ProductsManager({
  products,
  categories,
}: {
  products: ProductRow[];
  categories: Category[];
}) {
  const [modal, setModal] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<ProductRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  const filtered = products.filter((p) => {
    if (filter === "active") return p.active;
    if (filter === "inactive") return !p.active;
    return true;
  });

  async function handleCreate(fd: FormData) {
    setSaving(true);
    try {
      await createProduct(fd);
      setModal(null);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(fd: FormData) {
    if (!selected) return;
    setSaving(true);
    try {
      await updateProduct(selected.id, fd);
      setModal(null);
      setSelected(null);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selected) return;
    setSaving(true);
    try {
      await deleteProduct(selected.id);
      setModal(null);
      setSelected(null);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="adm-page-header">
        <h1 className="adm-page-title" style={{ marginBottom: 0 }}>
          Produtos (Estampas)
        </h1>
        <button className="adm-btn primary" onClick={() => { setSelected(null); setModal("create"); }}>
          + Nova Estampa
        </button>
      </div>

      <div className="adm-filters">
        {(["all", "active", "inactive"] as const).map((f) => (
          <button
            key={f}
            className={`adm-filter-btn${filter === f ? " active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "Todos" : f === "active" ? "Ativos" : "Inativos"} ({
              f === "all" ? products.length : products.filter((p) => f === "active" ? p.active : !p.active).length
            })
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="adm-empty">
          <h3>Nenhum produto cadastrado</h3>
          <p>Clique em &quot;+ Nova Estampa&quot; para começar.</p>
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Mockup</th>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Preço</th>
                <th>Cores</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    {(p.mockup_black_path || p.mockup_white_path) ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={p.mockup_black_path || p.mockup_white_path || ""}
                        alt={p.name}
                        className="adm-img-preview"
                      />
                    ) : (
                      <span style={{ color: "#555" }}>—</span>
                    )}
                  </td>
                  <td style={{ fontWeight: 600, color: "#fff" }}>{p.name}</td>
                  <td>{p.categories?.name ?? "—"}</td>
                  <td>R$ {Number(p.price).toFixed(2)}</td>
                  <td>
                    {p.available_black && <span style={{ marginRight: 4 }}>🖤</span>}
                    {p.available_white && <span>🤍</span>}
                    {!p.available_black && !p.available_white && "—"}
                  </td>
                  <td>
                    <span className={`adm-status ${p.active ? "paid" : "cancelled"}`}>
                      {p.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td>
                    <div className="adm-actions">
                      <button
                        className="adm-btn ghost sm"
                        onClick={() => { setSelected(p); setModal("edit"); }}
                      >
                        Editar
                      </button>
                      <button
                        className="adm-btn danger sm"
                        onClick={() => { setSelected(p); setModal("delete"); }}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {(modal === "create" || modal === "edit") && (
        <ProductModal
          mode={modal}
          product={selected}
          categories={categories}
          saving={saving}
          onSubmit={modal === "create" ? handleCreate : handleEdit}
          onClose={() => { setModal(null); setSelected(null); }}
        />
      )}

      {/* DELETE MODAL */}
      {modal === "delete" && selected && (
        <div className="adm-modal-overlay" onClick={() => setModal(null)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Excluir Produto</h3>
            <p style={{ color: "#ccc", marginBottom: 20 }}>
              Tem certeza que deseja excluir <strong>{selected.name}</strong>?
            </p>
            <div className="adm-actions">
              <button className="adm-btn danger" onClick={handleDelete} disabled={saving}>
                {saving ? "Excluindo..." : "Excluir"}
              </button>
              <button className="adm-btn ghost" onClick={() => setModal(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ───────────── PRODUCT MODAL ───────────── */

function ProductModal({
  mode,
  product,
  categories,
  saving,
  onSubmit,
  onClose,
}: {
  mode: "create" | "edit";
  product: ProductRow | null;
  categories: Category[];
  saving: boolean;
  onSubmit: (fd: FormData) => void;
  onClose: () => void;
}) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [paths, setPaths] = useState({
    dtf_black_path: product?.dtf_black_path ?? "",
    dtf_white_path: product?.dtf_white_path ?? "",
    mockup_black_path: product?.mockup_black_path ?? "",
    mockup_white_path: product?.mockup_white_path ?? "",
  });

  async function handleFileUpload(field: keyof typeof paths, file: File) {
    setUploading(field);
    try {
      const bucket = field.startsWith("dtf") ? "designs-public" : "products-public";
      const folder = field.startsWith("dtf") ? "dtf" : "mockups";
      const path = `${folder}/${Date.now()}-${file.name}`;
      const fd = new FormData();
      fd.set("file", file);
      const url = await uploadFileToStorage(bucket, path, fd);
      setPaths((prev) => ({ ...prev, [field]: url }));
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setUploading(null);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("dtf_black_path", paths.dtf_black_path);
    fd.set("dtf_white_path", paths.dtf_white_path);
    fd.set("mockup_black_path", paths.mockup_black_path);
    fd.set("mockup_white_path", paths.mockup_white_path);
    onSubmit(fd);
  }

  const uploads: { key: keyof typeof paths; label: string; internal: boolean }[] = [
    { key: "dtf_black_path", label: "DTF Preta (interno)", internal: true },
    { key: "dtf_white_path", label: "DTF Branca (interno)", internal: true },
    { key: "mockup_black_path", label: "Mockup Camiseta Preta", internal: false },
    { key: "mockup_white_path", label: "Mockup Camiseta Branca", internal: false },
  ];

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <h3>{mode === "create" ? "Nova Estampa" : "Editar Estampa"}</h3>

        <form onSubmit={handleSubmit} className="adm-form" style={{ maxWidth: "none" }}>
          <div className="adm-field-row">
            <div className="adm-field">
              <label>Nome</label>
              <input name="name" required defaultValue={product?.name ?? ""} />
            </div>
            <div className="adm-field">
              <label>Slug</label>
              <input
                name="slug"
                required
                defaultValue={product?.slug ?? ""}
                readOnly={mode === "edit"}
                style={mode === "edit" ? { opacity: 0.5 } : undefined}
              />
            </div>
          </div>

          <div className="adm-field-row">
            <div className="adm-field">
              <label>Categoria</label>
              <select name="category_id" defaultValue={product?.category_id ?? ""}>
                <option value="">Sem categoria</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="adm-field">
              <label>Badge</label>
              <select name="badge" defaultValue={product?.badge ?? ""}>
                <option value="">Nenhum</option>
                <option value="DROP">DROP</option>
                <option value="HYPE">HYPE</option>
                <option value="MEME">MEME</option>
                <option value="NEW">NEW</option>
              </select>
            </div>
          </div>

          <div className="adm-field-row">
            <div className="adm-field">
              <label>Preço</label>
              <input name="price" type="number" step="0.01" required defaultValue={product?.price ?? ""} />
            </div>
            <div className="adm-field">
              <label>Preço Antigo (riscado)</label>
              <input name="old_price" type="number" step="0.01" defaultValue={product?.old_price ?? ""} />
            </div>
          </div>

          <div className="adm-field">
            <label>Descrição</label>
            <textarea name="description" required defaultValue={product?.description ?? ""} />
          </div>

          <div className="adm-field">
            <label>Palavras-chave (separadas por vírgula)</label>
            <input name="keywords" placeholder="ex: caveira, dark, streetwear, oversized" defaultValue={product?.keywords ?? ""} />
          </div>

          <div style={{ display: "flex", gap: 24 }}>
            <label style={{ color: "#ccc", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input type="checkbox" name="available_black" defaultChecked={product?.available_black ?? true} />
              🖤 Disponível na Preta
            </label>
            <label style={{ color: "#ccc", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input type="checkbox" name="available_white" defaultChecked={product?.available_white ?? false} />
              🤍 Disponível na Branca
            </label>
          </div>

          <label style={{ color: "#ccc", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input type="checkbox" name="badge_cyan" defaultChecked={product?.badge_cyan ?? false} />
            Badge Cyan (azul)
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {uploads.map((u) => (
              <div key={u.key} className="adm-field">
                <label>
                  {u.label}
                  {u.internal && <span style={{ color: "#ff2d55", fontSize: "0.65rem", marginLeft: 6 }}>INTERNO</span>}
                </label>
                {paths[u.key] && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={paths[u.key]} alt={u.label} className="adm-img-preview lg" style={{ width: "100%", height: 140, objectFit: "cover" }} />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(u.key, file);
                  }}
                  disabled={uploading !== null}
                />
                {uploading === u.key && <span style={{ color: "#ffcc00", fontSize: "0.75rem" }}>Enviando...</span>}
              </div>
            ))}
          </div>

          <div className="adm-actions" style={{ marginTop: 8 }}>
            <button type="submit" className="adm-btn primary" disabled={saving || uploading !== null}>
              {saving ? "Salvando..." : mode === "create" ? "Criar Estampa" : "Salvar"}
            </button>
            <button type="button" className="adm-btn ghost" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
