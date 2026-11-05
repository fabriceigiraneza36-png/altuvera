import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import BookingVerifyResult from "./BookingVerifyResult";
import "./BookingEmailVerification.css";

const API_BASE_RAW = String(import.meta.env.VITE_API_URL || "https://backend-jd8f.onrender.com/api")
  .trim()
  .replace(/\/+$/, "");
const API = API_BASE_RAW.toLowerCase().endsWith("/api") ? API_BASE_RAW : `${API_BASE_RAW}/api`;

export default function ConfirmBookingRequest() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const status = params.get("status");
  const token = params.get("token");
  const [state, setState] = useState("loading");
  const [message, setMessage] = useState("Confirming your booking request securely…");

  useEffect(() => {
    if (!token) {
      if (status) return undefined;
      setState("error");
      setMessage("This confirmation link is missing its security token. Open the latest email from Altuvera or contact our team.");
      return undefined;
    }

    let disposed = false;
    let redirectTimer;
    const controller = new AbortController();

    const verify = async () => {
      try {
        const response = await fetch(
          `${API}/bookings/verify-email/${encodeURIComponent(token)}?json=1`,
          {
            method: "GET",
            credentials: "omit",
            cache: "no-store",
            signal: controller.signal,
            headers: { Accept: "application/json" },
          }
        );

        const contentType = response.headers.get("content-type") || "";
        const body = contentType.includes("application/json")
          ? await response.json().catch(() => ({}))
          : null;

        if (!body) {
          throw new Error("Altuvera returned an unexpected confirmation response. Reopen the latest email link or contact support.");
        }
        if (!response.ok || !body.success) {
          throw new Error(body.message || body.error || "This confirmation link could not be verified. It may have expired or already been used.");
        }
        if (disposed) return;

        setState("success");
        setMessage(
          body.alreadyVerified
            ? "Your email address was already confirmed. Altuvera can continue reviewing your booking request."
            : "Your booking request email is confirmed. Altuvera can now review your details and plan the next step."
        );

        const reference = body.data?.booking_number || "";
        redirectTimer = window.setTimeout(() => {
          if (disposed) return;
          navigate(
            `/booking/verify?status=${body.alreadyVerified ? "already_verified" : "success"}&ref=${encodeURIComponent(reference)}`,
            { replace: true }
          );
        }, 1100);
      } catch (error) {
        if (disposed || error?.name === "AbortError") return;
        setState("error");
        setMessage(
          error?.message ||
          "We could not verify this email. Check your connection and reopen the latest message from Altuvera."
        );
      }
    };

    verify();
    return () => {
      disposed = true;
      controller.abort();
      if (redirectTimer) window.clearTimeout(redirectTimer);
    };
  }, [token, status, navigate]);

  if (!token && status) return <BookingVerifyResult />;

  const isLoading = state === "loading";
  const isSuccess = state === "success";

  return (
    <main className="bev-page">
      <div className="bev-container">
        <header className="bev-header">
          <Link to="/" className="bev-brand" aria-label="Altuvera home">
            <span className="bev-brand-mark"><img src="/favicon.svg" alt="" /></span>
            <span className="bev-brand-name"><strong>ALTUVERA</strong><small>SAFARIS</small></span>
          </Link>
          <div className="bev-trust"><ShieldCheck size={16} /><span>Secure email verification</span></div>
        </header>

        <div className="bev-layout">
          <section className="bev-intro">
            <div className="bev-eyebrow"><span className="bev-live-dot" /> BOOKING CONFIRMATION</div>
            <h1>One quick check.<br /><em>Then we take it from here.</em></h1>
            <p>Confirm that your booking email belongs to you. This signed link is processed securely and can only be used for its intended verification step.</p>
            <div className="bev-trust-list">
              <div className="bev-trust-item"><span><LockKeyhole size={16} /></span><div><strong>Signed verification link</strong><small>No password or browser session is required for this email check.</small></div></div>
              <div className="bev-trust-item"><span><ShieldCheck size={16} /></span><div><strong>Private booking details</strong><small>Your confirmation is linked to the request that generated this email.</small></div></div>
              <div className="bev-trust-item"><span><CheckCircle2 size={16} /></span><div><strong>Clear confirmation status</strong><small>We’ll show whether your email was confirmed or the link needs attention.</small></div></div>
            </div>
          </section>

          <section className="bev-panel-wrap">
            <div className="bev-panel" aria-live="polite">
              <div className="bev-panel-head">
                <span className="bev-panel-label"><ShieldCheck size={15} /> ALTUVERA BOOKING CHECK</span>
                <span className={"bev-panel-state " + (state === "error" ? "is-error" : "")}>
                  {isLoading ? <><LoaderCircle size={13} /> Checking</> : isSuccess ? <><CheckCircle2 size={13} /> Verified</> : <><AlertTriangle size={13} /> Attention needed</>}
                </span>
              </div>

              <div className="bev-state">
                {isLoading ? (
                  <>
                    <div className="bev-loader-mark"><span className="bev-spinner" /><ShieldCheck size={29} /></div>
                    <div className="bev-eyebrow">SECURE EMAIL CHECK</div>
                    <div className="bev-loader-copy"><h2>Confirming your request</h2><p>{message}</p></div>
                    <div className="bev-progress"><span /></div>
                    <div className="bev-skeleton"><i /><i /><i /></div>
                  </>
                ) : isSuccess ? (
                  <>
                    <div className="bev-status-icon"><CheckCircle2 size={36} /></div>
                    <div className="bev-eyebrow">EMAIL CONFIRMED</div>
                    <h2>Your booking email is verified</h2>
                    <p>{message}</p>
                    <div className="bev-progress"><span /></div>
                    <div className="bev-help">Opening your confirmation summary…</div>
                  </>
                ) : (
                  <>
                    <div className="bev-status-icon is-error"><AlertTriangle size={34} /></div>
                    <div className="bev-eyebrow">CONFIRMATION NOT COMPLETED</div>
                    <h2>We could not verify this link</h2>
                    <p>{message}</p>
                    <div className="bev-actions">
                      <Link to="/" className="bev-button bev-button--primary">Return to Altuvera <ArrowRight size={16} /></Link>
                      <a href="mailto:info@altuverasafaris.com" className="bev-button bev-button--secondary">Contact support</a>
                    </div>
                    <div className="bev-help">For security, avoid forwarding booking verification links to other people.</div>
                  </>
                )}
              </div>
            </div>
          </section>
        </div>

        <footer className="bev-footer">
          <strong>ALTUVERA</strong>
          <span>·</span>
          <span>Secure booking communication</span>
          <Link to="/"><ArrowLeft size={13} /> Back to website</Link>
        </footer>
      </div>
    </main>
  );
}
