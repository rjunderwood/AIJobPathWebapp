# AIJobPath Deployment Checklist

## ✅ Fixed Issues

1. **Database Schema Export** - Fixed: Added all new tables to db/index.ts
2. **Snake_case Consistency** - Fixed: Updated all schema files to use snake_case for database columns
3. **Import Issues** - Fixed: All imports are properly structured

## ⚠️ Required Environment Variables

Add these to your `.env.local` file:

```bash
# Required for AI preview generation
OPENAI_API_KEY=sk-...

# Required for Supabase admin operations
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Required for Stripe checkout
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...

# Optional - for subscription payments (not used in one-time payment flow)
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_YEARLY=
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_MONTHLY=
```

## ⚠️ Cloudflare Configuration

Update `wrangler.toml` with actual KV namespace IDs:

```toml
[[kv_namespaces]]
binding = "CACHE"
id = "your-actual-kv-namespace-id"  # Replace this
preview_id = "your-actual-preview-id"  # Replace this

[[kv_namespaces]]
binding = "SESSIONS"
id = "your-actual-sessions-namespace-id"  # Replace this
preview_id = "your-actual-sessions-preview-id"  # Replace this
```

## 🚀 Deployment Steps

1. **Database Setup**:
   ```bash
   # Run migrations
   npx drizzle-kit push
   ```

2. **Environment Setup**:
   - Add all required environment variables to `.env.local`
   - Add the same to Cloudflare Pages environment settings

3. **Cloudflare KV Setup**:
   ```bash
   # Create KV namespaces
   wrangler kv:namespace create "CACHE"
   wrangler kv:namespace create "SESSIONS"
   # Update wrangler.toml with the IDs returned
   ```

4. **Deploy to Cloudflare**:
   ```bash
   npm run build
   npx wrangler pages deploy .vercel/output/static --project-name=aijobpath
   ```

## 📝 Testing Checklist

- [ ] Assessment flow loads at `/assessment`
- [ ] Questions progress correctly
- [ ] Session is created in database
- [ ] Assessment submission works
- [ ] Preview generation works (requires OPENAI_API_KEY)
- [ ] Stripe checkout loads
- [ ] Payment webhook processes correctly

## 🔍 Known Limitations

1. **Edge Runtime**: The current setup uses `postgres` package which may not be fully compatible with Cloudflare Workers. Consider using Supabase client for all database operations in production.

2. **Development Mode**: The KV storage falls back to in-memory cache in development. Test caching behavior in production environment.

3. **Magic Link**: Magic link authentication is not fully implemented. Users will need to implement email sending via Resend API.

## 🎯 Critical Path

The minimum viable flow is:
1. User completes assessment → 2. Preview generates → 3. Payment processes → 4. Report access granted

Focus on testing this path first.