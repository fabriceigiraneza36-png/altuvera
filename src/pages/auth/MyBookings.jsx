import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useUserAuth } from "../../context/UserAuthContext";
import DashboardLayout from "../../components/auth/DashboardLayout";
import { HiCalendar, HiLocationMarker, HiUsers, HiClock } from "react-icons/hi";
import { FiDollarSign } from "react-icons/fi";
import Loader from "../../components/common/Loader";
import "./AuthPages.css";

export default function MyBookings() {
  const { authFetch } = useUserAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadBookings = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await authFetch("/bookings/my-bookings");
        setBookings(response?.data || []);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load bookings");
          setBookings([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadBookings();
    return () => {
      cancelled = true;
    };
  }, [authFetch]);

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
        {error && (
          <div style={{
            padding: "1.25rem",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 12,
            color: "#dc2626",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "1.5rem"
          }}>
            <HiExclamationCircle size={20} />
            {error}
          </div>
        )}

        <div className="bookings-wrapper">
          {bookings.length === 0 ? (
            <div className="empty-state" style={{
              textAlign: "center",
              padding: "80px 20px",
              background: "linear-gradient(135deg, #f0fdf4, #ffffff)",
              borderRadius: 24,
              border: "1px dashed #a3c79d"
            }}>
              <HiCalendar className="empty-icon" style={{
                fontSize: "4rem",
                color: "#059669",
                marginBottom: "1rem",
                opacity: 0.8
              }} />
              <h3 style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#1f2937",
                marginBottom: "0.5rem"
              }}>No bookings yet</h3>
              <p style={{
                color: "#64748b",
                marginBottom: "1.5rem"
              }}>Ready for an adventure? Start planning your safari!</p>
              <Link to="/destinations" className="empty-cta" style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 24px",
                background: "linear-gradient(135deg, #059669, #10b981)",
                color: "white",
                textDecoration: "none",
                borderRadius: 12,
                fontWeight: 600,
                transition: "transform 0.3s ease, box-shadow 0.3s ease"
              }}>
                Explore Destinations
              </Link>
            </div>
          ) : (
            <div className="bookings-list" style={{
              display: "grid",
              gap: "24px"
            }}>
              {bookings.map((b) => (
                <div key={b._id || b.id} className="booking-card" style={{
                  borderRadius: 16,
                  overflow: "hidden",
                  background: "white",
                  marginBottom: 0,
                  transition: "box-shadow 0.3s ease",
                  boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06)",
                  border: "1px solid #f1f5f9"
                }}>
                  <div className="booking-status-bar" style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 20px",
                    background: "#f8fafc",
                    borderBottom: "1px solid #f1f5f9"
                  }}>
                    <span
                      className={`booking-status ${(b.status || "pending").toLowerCase()}`}
                      style={{
                        display: "inline-block",
                        padding: "4px 12px",
                        borderRadius: "999px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        background: b.status?.toLowerCase() === "confirmed" ? "#dcfce7" :
                                   b.status?.toLowerCase() === "cancelled" ? "#fee2e2" :
                                   b.status?.toLowerCase() === "completed" ? "#d1fae5" : "#fef3c7",
                        color: b.status?.toLowerCase() === "confirmed" ? "#16a34a" :
                               b.status?.toLowerCase() === "cancelled" ? "#dc2626" :
                               b.status?.toLowerCase() === "completed" ? "#059669" : "#d97706"
                      }}
                    >
                      {b.status || "Pending"}
                    </span>
                    <span className="booking-date" style={{
                      fontSize: "0.875rem",
                      color: "#64748b",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}>
                      <HiClock /> {new Date(b.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ padding: "24px" }}>
                    <h3 className="booking-title" style={{
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      color: "#1f2937",
                      marginBottom: "16px"
                    }}>
                      {b.destination?.name || b.service || "Safari Booking"}
                    </h3>
                    <div className="booking-details" style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "16px"
                    }}>
                      {b.travelDate && (
                        <span style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          color: "#475569",
                          fontSize: "0.9rem"
                        }}>
                          <HiCalendar /> {new Date(b.travelDate).toLocaleDateString()}
                        </span>
                      )}
                      {b.destination?.country && (
                        <span style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          color: "#475569",
                          fontSize: "0.9rem"
                        }}>
                          <HiLocationMarker /> {b.destination.country}
                        </span>
                      )}
                      {b.travelers && (
                        <span style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          color: "#475569",
                          fontSize: "0.9rem"
                        }}>
                          <HiUsers size={16} /> {b.travelers} travelers
                        </span>
                      )}
                      {b.guestCount && (
                        <span style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          color: "#475569",
                          fontSize: "0.9rem"
                        }}>
                          <HiUsers size={16} /> {b.guestCount} guests
                        </span>
                      )}
                      {b.startDate && b.endDate && (
                        <span style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          color: "#475569",
                          fontSize: "0.9rem"
                        }}>
                          <HiCalendar /> {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                        </span>
                      )}
                      {b.price && (
                        <span style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          color: "#475569",
                          fontSize: "0.9rem"
                        }}>
                          <HiCurrencyDollar size={16} /> ${(b.price).toLocaleString()}
                        </span>
                      )}
                    </div>
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
