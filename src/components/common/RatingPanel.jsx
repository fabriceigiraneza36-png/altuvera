import React, { useCallback, useEffect, useState } from "react";
import { Star, X, MessageSquareText, ShieldCheck } from "lucide-react";
import { apiFetch } from "../../utils/apiBase";
import { useUserAuth } from "../../context/UserAuthContext";

export default function RatingPanel({ entityId, entityType = "destination", entityName = "this place" }) {
  const { isAuthenticated, openModal } = useUserAuth() || {};
  const id = /^\d+$/.test(String(entityId ?? "")) ? String(entityId) : null;
  const base = entityType === "country" ? "/country-ratings/" : "/destination-ratings/";
  const [stats, setStats] = useState({ averageRating: 0, totalRatings: 0 });
  const [reviews, setReviews] = useState([]);
  const [myRating, setMyRating] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [draftRating, setDraftRating] = useState(0);
  const [draftReview, setDraftReview] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    if (!id) return;
    try {
      const results = await Promise.all([
        apiFetch(base + encodeURIComponent(id) + "/ratings/stats"),
        apiFetch(base + encodeURIComponent(id) + "/ratings?limit=5"),
      ]);
      const payloads = await Promise.all(results.map((response) => response.json()));
      if (results[0].ok && payloads[0]?.status === "success") setStats(payloads[0].data || { averageRating: 0, totalRatings: 0 });
      if (results[1].ok && payloads[1]?.status === "success") setReviews(Array.isArray(payloads[1]?.data?.ratings) ? payloads[1].data.ratings : []);
    } catch { /* Preserve the last known values during temporary network failures. */ }
  }, [base, id]);

  useEffect(() => {
    refresh();
    if (!id) return undefined;
    const timer = window.setInterval(refresh, 30000);
    return () => window.clearInterval(timer);
  }, [id, refresh]);

  useEffect(() => {
    if (!isAuthenticated || !id) { setMyRating(null); return undefined; }
    let active = true;
    apiFetch(base + encodeURIComponent(id) + "/ratings/user")
      .then((response) => response.json().then((payload) => ({ response, payload })))
      .then(({ response, payload }) => {
        if (active && response.ok) setMyRating(payload?.data?.rating || null);
      }).catch(() => {});
    return () => { active = false; };
  }, [base, id, isAuthenticated]);

  const open = () => {
    if (!isAuthenticated) { if (typeof openModal === "function") openModal("login"); return; }
    setDraftRating(Number(myRating?.rating) || 0);
    setDraftReview("");
    setNotice(myRating ? "You have already rated this " + entityType + ". Each account can rate it once." : "");
    setModalOpen(true);
  };

  const submit = async () => {
    if (!id || !draftRating || busy || myRating) return;
    setBusy(true);
    setNotice("");
    try {
      const response = await apiFetch(base + encodeURIComponent(id) + "/ratings", {
        method: "POST",
        body: JSON.stringify({ rating: draftRating, review: draftReview.trim() }),
      });
      const payload = await response.json();
      if (response.status === 409) {
        setMyRating(payload?.data?.rating || { rating: draftRating });
        setNotice(payload?.message || "You have already rated this " + entityType + ".");
        return;
      }
      if (!response.ok || payload?.status !== "success") throw new Error(payload?.message || "We could not save your rating.");
      setMyRating(payload?.data?.rating || { rating: draftRating, review: draftReview.trim() });
      setStats(payload?.data?.stats || stats);
      setNotice("Thank you — your feedback has been saved.");
      setModalOpen(false);
      await refresh();
      if (entityType === "destination") {
        window.dispatchEvent(new CustomEvent("altuvera:destination-rating-updated", {
          detail: { destinationId: id, rating: payload?.data?.stats?.averageRating ?? draftRating, reviewCount: payload?.data?.stats?.totalRatings ?? Number(stats.totalRatings) + 1 },
        }));
      }
    } catch (error) {
      setNotice(error?.message || "Unable to save your rating.");
    } finally { setBusy(false); }
  };

  const average = Number(stats.averageRating) || 0;
  const total = Number(stats.totalRatings) || 0;

  return (
    <section aria-labelledby="rating-panel-title" style={{ marginTop: 26, padding: "clamp(18px,3vw,28px)", border: "1px solid #d1fae5", borderRadius: 22, background: "linear-gradient(135deg,#f0fdf4,#fff)" }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div>
          <p style={{ display: "flex", alignItems: "center", gap: 6, margin: 0, color: "#047857", fontSize: 11, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase" }}><ShieldCheck size={14} /> Traveller feedback</p>
          <h3 id="rating-panel-title" style={{ margin: "6px 0", color: "#0f172a", fontSize: 22, fontWeight: 850 }}>Ratings &amp; reviews</h3>
          <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>The average is calculated automatically from approved ratings.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div><strong style={{ display: "block", color: "#0f172a", fontSize: 30, lineHeight: 1.1 }}>{total ? average.toFixed(2) : "—"}</strong><span style={{ color: "#64748b", fontSize: 12 }}>{total} {total === 1 ? "rating" : "ratings"}</span></div>
          <div aria-label={average.toFixed(2) + " out of 5"} style={{ display: "flex", gap: 2 }}>{[1,2,3,4,5].map((star) => <Star key={star} size={20} fill={star <= Math.round(average) ? "#f59e0b" : "none"} color={star <= Math.round(average) ? "#f59e0b" : "#cbd5e1"} />)}</div>
        </div>
      </div>
      <button type="button" onClick={open} style={{ marginTop: 18, border: 0, borderRadius: 12, padding: "11px 16px", background: "#047857", color: "#fff", fontWeight: 800, cursor: "pointer" }}>{myRating ? "You have already rated this " + entityType : "Rate this " + entityType}</button>
      {notice && !modalOpen && <p role="status" style={{ margin: "10px 0 0", color: /unable|could not|already|error/i.test(notice) ? "#b91c1c" : "#047857", fontSize: 13 }}>{notice}</p>}
      {reviews.length ? <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: 10, marginTop: 18 }}>{reviews.map((review) => <article key={review.id} style={{ padding: 14, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14 }}><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}><strong style={{ color: "#0f172a", fontSize: 13 }}>{review.user?.name || review.user?.fullName || "Traveller"}</strong><span style={{ color: "#b45309", fontSize: 12, fontWeight: 800 }}>★ {review.rating}/5</span></div>{review.review ? <p style={{ margin: "8px 0 0", color: "#475569", fontSize: 13, lineHeight: 1.6, overflowWrap: "anywhere" }}>{review.review}</p> : <p style={{ margin: "8px 0 0", color: "#94a3b8", fontSize: 12, fontStyle: "italic" }}>Star rating only</p>}</article>)}</div> : <p style={{ margin: "14px 0 0", color: "#64748b", fontSize: 13 }}>No reviews yet. Be the first traveller to share your experience.</p>}
      {modalOpen && <div role="presentation" onClick={() => setModalOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 10050, display: "grid", placeItems: "center", padding: 16, background: "rgba(2,20,13,.62)", backdropFilter: "blur(6px)" }}>
        <section role="dialog" aria-modal="true" aria-labelledby="rating-dialog-title" onClick={(event) => event.stopPropagation()} style={{ width: "min(100%,440px)", maxHeight: "90dvh", overflowY: "auto", padding: 24, borderRadius: 22, background: "#fff", boxShadow: "0 24px 80px rgba(0,0,0,.25)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12 }}><div><p style={{ margin: 0, color: "#047857", fontSize: 11, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase" }}>Your experience</p><h3 id="rating-dialog-title" style={{ margin: "6px 0 0", color: "#0f172a", fontSize: 22, fontWeight: 850 }}>Rate {entityName}</h3></div><button type="button" onClick={() => setModalOpen(false)} aria-label="Close rating dialog" style={{ border: 0, borderRadius: 999, width: 36, height: 36, background: "#f1f5f9", cursor: "pointer" }}><X size={18} /></button></div>
          {myRating ? <p style={{ margin: "16px 0", color: "#475569", fontSize: 13 }}>You have already submitted {myRating.rating}/5. Ratings can only be submitted once per account.</p> : <><div style={{ display: "flex", justifyContent: "center", gap: 8, margin: "20px 0" }}>{[1,2,3,4,5].map((star) => <button key={star} type="button" onClick={() => setDraftRating(star)} aria-label={star + " out of 5 stars"} aria-pressed={draftRating === star} style={{ border: 0, padding: 3, background: "transparent", color: star <= draftRating ? "#f59e0b" : "#cbd5e1", cursor: "pointer" }}><Star size={32} fill={star <= draftRating ? "currentColor" : "none"} /></button>)}</div><label style={{ display: "block", color: "#334155", fontSize: 12, fontWeight: 800 }}>Review (optional)<textarea value={draftReview} onChange={(event) => setDraftReview(event.target.value.slice(0,4000))} maxLength={4000} rows={4} placeholder="Share a helpful comment for other travellers…" style={{ boxSizing: "border-box", display: "block", width: "100%", marginTop: 7, padding: 12, border: "1px solid #cbd5e1", borderRadius: 12, resize: "vertical", font: "inherit", fontWeight: 400 }} /><span style={{ display: "block", textAlign: "right", color: "#94a3b8", fontWeight: 400 }}>{draftReview.length}/4000</span></label></>}
          {notice && <p role="status" style={{ margin: "12px 0", color: /unable|could not|already|error/i.test(notice) ? "#b91c1c" : "#047857", fontSize: 13 }}>{notice}</p>}
          <button type="button" disabled={busy || !!myRating || !draftRating} onClick={submit} style={{ width: "100%", marginTop: 14, border: 0, borderRadius: 12, padding: 13, background: busy || myRating || !draftRating ? "#94a3b8" : "#047857", color: "#fff", fontWeight: 800, cursor: busy || myRating || !draftRating ? "not-allowed" : "pointer" }}>{busy ? "Saving…" : myRating ? "Rating already submitted" : "Submit rating"}</button>
        </section>
      </div>}
    </section>
  );
}
