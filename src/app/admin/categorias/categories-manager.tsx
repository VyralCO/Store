"use client";

import { useState } from "react";
import { createCategory, updateCategory, deleteCategory } from "@/app/admin/actions";

interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export function CategoriesManager({ categories }: { categories: Category[] }) {
  const [modal, setModal] = useState<null | "create" | "edit" | "delete">(null);
  const [selected, setSelected] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    try {
      await createCategory(new FormData(e.currentTarget));
      setModal(null);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    try {
      await updateCategory(selected.id, new FormData(e.currentTarget));
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
      await deleteCategory(selected.id);
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
          Categorias
        </h1>
        <button className="adm-btn primary" onClick={() => { setSelected(null); setModal("create"); }}>
          + Nova Categoria
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="adm-empty">
          <h3>Nenhuma categoria cadastrada</h3>
          <p>Crie categorias para organizar suas estampas.</p>
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Slug</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600, color: "#fff" }}>{c.name}</td>
                  <td style={{ color: "#888" }}>{c.slug}</td>
                  <td>
                    <div className="adm-actions">
                      <button
                        className="adm-btn ghost sm"
                        onClick={() => { setSelected(c); setModal("edit"); }}
                      >
                        Editar
                      </button>
                      <button
                        className="adm-btn danger sm"
                        onClick={() => { setSelected(c); setModal("delete"); }}
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

      {/* Create modal */}
      {modal === "create" && (
        <div className="adm-modal-overlay" onClick={() => setModal(null)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Nova Categoria</h3>
            <form onSubmit={handleCreate} className="adm-form">
              <div className="adm-field">
                <label>Nome da Categoria</label>
                <input name="name" required placeholder="Ex: Streetwear, Anime, Meme..." />
              </div>
              <div className="adm-actions">
                <button type="submit" className="adm-btn primary" disabled={saving}>
                  {saving ? "Salvando..." : "Criar"}
                </button>
                <button type="button" className="adm-btn ghost" onClick={() => setModal(null)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {modal === "edit" && selected && (
        <div className="adm-modal-overlay" onClick={() => setModal(null)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Editar Categoria</h3>
            <form onSubmit={handleEdit} className="adm-form">
              <div className="adm-field">
                <label>Nome da Categoria</label>
                <input name="name" required defaultValue={selected.name} />
              </div>
              <div className="adm-actions">
                <button type="submit" className="adm-btn primary" disabled={saving}>
                  {saving ? "Salvando..." : "Salvar"}
                </button>
                <button type="button" className="adm-btn ghost" onClick={() => setModal(null)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {modal === "delete" && selected && (
        <div className="adm-modal-overlay" onClick={() => setModal(null)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Excluir Categoria</h3>
            <p style={{ color: "#ccc", marginBottom: 20 }}>
              Tem certeza que deseja excluir <strong>{selected.name}</strong>?
              Produtos dessa categoria ficarão sem categoria.
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
