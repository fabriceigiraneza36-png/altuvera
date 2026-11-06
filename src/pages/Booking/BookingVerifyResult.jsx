import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Compass,
  Mail,
  MapPin,
  ShieldCheck,
  ShieldX,
  Users,
} from "lucide-react";
import { trackBooking } from "../../api/bookingApi";
import { API_URL } from "../../utils/apiBase";
import "./BookingEmailVerification.css";

const CONFIG = {
  success: {
    icon: CheckCircle2,
    tone: "success",
    eyebrow: "EMAIL CONFIRMED",
    title: "Your booking request is verified",
    message: "Your email is confirmed. The Altuvera team can now review your request and follow up with the next steps.",
  },
  already_verified: {
    icon: ShieldCheck,
    tone: "success",
    eyebrow: "ALREADY CONFIRMED",
    title: "Your email was already verified",
    message: "No further action is needed. Your booking request is with the Altuvera team for review.",
  },
  expired: {
    icon: Clock3,
    tone: "warning",
    eyebrow: "LINK EXPIRED",
    title: "This confirmation link has expired",
    message: "For your protection, booking verification links are time-limited. Contact Altuvera and ask for a fresh confirmation email.",
  },
  invalid: {
    icon: ShieldX,
    tone: "error",
    eyebrow: "LINK NOT VALID",
    title: "This link cannot be used",
    message: "The confirmation link may have been changed, or it may already have been used. Open the latest email from Altuvera or contact our team.",
  },
  error: {
    icon: AlertTriangle,
    tone: "error",
    eyebrow: "CONFIRMATION UNAVAILABLE",
    title: "We could not confirm your email",
    message: "Something prevented this verification from completing. Please contact Altuvera so our team can help you continue.",
  },
};

const safeImageUrl = (value) => {
  if (typeof value !== "string") return "";
  const url = value.trim();
  return /^https?:\/\//i.test(url) || url.startsWith("/") ? url : "";
};

const collectDestinationImages = (destination, booking) => {
  const gallery = Array.isArray(destination?.gallery) ? destination.gallery : [];
  const imageArray = Array.isArray(destination?.image_urls)
    ? destination.image_urls
    : Array.isArray(destination?.images)
      ? destination.images
      : [];
  const candidates = [
    destination?.cover_image_url,
    destination?.banner_image_url,
    destination?.image_url,
    destination?.thumbnail_url,
    destination?.imageUrl,
    destination?.image,
    ...imageArray,
    ...gallery.map((image) =>
      image?.imageUrl || image?.image_url || image?.url || image?.src || image?.thumbnailUrl
    ),
    booking?.destination_image,
  ];
  return [...new Set(candidates.map(safeImageUrl).filter(Boolean))].slice(0, 10);
};

const plainText = (value) =>
  String(value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

function DestinationShowcase({ booking, destination, images, loading, activeSlide, onSlideChange }) {
  const destinationName =
    booking?.destination ||
    destination?.name ||
    destination?.title ||
    booking?.package ||
    booking?.service ||
    "Your selected East African experience";
  const countryName = booking?.country || destination?.country_name || destination?.countryName || "";
  const description = plainText(
    destination?.short_description ||
    destination?.shortDescription ||
    destination?.description ||
    destination?.overview ||
    destination?.summary
  );
  const category = destination?.category || destination?.experience_type || destination?.type || "";
  const difficulty = destination?.difficulty || "";
  const arrival = formatDate(booking?.travel_date);
  const departure = formatDate(booking?.return_date);
  const travelDates = arrival && departure
    ? `${arrival} – ${departure}`
    : arrival || (booking?.travel_date ? "Flexible travel dates" : "Dates to be arranged");
  const travelers = Number(booking?.number_of_travelers) || 0;

  return (
    <section className="bev-destination" aria-label="Your selected destination">
      <div className="bev-destination-heading">
        <span className="bev-eyebrow"><span className="bev-live-dot" /> YOUR SELECTED DESTINATION</span>
        <h2>Here’s where your journey could take you.</h2>
        <p>A preview of the place you selected, along with the details attached to your request.</p>
      </div>

      <div className="bev-destination-card">
        <div
          className="bev-slideshow"
          onMouseEnter={(event) => event.currentTarget.setAttribute("data-paused", "true")}
          onMouseLeave={(event) => event.currentTarget.removeAttribute("data-paused")}
        >
          {loading && !images.length ? (
            <div className="bev-slide-placeholder is-loading" aria-label="Loading destination images">
              <span className="bev-placeholder-mark"><Compass size={30} /></span>
              <span>Preparing your destination preview…</span>
            </div>
          ) : images.length ? (
            <>
              <div className="bev-slide-stage">
                {images.map((src, index) => (
                  <img
                    key={src}
                    src={src}
                    alt={`${destinationName} — view ${index + 1}`}
                    className={`bev-slide-image ${index === activeSlide ? "is-active" : ""}`}
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                  />
                ))}
              </div>
              <div className="bev-slide-shade" />
              <div className="bev-slide-caption">
                <span><Camera size={14} /> DESTINATION GALLERY</span>
                <strong>{destinationName}</strong>
                {countryName && <small><MapPin size={13} /> {countryName}</small>}
              </div>
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    className="bev-slide-arrow bev-slide-arrow--left"
                    onClick={() => onSlideChange((activeSlide - 1 + images.length) % images.length)}
                    aria-label="Show previous destination image"
                  ><ChevronLeft size={20} /></button>
                  <button
                    type="button"
                    className="bev-slide-arrow bev-slide-arrow--right"
                    onClick={() => onSlideChange((activeSlide + 1) % images.length)}
                    aria-label="Show next destination image"
                  ><ChevronRight size={20} /></button>
                  <div className="bev-slide-controls" aria-label="Choose destination image">
                    {images.map((src, index) => (
                      <button
                        key={src}
                        type="button"
                        className={index === activeSlide ? "is-active" : ""}
                        onClick={() => onSlideChange(index)}
                        aria-label={`Show image ${index + 1} of ${images.length}`}
                        aria-current={index === activeSlide ? "true" : undefined}
                      />
                    ))}
                  </div>
                  <span className="bev-slide-count">{String(activeSlide + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</span>
                </>
              )}
            </>
          ) : (
            <div className="bev-slide-placeholder">
              <span className="bev-placeholder-mark"><Compass size={30} /></span>
              <strong>{destinationName}</strong>
              <span>{countryName || "Your selected East African destination"}</span>
              <small>Destination photographs will appear here when available.</small>
            </div>
          )}
        </div>

        <div className="bev-destination-info">
          <span className="bev-info-kicker">MADE FOR YOUR NEXT ADVENTURE</span>
          <h3>{destinationName}</h3>
          {countryName && <div className="bev-destination-location"><MapPin size={15} /> {countryName}</div>}
          <p className="bev-destination-description">
            {description
              ? description.length > 260 ? `${description.slice(0, 257).trim()}…` : description
              : "Your selected destination is now linked to your booking request. Our team will help shape the experience around your travel plans."}
          </p>

          <div className="bev-trip-facts">
            <div className="bev-trip-fact">
              <span><CalendarDays size={16} /></span>
              <div><small>TRAVEL DATES</small><strong>{travelDates}</strong></div>
            </div>
            {travelers > 0 && (
              <div className="bev-trip-fact">
                <span><Users size={16} /></span>
                <div><small>TRAVELLERS</small><strong>{travelers} {travelers === 1 ? "traveller" : "travellers"}</strong></div>
              </div>
            )}
            {category && (
              <div className="bev-trip-fact">
                <span><Compass size={16} /></span>
                <div><small>EXPERIENCE</small><strong>{String(category).replace(/[_-]/g, " ")}</strong></div>
              </div>
            )}
            {difficulty && (
              <div className="bev-trip-fact">
                <span><MapPin size={16} /></span>
                <div><small>DIFFICULTY</small><strong>{difficulty}</strong></div>
              </div>
            )}
          </div>
          {booking?.booking_number && (
            <div className="bev-destination-reference">
              <ShieldCheck size={15} />
              <span>Linked to booking <strong>{booking.booking_number}</strong></span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function BookingVerifyResult() {
  const [params] = useSearchParams();
  const status = params.get("status") || "error";
  const reference = params.get("ref") || "";
  const config = CONFIG[status] || CONFIG.error;
  const Icon = config.icon;
  const isSuccess = config.tone === "success";

  const [booking, setBooking] = useState(null);
  const [destination, setDestination] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(isSuccess && Boolean(reference));
  const [activeSlide, setActiveSlide] = useState(0);
  const images = useMemo(
    () => collectDestinationImages(destination, booking),
    [destination, booking]
  );

  useEffect(() => {
    if (!isSuccess || !reference) {
      setBookingLoading(false);
      return undefined;
    }
    let cancelled = false;
    const loadBookingDetails = async () => {
      setBookingLoading(true);
      try {
        const tracked = await trackBooking(reference);
        if (cancelled) return;
        setBooking(tracked || null);
        const locator = tracked?.destination_id || tracked?.destination_slug;
        if (!locator) return;

        const response = await fetch(
          `${API_URL}/destinations/${encodeURIComponent(locator)}?include=gallery`,
          {
            method: "GET",
            credentials: "omit",
            cache: "no-store",
            headers: { Accept: "application/json" },
          }
        );
        if (!response.ok) return;
        const body = await response.json().catch(() => ({}));
        if (cancelled || body?.success === false) return;
        setDestination(body?.data?.destination || body?.data || body?.destination || null);
      } catch {
        // The verification result remains useful even when public destination details are unavailable.
      } finally {
        if (!cancelled) setBookingLoading(false);
      }
    };
    loadBookingDetails();
    return () => { cancelled = true; };
  }, [isSuccess, reference]);

  useEffect(() => {
    setActiveSlide(0);
  }, [images.length]);

  useEffect(() => {
    if (images.length < 2) return undefined;
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reducedMotion) return undefined;
    const timer = window.setInterval(() => {
      const slideshow = document.querySelector(".bev-slideshow");
      if (slideshow?.getAttribute("data-paused") === "true") return;
      setActiveSlide((current) => (current + 1) % images.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [images.length]);

  const tripName = booking?.destination || booking?.package || booking?.service || "";

  return (
    <main className="bev-page">
      <div className="bev-atmosphere bev-atmosphere--one" />
      <div className="bev-atmosphere bev-atmosphere--two" />
      <div className="bev-container">
        <header className="bev-header">
          <Link to="/" className="bev-brand" aria-label="Altuvera home">
            <span className="bev-brand-mark"><img src="/favicon.svg" alt="" /></span>
            <span className="bev-brand-name"><strong>ALTUVERA</strong><small>SAFARIS</small></span>
          </Link>
          <div className="bev-trust"><ShieldCheck size={16} /><span>Secure booking email status</span></div>
        </header>

        <section className="bev-intro">
          <div className="bev-eyebrow"><span className="bev-live-dot" /> {isSuccess ? "YOUR BOOKING JOURNEY" : "BOOKING EMAIL SUPPORT"}</div>
          <h1>
            {isSuccess ? <>Your journey<br /><em>starts with clarity.</em></> : <>Let’s get your<br /><em>booking sorted.</em></>}
          </h1>
          <p>
            {isSuccess
              ? "Your email confirmation is complete. Take a look at the destination you selected and the details attached to your request."
              : "This page shows the result of your booking email check and explains what to do next."}
          </p>
        </section>

        {isSuccess && (
          <DestinationShowcase
            booking={booking}
            destination={destination}
            images={images}
            loading={bookingLoading}
            activeSlide={activeSlide}
            onSlideChange={setActiveSlide}
          />
        )}

        <section className="bev-panel-wrap">
          <div className="bev-panel" aria-live="polite">
            <div className="bev-panel-head">
              <span className="bev-panel-label"><ShieldCheck size={16} /> ALTUVERA VERIFICATION RESULT</span>
              <span className={`bev-panel-state ${isSuccess ? "" : "is-error"}`}>
                {isSuccess ? <><CheckCircle2 size={14} /> Verified</> : <><AlertTriangle size={14} /> Attention needed</>}
              </span>
            </div>

            <div className="bev-state">
              <div className={`bev-status-icon ${!isSuccess ? (config.tone === "warning" ? "is-warning" : "is-error") : ""}`}>
                <Icon size={35} strokeWidth={1.8} />
              </div>
              <div className="bev-eyebrow">{config.eyebrow}</div>
              <h2>{config.title}</h2>
              <p>{config.message}</p>

              {reference && isSuccess && (
                <div className="bev-reference">
                  <ShieldCheck size={19} />
                  <div><strong>YOUR BOOKING REFERENCE</strong><small>{reference}</small></div>
                </div>
              )}

              <div className="bev-actions">
                {isSuccess && (
                  <Link to="/my-bookings" className="bev-button bev-button--primary">View my bookings <ArrowRight size={16} /></Link>
                )}
                <Link to="/" className={`bev-button ${isSuccess ? "bev-button--secondary" : "bev-button--primary"}`}>
                  Return to Altuvera <ArrowLeft size={16} />
                </Link>
                {!isSuccess && (
                  <a href="mailto:info@altuverasafaris.com" className="bev-button bev-button--secondary">Contact support <Mail size={15} /></a>
                )}
              </div>

              <div className="bev-help">
                {isSuccess
                  ? <>Need help planning this journey? <a href="mailto:info@altuverasafaris.com">Speak with our travel team</a>.</>
                  : <>Need a hand? <a href="mailto:info@altuverasafaris.com">Contact Altuvera support</a>.</>}
              </div>
            </div>
          </div>
        </section>

        <footer className="bev-footer">
          <strong>ALTUVERA</strong>
          <span className="bev-footer-separator" />
          <span>Thoughtfully planned journeys across East Africa</span>
          <Link to="/"><ArrowLeft size={13} /> Back to website</Link>
        </footer>
      </div>
    </main>
  );
}
