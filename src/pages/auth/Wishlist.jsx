import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/users/DashboardLayout";
import { HiHeart, HiTrash, HiLocationMarker } from "react-icons/hi";
import Loader from "../../components/common/Loader";
import { useWishlist } from "../../hooks/useWishlist";
import { apiFetch } from "../../utils/apiBase";
import "./AuthPages.css";

export default function Wishlist() {
  const { wishlistIds, toggleWishlist } = useWishlist();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadItems = async () => {
      setLoading(true);
      try {
        const ids = Array.from(wishlistIds);
        if (ids.length === 0) {
          setItems([]);
          return;
        }

        const results = await Promise.all(
          ids.map(async (id) => {
            try {
              const res = await apiFetch(`/destinations/${id}`);
              if (!res.ok) return null;
              const json = await res.json();
              return json.data || json;
            } catch {
              return null;
            }
          }),
        );

        if (!cancelled) setItems(results.filter(Boolean));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadItems();
    return () => {
      cancelled = true;
    };
  }, [wishlistIds]);

  if (loading) return <Loader />;

  return (
    <>
      <Helmet>
        <title>My Wishlist | Altuvera</title>
      </Helmet>
      <DashboardLayout
        title="My Wishlist"
        subtitle="Destinations you'd love to explore"
      >
        <div className="wishlist-wrapper">
          <style>{`
            .wishlist-wrapper .wishlist-card {
              box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
              border: 1px solid #f1f5f9;
            }
          `}</style>
          {items.length === 0 ? (
            <div className="empty-state">
              <HiHeart className="empty-icon" />
              <h3>Your wishlist is empty</h3>
              <p>Save destinations you love for later!</p>
              <Link to="/destinations" className="empty-cta">
                Browse Destinations
              </Link>
            </div>
          ) : (
            <div className="wishlist-grid">
              {items.map((item) => (
                <div key={item._id || item.id} className="wishlist-card">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="wishlist-img"
                    />
                  )}
                  <div className="wishlist-card-body">
                    <h3>{item.name}</h3>
                    {item.country && (
                      <p>
                        <HiLocationMarker /> {item.country}
                      </p>
                    )}
                  </div>
                  <button
                    className="wishlist-remove"
                    onClick={() => toggleWishlist(item._id || item.id)}
                    title="Remove"
                  >
                    <HiTrash />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
