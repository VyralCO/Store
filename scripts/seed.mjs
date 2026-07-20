// ============================================================
// VYRAL — Seed do Supabase
// Popula products + variants a partir do catálogo local.
// Uso: npm run seed   (requer .env.local com SUPABASE_SERVICE_ROLE_KEY)
// ============================================================
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- Carrega .env.local manualmente (script fora do runtime Next) ---
function loadEnv() {
  try {
    const raw = readFileSync(join(__dirname, "..", ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const value = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    console.error("⚠ .env.local não encontrado. Crie a partir de .env.example.");
    process.exit(1);
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "⚠ Faltam NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY no .env.local",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

const SIZES = ["P", "M", "G", "GG", "XG"];

// Catálogo (espelho de src/data/catalog.ts, em snake_case p/ o banco)
const CATALOG = [
  {
    slug: "sem-paciencia",
    name: "SEM PACIÊNCIA",
    category: "Oversized · Preta",
    color: "preta",
    price: 119,
    old_price: 149,
    badge: "DROP",
    badge_cyan: false,
    description:
      "Estampa costas full. O cão que não tá pra conversa — igual você depois de seis horas de trabalho e mais uma na academia. Oversized 240g, preta que não desbota no primeiro sol.",
    image_path: "/assets/produtos/sem-paciencia.jpg",
  },
  {
    slug: "seppuku",
    name: "SEPPUKU",
    category: "Oversized · Branca",
    color: "branca",
    price: 129,
    old_price: null,
    badge: "HYPE",
    badge_cyan: true,
    description:
      "Honra, corte e postura. Guerreiro estampado em alta definição na branca 240g. Pra quem entra na arena todo dia e não conhece recuo.",
    image_path: "/assets/produtos/seppuku.jpg",
  },
  {
    slug: "bulking-bad",
    name: "BULKING BAD",
    category: "Meme · Coleção",
    color: "meme",
    price: 109,
    old_price: null,
    badge: "MEME",
    badge_cyan: false,
    description:
      "Química aplicada: bulking também é ciência. Tributo pesado pra quem trata dieta como laboratório e barra como fórmula. Estampa premium quadrada.",
    image_path: "/assets/produtos/bulking-bad.jpg",
  },
  {
    slug: "estilo-heranca",
    name: "ESTILO NÃO É TENDÊNCIA",
    category: "Oversized · Branca",
    color: "branca",
    price: 119,
    old_price: null,
    badge: null,
    badge_cyan: false,
    description:
      "Moto clássica e tipografia invadindo a estampa. Estilo não segue timeline — vem de trás, é herança. Branca oversized 240g, caimento largo.",
    image_path: "/assets/produtos/estilo-heranca.jpg",
  },
  {
    slug: "original-moda",
    name: "O ORIGINAL NUNCA SAI DE MODA",
    category: "Oversized · Preta",
    color: "preta",
    price: 119,
    old_price: null,
    badge: null,
    badge_cyan: false,
    description:
      "Fusca, textura e atitude. O que é raiz nunca sai de linha. Clássico é clássico. Preta oversized 240g pra quem carrega a origem.",
    image_path: "/assets/produtos/original-moda.jpg",
  },
];

async function seed() {
  console.log("→ Semeando produtos...\n");

  for (const product of CATALOG) {
    // Upsert do produto pelo slug
    const { data: prod, error: prodErr } = await supabase
      .from("products")
      .upsert(product, { onConflict: "slug" })
      .select()
      .single();

    if (prodErr) {
      console.error(`✗ Erro ao inserir ${product.slug}:`, prodErr.message);
      continue;
    }

    // Cria variantes (P/M/G/GG/XG) com estoque inicial
    const variants = SIZES.map((size) => ({
      product_id: prod.id,
      size,
      stock: 25,
    }));

    const { error: varErr } = await supabase
      .from("variants")
      .upsert(variants, { onConflict: "product_id,size" });

    if (varErr) {
      console.error(`✗ Erro nas variantes de ${product.slug}:`, varErr.message);
      continue;
    }

    console.log(`✓ ${product.name} (+${SIZES.length} tamanhos)`);
  }

  console.log("\n✓ Seed concluído.");
}

seed().catch((e) => {
  console.error("Falha no seed:", e);
  process.exit(1);
});
