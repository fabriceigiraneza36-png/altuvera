// src/hooks/useGallery.js
import { useState, useEffect, useCallback, useRef } from "react";
import { apiFetch } from "../utils/apiBase";

/* ─── Normalise a raw backend gallery row ──────────────────────────────── */
export const normaliseImage = (raw) => ({
  id:              raw.id,
  slug:            raw.slug            || String(raw.id),
  title:           raw.title           || "Untitled",
  description:     raw.description     || "",
  src:             raw.image_url       || "",
  thumb:           raw.thumbnail_url   || raw.image_url || "",
  alt:             raw.alt_text        || raw.title     || "Gallery image",
  category:        raw.category        || "other",
  tags:            Array.isArray(raw.tags) ? raw.tags   : [],
  location:        raw.location        || "",
  countryName:     raw.country_name    || "",
  destinationName: raw.destination_name|| "",
  photographer:    raw.photographer    || "",
  isFeatured:      raw.is_featured     || false,
  viewCount:       raw.view_count      || 0,
  width:           raw.width           || null,
  height:          raw.height          || null,
  blurhash:        raw.blurhash        || null,
  createdAt:       raw.created_at      || null,
});

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

      const raw = json?.data || json || [];
      setImages(Array.isArray(raw) ? raw.map(normaliseImage) : []);
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
      setCategories(json?.data || []);
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
      setTags(json?.data || []);
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