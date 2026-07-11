// src/pages/Booking/BookingRouter.jsx — FIXED
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import BookingWizard from "./BookingWizard";

export const STEP_ROUTES = [
  { path: "trip",      step: 0, label: "Trip Details" },
  { path: "travelers", step: 1, label: "Travelers"    },
  { path: "review",    step: 2, label: "Review"       },
  { path: "contact",   step: 3, label: "Contact"      },
];

export const stepToPath = (step) => {
  const found = STEP_ROUTES.find((r) => r.step === step);
  return found ? found.path : "trip";
};

export const pathToStep = (slug) => {
  const found = STEP_ROUTES.find((r) => r.path === slug);
  return found ? found.step : 0;
};

const BookingRouter = () => (
  <Routes>
    <Route index element={<Navigate to="trip" replace />} />
    <Route path="trip"      element={<BookingWizard />} />
    <Route path="travelers" element={<BookingWizard />} />
    <Route path="review"    element={<BookingWizard />} />
    <Route path="contact"   element={<BookingWizard />} />
    <Route path="success"   element={<BookingWizard successMode />} />
    <Route path="*"         element={<Navigate to="trip" replace />} />
  </Routes>
);

export default BookingRouter;