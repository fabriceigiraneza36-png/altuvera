// src/pages/PackageDetail.jsx
// Package-first experience: destination poster + focused request form.
// No overview/itinerary tabs; the package detail is intentionally conversion-focused.

import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, CalendarDays, Check, ChevronDown, Globe2, Loader2,
  Mail, MapPin, MessageCircle, Send, Users, Phone as PhoneIcon,
  Sparkles, ShieldCheck, AlertCircle,
} from "lucide-react";
import { packagesAPI } from "../api/packages";
import CountryPhoneSelect, {
  COUNTRIES,
  FlagImg,
} from "../components/auth/CountryPhoneSelect";

const METHODS = [
  { value: "email", label: "Email", icon: Mail, hint: "Email is my preferred contact" },
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle, hint: "Chat with me on WhatsApp" },
  { value: "phone", label: "Phone", icon: PhoneIcon, hint: "Call me by phone" },
];

const ACCOMMODATION = [
  ["luxury", "Luxury"],
  ["standard", "Standard"],
  ["", "Budget"],
  ["camping", "Camping / Glamping"],
  ["mixed", "Flexible"],
];

const TRIP_STYLES = [
  ["private", "Private"],
  ["couple", "Couple"],
  ["family", "Family"],
  ["small_group", "Small group"],
  ["solo", "Solo"],
];

const [] = [];

function firstArray(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try { return JSON.parse(value); } catch { return []; }
}

function money(value, currency = "USD") {
  if (value === null || value === undefined || value === "") return null;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency", currency, maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency} ${Number(value).toLocaleString()}`;
  }
}

function CountrySearch({ label, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = COUNTRIES.find(
    (c) => c.code === value || c.name.toLowerCase() === String(value || "").toLowerCase()
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.dial.includes(q)
    );
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (!e.target.closest?.("[data-country-search]")) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div className="pkg-country" data-country-search>
      <label>{label}</label>
      <button
        type="button"
        className={`pkg-country-trigger ${open ? "is-open" : ""}`}
        onClick={() => setOpen((v) => !v)}
      >
        {selected ? <FlagImg code={selected.code} size={22} /> : <Globe2 size={18} />}
        <span>{selected?.name || placeholder}</span>
        <ChevronDown size={16} className={open ? "rotate" : ""} />
      </button>
      {open && (
        <div className="pkg-country-menu">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search country inline…"
            aria-label={`Search ${label.toLowerCase()}`}
          />
          <div className="pkg-country-list">
            {filtered.map((country) => (
              <button
                type="button"
                key={country.code}
                onClick={() => {
                  onChange(country.code);
                  setQuery("");
                  setOpen(false);
                }}
                className={selected?.code === country.code ? "selected" : ""}
              >
                <FlagImg code={country.code} size={22} />
                <span>{country.name}</span>
                <small>{country.dial}</small>
              </button>
            ))}
            {!filtered.length && <div className="pkg-country-empty">No country found.</div>}
          </div>
        </div>
      )}
    </div>
  );
}

function ChoiceGroup({ label, value, onChange, options }) {
  return (
    <fieldset className="pkg-fieldset">
      <legend>{label}</legend>
      <div className="pkg-choice-grid">
        {options.map(([id, text]) => (
          <label key={id} className={`pkg-choice ${value === id ? "active" : ""}`}>
            <input
              type="radio"
              name={label}
              value={id}
              checked={value === id}
              onChange={() => onChange(id)}
            />
            <span>{text}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Field({ label, required, error, children, hint }) {
  return (
    <div className="pkg-field">
      <label>{label}{required && <span>*</span>}</label>
      {children}
      {hint && <small className="pkg-hint">{hint}</small>}
      {error && <small className="pkg-error">{error}</small>}
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <main className="pkg-page pkg-error-page">
      <div className="pkg-error-card">
        <AlertCircle size={40} />
        <h1>Package unavailable</h1>
        <p>{message || "We could not load this package right now."}</p>
        <Link to="/packages" className="pkg-secondary">Back to packages</Link>
      </div>
    </main>
  );
}

export default function PackageDetail() {
  const { slug } = useParams();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [form, setForm] = useState({
    guest_name: "",
    guest_email: "",
    nationality: "",
    country_of_residence: "",
    adults: 1,
    children: 0,
    travel_date: "",
    end_date: "",
    preferred_contact_method: "email",
    guest_phone: "",
    accommodation_preference: "",
    trip_style: "",
    budget_range: "",
    special_requests: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setLoadError("");
    const request = /^\d+$/.test(slug || "")
      ? packagesAPI.getById(slug)
      : packagesAPI.getBySlug(slug);

    request
      .then((body) => {
        if (!alive) return;
        const data = body?.data || body;
        if (!data?.id) throw new Error("Package not found.");
        setPkg(data);
      })
      .catch((err) => alive && setLoadError(err?.message || "Package not found."))
      .finally(() => alive && setLoading(false));

    return () => { alive = false; };
  }, [slug]);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      delete next.general;
      return next;
    });
  };

  const needsPhone = form.preferred_contact_method === "phone" ||
    form.preferred_contact_method === "whatsapp";

  const validate = () => {
    const next = {};
    if (!form.guest_name.trim()) next.guest_name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.guest_email.trim()))
      next.guest_email = "Please enter a valid email address.";
    if (!form.nationality) next.nationality = "Please select your nationality.";
    if (!form.country_of_residence) next.country_of_residence = "Please select your country of residence.";
    if (Number(form.adults) < 1) next.adults = "At least one adult is required.";
    if (form.travel_date && form.end_date && form.end_date < form.travel_date)
      next.end_date = "Return date must be after the travel date.";
    if (needsPhone && !form.guest_phone.trim())
      next.guest_phone = "A phone number is required for this contact method.";
    return next;
  };

  const submit = async (e) => {
    e.preventDefault();
    const next = validate();
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    setSubmitting(true);
    setErrors({});
    try {
      const payload = {
        guest_name: form.guest_name.trim(),
        guest_email: form.guest_email.trim(),
        adults: Math.max(1, Number(form.adults) || 1),
        children: Math.max(0, Number(form.children) || 0),
        travelers_count: Math.max(1, (Number(form.adults) || 1) + (Number(form.children) || 0)),
        travel_date: form.travel_date || undefined,
        end_date: form.end_date || undefined,
        nationality: form.nationality,
        country_of_residence: form.country_of_residence,
        preferred_contact_method: form.preferred_contact_method,
        guest_phone: needsPhone ? form.guest_phone.trim() : undefined,
        accommodation_preference: form.accommodation_preference || undefined,
        trip_style: form.trip_style || undefined,
        budget_range: form.budget_range || undefined,
        special_requests: form.special_requests.trim() || undefined,
      };

      const body = await packagesAPI.createBooking(pkg.id, payload);
      setSuccess(
        body?.data?.booking_number ||
        body?.data?.booking_ref ||
        body?.data?.id ||
        "REQUESTED"
      );
    } catch (err) {
      setErrors({
        general:
          err?.message ||
          "We couldn't submit your package request. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="pkg-page pkg-loading">
        <div className="pkg-loading-image" />
        <div className="pkg-loading-form" />
      </main>
    );
  }
  if (loadError || !pkg) return <ErrorState message={loadError} />;

  const cover = pkg.cover_image_url || pkg.image_url || pkg.thumbnail_url;
  const price = money(pkg.price, pkg.currency || "USD");
  const destination = pkg.destination_name || pkg.destination || "East Africa";
  const country = pkg.country_name || pkg.country || "";
  const highlights = firstArray(pkg.features || pkg.highlights).slice(0, 3);

  if (success) {
    return (
      <main className="pkg-page">
        <style>{CSS}</style>
        <div className="pkg-success">
          <div className="pkg-success-icon"><Check size={30} /></div>
          <span className="pkg-eyebrow">Request received</span>
          <h1>Your package request is on its way.</h1>
          <p>
            We received your request for <strong>{pkg.title}</strong>. Our travel team
            will review your dates and preferences and contact you using your selected method.
          </p>
          <div className="pkg-reference">
            <span>Request reference</span>
            <strong>{success}</strong>
          </div>
          <div className="pkg-success-actions">
            <Link to="/my-bookings" className="pkg-primary">View my requests</Link>
            <Link to="/packages" className="pkg-secondary">Explore more packages</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pkg-page">
      <style>{CSS}</style>

      <div className="pkg-topbar">
        <Link to="/packages" className="pkg-back"><ArrowLeft size={17} /> All packages</Link>
        <span className="pkg-secure"><ShieldCheck size={15} /> Secure request</span>
      </div>

      <section className="pkg-layout">
        <div className="pkg-poster">
          {cover ? (
            <img src={cover} alt={pkg.title} />
          ) : (
            <div className="pkg-poster-empty"><Sparkles size={48} /></div>
          )}
          <div className="pkg-poster-shade" />
          <div className="pkg-poster-copy">
            <span className="pkg-eyebrow">Altuvera experience</span>
            <h1>{pkg.title}</h1>
            <div className="pkg-meta">
              <span><MapPin size={15} /> {destination}{country ? `, ${country}` : ""}</span>
              {pkg.duration_days && <span><CalendarDays size={15} /> {pkg.duration_days} days</span>}
              {price && <strong>{price}</strong>}
            </div>
          </div>
        </div>

        <form className="pkg-form-card" onSubmit={submit} noValidate>
          <div className="pkg-form-head">
            <div>
              <span className="pkg-eyebrow">Request this package</span>
              <h2>Tell us how you want to travel</h2>
              <p>Share only what helps our team prepare the right response for you.</p>
            </div>
          </div>

          {errors.general && <div className="pkg-alert"><AlertCircle size={17} /> {errors.general}</div>}

          <div className="pkg-section">
            <div className="pkg-section-title"><span>01</span><div><b>Your details</b><small>Who should we respond to?</small></div></div>
            <div className="pkg-two">
              <Field label="Full name" required error={errors.guest_name}>
                <input value={form.guest_name} onChange={(e) => update("guest_name", e.target.value)} placeholder="Your full name" autoComplete="name" />
              </Field>
              <Field label="Email address" required error={errors.guest_email}>
                <input type="email" value={form.guest_email} onChange={(e) => update("guest_email", e.target.value)} placeholder="you@example.com" autoComplete="email" />
              </Field>
            </div>
            <div className="pkg-two">
              <Field label="Nationality" required error={errors.nationality}>
                <CountrySearch label="" value={form.nationality} onChange={(v) => update("nationality", v)} placeholder="Search nationality" />
              </Field>
              <Field label="Country of residence" required error={errors.country_of_residence}>
                <CountrySearch label="" value={form.country_of_residence} onChange={(v) => update("country_of_residence", v)} placeholder="Search country of residence" />
              </Field>
            </div>
          </div>

          <div className="pkg-section">
            <div className="pkg-section-title"><span>02</span><div><b>Travel plans</b><small>Dates and group size</small></div></div>
            <div className="pkg-three">
              <Field label="Departure">
                <input type="date" value={form.travel_date} onChange={(e) => update("travel_date", e.target.value)} />
              </Field>
              <Field label="Return" error={errors.end_date}>
                <input type="date" value={form.end_date} onChange={(e) => update("end_date", e.target.value)} />
              </Field>
              <Field label="Adults" required error={errors.adults}>
                <input type="number" min="1" max="500" value={form.adults} onChange={(e) => update("adults", e.target.value)} />
              </Field>
            </div>
            <Field label="Children">
              <input type="number" min="0" max="500" value={form.children} onChange={(e) => update("children", e.target.value)} />
            </Field>
          </div>

          <div className="pkg-section">
            <div className="pkg-section-title"><span>03</span><div><b>How should we contact you?</b><small>Phone is requested only when you choose phone or WhatsApp.</small></div></div>
            <ChoiceGroup label="Preferred contact method" value={form.preferred_contact_method} onChange={(v) => update("preferred_contact_method", v)} options={METHODS.map((m) => [m.value, m.label])} />
            {needsPhone && (
              <Field label={form.preferred_contact_method === "whatsapp" ? "WhatsApp number" : "Phone number"} required error={errors.guest_phone} hint="Type the full number or start with +country code; the flag updates automatically.">
                <CountryPhoneSelect
                  value={form.guest_phone}
                  onChange={(v) => update("guest_phone", v)}
                  placeholder={form.preferred_contact_method === "whatsapp" ? "WhatsApp number" : "Phone number"}
                  error={errors.guest_phone}
                />
              </Field>
            )}
          </div>

          <div className="pkg-section">
            <div className="pkg-section-title"><span>04</span><div><b>Trip preferences</b><small>Optional — helps us personalize your proposal</small></div></div>
            <ChoiceGroup label="Accommodation" value={form.accommodation_preference} onChange={(v) => update("accommodation_preference", v)} options={ACCOMMODATION} />
            <ChoiceGroup label="Travel style" value={form.trip_style} onChange={(v) => update("trip_style", v)} options={TRIP_STYLES} />
            <ChoiceGroup label="Budget" value={form.budget_range} onChange={(v) => update("budget_range", v)} options={[]} />
          </div>

          <div className="pkg-section">
            <div className="pkg-section-title"><span>05</span><div><b>Special request</b><small>Anything our travel team should know?</small></div></div>
            <textarea
              value={form.special_requests}
              onChange={(e) => update("special_requests", e.target.value)}
              placeholder="Tell us about dietary needs, celebrations, accessibility, preferred experiences, or anything else…"
              rows={5}
            />
          </div>

          <div className="pkg-submit-row">
            <div><ShieldCheck size={18} /><span>Your details are used only to prepare and manage your travel request.</span></div>
            <button type="submit" className="pkg-primary pkg-submit" disabled={submitting}>
              {submitting ? <><Loader2 size={18} className="spin" /> Sending request…</> : <><Send size={18} /> Request this package</>}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

const CSS = `
@import url("https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap");
.pkg-page{min-height:100vh;background:#f4fbf7;color:#10231b;font-family:"Plus Jakarta Sans",system-ui,sans-serif;padding-bottom:60px}
.pkg-topbar{max-width:1400px;margin:auto;padding:22px clamp(16px,4vw,48px);display:flex;justify-content:space-between;align-items:center}
.pkg-back,.pkg-secure{display:inline-flex;align-items:center;gap:8px;text-decoration:none;font-size:13px;font-weight:700}
.pkg-back{color:#047857}.pkg-secure{color:#64748b}
.pkg-layout{max-width:1400px;margin:auto;padding:0 clamp(16px,4vw,48px);display:grid;grid-template-columns:minmax(0,1.08fr) minmax(420px,.92fr);gap:28px;align-items:start}
.pkg-poster{position:sticky;top:92px;height:min(76vh,760px);min-height:560px;border-radius:28px;overflow:hidden;background:#064e3b;box-shadow:0 22px 70px rgba(2,44,34,.18)}
.pkg-poster>img{width:100%;height:100%;object-fit:cover;display:block}
.pkg-poster-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(2,44,34,.08) 25%,rgba(2,44,34,.9) 100%)}
.pkg-poster-copy{position:absolute;left:clamp(22px,4vw,48px);right:24px;bottom:clamp(24px,4vw,48px);color:white}
.pkg-poster-copy h1{font:400 clamp(32px,4vw,58px)/1.05 "DM Serif Display",serif;margin:10px 0 18px;max-width:760px}
.pkg-meta{display:flex;flex-wrap:wrap;gap:10px}.pkg-meta span,.pkg-meta strong{display:inline-flex;align-items:center;gap:7px;padding:9px 13px;border-radius:999px;background:rgba(255,255,255,.13);backdrop-filter:blur(12px);font-size:12px}.pkg-meta strong{background:#10b981}
.pkg-form-card{background:white;border:1px solid #d7eee1;border-radius:28px;box-shadow:0 18px 60px rgba(2,44,34,.09);overflow:visible}
.pkg-form-head{padding:30px 30px 22px;border-bottom:1px solid #e7f4ec}.pkg-form-head h2{font:400 clamp(25px,3vw,36px)/1.1 "DM Serif Display",serif;color:#064e3b;margin:8px 0}.pkg-form-head p{margin:0;color:#64748b;font-size:13px;line-height:1.6}
.pkg-eyebrow{font-size:10px;text-transform:uppercase;letter-spacing:.15em;font-weight:800;color:#059669}
.pkg-section{padding:25px 30px;border-bottom:1px solid #e7f4ec}.pkg-section:last-of-type{border-bottom:0}
.pkg-section-title{display:flex;gap:12px;align-items:center;margin-bottom:20px}.pkg-section-title>span{width:30px;height:30px;border-radius:10px;background:#ecfdf5;color:#047857;display:grid;place-items:center;font-size:11px;font-weight:800}.pkg-section-title b{display:block;color:#12372a;font-size:14px}.pkg-section-title small{display:block;color:#94a3b8;font-size:11px;margin-top:3px}
.pkg-two,.pkg-three{display:grid;grid-template-columns:1fr 1fr;gap:14px}.pkg-three{grid-template-columns:1fr 1fr 1fr}.pkg-field{margin-bottom:15px}.pkg-field>label,.pkg-fieldset>legend{display:block;font-size:11px;font-weight:800;color:#334e42;margin-bottom:7px}.pkg-field>label span{color:#ef4444;margin-left:3px}
.pkg-field input,.pkg-field textarea{width:100%;box-sizing:border-box;border:1px solid #d9ebe1;background:#fbfefc;border-radius:13px;padding:12px 13px;outline:0;color:#17352a;font:500 13px "Plus Jakarta Sans",sans-serif;transition:.2s}.pkg-field input:focus,.pkg-field textarea:focus{border-color:#10b981;box-shadow:0 0 0 4px rgba(16,185,129,.09);background:white}.pkg-field textarea{resize:vertical;line-height:1.6}
.pkg-hint{display:block;color:#94a3b8;font-size:10px;line-height:1.5;margin-top:5px}.pkg-error{display:block;color:#dc2626;font-size:10px;margin-top:5px}
.pkg-fieldset{border:0;padding:0;margin:0 0 18px}.pkg-choice-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.pkg-choice{display:flex;align-items:center;gap:9px;border:1px solid #dceee5;border-radius:12px;padding:11px 12px;cursor:pointer;font-size:12px;font-weight:600;color:#53675f;background:#fbfefc;transition:.18s}.pkg-choice:hover,.pkg-choice.active{border-color:#6ee7b7;background:#ecfdf5;color:#047857}.pkg-choice input{accent-color:#059669}
.pkg-country{position:relative}.pkg-country>label{display:none}.pkg-country-trigger{width:100%;min-height:44px;display:flex;align-items:center;gap:9px;border:1px solid #d9ebe1;background:#fbfefc;border-radius:13px;padding:9px 12px;color:#53675f;font:500 13px "Plus Jakarta Sans";cursor:pointer;text-align:left}.pkg-country-trigger span{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pkg-country-trigger svg.rotate{transform:rotate(180deg)}.pkg-country-trigger.is-open{border-color:#10b981;box-shadow:0 0 0 4px rgba(16,185,129,.09)}
.pkg-country-menu{position:absolute;left:0;right:0;top:calc(100% + 7px);z-index:1000;background:white;border:1px solid #dceee5;border-radius:16px;box-shadow:0 20px 45px rgba(2,44,34,.16);overflow:hidden}.pkg-country-menu>input{width:100%;box-sizing:border-box;border:0;border-bottom:1px solid #e7f4ec;padding:13px 14px;outline:0;font:500 13px "Plus Jakarta Sans"}.pkg-country-list{max-height:230px;overflow:auto}.pkg-country-list button{width:100%;display:flex;align-items:center;gap:10px;border:0;background:white;padding:10px 13px;text-align:left;cursor:pointer;color:#334e42}.pkg-country-list button:hover,.pkg-country-list button.selected{background:#ecfdf5;color:#047857}.pkg-country-list button span{flex:1;font-size:12px;font-weight:600}.pkg-country-list button small{font-size:10px;color:#94a3b8}.pkg-country-empty{padding:24px;text-align:center;color:#94a3b8;font-size:12px}
.pkg-alert{margin:20px 30px 0;padding:12px 14px;border-radius:13px;background:#fff7ed;border:1px solid #fed7aa;color:#c2410c;font-size:12px;display:flex;gap:9px;align-items:flex-start}
.pkg-submit-row{padding:22px 30px;background:#f7fcf9;border-top:1px solid #e7f4ec;border-radius:0 0 28px 28px;display:flex;align-items:center;justify-content:space-between;gap:16px}.pkg-submit-row>div{display:flex;gap:9px;color:#64748b;font-size:10px;line-height:1.45;max-width:300px}.pkg-submit-row>div svg{color:#059669;flex-shrink:0}
.pkg-primary,.pkg-secondary{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:13px;padding:12px 18px;font:800 12px "Plus Jakarta Sans";text-decoration:none;cursor:pointer;border:0}.pkg-primary{background:linear-gradient(135deg,#10b981,#047857);color:white;box-shadow:0 9px 24px rgba(5,150,105,.28)}.pkg-primary:disabled{opacity:.65;cursor:not-allowed}.pkg-secondary{background:white;color:#047857;border:1px solid #b7dfcb}.pkg-submit{min-width:210px}.spin{animation:pkg-spin .8s linear infinite}@keyframes pkg-spin{to{transform:rotate(360deg)}}
.pkg-success{max-width:680px;margin:12vh auto;padding:48px 28px;text-align:center;background:white;border:1px solid #d7eee1;border-radius:28px;box-shadow:0 20px 60px rgba(2,44,34,.09)}.pkg-success-icon{width:64px;height:64px;margin:0 auto 18px;border-radius:50%;display:grid;place-items:center;background:#dcfce7;color:#047857}.pkg-success h1{font:400 40px/1.1 "DM Serif Display",serif;color:#064e3b;margin:10px 0 14px}.pkg-success p{color:#64748b;font-size:14px;line-height:1.75}.pkg-reference{margin:22px auto;padding:14px 20px;border-radius:14px;background:#f0fdf4;display:flex;justify-content:space-between;gap:15px;max-width:420px}.pkg-reference span{font-size:11px;color:#64748b}.pkg-reference strong{font-size:12px;color:#047857}.pkg-success-actions{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.pkg-loading{max-width:1400px;margin:auto;padding:40px clamp(16px,4vw,48px);display:grid;grid-template-columns:1.08fr .92fr;gap:28px}.pkg-loading-image,.pkg-loading-form{border-radius:28px;background:linear-gradient(110deg,#dcfce7,#f0fdf4,#dcfce7);background-size:200% 100%;animation:pkg-shimmer 1.5s infinite}.pkg-loading-image{height:70vh}.pkg-loading-form{height:720px}@keyframes pkg-shimmer{to{background-position:-200% 0}}
.pkg-error-page{display:grid;place-items:center;padding:70px 20px}.pkg-error-card{text-align:center;background:white;border:1px solid #d7eee1;border-radius:24px;padding:42px;max-width:500px;box-shadow:0 20px 50px rgba(2,44,34,.08)}.pkg-error-card>svg{color:#dc2626}.pkg-error-card h1{font:400 34px "DM Serif Display";color:#064e3b}.pkg-error-card p{color:#64748b;line-height:1.6}
@media(max-width:1000px){.pkg-layout,.pkg-loading{grid-template-columns:1fr}.pkg-poster{position:relative;top:auto;height:55vh;min-height:420px}.pkg-form-card{margin-top:0}}
@media(max-width:640px){.pkg-topbar{padding:16px}.pkg-layout{padding:0 12px}.pkg-poster{height:58vh;min-height:400px;border-radius:20px}.pkg-poster-copy h1{font-size:38px}.pkg-form-head,.pkg-section{padding:22px 18px}.pkg-two,.pkg-three{grid-template-columns:1fr}.pkg-choice-grid{grid-template-columns:1fr}.pkg-submit-row{padding:18px;display:block}.pkg-submit-row>div{margin-bottom:14px;max-width:none}.pkg-submit{width:100%}.pkg-alert{margin-left:18px;margin-right:18px}.pkg-success{margin:8vh 14px;padding:36px 20px}}
`;

