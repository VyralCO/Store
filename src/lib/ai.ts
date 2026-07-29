"use server";

/**
 * Geração de descrição + palavras-chave para estampas.
 *
 * Se GEMINI_API_KEY estiver configurada, usa o Gemini (visão) para
 * analisar o mockup e gerar descrição/keywords automaticamente.
 * Sem a key, cai num fallback que deriva keywords do nome + categoria.
 */

const STOPWORDS = new Set([
  "a", "o", "e", "de", "da", "do", "das", "dos", "para", "com", "em",
  "no", "na", "um", "uma", "the", "of", "and", "to", "que",
]);

export interface ProductMeta {
  description: string;
  keywords: string;
}

function slugWords(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

function fallbackMeta(name: string, categoryName?: string): ProductMeta {
  const words = new Set<string>();
  slugWords(name).forEach((w) => words.add(w));
  if (categoryName) slugWords(categoryName).forEach((w) => words.add(w));
  // termos genéricos do nicho
  ["camiseta", "streetwear", "vyral", "estampa"].forEach((w) => words.add(w));

  const cat = categoryName ? ` da coleção ${categoryName}` : "";
  const description =
    `Estampa "${name}"${cat}. Camiseta streetwear premium com impressão DTF de alta ` +
    `durabilidade. O hype vira roupa.`;

  return { description, keywords: [...words].join(", ") };
}

/**
 * Gera descrição + keywords para um produto.
 * @param name       nome da estampa
 * @param categoryName categoria (opcional)
 * @param imageUrl   URL pública do mockup (opcional — usado só com Gemini)
 */
export async function generateProductMeta(
  name: string,
  categoryName?: string,
  imageUrl?: string,
): Promise<ProductMeta> {
  const apiKey = process.env.GEMINI_API_KEY;

  // Sem key ou sem imagem → fallback determinístico.
  if (!apiKey || !imageUrl) {
    return fallbackMeta(name, categoryName);
  }

  try {
    // Baixa a imagem e converte para base64 (inline data p/ Gemini).
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) throw new Error("falha ao baixar imagem");
    const buf = Buffer.from(await imgRes.arrayBuffer());
    const mime = imgRes.headers.get("content-type") ?? "image/png";
    const b64 = buf.toString("base64");

    const prompt =
      `Você é copywriter de uma marca de streetwear brasileira chamada VYRAL ` +
      `("O hype vira roupa"). Analise a estampa desta camiseta chamada "${name}"` +
      (categoryName ? ` (categoria: ${categoryName})` : "") +
      `. Responda APENAS um JSON válido no formato ` +
      `{"description": "...", "keywords": "palavra1, palavra2, ..."} — ` +
      `a descrição com 1-2 frases curtas, tom jovem e provocador, em português; ` +
      `keywords com 8-12 termos de busca relevantes (temas, objetos, estilo, memes) ` +
      `separados por vírgula, minúsculos, sem acento.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                { inline_data: { mime_type: mime, data: b64 } },
              ],
            },
          ],
          generationConfig: { temperature: 0.7, responseMimeType: "application/json" },
        }),
      },
    );

    if (!res.ok) throw new Error(`Gemini ${res.status}`);
    const data = await res.json();
    const text: string =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const parsed = JSON.parse(text);
    const description = String(parsed.description ?? "").trim();
    const keywords = String(parsed.keywords ?? "").trim();
    if (!description || !keywords) throw new Error("resposta vazia");
    return { description, keywords };
  } catch (err) {
    console.warn("[ai] Gemini falhou, usando fallback:", err);
    return fallbackMeta(name, categoryName);
  }
}
