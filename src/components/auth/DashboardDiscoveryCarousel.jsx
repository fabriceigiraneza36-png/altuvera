import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Compass, RefreshCw } from "lucide-react";
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
.db-live-package,.db-live-story{display:flex;align-items:stretch;min-width:0}
.db-live-package>.hpkg-card,.db-live-story>.hpost-card{width:100%;min-width:0;max-width:100%;height:100%;box-sizing:border-box;flex:1 1 auto;border-radius:18px;border:1px solid #e2e8f0;box-shadow:0 5px 18px rgba(15,23,42,.055);overflow:hidden}
.db-live-package>.hpkg-card:hover,.db-live-story>.hpost-card:hover{box-shadow:0 14px 30px rgba(15,23,42,.12);transform:translateY(-3px);border-color:#a7f3d0}
.db-live-package .hpkg-img-wrap{height:clamp(145px,18vw,190px);flex:0 0 auto}
.db-live-package .hpkg-body,.db-live-story .hpost-body{min-width:0;overflow-wrap:anywhere;padding:16px;gap:9px}
.db-live-package .hpkg-title,.db-live-story .hpost-title{font-size:.95rem;line-height:1.4;min-height:2.65em;overflow-wrap:anywhere}
.db-live-package .hpkg-desc,.db-live-story .hpost-excerpt{font-size:.78rem;line-height:1.6;overflow-wrap:anywhere}
.db-live-package .hpkg-footer{margin-top:auto;padding-top:12px}
.db-live-package .hpkg-cta,.db-live-story .hpost-readmore{font-size:.76rem}
.db-live-story .hpost-img-wrap{height:clamp(145px,18vw,190px);flex:0 0 auto}
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
  return <section className="db-live-subsection" aria-label={title}>
    <div className="db-live-heading"><div><p className="db-live-eyebrow">{eyebrow}</p><h2 className="db-live-title">{title}</h2></div><Link className="db-live-link" to={to}>View all <ArrowRight size={14}/></Link></div>
    {loading ? <div className="db-live-track" aria-busy="true">{Array.from({length:3},(_,i)=><SkeletonCard key={`${kind}-skeleton-${i}`} kind={kind}/>)}</div>
      : error ? <div className="db-live-state" role="alert"><span>{error}</span><button className="db-live-retry" onClick={onRetry}><RefreshCw size={14}/> Retry</button></div>
      : items.length ? <div className="db-live-track" aria-label={`${title} carousel`}>{items.map(renderItem)}</div>
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