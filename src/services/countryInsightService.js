// src/services/countryInsightService.js
// (unchanged logic, fixed export consistency)

const DEEPSEEK_API_KEY  = import.meta.env.VITE_DEEPSEEK_API_KEY  || "";
const DEEPSEEK_MODEL    = import.meta.env.VITE_DEEPSEEK_MODEL    || "deepseek-chat";
const DEEPSEEK_ENDPOINT = "https://api.deepseek.com/chat/completions";

const GEMINI_MODEL    = import.meta.env.VITE_GEMINI_MODEL    || "gemini-2.0-flash";
const GEMINI_API_KEY  = import.meta.env.VITE_GEMINI_API_KEY  || "";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const PUTER_MODEL    = import.meta.env.VITE_PUTER_MODEL || "gpt-5-nano";
const CACHE_TTL_MS   = 1000 * 60 * 60 * 6; // 6 hours

let puterLoaderPromise = null;

/* ── utils ────────────────────────────────────── */

const cleanMarkdown = (value = "") =>
  String(value)
    .replace(/[*#`_]+/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const safeArray = (value, fallback = []) =>
  Array.isArray(value) ? value.filter(Boolean) : fallback;

const parseJsonPayload = (payloadText) => {
  const text = String(payloadText || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end   = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(text.slice(start, end + 1));
    }
    throw new Error("Provider returned non-JSON content.");
  }
};

const buildPrompt = (country) => {
  const compact = {
    id:          country.id,
    name:        country.name,
    capital:     country.capital,
    population:  country.population,
    area:        country.area,
    currency:    country.currency,
    bestTime:    country.bestTime,
    highlights:  safeArray(country.highlights).slice(0, 8),
    experiences: safeArray(country.experiences).slice(0, 8),
    economicInfo: country.economicInfo || {},
  };

  return `
You are a travel intelligence analyst.
Generate current, deep, and authoritative country insights for tourism planning in 2026.
Return ONLY valid JSON (no markdown).

Country profile:
${JSON.stringify(compact, null, 2)}

Rules:
- Keep language factual, professional, and sophisticated.
- No markdown formatting.
- If a number is uncertain, mark it "estimated".
- Keep each text field compact yet informative.

JSON schema:
{
  "definition": "A 1-2 sentence compelling academic/professional definition of the country's essence",
  "summary": "3-5 sentence destination overview and why it matters in 2026",
  "demographics": "6-8 concise demographic points separated by semicolons",
  "economy": "6-8 concise economy points separated by semicolons",
  "tourismOutlook": "5-6 sentences on tourism demand, infrastructure growth, and trajectory",
  "quickStats": {
    "population": "string",
    "gdp": "string",
    "internetPenetration": "string",
    "internationalArrivals": "string"
  },
  "topCities": ["string","string","string","string","string"],
  "bestTravelMonths": ["string","string","string","string","string"],
  "sources": ["source 1","source 2","source 3"],
  "currentEvents": "A detailed 1-2 sentence paragraph on significant ongoing events or trends",
  "trendingAttractions": ["string","string","string","string"]
}
`;
};

/* ── cache ────────────────────────────────────── */

const readCache = (key) => {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.timestamp || Date.now() - parsed.timestamp > CACHE_TTL_MS) {
      sessionStorage.removeItem(key);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
};

const writeCache = (key, data) => {
  try {
    sessionStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), data }));
  } catch {
    // storage quota — ignore
  }
};

/* ── providers ────────────────────────────────── */

const extractPuterText = (result) => {
  if (typeof result === "string") return result;
  if (typeof result?.text    === "string") return result.text;
  if (typeof result?.content === "string") return result.content;
  if (typeof result?.message?.content === "string") return result.message.content;
  if (Array.isArray(result?.message?.content)) {
    return result.message.content
      .map((item) => (typeof item === "string" ? item : item?.text || ""))
      .join("");
  }
  return "";
};

const sanitizeInsights = (parsed, country, providerName) => {
  const definition    = cleanMarkdown(parsed?.definition);
  const summary       = cleanMarkdown(parsed?.summary);
  const demographics  = cleanMarkdown(parsed?.demographics);
  const economy       = cleanMarkdown(parsed?.economy);
  const tourismOutlook= cleanMarkdown(parsed?.tourismOutlook);

  if (!summary || !demographics || !economy || !tourismOutlook) {
    throw new Error(`${providerName} response missing required fields.`);
  }

  return {
    definition: definition || summary.slice(0, 150) + "...",
    summary,
    demographics,
    economy,
    tourismOutlook,
    quickStats: {
      population:            cleanMarkdown(parsed?.quickStats?.population      || String(country.population || "N/A")),
      gdp:                   cleanMarkdown(parsed?.quickStats?.gdp             || country?.economicInfo?.gdp || "N/A"),
      internetPenetration:   cleanMarkdown(parsed?.quickStats?.internetPenetration || "N/A"),
      internationalArrivals: cleanMarkdown(parsed?.quickStats?.internationalArrivals || "N/A"),
    },
    topCities:           safeArray(parsed?.topCities, [country.capital]).slice(0, 5),
    bestTravelMonths:    safeArray(parsed?.bestTravelMonths, safeArray(country?.seasons?.dry)).slice(0, 5),
    sources:             safeArray(parsed?.sources, [`${providerName} generated insights`]).slice(0, 5),
    currentEvents:       cleanMarkdown(parsed?.currentEvents || ""),
    trendingAttractions: safeArray(parsed?.trendingAttractions, []).slice(0, 4),
  };
};

const fetchWithDeepSeek = async (prompt) => {
  if (!DEEPSEEK_API_KEY) throw new Error("Missing DeepSeek API key.");

  const response = await fetch(DEEPSEEK_ENDPOINT, {
    method:  "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:  `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages: [
        { role: "system", content: "Return only valid JSON. No markdown." },
        { role: "user",   content: prompt },
      ],
      temperature:    0.3,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `DeepSeek error ${response.status}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content || "";
  if (!text.trim()) throw new Error("No DeepSeek payload returned.");
  return parseJsonPayload(text);
};

const fetchWithGemini = async (prompt) => {
  if (!GEMINI_API_KEY) throw new Error("Missing Gemini API key.");

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature:      0.3,
        topP:             0.9,
        maxOutputTokens:  1800,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gemini error ${response.status}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
  if (!text.trim()) throw new Error("No Gemini payload returned.");
  return parseJsonPayload(text);
};

const ensurePuterLoaded = async () => {
  if (typeof window === "undefined") throw new Error("Puter requires browser.");
  if (window.puter?.ai?.chat) return window.puter;

  if (!puterLoaderPromise) {
    puterLoaderPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[src="https://js.puter.com/v2/"]');
      if (existing) {
        existing.addEventListener("load",  () => window.puter?.ai?.chat ? resolve(window.puter) : reject(new Error("Puter API unavailable.")));
        existing.addEventListener("error", () => reject(new Error("Failed to reach Puter.")));
        return;
      }
      const script  = document.createElement("script");
      script.src    = "https://js.puter.com/v2/";
      script.async  = true;
      script.onload  = () => window.puter?.ai?.chat ? resolve(window.puter) : reject(new Error("Puter API unavailable."));
      script.onerror = () => reject(new Error("Failed to load Puter."));
      document.head.appendChild(script);
    });
  }

  return puterLoaderPromise;
};

const fetchWithPuter = async (prompt) => {
  const puter = await ensurePuterLoaded();
  const result = await puter.ai.chat(prompt, { model: PUTER_MODEL });
  const text = extractPuterText(result);
  if (!text.trim()) throw new Error("No Puter payload returned.");
  return parseJsonPayload(text);
};

/* ── main service ─────────────────────────────── */

const countryInsightService = {
  async getInsights(country, options = {}) {
    if (!country?.id) {
      throw new Error("Country context is required for AI insight generation.");
    }

    const cacheKey = `country-insights:${country.id}`;
    const cached = readCache(cacheKey);
    if (cached && !options.forceRefresh) return cached;

    const prompt = buildPrompt(country);
    const errors = [];

    try {
      const parsed    = await fetchWithDeepSeek(prompt);
      const sanitized = sanitizeInsights(parsed, country, "DeepSeek");
      writeCache(cacheKey, sanitized);
      return sanitized;
    } catch (err) {
      errors.push(`DeepSeek: ${err?.message || "unknown"}`);
    }

    try {
      const parsed    = await fetchWithGemini(prompt);
      const sanitized = sanitizeInsights(parsed, country, "Gemini");
      writeCache(cacheKey, sanitized);
      return sanitized;
    } catch (err) {
      errors.push(`Gemini: ${err?.message || "unknown"}`);
    }

    try {
      const parsed    = await fetchWithPuter(prompt);
      const sanitized = sanitizeInsights(parsed, country, "Puter");
      writeCache(cacheKey, sanitized);
      return sanitized;
    } catch (err) {
      errors.push(`Puter: ${err?.message || "unknown"}`);
    }

    throw new Error(`All AI providers failed. ${errors.join(" | ")}`);
  },
};

// Both named + default export so any import style works
export { countryInsightService };
export default countryInsightService;