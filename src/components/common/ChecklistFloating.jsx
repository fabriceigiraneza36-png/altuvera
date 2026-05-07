import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle } from 'lucide-react';
import PackageChecklist from './PackageChecklist';
import './ChecklistFloating.css';

const ChecklistFloating = () => {
  const [open, setOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const lastScrollY = useRef(
    typeof window !== 'undefined' ? window.scrollY : 0,
  );

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;

      if (delta > 15 && currentScrollY > 100) {
        setIsVisible(true);
      } else if (delta < -15 || currentScrollY < 100) {
        setIsVisible(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Floating Action Button */}
      {isVisible && (
        <button
          className="cf-fab"
          onClick={() => setOpen(true)}
          aria-label="Open checklist"
        >
          <CheckCircle size={18} />
        </button>
      )}

      {/* Modal */}
      {open && (
        <div className="cf-modal" role="dialog" aria-modal="true">
          <div className="cf-overlay" onClick={() => setOpen(false)} />

          <div className="cf-container">
            <div className="cf-header">
              <h3>Travel Checklist</h3>
              <button onClick={() => setOpen(false)} className="cf-close">×</button>
            </div>

            <div className="cf-body">
              <PackageChecklist tourData={{ tourName: 'Your Trip Checklist' }} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChecklistFloating;
