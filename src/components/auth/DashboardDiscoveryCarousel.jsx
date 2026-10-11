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