import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useUserAuth } from "../../context/UserAuthContext";
import { HiLockClosed, HiEye, HiEyeOff, HiCheck } from "react-icons/hi";
import "./AuthPages.css";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword } = useUserAuth();
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) { setError("Min 6 characters"); return; }
    if (form.password !== form.confirm) { setError("Passwords don't match"); return; }
    try {
      setLoading(true);
      await resetPassword(token, form.password);
      setDone(true);
      setTimeout(() => navigate("/"), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Reset Password | Altuvera</title></Helmet>
      <div className="auth-page center">
        <div className="reset-card">
          <h1>Set New Password</h1>
          {done ? (
            <div className="auth-page-message success"><HiCheck /> Password reset! Redirecting…</div>
          ) : (
            <>
              {error && <div className="auth-page-message error">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="auth-input-group">
                  <HiLockClosed className="auth-input-icon" />
                  <input type={show ? "text" : "password"} placeholder="New Password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required />
                  <button type="button" className="auth-password-toggle" onClick={() => setShow((s) => !s)}>
                    {show ? <HiEyeOff /> : <HiEye />}
                  </button>
                </div>
                <div className="auth-input-group" style={{ marginTop: "0.75rem" }}>
                  <HiLockClosed className="auth-input-icon" />
                  <input type={show ? "text" : "password"} placeholder="Confirm Password" value={form.confirm} onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))} required />
                </div>
                <button type="submit" className="auth-submit-btn" disabled={loading} style={{ marginTop: "1.25rem" }}>
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}