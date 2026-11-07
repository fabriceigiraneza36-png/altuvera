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
.db-live-track{display:flex;gap:16px;overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;padding:3px 3px 14px;scrollbar-width:none;scrollbar-color:transparent transparent;-webkit-overflow-scrolling:touch}.db-live-track::-webkit-scrollbar{display:none;width:0;height:0}
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

/* Premium dashboard package cards: consistent heights, readable content and touch-friendly layout. */
.db-live-package>.hpkg-card{position:relative;display:flex;flex-direction:column;height:100%;min-height:100%;background:linear-gradient(180deg,#fff 0%,#fcfffd 100%);border:1px solid #dce9e2;border-radius:22px;box-shadow:0 8px 24px rgba(6,78,59,.075);transition:transform .28s ease,box-shadow .28s ease,border-color .28s ease;isolation:isolate}
.db-live-package>.hpkg-card:focus-visible{outline:3px solid #10b981;outline-offset:3px}
.db-live-package .hpkg-img-wrap{position:relative;height:clamp(172px,19vw,218px);flex:0 0 auto;overflow:hidden;background:#d1fae5}
.db-live-package .hpkg-img-wrap:after{content:"";position:absolute;inset:35% 0 0;pointer-events:none;background:linear-gradient(180deg,transparent,rgba(2,44,34,.5));z-index:1}
.db-live-package .hpkg-img-wrap img{transition:transform .65s cubic-bezier(.2,.7,.2,1);will-change:transform}
.db-live-package>.hpkg-card:hover .hpkg-img-wrap img{transform:scale(1.055)}
.db-live-package .hpkg-badge,.db-live-package .hpkg-discount,.db-live-package .hpkg-wish,.db-live-package .hpkg-duration-pill{z-index:2}
.db-live-package .hpkg-badge{top:13px;left:13px;padding:6px 10px;border-radius:999px;font-size:.65rem;font-weight:850;letter-spacing:.035em;box-shadow:0 4px 12px rgba(15,23,42,.12)}
.db-live-package .hpkg-discount{top:13px;right:13px;padding:6px 9px;border-radius:999px;font-size:.65rem;font-weight:900;background:#fff7ed;color:#c2410c;box-shadow:0 4px 12px rgba(15,23,42,.12)}
.db-live-package .hpkg-wish{top:12px;right:12px;width:38px;height:38px;display:grid;place-items:center;border:1px solid rgba(255,255,255,.75);border-radius:50%;background:rgba(255,255,255,.94);box-shadow:0 5px 16px rgba(15,23,42,.15);transition:transform .2s ease,background .2s ease}
.db-live-package .hpkg-wish:hover{transform:scale(1.08);background:#fff}
.db-live-package .hpkg-duration-pill{bottom:12px;left:13px;padding:6px 10px;border:1px solid rgba(255,255,255,.3);border-radius:999px;background:rgba(2,44,34,.76);color:#fff;font-size:.68rem;font-weight:800;backdrop-filter:blur(8px)}
.db-live-package .hpkg-body{flex:1 1 auto;gap:10px;padding:17px 17px 16px}
.db-live-package .hpkg-category{align-self:flex-start;max-width:100%;padding:5px 9px;border-radius:7px;background:#ecfdf5;color:#047857;font-size:.65rem;font-weight:850;letter-spacing:.065em;text-transform:uppercase;overflow-wrap:anywhere}
.db-live-package .hpkg-title{display:-webkit-box;min-height:0;margin:0;color:#102a22;font-size:1rem;font-weight:850;line-height:1.4;letter-spacing:-.02em;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.db-live-package .hpkg-meta{display:flex;flex-wrap:wrap;gap:6px;color:#64748b;font-size:.76rem}
.db-live-package .hpkg-meta-item{display:flex;align-items:center;gap:5px;min-width:0;overflow-wrap:anywhere}
.db-live-package .hpkg-desc{display:-webkit-box;margin:0;color:#64748b;font-size:.8rem;line-height:1.65;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.db-live-package .hpkg-body>div[style*="flex-wrap"]{gap:6px!important}
.db-live-package .hpkg-body>div[style*="flex-wrap"] span{font-size:.65rem!important;padding:5px 8px!important;line-height:1.3}
.db-live-package .hpkg-footer{display:flex;align-items:center;justify-content:flex-start;margin-top:auto;padding-top:13px;border-top:1px solid #edf3ef}
.db-live-package .hpkg-cta{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:38px;padding:0 13px;border-radius:11px;background:#047857;color:#fff;font-size:.77rem;font-weight:850;transition:background .2s ease,transform .2s ease}
.db-live-package>.hpkg-card:hover .hpkg-cta{background:#065f46;transform:translateX(2px)}
.db-live-package .hpkg-cta svg{width:14px;height:14px}
@media(min-width:761px){.db-live-package{flex-basis:clamp(250px,28vw,310px)}}
@media(max-width:640px){.db-live-package{flex:0 0 min(82vw,320px);width:min(82vw,320px)}.db-live-package>.hpkg-card{border-radius:20px}.db-live-package .hpkg-img-wrap{height:176px}.db-live-package .hpkg-body{padding:15px;gap:9px}.db-live-package .hpkg-title{font-size:.96rem}.db-live-package .hpkg-desc{font-size:.78rem;-webkit-line-clamp:3}.db-live-package .hpkg-wish{width:40px;height:40px}}
@media(max-width:360px){.db-live-package{flex-basis:86vw;width:86vw}.db-live-package .hpkg-img-wrap{height:164px}.db-live-package .hpkg-body{padding:13px}}
@media(prefers-reduced-motion:reduce){.db-live-package>.hpkg-card,.db-live-package .hpkg-img-wrap img,.db-live-package .hpkg-cta{transition:none}}
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
    <LiveRow title="Stories from the journey" eyebrow="Guides, ideas and inspiration" to="/posts" loading={postsLoading} error={postsError ? "We could not load live travel stories. Please try again." : ""} items={postRows} kind="stories" onRetry={retryPosts} emptyText="No published travel stories are available right now." renderItem={(post,index) => <div className="db-live-story" key={post.id || post.slug || post._id}><HorizontalPostCard post={post} index={index} fill /></div>} />
  </section>;
}