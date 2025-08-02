# Netlify Forms Setup

This document explains how the contact form is integrated with Netlify Forms for automatic form handling.

## How It Works

Both the contact form and onboarding form are now properly configured to work with Netlify Forms. Here's how they work:

### 1. Contact Form Configuration
- The form has `data-netlify="true"` attribute to enable Netlify detection
- Added `name="contact"` attribute for form identification
- Added hidden `form-name` input for proper form handling
- Form submits via AJAX to Netlify's endpoint

### 2. Onboarding Form Configuration
- The form has `data-netlify="true"` attribute to enable Netlify detection
- Added `name="onboarding"` attribute for form identification
- Added hidden `form-name` input for proper form handling
- Form submits to Netlify while also maintaining Supabase functionality

### 3. Form Submission Flow

**Contact Form:**
1. User fills out the contact form
2. JavaScript validates the form data
3. Form data is submitted to Netlify via AJAX
4. Netlify processes the submission and stores it
5. Success message is shown to the user
6. Form is cleared for next use

**Onboarding Form:**
1. User fills out the onboarding form
2. JavaScript validates the form data
3. Form data is submitted to Netlify for backup/storage
4. Form data is also saved to Supabase database
5. Email notification is sent to the team
6. Success message is shown and user is redirected to dashboard

## Form Fields

### Contact Form Fields:
- **Name** (required): Full name of the person contacting
- **Email** (required): Email address for response
- **Subject** (required): Subject line of the message
- **Message** (required): The actual message content

### Onboarding Form Fields:
- **Business Name** (required): Name of the business
- **Business Address** (required): Physical address of the business
- **Office Size** (required): Number of people in the office
- **Point of Contact** (required): Primary contact person
- **Phone Number** (required): Contact phone number

## Setting Up Form Notifications

To receive email notifications when someone submits either form:

### Method 1: Netlify Dashboard (Recommended)

**For Contact Form:**
1. Go to your Netlify site dashboard
2. Navigate to **Forms** → **contact**
3. Click **Settings** → **Notifications**
4. Click **Add notification**
5. Choose **Email notification**
6. Enter the email address where you want to receive notifications
7. Click **Save**

**For Onboarding Form:**
1. Go to your Netlify site dashboard
2. Navigate to **Forms** → **onboarding**
3. Click **Settings** → **Notifications**
4. Click **Add notification**
5. Choose **Email notification**
6. Enter the email address where you want to receive notifications
7. Click **Save**

### Method 2: Email Notifications via Netlify UI

1. In your Netlify dashboard, go to **Site settings** → **Forms** → **Form notifications**
2. Click **Add notification**
3. Select **Email notification**
4. Configure:
   - **To**: Your email address
   - **From**: Your preferred sender name
   - **Subject**: Custom subject line (optional)
5. Click **Save**

**Note:** The onboarding form also sends notifications via EmailJS to your team, so you may want to set up different notification emails for each form.

## Viewing Form Submissions

You can view all form submissions in your Netlify dashboard:

**Contact Form Submissions:**
1. Go to your Netlify site dashboard
2. Navigate to **Forms** → **contact**
3. You'll see all submissions listed with:
   - Submission date and time
   - Form data (name, email, subject, message)
   - Spam status

**Onboarding Form Submissions:**
1. Go to your Netlify site dashboard
2. Navigate to **Forms** → **onboarding**
3. You'll see all submissions listed with:
   - Submission date and time
   - Form data (business name, address, office size, contact info)
   - Spam status

**Note:** Onboarding form data is also stored in your Supabase database in the `profiles` table, so you have both Netlify and Supabase records.

## Spam Protection

Netlify automatically provides spam protection for your forms:
- Built-in spam filtering
- reCAPTCHA integration available
- Honeypot fields for additional protection

## Custom Success Page (Optional)

If you want to redirect users to a custom success page instead of showing the inline success message:

1. Create a success page (e.g., `/success.html`)
2. Add `action="/success"` to your form tag:
   ```html
   <form name="contact" method="POST" data-netlify="true" action="/success">
   ```

## Troubleshooting

### Form not being detected by Netlify?
- Ensure `data-netlify="true"` is present on the form
- Check that the form has a unique `name` attribute
- Redeploy your site after making changes

### Submissions not appearing in dashboard?
- Check that form detection is enabled in your Netlify site settings
- Verify the form is being submitted to the correct endpoint
- Check browser console for any JavaScript errors

### Not receiving email notifications?
- Verify email notification is properly configured
- Check spam/junk folders
- Ensure the email address is correct

## Code Structure

The Netlify Forms integration is implemented in:

**Contact Form:**
- `src/contact.html`: Form markup with Netlify attributes
- `src/contact.js`: AJAX form submission to Netlify endpoint

**Onboarding Form:**
- `src/onboarding.html`: Form markup with Netlify attributes
- `src/onboarding.js`: Dual submission to Netlify and Supabase

Both forms submit to Netlify's built-in form handling endpoint at `/` with the proper headers and encoding. The onboarding form also maintains its existing Supabase functionality for database storage and EmailJS notifications. 