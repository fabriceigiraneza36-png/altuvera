import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import {
  FiArrowRight, FiArrowUpRight, FiCamera, FiCheck, FiCompass,
  FiGlobe, FiHeart, FiMap, FiMapPin, FiMail, FiShield, FiSun, FiZap
} from "react-icons/fi";
import SEO from "../components/common/SEO";
import PageHeader from "../components/common/PageHeader";
import { services } from "../data/services";
import { useTestimonials } from "../hooks/useTestimonials";
import "./services-redesign.css";

const ICONS = {
  wildlife: FiCompass,
  primate: FiHeart,
  mountain: FiMap,
  culture: FiGlobe,
  coast: FiSun,
  adventure: FiZap,
  photography: FiCamera,
  planning: FiMapPin,
};

const APPROACH = [
  {
    icon: FiMapPin,
    title: "Destination-aware planning",
    description: "We shape the route around the places you want to visit, the time available, and the conditions at your destination.",
  },
  {
    icon: FiCompass,
    title: "A journey that fits you",
    description: "Your interests, preferred pace, travel dates, and accommodation preferences guide the itinerary.",
  },
  {
    icon: FiShield,
    title: "Clear arrangements",
    description: "We help you review planned activities, inclusions, logistics, and relevant permit or availability requirements before confirming.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Tell us what you have in mind",
    description: "Share your preferred destinations, travel dates, group size, interests, and the kind of experience you are looking for.",
  },
  {
    number: "02",
    title: "Shape the itinerary",
    description: "We discuss suitable experiences and arrange a proposed route and trip details around your needs.",
  },
  {
    number: "03",
    title: "Review and confirm",
    description: "Go through the itinerary, costs, inclusions, and availability with us before making your booking decision.",
  },
];

function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const visible = useInView(ref, { once: true, margin: "-48px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.58, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Heading({ eyebrow, title, description, light = false }) {
  return (
    <div className={"sv-heading" + (light ? " sv-heading--light" : "")}>
      <span className="sv-eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
  );
}

function ServiceCard({ service, index }) {
  const Icon = ICONS[service.iconName] || FiCompass;
  const images = service.images?.length ? service.images : [service.image].filter(Boolean);
  const [activeImage, setActiveImage] = useState(0);
  useEffect(() => {
    if (images.length < 2) return undefined;
    const timer = window.setInterval(() => setActiveImage((current) => (current + 1) % images.length), 4200);
    return () => window.clearInterval(timer);
  }, [images.length]);
  return (
    <Reveal delay={(index % 3) * 0.07} className="sv-reveal">
      <article className="sv-card">
        <div className="sv-card__image">
          {images.map((image, imageIndex) => (
            <img key={image} src={image}
              alt={imageIndex === 0 ? (service.imageAlt || service.title) : ""}
              aria-hidden={imageIndex !== 0} loading="lazy"
              className={"sv-card__slide" + (imageIndex === activeImage ? " is-active" : "")}
              onError={(event) => { event.currentTarget.style.display = "none"; }}
            />
          ))}
          <div className="sv-card__shade" />
          {images.length > 1 && <div className="sv-card__dots" aria-hidden="true">
            {images.map((image, dotIndex) => <span key={image} className={dotIndex === activeImage ? "is-active" : ""} />)}
          </div>}
          <span className="sv-card__fallback-icon" aria-hidden="true"><Icon size={42} /></span>
        </div>
        <div className="sv-card__body">
          <div className="sv-card__heading">
            <span className="sv-card__icon"><Icon size={21} strokeWidth={1.8} /></span>
            <h3>{service.title}</h3>
          </div>
          <p className="sv-card__description">{service.description}</p>
          <ul className="sv-card__features">
            {(service.features || []).slice(0, 3).map((feature) => (
              <li key={feature}><FiCheck size={14} /><span>{feature}</span></li>
            ))}
          </ul>
          <Link
            to="/booking"
            state={{ service: service.title }}
            className="sv-card__action"
          >
            <span>Enquire about this service</span>
            <span className="sv-card__action-icon"><FiArrowRight size={16} /></span>
          </Link>
        </div>
      </article>
    </Reveal>
  );
}

export default function Services() {
  return (
    <>
      <SEO
        title="Travel Services Across Africa"
        description="Explore Altuvera travel services, from wildlife safaris and primate trekking to mountain journeys, cultural experiences, coastal escapes, and tailor-made trip planning across Africa."
        keywords={[
          "Altuvera travel services",
          "African safari planning",
          "wildlife safaris",
          "gorilla and primate trekking",
          "African cultural journeys",
          "tailor-made African travel",
        ]}
        url="/services"
        type="website"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Services", url: "/services" },
        ]}
      />
      <main className="sv-page">
        <PageHeader
          title="Travel Services"
          subtitle="From wildlife encounters and mountain trails to cultural journeys and coastal escapes, we help bring your African travel plans together."
          backgroundImage="https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=2200&q=88"
          height="540px"
          parallax
        >
          <div className="sv-hero-actions">
            <Link to="/booking" className="sv-button sv-button--hero">Start planning <FiArrowRight size={16} /></Link>
            <Link to="/destinations" className="sv-hero-link">Explore destinations <FiArrowUpRight size={15} /></Link>
          </div>
        </PageHeader>

        <section className="sv-intro">
          <div className="sv-container sv-intro__grid">
            <Reveal>
              <span className="sv-eyebrow">What we do</span>
              <h2>Travel planning shaped around the journey you want.</h2>
            </Reveal>
            <Reveal delay={0.08}>
              <p>
                Every traveller starts with a different idea of a meaningful trip.
                Altuvera helps bring the important pieces together — the places,
                experiences, route, timing, and practical arrangements — so your
                plans reflect what you actually want to see and do.
              </p>
              <Link to="/destinations" className="sv-inline-link">Find a destination <FiArrowRight size={15} /></Link>
            </Reveal>
          </div>
        </section>

        <section className="sv-services" id="services">
          <div className="sv-container">
            <Reveal>
              <Heading
                eyebrow="Our services"
                title="Choose how you want to explore"
                description="Explore the experiences we can help you plan. Each journey is discussed around the destination, dates, preferences, and availability."
              />
            </Reveal>
            <div className="sv-grid">
              {services.map((service, index) => (
                <ServiceCard key={service.id} service={service} index={index} />
              ))}
            </div>
          </div>
        </section>

        <section className="sv-approach">
          <div className="sv-container">
            <Reveal>
              <Heading
                eyebrow="The Altuvera approach"
                title="Thoughtful planning. Clear details."
                description="A good trip is more than a list of places. We focus on the details that help the whole journey make sense."
              />
            </Reveal>
            <div className="sv-approach-grid">
              {APPROACH.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Reveal key={item.title} delay={index * 0.08}>
                    <article className="sv-approach-card">
                      <span className="sv-approach-icon"><Icon size={22} /></span>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <section className="sv-process">
          <div className="sv-container">
            <Reveal>
              <Heading
                eyebrow="How planning works"
                title="From your first idea to a confirmed plan"
                description="A straightforward process keeps the important decisions visible at every stage."
                light
              />
            </Reveal>
            <div className="sv-process-grid">
              {STEPS.map((step, index) => (
                <Reveal key={step.number} delay={index * 0.08}>
                  <article className="sv-process-card">
                    <span className="sv-process-number">{step.number}</span>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="sv-contact">
          <Reveal>
            <div className="sv-contact-panel">
              <div className="sv-contact-orb sv-contact-orb--one" />
              <div className="sv-contact-orb sv-contact-orb--two" />
              <div className="sv-contact-content">
                <span className="sv-contact-eyebrow">Your next journey starts here</span>
                <h2>Have a destination in mind?</h2>
                <p>
                  Tell us what you would like to experience. We can help you explore
                  suitable options and work through the details of your trip.
                </p>
                <div className="sv-contact-actions">
                  <Link to="/booking" className="sv-button sv-button--hero">Plan your trip <FiArrowRight size={16} /></Link>
                  <Link to="/contact" className="sv-contact-secondary"><FiMail size={16} /> Talk to Altuvera</Link>
                </div>
                <div className="sv-team-link">
                  <span>Want to know the people behind Altuvera?</span>
                  <Link to="/team">Meet our team <FiArrowUpRight size={14} /></Link>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>
    </>
  );
}
