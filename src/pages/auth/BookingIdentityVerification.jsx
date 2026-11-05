import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Camera, CheckCircle, ShieldCheck, Upload, ArrowLeft, LockKeyhole, RefreshCw } from "lucide-react";
import { useUserAuth } from "../../context/UserAuthContext";
import { bookingIdentityAPI } from "../../api/bookingIdentity";

const authOptions = {
  skipNotLoggedInMessage: true,
  resumePendingVerification: false,
  resumeSavedForm: false,
};

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
  const [error, setError] = useState("");
  const openedModalRef = useRef(false);
  const requestRef = useRef("");
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (authLoading || !id) return undefined;
    let cancelled = false;

    const finishLoading = () => { if (!cancelled) setLoading(false); };
    const handleFailure = (err) => {
      if (cancelled) return;
      if (err?.status === 403 || err?.code === "BOOKING_ACCOUNT_MISMATCH") {
        setMismatch(true);
        setError("This request belongs to another Altuvera account. No booking information or upload controls have been made available.");
      } else {
        setError(err?.message || "We could not open this secure request.");
      }
    };

    const run = async () => {
      if (isActionSession) {
        finishLoading();
        return;
      }

      if (pendingActionAuth) {
        setLoading(true);
        try {
          const result = await completeActionHandoff(id);
          if (mountedRef.current) {
            setBooking(result.booking);
            setMismatch(false);
            setError("");
          }
        } catch (err) {
          handleFailure(err);
        } finally {
          finishLoading();
        }
        return;
      }

      if (isAuthenticated) {
        const requestKey = id + ":" + String(user?.id || "");
        if (requestRef.current === requestKey) return;
        requestRef.current = requestKey;
        setLoading(true);
        try {
          const result = await bookingIdentityAPI.get(id);
          if (!cancelled) {
            setBooking(result?.data?.data || result?.data || result);
            setMismatch(false);
            setError("");
          }
        } catch (err) {
          handleFailure(err);
        } finally {
          finishLoading();
        }
        return;
      }

      finishLoading();
      if (mismatch) return;
      if (!actionSessionExpired && !actionHandoffPending) {
        try {
          beginActionHandoff({ bookingId: id, returnTo: "/booking-verification/" + id });
        } catch (err) {
          setError(err?.message || "This browser could not start a secure sign-in.");
        }
      }
      if (!openedModalRef.current) {
        openedModalRef.current = true;
        openModal("login", authOptions);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [
    id, authLoading, isAuthenticated, user?.id, openModal, beginActionHandoff,
    pendingActionAuth, actionHandoffPending, completeActionHandoff,
    isActionSession, actionSessionExpired, mismatch,
  ]);

  useEffect(() => {
    if (isActionSession || !actionSessionExpired || done) return;
    setBooking(null);
    setFile(null);
    setPreview("");
    setError("Your five-minute secure action window ended. Sign in normally to start a new Altuvera session.");
  }, [isActionSession, actionSessionExpired, done]);

  useEffect(() => {
    if (!preview) return undefined;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  const choose = (event) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(selected.type)) {
      setError("Please choose a JPG, PNG or WEBP image.");
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setError("Your portrait must be 10MB or smaller.");
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setError("");
  };

  const continueWithRequestedAccount = () => {
    try {
      clearLocalSession();
      beginActionHandoff({ bookingId: id, returnTo: "/booking-verification/" + id });
      setMismatch(false);
      setError("");
      setBooking(null);
      setLoading(false);
      openedModalRef.current = true;
      openModal("login", authOptions);
    } catch (err) {
      setError(err?.message || "We could not safely switch this browser to the requested account.");
    }
  };

  const submit = async () => {
    if (!file || sending) return;
    setSending(true);
    setError("");
    try {
      const result = await bookingIdentityAPI.upload(
        id,
        file,
        isActionSession ? actionSessionToken : null
      );
      setBooking(result?.data?.data || result?.data || result);
      setDone(true);
      if (isActionSession) endActionSession("completed");
    } catch (err) {
      if (isActionSession && (err?.status === 401 || err?.status === 403)) {
        endActionSession("expired");
      }
      setError(err?.message || "The portrait could not be uploaded. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const openLoginAgain = () => {
    openedModalRef.current = true;
    openModal("login", authOptions);
  };

  if (authLoading || loading) {
    return (
      <div className="grid min-h-[70vh] place-items-center bg-emerald-50/50 px-5 text-sm font-semibold text-slate-600">
        <div className="text-center"><RefreshCw className="mx-auto mb-3 animate-spin text-emerald-700" size={28} />Checking the account attached to this secure link…</div>
      </div>
    );
  }

  const alreadyUploaded = ["uploaded", "verified"].includes(booking?.identity_portrait_status);

  return (
    <main className="min-h-[78vh] bg-gradient-to-b from-emerald-50 to-white px-4 py-8 sm:py-12">
      <section className="mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-2xl shadow-emerald-950/10">
        <header className="bg-gradient-to-br from-emerald-950 via-emerald-800 to-emerald-600 px-6 py-7 text-white sm:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/20 bg-white/10"><ShieldCheck size={26} /></div>
            <div><p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-emerald-100">Altuvera secure action</p><h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">Traveller verification</h1></div>
          </div>
          <p className="mt-4 max-w-xl text-sm leading-6 text-emerald-50">Complete the requested portrait step using the Altuvera account that owns this booking.</p>
        </header>

        <div className="p-5 sm:p-8">
          {mismatch ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-amber-700"><LockKeyhole size={22} /></div>
              <h2 className="text-lg font-extrabold text-slate-900">This link belongs to another account</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">The account currently open in this browser does not own this booking. Altuvera has blocked access to prevent anyone from viewing or changing another traveller’s information.</p>
              <p className="mt-2 text-xs leading-5 text-slate-600">Continue only if you are the traveller who received this request. This clears the current sign-in from this browser tab only; it does not sign that person out on their other devices.</p>
              <button type="button" onClick={continueWithRequestedAccount} className="mt-5 flex min-h-12 w-full items-center justify-center rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-800">Continue with the requested account</button>
            </div>
          ) : actionSessionExpired && !isAuthenticated && !done ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <h2 className="font-extrabold text-slate-900">Secure action window ended</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">{error || "For your privacy, the short-lived action session has ended. Sign in normally to continue."}</p>
              <button type="button" onClick={openLoginAgain} className="mt-4 min-h-11 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white">Sign in to Altuvera</button>
            </div>
          ) : !isAuthenticated && !isActionSession && !pendingActionAuth ? (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5 text-center sm:p-7">
              <LockKeyhole size={30} className="mx-auto text-emerald-700" />
              <h2 className="mt-3 text-lg font-extrabold text-slate-900">Sign in to continue</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">The original link is saved in this tab. Sign in with the Altuvera account that received the portrait request and you will return here automatically.</p>
              <button type="button" onClick={openLoginAgain} className="mt-5 min-h-12 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white">Open secure sign-in</button>
              {error && <p className="mt-3 text-xs text-rose-700">{error}</p>}
            </div>
          ) : done || alreadyUploaded ? (
            <div className="py-8 text-center">
              <CheckCircle size={54} className="mx-auto text-emerald-600" />
              <h2 className="mt-4 text-2xl font-extrabold text-emerald-900">Portrait received</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">Thank you. Altuvera has received the portrait for this booking. The secure action window has been closed.</p>
              <a href="/my-bookings" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white">View my bookings</a>
            </div>
          ) : booking ? (
            <>
              <div className="mb-5 rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Verified booking</p>
                <h2 className="mt-1 font-extrabold text-slate-900">{booking.destination_name || "Your Altuvera journey"}</h2>
                <p className="mt-1 text-xs text-slate-500">Booking {booking.booking_number || "#" + booking.id}</p>
                {user?.email && <p className="mt-2 text-xs text-emerald-700">Signed in as {user.email}</p>}
              </div>
              <p className="text-sm leading-6 text-slate-600">Upload one recent, clear face portrait. Choose a photo where your face is visible and well lit.</p>
              <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/60 p-6 text-center transition hover:border-emerald-400">
                {preview ? <img src={preview} alt="Portrait preview" className="mb-3 h-40 w-40 rounded-2xl object-cover shadow-lg" /> : <Camera size={42} className="mb-3 text-emerald-700" />}
                <span className="font-extrabold text-emerald-800">{file ? "Change portrait" : "Choose portrait"}</span>
                <span className="mt-1 text-xs text-slate-500">JPG, PNG or WEBP · up to 10MB</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={choose} className="sr-only" />
              </label>
              {error && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
              {isActionSession && <p className="mt-4 text-xs text-slate-500">This isolated action window expires in five minutes and can only upload the portrait for this booking.</p>}
              <button type="button" onClick={submit} disabled={!file || sending} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50">
                <Upload size={17} />{sending ? "Uploading securely…" : "Send portrait to Altuvera"}
              </button>
            </>
          ) : (
            <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error || "This request could not be opened. Please use the original link or contact Altuvera."}</div>
          )}

          <button type="button" onClick={() => window.history.back()} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-700"><ArrowLeft size={15} />Back</button>
        </div>
      </section>
    </main>
  );
}
