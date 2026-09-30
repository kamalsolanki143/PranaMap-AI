# PranaMap AI — Firebase Authentication Architecture & Integration Guide

## 1. Authentication Overview

PranaMap AI integrates **Firebase Authentication** using the official modular Firebase Web SDK v10+ (`firebase/app` and `firebase/auth`). 

### Core Architectural Decisions
1. **Modular Web SDK Only**: All legacy namespaced Firebase patterns (`firebase.auth()...`) are completely banned in favor of tree-shakable modular functions (`signInWithEmailAndPassword`, `signInWithPopup`, `onAuthStateChanged`, etc.).
2. **Single Source of Truth**: Authentication state is derived strictly from Firebase's real-time `onAuthStateChanged()` listener within `AuthContext.tsx`. There is no duplicated auth state in localStorage or sessionStorage.
3. **Route Protection via `AuthGuard`**: Protected routes are dynamically guarded. Unauthenticated requests are immediately routed to `/login`, while authenticated requests are seamlessly permitted. A GovTech skeleton loader displays while the session state resolves.
4. **Resilient Public Fallback / Mock Mode**: When Firebase credentials are not yet linked or offline in local test environments, the system falls back gracefully to a non-blocking mock provider so tests and local builds never crash.

---

## 2. Directory Structure & File Map

```
frontend/
├── src/
│   ├── lib/
│   │   ├── firebase.ts          # Firebase App and Auth initialization with fallback
│   │   └── auth.ts              # Auth action helpers & humanized error message translation
│   ├── context/
│   │   └── AuthContext.tsx      # React Context providing user, loading, and auth methods
│   ├── hooks/
│   │   └── useAuth.ts           # Convenience hook to consume AuthContext
│   ├── components/
│   │   └── auth/
│   │       ├── LoginForm.tsx        # Reusable Login form with validation & Google sign-in
│   │       ├── SignupForm.tsx       # Reusable Registration form with role & org fields
│   │       ├── GoogleSignInButton.tsx # Standalone Google OAuth popup button
│   │       ├── ProtectedRoute.tsx   # Route wrapper redirecting unauthenticated users
│   │       ├── AuthGuard.tsx        # Dashboard layout route guard
│   │       ├── AuthLoading.tsx      # GovTech credential resolution skeleton
│   │       └── index.ts             # Barrel export
│   └── app/
│       ├── login/page.tsx           # Light GovTech split-screen login
│       ├── signup/page.tsx          # Registration with validation & role preparation
│       └── forgot-password/page.tsx # Password reset recovery flow
```

---

## 3. Supported Authentication Providers

### A. Email & Password
- **Registration**: `registerWithEmail(email, password, displayName)`
  - Creates the user in Firebase Auth.
  - Updates profile with the officer's full name.
  - Enforces minimum 6-character Firebase password requirement.
- **Login**: `loginWithEmail(email, password)`
  - Authenticates against Firebase Auth.
  - Persists session in `browserLocalPersistence`.
- **Password Reset**: `sendResetPassword(email)`
  - Triggers Firebase's standard password recovery email.
- **Sign Out**: `logoutUser()`
  - Explicitly terminates session with `signOut(auth)`.

### B. Google Sign-In
- **Provider**: `new GoogleAuthProvider()`
- **Method**: `signInWithPopup(auth, googleProvider)`
- **Graceful Error Handling**: Automatically intercepts popup cancellation (`auth/popup-closed-by-user`) and popup blocking without displaying raw stack traces.

---

## 4. Human-Readable Error Mapping

Raw internal Firebase error codes are translated into clear, actionable messages:

| Firebase Code | Translated User-Facing Message |
| :--- | :--- |
| `auth/invalid-email` | "The email address format is invalid. Please check and try again." |
| `auth/user-disabled` | "This officer account has been disabled. Contact your administrator." |
| `auth/user-not-found` | "No account found matching this email address." |
| `auth/wrong-password` | "Incorrect password. Please verify your credentials." |
| `auth/invalid-credential` | "Invalid email or password. Please verify your credentials." |
| `auth/email-already-in-use` | "An account with this email address already exists. Please sign in." |
| `auth/weak-password` | "Password is too weak. Please use at least 6 characters." |
| `auth/popup-closed-by-user` | "Sign-in cancelled. The Google sign-in window was closed." |
| `auth/popup-blocked` | "Google sign-in popup was blocked by your browser. Please allow popups." |
| `auth/network-request-failed` | "Network error. Please verify your internet connection and try again." |
| `auth/too-many-requests` | "Access temporarily disabled due to too many failed attempts. Try again later." |

---

## 5. Protected vs Public Routes

### Public Routes
These routes do not require an active session:
- `/` (Public Landing & National Overview)
- `/login`
- `/signup`
- `/forgot-password`
- `/about`
- `/methodology`
- `/data-provenance`

### Authenticated Routes
These routes are protected by `AuthGuard` in `(dashboard)/layout.tsx`. If an unauthenticated user attempts access, they are redirected to `/login`:
- `/dashboard` / `/command-center`
- `/analytics` / `/air-quality`
- `/forecast`
- `/attribution`
- `/enforcement` / `/interventions`
- `/advisory` / `/advisories`
- `/cities` / `/india-network`
- `/data-sources`
- `/settings`

---

## 6. Environment Variables & Security Isolation

All Firebase Web configuration values are client-safe variables:

```bash
# Frontend environment variables (.env.local)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=pranamap-ai.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=pranamap-ai
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=pranamap-ai.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcdef...
```

### Security Boundary
> [!IMPORTANT]
> - **Public vs Private**: Firebase Web config values are client identifiers and **never** grant backend administrative rights.
> - **No Secrets on Frontend**: Gemini server keys, Google Cloud Service Account JSON keys, and Firebase Admin credentials must NEVER be placed in `NEXT_PUBLIC_*` variables or imported into frontend bundles.

---

## 7. Future Role-Based Access Control (RBAC) Architecture

PranaMap AI is architecture-ready for multi-tier governance:
- **`ADMIN`**: National and state environment ministries (CPCB/MoEFCC). Full system configuration, station telemetry override, user role assignment.
- **`CITY_AUTHORITY`**: Municipal Commissioners & Transport Dept. Issue emergency traffic diversions, trigger road-dust suppression squads.
- **`ENVIRONMENT_OFFICER`**: Regional Pollution Control Officers (SPCB). Issue public advisories, review CAAQMS station telemetry.
- **`VIEWER`**: Citizens, researchers, NGOs. Read-only access to transparent truth tiers.

### Authorization Enforcement Rule
Roles must **never** be stored in client-editable `localStorage` or trusted from frontend state. When backend authorization is fully linked to FastAPI:
1. The frontend retrieves the current user's Firebase ID Token via `user.getIdToken()`.
2. The frontend sends `Authorization: Bearer <ID_TOKEN>` in request headers to FastAPI.
3. The FastAPI backend verifies the token using the `firebase-admin` Python SDK and decodes custom claims:
   ```python
   decoded_token = auth.verify_id_token(id_token)
   user_role = decoded_token.get("role", "VIEWER")
   ```

---

## 8. Required Firebase Console Setup Steps

To deploy this project to a live Firebase production environment:
1. Navigate to the [Firebase Console](https://console.firebase.google.com/).
2. Select or create project **PranaMap AI**.
3. Under **Build &rarr; Authentication &rarr; Sign-in method**:
   - Enable **Email/Password** provider (Email link passwordless sign-in optional).
   - Enable **Google** provider and configure support email.
4. Under **Authentication &rarr; Settings &rarr; Authorized domains**:
   - Add your production domain (e.g. `pranamap.gov.in`, `pranamap-ai.web.app`, `pranamap.vercel.app`).
   - Ensure `localhost` is listed for local development.
5. Under **Project Settings &rarr; General &rarr; Your apps**:
   - Create a Web App (`PranaMap-AI-Web`).
   - Copy the configuration values into your hosting environment or `.env.local`.
