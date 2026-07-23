This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Install dependencies and run the development server with pnpm:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3002/user_dashboard](http://localhost:3002/user_dashboard)
with your browser to see the result.

## Authentication configuration

The dashboard exchanges a Firebase ID token for backend access and refresh
tokens. The backend tokens remain in HttpOnly cookies and are never stored in
browser storage.

Configure these values for the dashboard runtime:

```bash
ADMIN_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_VAPID_KEY=
NEXT_PUBLIC_MAIN_WEBSITE_URL=https://websitedesignersdubai.ae
```

Links back to the main marketplace use `NEXT_PUBLIC_MAIN_WEBSITE_URL`, then
`NEXT_PUBLIC_SITE_URL`. If neither is configured, dashboard links remain
same-origin so server render and client hydration use the same URL.

Use the same Firebase web application values as `auto-parts-pro-user`. If the
Firebase values are omitted, login falls back to backend-managed email and
password accounts.

Firebase push notifications require `NEXT_PUBLIC_FIREBASE_VAPID_KEY` plus the
Firebase web config above. The dashboard registers the browser token only after
login and browser notification permission.

User RFQs support CSV, XLSX, and XLS imports with exactly five columns: `VIN
No`, `Quantity`, `Target Price`, `Part Number`, and `Part Name`. Mixed VIN files are
grouped into one RFQ per vehicle. Vehicle creation uses a VIN-first lookup that
checks the shared database cache before 17VIN and allows manual entry when the
VIN cannot be resolved.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

<!-- BEGIN:autoparts-pro-codex-docs -->

## AutoParts Pro App Notes

### App Purpose

Logged-in customer dashboard for bookings, orders, parts, RFQs, vehicles, settings, and user auth.

### Important Folders

- app/(dashboard)/bookings, orders, parts, rfqs, settings, vehicles
- app/api/auth
- `components/dashboard, components/auth, components/vehicle-form.tsx`
- `lib/auth, lib/routes.ts, lib/vehicles.ts`

### Environment Variables

Detected or documented variables:

- `ADMIN_API_BASE_URL`
- `BACKEND_URL`
- `NEXT_PUBLIC_ADMIN_API_BASE_URL`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_VAPID_KEY`
- `NEXT_PUBLIC_BASE_PATH`

### Run, Build, and Test Commands

Install:

```bash
pnpm install
```

Detected scripts:

- `pnpm dev`
- `pnpm build`
- `pnpm start`
- `pnpm lint`

Runtime note: dev/start use port 3002.

### Connected Apps and Services

- auto_parts_admin/backend APIs through ADMIN_API_BASE_URL, BACKEND_URL, or NEXT_PUBLIC_ADMIN_API_BASE_URL
- Firebase web authentication
- User orders/RFQs/bookings connected to marketplace and admin flows

### Common Checks Before Deployment

- Bookings, orders, parts, RFQs, vehicles, settings, and login pages render
- Auth cookies are handled through backend routes
- User flow changes are checked against public site and admin APIs
- Run lint/build for this app before deployment.
- Re-check affected API, auth, database, and env contracts in connected apps.

<!-- END:autoparts-pro-codex-docs -->
