// src/hooks/useGallery.js
import { useState, useEffect, useCallback, useRef } from "react";
import { apiFetch } from "../utils/apiBase";

const pickImageUrl = (value, depth = 0, seen = new Set()) => {
  if (depth > 5 || value == null) return "";
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) {
    for (const item of value) { const url = pickImageUrl(item, depth + 1, seen); if (url) return url; }
    return "";
  }
  if (typeof value !== "object" || seen.has(value)) return "";
  seen.add(value);
  for (const key of ["url", "secure_url", "secureUrl", "image_url", "imageUrl", "src", "original_url", "originalUrl", "public_url", "file_url", "thumbnail_url", "thumbnailUrl", "image", "file", "asset"]) {
    const url = pickImageUrl(value[key], depth + 1, seen);
    if (url) return url;
  }
  return "";
};

const extractRows = (payload, preferredKeys = []) => {
  let current = payload;
  const seen = new Set();
  for (let depth = 0; depth < 6; depth += 1) {
    if (Array.isArray(current)) return current;
    if (!current || typeof current !== "object" || seen.has(current)) return [];
    seen.add(current);
    const key = [...preferredKeys, "items", "results", "rows", "data"].find((name) => current[name] != null && current[name] !== current);
    if (!key) return [];
    current = current[key];
  }
  return Array.isArray(current) ? current : [];
};

/* ─── Normalise a raw backend gallery row ──────────────────────────────── */
export const normaliseImage = (raw) => {
  const src = pickImageUrl(typeof raw === "string" ? raw : raw?.image_url || raw?.imageUrl || raw?.url || raw?.src || raw?.image || raw?.secure_url);
  const thumb = pickImageUrl(raw?.thumbnail_url || raw?.thumbnailUrl || raw?.thumb_url || raw?.thumb || raw?.preview_url) || src;
  const item = raw && typeof raw === "object" ? raw : {};
  return {
    ...item,
    id: item.id || item._id || src,
    slug: item.slug || String(item.id || item._id || "gallery-image"),
    title: item.title || item.caption || item.name || "Untitled",
    description: item.description || "",
    src,
    thumb,
    alt: item.alt_text || item.altText || item.alt || item.title || "Gallery image",
    category: item.category || "other",
    tags: Array.isArray(item.tags) ? item.tags : [],
    location: item.location || "",
    countryName: item.country_name || item.countryName || "",
    destinationName: item.destination_name || item.destinationName || "",
    photographer: item.photographer || item.credit || "",
    isFeatured: Boolean(item.is_featured ?? item.isFeatured),
    viewCount: item.view_count || item.viewCount || 0,
    width: item.width || null,
    height: item.height || null,
    blurhash: item.blurhash || null,
    createdAt: item.created_at || item.createdAt || null,
  };
};

/* ─── Default query state ──────────────────────────────────────────────── */
const DEFAULT_PARAMS = {
  page:     1,
  limit:    24,
  sort:     "featured",
  category: "",
  search:   "",
  tag:      "",
};

export function useGallery(initialParams = {}) {
  const [images,      setImages]      = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [tags,        setTags]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [catLoading,  setCatLoading]  = useState(true);
  const [error,       setError]       = useState(null);
  const [pagination,  setPagination]  = useState(null);
  const [params,      setParams]      = useState({ ...DEFAULT_PARAMS, ...initialParams });

  const abortRef = useRef(null);

  /* ── Fetch gallery images ───────────────────────────────────────────── */
  const fetchImages = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    setError(null);

    try {
      const qs = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== "" && v !== null && v !== undefined) qs.set(k, v);
      });

      const res  = await apiFetch(`/gallery?${qs}`, { signal: ac.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      const raw = extractRows(json, ["images", "gallery", "items", "results"]);
      setImages(raw.map(normaliseImage).filter((image) => image.src));
      setPagination(json?.pagination || null);
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(err.message || "Failed to load gallery");
      setImages([]);
    } finally {
      setLoading(false);
    }
  }, [params]);

  /* ── Fetch categories ───────────────────────────────────────────────── */
  const fetchCategories = useCallback(async () => {
    setCatLoading(true);
    try {
      const res  = await apiFetch("/gallery/categories");
      if (!res.ok) return;
      const json = await res.json();
      setCategories(extractRows(json, ["categories", "items", "results"]));
    } catch { /* silent */ } finally {
      setCatLoading(false);
    }
  }, []);

  /* ── Fetch tags ─────────────────────────────────────────────────────── */
  const fetchTags = useCallback(async () => {
    try {
      const res  = await apiFetch("/gallery/tags");
      if (!res.ok) return;
      const json = await res.json();
      setTags(extractRows(json, ["tags", "items", "results"]));
    } catch { /* silent */ }
  }, []);

  /* ── Effects ────────────────────────────────────────────────────────── */
  useEffect(() => { fetchImages(); }, [fetchImages]);
  useEffect(() => { fetchCategories(); fetchTags(); }, [fetchCategories, fetchTags]);
  useEffect(() => () => abortRef.current?.abort(), []);

  /* ── Helpers ────────────────────────────────────────────────────────── */
  const updateParams = useCallback((updates) => {
    setParams((prev) => ({ ...prev, ...updates, page: updates.page ?? 1 }));
  }, []);

  const setPage = useCallback((page) => setParams((p) => ({ ...p, page })), []);

  const refetch = useCallback(() => fetchImages(), [fetchImages]);

  return {
    images,
    categories,
    tags,
    loading,
    catLoading,
    error,
    pagination,
    params,
    updateParams,
    setPage,
    refetch,
  };
}