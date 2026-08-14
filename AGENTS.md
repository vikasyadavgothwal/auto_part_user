<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:autoparts-pro-codex-docs -->

## AutoParts Pro App Scope

App: `user_dashboard`  
Role: User dashboard

### Responsibility

Logged-in customer dashboard for bookings, orders, parts, RFQs, vehicles, settings, and user auth.

### Important Folders and Files

- app/(dashboard)/bookings, orders, parts, rfqs, settings, vehicles
- app/api/auth
- `components/dashboard, components/auth, components/vehicle-form.tsx`
- `lib/auth, lib/routes.ts, lib/vehicles.ts`

### Connected Apps and Services

- auto_parts_admin/backend APIs through ADMIN_API_BASE_URL, BACKEND_URL, or NEXT_PUBLIC_ADMIN_API_BASE_URL
- Firebase web authentication
- User orders/RFQs/bookings connected to marketplace and admin flows

### Rules for Working Here

- Read the project root `AGENTS.md` and `docs/` files before cross-app work.
- Keep changes inside `user_dashboard` unless the task explicitly requires another app.
- Do not change API contracts, Prisma schema, auth cookies/JWTs, Firebase config, route base paths, or shared env behavior without listing affected apps first.
- Do not mix public website, admin, user, supplier, garage, and fleet business logic unless existing imports or APIs already connect them.
- Preserve existing Next.js version guidance and local architecture rules.
- Validate every new or changed user-editable input, textarea, select, file upload, and custom input before submission/API calls; trim whitespace, prevent clearly invalid values where practical, show required fields with a red `*`, and use the existing toast/notification system for success and error feedback.

### What Not to Touch Unless Explicitly Required

- Other app folders.
- Package manager files and lockfiles.
- `.env` files and secrets.
- Generated folders such as `.next` and `node_modules`.
- Backend/API or Prisma code outside this app's scope.

### Check After Changes

- Bookings, orders, parts, RFQs, vehicles, settings, and login pages render
- Auth cookies are handled through backend routes
- User flow changes are checked against public site and admin APIs
- Preferred validation: `pnpm lint`, `pnpm exec tsc --noEmit`, and `pnpm build` when relevant.
- Update project root `docs/AI_HANDOFF.md` after major changes.

### App-Specific Boundaries

- Do not add supplier, garage, fleet, admin, plan-management, or custom-role business rules here.
- User dashboard visibility should follow backend-provided identity, ownership, role, permission, and plan information.

### Visual Design Rule

- For any new UI feature (buttons, inputs, selects, modals, tables, cards, and similar controls), use the existing ShadCN UI components and keep spacing, type scale, colors, and interaction patterns aligned with the current app design language.

<!-- END:autoparts-pro-codex-docs -->
