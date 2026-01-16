# Barber Shop Booking System

A modern, full-stack barber booking application built with Next.js 14, TypeScript, Tailwind CSS, Zustand, and Supabase.

## Features

- 🎨 Premium barber website with gallery and services
- 📅 Advanced booking system with availability management
- 👤 Client booking flow (guest bookings supported)
- 🔐 Admin authentication (Email/Password + Google Sign-in)
- 📊 Admin dashboard for managing bookings and gallery
- 🌙 Dark mode support
- ✨ Smooth animations with Framer Motion
- 🚫 Double booking prevention (database-level)
- 📧 Email notifications for new bookings

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Animations**: Framer Motion

## Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works)

## Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd barberShop
npm install
```

### 2. Set Up Supabase

1. **Create a Supabase Project**
   - Go to [https://supabase.com](https://supabase.com)
   - Create a new project
   - Wait for the database to be ready

2. **Set Up Database Schema**
   - Go to SQL Editor in your Supabase dashboard
   - Run the SQL from `supabase/schema.sql` to create all tables, RLS policies, and triggers

3. **Set Up Storage Buckets**
   - Go to **Storage** in Supabase dashboard
   - Create a bucket named `haircut-gallery`:
     - Make it **public** (so images can be viewed on the website)
     - Set file size limit to **5MB** (5,242,880 bytes)
     - Recommended MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
   - The RLS policies for storage are included in `schema.sql`

4. **Enable Google OAuth (Optional)**
   - Go to **Authentication > Providers** in Supabase dashboard
   - Enable Google provider
   - Add your Google OAuth credentials

5. **Configure Email Settings (Optional)**
   - For email notifications, configure SMTP in **Project Settings > Auth**
   - Or use a service like Resend, SendGrid, etc. (modify `app/api/bookings/notify/route.ts`)

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_publishable_key
```

**How to find your keys:**
- Go to **Project Settings > API** in Supabase dashboard
- Copy the **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- Copy the **Publishable key** (starts with `sb_publishable_` or `eyJ...`) → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

**Important**: Never commit `.env.local` to git! It's already in `.gitignore`.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Getting Started After Setup

### 1. Create Your Barber Profile

1. Navigate to `/admin/signup` in your browser
2. Sign up with email/password or Google
3. Complete your profile setup (name, bio, experience)
4. You'll be redirected to the admin dashboard

### 2. Configure Availability

1. Go to **Admin Dashboard > Availability** tab
2. For each day of the week:
   - Toggle the day **on** if you work that day
   - Set your **start time** and **end time**
   - Choose **slot duration** (30, 45, or 60 minutes)
   - Set **buffer time** between appointments (in minutes)
3. Click **Save** for each day

### 3. Upload Gallery Images

1. Go to **Admin Dashboard > Gallery** tab
2. Click **Choose Images** and select your haircut photos
3. Images will appear on the public Gallery page automatically

### 4. Test the Booking Flow

1. Go to `/book` on your website
2. Select a date and time
3. Fill in client details (guests can book without logging in)
4. Complete the booking

## Database Schema

The application uses the following main tables:
- `barber_profile` - Barber information and profile
- `clients` - Client profiles (can be guest bookings)
- `bookings` - Appointment bookings
- `availability` - Barber availability schedule (per day)
- `services` - Service offerings

## Project Structure

```
barberShop/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes
│   ├── book/              # Booking page
│   ├── gallery/           # Gallery page
│   └── services/          # Services page
├── components/            # React components
│   ├── admin/            # Admin components
│   ├── booking/          # Booking flow components
│   └── ui/               # Reusable UI components
├── lib/                  # Utility functions
│   ├── supabase/         # Supabase client setup
│   └── utils/            # Helper functions
├── store/                # Zustand state management
├── supabase/             # Database SQL files
│   ├── schema.sql       # Main database schema
│   └── prevent_double_bookings.sql  # Booking overlap trigger
└── types/               # TypeScript type definitions
```

## Features

✅ Public website with barber profile, gallery, and services  
✅ Booking system with date/time selection  
✅ Availability management (per day, configurable slots)  
✅ Guest booking support (no login required)  
✅ Admin dashboard for managing bookings  
✅ Gallery image upload and management  
✅ Authentication (Email/Password + Google OAuth)  
✅ Double booking prevention (database trigger)  
✅ Dark mode support  
✅ Responsive design  
✅ Smooth animations with Framer Motion  
✅ Glassmorphism UI design  

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add your environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

Make sure to set your environment variables in your hosting platform's dashboard.

## License

MIT

