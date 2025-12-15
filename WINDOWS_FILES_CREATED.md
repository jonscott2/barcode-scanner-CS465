# Windows Support Files Created

This document lists all the Windows-specific files created to help team members run the project on Windows.

## Files Created

### 1. `start-all-apis.bat`
- **Purpose**: Automated script to start both API servers on Windows
- **Usage**: Double-click the file or run `start-all-apis.bat` in Command Prompt
- **What it does**:
  - Checks if Node.js is installed
  - Kills any existing processes on ports 8787 and 8788
  - Sets environment variables for API keys
  - Starts both API servers in separate windows
  - Provides status feedback

### 2. `WINDOWS_SETUP.md`
- **Purpose**: Comprehensive Windows setup guide
- **Contents**:
  - Prerequisites (Node.js, Git installation)
  - Quick start instructions
  - Manual setup step-by-step
  - Troubleshooting section
  - Testing instructions
  - Checklist for verification

### 3. `WINDOWS_QUICK_START.txt`
- **Purpose**: Quick reference card for Windows users
- **Contents**: Condensed step-by-step instructions

### 4. Updated `README.md`
- Added Windows-specific quick start section at the top
- Updated API key instructions to match the scripts
- Added reference to `WINDOWS_SETUP.md`

## How Team Members Should Use These Files

### For First-Time Setup:
1. Read `WINDOWS_SETUP.md` for complete instructions
2. Install Node.js if not already installed
3. Run `npm install` in the project folder
4. Use `start-all-apis.bat` to start the API servers
5. Run `npm start` in a separate window

### For Quick Reference:
- Use `WINDOWS_QUICK_START.txt` for a quick reminder
- Or just double-click `start-all-apis.bat` to start servers

## Key Differences from Mac/Linux

1. **Environment Variables**: 
   - Windows CMD: `set VAR=value`
   - Windows PowerShell: `$env:VAR="value"`
   - Mac/Linux: `export VAR=value`

2. **Port Checking**:
   - Windows: Uses `netstat` and `taskkill`
   - Mac/Linux: Uses `lsof` and `kill`

3. **Background Processes**:
   - Windows: Uses `start` command to open new windows
   - Mac/Linux: Uses `nohup` and `&` for background processes

4. **Path Separators**:
   - Windows: Uses backslashes `\` (though forward slashes also work)
   - Mac/Linux: Uses forward slashes `/`

## Testing the Setup

After following the setup:
1. API 1 should be running on `http://localhost:8787`
2. API 2 should be running on `http://localhost:8788`
3. React app should be running on `http://localhost:3002`

Test by opening:
- `http://localhost:8787/product/0123456789012` (should return JSON)
- `http://localhost:8788/recipes?ingredients=chicken` (should return recipes)
- `http://localhost:3002` (should show the app)

## Support

If team members have issues:
1. Check `WINDOWS_SETUP.md` troubleshooting section
2. Verify Node.js is installed: `node --version`
3. Verify npm is installed: `npm --version`
4. Make sure all server windows are kept open
5. Check that ports 8787, 8788, and 3002 are not blocked by firewall

