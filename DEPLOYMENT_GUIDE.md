# Just us - Deployment Guide

## What's Been Completed ✅

- ✅ Full React + Vite application built
- ✅ Supabase integration configured
- ✅ Cloudinary integration ready
- ✅ Airbnb-inspired mobile-first design
- ✅ All core features implemented
- ✅ Code committed and pushed to GitHub
- ✅ Development server running at http://localhost:3000

## Remaining Steps

### Step 1: Run Database Setup in Supabase

1. Go to your Supabase project: https://app.supabase.com/project/uaahpmiitvoycuwsdsws
2. Click on **SQL Editor** in the left sidebar
3. Click **New query**
4. Open the file `supabase-schema.sql` from your project
5. Copy and paste the entire SQL content
6. Click **Run** to execute
7. You should see "Success. No rows returned" message

### Step 2: Create Cloudinary Upload Preset ⚠️ CRITICAL

1. Go to Cloudinary Console: https://cloudinary.com/console
2. Navigate to **Settings** (gear icon) > **Upload**
3. Scroll down to **Upload presets**
4. Click **Add upload preset**
5. Configure exactly as follows:
   - **Preset name**: `memories` (MUST be exactly this)
   - **Signing mode**: Select **"Unsigned"** (NOT Signed)
   - **Folder**: (optional) `just-us-memories`
   - Leave other settings as default
6. Click **Save**

**Why this is critical**: The app is configured to use the preset name "memories". If you use a different name, image uploads will fail.

### Step 3: Rename GitHub Repository

1. Go to your GitHub repository: https://github.com/aswindhananjai/my-app
2. Click on **Settings** tab
3. Scroll down to **Repository name**
4. Change from `my-app` to `just-us`
5. Click **Rename**

### Step 4: Deploy to Vercel

#### Option A: Automatic Deployment (Recommended)

1. Go to https://vercel.com and sign in with GitHub
2. Click **Add New** > **Project**
3. Import your `just-us` repository
4. Vercel will auto-detect Vite configuration
5. Before deploying, add **Environment Variables**:
   - `VITE_SUPABASE_URL` = `https://uaahpmiitvoycuwsdsws.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhYWhwbWlpdHZveWN1d3Nkc3dzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwOTkzNzAsImV4cCI6MjA5NzY3NTM3MH0.JZ1uylI6hyEdi4OLRVTVhv7An_aOoBXgbq-lkfQUf94`
   - `VITE_CLOUDINARY_CLOUD_NAME` = `just-us`
   - `VITE_CLOUDINARY_UPLOAD_PRESET` = `memories`
6. Click **Deploy**
7. Wait 1-2 minutes for deployment to complete
8. You'll get a production URL like: `https://just-us.vercel.app`

#### Option B: Using Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
# Follow the prompts
# Add environment variables when asked
vercel --prod
```

### Step 5: Update Android APK

Once deployed, update your Android WebView APK to point to the Vercel URL:

1. Open your Android project in `android-app/`
2. Update the WebView URL to your Vercel production URL
3. Rebuild the APK
4. Install on device

## Testing Your Deployment

### Before Going Live - Test Checklist

1. **Database Test**:
   - Open your production URL
   - Create a 6-digit passcode (first time)
   - Check if it saves to Supabase settings table

2. **Image Upload Test**:
   - Add a memory with a photo
   - Verify image uploads to Cloudinary
   - Check if image displays correctly

3. **All Features Test**:
   - ✅ Passcode lock/unlock works
   - ✅ Timeline displays correctly
   - ✅ Add memory form works
   - ✅ Memory detail page shows
   - ✅ Settings can be updated
   - ✅ Photos upload and display
   - ✅ Mobile responsive design works

## Environment Variables Summary

| Variable | Value | Where to Add |
|----------|-------|--------------|
| VITE_SUPABASE_URL | `https://uaahpmiitvoycuwsdsws.supabase.co` | Vercel Dashboard |
| VITE_SUPABASE_ANON_KEY | Your anon key | Vercel Dashboard |
| VITE_CLOUDINARY_CLOUD_NAME | `just-us` | Vercel Dashboard |
| VITE_CLOUDINARY_UPLOAD_PRESET | `memories` | Vercel Dashboard |

## Troubleshooting

### Images Not Uploading
- Check Cloudinary preset is named exactly "memories"
- Verify preset signing mode is "Unsigned"
- Check browser console for errors

### Database Connection Issues
- Verify SQL schema was run successfully
- Check Supabase anon key is correct
- Ensure RLS policies are enabled

### Build Failures
- Run `npm run build` locally first
- Check for any console errors
- Verify all dependencies are in package.json

## Cost Analysis

### Free Tier Limits

**Supabase Free Tier:**
- ✅ 500MB database
- ✅ 1GB file storage
- ✅ 2GB bandwidth/month
- Perfect for personal use

**Cloudinary Free Tier:**
- ✅ 25GB storage
- ✅ 25GB bandwidth/month
- ✅ 25,000 transformations/month
- More than enough for hundreds of photos

**Vercel Free Tier:**
- ✅ 100GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Automatic HTTPS
- ✅ Free custom domain

**Total Monthly Cost: $0** (within free tiers)

## What Happens Next

After deployment:
1. Your app will be live at a Vercel URL
2. Any push to `main` branch auto-deploys
3. Access from any device via the URL
4. Install as PWA on mobile for app-like experience

## Future Enhancements

Consider adding in future versions:
- Custom domain (e.g., justus.app)
- Push notifications
- Export memories feature
- Search and filter
- Additional memory types
- Shared calendar
- Travel planning section

---

Need help? Check the main README.md for more details.
