import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiUsers, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const resolveApiBase = () => {
  const raw = (import.meta.env.VITE_API_URL || 'https://backend-jd8f.onrender.com').trim().replace(/\/+$/, '');
  return /\/api$/i.test(raw) ? raw : `${raw}/api`;
};
const API_BASE = resolveApiBase();
const assetUrl = (value) => {
  if (!value || typeof value !== 'string') return '';
  if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return value;
  const origin = API_BASE.replace(/\/api$/i, '');
  return value.startsWith('/uploads/') || value.startsWith('/storage/') ? origin + value : value;
};
const extractMembers = (payload) => {
  const list = Array.isArray(payload) ? payload : payload?.data || payload?.results || payload?.members || [];
  return list.filter((m) => m && m.is_active !== false && (m.name || m.full_name)).map((m, i) => ({
    id: m.id || m._id || m.slug || `${m.name || m.full_name}-${i}`,
    name: m.name || m.full_name,
    role: m.role || m.position || 'Altuvera team',
    image: assetUrl(m.image_url || m.imageUrl || m.avatar_url || m.photo_url || m.profile_image_url || m.image || m.photo),
  }));
};

export default function TeamPortraitCarousel() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openingMember, setOpeningMember] = useState(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const openingTimer = useRef(null);
  const trackRef = useRef(null);
  const viewportRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE}/team`, { headers: { Accept: 'application/json' }, signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load team');
        return response.json();
      })
      .then((payload) => setMembers(extractMembers(payload)))
      .catch((error) => { if (error.name !== 'AbortError') setMembers([]); })
      .finally(() => setLoading(false));
    return () => { controller.abort(); if (openingTimer.current) window.clearTimeout(openingTimer.current); };
  }, []);

  // Looping motion is reserved for teams above ten; all team sizes share one horizontal rail.
  const shouldMarquee = members.length > 10;
  const repeated = useMemo(() => shouldMarquee ? [...members, ...members, ...members] : members, [members, shouldMarquee]);

  useEffect(() => {
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport) return undefined;

    const updateNavigation = () => {
      const overflow = track.scrollWidth > track.clientWidth + 3;
      setHasOverflow(overflow);
      setCanPrev(overflow && track.scrollLeft > 4);
      setCanNext(overflow && track.scrollLeft < track.scrollWidth - track.clientWidth - 4);
    };

    updateNavigation();
    track.addEventListener('scroll', updateNavigation, { passive: true });
    window.addEventListener('resize', updateNavigation);
    let observer;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(updateNavigation);
      observer.observe(viewport);
      observer.observe(track);
    }
    const frame = window.requestAnimationFrame(updateNavigation);
    return () => {
      track.removeEventListener('scroll', updateNavigation);
      window.removeEventListener('resize', updateNavigation);
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [members, shouldMarquee]);

  const scrollRail = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    const distance = Math.max(220, Math.round(track.clientWidth * 0.66));
    track.scrollBy({ left: direction === 'next' ? distance : -distance, behavior: 'smooth' });
  };

  useEffect(() => {
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport || !shouldMarquee) return undefined;
    let frame;
    let last = 0;
    let paused = false;
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const tick = (time) => {
      if (!last) last = time;
      const delta = Math.min(time - last, 40);
      last = time;
      if (!paused && !motionQuery.matches && track.scrollWidth > track.clientWidth + 2) {
        track.scrollLeft += delta * 0.026;
        const cycleWidth = track.scrollWidth / 3;
        if (track.scrollLeft >= cycleWidth * 2) track.scrollLeft -= cycleWidth;
        if (track.scrollLeft < 1) track.scrollLeft = cycleWidth;
      }
      frame = window.requestAnimationFrame(tick);
    };
    const pause = () => { paused = true; };
    const resume = () => { paused = false; last = 0; };
    let touchResumeTimer = null;
    const onTouchStart = () => {
      paused = true;
      if (touchResumeTimer) window.clearTimeout(touchResumeTimer);
    };
    const onTouchEnd = () => {
      if (touchResumeTimer) window.clearTimeout(touchResumeTimer);
      touchResumeTimer = window.setTimeout(() => {
        paused = false;
        last = 0;
      }, 1400);
    };
    viewport.addEventListener('pointerenter', pause);
    viewport.addEventListener('pointerleave', resume);
    viewport.addEventListener('focusin', pause);
    viewport.addEventListener('focusout', resume);
    viewport.addEventListener('touchstart', onTouchStart, { passive: true });
    viewport.addEventListener('touchend', onTouchEnd, { passive: true });
    frame = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(frame);
      if (touchResumeTimer) window.clearTimeout(touchResumeTimer);
      viewport.removeEventListener('pointerenter', pause);
      viewport.removeEventListener('pointerleave', resume);
      viewport.removeEventListener('focusin', pause);
      viewport.removeEventListener('focusout', resume);
      viewport.removeEventListener('touchstart', onTouchStart);
      viewport.removeEventListener('touchend', onTouchEnd);
    };
  }, [members, shouldMarquee]);

  if (!loading && members.length === 0) return null;

  return (
    <section className="about-team-strip" aria-label="Meet our team">
      <style>{`
        .about-team-strip{padding:20px clamp(16px,3vw,32px) 22px;background:linear-gradient(115deg,#052e16 0%,#064e3b 56%,#065f46 100%);border-top:1px solid rgba(167,243,208,.12);border-bottom:1px solid rgba(167,243,208,.12);overflow:hidden}
        .about-team-strip-inner{max-width:1280px;margin:0 auto;display:flex;align-items:center;gap:clamp(18px,3vw,36px)}
        .about-team-strip-copy{flex:0 0 auto;width:clamp(160px,17vw,210px)}
        .about-team-strip-eyebrow{display:flex;align-items:center;gap:6px;color:#a7f3d0;font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;margin:0 0 6px}
        .about-team-strip-title{font:700 clamp(18px,2vw,23px)/1.2 'Playfair Display',Georgia,serif;color:#fff;margin:0}
        .about-team-strip-link{display:inline-flex;align-items:center;gap:5px;color:#a7f3d0;font-size:12px;font-weight:700;text-decoration:none;margin-top:9px;transition:color .2s ease}
        .about-team-strip-link:hover{color:#fff}
        .about-team-strip-viewport{position:relative;min-width:0;flex:1;overflow:hidden;mask-image:linear-gradient(90deg,transparent,#000 3%,#000 97%,transparent);-webkit-mask-image:linear-gradient(90deg,transparent,#000 3%,#000 97%,transparent)}
        .about-team-strip-viewport.has-overflow .about-team-strip-track{padding-left:39px;padding-right:39px}
        .about-team-strip-track{display:flex;align-items:flex-start;flex-wrap:nowrap;gap:clamp(16px,2vw,26px);width:100%;min-width:0;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;-ms-overflow-style:none;scroll-behavior:smooth;scroll-snap-type:x proximity;padding:6px 3px 10px;overscroll-behavior-x:contain;touch-action:pan-x;box-sizing:border-box}
        .about-team-strip-track::-webkit-scrollbar{display:none;width:0;height:0}
        .about-team-person{display:flex;flex:0 0 auto;width:clamp(80px,7.4vw,104px);flex-direction:column;align-items:center;gap:7px;text-decoration:none;color:#ecfdf5;outline-offset:5px;scroll-snap-align:start}
        .about-team-portrait-shell{position:relative;isolation:isolate;overflow:hidden;width:clamp(80px,7.4vw,104px);height:clamp(80px,7.4vw,104px);padding:0;border-radius:50%;background:rgba(16,185,129,.12);box-shadow:0 6px 20px rgba(0,0,0,.22);transition:transform .28s cubic-bezier(.2,.8,.25,1.25),box-shadow .25s ease;flex:0 0 auto;box-sizing:border-box}
        .about-team-portrait-shell::before{content:'';position:absolute;z-index:3;inset:0;border-radius:50%;padding:3px;box-sizing:border-box;background:conic-gradient(from 0deg,#00e5a0 0deg,#b5ffdf 48deg,#10b981 92deg,#087f58 145deg,#73f6c3 205deg,#d1fae5 246deg,#16c784 300deg,#00e5a0 360deg);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;animation:aboutTeamBorderSpin 3.2s linear infinite;pointer-events:none;filter:drop-shadow(0 0 3px rgba(16,185,129,.3))}
        .about-team-person:hover .about-team-portrait-shell,.about-team-person:focus-visible .about-team-portrait-shell{transform:translateY(-3px) scale(1.045);box-shadow:0 10px 24px rgba(0,0,0,.32)}
        .about-team-person.is-opening .about-team-portrait-shell{animation:aboutTeamPortraitBounce .32s cubic-bezier(.34,1.56,.64,1) both;box-shadow:0 10px 24px rgba(5,150,105,.4)}
        .about-team-portrait{position:absolute;z-index:2;inset:3px;width:calc(100% - 6px);height:calc(100% - 6px);border:0;border-radius:50%;overflow:hidden;background:linear-gradient(135deg,#047857,#064e3b);display:grid;place-items:center;color:#ecfdf5;font-weight:800;font-size:22px;box-sizing:border-box}
        .about-team-portrait img{display:block;width:100%;height:100%;min-width:100%;min-height:100%;object-fit:cover;object-position:center 30%;border-radius:50%;overflow:hidden}
        .about-team-name{max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;font-weight:700;text-align:center;line-height:1.25;color:#ecfdf5}
        .about-team-skeleton{width:clamp(80px,7.4vw,104px);height:clamp(80px,7.4vw,104px);flex:0 0 auto;border-radius:50%;background:linear-gradient(110deg,rgba(167,243,208,.08),rgba(16,185,129,.22),rgba(167,243,208,.08));background-size:200% 100%;animation:aboutTeamShimmer 1.3s ease infinite}
        .about-team-strip-arrow{position:absolute;top:45%;z-index:5;display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;border:1px solid rgba(167,243,208,.45);background:rgba(2,44,34,.92);color:#d1fae5;box-shadow:0 5px 16px rgba(0,0,0,.28);backdrop-filter:blur(8px);cursor:pointer;transform:translateY(-50%);transition:transform .2s ease,background .2s ease,opacity .2s ease}
        .about-team-strip-arrow--prev{left:2px}
        .about-team-strip-arrow--next{right:2px}
        .about-team-strip-arrow:hover:not(:disabled){transform:translateY(-50%) scale(1.06);background:#047857;color:#fff}
        .about-team-strip-arrow:disabled{opacity:.35;cursor:not-allowed}
        .about-team-strip-arrow:focus-visible{outline:2px solid #a7f3d0;outline-offset:3px}
        @keyframes aboutTeamBorderSpin{to{transform:rotate(360deg)}}
        @keyframes aboutTeamPortraitBounce{0%{transform:scale(1)}35%{transform:scale(1.14)}65%{transform:scale(.96)}100%{transform:scale(1.03)}}
        @keyframes aboutTeamShimmer{to{background-position:-200% 0}}
        @media(max-width:767px){.about-team-strip{padding:16px 12px 18px}.about-team-strip-inner{display:block}.about-team-strip-copy{width:auto;display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 2px 10px}.about-team-strip-eyebrow{display:none}.about-team-strip-title{font-size:17px}.about-team-strip-link{margin:0;white-space:nowrap}.about-team-strip-viewport{mask-image:linear-gradient(90deg,transparent,#000 2%,#000 98%,transparent);-webkit-mask-image:linear-gradient(90deg,transparent,#000 2%,#000 98%,transparent)}.about-team-strip-track{gap:15px;padding:4px 3px 8px}.about-team-strip-viewport.has-overflow .about-team-strip-track{padding-left:3px;padding-right:3px}.about-team-person{width:76px}.about-team-portrait-shell{width:76px;height:76px}.about-team-name{font-size:10px;max-width:76px}.about-team-strip-arrow{display:none}}
        @media(prefers-reduced-motion:reduce){.about-team-portrait-shell::before,.about-team-person.is-opening .about-team-portrait-shell,.about-team-skeleton{animation:none}.about-team-strip-track{scroll-behavior:auto}}
      `}</style>
      <div className="about-team-strip-inner">
        <div className="about-team-strip-copy">
          <div>
            <p className="about-team-strip-eyebrow"><FiUsers size={12}/> The people behind the journey</p>
            <h2 className="about-team-strip-title">Meet our team</h2>
          </div>
          <a className="about-team-strip-link" href="/team" onClick={(event) => { event.preventDefault(); navigate('/team'); }}>View all <FiArrowRight size={13}/></a>
        </div>
        <div ref={viewportRef} className={"about-team-strip-viewport" + (hasOverflow ? " has-overflow" : "")} role="region" aria-label="Team portraits">
          <div className="about-team-strip-track" ref={trackRef} aria-label="Team members. Scroll horizontally to explore and select a portrait to view the full team.">
            {loading && Array.from({length:6},(_,i)=><div key={i} className="about-team-skeleton" aria-hidden="true"/>)}
            {repeated.map((member,index)=>(
              <a className={openingMember === member.id ? "about-team-person is-opening" : "about-team-person"} href={"/team?member=" + encodeURIComponent(String(member.id)) + "&memberName=" + encodeURIComponent(member.name)} key={String(member.id) + "-" + index} aria-label={"Meet " + member.name + ", " + member.role + ". Open team page"} onClick={(event)=>{event.preventDefault();if(openingMember!==null)return;setOpeningMember(member.id);const destination="/team?member="+encodeURIComponent(String(member.id))+"&memberName="+encodeURIComponent(member.name);openingTimer.current=window.setTimeout(()=>navigate(destination),320);}}>
                <span className="about-team-portrait-shell"><span className="about-team-portrait">
                  {member.image ? <img src={member.image} alt={member.name} loading="lazy" onError={(event)=>{event.currentTarget.style.display='none';}}/> : member.name.trim().split(/\s+/).slice(0,2).map((part)=>part[0]).join('').toUpperCase()}
                </span></span>
                <span className="about-team-name">{member.name}</span>
              </a>
            ))}
          </div>
          {hasOverflow && (
            <>
              <button type="button" className="about-team-strip-arrow about-team-strip-arrow--prev" aria-label="Scroll team members left" title="Previous team members" disabled={!shouldMarquee && !canPrev} onClick={() => scrollRail('prev')}>
                <FiChevronLeft size={19} />
              </button>
              <button type="button" className="about-team-strip-arrow about-team-strip-arrow--next" aria-label="Scroll team members right" title="More team members" disabled={!shouldMarquee && !canNext} onClick={() => scrollRail('next')}>
                <FiChevronRight size={19} />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
