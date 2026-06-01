# Lyfline CMS (Content Management System)

Welcome to the **Lyfline CMS** repository. This project is a premium, high-fidelity React-based Content Management System designed to administer articles, portal administrators, and overall settings for the Lyfline platform.

It is built on top of a highly modular, scalable **Feature-Sliced Design (FSD)** architecture, utilizing the visual aesthetics and technical stack inspired by the Skyshare Academy CMS, and customized with Lyfline's design scheme.

---

## 🚀 Tech Stack

- **Framework:** React 19 & TypeScript
- **Bundler:** Vite 8
- **Routing:** React Router v7 (with public/private router guards)
- **Styling:** Tailwind CSS v3 & PostCSS
  - Theme matched to `lyfline-client` colors (Primary Blue & Accent Red)
  - Typography powered by Google Fonts: *Plus Jakarta Sans* & *Poppins*
- **Rich Text Editor:** `react-quill`
- **Git Hooks:** `husky` pre-commit validators

---

## 📂 Project Architecture (Feature-Sliced Design)

The directory layout inside `src` follows the FSD-inspired design for high readability and decoupled components:

```bash
src/
├── main.tsx                # Mount and initialization entry
├── app/                    # Global configurations
│   ├── App.tsx             # Routes and guard providers
│   ├── index.css           # Tailwind base styles and custom scrollbar overrides
│   ├── layouts/
│   │   └── CmsLayout.tsx   # Top Navigation & Left Sidebar shell structure
│   └── providers/
│       ├── CmsLoginRoute.tsx  # Auth guard to prevent logged-in users seeing login
│       └── CmsPrivateRoute.tsx # Auth guard to restrict admin panel to authenticated users
├── shared/                 # Reusable utility blocks
│   └── api/
│       └── mockApi.ts      # Persistent local storage mock DB (articles, accounts, auth)
├── widgets/                # Structural layout widgets
│   ├── Navbar.tsx          # Sticky header containing user profile and logout
│   └── Sidebar.tsx         # Active navigation paths matched with permissions
└── pages/                  # Page route components
    ├── login/
    │   └── LoginPage.tsx   # Login page with helper card credentials
    ├── dashboard/
    │   └── DashboardPage.tsx # Stats overview of articles and system counts
    ├── article-management/
    │   └── ArticleManagementPage.tsx # Tabular view and integrated Quill editor
    └── user-management/
        └── UserManagementPage.tsx # Moderator account creator (restricted to Admins)
```

---

## ✨ Features Implemented

1. **Persistent Local Database (`mockApi.ts`):** Operations like creating, editing, and deleting articles or admin accounts will persist across browser reloads using `localStorage`.
2. **Access Control Role-Blocker:** Admins have full administrative capabilities (including adding/deleting administrators), while Editors are completely restricted from viewing or opening the User Management panel.
3. **Interactive rich-text writing:** Direct integration with Quill editor inside the Article creator, with categories (Mental Health, Mindfulness, Relationships, Health, Parenting).
4. **Bypassed Dev Login:** Allows developer testing using *any* credentials. If a new email is entered, it automatically registers them as an **Admin** in the mock DB.

---

## ⚙️ Development Scripts

Run the following commands using **`pnpm`**:

### Run locally (Development Server)
```bash
pnpm run dev
```

### Typecheck & Compile Build (Production Bundle)
```bash
pnpm run build
```

### Linting Checks (ESLint)
```bash
pnpm run lint
```

### Preview compiled build locally
```bash
pnpm run preview
```

---

## 🔒 Pre-commit Git Hook (Husky)

This repository enforces high code standards. A Husky pre-commit hook is active and will automatically execute:
1. `pnpm run lint`
2. `pnpm run build`

If either command fails, the Git commit will be aborted. Make sure your changes compile cleanly before submitting.

---

## 🌐 Netlify Deployment Ready

The project includes a `netlify.toml` which configures build commands and sets up single-page-app redirects to avoid 404s when navigating directly to routes.

- **Build Command:** `pnpm run build`
- **Publish Directory:** `dist`
- **Redirect Rule:** `/*` -> `/index.html` (200)
