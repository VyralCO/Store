"use client";

import { useState, useTransition } from "react";
import { formatMoney } from "@/lib/format";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  updateVariants,
} from "../actions";

interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  color: string;
  price: number;
  old_price: number | null;
  badge: string | null;
  badge_cyan: boolean;
  description: string;
  image_path: string;
  active: boolean;
}

interface Variant {
  size: string;
  stock: number;
}

const SIZES = ["P", "M", "G", "GG", "XG"];

export function ProductsManager({
  products: initial,
  variantsMap: initialVariants,
}: {
  products: Product[];
  variantsMap: Record<string, Variant[]>;
}) {
  const [products] = useState(initial);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [showVariants, setShowVariants] = useState<string | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function openVariants(productId: string) {
    const existing = initialVariants[productId] ?? SIZES.map((s) => ({ size: s, stock: 0 }));
    // Ensure all sizes are present
    const full = SIZES.map((s) => existing.find((v) => v.size === s) ?? { size: s, stock: 0 });
    setVariants(full);
    setShowVariants(productId);
  }

  function handleSaveVariants() {
    if (!showVariants) return;
    startTransition(async () => {
      try {
        await updateVariants(showVariants, variants);
        setShowVariants(null);
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  function handleCreate(formData: FormData) {
    setError("");
    startTransition(async () => {
      try {
        await createProduct(formData);
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
        await updateProduct(editing.id, formData);
        setEditing(null);
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Deletar este produto?")) return;
    startTransition(async () => {
      try {
        await deleteProduct(id);
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  return (
    <>
      <div className="adm-page-header">
        <h1 className="adm-page-title" style={{ marginBottom: 0 }}>
          Produtos
        </h1>
        <button className="adm-btn primary" onClick={() => setShowNew(true)}>
          + Novo Produto
        </button>
      </div>

      {error && <div className="adm-error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Imagem</th>
              <th>Nome</th>
              <th>Categoria</th>
              <th>Preço</th>
              <th>Badge</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", color: "#555" }}>
                  Nenhum produto cadastrado
                </td>
              </tr>
            )}
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.image_path}
                    alt={p.name}
                    className="adm-img-preview"
                    style={{ width: 48, height: 48 }}
                  />
                </td>
                <td style={{ fontWeight: 600, color: "#fff" }}>{p.name}</td>
                <td>{p.category}</td>
                <td>
                  {formatMoney(p.price)}
                  {p.old_price && (
                    <span
                      style={{
                        textDecoration: "line-through",
                        color: "#555",
                        marginLeft: 8,
                        fontSize: "0.75rem",
                      }}
                    >
                      {formatMoney(p.old_price)}
                    </span>
                  )}
                </td>
                <td>
                  {p.badge && (
                    <span className={`adm-status ${p.badge === "DROP" ? "paid" : p.badge === "HYPE" ? "producing" : "waiting"}`}>
                      {p.badge}
                    </span>
                  )}
                </td>
                <td>
                  <span className={`adm-status ${p.active ? "paid" : "cancelled"}`}>
                    {p.active ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td>
                  <div className="adm-actions">
                    <button className="adm-btn ghost sm" onClick={() => setEditing(p)}>
                      Editar
                    </button>
                    <button className="adm-btn ghost sm" onClick={() => openVariants(p.id)}>
                      Tamanhos
                    </button>
                    <button className="adm-btn danger sm" onClick={() => handleDelete(p.id)}>
                      ×
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Product Modal */}
      {showNew && (
        <div className="adm-modal-overlay" onClick={() => setShowNew(false)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Novo Produto</h3>
            <form className="adm-form" action={handleCreate}>
              <ProductForm />
              <div className="adm-actions">
                <button type="submit" className="adm-btn primary" disabled={isPending}>
                  {isPending ? "Salvando..." : "Criar Produto"}
                </button>
                <button type="button" className="adm-btn ghost" onClick={() => setShowNew(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editing && (
        <div className="adm-modal-overlay" onClick={() => setEditing(null)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Editar Produto</h3>
            <form className="adm-form" action={handleUpdate}>
              <ProductForm product={editing} />
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

      {/* Variants Modal */}
      {showVariants && (
        <div className="adm-modal-overlay" onClick={() => setShowVariants(null)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Tamanhos e Estoque</h3>
            <div className="adm-form">
              {variants.map((v, i) => (
                <div key={v.size} className="adm-field-row">
                  <div className="adm-field">
                    <label>Tamanho</label>
                    <input value={v.size} disabled />
                  </div>
                  <div className="adm-field">
                    <label>Estoque</label>
                    <input
                      type="number"
                      min={0}
                      value={v.stock}
                      onChange={(e) => {
                        const copy = [...variants];
                        copy[i] = { ...v, stock: Number(e.target.value) };
                        setVariants(copy);
                      }}
                    />
                  </div>
                </div>
              ))}
              <div className="adm-actions">
                <button
                  type="button"
                  className="adm-btn primary"
                  disabled={isPending}
                  onClick={handleSaveVariants}
                >
                  {isPending ? "Salvando..." : "Salvar Estoque"}
                </button>
                <button
                  type="button"
                  className="adm-btn ghost"
                  onClick={() => setShowVariants(null)}
                >
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

function ProductForm({ product }: { product?: Product }) {
  return (
    <>
      <div className="adm-field-row">
        <div className="adm-field">
          <label>Nome</label>
          <input name="name" required defaultValue={product?.name} placeholder="SEM PACIÊNCIA" />
        </div>
        <div className="adm-field">
          <label>Slug</label>
          <input
            name="slug"
            required
            defaultValue={product?.slug}
            placeholder="sem-paciencia"
            disabled={!!product}
          />
        </div>
      </div>
      <div className="adm-field-row">
        <div className="adm-field">
          <label>Categoria</label>
          <input name="category" required defaultValue={product?.category} placeholder="Oversized · Preta" />
        </div>
        <div className="adm-field">
          <label>Cor</label>
          <select name="color" defaultValue={product?.color ?? "preta"}>
            <option value="preta">Preta</option>
            <option value="branca">Branca</option>
            <option value="meme">Meme</option>
          </select>
        </div>
      </div>
      <div className="adm-field-row">
        <div className="adm-field">
          <label>Preço (R$)</label>
          <input name="price" type="number" step="0.01" required defaultValue={product?.price} />
        </div>
        <div className="adm-field">
          <label>Preço Antigo (R$)</label>
          <input name="old_price" type="number" step="0.01" defaultValue={product?.old_price ?? ""} />
        </div>
      </div>
      <div className="adm-field-row">
        <div className="adm-field">
          <label>Badge</label>
          <select name="badge" defaultValue={product?.badge ?? ""}>
            <option value="">Nenhum</option>
            <option value="DROP">DROP</option>
            <option value="HYPE">HYPE</option>
            <option value="MEME">MEME</option>
          </select>
        </div>
        <div className="adm-field">
          <label>Badge Cyan?</label>
          <input name="badge_cyan" type="checkbox" defaultChecked={product?.badge_cyan} />
        </div>
      </div>
      <div className="adm-field">
        <label>Descrição</label>
        <textarea name="description" required defaultValue={product?.description} />
      </div>
      <div className="adm-field">
        <label>Caminho da Imagem</label>
        <input name="image_path" defaultValue={product?.image_path} placeholder="/assets/produtos/slug.jpg" />
      </div>
      <div className="adm-field">
        <label>
          <input name="active" type="checkbox" defaultChecked={product?.active ?? true} />{" "}
          Ativo (visível na loja)
        </label>
      </div>
    </>
  );
}
