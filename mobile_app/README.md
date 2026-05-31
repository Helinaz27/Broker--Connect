# DigitalBroker Mobile App

React Native mobile app built with Expo SDK 54 — browse houses, cars & other services, real-time chat, KYC, coins, and admin dashboard.

---

## Requirements

- Node.js 18+
- Expo Go (SDK 54) on your Android phone
- Phone and laptop on the same Wi-Fi
- Backend server running on port `5000`

---

## Setup & Run

**1. Clone the repo**

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

**2. Set your backend IP**

Open `constants/api.ts` and update:

```ts
export const API_BASE_URL = "http://YOUR_IP:5000/api";
```

Find your IP: `hostname -I | awk '{print $1}'` (Linux/Mac) or `ipconfig` (Windows)

**3. Update `app.json`** — make sure these exist:

```json
"newArchEnabled": false,
"android": { "usesCleartextTraffic": true }
```

**4. Install dependencies**

```bash
npm install --legacy-peer-deps
```

**5. Start backend** (separate terminal)

```bash
cd server && npm run dev
```

**6. Start Expo**

```bash
npx expo start --clear
```

**7. Open on phone**

- Open Expo Go → Scan QR code from terminal

---

## Common Errors

| Error                               | Fix                                                    |
| ----------------------------------- | ------------------------------------------------------ |
| `TurboModuleRegistry` crash         | Add `"newArchEnabled": false` to `app.json`            |
| `Project incompatible with Expo Go` | Update Expo Go to SDK 54 from Play Store               |
| `Network request failed`            | Check IP in `constants/api.ts`, same Wi-Fi             |
| `ERESOLVE` on install               | `rm -rf node_modules package-lock.json` then reinstall |
| `TypeError: fetch failed`           | Safe to ignore — doesn't affect the app                |

---

## Screens

| Area      | Screens                                             |
| --------- | --------------------------------------------------- |
| Auth      | Login, Register, Forgot Password                    |
| Browse    | Home, Houses, Cars, Services, Detail pages          |
| Features  | Chat, Notifications, KYC, Coins, Favorites, Profile |
| Dashboard | My Listings, Create Listing (client)                |
| Admin     | Manage Users, KYC Approvals, Fee Management         |

> Admin screens are role-based — only visible to users with the `admin` role.
