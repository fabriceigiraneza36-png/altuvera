// src/pages/Booking/components/ProgressStepper.jsx
import React from "react";

const ProgressStepper = ({ steps, currentStep, onStepClick, isMobile }) => (
  <div className="bk-stepper" role="navigation" aria-label="Booking steps">
    {steps.map((step, idx) => {
      const isDone = idx < currentStep;
      const isActive = idx === currentStep;
      const state = isDone ? "done" : isActive ? "active" : "pending";

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
              {isDone ? "✓" : step.icon}
            </div>
            {!isMobile && (
              <div className="bk-step__label">
                <span className={`bk-step__name bk-step__name--${state}`}>
                  {step.label}
                </span>
                <span className="bk-step__desc">{step.description}</span>
              </div>
            )}
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