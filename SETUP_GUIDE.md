# Complete Setup Guide - System Access Request Application

This guide will help you set up and run the application locally on macOS.

## Prerequisites Installation

### Step 1: Install Node.js and npm

You need to install Node.js first. Here are the options:

#### Option A: Using Homebrew (Recommended for macOS)

1. **Install Homebrew** (if not already installed):
   Open Terminal and run:
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Install Node.js**:
   ```bash
   brew install node
   ```

3. **Verify installation**:
   ```bash
   node --version
   npm --version
   ```
   You should see version numbers (e.g., v18.x.x and 9.x.x)

#### Option B: Download from Official Website

1. Visit: https://nodejs.org/
2. Download the LTS (Long Term Support) version for macOS
3. Run the installer and follow the prompts
4. Verify installation by opening Terminal and running:
   ```bash
   node --version
   npm --version
   ```

---

## Running the Application

Once Node.js is installed, follow these steps:

### Step 1: Navigate to Project Directory

Open Terminal and navigate to your project:
```bash
cd /Users/babarbashir/Documents/Bobrogramming/systemrequest
```

### Step 2: Set Up the Backend

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install backend dependencies**:
   ```bash
   npm install
   ```
   This will install all required packages (express, sqlite3, bcryptjs, jsonwebtoken, etc.)

3. **Initialize the database**:
   ```bash
   npm run init-db
   ```
   This creates the SQLite database with all tables and sample data.
   
   You should see output like:
   ```
   ✓ Employees table created
   ✓ Systems table created
   ✓ Roles table created
   ✓ Requests table created
   ✓ Request Items table created
   ✓ Users table created
   ✓ Sample employees inserted
   ✓ Sample systems inserted
   ✓ Sample roles inserted
   ✓ Sample users inserted
   ✓ Sample request inserted
   ✅ Database initialization completed successfully!
   ```

4. **Start the backend server**:
   ```bash
   npm start
   ```
   
   You should see:
   ```
   Database connected successfully
   Server is running on port 5000
   API available at http://localhost:5000/api
   ```

   **Keep this terminal window open!** The backend server needs to keep running.

### Step 3: Test the Backend API

Open a new Terminal window and test if the backend is working:

```bash
# Test health check endpoint
curl http://localhost:5000/api/health

# You should see: {"status":"ok","message":"Server is running"}
```

### Step 4: Set Up the Frontend (Optional - Not Yet Implemented)

**Note:** The frontend React components are not yet implemented. The backend API is fully functional and can be tested using:
- API testing tools (Postman, Insomnia, Thunder Client)
- cURL commands
- Or you can implement the frontend following the IMPLEMENTATION_GUIDE.md

If you want to test with a basic frontend:

1. **Open a NEW terminal window** (keep backend running in the first one)

2. **Navigate to frontend directory**:
   ```bash
   cd /Users/babarbashir/Documents/Bobrogramming/systemrequest/frontend
   ```

3. **Install frontend dependencies**:
   ```bash
   npm install
   ```

4. **Start the React development server**:
   ```bash
   npm start
   ```
   
   This will open http://localhost:3000 in your browser.
   
   **Note:** Since the React components aren't implemented yet, you'll see a blank page or errors. The frontend needs to be built following the IMPLEMENTATION_GUIDE.md.

---

## Testing the Backend API

Since the frontend isn't ready, here's how to test the backend:

### Method 1: Using cURL (Command Line)

**1. Login to get a token:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john.manager","password":"password123"}'
```

You'll get a response with a token. Copy the token value.

**2. Get all employees (replace YOUR_TOKEN with the actual token):**
```bash
curl -X GET http://localhost:5000/api/employees \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**3. Get all systems:**
```bash
curl -X GET http://localhost:5000/api/systems \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**4. Get all roles:**
```bash
curl -X GET http://localhost:5000/api/roles \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**5. Get all requests:**
```bash
curl -X GET http://localhost:5000/api/requests \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Method 2: Using Postman (Recommended)

1. **Download Postman**: https://www.postman.com/downloads/
2. **Install and open Postman**
3. **Create a new request**:
   - Method: POST
   - URL: http://localhost:5000/api/auth/login
   - Body → raw → JSON:
     ```json
     {
       "username": "john.manager",
       "password": "password123"
     }
     ```
   - Click Send
   - Copy the token from the response

4. **Test other endpoints**:
   - Create a new request
   - Add header: `Authorization: Bearer YOUR_TOKEN`
   - Try different endpoints (GET /api/employees, GET /api/systems, etc.)

### Method 3: Using VS Code Extension

1. Install "Thunder Client" extension in VS Code
2. Click the Thunder Client icon in the sidebar
3. Create new requests similar to Postman method above

---

## Sample Data Available

After running `npm run init-db`, you have:

### Users (for login):
- **Username:** `john.manager` | **Password:** `password123` (Manager role)
- **Username:** `sarah.admin` | **Password:** `password123` (Admin role)

### Employees:
- EMP001 - John Manager (IT, HQ)
- EMP002 - Sarah Admin (IT, HQ)
- EMP003 - Mike Developer (IT, HQ) - Manager: John
- EMP004 - Lisa Analyst (Finance, HQ) - Manager: John
- EMP005 - Tom Designer (Marketing, Branch-A) - Manager: John

### Systems:
- SYS001 - SAP ERP (Finance & Operations)
- SYS002 - Salesforce CRM (Sales & Marketing)
- SYS003 - JIRA (Project Management)
- SYS004 - GitHub (Development)

### Roles:
- 9 roles across the 4 systems with different security levels (Read, Write, Admin)

### Requests:
- 1 sample request in Draft status for Mike Developer

---

## Common Issues and Solutions

### Issue 1: Port 5000 already in use
**Solution:** Change the port in `backend/.env`:
```
PORT=5001
```
Then restart the backend server.

### Issue 2: Database file not found
**Solution:** Make sure you ran `npm run init-db` from the backend directory.

### Issue 3: "Cannot find module" errors
**Solution:** Delete `node_modules` folder and `package-lock.json`, then run `npm install` again:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue 4: Permission denied errors
**Solution:** You might need to use `sudo` for npm install:
```bash
sudo npm install
```

---

## Project Status

✅ **Completed:**
- Backend API (fully functional)
- Database schema and initialization
- Authentication system
- All CRUD endpoints
- Request workflow
- Sample data

⏳ **Not Yet Implemented:**
- React frontend components
- UI/UX design
- Frontend forms and validation

---

## Next Steps

### Option 1: Test the Backend API
Use Postman, cURL, or Thunder Client to test all the API endpoints. The backend is fully functional!

### Option 2: Implement the Frontend
Follow the detailed instructions in `IMPLEMENTATION_GUIDE.md` to build the React frontend components.

### Option 3: Use a Different Frontend
You could build a frontend using:
- Vue.js
- Angular
- Plain HTML/JavaScript
- Mobile app (React Native, Flutter)

The backend API is framework-agnostic and can work with any frontend!

---

## Quick Start Commands Summary

```bash
# 1. Install Node.js (if not installed)
brew install node

# 2. Set up backend
cd /Users/babarbashir/Documents/Bobrogramming/systemrequest/backend
npm install
npm run init-db
npm start

# 3. In a new terminal, test the API
curl http://localhost:5000/api/health

# 4. Login and get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john.manager","password":"password123"}'
```

---

## Support

If you encounter any issues:
1. Check the terminal output for error messages
2. Verify Node.js is installed: `node --version`
3. Ensure you're in the correct directory
4. Make sure the backend server is running
5. Check that port 5000 is not being used by another application

For detailed API documentation, see:
- `backend/README.md`
- `TECHNICAL_PLAN.md`
- `IMPLEMENTATION_GUIDE.md`

---

**Happy coding! 🚀**