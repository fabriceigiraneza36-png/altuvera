// src/pages/Booking/BookingRouter.jsx
/**
 * BookingRouter — maps URL steps to wizard steps.
 * /booking            → redirect to /booking/trip
 * /booking/trip       → step 0
 * /booking/travelers  → step 1
 * /booking/review     → step 2
 * /booking/contact    → step 3
 * /booking/success    → success screen
 */
import React, { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import BookingWizard from "./BookingWizard";

export const STEP_ROUTES = [
  { path: "trip",      step: 0, label: "Trip Details" },
  { path: "travelers", step: 1, label: "Travelers"    },
  { path: "review",    step: 2, label: "Review"       },
  { path: "contact",   step: 3, label: "Contact"      },
];

export const stepToPath = (step) => STEP_ROUTES[step]?.path ?? "trip";
export const pathToStep = (path) =>
  STEP_ROUTES.find((r) => r.path === path)?.step ?? 0;

const BookingRouter = () => (
  <Routes>
    <Route index element={<Navigate to="trip" replace />} />
    <Route path=":stepSlug"  element={<BookingWizard />} />
    <Route path="success"    element={<BookingWizard successMode />} />
    <Route path="*"          element={<Navigate to="trip" replace />} />
  </Routes>
);

export default BookingRouter;