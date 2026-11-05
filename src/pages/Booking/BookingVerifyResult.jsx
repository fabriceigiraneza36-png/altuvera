import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Home,
  Mail,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import "./BookingEmailVerification.css";

const CONFIG = {
  success: {
    icon: CheckCircle2,
    tone: "success",
    eyebrow: "EMAIL CONFIRMED",
    title: (ref) => ref ? "Booking request verified" : "Email address verified",
    message: "Your booking email is confirmed. Altuvera’s travel team can now review your request and prepare the next step in your journey.",
  },
  already_verified: {
    icon: ShieldCheck,
    tone: "success",
    eyebrow: "ALREADY CONFIRMED",
    title: () => "Your email is already verified",
    message: "This booking email was confirmed earlier. Your request remains with Altuvera’s team for review.",
  },
  expired: {
    icon: Clock3,
    tone: "warning",
    eyebrow: "LINK EXPIRED",
    title: () => "This confirmation link has expired",
    message: "For your protection, booking verification links are time-limited. Contact Altuvera and ask for a fresh confirmation email.",
  },
  invalid: {
    icon: ShieldX,
    tone: "error",
    eyebrow: "LINK NOT VALID",
    title: () => "This link cannot be used",
    message: "The confirmation link may have been changed, or it may already have been used. Open the latest email from Altuvera or contact our team.",
  },
  error: {
    icon: AlertTriangle,
    tone: "error",
    eyebrow: "CONFIRMATION UNAVAILABLE",
    title: () => "We could not confirm your email",
    message: "Something prevented this verification from completing. Please contact Altuvera so our team can help you continue.",
  },
};

export default function BookingVerifyResult() {
  const [params] = useSearchParams();
  const status = params.get("status") || "error";
  const reference = params.get("ref") || "";
  const config = CONFIG[status] || CONFIG.error;
  const Icon = config.icon;
  const isSuccess = config.tone === "success";

  return (
    <main className="bev-page">
      <div className="bev-container">
        <header className="bev-header">
          <Link to="/" className="bev-brand" aria-label="Altuvera home">
            <span className="bev-brand-mark"><img src="/favicon.svg" alt="" /></span>
            <span className="bev-brand-name"><strong>ALTUVERA</strong><small>SAFARIS</small></span>
          </Link>
          <div className="bev-trust"><ShieldCheck size={16} /><span>Booking email status</span></div>
        </header>

        <div className="bev-layout">
          <section className="bev-intro">
            <div className="bev-eyebrow"><span className="bev-live-dot" /> YOUR BOOKING JOURNEY</div>
            <h1>Good journeys<br /><em>start with clarity.</em></h1>
            <p>This page shows the result of the email confirmation step linked to your Altuvera booking request. Your next actions are listed clearly below.</p>
            <div className="bev-trust-list">
              <div className="bev-trust-item"><span><ShieldCheck size={16} /></span><div><strong>Secure confirmation</strong><small>Your email link is checked before the booking status is updated.</small></div></div>
              <div className="bev-trust-item"><span><Mail size={16} /></span><div><strong>One clear outcome</strong><small>We’ll tell you whether your email is verified or needs another step.</small></div></div>
              <div className="bev-trust-item"><span><Home size={16} /></span><div><strong>Support is available</strong><small>Return to Altuvera or contact the team if you need assistance.</small></div></div>
            </div>
          </section>

          <section className="bev-panel-wrap">
            <div className="bev-panel" aria-live="polite">
              <div className="bev-panel-head">
                <span className="bev-panel-label"><ShieldCheck size={15} /> ALTUVERA VERIFICATION RESULT</span>
                <span className={"bev-panel-state " + (!isSuccess ? "is-error" : "")}>
                  {isSuccess ? <><CheckCircle2 size={13} /> Verified</> : <><AlertTriangle size={13} /> Attention needed</>}
                </span>
              </div>

              <div className="bev-state">
                <div className={"bev-status-icon " + (!isSuccess ? (config.tone === "warning" ? "is-warning" : "is-error") : "")}>
                  <Icon size={35} strokeWidth={1.8} />
                </div>
                <div className="bev-eyebrow">{config.eyebrow}</div>
                <h2>{config.title(reference)}</h2>
                <p>{config.message}</p>

                {reference && isSuccess && (
                  <div className="bev-reference">
                    <ShieldCheck size={18} />
                    <div><strong>Booking reference</strong><small>{reference}</small></div>
                  </div>
                )}

                <div className="bev-actions">
                  {isSuccess && (
                    <Link to="/my-bookings" className="bev-button bev-button--primary">View my bookings <ArrowRight size={16} /></Link>
                  )}
                  <Link to="/" className={"bev-button " + (isSuccess ? "bev-button--secondary" : "bev-button--primary")}>
                    Return to Altuvera <ArrowLeft size={16} />
                  </Link>
                  {!isSuccess && (
                    <a href="mailto:info@altuverasafaris.com" className="bev-button bev-button--secondary">Contact support <Mail size={15} /></a>
                  )}
                </div>

                <div className="bev-help">
                  Need help with this booking? <a href="mailto:info@altuverasafaris.com">Contact Altuvera support</a>.
                </div>
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
