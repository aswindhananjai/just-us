# Push Notifications Setup Guide

This guide will help you set up Firebase Cloud Messaging (FCM) for push notifications in your "Just Us" memory app.

## Prerequisites

- Firebase account (free tier is sufficient)
- Supabase project with CLI access
- Android device or emulator for testing

## Step 1: Firebase Setup

### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select existing project
3. Follow the setup wizard (Analytics is optional)

### 1.2 Add Web App

1. In Firebase Console, go to Project Settings (gear icon)
2. Scroll to "Your apps" section
3. Click the Web icon (`</>`) to add a web app
4. Register app with a nickname (e.g., "Just Us Web")
5. Copy the Firebase configuration object

### 1.3 Get Firebase Configuration

After registering your web app, you'll see a config object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### 1.4 Generate VAPID Key (Web Push Certificate)

1. In Firebase Console, go to Project Settings > Cloud Messaging
2. Scroll to "Web configuration" section
3. Under "Web Push certificates", click "Generate key pair"
4. Copy the key pair value

### 1.5 Get Server Key (Legacy)

1. In Firebase Console, go to Project Settings > Cloud Messaging
2. Under "Cloud Messaging API (Legacy)", enable the API if needed
3. Copy the "Server key" value

## Step 2: Update Environment Variables

Create or update your `.env` file in the project root:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
VITE_FIREBASE_VAPID_KEY=your_vapid_key_here

# Supabase (should already exist)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 3: Update Service Worker Configuration

Edit `public/firebase-messaging-sw.js` and replace the placeholder Firebase config with your actual values:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Step 4: Deploy Supabase Edge Function

### 4.1 Install Supabase CLI

```bash
npm install -g supabase
```

### 4.2 Link to Your Supabase Project

```bash
supabase link --project-ref your-project-ref
```

### 4.3 Set Firebase Server Key Secret

```bash
supabase secrets set FIREBASE_SERVER_KEY=your_firebase_server_key
```

### 4.4 Deploy the Edge Function

```bash
supabase functions deploy send-notification
```

## Step 5: Run Database Migration

Apply the FCM token storage migration:

```bash
# Using Supabase CLI
supabase db push

# Or manually run the SQL in Supabase Dashboard
# Execute the contents of: supabase/migrations/add-fcm-tokens.sql
```

## Step 6: Testing

### 6.1 Enable HTTPS for Local Development (Required for PWA features)

FCM requires HTTPS. For local testing:

1. Use ngrok or similar tool:
   ```bash
   npm install -g ngrok
   ngrok http 5173
   ```

2. Or configure Vite with HTTPS:
   ```bash
   npm install -D @vitejs/plugin-basic-ssl
   ```

   Update `vite.config.js`:
   ```javascript
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'
   import basicSsl from '@vitejs/plugin-basic-ssl'

   export default defineConfig({
     plugins: [react(), basicSsl()],
   })
   ```

### 6.2 Test the Flow

1. Open the app on an Android device/emulator
2. Log in with passcode
3. Grant notification permission when prompted
4. Log in as the other user on a different device
5. Add a memory as one user
6. Check if the other user receives a notification

## How It Works

1. **Permission Request**: When a user logs in, the app requests notification permission after 2 seconds
2. **Token Generation**: Once granted, Firebase generates an FCM token unique to that device/browser
3. **Token Storage**: The token is saved to the user's record in Supabase
4. **Memory Added**: When a user adds a memory, the app:
   - Retrieves the partner's FCM token from Supabase
   - Calls the Supabase Edge Function with the token and message
   - The Edge Function sends the notification via FCM API
5. **Notification Delivery**: Firebase delivers the push notification to the partner's device

## Notification Format

When a memory is added, the partner receives:

```
Title: New Memory Added
Body: [Username] added a memory
```

For example:
- "Aswin added a memory"
- "Anu added a memory"

## Troubleshooting

### Notifications Not Working

1. **Check Browser Support**: FCM works on Chrome, Firefox, Edge (not Safari on iOS)
2. **Verify HTTPS**: Must use HTTPS (even localhost needs SSL)
3. **Check Console**: Look for errors in browser DevTools
4. **Verify Environment Variables**: Ensure all Firebase config is set correctly
5. **Check FCM Token**: Verify token is saved in Supabase users table
6. **Test Edge Function**: Check Supabase function logs for errors

### Service Worker Not Registering

1. Service worker must be served over HTTPS
2. Check `public/firebase-messaging-sw.js` has correct Firebase config
3. Clear browser cache and reload
4. Check DevTools > Application > Service Workers

### Permission Denied

1. Clear browser data for the site
2. Manually grant permission in browser settings
3. Some browsers block notifications by default in incognito mode

## Android Deployment

When deploying to Android via Capacitor or similar:

1. Add `google-services.json` to your Android project
2. Configure FCM in `AndroidManifest.xml`
3. Update Firebase config in the Android app
4. Rebuild and reinstall the app

## Security Notes

- Never commit `.env` file or expose Firebase keys in public repos
- Use Supabase RLS policies to protect user data
- The Edge Function uses server-side Firebase key, keeping it secure
- FCM tokens are user-specific and expire/refresh automatically

## Additional Resources

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Web Push Notifications](https://web.dev/push-notifications-overview/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
