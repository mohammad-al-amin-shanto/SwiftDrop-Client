# 🚀 SwiftDrop

SwiftDrop is the modern, fast, and intuitive frontend of the SwiftDrop parcel-delivery platform.
It delivers a smooth experience for senders, receivers, and admins, offering parcel creation, tracking, role-based dashboards, analytics charts, authentication, and a guided UI tour.

This repository contains only the frontend (React + Vite).

## 📌 Features

---

## 🔐 Authentication & Authorization

- Email/password login & registration
- Role-based access control (Admin, Sender, Receiver)
- Protected routes using custom <RequireAuth /> and <RequireRole />

---

## 📦 Parcel Management

- Create parcels
- View detailed parcel information
- Cancel or confirm delivery (depending on role)
- Real-time updates via optimized RTK Query API calls

## 📊 Dashboards & Insights

- Sender Dashboard: parcel stats, monthly shipments, distribution pie charts
- Receiver Dashboard: delivery insights, status charts
- Admin Dashboard: oversee all parcels and users

## 🧭 UI Guided Tour (Driver.js)

- First-time onboarding with interactive guided highlights
- Re-launchable from console via window.startSwiftDropTour()

## 🎨 Polished UI/UX

- Fully responsive design
- TailwindCSS styling
- Dark mode support
- Clean reusable components

## 🧰 Tech Stack

| Category |	Tools / Libraries
|----------|--------------------|
| Frontend Framework | React 18 + TypeScript |
| Bundler |	Vite |
| State Management | Redux Toolkit |
| API Layer |	RTK Query |
| Routing |	React Router 6 |
| Styling |	TailwindCSS |
| Forms |	react-hook-form |
| Date Handling |	date-fns |
| Charts | Recharts |
| Guided Tour |	driver.js |
| Icons |	react-icons |
| Notifications |	react-toastify |

---

## 📁 Project Structure

```
src/
 ├─ api/                # RTK Query API slices
 ├─ app/                # Redux store + hooks
 ├─ assets/             # Images, static assets
 ├─ components/         # UI components (auth, parcels, charts, layout, etc.)
 ├─ constants/          # App constants (roles, endpoints)
 ├─ features/           # Redux slices (auth, etc.)
 ├─ hooks/              # Custom hooks
 ├─ lib/                # Utilities, localStorage helpers
 ├─ pages/              # Route-based pages
 ├─ routes/             # App route definitions
 ├─ styles/             # Global styles
 ├─ types/              # TypeScript interfaces
 └─ main.tsx            # App entry

```

## ⚙️ Installation & Setup
### 1️⃣ Clone the repo
```
git clone https://github.com/YOUR_USERNAME/swiftdrop-client.git
cd swiftdrop-client
```
### 2️⃣ Install dependencies
```
npm install
```
### 3️⃣ Configure environment variables
Create a .env file in the root:
```
VITE_API_URL=http://localhost:5000
```
Or whatever backend URL you use.

### 4️⃣ Run the development server
```
npm run dev
```
Runs on:
```
http://localhost:5173
```
### 🏗 Build for Production
```
npm run build
```
The compiled production build will be inside:
```
dist/
```
To preview the production build:
```
npm run preview
```
### 🧪 Scripts Overview
|Command | Description |
|--------|-------------|
| npm run dev |	Start local dev server |
| npm run build |	Create production build |
| npm run preview |	Preview built app |
| npm run lint | Lint with ESLint |
| npm run format | Format with Prettier (if configured) |

---

### 🔐 Authentication Model
Auth is stored in:
- Redux (authSlice)
- LocalStorage (token + user)

Helpers in src/lib/storage.ts keep things synced:
- setToken()
- setUser()
- clearAll()

Protected routes use:
```
<RequireAuth>
  <RequireRole role="sender">
    <SenderDashboard />
  </RequireRole>
</RequireAuth>
```

---

### 🧭 Guided Tour (Driver.js)
Tour launches automatically the first time a user visits the dashboard.

To trigger manually (dev/testing):
```
window.startSwiftDropTour()
```
You must place data attributes on UI elements:
```
<div data-driver-id="parcel-table">
  <ParcelTable />
</div>
```

---

### 📦 API Integration (RTK Query)

All API logic lives in src/api/*.
Example usage:
```
const { data, isLoading } = useParcelsQuery({ senderId });
```

This ensures:
- caching
- auto refetch
- deduplication
- request lifecycle tracking

### 🧱 Code Quality
Included setup:
- TypeScript strict mode
- ESLint + TypeScript rules
- Prettier compatible formatting
- Strong typing across components, hooks, and APIs

### 🤝 Contributing
- Fork the repo
- Create a feature branch
- Commit and push
- Open a pull request

PRs should follow:
- consistent formatting
- TypeScript correctness
- meaningful commit messages

### 📄 License
This project is licensed under the MIT License.

### 👨‍💻 Author
Mohammad Al - Amin
