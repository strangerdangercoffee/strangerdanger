# Supabase Setup Guide for Stranger Danger Coffee

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `stranger-danger-coffee`
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy your **Project URL** and **anon public** key
3. Update the `auth.js` file with your credentials:

```javascript
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

## Step 3: Configure Authentication

1. Go to **Authentication** → **Settings**
2. Configure your site URL:
   - **Site URL**: `http://localhost:8000` (for development)
   - **Redirect URLs**: Add `http://localhost:8000/login.html`

## Step 4: Enable Email Authentication

1. Go to **Authentication** → **Providers**
2. Make sure **Email** provider is enabled
3. Configure email templates (optional):
   - Go to **Authentication** → **Email Templates**
   - Customize the confirmation and reset password emails

## Step 5: Set Up Email Provider (Optional)

For production, you can configure a custom SMTP provider:
1. Go to **Authentication** → **Providers** → **Email**
2. Click "Configure"
3. Add your SMTP settings

## Step 6: Test the Authentication

1. Start your local server: `python -m http.server 8000`
2. Go to `http://localhost:8000/login.html`
3. Try creating a new account
4. Test sign in functionality
5. Test password reset

## Step 7: Production Deployment

When deploying to production:

1. Update the **Site URL** in Supabase to your production domain
2. Add your production domain to **Redirect URLs**
3. Update the `SUPABASE_URL` and `SUPABASE_ANON_KEY` in your production environment

## Security Notes

- Never commit your Supabase keys to version control
- Use environment variables in production
- Consider enabling additional security features like:
  - Rate limiting
  - CAPTCHA
  - Two-factor authentication

## Additional Features You Can Add

1. **User Profiles**: Create a profiles table to store additional user data
2. **Role-based Access**: Set up different user roles (admin, customer, etc.)
3. **Social Login**: Add Google, Facebook, or other social providers
4. **Email Verification**: Require email verification before allowing login

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure your domain is added to the allowed origins in Supabase
2. **Redirect Issues**: Verify your redirect URLs are correctly configured
3. **Email Not Sending**: Check your email provider settings in Supabase

### Getting Help:

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Community](https://github.com/supabase/supabase/discussions)
- [Supabase Discord](https://discord.supabase.com) 