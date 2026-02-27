import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useUserAuth } from "../../context/UserAuthContext";
import { HiCalendar, HiLocationMarker, HiUsers, HiClock } from "react-icons/hi";
import Loader from "../../components/common/Loader";
import "./AuthPages.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function MyBookings() {
  const { authFetch } = useUserAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await authFetch(`${API_URL}/bookings/my`);
        setBookings(data.data || data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [authFetch]);

  if (loading) return <Loader />;

  return (
    <>
      <Helmet><title>My Bookings | Altuvera</title></Helmet>
      <div className="auth-page">
        <div className="auth-page-container">
          <h1 className="auth-page-title">My Bookings</h1>
          <p className="auth-page-subtitle">Track and manage your safari adventures</p>
          {error && <div className="auth-page-message error">{error}</div>}
          {bookings.length === 0 ? (
            <div className="empty-state">
              <HiCalendar className="empty-icon" />
              <h3>No bookings yet</h3>
              <p>Ready for an adventure? Start planning your safari!</p>
              <Link to="/destinations" className="empty-cta">Explore Destinations</Link>
            </div>
          ) : (
            <div className="bookings-list">
              {bookings.map((b) => (
                <div key={b._id || b.id} className="booking-card">
                  <div className="booking-status-bar">
                    <span className={`booking-status ${b.status?.toLowerCase() || "pending"}`}>
                      {b.status || "Pending"}
                    </span>
                    <span className="booking-date">
                      <HiClock /> {new Date(b.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="booking-title">
                    {b.destination?.name || b.service || "Safari Booking"}
                  </h3>
                  <div className="booking-details">
                    {b.travelDate && (
                      <span><HiCalendar /> {new Date(b.travelDate).toLocaleDateString()}</span>
                    )}
                    {b.destination?.country && (
                      <span><HiLocationMarker /> {b.destination.country}</span>
                    )}
                    {b.travelers && (
                      <span><HiUsers /> {b.travelers} travelers</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}