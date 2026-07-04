// src/pages/CountryPage.jsx
import React, {
  useState, useEffect, useRef, useCallback, useMemo,
  createContext, useContext,
} from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  FiArrowRight, FiArrowLeft, FiMapPin, FiCompass, FiClock,
  FiGlobe, FiCalendar, FiChevronLeft,
  FiChevronRight, FiShield, FiPhone, FiMail, FiBookOpen,
  FiSun, FiRefreshCw, FiWifiOff, FiInfo, FiAlertTriangle,
  FiFlag, FiTrendingUp, FiDroplet, FiCoffee,
  FiHeart, FiZap, FiCamera, FiChevronDown,
  FiChevronUp, FiPlus, FiMinus, FiX, FiExternalLink,
  FiGrid, FiLayers, FiMessageCircle, FiSend, FiUsers,
  FiHome,
} from "react-icons/fi";
import SEO from "@components/common/SEO";
import AnimatedSection from "@components/common/AnimatedSection";
import Loader from "@components/common/Loader";
import PageHeader from "@components/common/PageHeader";
import DestinationCard, {
  DestinationCardSkeleton,
} from "@components/common/DestinationCard";
import { useCountry, useCountryDestinations } from "../../hooks/useCountries";
import { getCountrySlug } from "../../utils/countrySlugMap";

const PAGE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

:root{
  --cp-green:#059669;--cp-green-lt:#10b981;--cp-green-dk:#047857;
  --cp-forest:#022c22;--cp-mint:#ecfdf5;
  --cp-text:#0f172a;--cp-text2:#475569;--cp-text3:#94a3b8;
  --cp-border:#e2e8f0;--cp-surface:#ffffff;--cp-bg:#f8fafb;
  --cp-radius:20px;--cp-ease:cubic-bezier(.22,1,.36,1);
}

@keyframes cpFadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
@keyframes cpFadeIn{from{opacity:0}to{opacity:1}}
@keyframes cpKenBurns{0%{transform:scale(1)}100%{transform:scale(1.1)}}
@keyframes cpProgress{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes cpShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

*,*::before,*::after{box-sizing:border-box}

.cp-page{
  background:var(--cp-bg);min-height:100vh;
  font-family:'Plus Jakarta Sans',system-ui,sans-serif;
  -webkit-font-smoothing:antialiased;
}

/* scroll progress */
.cpScrollProg{position:fixed;top:0;left:0;right:0;height:2px;z-index:9999}
.cpScrollProg__bar{height:100%;background:var(--cp-green-lt);transition:width 80ms linear}

/* ═══════════ HERO ═══════════ */
.cpHero{
  position:relative;overflow:hidden;background:var(--cp-forest);
  height:100vh;height:100dvh;min-height:560px;max-height:960px;
}
.cpHero__slide{
  position:absolute;inset:0;opacity:0;
  transition:opacity 1.6s ease;will-change:opacity;
}
.cpHero__slide--on{opacity:1;z-index:1}
.cpHero__slide img{width:100%;height:100%;object-fit:cover}
.cpHero__slide--on img{animation:cpKenBurns 14s ease-out forwards}
.cpHero__noImg{
  position:absolute;inset:0;
  background:linear-gradient(155deg,#0f172a,#064e3b);
  display:flex;align-items:center;justify-content:center;
}
.cpHero__ov1{
  position:absolute;inset:0;z-index:2;pointer-events:none;
  background:linear-gradient(180deg,rgba(0,0,0,.22) 0%,transparent 30%,transparent 45%,rgba(0,0,0,.75) 100%);
}
.cpHero__ov2{
  position:absolute;inset:0;z-index:2;pointer-events:none;
  background:radial-gradient(ellipse 70% 60% at 50% 100%,rgba(2,44,34,.4) 0%,transparent 68%);
}

/* breadcrumb */
.cpHero__nav{position:absolute;top:0;left:0;right:0;z-index:10;padding:22px clamp(20px,5vw,60px)}
.cpCrumb{display:flex;align-items:center;list-style:none;margin:0;padding:0}
.cpCrumb a{color:rgba(255,255,255,.48);font-size:13px;font-weight:500;text-decoration:none;transition:color .2s}
.cpCrumb a:hover{color:rgba(255,255,255,.9)}
.cpCrumb__sep{color:rgba(255,255,255,.2);font-size:12px;margin:0 10px}
.cpCrumb__cur{color:rgba(255,255,255,.82);font-size:13px;font-weight:600}

/* hero content */
.cpHero__body{
  position:absolute;inset:0;z-index:5;
  display:flex;flex-direction:column;
  align-items:center;justify-content:center;text-align:center;
  padding:80px clamp(20px,6vw,80px) 72px;
}
.cpHero__meta{
  display:flex;align-items:center;gap:16px;flex-wrap:wrap;
  justify-content:center;margin-bottom:22px;
  opacity:0;animation:cpFadeUp .8s var(--cp-ease) .1s forwards;
}
.cpHero__metaItem{
  display:flex;align-items:center;gap:6px;
  color:rgba(255,255,255,.55);font-size:13px;font-weight:500;
}
.cpHero__metaItem svg{opacity:.7}
.cpHero__metaDiv{width:1px;height:14px;background:rgba(255,255,255,.14)}
.cpHero__flagImg{width:22px;height:15px;border-radius:3px;object-fit:cover;border:1px solid rgba(255,255,255,.15)}
.cpHero__title{
  font-family:'DM Serif Display',Georgia,serif;
  font-size:clamp(50px,9.5vw,116px);font-weight:400;
  line-height:.96;color:#fff;margin:0 0 18px;letter-spacing:-.03em;
  opacity:0;animation:cpFadeUp .9s var(--cp-ease) .22s forwards;
}
.cpHero__tagline{
  font-family:'DM Serif Display',Georgia,serif;
  font-size:clamp(15px,1.8vw,21px);color:rgba(255,255,255,.48);
  font-style:italic;margin:0 0 30px;max-width:520px;
  opacity:0;animation:cpFadeUp .9s var(--cp-ease) .36s forwards;
}
.cpHero__actions{
  display:flex;gap:12px;flex-wrap:wrap;justify-content:center;
  opacity:0;animation:cpFadeUp .9s var(--cp-ease) .5s forwards;
}
.cpBtn{
  display:inline-flex;align-items:center;gap:9px;
  font-family:inherit;font-weight:700;font-size:14.5px;
  border-radius:14px;cursor:pointer;text-decoration:none;
  transition:all .32s var(--cp-ease);white-space:nowrap;line-height:1;
}
.cpBtn--primary{
  padding:15px 34px;border:none;
  background:linear-gradient(135deg,#10b981,#059669);color:#fff;
  box-shadow:0 8px 28px rgba(16,185,129,.35);
}
.cpBtn--primary:hover{transform:translateY(-2px) scale(1.03);box-shadow:0 14px 38px rgba(16,185,129,.5)}
.cpBtn--ghost{
  padding:15px 32px;
  border:1.5px solid rgba(255,255,255,.22);
  background:rgba(255,255,255,.08);backdrop-filter:blur(12px);color:#fff;
}
.cpBtn--ghost:hover{background:rgba(255,255,255,.16);border-color:rgba(255,255,255,.38);transform:translateY(-2px)}
.cpBtn--outline{
  padding:13px 30px;border:1.5px solid var(--cp-border);
  background:var(--cp-surface);color:var(--cp-text);
}
.cpBtn--outline:hover{
  border-color:var(--cp-green);color:var(--cp-green);
  background:var(--cp-mint);transform:translateY(-2px);
  box-shadow:0 4px 18px rgba(5,150,105,.1);
}

/* dots */
.cpHero__dots{
  position:absolute;bottom:clamp(20px,3vh,36px);left:50%;
  transform:translateX(-50%);z-index:8;display:flex;gap:8px;
}
.cpHero__dot{
  width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.28);
  border:none;padding:0;cursor:default;transition:all .5s var(--cp-ease);
}
.cpHero__dot--on{width:26px;border-radius:3px;background:rgba(255,255,255,.82)}
.cpHero__prog{position:absolute;bottom:0;left:0;right:0;height:2px;z-index:8;background:rgba(255,255,255,.06)}
.cpHero__progFill{height:100%;background:rgba(255,255,255,.38);transform-origin:left}

/* ═══════════ ABOUT STRIP ═══════════ */
.cpAbout{background:var(--cp-surface);border-bottom:1px solid var(--cp-border)}
.cpAbout__wrap{max-width:1320px;margin:0 auto;padding:clamp(32px,4vw,52px) clamp(20px,5vw,56px)}

/* description row */
.cpAbout__descRow{
  display:grid;grid-template-columns:1.1fr .9fr;
  gap:clamp(28px,4vw,64px);align-items:start;
  margin-bottom:clamp(28px,3.5vw,44px);
}
.cpAbout__heading{
  font-family:'DM Serif Display',Georgia,serif;
  font-size:clamp(24px,3.2vw,38px);font-weight:400;
  line-height:1.14;color:var(--cp-text);margin:0 0 14px;letter-spacing:-.02em;
}
.cpAbout__desc{font-size:clamp(14px,1.1vw,15.5px);line-height:1.82;color:var(--cp-text2);margin:0}

/* horizontal highlight cards */
.cpAbout__hlGrid{
  display:grid;grid-template-columns:1fr 1fr;gap:10px;
}
.cpAbout__hl{
  display:flex;align-items:center;gap:12px;
  padding:14px 16px;border-radius:14px;
  background:var(--cp-bg);border:1.5px solid var(--cp-border);
  transition:all .25s var(--cp-ease);
}
.cpAbout__hl:hover{border-color:#a7f3d0;transform:translateY(-2px);box-shadow:0 4px 16px rgba(5,150,105,.07)}
.cpAbout__hlIcon{
  width:38px;height:38px;border-radius:10px;flex-shrink:0;
  background:var(--cp-mint);border:1px solid #a7f3d0;color:var(--cp-green-dk);
  display:flex;align-items:center;justify-content:center;
  transition:all .25s ease;
}
.cpAbout__hl:hover .cpAbout__hlIcon{background:var(--cp-green);color:#fff;border-color:var(--cp-green)}
.cpAbout__hlLabel{font-size:10px;font-weight:700;color:var(--cp-text3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:1px}
.cpAbout__hlValue{font-size:13.5px;font-weight:700;color:var(--cp-text);line-height:1.35}

/* stats row — horizontal */
.cpAbout__stats{
  display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));
  border-radius:16px;overflow:hidden;border:1.5px solid var(--cp-border);
}
.cpAbout__stat{
  text-align:center;padding:20px 12px;background:var(--cp-bg);
  border-right:1px solid var(--cp-border);
}
.cpAbout__stat:last-child{border-right:none}
.cpAbout__statVal{
  font-family:'DM Serif Display',Georgia,serif;
  font-size:clamp(20px,2.5vw,30px);font-weight:400;
  color:var(--cp-green-dk);line-height:1;margin-bottom:4px;
}
.cpAbout__statLbl{font-size:10.5px;font-weight:700;color:var(--cp-text3);text-transform:uppercase;letter-spacing:.07em}

/* ═══════════ SECTIONS ═══════════ */
.cpSec{padding:clamp(40px,5vw,72px) clamp(16px,5vw,56px)}
.cpSec--white{background:var(--cp-surface)}
.cpSec--bg{background:var(--cp-bg)}
.cpSec--mint{background:var(--cp-mint)}
.cpSec--dark{background:linear-gradient(155deg,#0f172a 0%,#022c22 50%,#064e3b 100%)}
.cpInner{max-width:1400px;margin:0 auto}
.cpInner--md{max-width:1200px;margin:0 auto}

.cpSecHead{margin-bottom:clamp(24px,3vw,40px)}
.cpSecHead--center{text-align:center}
.cpSecHead--row{display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:12px}
.cpOverline{
  display:inline-flex;align-items:center;gap:7px;
  font-size:11px;font-weight:700;letter-spacing:.1em;
  text-transform:uppercase;color:var(--cp-green-dk);margin-bottom:10px;
}
.cpOverline--light{color:rgba(167,243,208,.85)}
.cpSTitle{
  font-family:'DM Serif Display',Georgia,serif;
  font-size:clamp(26px,3.8vw,44px);font-weight:400;
  line-height:1.13;color:var(--cp-text);margin:0;letter-spacing:-.02em;
}
.cpSTitle--light{color:#fff}
.cpSDesc{
  color:var(--cp-text2);font-size:clamp(13px,1.1vw,15px);
  max-width:500px;line-height:1.72;margin:8px 0 0;
}
.cpSDesc--light{color:rgba(255,255,255,.55)}
.cpSecHead--center .cpSDesc{margin-left:auto;margin-right:auto}

/* ═══════════ DESTINATIONS ═══════════ */
.cpDestGrid{
  display:grid !important;
  gap:clamp(14px,1.8vw,20px) !important;
  align-items:start;
  grid-template-columns:repeat(auto-fill,minmax(320px,1fr));
}
.cpDestGrid__item{
  opacity:0;animation:cpFadeUp .5s var(--cp-ease) forwards;
  min-width:0;
  width:100%;
}
.cpDestGrid__item > *{
  width:100% !important;max-width:100% !important;
  height:100%;
  display:flex !important;flex-direction:column !important;
}
.cpDestEmpty{
  grid-column:1 / -1;text-align:center;
  padding:clamp(48px,6vw,80px) 24px;
  background:var(--cp-surface);border-radius:var(--cp-radius);
  border:1.5px solid var(--cp-border);
}
.cpDestEmpty__icon{
  width:72px;height:72px;border-radius:50%;background:var(--cp-bg);
  margin:0 auto 18px;display:flex;align-items:center;justify-content:center;
  color:var(--cp-text3);
}
.cpDestEmpty h3{
  font-family:'DM Serif Display',Georgia,serif;
  font-size:clamp(20px,2.6vw,28px);color:var(--cp-text);margin:0 0 7px;
}
.cpDestEmpty p{color:var(--cp-text2);font-size:14px;max-width:380px;margin:0 auto;line-height:1.7}
.cpShowMore{text-align:center;margin-top:clamp(28px,3.5vw,44px)}

/* ═══════════ GALLERY ═══════════ */
.cpGalGrid{
  display:grid;grid-template-columns:repeat(4,1fr);
  grid-auto-rows:clamp(150px,14vw,230px);
  gap:clamp(6px,.8vw,12px);
}
.cpGalGrid>:nth-child(1){grid-column:span 2;grid-row:span 2}
.cpGalItem{position:relative;overflow:hidden;border-radius:14px;cursor:pointer;background:var(--cp-bg)}
.cpGalItem img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s var(--cp-ease)}
.cpGalItem:hover img{transform:scale(1.05)}
.cpGalItem__ov{
  position:absolute;inset:0;background:rgba(0,0,0,0);
  transition:background .3s ease;display:flex;align-items:center;justify-content:center;
}
.cpGalItem:hover .cpGalItem__ov{background:rgba(0,0,0,.28)}
.cpGalItem__icon{color:#fff;opacity:0;transform:scale(.8);transition:all .32s var(--cp-ease)}
.cpGalItem:hover .cpGalItem__icon{opacity:1;transform:scale(1)}

/* lightbox */
.cpLB{
  position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.94);
  backdrop-filter:blur(20px);display:flex;align-items:center;justify-content:center;
  padding:24px;animation:cpFadeIn .2s ease;
}
.cpLB img{max-width:90vw;max-height:86vh;border-radius:14px;object-fit:contain;box-shadow:0 32px 80px rgba(0,0,0,.5)}
.cpLB__close{
  position:absolute;top:20px;right:20px;width:44px;height:44px;border-radius:50%;
  border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.06);
  color:#fff;cursor:pointer;display:grid;place-items:center;transition:all .2s ease;
}
.cpLB__close:hover{background:rgba(255,255,255,.16)}
.cpLB__nav{
  position:absolute;top:50%;transform:translateY(-50%);
  width:48px;height:48px;border-radius:50%;
  border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.06);
  color:#fff;cursor:pointer;display:grid;place-items:center;transition:all .2s ease;
}
.cpLB__nav:hover{background:rgba(255,255,255,.16)}
.cpLB__nav--l{left:20px}
.cpLB__nav--r{right:20px}
.cpLB__count{position:absolute;bottom:22px;left:50%;transform:translateX(-50%);color:rgba(255,255,255,.42);font-size:13px;font-weight:600}

/* ═══════════ INFO SECTION ═══════════ */
.cpInfoToggle{
  display:inline-flex;align-items:center;gap:10px;
  padding:14px 36px;border-radius:14px;border:1.5px solid var(--cp-border);
  background:var(--cp-surface);color:var(--cp-text);
  font-weight:700;font-size:14px;cursor:pointer;
  font-family:'Plus Jakarta Sans',sans-serif;
  box-shadow:0 1px 6px rgba(0,0,0,.04);
  transition:all .3s var(--cp-ease);
}
.cpInfoToggle:hover{border-color:var(--cp-green);color:var(--cp-green);box-shadow:0 4px 18px rgba(5,150,105,.09);transform:translateY(-2px)}
.cpInfoToggle--on{background:var(--cp-green);color:#fff;border-color:var(--cp-green)}
.cpInfoToggle--on:hover{background:var(--cp-green-dk);color:#fff;border-color:var(--cp-green-dk)}
.cpInfoPanel{overflow:hidden;transition:max-height .65s cubic-bezier(.16,1,.3,1),opacity .42s ease}

.cpFactsGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(215px,1fr));gap:12px;margin-bottom:clamp(28px,3.5vw,44px)}
.cpFactCard{
  display:flex;align-items:center;gap:13px;padding:15px 16px;
  border-radius:14px;background:var(--cp-surface);border:1.5px solid var(--cp-border);
  transition:all .25s var(--cp-ease);
}
.cpFactCard:hover{border-color:#a7f3d0;box-shadow:0 4px 16px rgba(5,150,105,.07);transform:translateY(-2px)}
.cpFactCard__icon{
  width:36px;height:36px;border-radius:10px;flex-shrink:0;
  background:var(--cp-mint);color:var(--cp-green-dk);
  display:flex;align-items:center;justify-content:center;transition:all .25s ease;
}
.cpFactCard:hover .cpFactCard__icon{background:var(--cp-green);color:#fff}
.cpFactCard__lbl{font-size:10px;font-weight:700;color:var(--cp-text3);text-transform:uppercase;letter-spacing:.07em;margin-bottom:2px}
.cpFactCard__val{font-size:13px;font-weight:700;color:var(--cp-text);line-height:1.35}

.cpDetailsGrid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:clamp(28px,3.5vw,44px)}
.cpDetailCard{border-radius:var(--cp-radius);overflow:hidden;border:1.5px solid var(--cp-border);background:var(--cp-surface);transition:box-shadow .28s ease}
.cpDetailCard:hover{box-shadow:0 8px 28px rgba(5,150,105,.08)}
.cpDetailCard__head{display:flex;align-items:center;gap:12px;padding:15px 20px;background:var(--cp-bg);border-bottom:1px solid var(--cp-border)}
.cpDetailCard__icon{width:36px;height:36px;border-radius:10px;background:var(--cp-green);color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.cpDetailCard__title{font-family:'DM Serif Display',Georgia,serif;font-size:16px;font-weight:400;color:var(--cp-text);margin:0}
.cpDetailCard__body{padding:18px 20px;font-size:14px;color:var(--cp-text2);line-height:1.82;white-space:pre-line}

/* FAQ */
.cpFaqList{margin-bottom:clamp(24px,3vw,40px)}
.cpFaqItem{border:1.5px solid var(--cp-border);border-radius:14px;background:var(--cp-surface);overflow:hidden;margin-bottom:8px;transition:all .25s ease}
.cpFaqItem--open{border-color:#a7f3d0;box-shadow:0 4px 18px rgba(5,150,105,.07)}
.cpFaqItem__btn{width:100%;display:flex;align-items:center;gap:14px;padding:17px 20px;border:none;background:transparent;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;text-align:left}
.cpFaqItem__num{width:28px;height:28px;border-radius:8px;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .25s ease}
.cpFaqItem__num--on{background:var(--cp-green);color:#fff}
.cpFaqItem__num--off{background:var(--cp-bg);color:var(--cp-text3)}
.cpFaqItem__q{flex:1;font-weight:700;font-size:14.5px;color:var(--cp-text);line-height:1.4}
.cpFaqItem__chev{width:24px;height:24px;border-radius:6px;color:var(--cp-text3);flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all .25s ease}
.cpFaqItem__chev--on{color:var(--cp-green);transform:rotate(180deg)}
.cpFaqItem__ans{overflow:hidden;transition:max-height .4s ease,opacity .3s ease}
.cpFaqItem__ansInner{padding:0 20px 18px 62px;font-size:14px;color:var(--cp-text2);line-height:1.86}

/* contact bar */
.cpContact{display:flex;align-items:center;flex-wrap:wrap;gap:18px;padding:20px 26px;border-radius:18px;background:var(--cp-surface);border:1.5px solid #a7f3d0}
.cpContact__icon{width:48px;height:48px;border-radius:14px;background:var(--cp-green);color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.cpContact__body{flex:1;min-width:160px}
.cpContact__title{font-weight:800;font-size:15px;color:var(--cp-text);margin-bottom:3px}
.cpContact__text{font-size:13.5px;color:var(--cp-text2)}

/* CTA */
.cpCTA{text-align:center;position:relative;overflow:hidden}
.cpCTA::before{content:'';position:absolute;top:-40%;left:-15%;width:550px;height:550px;border-radius:50%;background:radial-gradient(circle,rgba(16,185,129,.07) 0%,transparent 70%);pointer-events:none}
.cpCTA__title{font-family:'DM Serif Display',Georgia,serif;font-size:clamp(30px,5vw,52px);font-weight:400;color:#fff;line-height:1.1;margin:0 0 14px;letter-spacing:-.02em}
.cpCTA__title em{font-style:italic;opacity:.85}
.cpCTA__desc{font-size:clamp(14px,1.3vw,17px);color:rgba(255,255,255,.5);line-height:1.76;max-width:520px;margin:0 auto 36px}
.cpCTA__btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
.cpCTA__btnA{
  display:inline-flex;align-items:center;gap:10px;
  padding:17px 38px;border-radius:15px;border:none;
  background:linear-gradient(135deg,#10b981,#059669);color:#fff;
  font-weight:800;font-size:15px;cursor:pointer;
  font-family:'Plus Jakarta Sans',sans-serif;
  box-shadow:0 10px 36px rgba(16,185,129,.38);
  transition:all .32s var(--cp-ease);text-decoration:none;
}
.cpCTA__btnA:hover{transform:translateY(-3px) scale(1.02);box-shadow:0 16px 44px rgba(16,185,129,.52)}
.cpCTA__btnB{
  display:inline-flex;align-items:center;gap:10px;
  padding:17px 34px;border-radius:15px;
  border:1.5px solid rgba(255,255,255,.22);
  background:rgba(255,255,255,.08);backdrop-filter:blur(12px);
  color:#fff;font-weight:700;font-size:15px;cursor:pointer;
  font-family:'Plus Jakarta Sans',sans-serif;
  transition:all .28s ease;text-decoration:none;
}
.cpCTA__btnB:hover{background:rgba(255,255,255,.16);border-color:rgba(255,255,255,.4);transform:translateY(-2px)}

/* ═══════════ RESPONSIVE ═══════════ */
@media(max-width:1100px){
  .cpDestGrid{grid-template-columns:repeat(auto-fill,minmax(260px,1fr)) !important}
  .cpGalGrid{grid-template-columns:repeat(3,1fr) !important}
  .cpGalGrid>:nth-child(1){grid-column:span 2;grid-row:span 1}
}
@media(max-width:900px){
  .cpAbout__descRow{grid-template-columns:1fr !important;gap:20px !important}
  .cpAbout__hlGrid{grid-template-columns:1fr 1fr !important}
}
@media(max-width:768px){
  .cpHero{min-height:500px;max-height:740px}
  .cpHero__actions{flex-direction:column;align-items:center}
  .cpBtn--ghost{display:none}
  .cpDestGrid{grid-template-columns:repeat(auto-fill,minmax(220px,1fr)) !important}
  .cpDetailsGrid{grid-template-columns:1fr !important}
  .cpGalGrid{grid-template-columns:1fr 1fr !important;grid-auto-rows:160px !important}
  .cpGalGrid>:nth-child(1){grid-column:span 1;grid-row:span 1}
  .cpContact{flex-direction:column;text-align:center}
  .cpCTA__btns{flex-direction:column;align-items:center}
  .cpSecHead--row{flex-direction:column;align-items:flex-start}
  .cpAbout__stats{grid-template-columns:repeat(auto-fit,minmax(100px,1fr)) !important}
}
@media(max-width:540px){
  .cpHero{height:86vh;height:86dvh;min-height:440px;max-height:660px}
  .cpHero__title{font-size:clamp(38px,12vw,58px) !important}
  .cpHero__metaDiv{display:none}
  .cpHero__meta{gap:8px}
  .cpDestGrid{grid-template-columns:repeat(auto-fill,minmax(200px,1fr)) !important}
  .cpAbout__hlGrid{grid-template-columns:1fr !important}
  .cpFactsGrid{grid-template-columns:1fr 1fr !important}
  .cpGalGrid{grid-template-columns:1fr !important;grid-auto-rows:210px !important}
}
@media(max-width:400px){
  .cpDestGrid{grid-template-columns:1fr !important}
}
@media(max-width:380px){
  .cpFactsGrid{grid-template-columns:1fr !important}
}
@media(prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:.01ms !important;transition-duration:.01ms !important}
}
`;

function injectCSS() {
  if (typeof document === "undefined") return;
  const ID = "cp-styles-v12";
  const existing = document.getElementById(ID);
  if (existing) existing.remove();
  const el = document.createElement("style");
  el.id = ID;
  el.textContent = PAGE_CSS;
  document.head.appendChild(el);
}

/* ── Scroll ── */
const ScrollCtx = createContext(0);
const ScrollProvider = ({ children }) => {
  const [p, setP] = useState(0);
  useEffect(() => {
    const fn = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setP(h > 0 ? window.scrollY / h : 0);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return <ScrollCtx.Provider value={p}>{children}</ScrollCtx.Provider>;
};
const ScrollBar = () => {
  const p = useContext(ScrollCtx);
  return <div className="cpScrollProg"><div className="cpScrollProg__bar" style={{ width: `${p * 100}%` }} /></div>;
};

/* ── Data Helpers ── */
const pick = (...v) => { for (const x of v) if (x && typeof x === "string" && x.trim()) return x.trim(); return ""; };

const getHeroImages = (c) => {
  const s = new Set();
  const a = (v) => { if (v && typeof v === "string" && v.trim()) s.add(v.trim()); };
  if (Array.isArray(c?.hero_images)) c.hero_images.forEach(a);
  a(c?.image_url); a(c?.heroImage); a(c?.coverImageUrl);
  c?.media?.hero_images?.forEach?.(a);
  c?.media?.gallery?.forEach?.(a);
  if (Array.isArray(c?.images)) c.images.forEach(a);
  return [...s].filter(Boolean).slice(0, 8);
};

const getGalleryImages = (c) => {
  const s = new Set();
  const a = (v) => { if (v && typeof v === "string" && v.trim()) s.add(v.trim()); };
  c?.media?.gallery?.forEach?.(a);
  c?.media?.hero_images?.forEach?.(a);
  if (Array.isArray(c?.hero_images)) c.hero_images.forEach(a);
  if (Array.isArray(c?.images)) c.images.forEach(a);
  a(c?.image_url);
  return [...s].filter(Boolean);
};

const getAboutHighlights = (c) => {
  const r = [];
  const a = (l, v, ic) => { if (v && String(v).trim()) r.push({ label: l, value: String(v).trim(), icon: ic }); };
  a("Capital City", pick(c?.capital), <FiMapPin size={15} />);
  a("Best Time to Visit", pick(c?.best_time_to_visit, c?.climate_detail?.best_time), <FiCalendar size={15} />);
  a("Currency", pick(c?.currency, c?.practical_info?.currency?.name), <FiTrendingUp size={15} />);
  a("Languages", c?.languages?.official?.length ? c.languages.official.join(", ") : "", <FiGlobe size={15} />);
  return r.slice(0, 4);
};

const getAboutStats = (c) => {
  const r = [];
  const dc = c?.destination_count || c?.destinations?.length || 0;
  if (dc > 0) r.push({ val: `${dc}+`, lbl: "Destinations" });
  const exp = Array.isArray(c?.experiences) ? c.experiences.length : Array.isArray(c?.highlights) ? c.highlights.length : 0;
  if (exp > 0) r.push({ val: `${exp}+`, lbl: "Experiences" });
  if (c?.key_facts?.area) r.push({ val: c.key_facts.area, lbl: "Total Area" });
  else if (c?.key_facts?.population || c?.extra_info?.population)
    r.push({ val: c.key_facts?.population || c.extra_info?.population, lbl: "Population" });
  return r;
};

const getExpandableFacts = (c) => {
  const r = [];
  const a = (l, v, ic) => { if (v && String(v).trim()) r.push({ label: l, value: String(v).trim(), icon: ic }); };
  a("Timezone", pick(c?.timezone), <FiClock size={14} />);
  a("Visa Info", pick(c?.visa_info, c?.practical_info?.visa), <FiShield size={14} />);
  a("Continent", pick(c?.continent), <FiGlobe size={14} />);
  a("Region", pick(c?.region), <FiCompass size={14} />);
  const kf = c?.key_facts || {};
  if (kf.population) a("Population", kf.population, <FiUsers size={14} />);
  if (kf.area) a("Total Area", kf.area, <FiGlobe size={14} />);
  if (kf.life_expectancy) a("Life Expectancy", kf.life_expectancy, <FiHeart size={14} />);
  if (kf.literacy_rate) a("Literacy Rate", kf.literacy_rate, <FiBookOpen size={14} />);
  const ei = c?.extra_info || {};
  if (ei.population && !kf.population) a("Population", ei.population, <FiUsers size={14} />);
  if (ei.driving_side || c?.driving_side) a("Driving Side", ei.driving_side || c.driving_side, <FiFlag size={14} />);
  if (ei.calling_code || c?.calling_code) a("Calling Code", ei.calling_code || c.calling_code, <FiPhone size={14} />);
  if (ei.water_safety) a("Water Safety", ei.water_safety, <FiDroplet size={14} />);
  const pi = c?.practical_info || {};
  if (pi.electricity?.plug_type) a("Plug Type", pi.electricity.plug_type, <FiZap size={14} />);
  if (pi.electricity?.voltage) a("Voltage", pi.electricity.voltage, <FiZap size={14} />);
  const seen = new Set();
  return r.filter((i) => { if (seen.has(i.label)) return false; seen.add(i.label); return true; });
};

const getDetailSections = (c) => {
  const s = [];
  const a = (l, v, ic) => { if (v && String(v).trim()) s.push({ label: l, value: String(v).trim(), icon: ic }); };
  const ei = c?.extra_info || {};
  a("Health Information", ei.health || pick(c?.health_info, c?.practical_info?.health), <FiAlertTriangle size={14} />);
  const fd = pick(c?.full_description);
  if (fd && fd.length > 100) a("Overview", fd, <FiBookOpen size={14} />);
  if (c?.wildlife) {
    const p = [];
    c.wildlife.primates?.length && p.push(`Primates: ${c.wildlife.primates.join(", ")}`);
    c.wildlife.big_five?.length && p.push(`Big Five: ${c.wildlife.big_five.join(", ")}`);
    c.wildlife.birds?.length && p.push(`Birds: ${c.wildlife.birds.join(", ")}`);
    if (p.length) a("Wildlife & Nature", p.join(". "), <FiCamera size={14} />);
  }
  if (c?.cuisine) {
    const p = [];
    c.cuisine.famous_dishes?.length && p.push(`Famous dishes: ${c.cuisine.famous_dishes.join(", ")}`);
    c.cuisine.staples?.length && p.push(`Staples: ${c.cuisine.staples.join(", ")}`);
    c.cuisine.beverages?.length && p.push(`Beverages: ${c.cuisine.beverages.join(", ")}`);
    if (p.length) a("Food & Drink", p.join(". "), <FiCoffee size={14} />);
  }
  if (c?.geography) {
    const g = c.geography, p = [];
    g.terrain && p.push(g.terrain);
    g.highest_point && p.push(`Highest point: ${g.highest_point}`);
    g.lakes?.length && p.push(`Lakes: ${g.lakes.join(", ")}`);
    g.volcanoes?.length && p.push(`Volcanoes: ${g.volcanoes.join(", ")}`);
    g.forests?.length && p.push(`Forests: ${g.forests.join(", ")}`);
    if (p.length) a("Geography & Landscape", p.join(". "), <FiMapPin size={14} />);
  }
  if (c?.climate_detail) {
    const cd = c.climate_detail, p = [];
    cd.overview && p.push(cd.overview);
    cd.seasons && Object.entries(cd.seasons).forEach(([n, d]) => {
      d.months && p.push(`${n}: ${d.months}${d.note ? ` (${d.note})` : ""}`);
    });
    if (p.length) a("Climate & Seasons", p.join(". "), <FiSun size={14} />);
  }
  if (Array.isArray(c?.travel_tips) && c.travel_tips.length)
    a("Travel Tips", "• " + c.travel_tips.join("\n• "), <FiInfo size={14} />);
  if (Array.isArray(c?.neighboring_countries) && c.neighboring_countries.length)
    a("Neighboring Countries", c.neighboring_countries.join(", "), <FiGlobe size={14} />);
  const seen = new Set();
  return s.filter((x) => { if (seen.has(x.label)) return false; seen.add(x.label); return true; });
};

const getFaqs = (c) => {
  if (Array.isArray(c?.faqs) && c.faqs.length > 0)
    return c.faqs.filter((f) => (f.question || f.q) && (f.answer || f.a))
      .map((f) => ({ question: f.question || f.q, answer: f.answer || f.a }));
  const r = [], n = c?.name || "this country";
  const visa = pick(c?.visa_info, c?.practical_info?.visa);
  if (visa) r.push({ question: `Do I need a visa to visit ${n}?`, answer: visa });
  if (c?.languages?.official?.length)
    r.push({ question: `What languages are spoken in ${n}?`, answer: `Official languages: ${c.languages.official.join(", ")}.` });
  r.push({ question: `Is ${n} safe for tourists?`, answer: `${n} is generally welcoming to tourists. Always check current travel advisories.` });
  const bt = pick(c?.best_time_to_visit, c?.climate_detail?.best_time);
  if (bt) r.push({ question: `What's the best time to visit ${n}?`, answer: bt });
  const cur = pick(c?.currency, c?.practical_info?.currency?.name);
  if (cur) r.push({ question: `What currency is used in ${n}?`, answer: `The official currency is the ${cur}.` });
  return r.slice(0, 8);
};

/* ═══════════ 1. HERO ═══════════ */
const HeroSection = ({ country, navigate }) => {
  const images = useMemo(() => getHeroImages(country), [country]);
  const [active, setActive] = useState(0);
  const [anim, setAnim] = useState(0);
  const timer = useRef(null);

  const advance = useCallback(() => {
    if (images.length <= 1) return;
    setActive((p) => (p + 1) % images.length);
    setAnim((k) => k + 1);
  }, [images.length]);

  useEffect(() => {
    if (images.length <= 1) return;
    timer.current = setInterval(advance, 9000);
    return () => clearInterval(timer.current);
  }, [advance, images.length]);

  const flag = country?.flag_url;
  const dc = country?.destination_count || country?.destinations?.length || 0;

  return (
    <header className="cpHero">
      {images.length > 0
        ? images.map((src, i) => (
            <div key={src + i} className={`cpHero__slide${i === active ? " cpHero__slide--on" : ""}`}>
              <img src={src} alt={country.name} loading={i === 0 ? "eager" : "lazy"} draggable={false} />
            </div>
          ))
        : <div className="cpHero__noImg"><FiGlobe size={120} style={{ color: "rgba(255,255,255,.04)" }} /></div>}
      <div className="cpHero__ov1" />
      <div className="cpHero__ov2" />

      <nav className="cpHero__nav">
        <ol className="cpCrumb">
          <li><Link to="/" className="cpCrumb">Home</Link></li>
          <li><span className="cpCrumb__sep">/</span></li>
          <li><Link to="/destinations" className="cpCrumb">Destinations</Link></li>
          <li><span className="cpCrumb__sep">/</span></li>
          <li><span className="cpCrumb__cur">{country.name}</span></li>
        </ol>
      </nav>

      <div className="cpHero__body">
        <div className="cpHero__meta">
          {flag && (
            <>
              <span className="cpHero__metaItem"><img src={flag} alt="" className="cpHero__flagImg" /></span>
              <div className="cpHero__metaDiv" />
            </>
          )}
          {country.continent && <span className="cpHero__metaItem"><FiGlobe size={13} /> {country.continent}</span>}
          {country.region && <><div className="cpHero__metaDiv" /><span className="cpHero__metaItem"><FiCompass size={13} /> {country.region}</span></>}
          {dc > 0 && <><div className="cpHero__metaDiv" /><span className="cpHero__metaItem"><FiMapPin size={13} /> {dc} Destination{dc !== 1 ? "s" : ""}</span></>}
        </div>

        <h1 className="cpHero__title">{country.name}</h1>
        {country.tagline && <p className="cpHero__tagline">{country.tagline}</p>}

        <div className="cpHero__actions">
          <button className="cpBtn cpBtn--primary"
            onClick={() => document.getElementById("cp-destinations")?.scrollIntoView({ behavior: "smooth" })}>
            <FiCompass size={15} /> Explore Destinations
          </button>
          <button className="cpBtn cpBtn--ghost" onClick={() => navigate("/contact")}>
            <FiSend size={14} /> Plan My Trip
          </button>
        </div>
      </div>

      {images.length > 1 && (
        <div className="cpHero__dots">
          {images.map((_, i) => <span key={i} className={`cpHero__dot${i === active ? " cpHero__dot--on" : ""}`} />)}
        </div>
      )}
      {images.length > 1 && (
        <div className="cpHero__prog">
          <div className="cpHero__progFill" key={`p-${anim}`} style={{ animation: "cpProgress 9s linear forwards" }} />
        </div>
      )}
    </header>
  );
};

/* ═══════════ 2. ABOUT — always visible ═══════════ */
const AboutSection = ({ country }) => {
  const desc = pick(country?.description, country?.short_notes);
  const hl = useMemo(() => getAboutHighlights(country), [country]);
  const stats = useMemo(() => getAboutStats(country), [country]);

  const text = useMemo(() => {
    if (!desc) return "";
    return desc.split(/(?<=[.!?])\s+/).filter(Boolean).slice(0, 4).join(" ");
  }, [desc]);

  if (!text && hl.length === 0 && stats.length === 0) return null;

  return (
    <section className="cpAbout">
      <div className="cpAbout__wrap">
        <AnimatedSection animation="fadeInUp">
          <div className="cpAbout__descRow">
            <div>
              <h2 className="cpAbout__heading">Discover {country.name}</h2>
              {text && <p className="cpAbout__desc">{text}</p>}
            </div>
            {hl.length > 0 && (
              <div className="cpAbout__hlGrid">
                {hl.map((h, i) => (
                  <div key={i} className="cpAbout__hl">
                    <div className="cpAbout__hlIcon">{h.icon}</div>
                    <div>
                      <div className="cpAbout__hlLabel">{h.label}</div>
                      <div className="cpAbout__hlValue">{h.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </AnimatedSection>

        {stats.length > 0 && (
          <AnimatedSection animation="fadeInUp" delay={0.06}>
            <div className="cpAbout__stats">
              {stats.map((s, i) => (
                <div key={i} className="cpAbout__stat">
                  <div className="cpAbout__statVal">{s.val}</div>
                  <div className="cpAbout__statLbl">{s.lbl}</div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        )}
      </div>
    </section>
  );
};

/* ═══════════ 3. DESTINATIONS ═══════════ */
const DestinationsSection = ({ country, allDests, destsLoading }) => {
  const [showAll, setShowAll] = useState(false);
  const INIT = 6;
  const shown = showAll ? allDests : allDests.slice(0, INIT);
  const hasMore = allDests.length > INIT;

  return (
    <section id="cp-destinations" className="cpSec cpSec--bg">
      <div className="cpInner">
        <AnimatedSection animation="fadeInUp">
          <div className="cpSecHead cpSecHead--center">
            <div className="cpOverline"><FiGrid size={12} /> Places to Explore</div>
            <h2 className="cpSTitle">Destinations in {country.name}</h2>
            <p className="cpSDesc">
              {allDests.length > 0
                ? `${allDests.length} carefully selected destination${allDests.length !== 1 ? "s" : ""} — each offering unique, authentic experiences.`
                : "Curated destinations crafted for unforgettable journeys."}
            </p>
          </div>
        </AnimatedSection>

        {destsLoading ? (
          <div className="cpDestGrid">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="cpDestGrid__item" style={{ animationDelay: `${i * 60}ms` }}>
                <DestinationCardSkeleton />
              </div>
            ))}
          </div>
        ) : allDests.length === 0 ? (
          <div className="cpDestEmpty">
            <div className="cpDestEmpty__icon"><FiMapPin size={28} /></div>
            <h3>Destinations Coming Soon</h3>
            <p>We're curating incredible experiences in {country.name}. Check back shortly.</p>
          </div>
        ) : (
          <>
            <div className="cpDestGrid">
              {shown.map((dest, i) => (
                <div
                  key={dest.id || dest.slug || i}
                  className="cpDestGrid__item"
                  style={{ animationDelay: `${Math.min(i, 5) * 60}ms` }}
                >
                  <DestinationCard destination={dest} priority={i < 4} />
                </div>
              ))}
            </div>

            {hasMore && !showAll && (
              <div className="cpShowMore">
                <button className="cpBtn cpBtn--outline" onClick={() => setShowAll(true)}>
                  View All {allDests.length} Destinations <FiArrowRight size={14} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

/* ═══════════ 4. GALLERY ═══════════ */
const LightboxModal = ({ images, startIdx, onClose }) => {
  const [idx, setIdx] = useState(startIdx);
  const next = () => setIdx((p) => (p + 1) % images.length);
  const prev = () => setIdx((p) => (p - 1 + images.length) % images.length);
  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    document.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", fn); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <div className="cpLB" onClick={onClose}>
      <img src={images[idx]} alt={`Gallery ${idx + 1}`} onClick={(e) => e.stopPropagation()} />
      <button className="cpLB__close" onClick={onClose}><FiX size={18} /></button>
      {images.length > 1 && (
        <>
          <button className="cpLB__nav cpLB__nav--l" onClick={(e) => { e.stopPropagation(); prev(); }}><FiChevronLeft size={20} /></button>
          <button className="cpLB__nav cpLB__nav--r" onClick={(e) => { e.stopPropagation(); next(); }}><FiChevronRight size={20} /></button>
          <div className="cpLB__count">{idx + 1} / {images.length}</div>
        </>
      )}
    </div>
  );
};

const GallerySection = ({ country }) => {
  const images = useMemo(() => getGalleryImages(country), [country]);
  const [lbIdx, setLbIdx] = useState(null);
  if (images.length < 3) return null;

  return (
    <>
      <section className="cpSec cpSec--white">
        <div className="cpInner">
          <AnimatedSection animation="fadeInUp">
            <div className="cpSecHead cpSecHead--center">
              <div className="cpOverline"><FiCamera size={12} /> Gallery</div>
              <h2 className="cpSTitle">{country.name} in Pictures</h2>
              <p className="cpSDesc">
                Landscapes, wildlife and culture — a visual preview of what awaits.
              </p>
            </div>
          </AnimatedSection>
          <div className="cpGalGrid">
            {images.slice(0, 7).map((src, i) => (
              <div key={src + i} className="cpGalItem" onClick={() => setLbIdx(i)}
                role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setLbIdx(i)}>
                <img src={src} alt={`${country.name} ${i + 1}`} loading="lazy" />
                <div className="cpGalItem__ov"><FiExternalLink className="cpGalItem__icon" size={22} /></div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {lbIdx !== null && <LightboxModal images={images} startIdx={lbIdx} onClose={() => setLbIdx(null)} />}
    </>
  );
};

/* ═══════════ 5. INFO — expandable ═══════════ */
const FaqItem = ({ faq, index, isOpen, onToggle }) => (
  <div className={`cpFaqItem${isOpen ? " cpFaqItem--open" : ""}`}>
    <button className="cpFaqItem__btn" onClick={onToggle}>
      <span className={`cpFaqItem__num${isOpen ? " cpFaqItem__num--on" : " cpFaqItem__num--off"}`}>
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="cpFaqItem__q">{faq.question}</span>
      <span className={`cpFaqItem__chev${isOpen ? " cpFaqItem__chev--on" : ""}`}><FiChevronDown size={14} /></span>
    </button>
    <div className="cpFaqItem__ans" style={{ maxHeight: isOpen ? 500 : 0, opacity: isOpen ? 1 : 0 }}>
      <div className="cpFaqItem__ansInner">{faq.answer}</div>
    </div>
  </div>
);

const InfoSection = ({ country }) => {
  const [open, setOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const panelRef = useRef(null);

  const facts = useMemo(() => getExpandableFacts(country), [country]);
  const details = useMemo(() => getDetailSections(country), [country]);
  const faqs = useMemo(() => getFaqs(country), [country]);
  const name = country?.name || "this destination";

  const hasContent = facts.length > 0 || details.length > 0 || faqs.length > 0;
  if (!hasContent) return null;

  const toggle = () => {
    if (!open) {
      setOpen(true);
      setTimeout(() => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 140);
    } else {
      setOpen(false);
    }
  };

  return (
    <section className="cpSec cpSec--mint">
      <div className="cpInner--md">
        <AnimatedSection animation="fadeInUp">
          <div className="cpSecHead cpSecHead--center">
            <div className="cpOverline"><FiLayers size={12} /> Travel Information</div>
            <h2 className="cpSTitle">Know Before You Go</h2>
            <p className="cpSDesc">
              Essential details about {name} — climate, practical logistics, wildlife, cuisine, and more.
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection animation="fadeInUp" delay={0.06}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: open ? 40 : 0 }}>
            <button className={`cpInfoToggle${open ? " cpInfoToggle--on" : ""}`} onClick={toggle}>
              {open ? <FiMinus size={15} /> : <FiPlus size={15} />}
              {open ? "Hide Details" : `View Details About ${name}`}
              {open ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
            </button>
          </div>
        </AnimatedSection>

        <div ref={panelRef} className="cpInfoPanel"
          style={{ maxHeight: open ? 99999 : 0, opacity: open ? 1 : 0 }}>

          {facts.length > 0 && (
            <div style={{ marginBottom: 36 }}>
              <div className="cpOverline" style={{ marginBottom: 14 }}><FiFlag size={12} /> Quick Facts</div>
              <div className="cpFactsGrid">
                {facts.map((f, i) => (
                  <div key={i} className="cpFactCard">
                    <div className="cpFactCard__icon">{f.icon}</div>
                    <div>
                      <div className="cpFactCard__lbl">{f.label}</div>
                      <div className="cpFactCard__val">{f.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {details.length > 0 && (
            <div style={{ marginBottom: 36 }}>
              <div className="cpOverline" style={{ marginBottom: 14 }}><FiBookOpen size={12} /> In-Depth Guide</div>
              <div className="cpDetailsGrid">
                {details.map((item, i) => (
                  <div key={i} className="cpDetailCard">
                    <div className="cpDetailCard__head">
                      <div className="cpDetailCard__icon">{item.icon}</div>
                      <h3 className="cpDetailCard__title">{item.label}</h3>
                    </div>
                    <div className="cpDetailCard__body">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {faqs.length > 0 && (
            <div style={{ marginBottom: 36 }}>
              <div className="cpOverline" style={{ marginBottom: 14 }}><FiMessageCircle size={12} /> Frequently Asked</div>
              <div className="cpFaqList">
                {faqs.map((faq, i) => (
                  <FaqItem key={i} faq={faq} index={i}
                    isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
                ))}
              </div>
              <div className="cpContact">
                <div className="cpContact__icon"><FiMail size={20} /></div>
                <div className="cpContact__body">
                  <div className="cpContact__title">Still have questions?</div>
                  <div className="cpContact__text">Our {name} specialists are happy to help plan your journey.</div>
                </div>
                <Link to="/contact" className="cpBtn cpBtn--primary" style={{ padding: "13px 26px", fontSize: 13.5 }}>
                  <FiMail size={14} /> Get in Touch
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

/* ═══════════ 6. CTA ═══════════ */
const CtaSection = ({ country }) => {
  const name = country?.name || "East Africa";
  return (
    <section className="cpSec cpSec--dark cpCTA">
      <div className="cpInner--md">
        <AnimatedSection animation="fadeInUp">
          <div className="cpCTA__content" style={{ position: "relative", zIndex: 1 }}>
            <div className="cpOverline cpOverline--light" style={{ justifyContent: "center", marginBottom: 16 }}>
              <FiCompass size={12} /> Start Planning
            </div>
            <h2 className="cpCTA__title">Your {name} Adventure<br /><em>Begins Here</em></h2>
            <p className="cpCTA__desc">
              From misty mountain gorillas to golden savannahs — our local experts craft journeys as unique as you are.
            </p>
            <div className="cpCTA__btns">
              <Link to="/booking" className="cpCTA__btnA"><FiCalendar size={16} /> Plan My Trip</Link>
              <Link to="/contact" className="cpCTA__btnB"><FiMail size={16} /> Speak to an Expert</Link>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

/* ═══════════ ROOT ═══════════ */
const CountryPage = () => {
  const { countryId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    injectCSS();
  }, [countryId]);

  const { country, loading, error, refetch } = useCountry(countryId);
  const { destinations: allDests = [], loading: destsLoading } = useCountryDestinations(countryId);

  const slug = country ? getCountrySlug(country) : "";
  const heroImages = country ? getHeroImages(country) : [];

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafb" }}>
        <Loader />
      </div>
    );
  }

  if (error || !country) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#f8fafb", padding: "0 24px", fontFamily: "'Plus Jakarta Sans',sans-serif",
      }}>
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%", background: "#fef2f2",
            margin: "0 auto 24px", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <FiWifiOff size={32} style={{ color: "#f87171" }} />
          </div>
          <h2 style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: 28, fontWeight: 400, color: "#0f172a", marginBottom: 10 }}>
            Country Not Found
          </h2>
          <p style={{ color: "#475569", fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
            {error || `We couldn't find "${countryId}". Please try again.`}
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <button onClick={() => navigate(-1)} className="cpBtn cpBtn--outline"><FiArrowLeft size={14} /> Go Back</button>
            <button onClick={refetch} className="cpBtn cpBtn--primary"><FiRefreshCw size={14} /> Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScrollProvider>
      <div className="cp-page">
        <ScrollBar />
        <SEO
          title={`Explore ${country.name}`}
          description={pick(country?.tagline, country?.short_notes, country?.description) || `Discover ${country.name}.`}
          keywords={[country.name, country.continent, country.region, "safari", "travel"].filter(Boolean)}
          url={`/country/${slug}`}
          image={heroImages[0]}
          type="website"
          breadcrumbs={[
            { name: "Home", url: "/" },
            { name: "Destinations", url: "/destinations" },
            { name: country.name, url: `/country/${slug}` },
          ]}
        />

        <PageHeader
          title={country.name}
          subtitle={country.tagline || `Discover incredible destinations and experiences in ${country.name}`}
          backgroundImage={country.hero_images?.[0] || country.image_url || heroImages[0]}
          breadcrumbs={[
            { label: "Destinations", path: "/destinations" },
            { label: country.name },
          ]}
          height="620px"
          align="center"
        />
        
        <div style={{ marginTop: "-100px" }}>
          <AboutSection country={country} />
          <DestinationsSection country={country} allDests={allDests} destsLoading={destsLoading} />
          <GallerySection country={country} />
          <InfoSection country={country} />
          <CtaSection country={country} />
        </div>
      </div>
    </ScrollProvider>
  );
};

export default CountryPage;