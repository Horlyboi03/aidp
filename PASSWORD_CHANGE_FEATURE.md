# Admin Password Change Feature

## Overview
Added the ability for admin to change their password at any time from the Settings tab.

## Features:

### 1. Change Password Form
- Located in Admin Dashboard → Settings tab
- Requires current password for security
- New password must be at least 6 characters
- Confirmation field to prevent typos
- Real-time validation

### 2. Security Features
- Verifies current password before allowing change
- Password strength requirements (minimum 6 characters)
- Confirmation matching validation
- Secure password update process

### 3. User Experience
- Clear form with helpful labels
- Password tips and best practices displayed
- Success/error notifications
- Form resets after successful change
- Loading states during submission

### 4. How It Works
When admin changes password:
1. Verifies current password is correct
2. Validates new password meets requirements
3. Updates password in the code files
4. Admin must use new password for future logins

## Files Created:
1. `app/api/admin/change-password/route.ts` - API endpoint for password change
2. `app/admin/components/ChangePassword.tsx` - Password change form component

## Files Modified:
1. `app/admin/components/AdminDashboard.tsx` - Added ChangePassword component to Settings tab

## How to Use:
1. Login to admin dashboard
2. Click on "Settings" tab
3. Fill in the "Change Admin Password" form:
   - Enter current password: `horlyboi03!`
   - Enter new password (min 6 characters)
   - Confirm new password
4. Click "Change Password"
5. Use new password for future logins

## Password Tips Provided:
- Use at least 6 characters
- Mix uppercase and lowercase letters
- Include numbers and special characters
- Don't use common words or personal information

## Current Default Credentials:
- Username: `horlyboi`
- Password: `horlyboi03!`

After changing password, the new password will be used for all future logins.
