# Lyfline CMS (Content Management System)

Welcome to the **Lyfline CMS** repository. This project is a premium, high-fidelity React-based Content Management System designed to administer articles, doctors, partners, promotions, and portal administrators for the Lyfline platform.

It is built on top of a highly modular, scalable **Feature-Sliced Design (FSD)** architecture, connected to a **Supabase** backend for real data persistence, and is fully **mobile-responsive** for on-the-go administration.

---

## 🚀 Tech Stack

| Category | Technology |
|---|---|
| **Framework** | React 19 & TypeScript |
| **Bundler** | Vite 8 |
| **Routing** | React Router v7 (with public/private route guards) |
| **Styling** | Tailwind CSS v4 & PostCSS |
| **Backend / DB** | Supabase (PostgreSQL via `@supabase/supabase-js`) |
| **HTTP Client** | Axios |
| **Password Hashing** | `bcryptjs` |
| **Rich Text Editor** | `react-quill-new` |
| **HTML Parser** | `html-react-parser` |
| **Icons** | `react-icons` |
| **Typography** | Google Fonts — *Plus Jakarta Sans* & *Poppins* |
| **Git Hooks** | Husky (pre-commit lint + build validation) |
| **Deployment** | Netlify (`netlify.toml` SPA redirect config) |

---

## 📂 Project Architecture (Feature-Sliced Design)

```bash
src/
├── main.tsx                        # Mount and initialization entry point
├── supabaseClient.tsx              # Supabase client singleton (reads from .env.local)
├── app/
│   ├── App.tsx                     # Global route tree with lazy-loaded pages
│   ├── index.css                   # Tailwind base styles & custom scrollbar overrides
│   ├── layouts/
│   │   └── CmsLayout.tsx           # Top Navbar + Left Sidebar shell (responsive)
│   └── providers/
│       ├── CmsLoginRoute.tsx       # Auth guard — redirects logged-in users by role
│       └── CmsPrivateRoute.tsx     # Auth guard — restricts panel to authenticated users
├── shared/
│   └── api/
│       ├── mockApi.ts              # Legacy localStorage mock DB (articles, accounts, auth)
│       ├── auth.ts                 # Supabase auth helpers (login, logout, current user)
│       ├── article.ts              # Supabase CRUD helpers for articles
│       ├── doctor.ts               # Supabase CRUD helpers for doctors
│       ├── partner.ts              # Supabase CRUD helpers for partners
│       ├── articles/               # Article-specific API modules
│       ├── doctors/                # Doctor-specific API modules
│       ├── partners/               # Partner-specific API modules
│       ├── promo/                  # Promo-specific API modules
│       └── user/                   # User-specific API modules
├── widgets/
│   ├── Navbar.tsx                  # Sticky header with logout notification & mobile drawer
│   └── Sidebar.tsx                 # Role-aware navigation (desktop + mobile drawer)
├── component/
│   ├── articleEditor.tsx           # Quill-based rich text editor wrapper
│   ├── badge.tsx                   # Status badge component
│   ├── button.tsx                  # Reusable button (primary, secondary, danger variants)
│   ├── descriptionBox.tsx          # Styled text area component
│   ├── dropdown.tsx                # Searchable dropdown with color swatch support
│   ├── inputbox.tsx                # Labeled text / number input field
│   ├── notification.tsx            # Toast notification (success, error, info)
│   ├── pagination.tsx              # Page-based pagination control
│   ├── uploadFile.tsx              # Drag-and-drop file uploader with preview
│   └── modal/
│       ├── deleteConfirmation.tsx  # Danger-confirmation modal
│       ├── googlaMapsPreview.tsx   # Google Maps embed preview modal
│       └── manageUser.tsx          # Add/Edit user account modal
└── pages/
    ├── login/
    │   └── LoginPage.tsx           # Login with password show/hide & role-based redirect
    ├── dashboard/
    │   └── DashboardPage.tsx       # Stats overview (articles, doctors, partners, promos)
    ├── article-management/
    │   ├── ArticleManagementPage.tsx   # Article listing with search, filter, pagination
    │   └── manageArticleForm.tsx       # Article create/edit with Quill editor & category
    ├── user-management/
    │   └── UserManagementPage.tsx      # CMS account manager (super_admin only)
    ├── promo-management/
    │   └── promoManagementPage.tsx     # Promotion listing, add/edit/delete
    ├── partners-management/
    │   ├── partnersManagementPage.tsx  # Partner listing with search & filter
    │   └── managePartnersForm.tsx      # Partner create/edit with map preview
    └── doctor-management/
        ├── doctorManagementPage.tsx    # Doctor listing with search & filter
        └── manageDoctorsForm.tsx       # Doctor create/edit (specialties, qualifications, languages)
```

---

## 🔑 Role-Based Access Control

The CMS implements **three user roles** with strictly enforced navigation guards:

| Role | Default Landing Page | Access |
|---|---|---|
| `super_admin` | `/cms/users` (User Management) | Full access to all modules including User Management |
| `admin` | `/cms/promo` (Promo Management) | Access to Article, Doctor, Partners, Promo modules — **no** User Management |
| *(future roles)* | — | Extendable via `CmsLoginRoute` and `Sidebar` permission checks |

> **How it works:** After login, `CmsLoginRoute` reads the stored user object from `localStorage` and redirects by role. `super_admin` goes to `/cms/users`; any other authenticated user goes to `/cms/promo`. The Sidebar conditionally hides the **User Management** link for non-`super_admin` users.

---

## ✨ Features Implemented

### 🗄️ Data & Backend
- **Supabase Integration:** Real persistent data via Supabase (PostgreSQL). All CRUD operations for articles, doctors, partners, users, and promos call the Supabase client directly.
- **Legacy Mock API:** `mockApi.ts` is preserved as a `localStorage`-based fallback reference for offline development.
- **Password Hashing:** User passwords are hashed with `bcryptjs` before being stored.

### 🔐 Authentication
- **Login with password visibility toggle** — show/hide icon on the password field.
- **Auth Guards:** `CmsPrivateRoute` blocks unauthenticated access; `CmsLoginRoute` prevents logged-in users from seeing the login page.
- **Role-based auto-redirect** on login (see table above).
- **Logout notification** — a success toast is displayed after the user successfully logs out.

### 📰 Article Management (`/cms/article`)
- Full article list with **search** and **category filter**.
- **Create / Edit** articles with a Quill rich-text editor.
- **Category color-coded** badges (Mental Health, Mindfulness, Relationships, Health, Parenting).
- **Publish / Draft** status toggling.
- Pagination support.

### 👤 User Management (`/cms/users`) — super_admin only
- View all CMS accounts in a sortable table.
- **Add / Edit / Delete** admin accounts via a modal.
- Delete confirmation modal with danger styling.
- Role is displayed as a styled badge.

### 🏷️ Promo Management (`/cms/promo`)
- List all promotions with title, dates, and status.
- **Add / Edit / Delete** promos.
- Accessible to `admin` and `super_admin`.

### 🤝 Partners Management (`/cms/partners`)
- List healthcare partners with location, status, and category.
- **Add / Edit** partner forms including:
  - Drag-and-drop image upload.
  - **Google Maps embed preview** modal.
- Filter by status or type.

### 🩺 Doctor Management (`/cms/doctors`)
- List doctors with specialty, status, and associated partner.
- **Add / Edit** doctor profiles:
  - Dynamic lists for **Specialties**, **Qualifications**, and **Languages** (add/remove items inline).
  - Photo upload with preview.
- Filter by status or specialty.

### 📊 Dashboard (`/cms/dashboard`)
- At-a-glance statistics: total articles, doctors, partners, and promos.
- Designed as the first visual overview for `super_admin` users.

---

## 📱 Mobile Responsiveness

The entire CMS is built to be fully usable on **mobile devices**:

| Feature | Implementation |
|---|---|
| **Sidebar** | Hidden on mobile; opened via a hamburger (☰) button in the Navbar |
| **Navigation drawer** | Full-height overlay with user profile anchored at the bottom |
| **Tables** | Wrapped in `overflow-x-auto` containers for horizontal scrolling on small screens |
| **Action buttons** ("Add Doctor", etc.) | Full-width (`w-full`) on mobile |
| **Filter inputs** | Full-width on mobile |
| **Category color dropdown** | Full-width on mobile (Article Editor) |
| **Dynamic "+" buttons** (Doctor form) | Stack below their label text, full-width on mobile |
| **Logout button** | Retains its standard size on mobile (not reduced) |
| **Modals** | Constrained with `max-w-*` to fit within mobile viewports |
| **Article editor toolbar** | Proper bottom margin to prevent overlap with content on mobile |

---

## 🧩 Reusable Components

| Component | Description |
|---|---|
| `Button` | Primary, secondary, and danger variants with loading state |
| `InputBox` | Labeled input with optional icon, error state, and full-width support |
| `Dropdown` | Searchable select with optional color swatches; supports `containerClassName` override |
| `DescriptionBox` | Multi-line textarea with label and character hints |
| `Badge` | Status chips (active, inactive, draft, published) with color coding |
| `Pagination` | Previous/Next + page number controls |
| `UploadFile` | Drag-and-drop uploader with image/file preview and Supabase storage upload |
| `ArticleEditor` | Quill rich text editor with custom toolbar integration |
| `Notification` | Auto-dismissing toast (success / error / info) |
| `DeleteConfirmation` | Reusable danger modal requiring explicit confirmation |
| `ManageUser` | Full add/edit modal for CMS user accounts |
| `GoogleMapsPreview` | Embedded map preview from a URL/embed code |

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

## 🔧 Environment Variables

Create a `.env.local` file in the project root with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

These are consumed by `src/supabaseClient.tsx` to initialize the Supabase client. **Never commit `.env.local` to version control** (it is already included in `.gitignore`).

---

## 🔒 Pre-commit Git Hook (Husky)

This repository enforces high code standards. A Husky pre-commit hook is active and will automatically execute:
1. `pnpm run lint`
2. `pnpm run build`

If either command fails, the Git commit will be aborted. Make sure your changes compile cleanly before committing.

---

## 🌐 Netlify Deployment

The project includes a `netlify.toml` which configures build commands and sets up single-page-app redirects to avoid 404s when navigating directly to routes.

- **Build Command:** `pnpm run build`
- **Publish Directory:** `dist`
- **Redirect Rule:** `/*` → `/index.html` (200)

---

## 🗺️ Route Map

| Path | Page | Access |
|---|---|---|
| `/cms` | Login Page | Public (redirects if logged in) |
| `/cms/dashboard` | Dashboard | Authenticated |
| `/cms/article` | Article List | Authenticated |
| `/cms/article/add` | New Article Form | Authenticated |
| `/cms/article/edit/:id` | Edit Article Form | Authenticated |
| `/cms/users` | User Management | `super_admin` only |
| `/cms/promo` | Promo Management | Authenticated |
| `/cms/partners` | Partners List | Authenticated |
| `/cms/partners/add` | New Partner Form | Authenticated |
| `/cms/partners/edit/:id` | Edit Partner Form | Authenticated |
| `/cms/doctors` | Doctor List | Authenticated |
| `/cms/doctors/add` | New Doctor Form | Authenticated |
| `/cms/doctors/edit/:id` | Edit Doctor Form | Authenticated |
