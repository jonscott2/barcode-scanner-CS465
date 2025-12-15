**Project Overview:**

The project aims to address the significant issue of food waste in the U.S., where the average American discards approximately $2000 worth of edible food annually, contributing to an estimated $408 billion in grocery waste nationwide. The solution is an app designed to help users manage their food inventory by tracking items brought into their homes and suggesting recipes based on available ingredients, those nearing expiration, and user preferences.

**Key Components:**
1. Barcode Repository Integration: A free barcode repository has been connected to a system that tracks scanned items, recording details such as the item and purchase time.
3. Recipe API Connection: The app is linked to TheMealDB, a free meal API that searches for meals based on available ingredients, offering recipe suggestions to users.

**List of which project parts were worked on by which team member(s):**

**Samuel Kwibe:** I worked closely with Jon on the backend of the project, was responsible for fixing the API and ensuring the project runs smoothly.  I worked on a list to maintain scanned items into a database.  

**Jon Scott:** Back End. Completed linking the API from https://api.upcdatabase.org/. This API will resolve a 12-14 digit UPC to a product that can be added to our list.  Working on linking the API from https://spoonacular.com/food-api/console#Profile.

**Jonathan Corwin:** Design and Test - Worked on presentation design.  Also, Worked on creating test cases and implimentation of testing.

**Isaac Akhtar Zada:** Front End (Worked on the front end to create a time counter for our app, which will track the time from when the food is purchased until it expires.)

**Elena Guzman:** Website design - Worked on the landing page for the web page

**How to start:**

## 🪟 Windows Users - Quick Start

**For detailed Windows setup instructions, see [WINDOWS_SETUP.md](WINDOWS_SETUP.md)**

**Easiest method for Windows:**
1. Install Node.js from https://nodejs.org/
2. Open Command Prompt in the project folder
3. Run: `npm install`
4. Double-click `start-all-apis.bat` (starts both API servers)
5. In a new Command Prompt, run: `npm start`
6. Open browser to `http://localhost:3002`

---

## 📋 Detailed Setup Instructions

You need to start two API's and one react component

### **API 1 - UPC Database Proxy (Required for barcode scanning):**

**On Mac/Linux:**
```bash
export UPC_API_KEY="4190D3F1E6057DD921DA7E426A79AAF3"
npm run start:proxy
```

**On Windows (PowerShell):**
```powershell
$env:UPC_API_KEY="4190D3F1E6057DD921DA7E426A79AAF3"
npm run start:proxy
```

**On Windows (CMD):**
```cmd
set UPC_API_KEY=4190D3F1E6057DD921DA7E426A79AAF3
npm run start:proxy
```

**Or use the setup script:**
- Mac/Linux: `./start-all-apis.sh` (starts both APIs)
- Windows: Double-click `start-all-apis.bat` (starts both APIs)

### **API 2 - Recipe API (Optional):**

In a new terminal, cd into server and run:
```bash
# Mac/Linux
export UPC_API_KEY2="6da1ac7558c34c9d9c314d1172952a6a"
# OR
export SPOONACULAR_API_KEY="6da1ac7558c34c9d9c314d1172952a6a"
node server/RecipeDB.js

# Windows PowerShell
$env:UPC_API_KEY2="6da1ac7558c34c9d9c314d1172952a6a"
# OR
$env:SPOONACULAR_API_KEY="6da1ac7558c34c9d9c314d1172952a6a"
node server/RecipeDB.js

# Windows CMD
set UPC_API_KEY2=6da1ac7558c34c9d9c314d1172952a6a
node server/RecipeDB.js
```

### **React Component:**

In the main project folder:
```bash
npm install
npm start
```

The app will be available at `http://localhost:3002`

**Note:** The proxy server (API 1) must be running for barcode scanning to work properly. The app will try multiple APIs in parallel:
1. Open Food Facts (free, no key required)
2. UPC Database (via proxy with your API key)
3. Open Beauty Facts (free, no key required)
4. Barcode Lookup (demo key, free tier)
5. GTIN Search (free, open database)
