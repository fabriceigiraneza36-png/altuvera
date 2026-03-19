import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useUserAuth } from "../../context/UserAuthContext";
import DashboardLayout from "../../components/users/DashboardLayout";
import { HiCalendar, HiLocationMarker, HiUsers, HiClock } from "react-icons/hi";
import Loader from "../../components/common/Loader";
import "./AuthPages.css";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadBookings = () => {
      setLoading(true);
      try {
        const raw = localStorage.getItem("altuvera_bookings");
        const parsed = raw ? JSON.parse(raw) : [];
        if (!cancelled) {
          setBookings(Array.isArray(parsed) ? parsed : []);
        }
      } catch {
        if (!cancelled) setBookings([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadBookings();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <Loader />;

  return (
    <>
      <Helmet>
        <title>My Bookings | Altuvera</title>
      </Helmet>
      <DashboardLayout
        title="My Bookings"
        subtitle="Track and manage your safari adventures"
      >
        <div className="bookings-wrapper">
          <style>{`
            .bookings-wrapper .booking-card {
              box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
              border: 1px solid #f1f5f9;
            }
          `}</style>
          {bookings.length === 0 ? (
            <div className="empty-state">
              <HiCalendar className="empty-icon" />
              <h3>No bookings yet</h3>
              <p>Ready for an adventure? Start planning your safari!</p>
              <Link to="/destinations" className="empty-cta">
                Explore Destinations
              </Link>
            </div>
          ) : (
            <div className="bookings-list">
              {bookings.map((b) => (
                <div key={b._id || b.id} className="booking-card">
                  <div className="booking-status-bar">
                    <span
                      className={`booking-status ${b.status?.toLowerCase() || "pending"}`}
                    >
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
                      <span>
                        <HiCalendar />{" "}
                        {new Date(b.travelDate).toLocaleDateString()}
                      </span>
                    )}
                    {b.destination?.country && (
                      <span>
                        <HiLocationMarker /> {b.destination.country}
                      </span>
                    )}
                    {b.travelers && (
                      <span>
                        <HiUsers /> {b.travelers} travelers
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
