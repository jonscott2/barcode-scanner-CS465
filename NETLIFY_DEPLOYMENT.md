# 🚀 Netlify Deployment Guide

Complete step-by-step guide to deploy your barcode scanner app to Netlify.

## Prerequisites

- GitHub account with your repository pushed
- Netlify account (free tier works)
- Your API keys ready:
  - `UPC_API_KEY` (for UPC Database API)
  - `SPOONACULAR_API_KEY` (optional, for recipes)
  - `SENTRY_DSN` (optional, for error monitoring)

---

## Method 1: Deploy via Netlify Web UI (Recommended) ⭐

### Step 1: Connect Your Repository

1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **"Deploy with GitHub"**
4. Authorize Netlify to access your GitHub account
5. Select your repository: `barcode-scanner-CS465`
6. Select your branch: `sams-code`

### Step 2: Configure Build Settings

Netlify should auto-detect these settings, but verify:

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** `18` (or latest LTS)

### Step 3: Set Environment Variables

**IMPORTANT:** Set these in Netlify before deploying:

1. Go to **Site settings** → **Environment variables**
2. Click **"Add variable"** and add each:

#### Required:
```
UPC_API_KEY = 4190D3F1E6057DD921DA7E426A79AAF3
```

#### Optional (but recommended):
```
SPOONACULAR_API_KEY = 6da1ac7558c34c9d9c314d1172952a6a
SENTRY_DSN = https://03ec3495eaeeefb169f7068ddd270e85@o4510541249118208.ingest.us.sentry.io/4510541260324864
ITEM_INFO_PROXY_URL = /.netlify/functions/upc
```

**Note:** The `ITEM_INFO_PROXY_URL` tells the app to use the Netlify function instead of calling the API directly.

### Step 4: Deploy!

1. Click **"Deploy site"**
2. Wait for the build to complete (usually 2-3 minutes)
3. Your app will be live at: `https://random-name.netlify.app`

### Step 5: Configure Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Follow the instructions to configure your domain

---

## Method 2: Deploy via Netlify CLI

### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

### Step 2: Login to Netlify

```bash
netlify login
```

This will open your browser to authorize the CLI.

### Step 3: Initialize Site

```bash
# Link to existing site or create new one
netlify init
```

Follow the prompts:
- Choose "Create & configure a new site"
- Enter a site name (or leave blank for auto-generated)
- Select your team (or personal account)

### Step 4: Set Environment Variables

```bash
# Set required variables
netlify env:set UPC_API_KEY "4190D3F1E6057DD921DA7E426A79AAF3"
netlify env:set SPOONACULAR_API_KEY "6da1ac7558c34c9d9c314d1172952a6a"
netlify env:set SENTRY_DSN "https://03ec3495eaeeefb169f7068ddd270e85@o4510541249118208.ingest.us.sentry.io/4510541260324864"
netlify env:set ITEM_INFO_PROXY_URL "/.netlify/functions/upc"
```

### Step 5: Build and Deploy

```bash
# Build the app
npm run build

# Deploy to production
netlify deploy --prod
```

Or use the npm script:
```bash
npm run deploy:netlify
```

---

## Method 3: Drag & Drop (Quick Test)

For a quick test without connecting GitHub:

1. Build your app locally:
   ```bash
   npm run build
   ```

2. Go to [netlify.com](https://netlify.com)
3. Drag the `dist` folder onto the Netlify dashboard
4. Your app will be live immediately!

**Note:** This method doesn't support:
- Automatic deployments on git push
- Environment variables (unless set in build)
- Netlify Functions

---

## Post-Deployment Checklist

### ✅ Verify Your Deployment

1. **Check the live URL** - Your app should load
2. **Test login/signup** - Authentication should work
3. **Test barcode scanning** - Camera and image upload
4. **Check console** - No critical errors
5. **Test on mobile** - Responsive design works

### ✅ Configure Continuous Deployment

If you used Method 1 (Web UI), continuous deployment is already enabled:
- Every push to `sams-code` branch will trigger a new deployment
- You can configure this in **Site settings** → **Build & deploy**

### ✅ Set Up Branch Previews (Optional)

1. Go to **Site settings** → **Build & deploy** → **Branch deploys**
2. Enable **"Deploy only the production branch"** or **"Deploy all branches"**
3. Preview deployments will be created for each branch/PR

---

## Troubleshooting

### Build Fails

**Error: "Build command failed"**
- Check that `npm run build` works locally
- Verify Node.js version (should be 18+)
- Check build logs in Netlify dashboard

**Error: "Module not found"**
- Make sure all dependencies are in `package.json`
- Run `npm install` locally to verify

### App Doesn't Work After Deployment

**Barcode scanning doesn't work:**
- Check that `UPC_API_KEY` is set in environment variables
- Verify `ITEM_INFO_PROXY_URL` is set to `/.netlify/functions/upc`
- Check browser console for API errors

**Login doesn't work:**
- Verify Firebase config is in `src/index.html` (if using Firebase)
- Check that Firebase project is configured correctly
- Check browser console for auth errors

**404 errors on routes:**
- Verify `netlify.toml` has the redirect rule:
  ```toml
  [[redirects]]
    from = "/*"
    to = "/index.html"
    status = 200
  ```

### Netlify Function Not Working

**Error: "Function not found"**
- Verify `netlify/functions/upc.js` exists
- Check that function is deployed (should see it in Netlify dashboard)
- Test function directly: `https://your-site.netlify.app/.netlify/functions/upc?barcode=123456789012`

**Error: "API key not found"**
- Verify `UPC_API_KEY` is set in Netlify environment variables
- Check function logs in Netlify dashboard

---

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `UPC_API_KEY` | ✅ Yes | UPC Database API key | `4190D3F1E6057DD921DA7E426A79AAF3` |
| `SPOONACULAR_API_KEY` | ⚠️ Optional | Recipe API key | `6da1ac7558c34c9d9c314d1172952a6a` |
| `SENTRY_DSN` | ⚠️ Optional | Sentry error tracking DSN | `https://...@sentry.io/...` |
| `ITEM_INFO_PROXY_URL` | ⚠️ Recommended | Use Netlify function for API calls | `/.netlify/functions/upc` |

---

## Netlify Features You Get

✅ **HTTPS** - Automatic SSL certificates  
✅ **CDN** - Global content delivery network  
✅ **Continuous Deployment** - Auto-deploy on git push  
✅ **Branch Previews** - Preview deployments for PRs  
✅ **Netlify Functions** - Serverless functions for API proxying  
✅ **Form Handling** - Built-in form processing (if needed)  
✅ **Analytics** - Basic analytics included  

---

## Next Steps

1. ✅ **Test your deployment** - Make sure everything works
2. ✅ **Set up custom domain** - Use your own domain name
3. ✅ **Enable analytics** - Track usage (optional)
4. ✅ **Configure notifications** - Get emails on deploy success/failure
5. ✅ **Set up staging environment** - Deploy from `main` branch to staging

---

## Support

- **Netlify Docs:** https://docs.netlify.com
- **Netlify Status:** https://www.netlifystatus.com
- **Community:** https://community.netlify.com

---

**Your app is now live on Netlify! 🎉**

