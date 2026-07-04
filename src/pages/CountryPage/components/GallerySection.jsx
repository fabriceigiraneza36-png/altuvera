// src/pages/CountryPage/components/GallerySection.jsx
import React, { useEffect, useState } from "react";
import { FiCamera, FiArrowLeft, FiArrowRight, FiX, FiMaximize2 } from "react-icons/fi";
import AnimatedSection from "../../../components/common/AnimatedSection";
import SectionTitle from "./SectionTitle";

export default function GallerySection({ country, gallery }) {
  const [lb, setLb] = useState({ open: false, idx: 0 });
  const open = (i) => { setLb({ open: true, idx: i }); document.body.style.overflow = "hidden"; };
  const close = () => { setLb({ open: false, idx: 0 }); document.body.style.overflow = ""; };
  const prev = (e) => { e?.stopPropagation(); setLb(p => ({ ...p, idx: (p.idx - 1 + gallery.length) % gallery.length })); };
  const next = (e) => { e?.stopPropagation(); setLb(p => ({ ...p, idx: (p.idx + 1) % gallery.length })); };

  useEffect(() => {
    if (!lb.open) return;
    const h = (e) => { if (e.key === "Escape") close(); if (e.key === "ArrowLeft") prev(); if (e.key === "ArrowRight") next(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [lb.open]);

  if (!gallery.length) return null;
  return (
    <section className="cpx-sec cpx-sec--soft">
      <div className="cpx-wrap">
        <AnimatedSection animation="fadeInUp">
          <SectionTitle icon={<FiCamera size={13} />} label="Gallery" center
            sub={`A visual journey through the beauty of ${country.name}`}>Photo Gallery</SectionTitle>
        </AnimatedSection>
        <AnimatedSection animation="fadeInUp" delay={0.1}>
          <div className="cpx-gallery">
            {gallery.map((src, i) => (
              <div key={i} className={`cpx-gallery-item ${i === 0 ? "cpx-gallery-item--hero" : ""}`}
                onClick={() => open(i)} role="button" tabIndex={0}
                onKeyDown={e => e.key === "Enter" && open(i)}>
                <img src={src} alt={`${country.name} ${i + 1}`} loading="lazy"
                  onError={e => { e.currentTarget.closest(".cpx-gallery-item").style.display = "none"; }} />
                <div className="cpx-gallery-item__ov">
                  <span className="cpx-gallery-item__label">{country.name} · {String(i + 1).padStart(2, "0")}</span>
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
      {lb.open && (
        <div className="cpx-lb" onClick={close}>
          <div className="cpx-lb__bg" />
          <button className="cpx-lb__close" onClick={close}><FiX size={20} /></button>
          <div className="cpx-lb__stage" onClick={e => e.stopPropagation()}>
            <img src={gallery[lb.idx]} alt={`${country.name} ${lb.idx + 1}`} className="cpx-lb__img" />
          </div>
          {gallery.length > 1 && (
            <>
              <button className="cpx-lb__arrow cpx-lb__arrow--prev" onClick={prev}><FiArrowLeft size={22} /></button>
              <button className="cpx-lb__arrow cpx-lb__arrow--next" onClick={next}><FiArrowRight size={22} /></button>
              <div className="cpx-lb__footer" onClick={e => e.stopPropagation()}>
                <div className="cpx-lb__thumbs">
                  {gallery.slice(0, 14).map((img, i) => (
                    <button key={i} className={`cpx-lb__thumb ${lb.idx === i ? "active" : ""}`}
                      onClick={() => setLb(p => ({ ...p, idx: i }))}><img src={img} alt="" /></button>
                  ))}
                </div>
                <span className="cpx-lb__counter">{lb.idx + 1} / {gallery.length}</span>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}