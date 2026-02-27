const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || "";
const DEEPSEEK_MODEL = import.meta.env.VITE_DEEPSEEK_MODEL || "deepseek-chat";
const DEEPSEEK_ENDPOINT = "https://api.deepseek.com/chat/completions";

const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || "gemini-2.0-flash";
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const PUTER_MODEL = import.meta.env.VITE_PUTER_MODEL || "gpt-5-nano";
const CACHE_TTL_MS = 1000 * 60 * 60 * 6;

let puterLoaderPromise = null;

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
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(text.slice(start, end + 1));
    }
    throw new Error("Provider returned non-JSON content.");
  }
};

const buildPrompt = (country) => {
  const compactCountryData = {
    id: country.id,
    name: country.name,
    capital: country.capital,
    population: country.population,
    area: country.area,
    currency: country.currency,
    bestTime: country.bestTime,
    highlights: safeArray(country.highlights).slice(0, 8),
    experiences: safeArray(country.experiences).slice(0, 8),
    economicInfo: country.economicInfo || {},
  };

  return `
You are a travel intelligence analyst.
Generate current, concise country insights for tourism planning in 2026.
Return ONLY valid JSON (no markdown).

Country profile:
${JSON.stringify(compactCountryData, null, 2)}

Rules:
- Keep language factual and specific.
- No markdown formatting.
- If a number is uncertain, mark it "estimated".
- Keep each text field compact and readable.

JSON schema:
{
  "summary": "2-4 sentence destination overview",
  "demographics": "5-6 concise demographic points separated by semicolons",
  "economy": "5-6 concise economy points separated by semicolons",
  "tourismOutlook": "4-5 sentences on tourism demand and trajectory",
  "quickStats": {
    "population": "string",
    "gdp": "string",
    "internetPenetration": "string",
    "internationalArrivals": "string"
  },
  "topCities": ["string", "string", "string", "string"],
  "bestTravelMonths": ["string", "string", "string", "string"],
  "sources": ["source 1", "source 2"],
  "currentEvents": "single sentence",
  "trendingAttractions": ["string", "string", "string"]
}
`;
};

const readCache = (cacheKey) => {
  const raw = sessionStorage.getItem(cacheKey);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.timestamp || Date.now() - parsed.timestamp > CACHE_TTL_MS) {
      sessionStorage.removeItem(cacheKey);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
};

const writeCache = (cacheKey, data) => {
  sessionStorage.setItem(
    cacheKey,
    JSON.stringify({
      timestamp: Date.now(),
      data,
    })
  );
};

const extractPuterText = (result) => {
  if (typeof result === "string") return result;
  if (typeof result?.text === "string") return result.text;
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
  const summary = cleanMarkdown(parsed?.summary);
  const demographics = cleanMarkdown(parsed?.demographics);
  const economy = cleanMarkdown(parsed?.economy);
  const tourismOutlook = cleanMarkdown(parsed?.tourismOutlook);

  if (!summary || !demographics || !economy || !tourismOutlook) {
    throw new Error(`${providerName} response missing required country insight fields.`);
  }

  return {
    summary,
    demographics,
    economy,
    tourismOutlook,
    quickStats: {
      population: cleanMarkdown(parsed?.quickStats?.population || country.population || "N/A"),
      gdp: cleanMarkdown(parsed?.quickStats?.gdp || country?.economicInfo?.gdp || "N/A"),
      internetPenetration: cleanMarkdown(parsed?.quickStats?.internetPenetration || "N/A"),
      internationalArrivals: cleanMarkdown(parsed?.quickStats?.internationalArrivals || "N/A"),
    },
    topCities: safeArray(parsed?.topCities, [country.capital]).slice(0, 5),
    bestTravelMonths: safeArray(
      parsed?.bestTravelMonths,
      safeArray(country?.seasons?.dry)
    ).slice(0, 5),
    sources: safeArray(parsed?.sources, [`${providerName} generated insights`]).slice(0, 5),
    currentEvents: cleanMarkdown(parsed?.currentEvents || ""),
    trendingAttractions: safeArray(parsed?.trendingAttractions, []).slice(0, 4),
  };
};

const fetchWithDeepSeek = async (prompt) => {
  if (!DEEPSEEK_API_KEY) {
    throw new Error("Missing DeepSeek API key.");
  }

  const response = await fetch(DEEPSEEK_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages: [
        {
          role: "system",
          content: "Return only valid JSON. No markdown.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(
      errBody?.error?.message || `DeepSeek API error ${response.status}`
    );
  }

  const data = await response.json();
  const payloadText = data?.choices?.[0]?.message?.content || "";
  if (!String(payloadText).trim()) {
    throw new Error("No DeepSeek payload returned.");
  }
  return parseJsonPayload(payloadText);
};

const fetchWithGemini = async (prompt) => {
  if (!GEMINI_API_KEY) {
    throw new Error("Missing Gemini API key.");
  }

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        topP: 0.9,
        maxOutputTokens: 1800,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(
      errBody?.error?.message || `Gemini API error ${response.status}`
    );
  }

  const data = await response.json();
  const payloadText =
    data?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("") ||
    "";
  if (!String(payloadText).trim()) {
    throw new Error("No Gemini payload returned.");
  }
  return parseJsonPayload(payloadText);
};

const ensurePuterLoaded = async () => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("Puter fallback is only available in browser runtime.");
  }

  if (window.puter?.ai?.chat) return window.puter;

  if (!puterLoaderPromise) {
    puterLoaderPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[src="https://js.puter.com/v2/"]');
      if (existing) {
        existing.addEventListener("load", () => {
          if (window.puter?.ai?.chat) resolve(window.puter);
          else reject(new Error("Puter loaded but API is unavailable."));
        });
        existing.addEventListener("error", () =>
          reject(new Error("Failed to load Puter script."))
        );
        return;
      }

      const script = document.createElement("script");
      script.src = "https://js.puter.com/v2/";
      script.async = true;
      script.onload = () => {
        if (window.puter?.ai?.chat) resolve(window.puter);
        else reject(new Error("Puter loaded but API is unavailable."));
      };
      script.onerror = () => reject(new Error("Failed to load Puter script."));
      document.head.appendChild(script);
    });
  }

  return puterLoaderPromise;
};

const fetchWithPuter = async (prompt) => {
  const puter = await ensurePuterLoaded();
  const result = await puter.ai.chat(prompt, { model: PUTER_MODEL });
  const payloadText = extractPuterText(result);
  if (!String(payloadText).trim()) {
    throw new Error("No Puter payload returned.");
  }
  return parseJsonPayload(payloadText);
};

export const countryInsightService = {
  async getInsights(country, options = {}) {
    if (!country?.id) {
      throw new Error("Country context is required for AI insight generation.");
    }

    const cacheKey = `country-insights:${country.id}`;
    const cached = readCache(cacheKey);
    if (cached && !options.forceRefresh) return cached;

    const prompt = buildPrompt(country);
    const providerErrors = [];

    try {
      const parsed = await fetchWithDeepSeek(prompt);
      const sanitized = sanitizeInsights(parsed, country, "DeepSeek");
      writeCache(cacheKey, sanitized);
      return sanitized;
    } catch (err) {
      providerErrors.push(`DeepSeek: ${err?.message || "unknown error"}`);
    }

    try {
      const parsed = await fetchWithGemini(prompt);
      const sanitized = sanitizeInsights(parsed, country, "Gemini");
      writeCache(cacheKey, sanitized);
      return sanitized;
    } catch (err) {
      providerErrors.push(`Gemini: ${err?.message || "unknown error"}`);
    }

    try {
      const parsed = await fetchWithPuter(prompt);
      const sanitized = sanitizeInsights(parsed, country, "Puter");
      writeCache(cacheKey, sanitized);
      return sanitized;
    } catch (err) {
      providerErrors.push(`Puter: ${err?.message || "unknown error"}`);
    }

    throw new Error(
      `All AI providers failed. ${providerErrors.join(" | ")}`
    );
  },
};

export default countryInsightService;
