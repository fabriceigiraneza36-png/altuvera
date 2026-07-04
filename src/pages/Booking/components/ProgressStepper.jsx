// src/pages/Booking/components/ProgressStepper.jsx
import React from "react";
import {
  FiMap, FiUsers, FiStar, FiClipboard, FiMail, FiCheck,
} from "react-icons/fi";

/* Map step keys → icons */
const STEP_ICONS = {
  trip:        FiMap,
  travelers:   FiUsers,
  preferences: FiStar,
  review:      FiClipboard,
  contact:     FiMail,
};

const ProgressStepper = ({ steps, currentStep, onStepClick, isMobile }) => (
  <div className="bk-stepper" role="navigation" aria-label="Booking steps">
    {steps.map((step, idx) => {
      const isDone   = idx < currentStep;
      const isActive = idx === currentStep;
      const state    = isDone ? "done" : isActive ? "active" : "pending";
      const StepIcon = STEP_ICONS[step.key] || FiMap;

      return (
        <React.Fragment key={step.id}>
          <button
            className="bk-step"
            onClick={() => onStepClick(idx)}
            aria-current={isActive ? "step" : undefined}
            aria-label={`Step ${idx + 1}: ${step.label}${isDone ? " (completed)" : ""}`}
            title={step.label}
          >
            <div className={`bk-step__bubble bk-step__bubble--${state}`}>
              {isDone
                ? <FiCheck size={16} strokeWidth={2.5} />
                : <StepIcon size={16} strokeWidth={2} />
              }
            </div>

            {/* Desktop: always show label */}
            {!isMobile && (
              <div className="bk-step__label">
                <span className={`bk-step__name bk-step__name--${state}`}>
                  {step.label}
                </span>
                <span className="bk-step__desc">{step.description}</span>
              </div>
            )}

            {/* Mobile: only show active label */}
            {isMobile && isActive && (
              <div className="bk-step__label">
                <span className={`bk-step__name bk-step__name--${state}`}>
                  {step.label}
                </span>
              </div>
            )}
          </button>

          {idx < steps.length - 1 && (
            <div
              className={`bk-step-line bk-step-line--${idx < currentStep ? "done" : "pending"}`}
            />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

export default ProgressStepper;