import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { HiInformationCircle, HiMail } from "react-icons/hi";
import "./AuthPages.css";

export default function ResetPassword() {
  return (
    <>
      <Helmet>
        <title>Passwordless Sign In | Altuvera</title>
      </Helmet>
      <div className="auth-page center">
        <div className="reset-card">
          <h1>Passwordless Account</h1>
          <div className="auth-page-message success">
            <HiInformationCircle /> Altuvera uses email verification codes and
            social login instead of passwords.
          </div>
          <p style={{ color: "#475569", lineHeight: 1.7 }}>
            To access your account, open the sign-in modal and continue with
            your email, Google, or GitHub account.
          </p>
          <Link
            to="/"
            className="auth-submit-btn"
            style={{
              marginTop: "1.25rem",
              display: "inline-flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "0.5rem",
              textDecoration: "none",
            }}
          >
            <HiMail /> Return to Sign In
          </Link>
        </div>
      </div>
    </>
  );
}
