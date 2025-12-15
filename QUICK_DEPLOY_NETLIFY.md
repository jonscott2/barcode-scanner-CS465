# Deploy to Netlify - 3 Steps

## Option 1: Using Web UI (Easiest)

1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub repository
4. Set:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Click "Deploy site" - Done! 🎉

Your app will be live at: `https://random-name.netlify.app`

---

## Option 2: Drag & Drop

1. Build your app: `npm run build`
2. Go to [netlify.com](https://netlify.com)
3. Drag the `dist` folder onto the page
4. Done! 🎉

---

## Option 3: Using CLI

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Login
netlify login

# 3. Build and deploy
npm run build
npm run deploy:netlify
```

---

## That's it!

Netlify automatically:
- ✅ Sets up HTTPS
- ✅ Configures CDN
- ✅ Deploys on every git push (if connected to GitHub)

---

**Your app is now live on Netlify! 🚀**

