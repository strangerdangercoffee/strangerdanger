# Admin Role Protection Setup

This document explains how the admin role protection works in the Stranger Danger Coffee application.

## How It Works

The admin page (`/admin`) is now protected and only accessible to users with the admin role. Here's how the protection works:

### 1. Role Check
- When a user tries to access the admin page, the system checks their `raw_app_meta_data` in Supabase
- The system looks for `{"role": "admin"}` in the user's metadata
- If the role is not "admin", the user is redirected to the dashboard with an error message

### 2. Access Control Flow
1. User navigates to `/admin`
2. `checkAdminAccess()` function runs automatically
3. System verifies user is authenticated
4. System checks user's role in `app_metadata`
5. If role === "admin": Access granted
6. If role !== "admin": Redirected to dashboard with error message

## Setting Up Admin Users

### Method 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Users**
3. Find the user you want to make an admin
4. Click on the user to view their details
5. In the **User Metadata** section, add:
   ```json
   {
     "role": "admin"
   }
   ```
6. Click **Save**

### Method 2: SQL Command

You can also update a user's role using SQL in the Supabase SQL editor:

```sql
UPDATE auth.users 
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'::jsonb), 
  '{role}', 
  '"admin"'
) 
WHERE email = 'admin@example.com';
```

Replace `'admin@example.com'` with the actual email of the user you want to make an admin.

## Security Features

### 1. Automatic Redirects
- Unauthenticated users are redirected to `/login`
- Non-admin users are redirected to `/dashboard` with an error message

### 2. Visual Indicators
- Admin users see their email displayed in the admin dashboard
- An "Admin" badge is shown next to their email

### 3. Error Handling
- Clear error messages for unauthorized access
- Graceful fallbacks if authentication fails

## Testing Admin Access

1. **As a regular user**: Try accessing `/admin` - you should be redirected to dashboard
2. **As an admin user**: Access `/admin` - you should see the admin dashboard with your email displayed
3. **When logged out**: Try accessing `/admin` - you should be redirected to login

## Troubleshooting

### User not recognized as admin?
- Check that the `role` field is exactly "admin" (case-sensitive)
- Verify the metadata is saved in Supabase
- Clear browser cache and try again

### Getting redirected unexpectedly?
- Check browser console for error messages
- Verify your Supabase configuration is correct
- Ensure the user has the correct role in their metadata

## Code Structure

The admin protection is implemented in:
- `src/admin.js`: Contains the `checkAdminAccess()` function
- `src/admin.html`: Displays admin user information
- `src/style.css`: Styles for admin user indicators

The protection runs automatically when the admin page loads via the `DOMContentLoaded` event listener. 