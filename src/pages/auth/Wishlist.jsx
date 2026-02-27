import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useUserAuth } from "../../context/UserAuthContext";
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
        const data = await authFetch(`${API_URL}/auth/wishlist`);
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
      await authFetch(`${API_URL}/auth/wishlist/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => (i._id || i.id) !== id));
    } catch { /* ignore */ }
  };

  if (loading) return <Loader />;

  return (
    <>
      <Helmet><title>My Wishlist | Altuvera</title></Helmet>
      <div className="auth-page">
        <div className="auth-page-container">
          <h1 className="auth-page-title">My Wishlist</h1>
          <p className="auth-page-subtitle">Destinations you'd love to explore</p>
          {items.length === 0 ? (
            <div className="empty-state">
              <HiHeart className="empty-icon" />
              <h3>Your wishlist is empty</h3>
              <p>Save destinations you love for later!</p>
              <Link to="/destinations" className="empty-cta">Browse Destinations</Link>
            </div>
          ) : (
            <div className="wishlist-grid">
              {items.map((item) => (
                <div key={item._id || item.id} className="wishlist-card">
                  {item.image && <img src={item.image} alt={item.name} className="wishlist-img" />}
                  <div className="wishlist-card-body">
                    <h3>{item.name}</h3>
                    {item.country && <p><HiLocationMarker /> {item.country}</p>}
                  </div>
                  <button className="wishlist-remove" onClick={() => removeItem(item._id || item.id)} title="Remove">
                    <HiTrash />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}