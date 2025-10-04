# Supabase Setup Instructions

## 1. Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign up or log in
3. Click "New project"
4. Choose your organization
5. Enter project details:
   - Name: `dm-brands`
   - Database Password: (save this securely)
   - Region: Choose closest to Worcester, UK

## 2. Run Database Schema

1. In your Supabase project, go to **SQL Editor**
2. Click "New query"
3. Copy the entire contents of `database/schema.sql`
4. Paste and click "Run"
5. This creates all necessary tables with proper relationships

## 3. Set Up Storage

1. Go to **Storage** in your Supabase project
2. Click "Create bucket"
3. Name it `catalogues`
4. Enable "Public bucket" toggle
5. Click "Create"

## 4. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. In Supabase, go to **Settings** > **API**

3. Copy these values to your `.env` file:
   - Project URL → `REACT_APP_SUPABASE_URL`
   - `anon` `public` key → `REACT_APP_SUPABASE_ANON_KEY`

Your `.env` should look like:
```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJ...your-anon-key...
```

## 5. Optional: Set Up Authentication

For admin access control:

1. Go to **Authentication** > **Providers**
2. Enable Email provider
3. Create admin users in **Authentication** > **Users**
4. Update Row Level Security policies for write access

## 6. Initial Data Setup

To populate initial brands data:

```sql
-- Insert initial brands
INSERT INTO brands (name, description, logo_url, banner_url, website, color, order_index)
VALUES 
  ('Elvang', 'Danish design company specializing in high-quality home textiles', '/logos/elvang.svg', '/images/elvang-banner.jpg', 'https://www.elvang.co.uk', '#C4A274', 1),
  ('Gefu', 'German manufacturer of innovative kitchen tools', '/logos/gefu.svg', '/images/gefu-banner.jpg', 'https://www.gefu.com', '#2E7D32', 2),
  ('PPD', 'Paper Products Design - beautiful paper napkins and tableware', '/logos/ppd.svg', '/images/banner3.jpg', 'https://paperproductsdesign.de', '#8E24AA', 3),
  ('My Flame Lifestyle', 'Scented candles with personal touch', '/logos/myflame.svg', '/images/myflame-banner.jpg', 'https://www.myflame.nl', '#F4A460', 4),
  ('Relaxound', 'Nature sounds for your home', '/logos/relaxound.svg', '/images/relaxound-banner.jpg', 'https://www.relaxound.com', '#6FBE89', 5),
  ('Räder', 'Poetic living accessories', '/logos/rader.svg', '/images/rader-banner.jpg', 'https://www.raeder.de', '#8B6DB5', 6),
  ('Remember', 'Colorful games and home accessories', '/logos/remember.svg', '/images/remember-banner.jpg', 'https://www.remember.de', '#E6A4C4', 7);
```

## 7. Test the Connection

1. Restart your development server:
   ```bash
   npm start
   ```

2. Check the browser console for any connection errors

3. Visit the Admin Dashboard to test:
   - Creating events
   - Uploading catalogues
   - Managing brands

## Troubleshooting

- **"Database not configured" message**: Check your `.env` file has correct values
- **CORS errors**: Ensure your Supabase project URL is correct
- **Storage errors**: Verify the `catalogues` bucket is public
- **Permission errors**: Check Row Level Security policies in Supabase

## Features When Connected

With Supabase properly configured, you'll have:
- ✅ Dynamic event management
- ✅ PDF catalogue uploads and storage
- ✅ Brand management
- ✅ Real-time data updates
- ✅ Persistent data storage
- ✅ PDF viewer with Supabase-hosted files