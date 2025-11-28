# GitHub & Vercel Deployment Guide

## 📦 Step 1: Create a GitHub Repository

1. Go to [GitHub.com](https://github.com) and log in
2. Click **New Repository** (or go to https://github.com/new)
3. Name it: `gucci-luxury-store`
4. Choose "Public" or "Private"
5. Do NOT initialize with README (we already have one)
6. Click **Create Repository**

## 🔗 Step 2: Push to GitHub

Run these commands in your terminal:

```bash
cd d:\gucci-luxury-store

# Add your GitHub remote (replace YOUR_USERNAME and YOUR_REPO)
git remote add origin https://github.com/YOUR_USERNAME/gucci-luxury-store.git

# Rename branch to main (optional but recommended)
git branch -M main

# Push to GitHub
git push -u origin main
```

## 🚀 Step 3: Deploy to Vercel

### Option A: Using Vercel CLI

```bash
npm i -g vercel
vercel
```

### Option B: Using Vercel Dashboard

1. Go to [Vercel.com](https://vercel.com)
2. Sign up/Log in with your GitHub account
3. Click **New Project**
4. Select **Import Git Repository**
5. Search and select `gucci-luxury-store`
6. Configure:
   - **Framework**: Next.js
   - **Root Directory**: ./
7. Click **Environment Variables** and add:
   - `MONGODB_URI`: Your MongoDB Atlas connection string (with URL-encoded password)
8. Click **Deploy**

## ⚙️ Environment Variables for Vercel

In Vercel Dashboard → Settings → Environment Variables, add:

```
MONGODB_URI=mongodb+srv://formDB:Thiru%402772@cluster0.fw2eylb.mongodb.net/?appName=Cluster0
```

## ✅ After Deployment

1. Visit your Vercel URL (e.g., `https://gucci-luxury-store.vercel.app`)
2. Visit the setup page: `https://your-domain.vercel.app/setup`
3. Click "Create Superadmin" to seed the admin
4. Click "Seed Sample Products" to add products

## 📝 Login Credentials

After seeding:
- **Email**: `admin@gucci.com`
- **Password**: `SuperAdmin@2025`

## 🔐 Important Security Notes

- Never commit `.env.local` to GitHub
- Store sensitive data only in Vercel's Environment Variables
- Use strong passwords in production
- Consider rotating credentials periodically

## 🆘 Troubleshooting

### Build fails on Vercel

- Ensure `MONGODB_URI` is correctly set with URL-encoded password
- Check that MongoDB cluster is accessible from anywhere (Network Access: 0.0.0.0/0)
- Verify no type errors: Run `npm run build` locally first

### MongoDB Connection Issues

- Verify connection string uses `%40` instead of `@` in password
- Check cluster whitelist includes Vercel IPs (or use 0.0.0.0/0 for testing)

### Vercel Preview Deployments

- Each Git push creates a preview URL
- Production URL is from the `main` branch

## 📊 Build Output

The successful build shows:

```
✓ Compiled successfully
✓ Finished TypeScript
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

All pages are either prerendered (○) or server-rendered on demand (ƒ).
