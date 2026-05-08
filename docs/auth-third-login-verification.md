# Third Login Verification Feature

## Overview

To enhance account security, Altuvera requires users to verify their email address on every **3rd login** (cumulative). This verification is performed via a one-time password (OTP) sent to the user's registered email. The feature tracks logout state and login attempts across sessions.

---

## How It Works

### Tracking State

- **Login Counter**: Stored in `localStorage` under key `altuvera_login_counter`.
  - Increments after each successful login verification.
  - Persists across logouts and browser sessions.
  - Does **not** reset on logout; only resets after a successful re-verification (i.e., after the 3rd-login verification completes).

- **Logout Timestamp**: Stored in `localStorage` under key `altuvera_last_logout`.
  - Updated every time the user logs out (including session expiration).
  - Used for session analytics and potential future security rules.

### Verification Flow

1. **First & Second Logins**: Standard email OTP flow. Counter becomes `1` then `2`.
2. **Third Login Attempt** (`loginCounter >= 2`):
   - The system detects the threshold and immediately sends a verification code to the user's email.
   - The authentication modal switches to the verification view (green-white themed, fully responsive).
   - The user enters the 6-digit code.
   - Upon successful verification:
     - Login counter resets to `0`.
     - User is securely logged in and receives a confirmation.
3. **Subsequent Logins**: The cycle repeats — counter increments from `0` through `2` again, and the next (3rd) login triggers re-verification.

This mechanism also applies to social logins (Google/GitHub) when the user has reached the threshold.

---

## Frontend Implementation

### Key Changes in `UserAuthContext.jsx`

#### 1. Logout Tracking

```javascript
const clearAuth = useCallback(() => {
  store.clearAuth();
  setToken(null);
  setUser(null);
  setGoogleUser(null);
  pendingRef.current = null;
  // Clear re-verification state
  setRequiresLoginVerification(false);
  setPendingSocialAuth(null);
  // Track logout timestamp for session analytics
  try {
    localStorage.setItem(KEYS.LAST_LOGOUT, Date.now().toString());
  } catch {
    /* storage unavailable */
  }
}, []);
```

- Removed resetting of `loginCounter` on logout.
- Added `LAST_LOGOUT` timestamp write.
- Preserves the login counter across logouts.

#### 2. Login Counter Check for Email Login

```javascript
const login = useCallback(
  async (payload) => {
    // ...
    const currentCount = loginCounter;
    if (currentCount >= 2) {
      setPendingEmail(email);
      setRequiresLoginVerification(true);
      // Send verification code
      try {
        await authFetch("/users/login", {
          method: "POST",
          body: JSON.stringify({ email }),
        });
      } catch {
        /* ignore — user can resend */
      }
      setModalView("verify");
      return { requiresVerification: true };
    }
    // Normal flow continues...
  },
  [authFetch, loginCounter, setSessionPreference],
);
```

- Threshold changed from `>= 3` to `>= 2` to trigger on the 3rd attempt.
- Sends the OTP immediately before showing verification modal.

#### 3. Social Logins (Google & GitHub)

Updated the same threshold:

```javascript
// Google
if (loginCounter >= 2 && userEmail) { ... }

// GitHub
if (loginCounter >= 2 && userEmail) { ... }
```

#### 4. Verification Completion

```javascript
const verifyCode = useCallback(async (email, code) => {
  // ...
  const data = await authFetch("/users/verify-code", { ... });

  // Re-verification flow (after 2+ logins)
  if (requiresLoginVerification) {
    if (pendingSocialAuth) {
      saveAuth(pendingSocialAuth, { persist: persistSession });
    } else {
      saveAuth(data, { persist: persistSession });
    }
    setLoginCounter(0); // Reset counter
    setRequiresLoginVerification(false);
    setPendingSocialAuth(null);
    setPendingEmail("");
    closeModal();
    // Show congratulations...
    return data;
  }

  // Normal flow: increment counter
  saveAuth(data, { persist: persistSession });
  setPendingEmail("");
  closeModal();
  setLoginCounter(prev => prev + 1);
  // Show congratulations...
  return data;
}, [/* dependencies */]);
```

- Handles both social and email re-verification in a single block.
- Resets the counter after successful verification on the 3rd login.
- Normal logins still increment the counter.

### Modal & Styling

- The verification UI is the standard **AuthModal** with `modalView="verify"`.
- The modal follows the Altuvera green & white theme:
  - Primary green (`#059669`) accents.
  - White backgrounds, clean typography.
  - Fully responsive across mobile and desktop.
- CSS classes: `.auth-view--verify`, `.auth-view-icon--verify`, `.auth-code-group`, etc.
- See `src/components/auth/AuthModal.jsx` and `AuthModal.css`.

---

## API Endpoints Used

| Method | Endpoint               | Description                            |
| ------ | ---------------------- | -------------------------------------- |
| POST   | `/users/login`         | Sends a verification code to the email |
| POST   | `/users/verify-code`   | Verifies the OTP and completes login   |
| POST   | `/users/resend-code`   | Resends the OTP                        |
| POST   | `/users/check-email`   | Checks whether an email is registered  |
| POST   | `/users/google`        | Google OAuth exchange                  |
| POST   | `/users/github`        | GitHub OAuth exchange                  |
| POST   | `/users/logout`        | Invalidates the current session        |
| GET    | `/users/me`            | Fetches the current user profile       |
| PUT    | `/users/profile`       | Updates user profile fields            |
| POST   | `/uploads/image`       | Uploads avatar image                   |
| POST   | `/users/refresh-token` | Refreshes an expired access token      |

Only the first four are directly used during the verification flow.

---

## Local Storage Keys

| Key                        | Type   | Purpose                                   |
| -------------------------- | ------ | ----------------------------------------- |
| `altuvera_auth_token`      | string | JWT access token                          |
| `altuvera_refresh_token`   | string | Refresh token                             |
| `altuvera_login_counter`   | number | Cumulative successful login count         |
| `altuvera_last_logout`     | number | Timestamp of the last logout (ms)         |
| `altuvera_persist_session` | bool   | Whether to persist session across reloads |

---

## Notes & Edge Cases

- **Network errors during code sending**: The system still shows the verification modal even if the `/users/login` call fails; user can use "Resend Code".
- **Session expiration**: Triggers `clearAuth` which also writes `LAST_LOGOUT`.
- **Counter persistence**: Counter survives page reloads and browser restarts; only resets on explicit re-verification.
- **Multiple devices**: Counter is per-browser (localStorage). If a user logs in from a new device, the counter will start from `0` on that device unless they restore storage. Server-side tracking is not implemented.

---

## Testing Guidelines

1. Clear localStorage to start fresh.
2. Perform a login → counter becomes `1`.
3. Logout → `LAST_LOGOUT` set, counter stays `1`.
4. Login again → counter becomes `2`.
5. Logout → `LAST_LOGOUT` updated.
6. Third login → verification modal appears automatically.
7. Enter correct OTP → login succeeds, counter resets to `0`.
8. Repeat cycle: after two more logins, verification triggers again.

---

_Document version: 1.0 — Last updated: 2026-05-08_
