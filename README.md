# Just us

A private digital space built exclusively for Aswin and Anu.

## Setup Instructions

### 1. Database Setup (Supabase)

1. Go to your Supabase project: https://uaahpmiitvoycuwsdsws.supabase.co
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Run the SQL query to create your database tables

### 2. Cloudinary Upload Preset Setup

You need to create an unsigned upload preset in Cloudinary:

1. Go to Cloudinary Dashboard: https://cloudinary.com/console
2. Navigate to **Settings** > **Upload**
3. Scroll to **Upload presets** section
4. Click **Add upload preset**
5. Configure:
   - **Preset name**: `memories` (must match the name in .env)
   - **Signing mode**: **Unsigned**
   - **Folder**: (optional) `just-us-memories`
6. Click **Save**

### 3. Environment Variables

All environment variables are already set up in the `.env` file:

- ✅ Supabase URL
- ✅ Supabase Anon Key
- ✅ Cloudinary Cloud Name: `just-us`
- ✅ Cloudinary Upload Preset: `memories`

### 4. Run the Application

```bash
# Install dependencies (already done)
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at: http://localhost:3000

## Features

### V1 Features (Completed)
- ✅ 6-digit passcode authentication
- ✅ Timeline view with year grouping
- ✅ Add memories with photos
- ✅ Memory detail page
- ✅ Settings page
- ✅ Relationship days counter
- ✅ Mobile-first responsive design
- ✅ Cloudinary image storage
- ✅ Supabase backend

### App Structure

```
src/
├── components/          # Reusable components
│   ├── BottomNav.jsx
│   └── FloatingActionButton.jsx
├── pages/              # Main pages
│   ├── PasscodeLock.jsx
│   ├── Timeline.jsx
│   ├── AddMemory.jsx
│   ├── MemoryDetail.jsx
│   └── Settings.jsx
├── styles/             # CSS modules
├── utils/              # Utilities
│   ├── supabase.js
│   ├── cloudinary.js
│   ├── auth.js
│   └── constants.js
├── App.jsx
└── main.jsx
```

## Design System

### Colors
- **Primary**: #014F86 (Deep Blue)
- **Background**: #FFFFFF (White)
- **Text Primary**: #222222
- **Text Secondary**: #717171
- **Border**: #EBEBEB
- **Success**: #2E7D32

### Typography
- Font: System fonts (San Francisco, Roboto, etc.)
- Airbnb-inspired clean, modern design
- Comfortable line spacing

## Deployment

### Deploy to Vercel

1. Push code to GitHub repository
2. Go to https://vercel.com
3. Import your GitHub repository
4. Vercel will auto-detect Vite
5. Add environment variables in Vercel dashboard
6. Deploy!

## Next Steps

1. ✅ Complete database setup in Supabase
2. ⏳ Create Cloudinary upload preset named "memories"
3. ⏳ Deploy to Vercel
4. ⏳ Update Android APK to point to production URL

## Future Features (Not V1)

- Wishlist
- Travel Plans
- Places To Visit
- Date Ideas
- Gift Ideas
- Relationship Dashboard
- Shared Notes
- Private Journal

---

**Just us** - A space that's ours.
Version 1.0.0
