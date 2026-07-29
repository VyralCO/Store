"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formatMoney, BUSINESS } from "@/lib/format";
import { useCart } from "@/components/cart/cart-provider";

/**
 * Singletons em escopo de módulo: o módulo e o modelo do @imgly/background-removal
 * são carregados UMA vez e reutilizados entre uploads (não recarrega a cada foto).
 */
type BgModule = typeof import("@imgly/background-removal");
let bgModulePromise: Promise<BgModule> | null = null;
let bgPreloadPromise: Promise<void> | null = null;

function getBgModule(): Promise<BgModule> {
  if (!bgModulePromise) bgModulePromise = import("@imgly/background-removal");
  return bgModulePromise;
}

/** Inicializa (baixa) o modelo em background. Idempotente. */
function ensureBgPreloaded(): Promise<void> {
  if (!bgPreloadPromise) {
    bgPreloadPromise = getBgModule()
      .then((mod) => mod.preload())
      .catch((err) => {
        console.warn("[customizer] preload do modelo falhou (segue sob demanda):", err);
        bgPreloadPromise = null; // permite retry no uso real
      });
  }
  return bgPreloadPromise;
}

/** Resolução mínima recomendada (lado maior) para boa impressão. */
const MIN_PRINT_SIDE = 1000;

interface ShirtColor {
  bg: string;
  collar: string;
  stroke: string;
}

const COLORS: ShirtColor[] = [
  { bg: "#0c0c10", collar: "#141419", stroke: "#1c1c24" },
  { bg: "#e8e8e6", collar: "#dad9d5", stroke: "#cfcfca" },
];

type PrintLayout = "center" | "full";
const LAYOUTS: { value: PrintLayout; label: string; desc: string; scale: number; scaleH?: number; posY: number }[] = [
  { value: "center", label: "Centralizada", desc: "Quadrado central", scale: 170, posY: 220 },
  { value: "full", label: "Full", desc: "Máximo possível", scale: 152, scaleH: 235, posY: 250 },
];

const CUSTOM_PRICE = BUSINESS.CUSTOM_TSHIRT_PRICE;

export function Customizer() {
  const router = useRouter();
  const { addItem } = useCart();
  const clipId = useId().replace(/:/g, "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // PRODUÇÃO — arquivo original intacto do cliente (o que vai pra impressão).
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  // PREVIEW — versão sem fundo (cosmética, só pra mostrar no mockup).
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  /** Dimensões da imagem original (para aviso de baixa resolução). */
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);

  // Ajustes do mockup.
  const [color, setColor] = useState(0);
  const [layout, setLayout] = useState<PrintLayout>("center");
  const [size, setSize] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [removeBg, setRemoveBg] = useState(true);

  const currentLayout = LAYOUTS.find((l) => l.value === layout) ?? LAYOUTS[0];
  const scale = currentLayout.scale;
  const posY = currentLayout.posY;

  const simTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Pré-carrega o modelo de remoção de fundo assim que a página monta, em
  // background, para que o primeiro upload já processe mais rápido.
  useEffect(() => {
    ensureBgPreloaded();
    return () => stopSimProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopSimProgress() {
    if (simTimer.current) {
      clearInterval(simTimer.current);
      simTimer.current = null;
    }
  }

  /** Sobe suave até ~90% enquanto processa; 100% só quando termina de verdade. */
  function startSimProgress() {
    stopSimProgress();
    setProgress(0);
    simTimer.current = setInterval(() => {
      setProgress((p) => (p < 90 ? Math.min(90, p + Math.max(1, (90 - p) * 0.08)) : p));
    }, 180);
  }

  // Imagem estampada no mockup: preferimos o preview (sem fundo); enquanto
  // processa, mostramos a original pra dar feedback imediato.
  const printedImage = previewUrl ?? originalUrl;
  const c = COLORS[color];

  async function load(file: File | undefined | null) {
    if (!file || !file.type.startsWith("image/")) return;

    // NB: NÃO revogamos as blob URLs anteriores aqui de propósito — elas podem
    // já ter ido para um item do carrinho. O preview é efêmero por natureza.
    const origUrl = URL.createObjectURL(file);
    setOriginalFile(file); // ← arquivo de PRODUÇÃO, intacto
    setOriginalUrl(origUrl);
    setFileName(file.name);
    setPreviewUrl(null);

    // Lê a resolução do original (para o aviso de baixa qualidade).
    setDims(null);
    try {
      const bmp = await createImageBitmap(file);
      setDims({ w: bmp.width, h: bmp.height });
      bmp.close();
    } catch {
      /* formato sem suporte a createImageBitmap — ignora o aviso de resolução */
    }

    // Remoção de fundo → versão SÓ de exibição (descartável).
    if (removeBg) {
      setProcessing(true);
      startSimProgress();
      try {
        const mod = await getBgModule();
        await ensureBgPreloaded();
        const blob = await mod.removeBackground(file, {
          progress: (_key, current, total) => {
            if (total > 0) {
              const pct = Math.round((current / total) * 100);
              setProgress((p) => Math.min(95, Math.max(p, pct)));
            }
          },
        });
        setPreviewUrl(URL.createObjectURL(blob));
        setProgress(100);
      } catch (err) {
        console.warn("[customizer] remoção de fundo falhou, usando original no preview:", err);
        setPreviewUrl(origUrl);
        setProgress(100);
      } finally {
        stopSimProgress();
        setProcessing(false);
      }
    } else {
      // Sem remoção de fundo — usa a imagem como está
      setPreviewUrl(origUrl);
    }
  }



  function add() {
    if (!printedImage) {
      return;
    }
    if (!size) {
      return;
    }
    addItem({
      key: `custom-${Date.now()}`,
      slug: "custom",
      name: "CAMISETA PERSONALIZADA",
      price: CUSTOM_PRICE,
      size,
      color: color === 0 ? "preta" : "branca",
      qty: 1,
      // Thumbnail do carrinho = preview sem fundo.
      imagePath: previewUrl ?? originalUrl ?? "",
      custom: true,
      previewUrl: previewUrl ?? undefined,
      originalUrl: originalUrl ?? undefined,
      originalFileName: fileName || undefined,
      originalFile: originalFile ?? undefined, // ← PRODUÇÃO (fica em memória)
    });
    router.push("/carrinho");
  }

  const w = 150 * (scale / 100);
  const h = 150 * ((currentLayout.scaleH ?? scale) / 100);
  const canAdd = Boolean(printedImage && size);
  const lowRes = dims !== null && Math.max(dims.w, dims.h) < MIN_PRINT_SIDE;

  return (
    <div className="lab">
      {/* PALCO / MOCKUP */}
      <div className="stage">
        <div className="tee-stage">
          <svg viewBox="0 0 400 440" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <clipPath id={`clip-${clipId}`}>
                <path d="M86 60 H314 V412 H86 Z" />
              </clipPath>
              <linearGradient id={`grad-${clipId}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#fff" stopOpacity=".05" />
                <stop offset="1" stopColor="#000" stopOpacity=".35" />
              </linearGradient>
            </defs>
            <path
              className="tee-body"
              style={{ fill: c.bg, stroke: c.stroke }}
              d="M140 56 L260 56 L372 150 L338 200 L314 172 L314 412 L86 412 L86 172 L62 200 L28 150 Z"
            />
            <path
              d="M140 56 L260 56 L372 150 L338 200 L314 172 L314 412 L86 412 L86 172 L62 200 L28 150 Z"
              fill={`url(#grad-${clipId})`}
            />
            <ellipse style={{ fill: c.collar }} cx="200" cy="60" rx="46" ry="16" />
            <path
              d="M156 62 q44 30 88 0"
              fill="none"
              stroke="#2a2a33"
              strokeWidth="2"
            />
            {printedImage && (
              <g clipPath={`url(#clip-${clipId})`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <image
                  href={printedImage}
                  x={200 - w / 2}
                  y={posY - h / 2}
                  width={w}
                  height={h}
                  preserveAspectRatio={layout === "full" ? "xMidYMid slice" : "xMidYMid meet"}
                />
              </g>
            )}
          </svg>
        </div>
        {!printedImage && (
          <div className="hintbox">
            <span>↓ sobe uma imagem</span>
          </div>
        )}
        {processing && (
          <div className="stage-loader" role="status" aria-live="polite">
            <div className="spinner" aria-hidden="true" />
            <div className="loader-txt">
              Removendo fundo... {Math.round(progress)}%
            </div>
          </div>
        )}
      </div>

      {/* PAINEL */}
      <div className="panel-box">
        {/* 01 — Imagem */}
        <div className="block">
          <div className="h">
            <span className="n">01</span>
            <h3>Sua imagem</h3>
          </div>
          {/* Toggle remoção de fundo — antes do upload */}
          <div style={{ marginBottom: 12, display: "flex", gap: 8 }}>
            <button
              className={`chip${removeBg ? " active" : ""}`}
              onClick={() => setRemoveBg(true)}
              style={{ fontSize: "0.75rem", padding: "6px 14px" }}
            >
              Remover fundo
            </button>
            <button
              className={`chip${!removeBg ? " active" : ""}`}
              onClick={() => setRemoveBg(false)}
              style={{ fontSize: "0.75rem", padding: "6px 14px" }}
            >
              Manter original
            </button>
          </div>
          <div
            className={`drop${originalFile ? " has" : ""}${dragging ? " drag" : ""}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              load(e.dataTransfer.files[0]);
            }}
            role="button"
            tabIndex={0}
            aria-label="Enviar imagem"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
          >
            <div className="ic">↑</div>
            <b>Arraste ou clique</b>
            <small>PNG ou JPG · até 10MB</small>
            {fileName && <div className="fn">✓ {fileName}</div>}
            {processing && <div className="proc">removendo fundo pro preview…</div>}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => load(e.target.files?.[0])}
          />

          {originalFile && (
            <>
              <div className="qnote">
                A imagem na tela é só pra você conferir o tamanho e o
                posicionamento. A qualidade da impressão depende da qualidade do
                arquivo que você enviar — quanto maior a resolução, melhor.
              </div>
              {lowRes && dims && (
                <div className="qnote warn">
                  Resolução baixa ({dims.w}×{dims.h}px). Essa arte pode sair com
                  baixa qualidade na impressão.
                </div>
              )}
            </>
          )}
        </div>

        {/* 02 — Cor & layout */}
        <div className="block">
          <div className="h">
            <span className="n">02</span>
            <h3>Cor &amp; layout</h3>
          </div>
          <div className="cw-row">
            {COLORS.map((col, i) => (
              <button
                key={col.bg}
                className={`cw${color === i ? " active" : ""}`}
                style={{ background: col.bg }}
                onClick={() => setColor(i)}
                aria-label={i === 0 ? "Preta" : "Branca"}
                aria-pressed={color === i}
              />
            ))}
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            {LAYOUTS.map((l) => (
              <button
                key={l.value}
                className={`chip${layout === l.value ? " active" : ""}`}
                onClick={() => setLayout(l.value)}
                style={{ flex: 1, padding: "10px 0", fontSize: "0.8rem" }}
              >
                {l.label}
                <br />
                <span style={{ fontSize: "0.65rem", opacity: 0.6 }}>{l.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 03 — Tamanho */}
        <div className="block">
          <div className="h">
            <span className="n">03</span>
            <h3>Tamanho</h3>
          </div>
          <div className="size-pick">
            {BUSINESS.SIZES.map((s) => (
              <button
                key={s}
                className={size === s ? "active" : ""}
                onClick={() => setSize(s)}
                aria-pressed={size === s}
                aria-label={`Tamanho ${s}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Preço + Adicionar */}
        <div
          className="block"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              className="mono"
              style={{
                fontSize: "11px",
                color: "var(--muted)",
                letterSpacing: ".1em",
              }}
            >
              PERSONALIZADA · 240g
            </div>
            <div style={{ fontFamily: "var(--mono)", fontSize: "22px" }}>
              {formatMoney(CUSTOM_PRICE)}
            </div>
          </div>
          <button className="btn" onClick={add} disabled={!canAdd}>
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}
