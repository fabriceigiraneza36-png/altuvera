import React, { useEffect, useState } from 'react';
import PackageChecklist from './PackageChecklist';
import './ChecklistFloating.css';

const ChecklistFloating = () => {
  const [footerVisible, setFooterVisible] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let obs;
    const tryObserve = () => {
      const footer = document.querySelector('footer');
      if (!footer) return false;
      obs = new IntersectionObserver(
        ([entry]) => setFooterVisible(entry.isIntersecting),
        { threshold: 0 }
      );
      obs.observe(footer);
      return true;
    };

    // attempt immediately, otherwise poll until footer mounts
    if (!tryObserve()) {
      const id = setInterval(() => {
        if (tryObserve()) clearInterval(id);
      }, 250);
      return () => clearInterval(id);
    }

    return () => obs && obs.disconnect();
  }, []);

  return (
    <>
      <button
        className={`cf-button ${footerVisible ? 'cf-visible' : ''}`}
        onClick={() => setOpen(true)}
        aria-label="Open checklist"
        title="Open packing checklist"
      >
        Checklist
      </button>

      {open && (
        <div className="cf-modal" role="dialog" aria-modal="true">
          <div className="cf-modal__bg" onClick={() => setOpen(false)} />
          <div className="cf-modal__content">
            <button className="cf-close" onClick={() => setOpen(false)} aria-label="Close checklist">×</button>
            <div className="cf-modal__body">
              <PackageChecklist tourData={{ tourName: 'Your Trip Checklist' }} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChecklistFloating;
