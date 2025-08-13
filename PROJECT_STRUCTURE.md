# AIJobPath Project Structure Documentation

This document provides a comprehensive overview of the AIJobPath web application's structure and architecture, including detailed explanations of each file and component.

## Project Overview

AIJobPath is a production-ready Next.js 15 SaaS template featuring:
- **Frontend**: Next.js 15 with App Router, React 19, Tailwind CSS 4, Shadcn UI, Framer Motion
- **Backend**: PostgreSQL (via Supabase), Drizzle ORM, Server Actions
- **Authentication**: Supabase Auth (replacing Clerk)
- **Payments**: Stripe subscriptions with webhook handling
- **Development**: TypeScript, ESLint, Prettier, Jest, Playwright

## Directory Tree with Descriptions

```
/AIJobPathWebapp/
├── actions/                      # Server actions for data mutations
│   ├── auth.ts                   # Authentication operations
│   ├── customers.ts              # Customer data CRUD operations
│   └── stripe.ts                 # Stripe payment operations
│
├── app/                          # Next.js 15 App Router
│   ├── (authenticated)/          # Protected routes (requires auth)
│   │   └── dashboard/            # Main application dashboard
│   ├── (unauthenticated)/        # Public routes
│   │   ├── (marketing)/          # Marketing pages
│   │   └── confirmation/         # Email confirmation
│   ├── api/                      # API route handlers
│   ├── auth/                     # Auth callback routes
│   └── [core files]              # Layout, globals, etc.
│
├── components/                   # Reusable components
│   ├── icons/                    # Icon components
│   ├── payments/                 # Payment-related components
│   ├── providers/                # React context providers
│   ├── ui/                       # Shadcn UI components
│   └── utility/                  # Utility components
│
├── db/                           # Database configuration
│   ├── migrations/               # Drizzle migrations
│   ├── schema/                   # Database schemas
│   └── seed/                     # Database seeding
│
├── lib/                          # Utility libraries
│   ├── supabase/                 # Supabase utilities
│   ├── stripe.ts                 # Stripe configuration
│   └── utils.ts                  # General utilities
│
└── [config files]                # Configuration files
```

## Core Components Documentation

### Server Actions (`/actions/`)

#### `auth.ts` - Authentication Operations
- **`signIn(formData)`**: Email/password authentication
  - Validates credentials with Supabase
  - Redirects to dashboard on success
  - Returns error messages on failure
  
- **`signUp(formData)`**: New user registration
  - Creates Supabase auth user with metadata (first/last name)
  - Automatically creates customer record
  - Redirects to dashboard after signup
  
- **`signOut()`**: User logout
  - Clears Supabase session
  - Redirects to home page
  
- **`signInWithGoogle()`**: OAuth authentication
  - Initiates Google OAuth flow
  - Handles callback at `/auth/callback`

#### `customers.ts` - Customer Management
- **`getCustomerByUserId(userId)`**: Fetch customer by auth user ID
- **`getBillingDataByUserId(userId)`**: Get comprehensive billing info
- **`createCustomer(userId)`**: Create new customer with "free" membership
- **`updateCustomerByUserId(userId, updates)`**: Update by user ID
- **`updateCustomerByStripeCustomerId(stripeCustomerId, updates)`**: Update by Stripe ID

#### `stripe.ts` - Payment Operations
- **`updateStripeCustomer(userId, subscriptionId, customerId)`**: Link Stripe customer to user
- **`manageSubscriptionStatusChange(subscriptionId, customerId, productId)`**: Update membership based on subscription
- **`createCheckoutUrl(paymentLinkUrl)`**: Generate checkout URL with user reference

### Database Schema (`/db/`)

#### Configuration
- **`index.ts`**: Drizzle ORM setup with PostgreSQL
- **`drizzle.config.ts`**: Migration and schema configuration

#### Customers Table (`schema/customers.ts`)
```sql
Table: customers
- id: UUID (primary key)
- userId: TEXT (unique, links to Supabase auth)
- membership: ENUM ('free', 'pro')
- stripeCustomerId: TEXT (unique, nullable)
- stripeSubscriptionId: TEXT (unique, nullable)
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
```

### Authentication System (`/lib/supabase/`)

#### Core Files
- **`server.ts`**: Server-side Supabase client with cookie handling
- **`client.ts`**: Browser-side Supabase client
- **`auth.ts`**: Authentication utilities (currentUser, auth, signOut)
- **`hooks.ts`**: Client-side auth hooks
- **`supabase-provider.tsx`**: React context for auth state

#### Middleware (`/middleware.ts`)
- Protects `/dashboard/*` routes
- Checks authentication via Supabase
- Redirects to `/login` if unauthenticated

### UI Components (`/components/`)

#### Shadcn UI Components (`/ui/`)
- **`avatar.tsx`**: User avatar display
- **`button.tsx`**: Styled button component
- **`dropdown-menu.tsx`**: Dropdown menu system
- **`sidebar.tsx`**: Application sidebar
- **`sheet.tsx`**: Mobile drawer/sheet
- **`skeleton.tsx`**: Loading skeletons
- **`sonner.tsx`**: Toast notifications
- **Other UI components**: Badge, breadcrumb, collapsible, input, label, separator, textarea, tooltip

#### Payment Components (`/payments/`)
- **`checkout-redirect.tsx`**: Handles Stripe checkout redirects
- **`pricing-button.tsx`**: CTA button for pricing
- **`redirect-toast.tsx`**: Payment redirect notifications

### Application Routes (`/app/`)

#### Authenticated Routes (`/(authenticated)/dashboard/`)
- **Main Dashboard**: Overview page
- **Account**: User profile management (Clerk UserProfile component)
- **Billing**: Subscription management
- **Support**: Help and support section

Dashboard Components:
- **`app-sidebar.tsx`**: Main navigation sidebar
- **`nav-main.tsx`**: Primary navigation items
- **`nav-user.tsx`**: User dropdown menu
- **`team-switcher.tsx`**: Team/workspace selector
- **`layout-client.tsx`**: Client-side layout wrapper

#### Marketing Routes (`/(unauthenticated)/(marketing)/`)
- **Landing Page**: Hero, features, pricing, FAQ sections
- **About**: Company information
- **Contact**: Contact form
- **Features**: Detailed feature showcase
- **Pricing**: Pricing plans and comparison

Marketing Components:
- **`header.tsx`**: Site header with navigation
- **`footer.tsx`**: Site footer
- **`site-banner.tsx`**: Announcement banner
- **Sections**: Hero, features, pricing, FAQ, social proof, CTA, video

#### Authentication Routes (`/(auth)/`)
- **`/login`**: Clerk SignIn component
- **`/signup`**: Clerk SignUp component
- **`/auth/callback`**: OAuth callback handler

### API Routes (`/app/api/`)

#### Stripe Webhook (`/stripe/webhooks/route.ts`)
Handles Stripe events:
- `checkout.session.completed`: Links Stripe customer to user
- `customer.subscription.created/updated`: Updates membership status

### Utilities and Hooks

#### Custom Hooks (`/hooks/`)
- **`use-local-storage.ts`**: Persistent local storage with SSR support
- **`use-mobile.ts`**: Mobile device detection

#### Utilities (`/lib/`)
- **`stripe.ts`**: Stripe SDK configuration
- **`utils.ts`**: cn() function for className merging

### Configuration Files

#### Development
- **`package.json`**: Dependencies and scripts
- **`tsconfig.json`**: TypeScript configuration
- **`next.config.ts`**: Next.js configuration
- **`tailwind.config.ts`**: Tailwind CSS setup
- **`eslint.config.mjs`**: ESLint rules
- **`prettier.config.cjs`**: Code formatting

#### Build Tools
- **`drizzle.config.ts`**: Database migration config
- **`components.json`**: Shadcn UI configuration
- **`postcss.config.mjs`**: PostCSS setup

#### Environment Variables
```env
# Database
DATABASE_URL=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_YEARLY=
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_MONTHLY=

# Site
NEXT_PUBLIC_SITE_URL=
```

## Development Commands

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run types` - TypeScript type checking
- `npm run format:write` - Format with Prettier
- `npm run clean` - Run lint:fix + format:write

### Database
- `npx drizzle-kit push` - Push schema changes
- `npx drizzle-kit generate` - Generate migrations
- `npx drizzle-kit migrate` - Run migrations
- `npx bun db/seed` - Seed database
- `npx supabase start` - Start local Supabase

### Testing
- `npm run test` - Run all tests
- `npm run test:unit` - Jest unit tests
- `npm run test:e2e` - Playwright E2E tests

## Architecture Patterns

### Route Organization
- **Route Groups**: `(authenticated)` and `(unauthenticated)` for clear separation
- **Parallel Routes**: Marketing pages organized under `(pages)`
- **Dynamic Routes**: `[[...param]]` for Clerk components

### Data Flow
1. **Authentication**: Supabase Auth → Middleware → Protected routes
2. **Customer Data**: Auth user → Customer record → Stripe integration
3. **Payments**: Checkout → Webhook → Customer update → Access control

### Component Architecture
- **Server Components**: Default for all pages
- **Client Components**: Used for interactivity (marked with "use client")
- **Server Actions**: All data mutations handled server-side

### State Management
- **Auth State**: Managed by SupabaseProvider context
- **UI State**: Local component state and URL params
- **Data Fetching**: Server components + server actions

This architecture provides a scalable, type-safe foundation for building SaaS applications with modern Next.js patterns and best practices.