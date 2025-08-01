# Netlify Environment Variables Setup

This document explains how to set up environment variables in Netlify for your Stranger Danger Coffee application.

## Required Environment Variables

You need to set up the following environment variables in your Netlify deployment:

1. `SUPABASE_URL` - Your Supabase project URL
2. `SUPABASE_ANON_KEY` - Your Supabase anonymous/public key

## How to Set Environment Variables in Netlify

### Method 1: Netlify Dashboard (Recommended)

1. Go to your Netlify dashboard
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Click **Add a variable**
5. Add each variable:
   - **Key**: `SUPABASE_URL`
   - **Value**: `https://your-project-id.supabase.co`
6. Click **Add a variable** again
   - **Key**: `SUPABASE_ANON_KEY`
   - **Value**: `your-anon-key-here`

### Method 2: Netlify CLI

If you have the Netlify CLI installed, you can set environment variables using:

```bash
netlify env:set SUPABASE_URL "https://your-project-id.supabase.co"
netlify env:set SUPABASE_ANON_KEY "your-anon-key-here"
```

## Getting Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the **Project URL** (this is your `SUPABASE_URL`)
4. Copy the **anon public** key (this is your `SUPABASE_ANON_KEY`)

## Build Process

The build process (`build.js`) automatically replaces the environment variable placeholders in your JavaScript files during deployment. The process:

1. Reads environment variables from Netlify
2. Replaces `process.env.SUPABASE_URL` with the actual URL
3. Replaces `process.env.SUPABASE_ANON_KEY` with the actual key
4. Outputs the processed files to the `dist/` directory

## Security Notes

- The `SUPABASE_ANON_KEY` is safe to expose in client-side code as it's designed for public use
- Never use your `service_role` key in client-side code
- Environment variables are automatically hidden from your repository and build logs

## Troubleshooting

If your app isn't connecting to Supabase:

1. Check that both environment variables are set in Netlify
2. Verify the values are correct (no extra spaces or characters)
3. Redeploy your site after setting environment variables
4. Check the browser console for any error messages

## Local Development

For local development, you can create a `.env` file in your project root:

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

Then run the build script locally:

```bash
npm run build
``` 