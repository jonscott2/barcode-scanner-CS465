# Get Your Google Search Engine ID

Your API key has been added! Now you need to get your **Search Engine ID** (also called CX).

## Quick Steps:

### 1. Go to Google Custom Search
Visit: **https://cse.google.com/cse/**

### 2. Create or Select Your Search Engine

**If you haven't created one yet:**
- Click the **"+ Add"** button
- In **"Sites to search"**, enter: `*` (asterisk - searches entire web)
- Name it: `Product Images` (or any name)
- Click **"Create"**

**If you already have one:**
- Click on your search engine

### 3. Enable Image Search (IMPORTANT!)
- Go to the **"Setup"** tab (left sidebar)
- Scroll to **"Basics"** section
- Find **"Image search"** and toggle it **ON** ✅
- Click **"Update"** at the bottom

### 4. Get Your Search Engine ID
- Still in the **"Setup"** tab
- Look for **"Search engine ID"** (also called CX)
- It looks like: `017576662512468239146:omuauf_lfve`
- **Copy this ID**

### 5. Add It to Your App

Once you have the Search Engine ID, replace `YOUR_SEARCH_ENGINE_ID_HERE` in `src/index.html` with your actual ID.

Or just tell me the ID and I'll add it for you!

## What It Looks Like:

Your Search Engine ID will be something like:
- `017576662512468239146:omuauf_lfve`
- `012345678901234567890:abcdefghijk`
- Or similar format

## Quick Test:

After adding the Engine ID, restart your app and scan a barcode. Images should load much faster! 🚀

