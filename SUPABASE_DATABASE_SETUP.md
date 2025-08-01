# Supabase Database Setup Guide

This guide will help you set up the necessary database tables in your Supabase project for the Stranger Danger Coffee website.

## Prerequisites

1. You should have already set up your Supabase project following the `SUPABASE_SETUP.md` guide
2. Access to your Supabase project dashboard

## Database Tables

### 1. Profiles Table

This table stores user business information collected during onboarding.

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_name TEXT,
  business_address TEXT,
  office_size INTEGER,
  point_of_contact TEXT,
  phone_number TEXT,
  user_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index on user_id
CREATE UNIQUE INDEX profiles_user_id_idx ON profiles(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see and modify their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 2. Service Requests Table

This table stores service requests made by users.

```sql
-- Create service_requests table
CREATE TABLE service_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_name TEXT,
  business_address TEXT,
  service_type TEXT NOT NULL,
  service_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX service_requests_user_id_idx ON service_requests(user_id);
CREATE INDEX service_requests_status_idx ON service_requests(status);
CREATE INDEX service_requests_created_at_idx ON service_requests(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see and modify their own service requests
CREATE POLICY "Users can view own service requests" ON service_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own service requests" ON service_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin policy: Allow all operations for admin users
-- Note: You may want to restrict this based on specific admin roles later
CREATE POLICY "Admin can view all service requests" ON service_requests
  FOR SELECT USING (true);

CREATE POLICY "Admin can update all service requests" ON service_requests
  FOR UPDATE USING (true);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_service_requests_updated_at
  BEFORE UPDATE ON service_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## How to Execute the SQL

1. **Open your Supabase Dashboard**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Execute the SQL Commands**
   - Copy and paste the SQL commands above
   - Click "Run" to execute them

4. **Verify the Setup**
   - Go to "Table Editor" in the left sidebar
   - You should see both `profiles` and `service_requests` tables
   - Check that the RLS policies are enabled

## Testing the Setup

1. **Test User Registration**
   - Go to your website and register a new user
   - Complete the onboarding process
   - Verify that a record is created in the `profiles` table

2. **Test Service Requests**
   - Log in as a user and submit a service request
   - Verify that a record is created in the `service_requests` table

3. **Test Admin Access**
   - Navigate to `admin.html` in your browser
   - You should be able to see all service requests and business profiles
   - Test updating request statuses

## Admin Access

Currently, the admin page allows access to any authenticated user. For production use, you should implement proper admin role management. You can do this by:

1. **Adding an admin role to the profiles table:**
   ```sql
   ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
   ```

2. **Updating the admin access check in admin.js:**
   ```javascript
   // Check if user is admin
   const { data: profile } = await supabase
     .from('profiles')
     .select('is_admin')
     .eq('user_id', user.id)
     .single();
   
   if (!profile || !profile.is_admin) {
     window.location.href = 'index.html';
     return;
   }
   ```

## Troubleshooting

### Common Issues

1. **"Table doesn't exist" errors**
   - Make sure you've executed all the SQL commands
   - Check that you're in the correct Supabase project

2. **RLS Policy errors**
   - Ensure RLS is enabled on both tables
   - Verify that the policies are created correctly

3. **Permission denied errors**
   - Check that your Supabase API keys are correct
   - Verify that the user is authenticated

### Field Descriptions

**Profiles Table:**
- `id`: Unique identifier for the profile
- `user_id`: Links to the Supabase auth user
- `business_name`: Name of the business
- `business_address`: Physical address of the business
- `office_size`: Number of people in the office
- `point_of_contact`: Primary contact person
- `phone_number`: Business phone number
- `user_email`: Email address of the user
- `created_at`: When the profile was created
- `updated_at`: When the profile was last updated

**Service Requests Table:**
- `id`: Unique identifier for the request
- `user_id`: Links to the user who made the request
- `business_name`: Name of the business (copied from profile)
- `business_address`: Address of the business (copied from profile)
- `service_type`: Type of service (coffee-refill, nitrogen-refill, kegerator-maintenance)
- `service_name`: Display name of the service
- `status`: Current status (pending, in-progress, completed)
- `admin_notes`: Optional notes from admin about the request
- `created_at`: When the request was created
- `updated_at`: When the request was last updated

## Next Steps

After setting up the database:

1. **Test the complete user flow:**
   - User registration → Onboarding → Dashboard → Service requests

2. **Test the admin functionality:**
   - View all requests
   - Update request statuses
   - Filter by business and status

3. **Set up EmailJS** (optional):
   - Follow the `EMAILJS_SETUP.md` guide to enable email notifications

4. **Customize admin access** (recommended for production):
   - Implement proper admin role management
   - Add additional security measures 