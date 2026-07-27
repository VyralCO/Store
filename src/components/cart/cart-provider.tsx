"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { BUSINESS, calculateShipping } from "@/lib/format";

/** Item da sacola (persistido em localStorage). */
export interface CartLine {
  /** Chave única: slug + tamanho + cor (ou custom-<timestamp> para personalizadas). */
  key: string;
  slug: string;
  name: string;
  price: number;
  size: string;
  color?: string;
  qty: number;
  /** Imagem exibida no thumbnail do carrinho/checkout. */
  imagePath: string;
  /** Item personalizado (Monte a sua)? */
  custom?: boolean;
  /**
   * PREVIEW — versão SEM FUNDO (@imgly/background-removal), cosmética/descartável.
   * Usada apenas para exibir o mockup nos cards. Pode ser efêmera.
   */
  previewUrl?: string;
  /**
   * PRODUÇÃO — referência ao arquivo ORIGINAL intacto do cliente (blob URL em sessão).
   * É esta arte, sem processamento, que vai para impressão.
   */
  originalUrl?: string;
  /** Nome do arquivo original enviado pelo cliente. */
  originalFileName?: string;
}

/** Dados necessários para adicionar um item. */
export interface AddToCartInput {
  /** Chave explícita (usada por itens personalizados). Se ausente, usa slug-size-color. */
  key?: string;
  slug: string;
  name: string;
  price: number;
  size: string;
  color?: string;
  qty: number;
  imagePath: string;
  custom?: boolean;
  previewUrl?: string;
  originalUrl?: string;
  originalFileName?: string;
  /**
   * Arquivo ORIGINAL intacto (produção). Mantido apenas em memória por enquanto —
   * NÃO é serializado no localStorage. Ver TODO de Supabase Storage em addItem.
   */
  originalFile?: File;
}

interface CartContextValue {
  items: CartLine[];
  count: number;
  subtotal: number;
  shipping: number;
  total: number;
  addItem: (input: AddToCartInput) => void;
  removeItem: (key: string) => void;
  changeQty: (key: string, delta: number) => void;
  clear: () => void;
  toast: (message: string) => void;
  /** Recupera o arquivo ORIGINAL (produção) de um item personalizado, se ainda em memória. */
  getOriginalFile: (key: string) => File | undefined;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "vyral:cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastShow, setToastShow] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Arquivos ORIGINAIS (produção) das peças personalizadas — SOMENTE em memória.
   * Não vão para o localStorage (File não é serializável) e não sobrevivem a um
   * reload. É o repositório temporário até o Supabase Storage entrar (ver TODO em addItem).
   */
  const customOriginals = useRef<Map<string, File>>(new Map());

  // Carrega do localStorage no mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed as CartLine[]);
      }
    } catch {
      /* ignora dados corrompidos */
    }
    setHydrated(true);
  }, []);

  // Persiste sempre que muda (após hidratar).
  useEffect(() => {
    if (!hydrated) return;
    try {
      // NB: para itens personalizados persistimos só os metadados. O arquivo
      // original (File) fica na ref em memória; blob URLs são efêmeras.
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage indisponível */
    }
  }, [items, hydrated]);

  const toast = useCallback((message: string) => {
    setToastMsg(message);
    setToastShow(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastShow(false), 2600);
  }, []);

  const addItem = useCallback(
    (input: AddToCartInput) => {
      const key = input.key ?? `${input.slug}-${input.size}-${input.color ?? 'preta'}`;

      // Extrai o File (não serializável) da linha persistida e guarda em memória.
      const { originalFile, ...line } = input;
      if (input.custom && originalFile) {
        customOriginals.current.set(key, originalFile);

        // ─────────────────────────────────────────────────────────────────
        // TODO(Supabase Storage): quando o Storage estiver conectado, é AQUI
        // que o arquivo ORIGINAL intacto (`originalFile`) deve ser enviado a um
        // bucket PRIVADO — ex.: `custom-orders/${key}/${originalFile.name}` —
        // e a URL/objeto retornado guardado no item (ex.: line.originalUrl =
        // caminho no bucket privado). NUNCA usar bucket público para o original.
        // O preview sem fundo (previewUrl) pode continuar efêmero/descartável.
        // Ex.:
        //   const admin = ... // upload server-side (service_role), via route handler
        //   await admin.storage.from('custom-orders').upload(path, originalFile, { upsert: true })
        // ─────────────────────────────────────────────────────────────────
      }

      setItems((prev) => {
        const found = prev.find((i) => i.key === key);
        if (found) {
          return prev.map((i) =>
            i.key === key ? { ...i, qty: i.qty + input.qty } : i,
          );
        }
        return [...prev, { ...line, key }];
      });
      toast(`${input.name} na sacola`);
    },
    [toast],
  );

  const removeItem = useCallback((key: string) => {
    customOriginals.current.delete(key);
    setItems((prev) => prev.filter((i) => i.key !== key));
  }, []);

  const getOriginalFile = useCallback(
    (key: string) => customOriginals.current.get(key),
    [],
  );

  const changeQty = useCallback((key: string, delta: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.key === key ? { ...i, qty: Math.max(1, i.qty + delta) } : i,
      ),
    );
  }, []);

  const clear = useCallback(() => {
    customOriginals.current.clear();
    setItems([]);
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((a, i) => a + i.qty, 0);
    const subtotal = items.reduce((a, i) => a + i.price * i.qty, 0);
    const shipping = items.length === 0 ? 0 : calculateShipping(subtotal);
    return {
      items,
      count,
      subtotal,
      shipping,
      total: subtotal + shipping,
      addItem,
      removeItem,
      changeQty,
      clear,
      toast,
      getOriginalFile,
    };
  }, [items, addItem, removeItem, changeQty, clear, toast, getOriginalFile]);

  return (
    <CartContext.Provider value={value}>
      {children}
      <div id="toast" className={toastShow ? "show" : ""} role="status" aria-live="polite">
        {toastMsg}
      </div>
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart precisa estar dentro de <CartProvider>");
  return ctx;
}

// Reexporta para consumidores que precisem dos tamanhos.
export const CART_SIZES = BUSINESS.SIZES;
