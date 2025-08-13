# Google OAuth Setup with Supabase

This guide will walk you through setting up Google OAuth authentication for your application.

## Prerequisites

- A Supabase project
- A Google Cloud Console account

## Steps

### 1. Set up Google OAuth in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click on it and press "Enable"

4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add your authorized redirect URIs:
     - For local development: `http://localhost:54321/auth/v1/callback`
     - For production: `https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback`

5. Copy your Client ID and Client Secret

### 2. Configure Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to "Authentication" > "Providers"
4. Find "Google" in the list and enable it
5. Enter your Google OAuth credentials:
   - Client ID (from Google Cloud Console)
   - Client Secret (from Google Cloud Console)
6. Save the configuration

### 3. Update Redirect URLs in Google Console

After configuring Supabase, you need to update the redirect URLs in Google Cloud Console:

1. Go back to Google Cloud Console
2. Edit your OAuth 2.0 client
3. Add the callback URL from Supabase:
   - You can find this in Supabase Dashboard > Authentication > Providers > Google
   - It will look like: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`

### 4. Environment Variables

Make sure you have the following environment variables set:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # or your production URL
```

### 5. Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to the login or signup page
3. Click "Continue with Google"
4. You should be redirected to Google's OAuth consent screen
5. After authorization, you'll be redirected back to your app

## Troubleshooting

### Common Issues

1. **Redirect URI mismatch**: Make sure the redirect URI in Google Cloud Console exactly matches the one provided by Supabase
2. **Invalid client**: Double-check that your Client ID and Client Secret are correctly entered in Supabase
3. **User not created**: Ensure the auth callback route properly creates a customer record for new OAuth users

### Local Development with Supabase CLI

If using Supabase CLI locally:
1. The redirect URL will be: `http://localhost:54321/auth/v1/callback`
2. Make sure to add this to your Google OAuth authorized redirect URIs

## Additional Customization

You can customize the OAuth flow by modifying:
- `/actions/auth.ts` - The `signInWithGoogle` function
- `/app/auth/callback/route.ts` - The callback handler
- Login/Signup UI in `/app/(unauthenticated)/(marketing)/(auth)/`

## Security Notes

- Never commit your Client Secret to version control
- Always use environment variables for sensitive credentials
- In production, ensure NEXT_PUBLIC_SITE_URL uses HTTPS