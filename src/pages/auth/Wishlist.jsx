import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useUserAuth } from "../../context/UserAuthContext";
import DashboardLayout from "../../components/users/DashboardLayout";
import { HiHeart, HiTrash, HiLocationMarker } from "react-icons/hi";
import Loader from "../../components/common/Loader";
import "./AuthPages.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function Wishlist() {
  const { authFetch } = useUserAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await authFetch(`${API_URL}/users/wishlist`);
        setItems(data.data || data || []);
      } catch {
        // endpoint may not exist yet
      } finally {
        setLoading(false);
      }
    })();
  }, [authFetch]);

  const removeItem = async (id) => {
    try {
      await authFetch(`${API_URL}/users/wishlist/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => (i._id || i.id) !== id));
    } catch {
      /* ignore */
    }
  };

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
                    onClick={() => removeItem(item._id || item.id)}
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
