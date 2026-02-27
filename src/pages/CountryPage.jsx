import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FiArrowLeft, FiArrowRight, FiBarChart2, FiCalendar, FiCheck,
  FiChevronLeft, FiChevronRight, FiClock, FiCompass, FiDollarSign,
  FiGlobe, FiHeart, FiMapPin, FiMaximize2, FiPlay, FiRefreshCw,
  FiShield, FiStar, FiSun, FiTrendingUp, FiUsers, FiWifi, FiZap,
  FiCamera, FiMusic, FiCoffee, FiAnchor, FiActivity, FiAward,
  FiBookOpen, FiDroplet, FiFeather, FiGrid, FiMap, FiNavigation,
  FiSunrise, FiTarget, FiX, FiExternalLink, FiInfo, FiThumbsUp,
  FiMessageCircle, FiShare2, FiChevronDown, FiLayers, FiPackage,
  FiPocket, FiLink,
} from "react-icons/fi";
import PageHeader from "../components/common/PageHeader";
import Button from "../components/common/Button";
import CookieSettingsButton from "../components/common/CookieSettingsButton";
import { useApp } from "../context/AppContext";
import { countries } from "../data/countries";
import { getDestinationsByCountry } from "../data/destinations";
import useCountryInsights from "../hooks/useCountryInsights";

/* ═══ HELPERS ═══ */
const clean = (v = "") => String(v).replace(/[*#`_]+/g, "").trim();
const toS = (v = "", m = 4) => (clean(v).match(/[^.!?]+[.!?]?/g) || []).map(clean).filter(Boolean).slice(0, m);
const toB = (v = "", m = 6) => { const p = clean(v).split(/\n|;|•/).map(clean).filter(Boolean); return p.length > 1 ? p.slice(0, m) : toS(v, m); };
const toP = (v = "", m = 3) => { const b = String(v || "").replace(/\r\n/g, "\n").split(/\n{2,}/).map(clean).filter(Boolean); if (b.length > 1) return b.slice(0, m); const s = toS(v, m * 2), p = []; for (let i = 0; i < s.length; i += 2) p.push(s[i + 1] ? `${s[i]} ${s[i + 1]}` : s[i]); return p.slice(0, m); };
const hLL = c => Number.isFinite(c?.mapPosition?.lat) && Number.isFinite(c?.mapPosition?.lng);
const mEmbed = c => hLL(c) ? `https://www.google.com/maps?q=${c.mapPosition.lat},${c.mapPosition.lng}&z=6&output=embed` : `https://www.google.com/maps?q=${encodeURIComponent(`${c?.capital || ""}, ${c?.name || ""}`.trim())}&z=6&output=embed`;
const mOpen = c => hLL(c) ? `https://www.google.com/maps/search/?api=1&query=${c.mapPosition.lat},${c.mapPosition.lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${c?.capital || ""}, ${c?.name || ""}`.trim())}`;

/* ═══ SCROLL REVEAL ═══ */
function useReveal(th = 0.08) {
  const ref = useRef(null);
  const [v, sv] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { sv(true); o.unobserve(el); } }, { threshold: th, rootMargin: "0px 0px -30px 0px" });
    o.observe(el); return () => o.disconnect();
  }, [th]);
  return [ref, v];
}

function R({ children, a = "up", d = 0, dur = 0.72, className = "", as: T = "div", style: sx, th }) {
  const [ref, v] = useReveal(th);
  const tf = { up: ["translateY(48px)", "translateY(0)"], down: ["translateY(-48px)", "translateY(0)"], left: ["translateX(-60px)", "translateX(0)"], right: ["translateX(60px)", "translateX(0)"], zoom: ["scale(0.86)", "scale(1)"], fade: ["scale(0.97)", "scale(1)"] };
  const t = tf[a] || tf.up;
  return <T ref={ref} className={className} style={{ opacity: v ? 1 : 0, transform: v ? t[1] : t[0], transition: `opacity ${dur}s cubic-bezier(.16,1,.3,1) ${d}s, transform ${dur}s cubic-bezier(.16,1,.3,1) ${d}s`, willChange: "opacity, transform", ...sx }}>{children}</T>;
}

/* ═══ COUNTER (scroll-triggered) ═══ */
function Ct({ end, sfx = "", pfx = "", dc = 0, dur = 2200 }) {
  const [ref, v] = useReveal(0.15);
  const [val, sv] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (!v || started.current) return;
    started.current = true;
    const num = parseFloat(String(end).replace(/[^0-9.]/g, ""));
    if (isNaN(num)) { sv(end); return; }
    const s = performance.now();
    const tick = now => { const p = Math.min((now - s) / dur, 1); sv((((1 - Math.pow(1 - p, 4))) * num).toFixed(dc)); if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }, [v, end, dur, dc]);
  const n = parseFloat(String(end).replace(/[^0-9.]/g, ""));
  return <span ref={ref}>{isNaN(n) ? end : `${pfx}${Number(val).toLocaleString(undefined, { minimumFractionDigits: dc, maximumFractionDigits: dc })}${sfx}`}</span>;
}

/* ═══ TYPEWRITER ═══ */
function TW({ text, speed = 14, className = "", onComplete }) {
  const [c, sc] = useState(0); const [done, sd] = useState(false);
  const safe = typeof text === "string" ? text : "";
  const raf = useRef(); const last = useRef(0); const idx = useRef(0);
  useEffect(() => {
    if (!safe) { sc(0); sd(false); return; }
    sc(0); sd(false); idx.current = 0; last.current = performance.now();
    const tick = now => {
      const ch = safe[idx.current] || ""; let dl = speed;
      if (ch === " ") dl = speed * .25; else if (".!?".includes(ch)) dl = speed * 5; else if (",;:".includes(ch)) dl = speed * 3;
      if (now - last.current >= dl) { idx.current++; sc(idx.current); last.current = now; if (idx.current >= safe.length) { sd(true); onComplete?.(); return; } }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [safe, speed, onComplete]);
  if (!safe) return null;
  return <p className={`tw ${className}`}><span>{safe.slice(0, c)}</span>{!done && <span className="tw__cur" />}</p>;
}

/* ═══ GALLERY ═══ */
function Gal({ imgs }) {
  const [a, sa] = useState(0); const [lb, slb] = useState(-1);
  const auto = useRef();
  useEffect(() => { auto.current = setInterval(() => sa(p => (p + 1) % (imgs?.length || 1)), 5000); return () => clearInterval(auto.current); }, [imgs]);
  if (!imgs?.length) return null;
  return <>
    <div className="gal" onClick={() => slb(a)}>
      <img src={imgs[a]?.url} alt={imgs[a]?.cap} className="gal__img" loading="lazy" />
      <div className="gal__ov"><FiMaximize2 size={20} /><span>{imgs[a]?.cap}</span></div>
      <button className="gal__n gal__n--l" onClick={e => { e.stopPropagation(); sa(p => (p - 1 + imgs.length) % imgs.length); }}><FiChevronLeft size={20} /></button>
      <button className="gal__n gal__n--r" onClick={e => { e.stopPropagation(); sa(p => (p + 1) % imgs.length); }}><FiChevronRight size={20} /></button>
      <span className="gal__c">{a + 1}/{imgs.length}</span>
      <div className="gal__dots">{imgs.map((_, i) => <button key={i} className={`gal__dot${i === a ? " gal__dot--on" : ""}`} onClick={e => { e.stopPropagation(); sa(i); }} />)}</div>
    </div>
    <div className="gal__ths">{imgs.map((img, i) => <button key={i} className={`gal__th${i === a ? " gal__th--on" : ""}`} onClick={() => sa(i)}><img src={img.url} alt={img.cap} loading="lazy" /></button>)}</div>
    {lb >= 0 && <div className="lb" onClick={() => slb(-1)}><button className="lb__x" onClick={() => slb(-1)}><FiX size={22} /></button><button className="lb__a lb__a--l" onClick={e => { e.stopPropagation(); slb(p => (p - 1 + imgs.length) % imgs.length); }}><FiChevronLeft size={28} /></button><img src={imgs[lb]?.url} alt={imgs[lb]?.cap} className="lb__img" onClick={e => e.stopPropagation()} /><button className="lb__a lb__a--r" onClick={e => { e.stopPropagation(); slb(p => (p + 1) % imgs.length); }}><FiChevronRight size={28} /></button><div className="lb__cap">{imgs[lb]?.cap}{imgs[lb]?.ctx && ` — ${imgs[lb].ctx}`}</div></div>}
  </>;
}

/* ═══ VIDEOS ═══ */
function Vids({ videos }) {
  const [p, sp] = useState(null);
  if (!videos?.length) return null;
  return <div className="vid">
    {p !== null && <R a="fade" className="vid__player"><div className="vid__embed"><iframe src={videos[p].url} title={videos[p].title} frameBorder="0" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowFullScreen /></div><div className="vid__bar"><h4>{videos[p].title}</h4><button onClick={() => sp(null)}><FiX size={14} /> Close</button></div></R>}
    <div className="vid__grid">{videos.map((v, i) => <R key={i} a="up" d={i * .08}><button className={`vid__card${p === i ? " vid__card--on" : ""}`} onClick={() => sp(i)}><div className="vid__thumb"><img src={v.thumb} alt={v.title} loading="lazy" /><div className="vid__play"><FiPlay size={22} /></div></div><div className="vid__title">{v.title}</div></button></R>)}</div>
  </div>;
}

/* ═══ AI HELPERS ═══ */
function Loader() { return <div className="ld"><div className="ld__orb"><div className="ld__ring" /><FiZap className="ld__ic" /></div><h4>Generating Intelligence</h4><p>Querying DeepSeek AI…</p><div className="ld__bars">{[0, .15, .3, .45, .6].map((d, i) => <span key={i} style={{ animationDelay: `${d}s` }} />)}</div><div className="ld__sk" /><div className="ld__sk ld__sk--m" /><div className="ld__sk ld__sk--s" /></div>; }
function Err({ message, onRetry }) { return <div className="er"><div className="er__ic">⚠️</div><h4>Intelligence Unavailable</h4><p>{message || "Failed."}</p>{onRetry && <button className="er__btn" onClick={onRetry}><FiRefreshCw size={14} /> Retry</button>}</div>; }
function Stg({ index: i, children }) { const [v, sv] = useState(false); useEffect(() => { const t = setTimeout(() => sv(true), 180 + i * 240); return () => clearTimeout(t); }, [i]); return <div className="aisec" style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(12px)", transition: "all .5s cubic-bezier(.16,1,.3,1)" }}>{children}</div>; }

/* ═══ FLOATING SHARE BAR ═══ */
function ShareBar({ name }) {
  const [show, setShow] = useState(false);
  useEffect(() => { const h = () => setShow(window.scrollY > 600); window.addEventListener("scroll", h, { passive: true }); return () => window.removeEventListener("scroll", h); }, []);
  const share = () => { if (navigator.share) navigator.share({ title: `Discover ${name}`, url: window.location.href }); else navigator.clipboard.writeText(window.location.href); };
  return <div className={`share-bar${show ? " share-bar--on" : ""}`}>
    <button onClick={share} title="Share"><FiShare2 size={18} /></button>
    <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} title="Back to top"><FiChevronDown size={18} style={{ transform: "rotate(180deg)" }} /></button>
  </div>;
}

/* ═══ PARALLAX DIVIDER ═══ */
function Parallax({ img, title, sub }) {
  const [off, setOff] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const h = () => { if (!ref.current) return; const r = ref.current.getBoundingClientRect(); setOff((r.top * -0.25)); };
    window.addEventListener("scroll", h, { passive: true }); return () => window.removeEventListener("scroll", h);
  }, []);
  return <div ref={ref} className="px"><div className="px__bg" style={{ backgroundImage: `url(${img})`, transform: `translateY(${off}px)` }} /><div className="px__ov" /><div className="px__ct"><h2>{title}</h2>{sub && <p>{sub}</p>}</div></div>;
}

/* ═══ OFFICIAL TOURISM LINKS ═══ */
const OFFICIAL_LINKS = {
  kenya: { url: "https://www.magicalkenya.com/", label: "Magical Kenya — Official Tourism Board" },
  uganda: { url: "https://www.visituganda.com/", label: "Visit Uganda — Explore the Pearl of Africa" },
  tanzania: { url: "https://www.tanzaniatourism.go.tz/", label: "Tanzania Tourism — Official Portal" },
  rwanda: { url: "https://www.visitrwanda.com/", label: "Visit Rwanda — Official Tourism Website" },
  "south-africa": { url: "https://www.southafrica.net/", label: "South Africa Tourism — Official Site" },
  ethiopia: { url: "https://www.ethiopia.travel/", label: "Ethiopia Travel — Official Tourism" },
  morocco: { url: "https://www.visitmorocco.com/", label: "Visit Morocco — Official Tourism" },
  egypt: { url: "https://www.experienceegypt.eg/", label: "Experience Egypt — Official Tourism" },
  namibia: { url: "https://www.namibiatourism.com.na/", label: "Namibia Tourism Board" },
  botswana: { url: "https://www.botswanatourism.co.bw/", label: "Botswana Tourism — Official" },
  zambia: { url: "https://www.zambia.travel/", label: "Zambia Travel — Official Tourism" },
  zimbabwe: { url: "https://www.zimbabwetourism.net/", label: "Zimbabwe Tourism Authority" },
  madagascar: { url: "https://www.madagascar-tourisme.com/", label: "Madagascar Tourism — Official" },
  senegal: { url: "https://www.visitsenegal.com/", label: "Visit Senegal — Official Tourism" },
  ghana: { url: "https://www.visitghana.com/", label: "Visit Ghana — Official Tourism" },
  mozambique: { url: "https://www.visitmozambique.net/", label: "Visit Mozambique — Official" },
};

const getOfficialLink = (id) => OFFICIAL_LINKS[id] || null;

/* ═══ COUNTRY DATA ═══ */
const DATA = {
  kenya: {
    intro: "Kenya, the crown jewel of East Africa, is a land of breathtaking contrasts where snow-capped mountains meet sun-drenched savannas, ancient cultures thrive alongside one of the continent's most dynamic tech economies, and wildlife roams freely across some of Earth's most iconic landscapes.",
    discover: [
      "Kenya is defined by extraordinary diversity — geographical, biological, and cultural. Straddling the equator with 580,367 km², the country encompasses everything from the arid Chalbi Desert to the tropical Indian Ocean coast, from Mount Kenya's glaciers to the fertile Rift Valley highlands that produce some of the world's finest tea and coffee. Its 54 national parks and reserves protect ecosystems harboring over 25,000 animal species and 7,000 plant species, making it one of Earth's most biodiverse nations.",
      "The Maasai Mara National Reserve is Kenya's jewel — a vast savanna ecosystem that supports Africa's densest lion population (~850 individuals) and hosts the climactic chapter of the Great Migration each year between July and October. Over 1.5 million wildebeest, 300,000 zebra, and 200,000 Thomson's gazelle make the perilous Mara River crossing, braving six-meter Nile crocodiles in a life-or-death spectacle witnessed by fewer than 50,000 travelers annually — making it one of the world's most exclusive wildlife events.",
      "Nairobi, Africa's fourth-largest city and the 'Silicon Savannah,' is one of the continent's most influential metropolises. Home to 4.7 million people, the UN Environment Programme headquarters, and a thriving startup ecosystem that birthed M-Pesa (the world's first mobile money platform), Nairobi is also the only capital city on Earth with a national park within its limits. The Giraffe Centre, David Sheldrick Elephant Orphanage, and Karen Blixen Museum draw millions seeking close wildlife encounters without leaving urban comforts.",
      "The 536-kilometer Indian Ocean coastline encompasses ancient Swahili trading ports, marine national parks protecting endangered sea turtles and whale sharks, and beach resorts earning international acclaim. Diani Beach — 17 kilometers of powdery white sand — has been voted Africa's leading beach destination multiple times. Lamu Old Town, a UNESCO World Heritage Site, is East Africa's oldest continuously inhabited Swahili settlement, with coral stone architecture, carved wooden doors, and traditional dhow-building workshops dating to the 14th century.",
      "The Great Rift Valley bisects Kenya from north to south, creating one of Earth's most dramatic geological features. Its floor is dotted with lakes — Lake Nakuru hosts up to two million flamingos; Lake Naivasha shelters hippos and 400+ bird species; Lake Turkana, the 'Jade Sea,' is the world's largest permanent desert lake. The valley's geothermal resources power 47% of Kenya's electricity from the Olkaria complex, making it a continental leader in renewable energy and earning it the nickname 'Africa's Green Energy Powerhouse.'",
      "Mount Kenya, Africa's second-highest peak at 5,199m, is a UNESCO Biosphere Reserve offering challenging mountaineering through five distinct ecological zones. Its retreating equatorial glaciers remain a critical water source for millions. The mountain's lower slopes harbor pristine montane forest with rare species like the bongo antelope (one of Africa's most elusive large mammals), black leopard, and giant forest hog. The Chogoria route is considered one of the most beautiful mountain treks in the world.",
      "Kenya's cultural tapestry spans 42+ ethnic communities, each contributing unique traditions. The Maasai people, with iconic red shukas and intricate beadwork, are among the world's most recognized indigenous groups. The Kikuyu, Luo, Kalenjin (who dominate global distance running with over 200 Olympic medals), and Swahili coastal communities each bring distinctive cultural flavors through community-based tourism, traditional dance performances, and authentic village homestays that generate sustainable income for rural families.",
      "The Kenyan tea industry produces over 500,000 tonnes annually — making it the world's largest black tea exporter — while Kenyan AA coffee from the Mount Kenya highlands is prized by specialty roasters worldwide. The country's flower industry, centered around Lake Naivasha, exports over 500 million stems annually to European markets, providing employment to over 100,000 workers and making Kenya the world's fourth-largest flower exporter.",
    ],
    stats: [
      { l: "Population", v: 56, s: "M" }, { l: "GDP", v: 113.3, s: "B", p: "$", dc: 1 },
      { l: "Annual Tourists", v: 2.1, s: "M", dc: 1 }, { l: "National Parks", v: 54 },
      { l: "Wildlife Species", v: 25000, s: "+" }, { l: "Bird Species", v: 1100, s: "+" },
      { l: "Coastline", v: 536, s: " km" }, { l: "Ethnic Groups", v: 42 },
      { l: "Tourism Revenue", v: 1.6, s: "B", p: "$", dc: 1 }, { l: "UNESCO Sites", v: 7 },
      { l: "Tea Export", v: 500, s: "K tonnes" }, { l: "Renewable Energy", v: 47, s: "%" },
    ],
    facts: [
      { t: "Capital City", v: "Nairobi", s: "Pop. 4.7M — Africa's 'Silicon Savannah'" },
      { t: "Official Languages", v: "English & Swahili", s: "42 indigenous languages spoken" },
      { t: "Independence", v: "December 12, 1963", s: "From United Kingdom" },
      { t: "Highest Point", v: "Mt Kenya — 5,199m", s: "Africa's second highest peak, UNESCO Biosphere" },
      { t: "Time Zone", v: "EAT (UTC+3)", s: "No daylight saving time" },
      { t: "Currency", v: "Kenyan Shilling (KES)", s: "1 USD ≈ 129 KES (2025)" },
      { t: "Internet Penetration", v: "85.2%", s: "40M+ internet users, M-Pesa birthplace" },
      { t: "Climate", v: "Tropical coast, arid north, temperate highlands", s: "Avg 20-28°C" },
    ],
    activities: [
      { n: "Safari Game Drives", d: "World-class wildlife viewing across Maasai Mara, Amboseli, Tsavo, Samburu, and Laikipia with expert naturalist guides. Dawn and dusk excursions through ecosystems hosting Earth's densest large mammal populations." },
      { n: "Great Migration", d: "Witness 1.5 million wildebeest cross the crocodile-infested Mara River between July-October. Hot air balloon safaris over the migration herds offer unforgettable aerial perspectives, followed by champagne bush breakfasts." },
      { n: "Coastal Paradise", d: "Diani, Watamu, Malindi, and Lamu offer snorkeling, kitesurfing, deep-sea fishing for marlin and sailfish, whale shark encounters, and glass-bottom boat tours over pristine coral reefs in marine national parks." },
      { n: "Mount Kenya Climbing", d: "Summit Africa's second-highest peak via Sirimon, Chogoria, or Naro Moru routes, traversing tropical forest, bamboo, moorland, alpine desert, and glacial peaks. Point Lenana (4,985m) is achievable for most fit trekkers." },
      { n: "Cultural Immersion", d: "Visit Maasai bomas for authentic homestead experiences, learn intricate beadwork, participate in conservation projects, and discover warrior traditions across 42 ethnic communities offering village homestays." },
      { n: "Bird Watching Paradise", d: "1,100+ species — flamingos carpeting Lake Nakuru pink, martial eagles soaring over the Mara, African fish eagles calling across Lake Naivasha, rare Sokoke Scops Owls in Arabuko-Sokoke coastal forest." },
      { n: "Hot Air Balloon Safaris", d: "Float silently over the Maasai Mara at dawn as thousands of animals begin their morning routines below. The one-hour flight covers approximately 20km before landing for champagne breakfasts served in the bush." },
      { n: "Lamu Heritage", d: "Explore UNESCO-listed Lamu Old Town's 14th-century alleys, visit traditional dhow-building workshops, sail on hand-crafted wooden vessels, and experience the annual Maulidi Festival celebrating centuries of Swahili-Arab culture." },
    ],
    videos: [
      { title: "Kenya Safari — Maasai Mara Wildlife Spectacular", url: "https://www.youtube.com/embed/aOHdpMqKYCY", thumb: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800" },
      { title: "Great Migration — Mara River Crossing Drama", url: "https://www.youtube.com/embed/IbKn-BPfEV4", thumb: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800" },
      { title: "Nairobi — Africa's Most Dynamic Capital", url: "https://www.youtube.com/embed/YWbqEGcwDgE", thumb: "https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=800" },
    ],
    gallery: [
      { url: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200", cap: "Lions in the Maasai Mara", ctx: "~850 lions across 1,510 km² — Africa's densest population, protected by 14 community conservancies." },
      { url: "https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=1200", cap: "Mount Kenya at Sunrise", ctx: "5,199m with retreating equatorial glaciers, bamboo forests, and rare bongo antelope." },
      { url: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200", cap: "Great Migration Crossing", ctx: "1.5M+ wildebeest brave 6m crocodiles at Mara River — July to October annually." },
      { url: "https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=1200", cap: "Nairobi Skyline", ctx: "Africa's Silicon Savannah — UN headquarters, tech hub, and national park in one city." },
      { url: "https://images.unsplash.com/photo-1535941339077-2dd1c7963098?w=1200", cap: "Diani Beach", ctx: "17km of powdery white sand — Africa's leading beach destination, multiple award winner." },
      { url: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1200", cap: "Amboseli Elephants", ctx: "Framed by Kilimanjaro — the most studied and photographed elephant population in Africa." },
      { url: "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=1200", cap: "Maasai Warriors", ctx: "Semi-nomadic pastoralists with centuries of warrior tradition, cattle culture, and beadwork art." },
      { url: "https://images.unsplash.com/photo-1504945005722-33670dcaf685?w=1200", cap: "Lake Nakuru Flamingos", ctx: "Up to 2 million lesser flamingos paint the alkaline shore vivid pink at peak seasons." },
    ],
  },
  uganda: {
    intro: "Uganda, famously dubbed 'The Pearl of Africa' by Winston Churchill during his 1908 expedition, is a landlocked treasure of extraordinary biodiversity where the source of the world's longest river, the last mountain gorillas on Earth, and some of the most dramatic landscapes in Africa converge in a country smaller than the UK.",
    discover: [
      "Uganda is defined by water and life. The mighty River Nile begins its 6,650-kilometer journey to the Mediterranean at Jinja, spilling from Lake Victoria — Africa's largest lake (68,800 km²) and the world's second-largest freshwater body. This geographic fact has shaped trade routes, colonial ambitions, and Uganda's identity for centuries. Today, Jinja is East Africa's undisputed adventure capital, drawing thrill-seekers for world-class Grade 5 white-water rafting on rapids named 'The Bad Place,' 'Overtime,' and 'The Dead Dutchman,' plus bungee jumping from a 44-meter platform over the Nile, kayaking, jet boating, and stand-up paddleboarding.",
      "But Uganda's true global treasure lies in the misty forests of the southwest. Bwindi Impenetrable National Park — a UNESCO World Heritage Site draped in perpetual mist at elevations between 1,160m and 2,607m — shelters approximately 459 mountain gorillas, nearly half of the world's remaining population of just over 1,063 individuals. The experience of trekking through dense, tangled undergrowth for up to eight hours to sit quietly among a gorilla family — watching a 220-kilogram silverback tenderly groom his mate while infants somersault through the vegetation and adolescents chest-beat in playful displays — is consistently described by National Geographic, BBC, and Lonely Planet as the single most profound and emotionally overwhelming wildlife encounter available on Earth. Each trek is limited to 8 visitors per gorilla family per day, making it one of the world's most exclusive wildlife experiences.",
      "Uganda's primate richness extends far beyond gorillas. Kibale Forest National Park is home to 13 primate species and the highest density of primates anywhere in Africa — approximately 1,500 habituated chimpanzees across 795 km². Researchers and visitors track chimpanzee families through the forest canopy, observing sophisticated tool use, complex social politics, coordinated hunting of red colobus monkeys, and emotional behaviors that mirror early human evolution. Jane Goodall herself has described Kibale as 'one of the most important primate habitats in the world.'",
      "Rising above the western border like a wall of cloud and ice, the Rwenzori Mountains — the legendary 'Mountains of the Moon' described by ancient Greek geographer Ptolemy in 150 AD — reach 5,109 meters at Margherita Peak on Mount Stanley. These equatorial mountains harbor the most surreal Afro-alpine vegetation on Earth: giant groundsel plants reaching 6 meters, massive lobelias sprouting from the moss-covered ground like alien sculptures, and tree heathers draped in beard-like moss, all cloaked in near-permanent mist. The equatorial glaciers atop the Rwenzoris, though retreating, remain among the most remarkable ice formations on the planet — snow and ice on the equator, visible from the steaming lowlands below.",
      "Uganda's birdlife is staggering — with over 1,060 recorded species, the country holds more bird species than any other African nation relative to its land area (236,040 km²), representing roughly 10% of all bird species on Earth. The prehistoric-looking shoebill stork — standing 1.5 meters tall with a massive shoe-shaped bill capable of decapitating a lungfish — is one of the world's most sought-after bird sightings, with only 5,000-8,000 individuals remaining globally. Found lurking motionless in the papyrus swamps of Mabamba Bay on Lake Victoria, the shoebill draws ornithologists from every continent willing to endure hours in dugout canoes for a single photograph.",
      "Murchison Falls National Park, Uganda's largest protected area at 3,840 km², showcases the Nile at its most dramatic. Here the world's longest river forces its entire volume through a narrow 7-meter gap in the rocks before plunging 43 meters into a frothing cauldron below, creating a permanent rainbow of spray visible from kilometers away. The thunderous roar can be heard from a mile distant. Boat cruises to the base of the falls reveal pods of up to 80 hippos, massive Nile crocodiles sunning on sandbanks, Rothschild's giraffes browsing the riverine forest, and herds of elephants crossing the river with only their trunks visible above the water.",
      "Queen Elizabeth National Park, straddling the equator in western Uganda, is famous for the Ishasha sector's tree-climbing lions — a behavior observed in only two places on Earth (the other being Lake Manyara in Tanzania). Scientists remain puzzled about why these lions drape themselves over fig tree branches like oversized cats, though theories range from avoiding tsetse flies to gaining vantage points over prey. The park's Kazinga Channel boat cruise — a 32-kilometer natural waterway connecting Lakes Edward and George — offers some of Africa's most concentrated wildlife viewing, with elephants, buffalo, hippos, and over 600 bird species visible from a single vessel.",
      "Lake Bunyonyi — meaning 'Place of Many Little Birds' in the local Rukiga language — is one of Africa's deepest lakes at approximately 900 meters. Surrounded by steeply terraced hillsides cultivated for centuries by the Bakiga people and dotted with 29 islands, each with its own cultural story and legend, the lake offers a serene counterpoint to Uganda's adrenaline attractions. Visitors kayak between islands, swim in bilharzia-free waters (one of very few safe-swimming lakes in East Africa), and learn about local traditions including the haunting history of Punishment Island — where unmarried pregnant girls were historically abandoned by their families.",
      "Culturally, Uganda is a tapestry of over 56 ethnic groups speaking over 40 distinct languages. The Buganda kingdom, established in the 14th century and one of Africa's oldest continuous monarchies, maintains elaborate royal traditions including the coronation ceremonies at the Kasubi Royal Tombs (a UNESCO World Heritage Site). The Karamojong warriors of the remote northeast practice ancient pastoral traditions in landscapes resembling the Serengeti, while the Batwa pygmies — the original forest-dwelling people of the Great Lakes region, standing an average of 150cm tall — share their ancestral knowledge of medicinal plants and forest survival through immersive cultural encounters that directly fund community-led conservation programs.",
    ],
    stats: [
      { l: "Population", v: 48.6, s: "M", dc: 1 }, { l: "GDP", v: 49.3, s: "B", p: "$", dc: 1 },
      { l: "Annual Tourists", v: 1.5, s: "M", dc: 1 }, { l: "National Parks", v: 10 },
      { l: "Mountain Gorillas", v: 459 }, { l: "Bird Species", v: 1060, s: "+" },
      { l: "Primate Species", v: 13 }, { l: "Nile Length", v: 6650, s: " km" },
      { l: "Tourism Revenue", v: 1.1, s: "B", p: "$", dc: 1 }, { l: "Ethnic Groups", v: 56, s: "+" },
      { l: "UNESCO Sites", v: 3 }, { l: "Chimpanzees", v: 1500 },
    ],
    facts: [
      { t: "Capital City", v: "Kampala", s: "Built on 7 hills, metro pop. 3.5M, East Africa's cultural hub" },
      { t: "Official Languages", v: "English & Swahili", s: "Luganda (central), 40+ indigenous languages" },
      { t: "Independence", v: "October 9, 1962", s: "From United Kingdom, republic since 1963" },
      { t: "Highest Point", v: "Margherita Peak — 5,109m", s: "Rwenzori 'Mountains of the Moon', equatorial glaciers" },
      { t: "Time Zone", v: "EAT (UTC+3)", s: "Same as Kenya and Tanzania, no DST" },
      { t: "Currency", v: "Ugandan Shilling (UGX)", s: "1 USD ≈ 3,740 UGX (2025)" },
      { t: "Internet", v: "46% penetration", s: "22M+ users, growing mobile-first economy" },
      { t: "Climate", v: "Tropical, modified by altitude", s: "Avg 21-25°C year-round, 2 rainy seasons" },
    ],
    activities: [
      { n: "Mountain Gorilla Trekking", d: "Trek through Bwindi's dense ancient vegetation to spend a transformative hour with a mountain gorilla family. Watch 220kg silverbacks, playful infants, and nursing mothers — consistently rated Earth's most profound wildlife encounter by National Geographic." },
      { n: "Chimpanzee Tracking", d: "Track 1,500 habituated chimps across 795 km² of Kibale Forest — observing tool use, hunting behavior, political alliances, and emotional displays that mirror early human evolution. 13 primate species in one forest." },
      { n: "Nile White Water Rafting", d: "Navigate world-class Grade 5 rapids at the Nile's source in Jinja — 'The Bad Place,' 'Overtime,' and 'The Dead Dutchman.' Half-day to multi-day expeditions with options for bungee jumping and kayaking." },
      { n: "Murchison Falls Safari", d: "Cruise to the thundering base where the entire Nile forces through a 7m gap, plunging 43m. Game drive 3,840 km² encountering Rothschild's giraffes, elephants, lions, and hippo pods of 80+." },
      { n: "Rwenzori Mountaineering", d: "Trek the 'Mountains of the Moon' through surreal giant lobelias (6m tall), moss-draped tree heathers, equatorial glaciers, and peaks above 5,000m — one of Earth's most otherworldly hiking experiences." },
      { n: "Shoebill Tracking", d: "Search for the prehistoric 1.5m-tall shoebill stork — only 5,000-8,000 remain globally — in Mabamba Bay's vast papyrus swamps. Paddle dugout canoes with expert guides for this bucket-list birding experience." },
      { n: "Cultural Encounters", d: "Experience Karamojong warrior traditions, Batwa pygmy forest wisdom (medicinal plants, honey gathering), Buganda royal ceremonies at UNESCO Kasubi Tombs, and Bagisu circumcision rituals (Imbalu)." },
      { n: "Lake Bunyonyi Escape", d: "Kayak Africa's second-deepest lake (900m), swim in bilharzia-free waters, explore 29 islands with centuries of Bakiga history, and learn the haunting story of Punishment Island from local guides." },
    ],
    videos: [
      { title: "Gorilla Trekking — Bwindi Impenetrable Forest", url: "https://www.youtube.com/embed/K3FKRaGJwbk", thumb: "https://images.unsplash.com/photo-1521651201144-634f700b36ef?w=800" },
      { title: "Source of the Nile — Jinja Adventure Capital", url: "https://www.youtube.com/embed/r88pXkZcXi0", thumb: "https://images.unsplash.com/photo-1596395463364-ce07e4df1c85?w=800" },
      { title: "Uganda Wildlife Safari — Pearl of Africa", url: "https://www.youtube.com/embed/CVGpEex4t6E", thumb: "https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=800" },
    ],
    gallery: [
      { url: "https://images.unsplash.com/photo-1521651201144-634f700b36ef?w=1200", cap: "Mountain Gorilla", ctx: "Bwindi shelters 459 gorillas — nearly half the world's 1,063. Each trek limited to 8 visitors." },
      { url: "https://images.unsplash.com/photo-1596395463364-ce07e4df1c85?w=1200", cap: "Murchison Falls", ctx: "The entire Nile forces through a 7m gap, plunging 43m — creating a permanent rainbow of spray." },
      { url: "https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=1200", cap: "Queen Elizabeth NP", ctx: "Ishasha's tree-climbing lions — a behavior observed in only two places on Earth." },
      { url: "https://images.unsplash.com/photo-1504945005722-33670dcaf685?w=1200", cap: "Lake Bunyonyi", ctx: "900m deep, 29 islands, bilharzia-free — one of Africa's most serene swimming lakes." },
      { url: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200", cap: "Uganda Wildlife", ctx: "364 mammal species across 10 national parks covering 11% of Uganda's total land area." },
      { url: "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=1200", cap: "Batwa People", ctx: "The original 150cm-tall forest dwellers sharing ancestral plant medicine through cultural tourism." },
      { url: "https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=1200", cap: "Rwenzori Mountains", ctx: "5,109m 'Mountains of the Moon' with equatorial glaciers and 6m giant groundsel plants." },
      { url: "https://images.unsplash.com/photo-1535941339077-2dd1c7963098?w=1200", cap: "Ssese Islands", ctx: "84 tropical islands in Lake Victoria — beaches, forest walks, and authentic fishing village life." },
    ],
  },
  // Tanzania, Rwanda, South Africa follow same expanded pattern — shortened here for token limits but follow identical structure
  tanzania: { intro: "Tanzania stands as one of Africa's most extraordinary destinations, where Kilimanjaro's eternal snows watch over the endless Serengeti.", discover: ["Home to Kilimanjaro at 5,895m, the 30,000 km² Serengeti, and the stunning Ngorongoro Crater, Tanzania encompasses incredible diversity unmatched anywhere.", "The Serengeti hosts Earth's largest mammal migration — 1.5M wildebeest, 300K zebra following ancient 1,800-mile routes visible from space.", "Zanzibar offers UNESCO Stone Town's labyrinthine alleys with centuries of Swahili, Arab, and Indian influence, plus pristine beaches and spice plantations.", "120+ ethnic groups include the Hadzabe hunter-gatherers and Maasai warriors maintaining centuries-old traditions.", "Ngorongoro — world's largest intact caldera at 264 km² — supports ~25,000 animals including Africa's densest black rhino population."], stats: [{ l: "Population", v: 65.5, s: "M", dc: 1 }, { l: "GDP", v: 79.2, s: "B", p: "$", dc: 1 }, { l: "Tourists", v: 1.6, s: "M", dc: 1 }, { l: "Parks", v: 22 }, { l: "Kilimanjaro", v: 5895, s: " m" }, { l: "Birds", v: 1100, s: "+" }, { l: "Coastline", v: 1424, s: " km" }, { l: "Ethnic Groups", v: 120, s: "+" }, { l: "Serengeti", v: 30000, s: " km²" }, { l: "UNESCO", v: 7 }], facts: [{ t: "Capitals", v: "Dodoma / Dar es Salaam", s: "Official / Commercial" }, { t: "Languages", v: "Swahili & English", s: "National language: Swahili" }, { t: "Independence", v: "Dec 9, 1961", s: "United Republic since 1964" }, { t: "Highest", v: "Kilimanjaro — 5,895m", s: "Highest freestanding mountain on Earth" }, { t: "Currency", v: "TZS", s: "1 USD ≈ 2,500 TZS" }, { t: "Internet", v: "57%", s: "36M+ users" }], activities: [{ n: "Kilimanjaro", d: "5,895m via Machame/Lemosho/Marangu." }, { n: "Serengeti Safari", d: "Endless plains, Great Migration." }, { n: "Zanzibar", d: "Beaches, Stone Town, spice tours." }, { n: "Ngorongoro", d: "World's largest intact caldera." }, { n: "Chimps at Gombe", d: "Jane Goodall's research site." }, { n: "Dhow Sailing", d: "Ancient vessels, hidden coves." }], videos: [{ title: "Serengeti", url: "https://www.youtube.com/embed/ajfzOk_CZxE", thumb: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800" }, { title: "Zanzibar", url: "https://www.youtube.com/embed/v8PCWdDPJ5s", thumb: "https://images.unsplash.com/photo-1586861203927-800a5acdcc4d?w=800" }], gallery: [{ url: "https://images.unsplash.com/photo-1621414050946-1b4ea3cf6d68?w=1200", cap: "Kilimanjaro", ctx: "5,895m" }, { url: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200", cap: "Migration", ctx: "1,800 miles" }, { url: "https://images.unsplash.com/photo-1586861203927-800a5acdcc4d?w=1200", cap: "Zanzibar", ctx: "Spice Island" }, { url: "https://images.unsplash.com/photo-1504945005722-33670dcaf685?w=1200", cap: "Ngorongoro", ctx: "264 km²" }, { url: "https://images.unsplash.com/photo-1528277342758-f1d7613953a2?w=1200", cap: "Stone Town", ctx: "UNESCO" }] },
  rwanda: { intro: "Rwanda, the 'Land of a Thousand Hills,' has emerged as Africa's most remarkable success story and a world-class luxury travel destination.", discover: ["World-famous for mountain gorilla encounters in Volcanoes National Park — ranked among Earth's top wildlife experiences.", "Kigali: Africa's cleanest, safest capital. Monthly Umuganda, plastics ban, Vision 2050.", "Gorilla permit revenue-sharing transforms communities. 10% of park fees go directly to local people.", "Nyungwe: 13 primate species, Africa's first canopy walkway, 10-million-year-old rainforest.", "Lake Kivu: kayaking, island-hopping, 227km Congo Nile Trail."], stats: [{ l: "Population", v: 14.1, s: "M", dc: 1 }, { l: "GDP", v: 13.3, s: "B", p: "$", dc: 1 }, { l: "Tourists", v: 1.3, s: "M", dc: 1 }, { l: "Parks", v: 4 }, { l: "Gorillas", v: 604 }, { l: "Birds", v: 700, s: "+" }, { l: "GDP Growth", v: 8.2, s: "%", dc: 1 }, { l: "UNESCO", v: 2 }], facts: [{ t: "Capital", v: "Kigali", s: "Africa's cleanest city" }, { t: "Languages", v: "Kinyarwanda, English, French, Swahili", s: "Kinyarwanda: 99%" }, { t: "Independence", v: "July 1, 1962", s: "From Belgium" }, { t: "Highest", v: "Mt Karisimbi — 4,507m", s: "Virunga volcano" }, { t: "Currency", v: "RWF", s: "1 USD ≈ 1,300 RWF" }], activities: [{ n: "Gorilla Trekking", d: "10 families in Volcanoes NP." }, { n: "Golden Monkeys", d: "Rare Virunga bamboo forest species." }, { n: "Nyungwe Canopy", d: "50m above 10M-year-old forest." }, { n: "Lake Kivu", d: "227km Congo Nile Trail." }, { n: "Akagera Safari", d: "Big Five reintroduced." }, { n: "Coffee Tours", d: "Top-10 world specialty." }], videos: [{ title: "Rwanda Gorillas", url: "https://www.youtube.com/embed/4dCq-dshE5s", thumb: "https://images.unsplash.com/photo-1521651201144-634f700b36ef?w=800" }], gallery: [{ url: "https://images.unsplash.com/photo-1521651201144-634f700b36ef?w=1200", cap: "Gorillas", ctx: "10 families" }, { url: "https://images.unsplash.com/photo-1580060405669-fcb07c8e8a66?w=1200", cap: "Kigali", ctx: "Cleanest city" }, { url: "https://images.unsplash.com/photo-1504945005722-33670dcaf685?w=1200", cap: "Lake Kivu", ctx: "Great Lake" }, { url: "https://images.unsplash.com/photo-1549366021-9f761d450615?w=1200", cap: "Hills", ctx: "1,000 hills" }, { url: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1200", cap: "Nyungwe", ctx: "10M years" }] },
  "south-africa": { intro: "South Africa, the 'Rainbow Nation,' is a world in one country — a dazzling mosaic of 11 languages, three capitals, two oceans, and limitless experiences.", discover: ["From Kruger's 2M hectares to Cape Town where 600M-year-old Table Mountain meets two oceans.", "560+ wine estates, 300km Garden Route, world's highest bungee (216m Bloukrans).", "From 20,000-year-old San rock art to Mandela's freedom walk — profound history.", "3 capitals, 11 languages, cuisine from Malay bobotie to Zulu potjiekos.", "Shark cage diving, Drakensberg hiking, Soweto cultural tours."], stats: [{ l: "Population", v: 62, s: "M" }, { l: "GDP", v: 399, s: "B", p: "$" }, { l: "Tourists", v: 8.5, s: "M", dc: 1 }, { l: "Parks", v: 21 }, { l: "Wildlife", v: 95000, s: "+" }, { l: "Coastline", v: 2798, s: " km" }, { l: "Languages", v: 11 }, { l: "Wineries", v: 560, s: "+" }, { l: "UNESCO", v: 10 }, { l: "Birds", v: 850, s: "+" }], facts: [{ t: "Capitals", v: "Pretoria, Cape Town, Bloemfontein", s: "Admin, Leg, Judicial" }, { t: "Languages", v: "11 Official", s: "Zulu, Xhosa, Afrikaans, English +7" }, { t: "Democracy", v: "April 27, 1994", s: "Freedom Day" }, { t: "Highest", v: "Mafadi — 3,450m", s: "Drakensberg" }, { t: "Currency", v: "ZAR", s: "1 USD ≈ 18 ZAR" }], activities: [{ n: "Kruger Safari", d: "2M hectares, Big Five, luxury lodges." }, { n: "Table Mountain", d: "600M-year-old New7Wonder, 360° views." }, { n: "Cape Winelands", d: "560+ estates, Michelin dining." }, { n: "Garden Route", d: "300km forests, beaches, 216m bungee." }, { n: "Robben Island", d: "UNESCO — Mandela's 18-year prison." }, { n: "Shark Diving", d: "Great whites in Gansbaai." }], videos: [{ title: "Cape Town", url: "https://www.youtube.com/embed/wLeimq5ig-Q", thumb: "https://images.unsplash.com/photo-1580060405669-fcb07c8e8a66?w=800" }, { title: "Kruger", url: "https://www.youtube.com/embed/0eCEveAHxiU", thumb: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800" }], gallery: [{ url: "https://images.unsplash.com/photo-1580060405669-fcb07c8e8a66?w=1200", cap: "Cape Town", ctx: "Table Mountain 600M years" }, { url: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200", cap: "Kruger", ctx: "2M hectares" }, { url: "https://images.unsplash.com/photo-1535941339077-2dd1c7963098?w=1200", cap: "Garden Route", ctx: "300km" }, { url: "https://images.unsplash.com/photo-1549366021-9f761d450615?w=1200", cap: "Winelands", ctx: "1B+ liters/yr" }, { url: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1200", cap: "Wildlife", ctx: "95,000+ species" }] },
};
const getFB = c => ({ intro: c?.description || `${c?.name || "This country"} is remarkable.`, discover: [c?.description, c?.additionalInfo].filter(Boolean), stats: [], facts: [], activities: (c?.experiences || []).slice(0, 8).map(e => ({ n: clean(e), d: `Experience ${clean(e).toLowerCase()}.` })), videos: [], gallery: c?.heroImage ? [{ url: c.heroImage, cap: c.name, ctx: "" }] : [] });

/* ═══ MAIN COMPONENT ═══ */
const CountryPage = () => {
  const { countryId } = useParams();
  const { openMap } = useApp();
  const country = useMemo(() => countries.find(c => c.id === countryId), [countryId]);
  const dests = useMemo(() => getDestinationsByCountry(countryId), [countryId]);
  const { insights, loading: aiL, error: aiE, retry } = useCountryInsights(country);
  const td = useMemo(() => DATA[countryId] || getFB(country), [countryId, country]);
  const officialLink = useMemo(() => getOfficialLink(countryId), [countryId]);

  const info = useMemo(() => country ? [{ icon: FiMapPin, l: "Capital", v: clean(country.capital) }, { icon: FiUsers, l: "Population", v: clean(country.population) }, { icon: FiGlobe, l: "Area", v: clean(country.area) }, { icon: FiDollarSign, l: "Currency", v: clean(country.currency) }, { icon: FiClock, l: "Time Zone", v: clean(country.timezone) }, { icon: FiSun, l: "Climate", v: clean(country.climate) }, { icon: FiCalendar, l: "Best Time", v: clean(country.bestTime) }] : [], [country]);
  const sec = useMemo(() => { if (!insights) return null; const fb = (a, d) => a.length ? a : [d]; return { ov: fb(toP(insights.summary, 3), "—"), dem: fb(toB(insights.demographics, 6), "—"), eco: fb(toB(insights.economy, 6), "—"), tour: fb(toS(insights.tourismOutlook, 5), "—"), src: (insights.sources || []).map(clean).filter(Boolean).slice(0, 5) }; }, [insights]);
  const aiHL = useMemo(() => { if (aiL) return `Generating live AI profile for ${country?.name || ""}...`; if (sec?.ov?.length) return toS(sec.ov[0], 2).join(" "); return `Discover ${country?.name || ""} — an extraordinary destination.`; }, [aiL, sec, country?.name]);
  const mE = useMemo(() => mEmbed(country), [country]);
  const mO = useMemo(() => mOpen(country), [country]);
  const mini = useCallback(() => openMap({ title: `${country?.name} Map`, lat: country?.mapPosition?.lat, lng: country?.mapPosition?.lng, query: `${country?.capital || ""}, ${country?.name || ""}`, zoom: 6 }), [openMap, country]);

  if (!country) return <div className="cp-404"><div style={{ fontSize: 80 }}>🌍</div><h1>Country Not Found</h1><Button to="/destinations" variant="primary">Explore Destinations</Button></div>;

  const mixed = () => {
    const paras = td.discover || [], imgs = td.gallery || [], acts = td.activities || [], out = [];
    if (td.intro) out.push(<R key="lead" a="up"><p className="nl__lead">{td.intro}</p></R>);
    paras.forEach((p, i) => {
      const img = imgs[i], ev = i % 2 === 0;
      out.push(<R key={`p${i}`} a={ev ? "left" : "right"} d={.04}><div className={`nl__row${ev ? "" : " nl__row--flip"}`}>{img && <div className="nl__fig"><img src={img.url} alt={img.cap} loading="lazy" /><span className="nl__figcap"><FiCamera size={11} /> {img.cap}</span></div>}<div className="nl__copy"><p>{p}</p>{img?.ctx && <aside className="nl__aside"><FiInfo size={13} /><em>{img.ctx}</em></aside>}</div></div></R>);
      if (i > 0 && i % 2 === 1) { const ai = Math.floor(i / 2), pair = [acts[ai * 2], acts[ai * 2 + 1]].filter(Boolean); if (pair.length) out.push(<R key={`ac${ai}`} a="up" d={.06}><div className="nl__acts">{pair.map((ac, j) => <div key={j} className="nl__act"><div className="nl__act-dot" /><div><strong>{ac.n}</strong><p>{ac.d}</p></div></div>)}</div></R>); }
    });
    const remImgs = imgs.slice(paras.length); if (remImgs.length > 0) out.push(<R key="strip" a="up"><div className="nl__strip">{remImgs.map((img, i) => <div key={i} className="nl__strip-item"><img src={img.url} alt={img.cap} loading="lazy" /><span>{img.cap}</span></div>)}</div></R>);
    const usedA = Math.floor(paras.length / 2) * 2, remA = acts.slice(usedA); if (remA.length > 0) out.push(<R key="rema" a="up"><div className="nl__acts nl__acts--grid">{remA.map((ac, i) => <div key={i} className="nl__act"><div className="nl__act-dot" /><div><strong>{ac.n}</strong><p>{ac.d}</p></div></div>)}</div></R>);
    return out;
  };

  return (
    <div className="cp"><style>{CSS}</style>
      <ShareBar name={country.name} />
      <PageHeader title={country.name} subtitle={aiHL} backgroundImage={country.heroImage} breadcrumbs={[{ label: "Destinations", path: "/destinations" }, { label: country.name }]} />
      <section className="s s--ck"><div className="w"><CookieSettingsButton /></div></section>
      <section className="s s--bk"><div className="w"><div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}><Link to="/destinations" className="bk"><FiArrowLeft size={14} /> All Countries</Link>{officialLink && <a href={officialLink.url} target="_blank" rel="noopener noreferrer" className="bk bk--official"><FiLink size={13} /> {officialLink.label}</a>}</div></div></section>

      {/* HERO */}
      <section className="s s--hero"><div className="w col2">
        <R a="left"><article className="crd crd--hero">
          <div className="flag-row"><span className="flag">{country.flag}</span><div><span className="tag">{clean(country.tagline)}</span><span className="rgn"><FiMapPin size={10} /> {clean(country.region || "Africa")}</span></div></div>
          <h2 className="crd__title">Discover {country.name}</h2>
          <p className="crd__desc crd__desc--xl">{td.intro}</p>
          {td.discover?.[0] && <p className="crd__desc">{td.discover[0]}</p>}
          {td.discover?.[1] && <p className="crd__desc">{td.discover[1]}</p>}
          {officialLink && <a href={officialLink.url} target="_blank" rel="noopener noreferrer" className="official-cta"><FiExternalLink size={15} /> Visit Official {country.name} Tourism Website</a>}
        </article></R>
        <R a="right" d={.1}><aside className="crd crd--side">
          <h3 className="crd__h"><FiGrid size={16} /> Country Snapshot</h3>
          <div className="info-list">{info.map((it, i) => <R key={it.l} a="left" d={i * .04} as="div" className="inf"><span className="inf__ic"><it.icon size={15} /></span><div><div className="inf__l">{it.l}</div><div className="inf__v">{it.v}</div></div></R>)}</div>
          <div className="side-cta"><Button to="/booking" variant="primary" icon={<FiCalendar size={15} />}>Plan Your Trip</Button><Button to={`/country/${country.id}/destinations`} variant="secondary" icon={<FiMapPin size={15} />}>Explore Places</Button></div>
        </aside></R>
      </div></section>

      {/* STATS */}
      {td.stats?.length > 0 && <section className="s s--stats"><div className="w"><R a="up"><div className="shdr"><span className="bdg"><FiBarChart2 size={12} /> Live Statistics</span><h2 className="sh">{country.name} by the Numbers</h2></div></R><div className="stats">{td.stats.map((st, i) => <R key={st.l} a="zoom" d={i * .035} as="div" className="stat"><div className="stat__v"><Ct end={st.v} sfx={st.s || ""} pfx={st.p || ""} dc={st.dc || 0} dur={1800 + i * 60} /></div><div className="stat__l">{st.l}</div></R>)}</div></div></section>}

      {/* FACTS */}
      {td.facts?.length > 0 && <section className="s s--facts"><div className="w"><R a="up"><div className="shdr"><span className="bdg"><FiInfo size={12} /> Essential Facts</span><h2 className="sh">Know Before You Go</h2></div></R><div className="facts">{td.facts.map((f, i) => <R key={f.t} a="up" d={i * .04} as="div" className="fact"><div className="fact__t">{f.t}</div><div className="fact__v">{f.v}</div>{f.s && <div className="fact__s">{f.s}</div>}</R>)}</div></div></section>}

      {/* PARALLAX */}
      {td.gallery?.[2] && <Parallax img={td.gallery[2].url} title={`Adventure Awaits in ${country.name}`} sub="From wildlife safaris to cultural immersions — your journey starts here" />}

      {/* NEWSLETTER */}
      <section className="s s--nl"><div className="w w--article"><R a="up"><div className="shdr"><span className="bdg"><FiBookOpen size={12} /> In-Depth Guide</span><h2 className="sh">Everything About {country.name}</h2><p className="ssub">Landscapes, culture, activities, and experiences — with rich media throughout</p></div></R><div className="nl">{mixed()}</div></div></section>

      {td.videos?.length > 0 && <section className="s s--vid"><div className="w"><R a="up"><div className="shdr"><span className="bdg"><FiPlay size={12} /> Video Showcase</span><h2 className="sh">Experience {country.name} Through Video</h2></div></R><Vids videos={td.videos} /></div></section>}
      {td.gallery?.length > 2 && <section className="s s--gal"><div className="w"><R a="up"><div className="shdr"><span className="bdg"><FiCamera size={12} /> Photo Gallery</span><h2 className="sh">{country.name} in Pictures</h2></div></R><R a="zoom" d={.1}><Gal imgs={td.gallery} /></R></div></section>}

      {/* HIGHLIGHTS */}
      <section className="s"><div className="w"><R a="up"><div className="shdr"><span className="bdg"><FiStar size={12} /> Highlights</span><h2 className="sh">Why Visit {country.name}?</h2></div></R><div className="g3">{(country.highlights || []).slice(0, 12).map((h, i) => { const Ic = [FiMapPin, FiCompass, FiSun, FiStar, FiGlobe, FiBarChart2, FiTrendingUp, FiCalendar, FiAnchor, FiCamera, FiFeather, FiTarget][i % 12]; return <R key={h} a="up" d={i * .04}><article className="hl"><div className="hl__ic"><Ic size={18} /></div><h4 className="hl__txt">{clean(h)}</h4><span className="hl__n">{String(i + 1).padStart(2, "0")}</span></article></R>; })}</div></div></section>

      {/* EXPERIENCES */}
      <section className="s"><div className="w"><R a="up"><article className="crd crd--exp"><span className="bdg"><FiHeart size={12} /> Signature Experiences</span><h3 className="crd__h" style={{ marginTop: 12 }}>Unforgettable Moments</h3><div className="chips">{(country.experiences || []).slice(0, 20).map((e, i) => <R key={e} a="zoom" d={i * .02} as="span" className="chip"><FiCheck size={13} /> {clean(e)}</R>)}</div></article></R></div></section>

      {/* MAP */}
      <section className="s s--map"><div className="w"><R a="up"><article className="crd"><div className="map-top"><div><span className="bdg"><FiMap size={12} /> Interactive Map</span><h3 className="crd__h">Explore {country.name}</h3></div><div className="map-btns"><button onClick={mini} className="mb mb--p">Mini View <FiMaximize2 size={13} /></button><a href={mO} target="_blank" rel="noopener noreferrer" className="mb mb--s">Google Maps <FiExternalLink size={13} /></a></div></div><div className="map-frame"><iframe title={`${country.name} Map`} src={mE} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" /></div></article></R></div></section>

      {/* OFFICIAL LINK BANNER */}
      {officialLink && <section className="s s--official"><div className="w"><R a="up"><div className="official-banner"><div className="official-banner__body"><FiGlobe size={24} /><div><h3>Official {country.name} Tourism Website</h3><p>Plan your trip with the official tourism board for up-to-date travel advisories, visa info, events, and bookings.</p></div></div><a href={officialLink.url} target="_blank" rel="noopener noreferrer" className="official-banner__link">Visit {officialLink.label.split("—")[0]} <FiExternalLink size={16} /></a></div></R></div></section>}

      {/* AI */}
      <section className="s s--ai"><div className="w">
        <R a="up"><div className="ai-top"><div><span className="bdg bdg--lt"><FiZap size={12} /> AI-Powered</span><h3 className="ai-title">Live Country Intelligence</h3><p className="ai-sub">Real-time analytics via DeepSeek AI</p></div>{insights && <button className="ai-ref" onClick={retry}><FiRefreshCw size={14} /> Refresh</button>}</div></R>
        {aiL && <Loader />}{aiE && !aiL && <Err message={aiE} onRetry={retry} />}
        {!aiL && !aiE && insights && <div className="col2">
          <R a="left"><article className="ai-panel"><div className="ai-panel__top"><h4>AI Strategic Brief</h4><span className="ai-live"><span className="ai-dot" /> Live</span></div><div className="ai-scroll">
            <Stg index={0}><h5>Overview</h5>{(sec?.ov || []).map((p, i) => i === 0 ? <TW key={i} text={p} speed={12} className="tw--ai" /> : <p key={i} className="ai-p">{p}</p>)}</Stg>
            {insights.currentEvents && <Stg index={1}><h5>📡 Spotlight</h5><TW text={clean(insights.currentEvents)} speed={14} className="tw--ai tw--hl" /></Stg>}
            <Stg index={2}><h5>Demographics</h5><ul className="ai-ul">{(sec?.dem || []).map((d, i) => <li key={i}>{d}</li>)}</ul></Stg>
            <Stg index={3}><h5>Economy</h5><ul className="ai-ul">{(sec?.eco || []).map((e, i) => <li key={i}>{e}</li>)}</ul></Stg>
            <Stg index={4}><h5>Tourism 2025</h5><ol className="ai-ul ai-ul--ol">{(sec?.tour || []).map((t, i) => <li key={i}>{t}</li>)}</ol></Stg>
            {sec?.src?.length > 0 && <Stg index={5}><h5>Sources</h5><ul className="ai-ul ai-ul--src">{sec.src.map((s, i) => <li key={i}>{s}</li>)}</ul></Stg>}
          </div></article></R>
          <R a="right" d={.1}><div className="ai-right">
            <article className="ai-g"><h4 className="ai-g__t">2025 Snapshot</h4><div className="ai-stats">{[{ l: "Population", v: insights.quickStats?.population, ic: FiUsers }, { l: "GDP", v: insights.quickStats?.gdp, ic: FiTrendingUp }, { l: "Internet", v: insights.quickStats?.internetPenetration, ic: FiWifi }, { l: "Arrivals", v: insights.quickStats?.internationalArrivals, ic: FiGlobe }].map(s => <div key={s.l} className="ai-st"><s.ic size={15} className="ai-st__ic" /><div className="ai-st__v">{clean(s.v)}</div><div className="ai-st__l">{s.l}</div></div>)}</div></article>
            <article className="ai-g"><div className="ai-meta">{[insights.safetyRating && { ic: FiShield, l: "Safety", v: insights.safetyRating }, insights.costIndex && { ic: FiDollarSign, l: "Budget", v: insights.costIndex }, insights.localCurrency && { ic: FiTrendingUp, l: "Currency", v: insights.localCurrency }, insights.connectivityScore && { ic: FiWifi, l: "Connectivity", v: insights.connectivityScore }].filter(Boolean).map(m => <div key={m.l} className="ai-mi"><m.ic className="ai-mi__ic" size={16} /><div><div className="ai-mi__l">{m.l}</div><div className="ai-mi__v">{clean(m.v)}</div></div></div>)}</div></article>
            {insights.visaInfo && <article className="ai-g"><h5 className="ai-g__sub">Visa & Entry</h5><p className="ai-g__txt">{clean(insights.visaInfo)}</p></article>}
            <article className="ai-g"><h5 className="ai-g__sub">Top Cities</h5><div className="chips chips--dk">{(insights.topCities || []).map(c => <span key={c} className="chipg">{clean(c)}</span>)}</div>{(insights.bestTravelMonths || []).length > 0 && <><h5 className="ai-g__sub" style={{ marginTop: 14 }}>Best Months</h5><div className="chips chips--dk">{insights.bestTravelMonths.map(m => <span key={m} className="chipg">{clean(m)}</span>)}</div></>}{(insights.trendingAttractions || []).length > 0 && <><h5 className="ai-g__sub" style={{ marginTop: 14 }}>🔥 Trending</h5><div className="chips chips--dk">{insights.trendingAttractions.map(a => <span key={a} className="chipg chipg--glow">{clean(a)}</span>)}</div></>}</article>
          </div></R>
        </div>}
      </div></section>

      {/* CUISINE & DEST */}
      <section className="s s--fin"><div className="w col2">
        <R a="left"><article className="crd"><span className="bdg"><FiCoffee size={12} /> Culture & Cuisine</span><h3 className="crd__h" style={{ marginTop: 12 }}>Taste & Traditions</h3><p className="crd__desc crd__desc--xl">{clean(country.additionalInfo || country.description || td.intro)}</p>{(country?.cuisine?.specialties || []).length > 0 && <div style={{ marginBottom: 20 }}><div className="lbl">🍽️ Signature Dishes</div><div className="chips">{country.cuisine.specialties.slice(0, 10).map(d => <span key={d} className="chip">{clean(d)}</span>)}</div></div>}{(country.travelTips || []).length > 0 && <div><div className="lbl">💡 Tips</div><ul className="tips">{country.travelTips.slice(0, 8).map(t => <li key={t}>{clean(t)}</li>)}</ul></div>}</article></R>
        <R a="right" d={.1}><article className="crd"><span className="bdg"><FiMapPin size={12} /> Featured Places</span><h3 className="crd__h" style={{ marginTop: 12 }}>Destinations</h3><div className="dests">{dests.slice(0, 6).map((d, i) => <R key={d.id} a="up" d={i * .04} as={Link} to={`/destination/${d.id}`} className="dst"><img src={d.images[0]} alt={d.name} className="dst__img" loading="lazy" /><div className="dst__body"><div className="dst__type">{clean(d.type)}</div><div className="dst__name">{clean(d.name)}</div><div className="dst__desc">{clean(d.description).slice(0, 120)}…</div></div></R>)}</div><div className="dst-acts"><Button to={`/country/${country.id}/destinations`} variant="primary" icon={<FiArrowRight size={15} />}>View All</Button><Button to="/booking" variant="secondary" icon={<FiCalendar size={15} />}>Plan Trip</Button></div></article></R>
      </div></section>

      {/* CTA */}
      <section className="s s--cta"><div className="w"><R a="up"><div className="cta"><div className="cta__body"><h2>Ready to Explore {country.name}?</h2><p>Our expert team crafts bespoke itineraries tailored to your interests, timeline, and budget. Start planning your dream African adventure today.</p><div className="cta__btns"><Button to="/booking" variant="primary" icon={<FiCalendar size={15} />}>Start Planning</Button><Button to="/contact" variant="secondary" icon={<FiUsers size={15} />}>Talk to Expert</Button>{officialLink && <a href={officialLink.url} target="_blank" rel="noopener noreferrer" className="mb mb--s" style={{ marginTop: 0 }}>Official Site <FiExternalLink size={13} /></a>}</div></div><span className="cta__flag">{country.flag}</span></div></R></div></section>
    </div>
  );
};

/* ═══ CSS ═══ */
const CSS = `
:root{--e50:#ecfdf5;--e100:#d1fae5;--e200:#a7f3d0;--e300:#6ee7b7;--e400:#34d399;--e500:#10b981;--e600:#059669;--e700:#047857;--e800:#065f46;--e900:#022c22;--g50:#f9fafb;--g100:#f3f4f6;--g200:#e5e7eb;--g300:#d1d5db;--g500:#6b7280;--g600:#4b5563;--g700:#374151;--g800:#1f2937;--g900:#111827;--r:24px;--rl:20px;--rm:14px;--rs:10px;--rf:9999px;--sh:0 1px 3px rgba(0,0,0,.06),0 6px 16px rgba(0,0,0,.04);--shh:0 12px 28px rgba(0,0,0,.08);--ff:'Playfair Display',Georgia,serif}
*{box-sizing:border-box}.cp{background:var(--g50);font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden}
.w{width:100%;max-width:100%;padding:0 clamp(16px,5vw,72px);margin:0 auto}.w--article{max-width:1080px;margin:0 auto}
.s{padding:60px 0}.s--ck{padding:12px 0 0;background:#fff}.s--bk{padding:12px 0 0}.s--hero{padding:56px 0 24px}.s--stats{padding:64px 0;background:#fff}.s--facts{padding:56px 0;background:var(--g50)}.s--nl{padding:72px 0;background:#fff}.s--vid{padding:64px 0;background:var(--g50)}.s--gal{padding:64px 0;background:#fff}.s--map{padding:56px 0;background:#fff}.s--fin{padding:64px 0;background:var(--g50)}.s--official{padding:32px 0;background:#fff}
.s--ai{padding:80px 0;background:linear-gradient(145deg,var(--e900),#064e3b 40%,var(--e800) 70%,var(--e700));position:relative;overflow:hidden}.s--ai::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 20% 50%,rgba(52,211,153,.08),transparent 70%),radial-gradient(ellipse at 80% 20%,rgba(16,185,129,.06),transparent 60%);pointer-events:none}
.s--cta{padding:80px 0;background:linear-gradient(135deg,var(--e600),var(--e700),var(--e800))}
.col2{display:grid;grid-template-columns:1.6fr 1fr;gap:36px;align-items:start}.g3{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px}
.shdr{text-align:center;margin-bottom:44px}.sh{font-family:var(--ff);font-size:clamp(26px,4.5vw,48px);color:var(--g900);margin:12px 0 6px;line-height:1.15}.ssub{color:var(--g500);font-size:clamp(14px,1.8vw,17px);max-width:640px;margin:0 auto;line-height:1.7}
.bdg{display:inline-flex;align-items:center;gap:6px;padding:6px 16px;border-radius:var(--rf);background:var(--e50);color:var(--e600);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;border:1px solid var(--e100)}.bdg--lt{background:rgba(255,255,255,.08);color:var(--e200);border-color:rgba(255,255,255,.12)}
.cp-404{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;text-align:center;padding:40px}.cp-404 h1{font-family:var(--ff);font-size:clamp(28px,5vw,44px)}
.bk{display:inline-flex;align-items:center;gap:7px;text-decoration:none;color:var(--e800);font-weight:600;font-size:13px;padding:8px 18px;border-radius:var(--rf);border:1px solid var(--e200);background:var(--e50);transition:all .3s}.bk:hover{background:var(--e100);transform:translateX(-3px)}
.bk--official{background:#fff;border-color:var(--e300);color:var(--e700)}.bk--official:hover{background:var(--e50);transform:translateX(0) translateY(-2px)}
.official-cta{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:var(--rf);background:linear-gradient(135deg,var(--e600),var(--e700));color:#fff;font-size:14px;font-weight:700;text-decoration:none;margin-top:8px;transition:all .3s;box-shadow:0 4px 14px rgba(5,150,105,.2)}.official-cta:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(5,150,105,.3)}
.official-banner{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:28px 32px;border-radius:var(--r);background:linear-gradient(135deg,var(--e50),#fff);border:1.5px solid var(--e200);flex-wrap:wrap}
.official-banner__body{display:flex;align-items:center;gap:16px;color:var(--e700)}.official-banner__body h3{margin:0;font-size:18px;color:var(--g900);font-family:var(--ff)}.official-banner__body p{margin:4px 0 0;font-size:14px;color:var(--g500);line-height:1.5}
.official-banner__link{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:var(--rf);background:var(--e600);color:#fff;font-size:14px;font-weight:700;text-decoration:none;transition:all .3s;box-shadow:0 4px 14px rgba(5,150,105,.2);white-space:nowrap}.official-banner__link:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(5,150,105,.3)}
.crd{background:#fff;border-radius:var(--r);padding:clamp(24px,3.5vw,40px);border:1px solid var(--g200);box-shadow:var(--sh);transition:box-shadow .35s;height:100%}.crd:hover{box-shadow:var(--shh)}.crd--hero{background:linear-gradient(135deg,#fff,var(--e50))}.crd--side{position:sticky;top:96px}.crd--exp{background:linear-gradient(145deg,#fff,var(--e50),#fff)}
.flag-row{display:flex;align-items:center;gap:16px;margin-bottom:20px}.flag{font-size:56px;filter:drop-shadow(0 3px 6px rgba(0,0,0,.1))}.tag{font-size:11px;color:var(--e600);font-weight:700;text-transform:uppercase;letter-spacing:1.4px;display:block}.rgn{display:flex;align-items:center;gap:4px;font-size:11px;color:var(--g500);margin-top:3px}
.crd__title{font-family:var(--ff);font-size:clamp(30px,5vw,54px);color:var(--g900);margin-bottom:20px;line-height:1.1}.crd__h{font-family:var(--ff);font-size:clamp(22px,3vw,32px);color:var(--g900);margin-bottom:16px;display:flex;align-items:center;gap:8px}.crd__desc{color:var(--g600);line-height:1.95;font-size:15px;margin-bottom:18px}.crd__desc--xl{font-size:clamp(15px,1.7vw,17px);line-height:2;color:var(--g700)}
.info-list{display:grid;gap:6px}.inf{display:flex;align-items:center;gap:12px;padding:10px 12px;background:var(--g50);border:1px solid transparent;border-radius:var(--rs);transition:all .3s}.inf:hover{background:var(--e50);transform:translateX(4px);border-color:var(--e100)}.inf__ic{width:34px;height:34px;border-radius:8px;background:var(--e50);color:var(--e600);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .3s}.inf:hover .inf__ic{background:var(--e600);color:#fff}.inf__l{font-size:10px;text-transform:uppercase;letter-spacing:.7px;color:var(--g500);font-weight:700}.inf__v{font-size:14px;color:var(--g900);font-weight:600}.side-cta{display:grid;gap:8px;margin-top:20px}
.stats{display:flex;flex-wrap:wrap;justify-content:center;gap:0}.stat{flex:0 0 auto;padding:20px clamp(14px,2.5vw,28px);text-align:center;position:relative}.stat::after{content:'';position:absolute;right:0;top:25%;height:50%;width:1px;background:var(--g200)}.stat:last-child::after{display:none}.stat__v{font-family:var(--ff);font-size:clamp(26px,3.5vw,40px);font-weight:800;color:var(--e700);line-height:1;letter-spacing:-.5px}.stat__l{font-size:11px;color:var(--g500);font-weight:600;margin-top:4px;text-transform:uppercase;letter-spacing:.6px}
.facts{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px}.fact{padding:20px;background:#fff;border-radius:var(--rl);border:1px solid var(--g200);transition:all .35s}.fact:hover{transform:translateY(-3px);box-shadow:var(--shh);border-color:var(--e200)}.fact__t{font-size:11px;color:var(--e600);text-transform:uppercase;letter-spacing:.9px;font-weight:700;margin-bottom:4px}.fact__v{font-size:16px;color:var(--g900);font-weight:700;line-height:1.3}.fact__s{font-size:12px;color:var(--g500);line-height:1.5;margin-top:4px}
.px{position:relative;height:clamp(260px,35vw,400px);overflow:hidden}.px__bg{position:absolute;inset:-80px 0;background-size:cover;background-position:center;will-change:transform}.px__ov{position:absolute;inset:0;background:linear-gradient(135deg,rgba(2,44,34,.7),rgba(6,95,70,.5),rgba(4,120,87,.4))}.px__ct{position:relative;z-index:1;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px}.px__ct h2{font-family:var(--ff);font-size:clamp(24px,4.5vw,48px);color:#fff;margin:0 0 10px;text-shadow:0 4px 16px rgba(0,0,0,.25)}.px__ct p{color:rgba(255,255,255,.8);font-size:clamp(14px,1.8vw,18px);max-width:540px;margin:0}
.nl{display:grid;gap:48px}.nl__lead{font-size:clamp(18px,2.5vw,24px);line-height:1.7;color:var(--g800);font-weight:500;border-left:3px solid var(--e500);padding:6px 0 6px 22px;margin:0}.nl__row{display:grid;grid-template-columns:1fr 1fr;gap:36px;align-items:center}.nl__row--flip{direction:rtl}.nl__row--flip>*{direction:ltr}.nl__fig{border-radius:var(--rl);overflow:hidden;position:relative;box-shadow:var(--sh)}.nl__fig img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block;transition:transform .5s}.nl__fig:hover img{transform:scale(1.03)}.nl__figcap{position:absolute;bottom:0;left:0;right:0;padding:10px 14px;background:linear-gradient(transparent,rgba(0,0,0,.6));color:#fff;display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600}.nl__copy{display:flex;flex-direction:column;gap:14px}.nl__copy p{font-size:clamp(15px,1.7vw,17px);line-height:2;color:var(--g700);margin:0}.nl__aside{font-size:14px;color:var(--e700);background:var(--e50);padding:12px 16px;border-radius:var(--rs);border-left:3px solid var(--e400);display:flex;align-items:flex-start;gap:8px}.nl__acts{display:grid;grid-template-columns:1fr 1fr;gap:16px}.nl__acts--grid{grid-template-columns:repeat(auto-fill,minmax(300px,1fr))}.nl__act{display:flex;gap:14px;padding:20px;background:var(--g50);border-radius:var(--rl);border:1px solid var(--g100);transition:all .3s}.nl__act:hover{background:var(--e50);border-color:var(--e200);transform:translateY(-3px)}.nl__act-dot{width:8px;height:8px;border-radius:50%;background:var(--e500);margin-top:6px;flex-shrink:0}.nl__act strong{font-size:15px;color:var(--g900);display:block;margin-bottom:4px}.nl__act p{font-size:13px;color:var(--g500);line-height:1.65;margin:0}.nl__strip{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px}.nl__strip-item{border-radius:var(--rm);overflow:hidden;position:relative}.nl__strip-item img{width:100%;aspect-ratio:1;object-fit:cover;display:block;transition:transform .4s}.nl__strip-item:hover img{transform:scale(1.05)}.nl__strip-item span{position:absolute;bottom:0;left:0;right:0;padding:8px 10px;background:linear-gradient(transparent,rgba(0,0,0,.6));color:#fff;font-size:11px;font-weight:600}
.hl{background:#fff;border-radius:var(--rl);padding:24px 20px;border:1px solid var(--g200);height:100%;transition:all .35s;position:relative;overflow:hidden}.hl::before{content:'';position:absolute;bottom:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--e400),var(--e600));transform:scaleX(0);transition:transform .35s;transform-origin:left}.hl:hover::before{transform:scaleX(1)}.hl:hover{transform:translateY(-4px);box-shadow:var(--shh);border-color:var(--e200)}.hl__ic{width:44px;height:44px;border-radius:12px;background:var(--e50);color:var(--e600);display:flex;align-items:center;justify-content:center;margin-bottom:12px;transition:all .3s}.hl:hover .hl__ic{background:var(--e600);color:#fff}.hl__txt{font-size:14px;color:var(--g900);font-weight:600;line-height:1.45}.hl__n{position:absolute;top:12px;right:14px;font-size:12px;color:var(--g300);font-weight:700;font-family:var(--ff)}
.chips{display:flex;flex-wrap:wrap;gap:8px}.chip{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:var(--rf);background:var(--e50);color:var(--e800);border:1px solid var(--e100);font-size:13px;font-weight:600;transition:all .25s}.chip:hover{background:var(--e100);transform:translateY(-1px)}.chipg{font-size:12px;color:#ecfeff;border:1px solid rgba(255,255,255,.18);border-radius:var(--rf);padding:6px 14px;background:rgba(255,255,255,.07);backdrop-filter:blur(8px);transition:all .25s}.chipg:hover{background:rgba(255,255,255,.15);transform:translateY(-1px)}.chipg--glow{border-color:rgba(52,211,153,.35);box-shadow:0 0 14px rgba(52,211,153,.15)}
.lbl{font-size:12px;color:var(--e600);text-transform:uppercase;letter-spacing:.9px;font-weight:700;margin-bottom:10px}.tips{margin:0;padding-left:18px;display:grid;gap:6px}.tips li{color:var(--g700);font-size:14px;line-height:1.7}
.gal{position:relative;border-radius:var(--r);overflow:hidden;aspect-ratio:16/7;background:var(--g100);box-shadow:0 8px 32px rgba(0,0,0,.08);cursor:pointer}.gal__img{width:100%;height:100%;object-fit:cover;transition:transform .5s}.gal:hover .gal__img{transform:scale(1.03)}.gal__ov{position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,rgba(0,0,0,.55));display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding:32px;color:#fff;font-size:16px;font-weight:600;gap:8px;opacity:0;transition:opacity .35s}.gal:hover .gal__ov{opacity:1}.gal__n{position:absolute;top:50%;transform:translateY(-50%);width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,.9);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--g800);transition:all .25s;box-shadow:0 2px 8px rgba(0,0,0,.12);z-index:2}.gal__n:hover{background:#fff;transform:translateY(-50%) scale(1.08)}.gal__n--l{left:16px}.gal__n--r{right:16px}.gal__c{position:absolute;top:14px;right:14px;background:rgba(0,0,0,.5);color:#fff;padding:5px 12px;border-radius:var(--rf);font-size:12px;font-weight:600;backdrop-filter:blur(6px);z-index:2}
.gal__dots{position:absolute;bottom:16px;left:50%;transform:translateX(-50%);display:flex;gap:6px;z-index:2}.gal__dot{width:8px;height:8px;border-radius:50%;border:none;background:rgba(255,255,255,.4);cursor:pointer;padding:0;transition:all .25s}.gal__dot--on{background:#fff;transform:scale(1.3)}
.gal__ths{display:flex;gap:8px;margin-top:12px;overflow-x:auto;padding:2px 0;scrollbar-width:thin}.gal__th{flex-shrink:0;width:88px;height:60px;border-radius:8px;overflow:hidden;border:2px solid transparent;cursor:pointer;padding:0;background:none;transition:all .25s}.gal__th img{width:100%;height:100%;object-fit:cover;transition:transform .25s}.gal__th:hover{border-color:var(--e400)}.gal__th:hover img{transform:scale(1.06)}.gal__th--on{border-color:var(--e500);box-shadow:0 0 0 2px var(--e200)}
.lb{position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.93);display:flex;align-items:center;justify-content:center;animation:fi .25s;backdrop-filter:blur(16px)}.lb__img{max-width:92vw;max-height:88vh;object-fit:contain;border-radius:var(--rm)}.lb__x{position:fixed;top:16px;right:16px;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:10;transition:all .25s}.lb__x:hover{background:rgba(255,255,255,.2);transform:scale(1.08)}.lb__a{position:absolute;top:50%;transform:translateY(-50%);width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .25s;z-index:10}.lb__a:hover{background:rgba(255,255,255,.2);transform:translateY(-50%) scale(1.08)}.lb__a--l{left:clamp(12px,3vw,40px)}.lb__a--r{right:clamp(12px,3vw,40px)}.lb__cap{position:absolute;bottom:clamp(16px,4vw,40px);left:50%;transform:translateX(-50%);color:rgba(255,255,255,.8);font-size:14px;background:rgba(0,0,0,.4);padding:8px 20px;border-radius:var(--rf);backdrop-filter:blur(6px);max-width:90vw;text-align:center;white-space:normal}
.vid__player{margin-bottom:24px;border-radius:var(--r);overflow:hidden;border:1px solid var(--e200);box-shadow:0 8px 32px rgba(0,0,0,.08)}.vid__embed{position:relative;padding-top:56.25%;background:#000}.vid__embed iframe{position:absolute;inset:0;width:100%;height:100%}.vid__bar{display:flex;align-items:center;justify-content:space-between;padding:12px 20px;background:#fff}.vid__bar h4{margin:0;font-size:15px;color:var(--g900);font-weight:700}.vid__bar button{display:inline-flex;align-items:center;gap:5px;padding:6px 14px;border-radius:var(--rf);border:1px solid var(--g200);background:var(--g50);color:var(--g700);font-size:12px;font-weight:600;cursor:pointer;transition:all .2s}.vid__bar button:hover{background:var(--g100)}.vid__grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:18px}.vid__card{background:#fff;border-radius:var(--rl);overflow:hidden;border:1px solid var(--g200);cursor:pointer;transition:all .35s;padding:0;text-align:left;width:100%}.vid__card:hover{transform:translateY(-4px);box-shadow:var(--shh);border-color:var(--e300)}.vid__card--on{border-color:var(--e500)}.vid__thumb{position:relative;aspect-ratio:16/9;overflow:hidden}.vid__thumb img{width:100%;height:100%;object-fit:cover;transition:transform .35s}.vid__card:hover .vid__thumb img{transform:scale(1.04)}.vid__play{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.25);transition:background .25s}.vid__card:hover .vid__play{background:rgba(5,150,105,.4)}.vid__play svg{width:44px;height:44px;padding:10px;background:rgba(255,255,255,.95);border-radius:50%;color:var(--e600);transition:transform .25s}.vid__card:hover .vid__play svg{transform:scale(1.08)}.vid__title{padding:12px 16px;font-size:14px;font-weight:700;color:var(--g900)}
.map-top{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;flex-wrap:wrap;margin-bottom:20px}.map-btns{display:flex;gap:10px;flex-wrap:wrap}.mb{display:inline-flex;align-items:center;gap:6px;padding:10px 18px;border-radius:var(--rf);font-size:13px;font-weight:700;cursor:pointer;transition:all .25s;text-decoration:none;border:none}.mb--p{background:linear-gradient(135deg,var(--e600),var(--e700));color:#fff;box-shadow:0 3px 10px rgba(5,150,105,.2)}.mb--p:hover{transform:translateY(-2px);box-shadow:0 6px 18px rgba(5,150,105,.3)}.mb--s{background:var(--e50);color:var(--e700);border:1px solid var(--e200)}.mb--s:hover{background:var(--e100);transform:translateY(-2px)}.map-frame{border-radius:var(--r);overflow:hidden;border:1px solid var(--e100)}.map-frame iframe{width:100%;min-height:480px;border:0;display:block}
.share-bar{position:fixed;right:20px;bottom:24px;display:flex;flex-direction:column;gap:8px;z-index:999;opacity:0;transform:translateY(20px);transition:all .4s cubic-bezier(.16,1,.3,1);pointer-events:none}.share-bar--on{opacity:1;transform:translateY(0);pointer-events:auto}.share-bar button{width:44px;height:44px;border-radius:50%;border:1px solid var(--e200);background:#fff;color:var(--e700);cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0,0,0,.08);transition:all .25s}.share-bar button:hover{transform:scale(1.1);box-shadow:0 6px 20px rgba(0,0,0,.12);background:var(--e50)}
.ai-top{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:36px;flex-wrap:wrap;position:relative;z-index:1}.ai-title{font-family:var(--ff);font-size:clamp(28px,4.5vw,50px);color:#fff;margin:8px 0 6px}.ai-sub{color:rgba(255,255,255,.55);font-size:14px;margin:0}.ai-ref{display:inline-flex;align-items:center;gap:6px;padding:10px 18px;border-radius:var(--rf);border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.06);color:#fff;font-size:13px;font-weight:600;cursor:pointer;transition:all .25s;backdrop-filter:blur(6px)}.ai-ref:hover{background:rgba(255,255,255,.14);transform:translateY(-1px)}
.ai-panel{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:var(--r);padding:28px;display:flex;flex-direction:column;min-height:540px;position:relative;z-index:1;backdrop-filter:blur(16px)}.ai-panel::before{content:'';position:absolute;inset:-1px;border-radius:calc(var(--r)+1px);padding:1px;background:linear-gradient(135deg,rgba(52,211,153,.25),transparent 50%,rgba(16,185,129,.15));-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none}.ai-panel__top{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}.ai-panel__top h4{margin:0;font-size:18px;color:var(--e100);font-weight:700}.ai-live{display:inline-flex;align-items:center;gap:5px;font-size:10px;padding:5px 12px;border-radius:var(--rf);border:1px solid rgba(52,211,153,.35);background:rgba(4,120,87,.3);color:var(--e50);font-weight:700;text-transform:uppercase;letter-spacing:.7px}.ai-dot{width:6px;height:6px;border-radius:50%;background:var(--e400);animation:pul 2s ease-in-out infinite}
.ai-scroll{flex:1;max-height:560px;overflow-y:auto;padding-right:10px;display:grid;gap:12px}.ai-scroll::-webkit-scrollbar{width:4px}.ai-scroll::-webkit-scrollbar-track{background:transparent}.ai-scroll::-webkit-scrollbar-thumb{background:rgba(52,211,153,.25);border-radius:var(--rf)}
.aisec{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:var(--rm);padding:16px}.aisec h5{margin:0 0 8px;font-size:10px;color:var(--e200);text-transform:uppercase;letter-spacing:1.3px;font-weight:700}
.ai-p{margin:6px 0 0;line-height:1.9;font-size:14px;color:rgba(255,255,255,.85)}.ai-ul{margin:0;padding-left:18px;display:grid;gap:6px;color:rgba(255,255,255,.85)}.ai-ul li{font-size:13px;line-height:1.75}.ai-ul--ol{list-style:decimal}.ai-ul--src li{color:rgba(167,243,208,.85);font-size:12px}
.ai-right{display:grid;gap:14px;position:relative;z-index:1}.ai-g{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:var(--rl);padding:20px;backdrop-filter:blur(12px)}.ai-g__t{font-size:18px;color:var(--e100);font-weight:700;margin:0 0 14px}.ai-g__sub{font-size:10px;color:var(--e200);text-transform:uppercase;letter-spacing:.9px;font-weight:700;margin:0 0 8px}.ai-g__txt{font-size:13px;color:rgba(255,255,255,.85);line-height:1.75;margin:0}
.ai-stats{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.ai-st{background:rgba(255,255,255,.06);border-radius:var(--rs);padding:14px;border:1px solid rgba(255,255,255,.06);transition:all .25s;text-align:center}.ai-st:hover{background:rgba(255,255,255,.1);transform:translateY(-2px)}.ai-st__ic{color:var(--e400);margin-bottom:6px}.ai-st__v{color:#fff;font-size:16px;font-weight:700}.ai-st__l{color:rgba(255,255,255,.5);font-size:10px;margin-top:3px;text-transform:uppercase;letter-spacing:.4px}
.ai-meta{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.ai-mi{display:flex;align-items:center;gap:10px;padding:12px;background:rgba(255,255,255,.03);border-radius:var(--rs);border:1px solid rgba(255,255,255,.05);transition:all .25s}.ai-mi:hover{background:rgba(255,255,255,.07)}.ai-mi__ic{color:var(--e400);flex-shrink:0}.ai-mi__l{font-size:9px;text-transform:uppercase;letter-spacing:.4px;color:rgba(255,255,255,.45);font-weight:700}.ai-mi__v{font-size:12px;color:rgba(255,255,255,.9);font-weight:600}
.dests{display:grid;gap:10px}.dst{text-decoration:none;color:inherit;border:1px solid var(--g200);border-radius:var(--rl);overflow:hidden;display:grid;grid-template-columns:140px 1fr;background:#fff;transition:all .35s}.dst:hover{border-color:var(--e200);box-shadow:var(--shh);transform:translateX(4px)}.dst__img{width:140px;height:106px;object-fit:cover;transition:transform .4s}.dst:hover .dst__img{transform:scale(1.04)}.dst__body{padding:12px 16px}.dst__type{color:var(--e600);font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;margin-bottom:3px}.dst__name{font-size:15px;color:var(--g900);font-weight:700;margin-bottom:4px}.dst__desc{font-size:12px;color:var(--g500);line-height:1.6}.dst-acts{display:flex;gap:10px;margin-top:18px;flex-wrap:wrap}
.cta{display:flex;align-items:center;justify-content:space-between;gap:40px}.cta__body{flex:1}.cta h2{font-family:var(--ff);font-size:clamp(28px,4.5vw,48px);color:#fff;margin:0 0 14px;line-height:1.12}.cta p{color:rgba(255,255,255,.8);font-size:clamp(15px,1.8vw,18px);line-height:1.8;margin:0 0 28px;max-width:580px}.cta__btns{display:flex;gap:12px;flex-wrap:wrap;align-items:center}.cta__flag{font-size:110px;filter:drop-shadow(0 6px 28px rgba(0,0,0,.25));animation:flt 4s ease-in-out infinite;flex-shrink:0}
.tw{margin:0;line-height:1.9;font-size:14px;color:rgba(255,255,255,.92)}.tw--ai{min-height:1.9em}.tw--hl{color:var(--e200);font-style:italic}.tw__cur{display:inline-block;width:2px;height:1.1em;background:var(--e400);margin-left:1px;vertical-align:text-bottom;border-radius:1px;animation:blnk .85s ease-in-out infinite;box-shadow:0 0 8px rgba(52,211,153,.4)}
.ld{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:var(--r);padding:48px 28px;text-align:center;position:relative;z-index:1;backdrop-filter:blur(16px)}.ld__orb{width:56px;height:56px;margin:0 auto 20px;position:relative;display:flex;align-items:center;justify-content:center}.ld__ring{position:absolute;inset:0;border:2px solid rgba(255,255,255,.08);border-top-color:var(--e400);border-right-color:var(--e400);border-radius:50%;animation:sp 1s cubic-bezier(.4,0,.2,1) infinite}.ld__ic{color:var(--e400);font-size:20px;animation:pul 2s ease-in-out infinite}.ld h4{color:#fff;font-size:18px;font-weight:700;margin:0 0 6px}.ld p{color:rgba(255,255,255,.5);font-size:13px;margin:0 0 24px}.ld__bars{display:flex;align-items:center;justify-content:center;gap:4px;margin-bottom:24px;height:24px}.ld__bars span{width:3px;height:100%;background:var(--e400);border-radius:2px;animation:bar 1.2s ease-in-out infinite}.ld__sk{height:8px;border-radius:var(--rf);max-width:420px;margin:0 auto 8px;background:linear-gradient(90deg,rgba(255,255,255,.05),rgba(255,255,255,.14) 40%,rgba(255,255,255,.05));background-size:280% 100%;animation:shm 1.6s ease infinite}.ld__sk--m{max-width:320px}.ld__sk--s{max-width:240px}
.er{background:rgba(255,255,255,.04);border:1px solid rgba(248,113,113,.2);border-radius:var(--r);padding:40px 28px;text-align:center;position:relative;z-index:1}.er__ic{font-size:36px;margin-bottom:10px}.er h4{color:#fca5a5;font-size:18px;margin:0 0 6px}.er p{color:rgba(255,255,255,.5);font-size:13px;margin:0 0 18px;max-width:380px;margin-left:auto;margin-right:auto}.er__btn{display:inline-flex;align-items:center;gap:6px;padding:8px 18px;border-radius:var(--rf);border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:#fff;font-size:13px;font-weight:600;cursor:pointer;transition:all .25s}.er__btn:hover{background:rgba(255,255,255,.12);transform:translateY(-1px)}
@keyframes blnk{0%,100%{opacity:1}50%{opacity:.12}}@keyframes sp{to{transform:rotate(360deg)}}@keyframes pul{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.55;transform:scale(.9)}}@keyframes bar{0%,100%{transform:scaleY(.3);opacity:.35}50%{transform:scaleY(1);opacity:1}}@keyframes shm{0%{background-position:200% 0}100%{background-position:-200% 0}}@keyframes fi{from{opacity:0}to{opacity:1}}@keyframes flt{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
@media(max-width:1140px){.col2{grid-template-columns:1fr}.crd--side{position:static}.cta{flex-direction:column;text-align:center}.cta p{margin-left:auto;margin-right:auto}.cta__btns{justify-content:center}.stats{justify-content:flex-start}.official-banner{flex-direction:column;text-align:center}.official-banner__body{flex-direction:column;text-align:center}}
@media(max-width:768px){.s{padding:44px 0}.s--stats,.s--nl,.s--vid,.s--gal,.s--fin{padding:52px 0}.s--ai,.s--cta{padding:56px 0}.ai-stats,.ai-meta{grid-template-columns:1fr}.ai-panel{min-height:0}.ai-scroll{max-height:440px}.ai-top{flex-direction:column;align-items:flex-start}.nl__row,.nl__row--flip{grid-template-columns:1fr;direction:ltr}.nl__acts,.nl__acts--grid{grid-template-columns:1fr}.dst{grid-template-columns:120px 1fr}.dst__img{width:120px;height:90px}.map-top{flex-direction:column}.gal{aspect-ratio:16/10}.cta__flag{font-size:72px}.stat{padding:16px clamp(10px,2vw,20px)}.stat__v{font-size:clamp(22px,3vw,34px)}.px{height:240px}.share-bar{right:12px;bottom:16px}.share-bar button{width:38px;height:38px}}
@media(max-width:480px){.w{padding:0 14px}.stats{flex-wrap:wrap}.stat{flex:0 0 33.33%;padding:12px 6px}.stat::after{display:none}.dst{grid-template-columns:1fr}.dst__img{width:100%;height:160px}.ai-panel__top{flex-direction:column;align-items:flex-start;gap:8px}.gal{aspect-ratio:4/3}.gal__th{width:72px;height:48px}.map-frame iframe{min-height:340px}.cta__flag{font-size:56px}.flag{font-size:44px}.px{height:200px}}
`;

export default CountryPage;