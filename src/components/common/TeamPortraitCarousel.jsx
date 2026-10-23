import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiUsers } from 'react-icons/fi';

const resolveApiBase = () => {
  const raw = (import.meta.env.VITE_API_URL || 'https://backend-jd8f.onrender.com').trim().replace(/\\/+$/, '');
  return /\\/api$/i.test(raw) ? raw : `${raw}/api`;
};
const API_BASE = resolveApiBase();
const assetUrl = (value) => {
  if (!value || typeof value !== 'string') return '';
  if (/^https?:\\/\\//i.test(value) || value.startsWith('data:')) return value;
  const origin = API_BASE.replace(/\\/api$/i, '');
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
  const trackRef = useRef(null);
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
    return () => controller.abort();
  }, []);

  const repeated = useMemo(() => members.length > 1 ? [...members, ...members, ...members] : members, [members]);
  useEffect(() => {
    const track = trackRef.current;
    if (!track || members.length < 2) return undefined;
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
    track.addEventListener('pointerenter', pause);
    track.addEventListener('pointerleave', resume);
    track.addEventListener('focusin', pause);
    track.addEventListener('focusout', resume);
    frame = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(frame);
      track.removeEventListener('pointerenter', pause);
      track.removeEventListener('pointerleave', resume);
      track.removeEventListener('focusin', pause);
      track.removeEventListener('focusout', resume);
    };
  }, [members]);

  if (!loading && members.length === 0) return null;

  return (
    <section className="about-team-strip" aria-label="Meet our team">
      <style>{`
        .about-team-strip{padding:18px clamp(16px,3vw,32px) 22px;background:linear-gradient(180deg,#fff 0%,#f6fdf9 100%);overflow:hidden}
        .about-team-strip-inner{max-width:1200px;margin:0 auto;display:flex;align-items:center;gap:clamp(14px,3vw,34px)}
        .about-team-strip-copy{flex:0 0 auto;max-width:190px}
        .about-team-strip-eyebrow{display:flex;align-items:center;gap:6px;color:#047857;font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;margin:0 0 5px}
        .about-team-strip-title{font:700 clamp(16px,2vw,21px)/1.2 'Playfair Display',Georgia,serif;color:#064e3b;margin:0}
        .about-team-strip-link{display:inline-flex;align-items:center;gap:5px;color:#047857;font-size:11px;font-weight:700;text-decoration:none;margin-top:7px}
        .about-team-strip-link:hover{color:#022c22}
        .about-team-strip-viewport{min-width:0;flex:1;overflow:hidden;mask-image:linear-gradient(90deg,transparent,#000 3%,#000 97%,transparent);-webkit-mask-image:linear-gradient(90deg,transparent,#000 3%,#000 97%,transparent)}
        .about-team-strip-track{display:flex;align-items:flex-start;gap:clamp(12px,2vw,22px);width:max-content;overflow-x:auto;scrollbar-width:none;padding:5px 8px 8px;overscroll-behavior-x:contain;touch-action:pan-x}
        .about-team-strip-track::-webkit-scrollbar{display:none}
        .about-team-person{display:flex;flex:0 0 auto;width:clamp(58px,6vw,76px);flex-direction:column;align-items:center;gap:6px;text-decoration:none;color:#064e3b;outline-offset:4px}
        .about-team-portrait-shell{width:clamp(58px,6vw,76px);height:clamp(58px,6vw,76px);padding:3px;border-radius:50%;background:conic-gradient(from var(--team-angle,0deg),#059669,#a7f3d0,#34d399,#047857,#bbf7d0,#059669);animation:aboutTeamHue 5.5s linear infinite;box-shadow:0 3px 12px #065f461c;transition:transform .25s ease,box-shadow .25s ease}
        .about-team-person:hover .about-team-portrait-shell,.about-team-person:focus-visible .about-team-portrait-shell{transform:translateY(-3px) scale(1.06);box-shadow:0 8px 20px #065f4633}
        .about-team-portrait{width:100%;height:100%;border:2px solid #fff;border-radius:50%;overflow:hidden;background:linear-gradient(135deg,#d1fae5,#ecfdf5);display:grid;place-items:center;color:#047857;font-weight:800;font-size:19px}
        .about-team-portrait img{display:block;width:100%;height:100%;object-fit:cover;object-position:center 30%;border-radius:50%}
        .about-team-name{max-width:86px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px;font-weight:700;text-align:center;line-height:1.2}
        .about-team-skeleton{width:clamp(58px,6vw,76px);height:clamp(58px,6vw,76px);flex:0 0 auto;border-radius:50%;background:linear-gradient(100deg,#e7f7ee,#fff,#d1fae5);background-size:200% 100%;animation:aboutTeamShimmer 1.3s ease infinite}
        @keyframes aboutTeamHue{0%{filter:hue-rotate(0deg)}100%{filter:hue-rotate(360deg)}}
        @keyframes aboutTeamShimmer{to{background-position:-200% 0}}
        @media(max-width:620px){.about-team-strip{padding:14px 12px 16px}.about-team-strip-inner{display:block}.about-team-strip-copy{max-width:none;display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 2px 9px}.about-team-strip-eyebrow{display:none}.about-team-strip-title{font-size:16px}.about-team-strip-link{margin:0;white-space:nowrap}.about-team-strip-track{gap:13px;padding:4px 4px 7px}.about-team-person{width:58px}.about-team-portrait-shell{width:58px;height:58px}.about-team-name{font-size:9px;max-width:60px}}
        @media(prefers-reduced-motion:reduce){.about-team-portrait-shell,.about-team-skeleton{animation:none}.about-team-strip-track{scroll-behavior:auto}}
      `}</style>
      <div className="about-team-strip-inner">
        <div className="about-team-strip-copy">
          <div>
            <p className="about-team-strip-eyebrow"><FiUsers size={12}/> The people behind the journey</p>
            <h2 className="about-team-strip-title">Meet our team</h2>
          </div>
          <a className="about-team-strip-link" href="/team" onClick={(event) => { event.preventDefault(); navigate('/team'); }}>View all <FiArrowRight size={13}/></a>
        </div>
        <div className="about-team-strip-viewport">
          <div className="about-team-strip-track" ref={trackRef} aria-label="Team members, select a portrait to view the full team">
            {loading && Array.from({length:6},(_,i)=><div key={i} className="about-team-skeleton" aria-hidden="true"/>)}
            {repeated.map((member,index)=>(
              <a className="about-team-person" href="/team" key={`${member.id}-${index}`} aria-label={`Meet ${member.name}, ${member.role}. Open team page`} onClick={(event)=>{event.preventDefault();navigate('/team');}}>
                <span className="about-team-portrait-shell"><span className="about-team-portrait">
                  {member.image ? <img src={member.image} alt={member.name} loading="lazy" onError={(event)=>{event.currentTarget.style.display='none';}}/> : member.name.trim().split(/\\s+/).slice(0,2).map((part)=>part[0]).join('').toUpperCase()}
                </span></span>
                <span className="about-team-name">{member.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
