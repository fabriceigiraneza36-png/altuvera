// src/pages/auth/Checklist.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useUserAuth } from "../../context/UserAuthContext";
import { useNotifications } from "../../hooks/useNotifications";
import DashboardLayout from "../../components/auth/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCheckSquare, FiSend, FiDownload, FiClock,
  FiRefreshCw, FiCheck, FiBell,
} from "react-icons/fi";

const css = `
  .cl-root * { box-sizing: border-box; }
  .cl-root { display: flex; flex-direction: column; gap: 1.5rem; animation: clFade 0.5s ease-out; }

  .cl-hero {
    background: linear-gradient(135deg, #78350f 0%, #92400e 50%, #d97706 100%);
    border-radius: 20px; padding: 2rem 2.5rem; position: relative; overflow: hidden;
  }
  .cl-hero-title { font-family: 'Playfair Display', serif; font-size: 1.8rem; font-weight: 800; color: #fff; margin: 0 0 6px; position: relative; z-index: 1; }
  .cl-hero-sub { color: rgba(255,255,255,0.75); font-size: 0.9rem; margin: 0; position: relative; z-index: 1; }

  .cl-request-card {
    background: #fff; border-radius: 18px; border: 1.5px solid #e2e8f0;
    box-shadow: 0 2px 10px rgba(0,0,0,0.04); padding: 24px 28px;
  }
  .cl-request-card h3 {
    font-size: 1rem; font-weight: 800; color: #0f172a; margin: 0 0 6px;
    display: flex; align-items: center; gap: 8px;
  }
  .cl-request-card p { font-size: 0.88rem; color: #64748b; margin: 0 0 18px; line-height: 1.6; }

  .cl-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
  .cl-field label {
    font-size: 0.75rem; font-weight: 800; color: #475569;
    text-transform: uppercase; letter-spacing: 0.5px;
  }
  .cl-input, .cl-select, .cl-textarea {
    padding: 10px 14px; border-radius: 12px;
    border: 1.5px solid #e2e8f0; font-size: 0.9rem;
    font-family: inherit; outline: none; background: #fff;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .cl-input:focus, .cl-select:focus, .cl-textarea:focus {
    border-color: #d97706; box-shadow: 0 0 0 3px rgba(217,119,6,0.1);
  }
  .cl-textarea { resize: vertical; min-height: 90px; }
  .cl-select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 12px center;
    padding-right: 36px;
  }
  .cl-submit-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 12px 28px; border-radius: 12px; border: none;
    background: linear-gradient(135deg,#d97706,#b45309);
    color: #fff; font-size: 0.9rem; font-weight: 800;
    cursor: pointer; transition: all 0.2s; font-family: inherit;
    box-shadow: 0 4px 12px rgba(217,119,6,0.3);
  }
  .cl-submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(217,119,6,0.4); }
  .cl-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  /* ── Past requests ── */
  .cl-req-card {
    background: #fff; border-radius: 16px; border: 1.5px solid #e2e8f0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04); overflow: hidden; margin-bottom: 12px;
  }
  .cl-req-strip { height: 3px; }
  .cl-req-body { padding: 16px 20px; }
  .cl-req-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; flex-wrap: wrap; }
  .cl-req-title { font-size: 0.95rem; font-weight: 800; color: #0f172a; margin: 0 0 3px; }
  .cl-req-date  { font-size: 0.72rem; color: #94a3b8; margin: 0; }
  .cl-req-status {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 8px;
    font-size: 0.72rem; font-weight: 800; border: 1px solid;
    text-transform: uppercase; letter-spacing: 0.3px;
  }
  .cl-req-desc { margin-top: 10px; font-size: 0.84rem; color: #64748b; }
  .cl-download-btn {
    display: inline-flex; align-items: center; gap: 6px;
    margin-top: 12px; padding: 8px 18px; border-radius: 10px;
    background: linear-gradient(135deg,#059669,#047857); color: #fff;
    border: none; font-size: 0.82rem; font-weight: 700;
    cursor: pointer; transition: all 0.2s; font-family: inherit;
    box-shadow: 0 3px 8px rgba(5,150,105,0.25);
  }
  .cl-download-btn:hover { transform: translateY(-1px); }

  .cl-notif-hint {
    display: flex; align-items: center; gap: 10px;
    background: #fefce8; border: 1px solid #fde68a;
    border-radius: 12px; padding: 12px 16px;
    font-size: 0.84rem; color: #92400e; font-weight: 600;
  }

  @keyframes clFade { from{opacity:0;transform:translateY(12px);} to{opacity:1;transform:translateY(0);} }
  .cl-spin { animation: clSpin 1s linear infinite; }
  @keyframes clSpin { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
`;

const REQUEST_TYPES = [
  "General Travel Checklist",
  "Safari Packing List",
  "Beach Holiday Checklist",
  "Mountain Trekking Checklist",
  "Family Trip Checklist",
  "Photography Tour Checklist",
  "Cultural Tour Checklist",
];

export default function Checklist() {
  const { user, authFetch } = useUserAuth();
  const { notifications }   = useNotifications();

  const [form,      setForm]      = useState({
    title:       "",
    type:        REQUEST_TYPES[0],
    destination: "",
    travelDate:  "",
    notes:       "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [requests,   setRequests]   = useState([]);
  const [loadingR,   setLoadingR]   = useState(true);
  const [error,      setError]      = useState(null);

  // Fetch existing checklist requests
  const fetchRequests = useCallback(async () => {
    setLoadingR(true);
    try {
      // We store checklist requests as notifications with type="checklist_request"
      // or as a dedicated endpoint — using notifications for now
      const data = await authFetch(
        "/notifications/my?type=checklist_request,checklist_ready&limit=20",
      ).catch(() => ({ data: [] }));
      setRequests(data?.data || []);
    } catch { /* silent */ } finally { setLoadingR(false); }
  }, [authFetch]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  // Listen for checklist_ready notifications
  const checklistNotifs = notifications.filter(
    (n) => n.type === "checklist_ready",
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.type) return;
    setSubmitting(true);
    setError(null);

    try {
      // Submit to backend as a notification/request to admin
      await authFetch("/notifications/checklist-request", {
        method: "POST",
        body: JSON.stringify({
          title:       form.title || `${form.type} Request`,
          type:        form.type,
          destination: form.destination,
          travel_date: form.travelDate,
          notes:       form.notes,
          user_email:  user?.email,
          user_name:   user?.fullName || user?.name,
        }),
      }).catch(async () => {
        // Fallback: send as contact message
        await authFetch("/contact", {
          method: "POST",
          body: JSON.stringify({
            name:    user?.fullName || user?.name || "User",
            email:   user?.email,
            subject: `Checklist Request: ${form.type}`,
            message: `Request Type: ${form.type}\nDestination: ${form.destination}\nTravel Date: ${form.travelDate}\nNotes: ${form.notes}`,
            type:    "checklist_request",
          }),
        });
      });

      setSubmitted(true);
      setForm({ title: "", type: REQUEST_TYPES[0], destination: "", travelDate: "", notes: "" });
      setTimeout(() => setSubmitted(false), 6000);
      fetchRequests();
    } catch (err) {
      setError(err.message || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Trip Checklist | Altuvera</title>
      </Helmet>
      <DashboardLayout
        title="Trip Checklist"
        subtitle="Request a personalized trip checklist from our team."
      >
        <style>{css}</style>
        <div className="cl-root">

          <div className="cl-hero">
            <div style={{ fontSize: "2rem", marginBottom: 8, position: "relative", zIndex: 1 }}>📋</div>
            <h1 className="cl-hero-title">Request a Trip Checklist</h1>
            <p className="cl-hero-sub">
              Our team will prepare a personalized PDF checklist for your adventure and send it to you directly.
            </p>
          </div>

          {/* Notification hint */}
          {checklistNotifs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="cl-notif-hint"
            >
              <FiBell size={18} />
              <span>
                🎉 Your checklist is ready! Check your{" "}
                <a href="/notifications" style={{ color: "#d97706", fontWeight: 800 }}>
                  notifications
                </a>{" "}
                to download it.
              </span>
            </motion.div>
          )}

          {/* Request Form */}
          <div className="cl-request-card">
            <h3><FiCheckSquare size={16} color="#d97706" /> New Checklist Request</h3>
            <p>
              Fill in your trip details and our team will prepare a comprehensive PDF checklist
              tailored to your destination and travel style. You'll receive a notification when it's ready.
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="cl-field" style={{ gridColumn: "1/-1" }}>
                  <label>Request Title (optional)</label>
                  <input
                    type="text"
                    name="title"
                    className="cl-input"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. My Kenya Safari Checklist"
                  />
                </div>

                <div className="cl-field">
                  <label>Checklist Type *</label>
                  <select
                    name="type"
                    className="cl-select"
                    value={form.type}
                    onChange={handleChange}
                    required
                  >
                    {REQUEST_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="cl-field">
                  <label>Destination</label>
                  <input
                    type="text"
                    name="destination"
                    className="cl-input"
                    value={form.destination}
                    onChange={handleChange}
                    placeholder="e.g. Serengeti, Tanzania"
                  />
                </div>

                <div className="cl-field">
                  <label>Travel Date</label>
                  <input
                    type="date"
                    name="travelDate"
                    className="cl-input"
                    value={form.travelDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div className="cl-field" style={{ gridColumn: "1/-1" }}>
                  <label>Special Notes</label>
                  <textarea
                    name="notes"
                    className="cl-textarea"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Any specific requirements, medical needs, travel style preferences…"
                  />
                </div>
              </div>

              {error && (
                <div style={{
                  padding: "12px 16px", background: "#fef2f2",
                  border: "1px solid #fecaca", borderRadius: 10,
                  color: "#991b1b", fontSize: "0.85rem", marginBottom: 14,
                }}>
                  ⚠️ {error}
                </div>
              )}

              {submitted && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    padding: "12px 16px", background: "#f0fdf4",
                    border: "1px solid #bbf7d0", borderRadius: 10,
                    color: "#166534", fontSize: "0.85rem", marginBottom: 14,
                    fontWeight: 700, display: "flex", alignItems: "center", gap: 8,
                  }}
                >
                  <FiCheck size={16} /> Request submitted! Our team will prepare your checklist shortly.
                </motion.div>
              )}

              <button
                type="submit"
                className="cl-submit-btn"
                disabled={submitting}
              >
                {submitting
                  ? <><FiRefreshCw size={14} className="cl-spin" /> Submitting…</>
                  : <><FiSend size={14} /> Submit Request</>
                }
              </button>
            </form>
          </div>

          {/* Past Requests */}
          {requests.length > 0 && (
            <div>
              <p style={{
                fontSize: "0.78rem", fontWeight: 800, color: "#94a3b8",
                textTransform: "uppercase", letterSpacing: "0.6px", margin: "0 0 12px",
              }}>
                Previous Requests
              </p>
              <AnimatePresence>
                {requests.map((req) => {
                  const isReady = req.type === "checklist_ready";
                  return (
                    <motion.div
                      key={req.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="cl-req-card"
                    >
                      <div
                        className="cl-req-strip"
                        style={{
                          background: isReady
                            ? "linear-gradient(90deg,#059669,#34d399)"
                            : "linear-gradient(90deg,#d97706,#fbbf24)",
                        }}
                      />
                      <div className="cl-req-body">
                        <div className="cl-req-top">
                          <div>
                            <p className="cl-req-title">{req.title}</p>
                            <p className="cl-req-date">
                              {req.created_at
                                ? new Date(req.created_at).toLocaleDateString("en-US", {
                                    month: "long", day: "numeric", year: "numeric",
                                  })
                                : "—"}
                            </p>
                          </div>
                          <span
                            className="cl-req-status"
                            style={
                              isReady
                                ? { color: "#059669", background: "#f0fdf4", borderColor: "#bbf7d0" }
                                : { color: "#d97706", background: "#fffbeb", borderColor: "#fde68a" }
                            }
                          >
                            {isReady ? <><FiCheck size={11} /> Ready</> : <><FiClock size={11} /> Pending</>}
                          </span>
                        </div>
                        {req.message && (
                          <p className="cl-req-desc">{req.message}</p>
                        )}
                        {isReady && req.action_url && (
                          <a
                            href={req.action_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cl-download-btn"
                          >
                            <FiDownload size={14} /> Download Checklist PDF
                          </a>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

        </div>
      </DashboardLayout>
    </>
  );
}