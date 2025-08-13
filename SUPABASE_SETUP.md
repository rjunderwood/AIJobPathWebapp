# Supabase Project Setup Guide

This guide will walk you through setting up Supabase for this Next.js application, including authentication, database configuration, and environment variables.

## Prerequisites

- Node.js 18.18.0 or higher
- npm or yarn package manager
- A Supabase account (free tier available at [supabase.com](https://supabase.com))

## Quick Start

### 1. Create a Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com) and sign in
2. Click "New Project"
3. Fill in the project details:
   - **Name**: Your project name
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Select the closest region to your users
4. Click "Create Project" and wait for setup to complete

### 2. Get Your Project Credentials

Once your project is created:

1. Go to **Settings** > **API** in your Supabase dashboard
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Connection string** (from Database settings) → `DATABASE_URL`

### 3. Local Development Setup (Optional)

For local development with Supabase CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase instance
npx supabase start
```

When running locally:
- Supabase Studio: http://127.0.0.1:54323/project/default
- API URL: `http://127.0.0.1:54321` (use as NEXT_PUBLIC_SUPABASE_URL)
- anon key: Will be displayed in terminal after `supabase start`

### 4. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Database
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Site URL (for OAuth redirects)
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Change to your production URL when deploying

# Stripe (if using payments)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_YEARLY=your_yearly_payment_link
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_MONTHLY=your_monthly_payment_link
```

### 5. Database Setup

This project uses Drizzle ORM with PostgreSQL. To set up your database:

```bash
# Generate migrations
npm run db:generate

# Push schema to database
npx drizzle-kit push

# (Optional) Seed the database
npm run db:seed
```

### 6. Enable Authentication Providers

#### Email/Password Authentication
1. Go to **Authentication** > **Providers** in Supabase dashboard
2. Ensure **Email** provider is enabled (it's enabled by default)

#### Google OAuth (Optional)
1. Follow the setup guide in `/docs/GOOGLE_OAUTH_SETUP.md`
2. In Supabase: **Authentication** > **Providers** > **Google**
3. Enable and add your Google OAuth credentials

### 7. Configure Authentication Settings

1. Go to **Authentication** > **URL Configuration**
2. Add your site URL to **Site URL**: `http://localhost:3000` (or your production URL)
3. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/dashboard`
   - Your production URLs when deploying

### 8. Row Level Security (RLS)

For production, ensure RLS is enabled on your tables:

1. Go to **Database** > **Tables**
2. For each table, click the three dots menu
3. Enable **RLS** (Row Level Security)
4. Create appropriate policies for your use case

Example policy for the `customers` table:
```sql
-- Users can only read their own customer record
CREATE POLICY "Users can view own customer data" ON customers
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own customer record  
CREATE POLICY "Users can update own customer data" ON customers
  FOR UPDATE USING (auth.uid() = user_id);
```

### 9. Test Your Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Test authentication:
   - Navigate to `/signup` and create an account
   - Check your Supabase dashboard under **Authentication** > **Users**
   - Verify the user appears and customer record is created

## Production Deployment

When deploying to production:

1. Update `NEXT_PUBLIC_SITE_URL` to your production URL
2. Add your production URL to Supabase URL Configuration
3. Update OAuth redirect URLs if using social authentication
4. Ensure all environment variables are set in your hosting platform
5. Enable RLS policies on all tables

## Troubleshooting

### Common Issues

1. **"Invalid API key"**: Double-check your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. **"relation 'customers' does not exist"**: Run `npx drizzle-kit push` to create tables
3. **OAuth redirect errors**: Ensure redirect URLs match exactly in Supabase settings
4. **Connection refused**: Make sure Supabase local instance is running (`npx supabase start`)

### Useful Commands

```bash
# View local Supabase status
npx supabase status

# Stop local Supabase
npx supabase stop

# Reset local database
npx supabase db reset

# View migration status
npx drizzle-kit studio
```

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Next.js Documentation](https://nextjs.org/docs)
- Google OAuth Setup: `/docs/GOOGLE_OAUTH_SETUP.md`

## Security Best Practices

1. Never commit `.env.local` to version control
2. Use different API keys for development and production
3. Enable RLS on all tables in production
4. Regularly rotate your database passwords
5. Monitor your Supabase dashboard for unusual activity
6. Set up proper CORS settings for production