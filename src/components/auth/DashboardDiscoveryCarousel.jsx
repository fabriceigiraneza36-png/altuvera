import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Compass, RefreshCw } from "lucide-react";
import DestinationCard from "../common/DestinationCard";
import { useDestinations } from "../../hooks/useDestinations";
import { usePosts } from "../../hooks/usePosts";
import packagesAPI from "../../api/packages";
import { HorizontalPackageCard, HorizontalPostCard } from "../../pages/Home";
import { useWishlist } from "../../hooks/useWishlist";

const styles = `
.db-live-section{min-width:0;width:100%;display:grid;gap:24px;color:#0f172a}
.db-live-heading{display:flex;align-items:end;justify-content:space-between;gap:12px;margin-bottom:12px}
.db-live-eyebrow{margin:0 0 5px;font-size:.7rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#059669}
.db-live-title{margin:0;font-size:clamp(1.08rem,2vw,1.35rem);font-weight:900;letter-spacing:-.025em;color:#0f172a}
.db-live-link{display:inline-flex;align-items:center;gap:5px;white-space:nowrap;text-decoration:none;color:#047857;font-size:.78rem;font-weight:800}
.db-live-track{display:flex;gap:16px;overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;padding:3px 3px 14px;scrollbar-width:thin;scrollbar-color:#a7f3d0 transparent;-webkit-overflow-scrolling:touch}
.db-live-destination{flex:0 0 clamp(270px,34vw,350px);min-width:0;scroll-snap-align:start;display:flex}
.db-live-destination>.dc-card{width:100%;min-width:0}
.db-live-package{flex:0 0 clamp(220px,27vw,285px);min-width:0;scroll-snap-align:start}
.db-live-story{flex:0 0 clamp(220px,27vw,285px);min-width:0;scroll-snap-align:start}
.db-live-skeleton{flex:0 0 clamp(220px,27vw,285px);height:320px;overflow:hidden;border:1px solid #e2e8f0;border-radius:18px;background:#fff;scroll-snap-align:start}
.db-live-skeleton-image,.db-live-skeleton-line{background:linear-gradient(100deg,#f1f5f9 20%,#e2e8f0 45%,#f1f5f9 70%);background-size:220% 100%;animation:dbLiveShimmer 1.35s ease-in-out infinite}
.db-live-skeleton-image{height:58%;width:100%}.db-live-skeleton-body{padding:16px;display:grid;gap:12px}.db-live-skeleton-line{height:12px;border-radius:8px}.db-live-skeleton-line.short{width:38%}.db-live-skeleton-line.medium{width:68%}.db-live-skeleton-line.long{width:94%}
.db-live-state{padding:22px 18px;border:1px dashed #cbd5e1;border-radius:16px;background:#f8fafc;color:#64748b;font-size:.86rem;display:flex;align-items:center;justify-content:space-between;gap:12px}
.db-live-retry{border:1px solid #a7f3d0;border-radius:10px;padding:8px 11px;background:#fff;color:#047857;font-weight:800;display:inline-flex;align-items:center;gap:6px;cursor:pointer}
.db-live-skeleton:focus-visible,.db-live-retry:focus-visible{outline:3px solid #059669;outline-offset:3px}

.db-live-subsection{min-width:0;width:100%;max-width:100%;overflow:hidden}
.db-live-heading>div{min-width:0}
.db-live-title{overflow-wrap:anywhere}
.db-live-track{width:100%;max-width:100%;box-sizing:border-box;align-items:stretch;scroll-padding-inline:4px}
.db-live-carousel-shell{position:relative;min-width:0;width:100%;max-width:100%}
.db-live-carousel-shell:before,.db-live-carousel-shell:after{content:"";position:absolute;top:0;bottom:14px;width:26px;z-index:2;pointer-events:none;opacity:0;transition:opacity .25s ease}
.db-live-carousel-shell:before{left:0;background:linear-gradient(90deg,#fff,transparent)}
.db-live-carousel-shell:after{right:0;background:linear-gradient(270deg,#fff,transparent)}
.db-live-carousel-shell.has-left:before,.db-live-carousel-shell.has-right:after{opacity:1}
.db-live-arrow{position:absolute;top:calc(50% - 10px);z-index:4;width:42px;height:42px;border-radius:50%;display:grid;place-items:center;border:1px solid rgba(5,150,105,.22);background:rgba(255,255,255,.94);color:#047857;box-shadow:0 8px 24px rgba(15,23,42,.14);backdrop-filter:blur(12px);cursor:pointer;transition:transform .28s cubic-bezier(.2,.8,.2,1),background .25s ease,color .25s ease,box-shadow .25s ease,opacity .2s ease;animation:dbArrowIn .35s ease both}
.db-live-arrow--prev{left:-13px}.db-live-arrow--next{right:-13px}
.db-live-arrow:hover:not(:disabled){transform:translateY(-50%) scale(1.08);background:#059669;color:#fff;box-shadow:0 10px 26px rgba(5,150,105,.28)}
.db-live-arrow:active:not(:disabled){transform:translateY(-50%) scale(.94)}
.db-live-arrow:disabled{opacity:0;pointer-events:none}
.db-live-arrow:focus-visible{outline:3px solid #34d399;outline-offset:3px}
@keyframes dbArrowIn{from{opacity:0;transform:translateY(-46%) scale(.8)}to{opacity:1;transform:translateY(-50%) scale(1)}}
@media(max-width:760px){.db-live-arrow,.db-live-carousel-shell:before,.db-live-carousel-shell:after{display:none}}

.db-live-package,.db-live-story{display:flex;align-items:stretch;min-width:0}
.db-live-package>.hpkg-card,.db-live-story>.hpost-card{width:100%;min-width:0;max-width:100%;height:100%;box-sizing:border-box;flex:1 1 auto;border-radius:18px;border:1px solid #e2e8f0;box-shadow:0 5px 18px rgba(15,23,42,.055);overflow:hidden}
.db-live-package>.hpkg-card:hover,.db-live-story>.hpost-card:hover{box-shadow:0 14px 30px rgba(15,23,42,.12);transform:translateY(-3px);border-color:#a7f3d0}
.db-live-package .hpkg-img-wrap{height:clamp(155px,19vw,205px);flex:0 0 auto;overflow:hidden;background:#ecfdf5}.db-live-package .hpkg-img-wrap img,.db-live-story .hpost-img-wrap img{width:100%;height:100%;object-fit:cover;display:block}.db-live-package .hpkg-body,.db-live-story .hpost-body{display:flex;flex-direction:column}
.db-live-package .hpkg-body,.db-live-story .hpost-body{min-width:0;overflow-wrap:anywhere;padding:16px;gap:9px}
.db-live-package .hpkg-title,.db-live-story .hpost-title{font-size:.95rem;line-height:1.4;min-height:2.65em;overflow-wrap:anywhere}
.db-live-package .hpkg-desc,.db-live-story .hpost-excerpt{font-size:.78rem;line-height:1.6;overflow-wrap:anywhere}
.db-live-package .hpkg-footer{margin-top:auto;padding-top:12px}
.db-live-package .hpkg-cta,.db-live-story .hpost-readmore{font-size:.76rem}
.db-live-story .hpost-img-wrap{height:clamp(155px,19vw,205px);flex:0 0 auto;overflow:hidden;background:#ecfdf5}
.db-live-story .hpost-meta{line-height:1.5}
.db-live-skeleton{box-sizing:border-box;flex-shrink:0}
.db-live-state{min-width:0;box-sizing:border-box;overflow-wrap:anywhere}
@media(max-width:640px){
 .db-live-heading{gap:8px;align-items:flex-end}
 .db-live-title{font-size:1.08rem;line-height:1.25}
 .db-live-link{font-size:.72rem;flex-shrink:0}
 .db-live-track{padding:4px 3px 13px;gap:12px}
 .db-live-destination{flex-basis:min(84vw,330px)}
 .db-live-package,.db-live-story{flex:0 0 min(80vw,310px);width:min(80vw,310px)}
 .db-live-package .hpkg-img-wrap,.db-live-story .hpost-img-wrap{height:165px}
 .db-live-package .hpkg-body,.db-live-story .hpost-body{padding:14px}
 .db-live-package .hpkg-title,.db-live-story .hpost-title{font-size:.9rem}
 .db-live-state{align-items:flex-start;flex-direction:column}
}
@media(max-width:360px){
 .db-live-package,.db-live-story{flex-basis:84vw;width:84vw}
 .db-live-heading{align-items:flex-start}
 .db-live-link{font-size:.68rem}
}

@keyframes dbLiveShimmer{0%{background-position:100% 0}100%{background-position:-120% 0}}
@media(max-width:640px){.db-live-section{gap:20px}.db-live-heading{align-items:center}.db-live-destination{flex-basis:min(84vw,330px)}.db-live-package,.db-live-story{flex-basis:78vw}.db-live-skeleton{flex-basis:78vw;height:300px}.db-live-track{gap:12px}}
@media(prefers-reduced-motion:reduce){.db-live-skeleton-image,.db-live-skeleton-line{animation:none}}
`;

function SkeletonCard({ kind = "card" }) {
  return <div className="db-live-skeleton" role="status" aria-label={`Loading ${kind}`}><div className="db-live-skeleton-image" /><div className="db-live-skeleton-body"><div className="db-live-skeleton-line short" /><div className="db-live-skeleton-line long" /><div className="db-live-skeleton-line medium" /><div className="db-live-skeleton-line long" /></div></div>;
}

function LiveRow({ title, eyebrow, to, loading, error, items, renderItem, kind, onRetry, emptyText }) {
  const trackRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const pauseAutoplayRef = useRef(false);
  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = Math.max(0, el.scrollWidth - el.clientWidth);
    setCanPrev(el.scrollLeft > 3);
    setCanNext(max > 3 && el.scrollLeft < max - 3);
  }, []);
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateArrows) : null;
    observer?.observe(el);
    return () => { el.removeEventListener("scroll", updateArrows); observer?.disconnect(); };
  }, [updateArrows, loading, items.length]);
  // Auto-advance destination, package and story rows; pause during direct interaction.
  useEffect(() => {
    const el = trackRef.current;
    if (!el || loading || error || items.length < 2 || typeof window === "undefined") return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;
    const timer = window.setInterval(() => {
      if (pauseAutoplayRef.current || el.matches(":hover") || el.contains(document.activeElement)) return;
      const max = Math.max(0, el.scrollWidth - el.clientWidth);
      if (max <= 4) return;
      if (el.scrollLeft >= max - 8) el.scrollTo({ left: 0, behavior: "smooth" });
      else {
        const card = el.querySelector(":scope > *");
        el.scrollBy({ left: (card?.getBoundingClientRect().width || 260) + 16, behavior: "smooth" });
      }
    }, 4800);
    return () => window.clearInterval(timer);
  }, [loading, error, items.length]);
  const move = (direction) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector(":scope > *");
    const distance = Math.max(220, (card?.getBoundingClientRect().width || 280) + 16) * 2;
    el.scrollBy({ left: direction * distance, behavior: "smooth" });
  };
  return <section className="db-live-subsection" aria-label={title}>
    <div className="db-live-heading"><div><p className="db-live-eyebrow">{eyebrow}</p><h2 className="db-live-title">{title}</h2></div><Link className="db-live-link" to={to}>View all <ArrowRight size={14}/></Link></div>
    {loading ? <div className="db-live-track" aria-busy="true">{Array.from({length:3},(_,i)=><SkeletonCard key={`${kind}-skeleton-${i}`} kind={kind}/>)}</div>
      : error ? <div className="db-live-state" role="alert"><span>{error}</span><button className="db-live-retry" onClick={onRetry}><RefreshCw size={14}/> Retry</button></div>
      : items.length ? <div className={`db-live-carousel-shell ${canPrev ? "has-left" : ""} ${canNext ? "has-right" : ""}`}>
          <button type="button" className="db-live-arrow db-live-arrow--prev" aria-label={`Previous ${title}`} title="Previous" onClick={() => move(-1)} disabled={!canPrev}><ArrowLeft size={19}/></button>
          <div ref={trackRef} className="db-live-track" aria-label={`${title} carousel`} tabIndex={0} onPointerDown={() => { pauseAutoplayRef.current = true; }} onPointerUp={() => { window.setTimeout(() => { pauseAutoplayRef.current = false; }, 1800); }} onKeyDown={() => { pauseAutoplayRef.current = true; window.setTimeout(() => { pauseAutoplayRef.current = false; }, 2200); }}>{items.map(renderItem)}</div>
          <button type="button" className="db-live-arrow db-live-arrow--next" aria-label={`Next ${title}`} title="Next" onClick={() => move(1)} disabled={!canNext}><ArrowRight size={19}/></button>
        </div>
      : <div className="db-live-state">{emptyText}</div>}
  </section>;
}

export default function DashboardDiscoveryCarousel() {
  const { destinations, loading: destinationsLoading, error: destinationsError, refetch: refetchDestinations } = useDestinations({ limit: 12, sort: "engagement", include: "gallery" });
  const { posts, loading: postsLoading, error: postsError, refetch: refetchPosts } = usePosts({ limit: 12, sort: "created" });
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [packages, setPackages] = useState([]);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [packagesError, setPackagesError] = useState("");
  const [packageWishlist, setPackageWishlist] = useState(() => { try { return new Set(JSON.parse(localStorage.getItem("altuvera_wishlist") || "[]")); } catch { return new Set(); } });

  const loadPackages = useCallback(async () => {
    setPackagesLoading(true); setPackagesError("");
    try { const response = await packagesAPI.getAll({ limit: 12, sortBy: "sort_order", order: "asc", is_active: true }); const rows = response?.data ?? response?.packages ?? []; setPackages(Array.isArray(rows) ? rows : []); }
    catch (error) { setPackages([]); setPackagesError("We could not load live packages. Please try again."); console.error("[DashboardDiscoveryCarousel] package fetch failed", error); }
    finally { setPackagesLoading(false); }
  }, []);
  useEffect(() => { loadPackages(); }, [loadPackages]);

  const handlePackageWishlist = useCallback((id) => {
    setPackageWishlist((previous) => { const next = new Set(previous); next.has(id) ? next.delete(id) : next.add(id); try { localStorage.setItem("altuvera_wishlist", JSON.stringify([...next])); } catch {} return next; });
  }, []);
  const retryDestinations = useCallback(() => refetchDestinations?.(), [refetchDestinations]);
  const retryPosts = useCallback(() => refetchPosts?.(), [refetchPosts]);
  const destinationRows = useMemo(() => (destinations || []).filter((item) => item && (item.id || item.slug || item._id)), [destinations]);
  const packageRows = useMemo(() => (packages || []).filter((item) => item && (item.id || item.slug || item._id)), [packages]);
  const postRows = useMemo(() => (posts || []).filter((item) => item && (item.id || item.slug || item._id)), [posts]);

  return <section className="db-live-section" aria-label="Live travel discovery"><style>{styles}</style>
    <LiveRow title="Explore destinations" eyebrow="Real places, ready to discover" to="/destinations" loading={destinationsLoading} error={destinationsError ? "We could not load live destinations. Please try again." : ""} items={destinationRows} kind="destinations" onRetry={retryDestinations} emptyText="No published destinations are available right now." renderItem={(destination) => <div className="db-live-destination" key={destination.id || destination.slug || destination._id}><DestinationCard destination={destination} compact={false} onWishlistToggle={toggleWishlist} /></div>} />
    <LiveRow title="Featured safari packages" eyebrow="Journeys published by Altuvera" to="/packages" loading={packagesLoading} error={packagesError} items={packageRows} kind="packages" onRetry={loadPackages} emptyText="No published packages are available right now." renderItem={(pkg,index) => <div className="db-live-package" key={pkg.id || pkg.slug || pkg._id}><HorizontalPackageCard pkg={pkg} index={index} wishlist={packageWishlist} onWishlist={handlePackageWishlist} /></div>} />
    <LiveRow title="Stories from the journey" eyebrow="Guides, ideas and inspiration" to="/posts" loading={postsLoading} error={postsError ? "We could not load live travel stories. Please try again." : ""} items={postRows} kind="stories" onRetry={retryPosts} emptyText="No published travel stories are available right now." renderItem={(post,index) => <div className="db-live-story" key={post.id || post.slug || post._id}><HorizontalPostCard post={post} index={index} /></div>} />
  </section>;
}