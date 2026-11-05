import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  Clock3,
  FileImage,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  UploadCloud,
  UserRound,
  X,
} from "lucide-react";
import { useUserAuth } from "../../context/UserAuthContext";
import { bookingIdentityAPI } from "../../api/bookingIdentity";
import "./BookingIdentityVerification.css";

const authOptions = {
  skipNotLoggedInMessage: true,
  resumePendingVerification: false,
  resumeSavedForm: false,
  actionFlow: true,
};

const normalizeBooking = (response) =>
  response?.data?.data || response?.data || response || null;

const isPortraitComplete = (booking) =>
  ["uploaded", "verified"].includes(
    String(booking?.identity_portrait_status || "").toLowerCase()
  ) || Boolean(booking?.identity_portrait_url);

const formatTime = (totalSeconds) => {
  const safe = Math.max(0, Number(totalSeconds) || 0);
  const minutes = Math.floor(safe / 60).toString().padStart(2, "0");
  const seconds = (safe % 60).toString().padStart(2, "0");
  return minutes + ":" + seconds;
};

function SecureLoader({ title = "Checking your secure link", detail = "Verifying the request and preparing your private booking view." }) {
  return (
    <div className="biv-state biv-state--loading" role="status" aria-live="polite">
      <div className="biv-loader-mark">
        <span className="biv-loader-ring biv-loader-ring--outer" />
        <span className="biv-loader-ring biv-loader-ring--inner" />
        <ShieldCheck size={27} strokeWidth={1.8} />
      </div>
      <div className="biv-state-copy">
        <span className="biv-eyebrow">ALTUVERA SECURE ACCESS</span>
        <h2>{title}</h2>
        <p>{detail}</p>
      </div>
      <div className="biv-loading-track"><span /></div>
      <div className="biv-skeleton-row"><i /><i /><i /></div>
    </div>
  );
}

function StatusView({ icon: Icon, eyebrow, title, description, tone = "neutral", children }) {
  return (
    <div className={"biv-state biv-state--" + tone} role="status">
      <div className="biv-state-icon"><Icon size={27} strokeWidth={1.8} /></div>
      <div className="biv-state-copy">
        <span className="biv-eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}

export default function BookingIdentityVerification() {
  const { id = "" } = useParams();
  const {
    user,
    isAuthenticated,
    authLoading,
    openModal,
    beginActionHandoff,
    clearLocalSession,
    pendingActionAuth,
    actionHandoffPending,
    completeActionHandoff,
    isActionSession,
    actionSessionToken,
    actionSessionExpiresAt,
    actionSessionExpired,
    endActionSession,
  } = useUserAuth();

  const [booking, setBooking] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [mismatch, setMismatch] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [sessionClosed, setSessionClosed] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(300);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const openedModalRef = useRef(false);
  const mountedRef = useRef(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!preview) return undefined;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  useEffect(() => {
    if (!isActionSession || !actionSessionExpiresAt) return undefined;
    const update = () => {
      const remaining = Math.max(0, Math.ceil((Number(actionSessionExpiresAt) - Date.now()) / 1000));
      setRemainingSeconds(remaining);
    };
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [isActionSession, actionSessionExpiresAt]);

  useEffect(() => {
    if (authLoading || !id) return undefined;
    let cancelled = false;

    const showFailure = (err) => {
      if (cancelled) return;
      if (err?.code === "BOOKING_ACCOUNT_MISMATCH" || err?.status === 403) {
        setMismatch(true);
        setNotFound(false);
        setLoadError("This request belongs to a different Altuvera account. Booking information remains hidden until the correct traveller signs in.");
      } else if (err?.status === 404) {
        setNotFound(true);
        setMismatch(false);
        setLoadError("This secure booking link could not be found. Check that you opened the latest link sent by Altuvera.");
      } else {
        setLoadError(err?.message || "We could not verify this secure request. Please check your connection and try again.");
      }
    };

    const run = async () => {
      if (isActionSession) {
        setLoading(false);
        return;
      }

      if (actionSessionExpired) {
        setBooking(null);
        setLoading(false);
        return;
      }

      if (pendingActionAuth) {
        setLoading(true);
        setLoadError("");
        try {
          const result = await completeActionHandoff(id);
          if (!cancelled && mountedRef.current) {
            const resolved = result?.booking || null;
            setBooking(resolved);
            setDone(isPortraitComplete(resolved));
            setMismatch(false);
            setNotFound(false);
          }
        } catch (err) {
          showFailure(err);
        } finally {
          if (!cancelled) setLoading(false);
        }
        return;
      }

      if (isAuthenticated) {
        setLoading(true);
        setLoadError("");
        try {
          const result = await bookingIdentityAPI.get(id);
          const resolved = normalizeBooking(result);
          if (!cancelled) {
            setBooking(resolved);
            setDone(isPortraitComplete(resolved));
            setMismatch(false);
            setNotFound(false);
            setError("");
          }
        } catch (err) {
          showFailure(err);
        } finally {
          if (!cancelled) setLoading(false);
        }
        return;
      }

      setLoading(false);
      if (mismatch || actionHandoffPending) return;
      try {
        beginActionHandoff({ bookingId: id, returnTo: "/booking-verification/" + id });
      } catch (err) {
        setLoadError(err?.message || "This browser could not start a secure sign-in.");
      }
      if (!openedModalRef.current) {
        openedModalRef.current = true;
        openModal("login", authOptions);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [
    id,
    authLoading,
    isAuthenticated,
    user?.id,
    openModal,
    beginActionHandoff,
    pendingActionAuth,
    actionHandoffPending,
    completeActionHandoff,
    isActionSession,
    actionSessionExpired,
    mismatch,
    loadAttempt,
  ]);

  useEffect(() => {
    if (isActionSession || !actionSessionExpired || done) return;
    setBooking(null);
    setFile(null);
    setPreview("");
    setError("");
  }, [isActionSession, actionSessionExpired, done]);

  const setSelectedFile = useCallback((selected) => {
    if (!selected) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(selected.type)) {
      setError("Choose a JPG, PNG or WEBP image. Other file types are not accepted.");
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setError("This image is larger than 10MB. Choose a smaller portrait and try again.");
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setError("");
  }, [preview]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    setSelectedFile(event.dataTransfer.files?.[0]);
  };

  const removeSelectedFile = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview("");
    setFile(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const continueWithRequestedAccount = () => {
    try {
      clearLocalSession();
      beginActionHandoff({ bookingId: id, returnTo: "/booking-verification/" + id });
      setMismatch(false);
      setNotFound(false);
      setLoadError("");
      setBooking(null);
      setLoading(false);
      openedModalRef.current = true;
      openModal("login", authOptions);
    } catch (err) {
      setLoadError(err?.message || "We could not safely switch this browser to the requested account.");
    }
  };

  const startSecureSignIn = () => {
    try {
      setSessionClosed(false);
      setLoadError("");
      beginActionHandoff({ bookingId: id, returnTo: "/booking-verification/" + id });
      openedModalRef.current = true;
      openModal("login", authOptions);
    } catch (err) {
      setLoadError(err?.message || "A new secure sign-in could not be started in this browser.");
    }
  };

  const submit = async () => {
    if (!file || sending || done || isPortraitComplete(booking)) return;
    setSending(true);
    setError("");
    try {
      const result = await bookingIdentityAPI.upload(
        id,
        file,
        isActionSession ? actionSessionToken : null
      );
      const resolved = normalizeBooking(result);
      setBooking(resolved || booking);
      setDone(true);
      setFile(null);
      setPreview("");
      if (isActionSession) endActionSession("completed");
    } catch (err) {
      if (err?.code === "ACTION_ALREADY_COMPLETED") {
        const latest = normalizeBooking(err?.data);
        setBooking((current) => ({
          ...(current || {}),
          ...(latest || {}),
          identity_portrait_status: latest?.identity_portrait_status || "uploaded",
        }));
        setDone(true);
        setFile(null);
        setPreview("");
        if (isActionSession) endActionSession("completed");
      } else {
        if (isActionSession && (err?.status === 401 || err?.status === 403)) {
          endActionSession("expired");
        }
        setError(err?.message || "The portrait could not be uploaded. Your selected image is still available; try again.");
      }
    } finally {
      setSending(false);
    }
  };

  const closeSecureSession = () => {
    if (isActionSession) endActionSession("closed");
    setSessionClosed(true);
    setBooking(null);
    setFile(null);
    setPreview("");
    setError("");
  };

  const retryLoad = () => {
    setLoading(true);
    setMismatch(false);
    setNotFound(false);
    setLoadError("");
    setLoadAttempt((value) => value + 1);
  };

  const alreadyUploaded = isPortraitComplete(booking);
  const isExpired = (actionSessionExpired || sessionClosed) && !done && !isAuthenticated;
  const hasActiveRestrictedSession = isActionSession && !done;
  const completed = done || alreadyUploaded;

  return (
    <main className="biv-page">
      <div className="biv-atmosphere biv-atmosphere--one" />
      <div className="biv-atmosphere biv-atmosphere--two" />

      <div className="biv-container">
        <header className="biv-header">
          <Link to="/" className="biv-brand" aria-label="Altuvera Safaris home">
            <span className="biv-brand-mark"><img src="/favicon.svg" alt="" /></span>
            <span className="biv-brand-name"><strong>ALTUVERA</strong><small>SAFARIS</small></span>
          </Link>
          <div className="biv-header-trust"><ShieldCheck size={16} /><span>Secure traveller verification</span></div>
        </header>

        <div className="biv-layout">
          <section className="biv-intro">
            <div className="biv-intro-copy">
              <div className="biv-eyebrow"><span className="biv-live-dot" /> PRIVATE BOOKING CHECKPOINT</div>
              <h1>A clear portrait.<br /><em>A smoother journey.</em></h1>
              <p className="biv-lead">Complete this final traveller detail through a secure, booking-specific link. Your information is only shown after Altuvera verifies the account that received the request.</p>
            </div>

            <div className="biv-steps" aria-label="Verification progress">
              <div className={"biv-step " + (booking ? "is-complete" : "is-current")}>
                <span className="biv-step-icon">{booking ? <Check size={15} /> : <LockKeyhole size={15} />}</span>
                <span><strong>Secure access</strong><small>Link and account check</small></span>
              </div>
              <span className={"biv-step-line " + (booking ? "is-complete" : "")} />
              <div className={"biv-step " + (completed ? "is-complete" : booking ? "is-current" : "")}>
                <span className="biv-step-icon">{completed ? <Check size={15} /> : <Camera size={15} />}</span>
                <span><strong>Portrait</strong><small>One-time submission</small></span>
              </div>
              <span className={"biv-step-line " + (completed ? "is-complete" : "")} />
              <div className={"biv-step " + (completed ? "is-complete" : "")}>
                <span className="biv-step-icon">{completed ? <Check size={15} /> : <CheckCircle2 size={15} />}</span>
                <span><strong>Complete</strong><small>Access securely closed</small></span>
              </div>
            </div>

            <div className="biv-assurance">
              <div className="biv-assurance-item"><span><LockKeyhole size={16} /></span><div><strong>Private by design</strong><small>Only the booking owner can continue.</small></div></div>
              <div className="biv-assurance-item"><span><Clock3 size={16} /></span><div><strong>Short-lived access</strong><small>Temporary action access expires after five minutes.</small></div></div>
              <div className="biv-assurance-item"><span><CheckCircle2 size={16} /></span><div><strong>One-time action</strong><small>A completed portrait link cannot be reused.</small></div></div>
            </div>
          </section>

          <section className="biv-panel-wrap" aria-live="polite">
            <div className="biv-panel">
              <div className="biv-panel-topline">
                <span className="biv-panel-label"><ShieldCheck size={15} /> ALTUVERA SECURE ACTION</span>
                {hasActiveRestrictedSession && (
                  <span className={"biv-session-pill " + (remainingSeconds <= 60 ? "is-ending" : "")}>
                    <span className="biv-session-pulse" /> {formatTime(remainingSeconds)} remaining
                  </span>
                )}
              </div>

              {authLoading || loading ? (
                <SecureLoader title="Preparing your private booking view" detail="Checking the link, the signed-in account and the status of this one-time action." />
              ) : mismatch ? (
                <StatusView
                  icon={LockKeyhole}
                  eyebrow="ACCOUNT CHECK REQUIRED"
                  title="This link belongs to another account"
                  description={loadError || "The account currently open in this browser does not own this booking. Altuvera has hidden the booking details and blocked all changes."}
                  tone="warning"
                >
                  <div className="biv-security-note"><ShieldCheck size={17} /><p>Switching accounts clears this browser session only. The other person stays signed in on their own devices.</p></div>
                  <button type="button" className="biv-button biv-button--primary" onClick={continueWithRequestedAccount}>Continue with the requested account <ArrowRight size={17} /></button>
                </StatusView>
              ) : isExpired ? (
                <StatusView
                  icon={Clock3}
                  eyebrow="TEMPORARY ACCESS ENDED"
                  title="Your secure action window has ended"
                  description="For your privacy, the temporary booking access and its upload token have been cleared. Start a fresh secure sign-in from this link to continue."
                  tone="warning"
                >
                  <div className="biv-security-note"><LockKeyhole size={17} /><p>Your regular Altuvera login is separate from this five-minute action session.</p></div>
                  <button type="button" className="biv-button biv-button--primary" onClick={startSecureSignIn}>Start a new secure attempt <ArrowRight size={17} /></button>
                  <Link to="/" className="biv-button biv-button--quiet">Return to Altuvera</Link>
                </StatusView>
              ) : notFound ? (
                <StatusView
                  icon={AlertCircle}
                  eyebrow="LINK NOT AVAILABLE"
                  title="We could not find this booking"
                  description={loadError || "This link may be incomplete or outdated. Open the latest message from Altuvera or contact our team for help."}
                  tone="danger"
                >
                  <button type="button" className="biv-button biv-button--primary" onClick={retryLoad}>Check link again <RefreshCw size={16} /></button>
                  <Link to="/" className="biv-button biv-button--quiet">Return to Altuvera</Link>
                </StatusView>
              ) : loadError && !booking ? (
                <StatusView
                  icon={AlertCircle}
                  eyebrow="WE COULD NOT FINISH THE CHECK"
                  title="Your secure link is still protected"
                  description={loadError}
                  tone="danger"
                >
                  <button type="button" className="biv-button biv-button--primary" onClick={retryLoad}>Try again <RefreshCw size={16} /></button>
                  <button type="button" className="biv-button biv-button--quiet" onClick={() => openModal("login", authOptions)}>Open secure sign-in</button>
                </StatusView>
              ) : completed ? (
                <StatusView
                  icon={CheckCircle2}
                  eyebrow="ONE-TIME ACTION COMPLETE"
                  title="Portrait received"
                  description="Thank you. Altuvera has received the portrait for this booking. This one-time request is complete and its upload link cannot be reused."
                  tone="success"
                >
                  <div className="biv-completion-details">
                    <span className="biv-completion-check"><Check size={16} /></span>
                    <div><strong>Submission recorded</strong><small>{booking?.booking_number ? "Booking " + booking.booking_number : "Your booking"} · Portrait received</small></div>
                    <span className="biv-completion-state">Complete</span>
                  </div>
                  <Link to="/my-bookings" className="biv-button biv-button--primary">View my bookings <ArrowRight size={17} /></Link>
                  <Link to="/" className="biv-button biv-button--quiet">Return to Altuvera</Link>
                </StatusView>
              ) : !booking ? (
                <StatusView
                  icon={LockKeyhole}
                  eyebrow="SIGN-IN REQUIRED"
                  title="Verify your Altuvera account"
                  description="Sign in with the account that received this portrait request. Once verified, you will return to this exact booking step."
                  tone="neutral"
                >
                  <button type="button" className="biv-button biv-button--primary" onClick={() => openModal("login", authOptions)}>Open secure sign-in <ArrowRight size={17} /></button>
                  {loadError && <div className="biv-inline-alert biv-inline-alert--error"><AlertCircle size={17} /><span>{loadError}</span></div>}
                </StatusView>
              ) : (
                <div className="biv-upload-view">
                  <div className="biv-upload-heading">
                    <span className="biv-upload-icon"><Camera size={20} /></span>
                    <div><span className="biv-eyebrow">TRAVELLER IDENTITY</span><h2>Upload your portrait</h2><p>Choose one recent, clear photo where your face is visible and well lit.</p></div>
                  </div>

                  <div className="biv-booking-card">
                    <div className="biv-booking-icon"><UserRound size={18} /></div>
                    <div className="biv-booking-text">
                      <span>VERIFIED BOOKING</span>
                      <strong>{booking.destination_name || "Your Altuvera journey"}</strong>
                      <small>{booking.booking_number || "Booking #" + booking.id}</small>
                    </div>
                    <span className="biv-verified-tag"><CheckCircle2 size={14} /> Verified</span>
                  </div>

                  {isActionSession && (
                    <div className={"biv-countdown-card " + (remainingSeconds <= 60 ? "is-ending" : "")}>
                      <div className="biv-countdown-icon"><Clock3 size={17} /></div>
                      <div className="biv-countdown-copy"><strong>Temporary secure access</strong><small>This window is limited to this booking and portrait upload.</small></div>
                      <strong className="biv-countdown-time">{formatTime(remainingSeconds)}</strong>
                    </div>
                  )}

                  {user?.email && <div className="biv-account-line"><LockKeyhole size={14} /><span>Signed in as <strong>{user.email}</strong></span></div>}

                  <div
                    className={"biv-dropzone " + (isDragging ? "is-dragging" : "") + (preview ? " has-file" : "")}
                    onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                  >
                    {preview ? (
                      <div className="biv-preview-wrap">
                        <img src={preview} alt="Selected traveller portrait preview" className="biv-preview-image" />
                        <div className="biv-preview-shade" />
                        <div className="biv-preview-caption"><FileImage size={15} /><span>Portrait preview</span></div>
                        <button type="button" className="biv-remove-file" onClick={removeSelectedFile} aria-label="Remove selected portrait"><X size={17} /></button>
                      </div>
                    ) : (
                      <div className="biv-dropzone-empty">
                        <span className="biv-upload-art"><UploadCloud size={29} /></span>
                        <strong>Choose your portrait</strong>
                        <span>Drag an image here or browse your device</span>
                        <button type="button" className="biv-browse-button" onClick={() => fileInputRef.current?.click()}>Browse files</button>
                        <small>JPG, PNG or WEBP · Maximum 10MB</small>
                      </div>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="biv-file-input" aria-label="Choose a portrait image" />
                  </div>

                  {file && (
                    <div className="biv-file-meta">
                      <span className="biv-file-meta-icon"><FileImage size={15} /></span>
                      <div><strong>{file.name}</strong><small>{(file.size / (1024 * 1024)).toFixed(2)} MB · Ready to submit</small></div>
                      <button type="button" onClick={removeSelectedFile} aria-label="Remove selected file"><X size={16} /></button>
                    </div>
                  )}

                  {error && <div className="biv-inline-alert biv-inline-alert--error" role="alert"><AlertCircle size={17} /><span>{error}</span></div>}

                  <div className="biv-upload-rules">
                    <span><Check size={14} /> Face clearly visible</span>
                    <span><Check size={14} /> Good lighting</span>
                    <span><Check size={14} /> One submission per booking</span>
                  </div>

                  <button type="button" className="biv-button biv-button--primary biv-submit" onClick={submit} disabled={!file || sending || remainingSeconds === 0}>
                    {sending ? <><span className="biv-button-spinner" /> Uploading securely…</> : <>Submit portrait <ArrowRight size={17} /></>}
                  </button>
                  <p className="biv-privacy-copy"><LockKeyhole size={13} /> Your portrait is attached only to this verified booking.</p>

                  {isActionSession && (
                    <button type="button" className="biv-end-session" onClick={closeSecureSession}>End this secure session</button>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>

        <footer className="biv-footer">
          <span>ALTUVERA SAFARIS</span>
          <span className="biv-footer-separator" />
          <span>Protected traveller access</span>
          <Link to="/" className="biv-footer-link"><ArrowLeft size={13} /> Back to website</Link>
        </footer>
      </div>
    </main>
  );
}
