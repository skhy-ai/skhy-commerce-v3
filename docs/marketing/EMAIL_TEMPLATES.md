# Supabase Email Templates - Skhy AI Marketplace

This document contains custom email templates for Supabase authentication. Copy and paste these into your Supabase Dashboard under **Authentication > Email Templates**.

---

## 📧 Template 1: Confirm Signup (Email Verification)

**Path:** Authentication > Email Templates > Confirm signup

**Subject:** `Confirm your Skhy AI Marketplace account`

**HTML Template:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Your Account</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 20px;">
  <table role="presentation" style="max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);">
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px; text-align: center;">
        <img src="https://i.postimg.cc/sD8dp66w/skhy-logo.jpg" alt="Skhy AI" style="height: 64px; width: auto; border-radius: 8px; margin-bottom: 20px;" />
        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Welcome to Skhy AI Marketplace</h1>
      </td>
    </tr>
    
    <!-- Body -->
    <tr>
      <td style="padding: 40px;">
        <p style="margin: 0 0 24px; color: #e2e8f0; font-size: 16px; line-height: 1.6;">
          Thank you for joining the Skhy AI Partner Marketplace! We're excited to have you on board.
        </p>
        
        <p style="margin: 0 0 32px; color: #cbd5e1; font-size: 16px; line-height: 1.6;">
          To complete your registration and verify your email address, please click the button below:
        </p>
        
        <!-- CTA Button -->
        <table role="presentation" style="width: 100%;">
          <tr>
            <td style="text-align: center; padding: 0 0 32px;">
              <a href="{{ .ConfirmationURL }}" 
                 style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                Verify Email Address
              </a>
            </td>
          </tr>
        </table>
        
        <p style="margin: 0 0 16px; color: #cbd5e1; font-size: 14px; line-height: 1.6;">
          Or copy and paste this link into your browser:
        </p>
        
        <p style="margin: 0 0 32px; padding: 16px; background: #0f172a; border-radius: 8px; color: #60a5fa; font-size: 13px; word-break: break-all; font-family: monospace;">
          {{ .ConfirmationURL }}
        </p>
        
        <div style="border-top: 1px solid #334155; margin: 32px 0; padding-top: 24px;">
          <p style="margin: 0 0 12px; color: #94a3b8; font-size: 14px;">
            <strong>What's Next?</strong>
          </p>
          <ul style="margin: 0; padding-left: 20px; color: #cbd5e1; font-size: 14px; line-height: 1.8;">
            <li>Complete your company profile</li>
            <li>Add your first product</li>
            <li>Wait for admin approval</li>
            <li>Start selling on the marketplace</li>
          </ul>
        </div>
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="background: #0f172a; padding: 32px; text-align: center; border-top: 1px solid #334155;">
        <p style="margin: 0 0 12px; color: #64748b; font-size: 13px;">
          If you didn't create an account with Skhy AI, you can safely ignore this email.
        </p>
        <p style="margin: 0; color: #475569; font-size: 12px;">
          © 2026 Skhy AI. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 📧 Template 2: Magic Link (Passwordless Login)

**Path:** Authentication > Email Templates > Magic Link

**Subject:** `Your Skhy AI Marketplace login link`

**HTML Template:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login to Your Account</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 20px;">
  <table role="presentation" style="max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);">
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center;">
        <img src="https://i.postimg.cc/sD8dp66w/skhy-logo.jpg" alt="Skhy AI" style="height: 64px; width: auto; border-radius: 8px; margin-bottom: 20px;" />
        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Login Request</h1>
      </td>
    </tr>
    
    <!-- Body -->
    <tr>
      <td style="padding: 40px;">
        <p style="margin: 0 0 24px; color: #e2e8f0; font-size: 16px; line-height: 1.6;">
          Hello! Someone requested a login link for your Skhy AI Marketplace account.
        </p>
        
        <p style="margin: 0 0 32px; color: #cbd5e1; font-size: 16px; line-height: 1.6;">
          Click the button below to securely log in to your account:
        </p>
        
        <!-- CTA Button -->
        <table role="presentation" style="width: 100%;">
          <tr>
            <td style="text-align: center; padding: 0 0 32px;">
              <a href="{{ .ConfirmationURL }}" 
                 style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                Log In to Dashboard
              </a>
            </td>
          </tr>
        </table>
        
        <p style="margin: 0 0 16px; color: #cbd5e1; font-size: 14px; line-height: 1.6;">
          Or copy and paste this link into your browser:
        </p>
        
        <p style="margin: 0 0 32px; padding: 16px; background: #0f172a; border-radius: 8px; color: #34d399; font-size: 13px; word-break: break-all; font-family: monospace;">
          {{ .ConfirmationURL }}
        </p>
        
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
          <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
            <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour and can only be used once.
          </p>
        </div>
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="background: #0f172a; padding: 32px; text-align: center; border-top: 1px solid #334155;">
        <p style="margin: 0 0 12px; color: #64748b; font-size: 13px;">
          If you didn't request this login link, please ignore this email and ensure your account is secure.
        </p>
        <p style="margin: 0; color: #475569; font-size: 12px;">
          © 2026 Skhy AI. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 📧 Template 3: Reset Password

**Path:** Authentication > Email Templates > Reset Password

**Subject:** `Reset your Skhy AI Marketplace password`

**HTML Template:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 20px;">
  <table role="presentation" style="max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);">
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px; text-align: center;">
        <img src="https://i.postimg.cc/sD8dp66w/skhy-logo.jpg" alt="Skhy AI" style="height: 64px; width: auto; border-radius: 8px; margin-bottom: 20px;" />
        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Reset Your Password</h1>
      </td>
    </tr>
    
    <!-- Body -->
    <tr>
      <td style="padding: 40px;">
        <p style="margin: 0 0 24px; color: #e2e8f0; font-size: 16px; line-height: 1.6;">
          We received a request to reset the password for your Skhy AI Marketplace account.
        </p>
        
        <p style="margin: 0 0 32px; color: #cbd5e1; font-size: 16px; line-height: 1.6;">
          Click the button below to create a new password:
        </p>
        
        <!-- CTA Button -->
        <table role="presentation" style="width: 100%;">
          <tr>
            <td style="text-align: center; padding: 0 0 32px;">
              <a href="{{ .ConfirmationURL }}" 
                 style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);">
                Reset Password
              </a>
            </td>
          </tr>
        </table>
        
        <p style="margin: 0 0 16px; color: #cbd5e1; font-size: 14px; line-height: 1.6;">
          Or copy and paste this link into your browser:
        </p>
        
        <p style="margin: 0 0 32px; padding: 16px; background: #0f172a; border-radius: 8px; color: #fbbf24; font-size: 13px; word-break: break-all; font-family: monospace;">
          {{ .ConfirmationURL }}
        </p>
        
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
          <p style="margin: 0 0 12px; color: #92400e; font-size: 14px; line-height: 1.6;">
            <strong>⚠️ Security Tips:</strong>
          </p>
          <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 13px; line-height: 1.8;">
            <li>This link expires in 1 hour</li>
            <li>Use a strong, unique password</li>
            <li>Never share your password with anyone</li>
          </ul>
        </div>
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="background: #0f172a; padding: 32px; text-align: center; border-top: 1px solid #334155;">
        <p style="margin: 0 0 12px; color: #64748b; font-size: 13px;">
          If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
        </p>
        <p style="margin: 0; color: #475569; font-size: 12px;">
          © 2026 Skhy AI. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 📧 Template 4: Email Change Confirmation

**Path:** Authentication > Email Templates > Change Email Address

**Subject:** `Confirm your new email address`

**HTML Template:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Email Change</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 20px;">
  <table role="presentation" style="max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);">
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 40px; text-align: center;">
        <img src="https://i.postimg.cc/sD8dp66w/skhy-logo.jpg" alt="Skhy AI" style="height: 64px; width: auto; border-radius: 8px; margin-bottom: 20px;" />
        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Confirm Email Change</h1>
      </td>
    </tr>
    
    <!-- Body -->
    <tr>
      <td style="padding: 40px;">
        <p style="margin: 0 0 24px; color: #e2e8f0; font-size: 16px; line-height: 1.6;">
          You recently requested to change the email address associated with your Skhy AI Marketplace account.
        </p>
        
        <p style="margin: 0 0 32px; color: #cbd5e1; font-size: 16px; line-height: 1.6;">
          To confirm this change, please click the button below:
        </p>
        
        <!-- CTA Button -->
        <table role="presentation" style="width: 100%;">
          <tr>
            <td style="text-align: center; padding: 0 0 32px;">
              <a href="{{ .ConfirmationURL }}" 
                 style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);">
                Confirm Email Change
              </a>
            </td>
          </tr>
        </table>
        
        <p style="margin: 0 0 16px; color: #cbd5e1; font-size: 14px; line-height: 1.6;">
          Or copy and paste this link into your browser:
        </p>
        
        <p style="margin: 0 0 32px; padding: 16px; background: #0f172a; border-radius: 8px; color: #a78bfa; font-size: 13px; word-break: break-all; font-family: monospace;">
          {{ .ConfirmationURL }}
        </p>
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="background: #0f172a; padding: 32px; text-align: center; border-top: 1px solid #334155;">
        <p style="margin: 0 0 12px; color: #64748b; font-size: 13px;">
          If you didn't request this email change, please contact support immediately.
        </p>
        <p style="margin: 0; color: #475569; font-size: 12px;">
          © 2026 Skhy AI. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 🔧 How to Apply These Templates

### Step 1: Access Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project: `<PROJECT_ID>`

### Step 2: Navigate to Email Templates
1. Click **Authentication** in the sidebar
2. Click **Email Templates**

### Step 3: Update Each Template
For each template type:
1. Select the template (Confirm signup, Magic Link, Reset Password, Change Email)
2. Update the **Subject** line
3. Replace the **HTML content** with the template above
4. Click **Save**

### Step 4: Configure Redirect URLs
In **Authentication > URL Configuration**, set:
- **Site URL:** `http://localhost:5173` (dev) or `https://yourdomain.com` (prod)
- **Redirect URLs:** 
  - `http://localhost:5173/**`
  - `https://yourdomain.com/**`

---

## 📝 Template Variables Available

All templates can use these Supabase variables:
- `{{ .ConfirmationURL }}` - The verification/action link
- `{{ .Email }}` - User's email address
- `{{ .Token }}` - Verification token
- `{{ .TokenHash }}` - Hashed token
- `{{ .SiteURL }}` - Your configured site URL

---

## ✨ Features of These Templates

✅ **Responsive Design** - Works on mobile and desktop  
✅ **Dark Theme** - Matches Skhy AI branding  
✅ **Professional Layout** - Clean, modern design  
✅ **Security Warnings** - Includes expiration notices  
✅ **Clear CTAs** - Prominent action buttons  
✅ **Fallback Links** - Plain text URLs for accessibility  
✅ **Gradient Buttons** - Visually appealing CTAs  

---

## 🎨 Color Scheme

- Background: Navy gradient (#0f172a → #1e293b)
- Primary: Blue-Purple gradient (#3b82f6 → #8b5cf6)
- Success: Green (#10b981)
- Warning: Orange (#f59e0b)
- Text: Light gray (#e2e8f0, #cbd5e1)
