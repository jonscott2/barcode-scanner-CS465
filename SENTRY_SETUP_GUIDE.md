# Sentry Setup Guide - Step by Step

## 🎯 Step 1: Create Sentry Account

1. Go to **https://sentry.io**
2. Click **"Get Started"** or **"Sign Up"** (top right)
3. Choose one of these options:
   - **Sign up with GitHub** (recommended - easiest)
   - **Sign up with Google**
   - **Sign up with Email** (create new account)

## 🎯 Step 2: Create a New Project

After signing up, you'll see a setup wizard:

1. **Select Platform**: Choose **"React"**
   - If you don't see React, look for "JavaScript" or "Browser JavaScript"
   
2. **Project Name**: Enter something like:
   - `barcode-scanner-app`
   - `barcode-scanner-cs465`
   - Or any name you prefer

3. **Click "Create Project"**

## 🎯 Step 3: Get Your DSN (Data Source Name)

After creating the project, Sentry will show you setup instructions:

1. **Copy your DSN** - It looks like:
   ```
   https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
   ```
   - **SAVE THIS** - You'll need it in the next step
   - You can always find it later in: Project Settings → Client Keys (DSN)

## 🎯 Step 4: Install Sentry in Your Project

Open your terminal in the project folder and run:

```bash
npm install --save @sentry/react
```

## 🎯 Step 5: Configure Sentry in Your React App

I'll help you set this up. Here's what we need to do:

1. Create a Sentry configuration file
2. Initialize Sentry in your app
3. Add your DSN

## 🎯 Step 6: Choose Your Plan

Sentry will ask you to choose a plan:

- **Developer Plan** (FREE) - Recommended for you
  - ✅ 5,000 events/month
  - ✅ 1 project
  - ✅ 7 days data retention
  - ✅ Perfect for testing and small projects

- Click **"Continue with Developer"** or **"Start Free Trial"**

## 📋 What You'll Need to Provide

When setting up, Sentry might ask:

1. **Organization Name**: 
   - Use your name or team name
   - Example: `samuel-raymond` or `cs465-team`

2. **Team Name** (optional):
   - Can skip or use same as organization

3. **Project Details**:
   - Platform: **React**
   - Project Name: `barcode-scanner-app` (or your choice)

## 🚀 Next Steps After Account Setup

Once you've completed the Sentry signup and have your DSN, let me know and I'll:

1. ✅ Install the Sentry package
2. ✅ Create the configuration file
3. ✅ Initialize Sentry in your app
4. ✅ Add error boundaries
5. ✅ Test that it's working

## 💡 Quick Reference

**Your Sentry Dashboard**: https://sentry.io/organizations/[your-org]/projects/

**Where to find your DSN later**:
- Go to your project
- Click **Settings** (gear icon)
- Click **Client Keys (DSN)**
- Copy the DSN

---

## ⚠️ Important Notes

- **DSN is public** - It's safe to include in your code (it's meant to be public)
- **Free tier limits**: 5,000 errors/month (plenty for testing)
- **Data retention**: 7 days on free plan (errors older than 7 days are deleted)

---

**Ready?** Complete steps 1-3 above, then share your DSN with me and I'll set it up in your code! 🚀

