import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  HiArrowLeft,
  HiArrowRight,
  HiCheck,
  HiLockClosed,
  HiMail,
  HiPhone,
  HiPhotograph,
  HiRefresh,
  HiSparkles,
  HiUser,
  HiX,
} from "react-icons/hi";
import { useUserAuth } from "../../context/UserAuthContext";
import "./AuthModal.css";

const AVATAR_UPLOAD_URL = import.meta.env.VITE_AVATAR_UPLOAD_URL || "";
const CODE_VALIDITY_MINUTES = 10;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+\d][\d\s\-()]{6,}$/;
const ROLE_OPTIONS = [
  { value: "user", label: "Traveler" },
  { value: "photographer", label: "Photographer" },
  { value: "planner", label: "Travel Planner" },
];

const emptyCode = () => ["", "", "", "", "", ""];

const utf8ToBase64 = (value) => {
  const encoded = encodeURIComponent(value).replace(
    /%([0-9A-F]{2})/g,
    (_, hex) => String.fromCharCode(Number.parseInt(hex, 16))
  );
  return window.btoa(encoded);
};

const getInitials = (value = "") => {
  const parts = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase());

  if (parts.length > 0) return parts.join("");
  return "U";
};

const buildInitialAvatar = (nameOrEmail) => {
  const initials = getInitials(nameOrEmail);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" rx="20" fill="#059669"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="Poppins, Arial" font-size="44" fill="#ffffff">${initials}</text></svg>`;
  return `data:image/svg+xml;base64,${utf8ToBase64(svg)}`;
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Unable to read selected image."));
    reader.readAsDataURL(file);
  });

export default function AuthModal() {
  const {
    isModalOpen,
    modalView,
    setModalView,
    closeModal,
    login,
    register,
    verifyCode,
    resendCode,
    pendingEmail,
    persistSession,
    setSessionPreference,
  } = useUserAuth();

  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    phone: "",
    bio: "",
    role: "user",
    keepSignedIn: persistSession,
    avatarFile: null,
    avatarPreview: "",
  });
  const [signInStep, setSignInStep] = useState(1);
  const [signUpStep, setSignUpStep] = useState(1);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [code, setCode] = useState(emptyCode());
  const [resendTimer, setResendTimer] = useState(0);
  const [verifySource, setVerifySource] = useState("login");

  const previousTitleRef = useRef(document.title);
  const wasOpenRef = useRef(false);
  const codeRefs = useRef([]);

  const isLogin = modalView === "login";
  const isRegister = modalView === "register";
  const isVerify = modalView === "verify";

  const activeEmail = (pendingEmail || formData.email || "").trim();

  const isEmailValid = EMAIL_REGEX.test(formData.email.trim());
  const isNameValid = formData.fullName.trim().length >= 2;
  const isPhoneValid =
    !formData.phone.trim() || PHONE_REGEX.test(formData.phone.trim());
  const isBioValid = formData.bio.trim().length <= 300;

  const titleByView = useMemo(
    () => ({
      login: "Sign In | Altuvera",
      register: "Sign Up | Altuvera",
      verify: "Verify Email | Altuvera",
    }),
    []
  );

  useEffect(() => {
    if (isModalOpen && !wasOpenRef.current) {
      previousTitleRef.current = document.title;
    }

    if (isModalOpen) {
      document.title = titleByView[modalView] || "Account | Altuvera";
    } else if (wasOpenRef.current) {
      document.title = previousTitleRef.current;
    }

    wasOpenRef.current = isModalOpen;
  }, [isModalOpen, modalView, titleByView]);

  useEffect(() => {
    if (!isModalOpen) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") closeModal();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeModal, isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) return;

    setError("");
    setSuccess("");
    setCode(emptyCode());
    setResendTimer(0);

    if (isLogin) setSignInStep(1);
    if (isRegister) setSignUpStep(1);

    setFormData((prev) => ({ ...prev, keepSignedIn: persistSession }));
  }, [isLogin, isModalOpen, isRegister, persistSession]);

  useEffect(() => {
    if (resendTimer <= 0) return;

    const timer = window.setInterval(() => {
      setResendTimer((previous) => Math.max(0, previous - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendTimer]);

  const updateField = (field, value) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
    setError("");
  };

  const switchView = (view) => {
    if (loading) return;

    setModalView(view);
    setError("");
    setSuccess("");
    setCode(emptyCode());
    if (view === "login") setSignInStep(1);
    if (view === "register") setSignUpStep(1);
  };

  const handleAvatarFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setError("Image size must be 4MB or less.");
      return;
    }

    try {
      const preview = await readFileAsDataUrl(file);
      setFormData((previous) => ({
        ...previous,
        avatarFile: file,
        avatarPreview: preview,
      }));
      setError("");
    } catch {
      setError("Unable to preview this image. Please try another file.");
    }
  };

  const resolveAvatarValue = async () => {
    const fallback =
      formData.avatarPreview || buildInitialAvatar(formData.fullName || formData.email);

    if (!formData.avatarFile || !AVATAR_UPLOAD_URL) {
      return fallback;
    }

    setAvatarUploading(true);
    try {
      const payload = new FormData();
      payload.append("avatar", formData.avatarFile);

      const response = await fetch(AVATAR_UPLOAD_URL, {
        method: "POST",
        body: payload,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Avatar upload endpoint is not available right now.");
      }

      const result = await response.json();
      const uploadedAvatar =
        result?.data?.avatar ||
        result?.data?.url ||
        result?.avatar ||
        result?.url ||
        "";

      if (!uploadedAvatar) {
        throw new Error("Avatar upload response did not include an avatar URL.");
      }

      return uploadedAvatar;
    } catch {
      setSuccess(
        "Avatar upload route is not configured yet. Using a local placeholder avatar."
      );
      return fallback;
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSignInNext = () => {
    if (!isEmailValid) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    setSignInStep(2);
  };

  const handleSignInSubmit = async (event) => {
    event.preventDefault();

    if (!isEmailValid || !isNameValid) {
      setError("Please complete your email and full name.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");
      setVerifySource("login");
      setSessionPreference(formData.keepSignedIn);

      await login({
        email: formData.email.trim(),
        fullName: formData.fullName.trim(),
        persistSession: formData.keepSignedIn,
      });

      setSuccess(
        `Verification code sent. It remains valid for ${CODE_VALIDITY_MINUTES} minutes.`
      );
      setCode(emptyCode());
    } catch (submitError) {
      setError(submitError.message || "Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const goToSignUpNextStep = () => {
    if (signUpStep === 1) {
      if (!isEmailValid || !isNameValid) {
        setError("Please add your full name and a valid email.");
        return;
      }

      setError("");
      setSignUpStep(2);
      return;
    }

    if (!isPhoneValid) {
      setError("Phone format looks invalid. Please check it.");
      return;
    }

    if (!isBioValid) {
      setError("Bio must be 300 characters or less.");
      return;
    }

    setError("");
    setSignUpStep(3);
  };

  const handleSignUpSubmit = async (event) => {
    event.preventDefault();

    if (!agreeTerms) {
      setError("Please accept the terms to continue.");
      return;
    }

    if (!isEmailValid || !isNameValid || !isPhoneValid || !isBioValid) {
      setError("Please review the form and fix highlighted details.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");
      setVerifySource("register");
      setSessionPreference(formData.keepSignedIn);

      const avatar = await resolveAvatarValue();

      await register({
        email: formData.email.trim(),
        fullName: formData.fullName.trim(),
        full_name: formData.fullName.trim(),
        phone: formData.phone.trim(),
        bio: formData.bio.trim(),
        role: formData.role,
        avatar,
        persistSession: formData.keepSignedIn,
      });

      setSuccess(
        `Account created. Verification code sent and valid for ${CODE_VALIDITY_MINUTES} minutes.`
      );
      setCode(emptyCode());
    } catch (submitError) {
      setError(submitError.message || "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (index, nextValue) => {
    if (!/^[0-9]?$/.test(nextValue)) return;

    const nextCode = [...code];
    nextCode[index] = nextValue;
    setCode(nextCode);
    setError("");

    if (nextValue && index < codeRefs.current.length - 1) {
      codeRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index, event) => {
    if (event.key === "Backspace" && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (event) => {
    event.preventDefault();

    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pasted) return;

    const nextCode = emptyCode();
    pasted.split("").forEach((digit, index) => {
      nextCode[index] = digit;
    });

    setCode(nextCode);
    const nextFocusIndex = Math.min(pasted.length, 5);
    codeRefs.current[nextFocusIndex]?.focus();
  };

  const handleVerifySubmit = async (event) => {
    event.preventDefault();

    if (!activeEmail) {
      setError("Missing email. Please restart sign in/sign up.");
      return;
    }

    if (code.join("").length !== 6) {
      setError("Enter the full 6-digit verification code.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await verifyCode(activeEmail, code.join("").replace(/\D/g, "").slice(0, 6));
    } catch (verifyError) {
      setError(verifyError.message || "Verification failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!activeEmail || resendTimer > 0 || loading) return;

    try {
      setLoading(true);
      setError("");
      await resendCode(activeEmail);
      setSuccess(
        `A fresh code has been sent. Valid for ${CODE_VALIDITY_MINUTES} minutes from now.`
      );
      setResendTimer(60);
      setCode(emptyCode());
      codeRefs.current[0]?.focus();
    } catch (resendError) {
      setError(resendError.message || "Unable to resend code right now.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackFromVerify = () => {
    setCode(emptyCode());
    setError("");
    setSuccess("");
    setModalView(verifySource);
  };

  if (!isModalOpen) return null;

  return (
    <div
      className="auth-modal-overlay"
      onClick={closeModal}
      role="presentation"
    >
      <div
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="auth-modal-header">
          <div className="auth-modal-brand">
            <span className="auth-brand-icon">A</span>
            <span className="auth-brand-text">Altuvera</span>
          </div>

          <button className="auth-close-btn" onClick={closeModal} aria-label="Close">
            <HiX />
          </button>
        </div>

        {!isVerify && (
          <div className="auth-modal-tabs" role="tablist" aria-label="Auth mode">
            <button
              type="button"
              className={`auth-tab ${isLogin ? "auth-tab--active" : ""}`}
              onClick={() => switchView("login")}
              role="tab"
              aria-selected={isLogin}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab ${isRegister ? "auth-tab--active" : ""}`}
              onClick={() => switchView("register")}
              role="tab"
              aria-selected={isRegister}
            >
              Sign Up
            </button>
          </div>
        )}

        <div className="auth-modal-content">
          {error && <div className="auth-message auth-message--error">{error}</div>}
          {success && (
            <div className="auth-message auth-message--success">
              <HiCheck />
              <span>{success}</span>
            </div>
          )}

          {isLogin && (
            <div className={`auth-view auth-view--login auth-view--step-${signInStep}`}>
              <div className="auth-view-header">
                <span className="auth-view-icon auth-view-icon--signin">
                  <HiLockClosed />
                </span>
                <h2 id="auth-modal-title">Welcome Back</h2>
                <p>Secure passwordless sign in in two quick steps.</p>
              </div>

              <div className="auth-steps" aria-label="Sign in progress">
                {[1, 2].map((step) => (
                  <span
                    key={step}
                    className={`auth-step-dot ${signInStep >= step ? "auth-step-dot--active" : ""}`}
                  />
                ))}
              </div>

              {signInStep === 1 && (
                <div className="auth-form auth-form--animated" key="signin-step-1">
                  <label className="auth-field">
                    <span>Email Address</span>
                    <div className="auth-input-wrap">
                      <HiMail />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(event) => updateField("email", event.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                      />
                    </div>
                  </label>

                  <button
                    type="button"
                    className="auth-btn auth-btn--primary"
                    onClick={handleSignInNext}
                  >
                    Continue
                    <HiArrowRight />
                  </button>
                </div>
              )}

              {signInStep === 2 && (
                <form
                  className="auth-form auth-form--animated"
                  key="signin-step-2"
                  onSubmit={handleSignInSubmit}
                >
                  <label className="auth-field">
                    <span>Full Name</span>
                    <div className="auth-input-wrap">
                      <HiUser />
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(event) => updateField("fullName", event.target.value)}
                        placeholder="Your full name"
                        autoComplete="name"
                        required
                      />
                    </div>
                  </label>

                  <label className="auth-checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.keepSignedIn}
                      onChange={(event) =>
                        updateField("keepSignedIn", event.target.checked)
                      }
                    />
                    Keep me signed in on this device
                  </label>
                  <p className="auth-checkbox-help">
                    Session preference controls whether your token is kept in local or session storage.
                  </p>

                  <div className="auth-row">
                    <button
                      type="button"
                      className="auth-btn auth-btn--ghost"
                      onClick={() => setSignInStep(1)}
                    >
                      <HiArrowLeft />
                      Back
                    </button>
                    <button
                      type="submit"
                      className="auth-btn auth-btn--primary"
                      disabled={loading}
                    >
                      {loading ? "Sending..." : "Send Code"}
                    </button>
                  </div>
                </form>
              )}

              <p className="auth-switch-hint">
                New here?
                <button
                  type="button"
                  className="auth-switch-btn"
                  onClick={() => switchView("register")}
                >
                  Create an account
                </button>
              </p>
            </div>
          )}

          {isRegister && (
            <div className={`auth-view auth-view--register auth-view--step-${signUpStep}`}>
              <div className="auth-view-header">
                <span className="auth-view-icon auth-view-icon--signup">
                  <HiSparkles />
                </span>
                <h2 id="auth-modal-title">Create Your Account</h2>
                <p>Three-step onboarding with profile fields mapped to your backend user table.</p>
              </div>

              <div className="auth-steps" aria-label="Sign up progress">
                {[1, 2, 3].map((step) => (
                  <span
                    key={step}
                    className={`auth-step-dot ${signUpStep >= step ? "auth-step-dot--active" : ""}`}
                  />
                ))}
              </div>

              {signUpStep === 1 && (
                <div className="auth-form auth-form--animated" key="signup-step-1">
                  <label className="auth-field">
                    <span>Full Name</span>
                    <div className="auth-input-wrap">
                      <HiUser />
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(event) => updateField("fullName", event.target.value)}
                        placeholder="Traveler name"
                        autoComplete="name"
                        required
                      />
                    </div>
                  </label>

                  <label className="auth-field">
                    <span>Email Address</span>
                    <div className="auth-input-wrap">
                      <HiMail />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(event) => updateField("email", event.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                      />
                    </div>
                  </label>

                  <button
                    type="button"
                    className="auth-btn auth-btn--primary"
                    onClick={goToSignUpNextStep}
                  >
                    Continue
                    <HiArrowRight />
                  </button>
                </div>
              )}

              {signUpStep === 2 && (
                <div className="auth-form auth-form--animated" key="signup-step-2">
                  <label className="auth-field">
                    <span>Phone</span>
                    <div className="auth-input-wrap">
                      <HiPhone />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(event) => updateField("phone", event.target.value)}
                        placeholder="+254 700 000000"
                        autoComplete="tel"
                      />
                    </div>
                  </label>

                  <label className="auth-field">
                    <span>Role</span>
                    <div className="auth-input-wrap auth-input-wrap--select">
                      <select
                        value={formData.role}
                        onChange={(event) => updateField("role", event.target.value)}
                      >
                        {ROLE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </label>

                  <label className="auth-field">
                    <span>Bio</span>
                    <div className="auth-input-wrap auth-input-wrap--textarea">
                      <textarea
                        rows={3}
                        value={formData.bio}
                        onChange={(event) => updateField("bio", event.target.value)}
                        placeholder="Tell us what kind of adventures you love."
                      />
                    </div>
                    <small>{formData.bio.length}/300</small>
                  </label>

                  <div className="auth-row">
                    <button
                      type="button"
                      className="auth-btn auth-btn--ghost"
                      onClick={() => setSignUpStep(1)}
                    >
                      <HiArrowLeft />
                      Back
                    </button>
                    <button
                      type="button"
                      className="auth-btn auth-btn--primary"
                      onClick={goToSignUpNextStep}
                    >
                      Continue
                      <HiArrowRight />
                    </button>
                  </div>
                </div>
              )}

              {signUpStep === 3 && (
                <form
                  className="auth-form auth-form--animated"
                  key="signup-step-3"
                  onSubmit={handleSignUpSubmit}
                >
                  <div className="auth-avatar-block">
                    {formData.avatarPreview ? (
                      <img
                        src={formData.avatarPreview}
                        alt="Avatar preview"
                        className="auth-avatar-preview"
                      />
                    ) : (
                      <div className="auth-avatar-preview auth-avatar-initials">
                        {getInitials(formData.fullName || formData.email)}
                      </div>
                    )}

                    <label className="auth-avatar-upload">
                      <HiPhotograph />
                      <span>Upload Profile Image (Optional)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFileChange}
                      />
                    </label>
                    <small>
                      If upload route is unavailable, we automatically fallback to a placeholder avatar.
                    </small>
                  </div>

                  <label className="auth-checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.keepSignedIn}
                      onChange={(event) =>
                        updateField("keepSignedIn", event.target.checked)
                      }
                    />
                    Keep me signed in on this device
                  </label>

                  <label className="auth-checkbox-label">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(event) => setAgreeTerms(event.target.checked)}
                    />
                    I agree to the terms, privacy policy, and cookie preferences.
                  </label>

                  <div className="auth-row">
                    <button
                      type="button"
                      className="auth-btn auth-btn--ghost"
                      onClick={() => setSignUpStep(2)}
                    >
                      <HiArrowLeft />
                      Back
                    </button>
                    <button
                      type="submit"
                      className="auth-btn auth-btn--primary"
                      disabled={loading || avatarUploading}
                    >
                      {loading || avatarUploading ? "Creating..." : "Create Account"}
                    </button>
                  </div>
                </form>
              )}

              <p className="auth-switch-hint">
                Already have an account?
                <button
                  type="button"
                  className="auth-switch-btn"
                  onClick={() => switchView("login")}
                >
                  Sign in instead
                </button>
              </p>
            </div>
          )}

          {isVerify && (
            <div className="auth-view auth-view--verify auth-view--step-verify">
              <div className="auth-view-header">
                <span className="auth-view-icon auth-view-icon--verify">
                  <HiMail />
                </span>
                <h2 id="auth-modal-title">Verify Your Email</h2>
                <p>Enter the 6-digit code sent to:</p>
                <div className="auth-email-badge">{activeEmail || "No email found"}</div>
                <small className="auth-verify-note">
                  Each code is regenerated and expires in {CODE_VALIDITY_MINUTES} minutes.
                </small>
              </div>

              <form className="auth-form auth-form--animated" onSubmit={handleVerifySubmit}>
                <div className="auth-code-row" onPaste={handleCodePaste}>
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={(element) => {
                        codeRefs.current[index] = element;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(event) => handleCodeChange(index, event.target.value)}
                      onKeyDown={(event) => handleCodeKeyDown(index, event)}
                      className={`auth-code-input ${digit ? "auth-code-input--filled" : ""}`}
                      aria-label={`Code digit ${index + 1}`}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  className="auth-btn auth-btn--primary"
                  disabled={loading || code.join("").length !== 6}
                >
                  {loading ? "Verifying..." : "Verify and Continue"}
                </button>

                <div className="auth-row auth-row--verify">
                  <button
                    type="button"
                    className="auth-btn auth-btn--ghost"
                    onClick={handleBackFromVerify}
                  >
                    <HiArrowLeft />
                    Back
                  </button>

                  <button
                    type="button"
                    className="auth-btn auth-btn--secondary"
                    onClick={handleResend}
                    disabled={resendTimer > 0 || loading}
                  >
                    <HiRefresh />
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
