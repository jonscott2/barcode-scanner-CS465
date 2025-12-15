# Windows Setup Guide

Complete guide for setting up and running the barcode scanner project on Windows.

## Prerequisites

### 1. Install Node.js
- Download from: https://nodejs.org/
- Install the **LTS version** (recommended)
- During installation, make sure to check "Add to PATH"
- Verify installation by opening Command Prompt and running:
  ```cmd
  node --version
  npm --version
  ```

### 2. Install Git (if not already installed)
- Download from: https://git-scm.com/download/win
- Use default settings during installation

## Quick Start (Easiest Method)

### Option 1: Use the Automated Script (Recommended)

1. **Clone or download the project**
   ```cmd
   git clone https://github.com/jonscott2/barcode-scanner-CS465.git
   cd barcode-scanner-CS465
   ```

2. **Install dependencies**
   ```cmd
   npm install
   ```

3. **Start both API servers** (Double-click this file or run in Command Prompt)
   ```cmd
   start-all-apis.bat
   ```
   This will open two separate windows - **keep them open!**

4. **Start the React app** (Open a NEW Command Prompt window)
   ```cmd
   cd path\to\barcode-scanner-CS465
   npm start
   ```

5. **Open your browser**
   - Go to: `http://localhost:3002`
   - The app should now be running!

---

## Manual Setup (Step by Step)

### Step 1: Install Dependencies

Open Command Prompt in the project folder:
```cmd
cd path\to\barcode-scanner-CS465
npm install
```

### Step 2: Start API Server 1 (UPC Proxy)

**Option A: Using Command Prompt (CMD)**
```cmd
set UPC_API_KEY=4190D3F1E6057DD921DA7E426A79AAF3
npm run start:proxy
```

**Option B: Using PowerShell**
```powershell
$env:UPC_API_KEY="4190D3F1E6057DD921DA7E426A79AAF3"
npm run start:proxy
```

**Option C: Using the setup script**
```cmd
setup-api.bat
npm run start:proxy
```

**Keep this window open!** You should see: `UPC proxy listening on http://localhost:8787`

### Step 3: Start API Server 2 (Recipe API)

Open a **NEW** Command Prompt window:

**Option A: Using Command Prompt (CMD)**
```cmd
cd path\to\barcode-scanner-CS465
set UPC_API_KEY2=6da1ac7558c34c9d9c314d1172952a6a
node server/RecipeDB.js
```

**Option B: Using PowerShell**
```powershell
cd path\to\barcode-scanner-CS465
$env:UPC_API_KEY2="6da1ac7558c34c9d9c314d1172952a6a"
node server/RecipeDB.js
```

**Keep this window open too!** You should see the Recipe API server running.

### Step 4: Start the React App

Open a **THIRD** Command Prompt window:

```cmd
cd path\to\barcode-scanner-CS465
npm start
```

Wait for it to compile, then open your browser to: `http://localhost:3002`

---

## Troubleshooting

### Problem: "node is not recognized"
**Solution:** 
- Node.js is not installed or not in PATH
- Reinstall Node.js and make sure to check "Add to PATH"
- Restart your Command Prompt after installing

### Problem: "npm is not recognized"
**Solution:**
- Same as above - reinstall Node.js

### Problem: "Port 8787 is already in use"
**Solution:**
- Close any existing API servers
- Or run `start-all-apis.bat` which will automatically kill existing processes

### Problem: "Cannot find module 'express'"
**Solution:**
- Run `npm install` in the project root directory
- If that doesn't work, try:
  ```cmd
  npm install express
  cd server
  npm install express
  ```

### Problem: API servers won't start
**Solution:**
1. Make sure you're in the correct directory (project root)
2. Check that `node_modules` folder exists (if not, run `npm install`)
3. Check the error messages in the server windows
4. Make sure ports 8787 and 8788 are not blocked by firewall

### Problem: React app won't start
**Solution:**
1. Make sure you ran `npm install` first
2. Check that ports 3002 (or the port shown) is available
3. Try clearing the cache:
   ```cmd
   npm run clean
   npm install
   npm start
   ```

### Problem: "PORT=3002" doesn't work on Windows
**Solution:**
- Windows CMD doesn't support `PORT=3002` syntax
- The `package.json` has `PORT=3002` which works with Parcel
- If it doesn't work, install `cross-env`:
  ```cmd
  npm install --save-dev cross-env
  ```
  Then update `package.json` script to: `"start": "cross-env PORT=3002 parcel"`

---

## Running All Servers at Once

### Method 1: Use the Batch Script (Easiest)
```cmd
start-all-apis.bat
```

### Method 2: Manual (3 Separate Windows)

**Window 1 - UPC Proxy:**
```cmd
set UPC_API_KEY=4190D3F1E6057DD921DA7E426A79AAF3
npm run start:proxy
```

**Window 2 - Recipe API:**
```cmd
set UPC_API_KEY2=6da1ac7558c34c9d9c314d1172952a6a
node server/RecipeDB.js
```

**Window 3 - React App:**
```cmd
npm start
```

---

## Testing the Setup

### Test API 1 (UPC Proxy)
Open browser and go to:
```
http://localhost:8787/product/0123456789012
```
You should see JSON response with product information.

### Test API 2 (Recipe API)
Open browser and go to:
```
http://localhost:8788/recipes?ingredients=chicken,rice
```
You should see recipe suggestions.

### Test the App
1. Open `http://localhost:3002`
2. Click "Use webcam" or "Upload image"
3. Scan a barcode
4. Product information should appear

---

## Important Notes

1. **Keep all server windows open** - Closing them will stop the servers
2. **API keys are already set** in the scripts - you don't need to change them
3. **The app needs both APIs running** for full functionality
4. **Port 3002** is for the React app (you can change this if needed)
5. **Ports 8787 and 8788** are for the API servers (don't change these)

---

## Stopping the Servers

### Method 1: Close the Windows
- Simply close the Command Prompt windows running the servers

### Method 2: Use Task Manager
1. Press `Ctrl + Shift + Esc` to open Task Manager
2. Find `node.exe` processes
3. End the processes

### Method 3: Command Line
```cmd
REM Find and kill processes on ports 8787 and 8788
for /f "tokens=5" %a in ('netstat -aon ^| findstr ":8787"') do taskkill /F /PID %a
for /f "tokens=5" %a in ('netstat -aon ^| findstr ":8788"') do taskkill /F /PID %a
```

---

## Need Help?

If you're still having issues:
1. Check that all prerequisites are installed
2. Make sure you're using Command Prompt or PowerShell (not Git Bash for npm commands)
3. Verify you're in the correct directory
4. Check the error messages in the server windows
5. Try running `npm install` again

---

## Summary Checklist

- [ ] Node.js installed and in PATH
- [ ] Git installed (for cloning)
- [ ] Project cloned/downloaded
- [ ] `npm install` completed successfully
- [ ] API Server 1 (UPC Proxy) running on port 8787
- [ ] API Server 2 (Recipe API) running on port 8788
- [ ] React app running on port 3002
- [ ] Browser opened to `http://localhost:3002`
- [ ] Can scan barcodes and see results

---

**You're all set!** The app should now be running on Windows. 🎉

