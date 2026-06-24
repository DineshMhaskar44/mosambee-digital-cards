# Mosambee Digital Business Cards

A production-ready **Next.js 15** application for managing and sharing digital business cards via QR codes, vCards, and public URLs.

---

## Features

- **Admin Panel** — Secure login, full employee CRUD, bulk search & filter
- **Digital Business Card** — Mobile-first public card at `/card/[employee-id]`
- **QR Code System** — Auto-generated on employee creation, downloadable as PNG
- **vCard (.vcf)** — One-click Save Contact for Android & iPhone
- **Analytics Dashboard** — Scans, unique visitors, device/browser breakdown, Excel export
- **Dark Mode** — System-aware with manual toggle
- **Supabase** — Database, Auth, Storage, RLS policies

---

## Tech Stack

| Layer      | Technology                    |
|------------|-------------------------------|
| Framework  | Next.js 15 (App Router)       |
| Language   | TypeScript                    |
| Styling    | Tailwind CSS                  |
| Database   | Supabase (PostgreSQL)         |
| Auth       | Supabase Auth                 |
| Storage    | Supabase Storage              |
| Charts     | Recharts                      |
| Forms      | React Hook Form + Zod         |
| QR         | qrcode (npm)                  |
| Excel      | xlsx (npm)                    |
| Deployment | Vercel                        |

---

## Getting Started

### 1. Clone & Install

```bash
git clone <your-repo-url> mosambee-digital-cards
cd mosambee-digital-cards
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In the **SQL Editor**, paste and run the contents of `supabase/schema.sql`.
3. Create **3 storage buckets** in the Supabase Dashboard → Storage:
   - `profile-photos` — set to **Public**
   - `qr-codes`       — set to **Public**
   - `company-profiles` — set to **Public**
4. For each bucket, add this storage policy (Dashboard → Storage → Policies):
   - **INSERT**: `true` (allow anyone to upload — restrict to authenticated in production)
   - **SELECT**: `true` (public read)
   - **UPDATE/DELETE**: `auth.role() = 'authenticated'`

### 3. Create the First Admin User

1. In Supabase Dashboard → **Authentication → Users**, click **Invite User** and enter an admin email.
2. Set a password via the link in the email.
3. In the **SQL Editor**, run:

```sql
INSERT INTO admins (user_id, full_name, email, role)
VALUES (
  '<paste-the-user-id-from-auth.users>',
  'Super Admin',
  'admin@mosambee.com',
  'super_admin'
);
```

### 4. Configure Environment Variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_COMPANY_NAME=Mosambee
NEXT_PUBLIC_COMPANY_WEBSITE=https://mosambee.com
```

Get the keys from: Supabase Dashboard → Project Settings → API.

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/admin/login`.

---

## Project Structure

```
mosambee-digital-cards/
├── app/
│   ├── admin/
│   │   ├── login/           # Login page
│   │   ├── dashboard/       # Stats overview
│   │   ├── employees/       # Employee list, new, edit
│   │   └── analytics/       # Analytics dashboard
│   ├── card/[employeeId]/   # Public digital business card
│   └── api/
│       ├── employees/       # CRUD + photo + QR routes
│       ├── vcard/[id]/      # vCard (.vcf) download
│       ├── scan/[id]/       # Scan tracking
│       ├── analytics/       # Overview + Excel export
│       └── auth/            # Login / logout
├── components/
│   ├── admin/               # Sidebar, Header, EmployeeForm
│   ├── card/                # BusinessCard, ShareButton
│   ├── analytics/           # AnalyticsDashboard
│   └── ui/                  # ThemeToggle
├── lib/
│   ├── supabase/            # client.ts, server.ts
│   ├── qr.ts                # QR generation & upload
│   ├── vcard.ts             # vCard (.vcf) generation
│   ├── utils.ts             # Helpers
│   └── validations.ts       # Zod schemas
├── types/index.ts           # All TypeScript types
├── middleware.ts            # Auth-protect /admin routes
└── supabase/schema.sql      # Complete DB schema
```

---

## Deployment to Vercel

1. Push the project to GitHub.
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo.
3. Set all environment variables (same as `.env.local` but with production values).
   - Set `NEXT_PUBLIC_APP_URL` to your Vercel domain (e.g. `https://cards.mosambee.com`).
4. Click **Deploy**.

After deploy, update your Supabase project's **Site URL** and **Redirect URLs** in Auth settings to match your Vercel domain.

---

## Public Card URLs

Each employee's card is accessible at:

```
https://your-domain.com/card/MOS-001
```

QR codes automatically point to this URL with `?ref=qr` for tracking.

---

## Sample Employee Data

Run in Supabase SQL Editor after deploying:

```sql
INSERT INTO employees
  (employee_id, full_name, designation, department, mobile_number, email, office_address, company_website, status)
VALUES
  ('MOS-001', 'Rahul Sharma',  'Senior Developer', 'Technology',  '+91-9876543210', 'rahul.sharma@mosambee.com',  '123 Tech Park, Whitefield, Bangalore - 560066', 'https://mosambee.com', 'active'),
  ('MOS-002', 'Priya Patel',   'Product Manager',  'Product',     '+91-9123456789', 'priya.patel@mosambee.com',   '123 Tech Park, Whitefield, Bangalore - 560066', 'https://mosambee.com', 'active'),
  ('MOS-003', 'Amit Singh',    'Sales Executive',  'Sales',       '+91-9988776655', 'amit.singh@mosambee.com',    '123 Tech Park, Whitefield, Bangalore - 560066', 'https://mosambee.com', 'active');
```

Then regenerate QR codes via the admin panel (Edit Employee → QR button).

---

## Environment Variables Reference

| Variable                      | Required | Description                          |
|-------------------------------|----------|--------------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`    | ✅        | Supabase project URL                 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅     | Supabase anon/public key             |
| `SUPABASE_SERVICE_ROLE_KEY`   | ✅        | Service role key (server-only)       |
| `NEXT_PUBLIC_APP_URL`         | ✅        | Full app URL (for QR code links)     |
| `NEXT_PUBLIC_COMPANY_NAME`    | ✅        | Company name shown on cards          |
| `NEXT_PUBLIC_COMPANY_WEBSITE` | Optional | Company website URL                  |

---

## License

Private — © 2024 Mosambee. All rights reserved.
