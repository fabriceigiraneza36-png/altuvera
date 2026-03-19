import React, { useEffect, useState } from 'react';
import PackageChecklist from './PackageChecklist';
import './ChecklistFloating.css';

const ChecklistFloating = ({
  triggerSelector = '[data-download-trigger]',
  threshold = 0.1,
} = {}) => {
  const [triggerVisible, setTriggerVisible] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let observer;

    const observeTrigger = () => {
      const trigger = document.querySelector(triggerSelector);
      if (!trigger) return false;

      observer = new IntersectionObserver(
        ([entry]) => setTriggerVisible(entry.isIntersecting),
        { threshold },
      );

      observer.observe(trigger);
      return true;
    };

    if (!observeTrigger()) {
      const id = setInterval(() => {
        if (observeTrigger()) clearInterval(id);
      }, 250);
      return () => clearInterval(id);
    }

    return () => observer?.disconnect();
  }, [triggerSelector, threshold]);

  return (
    <>
      <button
        className={`cf-button ${triggerVisible ? 'cf-visible' : ''}`}
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
