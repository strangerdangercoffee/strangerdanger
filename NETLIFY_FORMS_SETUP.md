# Netlify Forms Setup

This document explains how the contact form is integrated with Netlify Forms for automatic form handling.

## How It Works

The contact form on the `/contact` page is now properly configured to work with Netlify Forms. Here's how it works:

### 1. Form Configuration
- The form has `data-netlify="true"` attribute to enable Netlify detection
- Added `name="contact"` attribute for form identification
- Added hidden `form-name` input for proper form handling
- Form submits via AJAX to Netlify's endpoint

### 2. Form Submission Flow
1. User fills out the contact form
2. JavaScript validates the form data
3. Form data is submitted to Netlify via AJAX
4. Netlify processes the submission and stores it
5. Success message is shown to the user
6. Form is cleared for next use

## Form Fields

The contact form includes the following fields:
- **Name** (required): Full name of the person contacting
- **Email** (required): Email address for response
- **Subject** (required): Subject line of the message
- **Message** (required): The actual message content

## Setting Up Form Notifications

To receive email notifications when someone submits the contact form:

### Method 1: Netlify Dashboard (Recommended)

1. Go to your Netlify site dashboard
2. Navigate to **Forms** → **contact** (your form name)
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

## Viewing Form Submissions

You can view all form submissions in your Netlify dashboard:

1. Go to your Netlify site dashboard
2. Navigate to **Forms** → **contact**
3. You'll see all submissions listed with:
   - Submission date and time
   - Form data (name, email, subject, message)
   - Spam status

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
- `src/contact.html`: Form markup with Netlify attributes
- `src/contact.js`: AJAX form submission to Netlify endpoint

The form submits to Netlify's built-in form handling endpoint at `/` with the proper headers and encoding. 