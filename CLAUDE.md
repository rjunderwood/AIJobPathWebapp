# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run types` - Run TypeScript type checking
- `npm run format:write` - Format code with Prettier
- `npm run clean` - Run both lint:fix and format:write

### Database
- `npx drizzle-kit push` - Push schema changes to database
- `npx drizzle-kit generate` - Generate migration files
- `npx drizzle-kit migrate` - Run migrations
- `npx bun db/seed` - Seed database
- `npx supabase start` - Start local Supabase instance
- Supabase Studio: http://127.0.0.1:54323/project/default (when local instance running)

### Testing
- `npm run test` - Run all tests (unit + e2e)
- `npm run test:unit` - Run Jest unit tests
- `npm run test:unit -- path/to/test.test.ts` - Run single test file
- `npm run test:e2e` - Run Playwright e2e tests
- `npm run test:e2e -- --ui` - Run Playwright tests with UI mode

### Shadcn UI Components
- `npx shadcn@latest add [component-name]` - Install new Shadcn UI components

## Architecture

This is a Next.js 15 SaaS template using the App Router with clear separation between authenticated and unauthenticated routes.

### Route Structure
- `/app/(unauthenticated)` - Public routes
  - `(marketing)` - Landing pages, pricing, features
  - `(auth)` - Login and signup flows
- `/app/(authenticated)` - Protected routes requiring Clerk auth
  - `dashboard` - Main application with account, billing, support sections
- `/app/api` - API routes including Stripe webhook handler

### Key Patterns
- **Server Actions** in `/actions` for data mutations (customers, Stripe operations)
- **Database Schema** in `/db/schema` using Drizzle ORM with PostgreSQL
- **UI Components** in `/components/ui` from Shadcn UI library
- **Authentication** handled by Supabase middleware with protected route groups
- **Payments** integrated via Stripe with webhook handling

### Data Flow
1. Authentication state managed by Supabase (`@supabase/ssr`)
2. Customer data stored in PostgreSQL via Drizzle ORM
3. Stripe integration for subscription management
4. Server actions handle all data mutations with proper auth checks

### Environment Variables Required
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `NEXT_PUBLIC_STRIPE_PAYMENT_LINK_YEARLY` - Stripe yearly payment link
- `NEXT_PUBLIC_STRIPE_PAYMENT_LINK_MONTHLY` - Stripe monthly payment link
- `DATABASE_URL` - PostgreSQL connection string