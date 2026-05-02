# Quick Start Guide - System Access Request Application

## ✅ Backend is Running!

Your backend server is now running successfully on **http://localhost:5001**

## 🎯 Test the API Now

### Option 1: Using cURL (Terminal)

Open a **NEW terminal window** (keep the backend running) and try these commands:

#### 1. Test Health Check
```bash
curl http://localhost:5001/api/health
```
Expected response: `{"status":"ok","message":"Server is running"}`

#### 2. Login and Get Token
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john.manager","password":"password123"}'
```

You'll get a response like:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "employee_id": "EMP001",
    "username": "john.manager",
    "employee_name": "John Manager",
    ...
  }
}
```

**Copy the token value!**

#### 3. Get All Employees (Replace YOUR_TOKEN)
```bash
curl -X GET http://localhost:5001/api/employees \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 4. Get All Systems
```bash
curl -X GET http://localhost:5001/api/systems \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 5. Get All Roles
```bash
curl -X GET http://localhost:5001/api/roles \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 6. Get All Requests
```bash
curl -X GET http://localhost:5001/api/requests \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Option 2: Using Postman (Recommended)

1. **Download Postman**: https://www.postman.com/downloads/
2. **Install and open Postman**
3. **Import this collection** or create requests manually:

**Login Request:**
- Method: `POST`
- URL: `http://localhost:5001/api/auth/login`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
  ```json
  {
    "username": "john.manager",
    "password": "password123"
  }
  ```
- Click **Send**
- Copy the `token` from response

**Get Employees:**
- Method: `GET`
- URL: `http://localhost:5001/api/employees`
- Headers: 
  - `Authorization: Bearer YOUR_TOKEN_HERE`
- Click **Send**

**Create New Employee:**
- Method: `POST`
- URL: `http://localhost:5001/api/employees`
- Headers:
  - `Authorization: Bearer YOUR_TOKEN_HERE`
  - `Content-Type: application/json`
- Body (raw JSON):
  ```json
  {
    "employee_id": "EMP006",
    "employee_name": "Jane Smith",
    "employee_email": "jane.smith@company.com",
    "department": "HR",
    "branch": "HQ",
    "manager_id": "EMP001"
  }
  ```

### Option 3: Using VS Code Thunder Client Extension

1. Install "Thunder Client" extension in VS Code
2. Click Thunder Client icon in sidebar
3. Create new requests similar to Postman method

## 📊 Sample Data Available

### Login Credentials:
- **Manager:** Username: `john.manager` | Password: `password123`
- **Admin:** Username: `sarah.admin` | Password: `password123`

### Employees (5 total):
- EMP001 - John Manager (IT, HQ)
- EMP002 - Sarah Admin (IT, HQ)
- EMP003 - Mike Developer (IT, HQ)
- EMP004 - Lisa Analyst (Finance, HQ)
- EMP005 - Tom Designer (Marketing, Branch-A)

### Systems (4 total):
- SYS001 - SAP ERP
- SYS002 - Salesforce CRM
- SYS003 - JIRA
- SYS004 - GitHub

### Roles (9 total):
- Various roles across systems with Read/Write/Admin levels

### Requests (1 sample):
- REQ-20260502-0001 - Draft status for Mike Developer

## 🔧 Complete API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Employees
- `GET /api/employees` - List all
- `GET /api/employees/:id` - Get by ID
- `GET /api/employees/:id/subordinates` - Get subordinates
- `POST /api/employees` - Create new
- `PUT /api/employees/:id` - Update
- `DELETE /api/employees/:id` - Delete

### Systems
- `GET /api/systems` - List all
- `GET /api/systems/:id` - Get by ID
- `POST /api/systems` - Create new
- `PUT /api/systems/:id` - Update
- `DELETE /api/systems/:id` - Delete

### Roles
- `GET /api/roles` - List all
- `GET /api/roles/:id` - Get by ID
- `GET /api/roles/system/:systemId` - Get by system
- `POST /api/roles` - Create new
- `PUT /api/roles/:id` - Update
- `DELETE /api/roles/:id` - Delete

### Requests
- `GET /api/requests` - List all (supports filters: status, employee_id, manager_id)
- `GET /api/requests/:id` - Get by ID with items
- `POST /api/requests` - Create new
- `PUT /api/requests/:id` - Update (Draft only)
- `DELETE /api/requests/:id` - Delete (Draft only)
- `POST /api/requests/:id/submit` - Submit for approval
- `POST /api/requests/:id/approve` - Approve
- `POST /api/requests/:id/reject` - Reject

## 📝 Example: Create a New Request

```bash
curl -X POST http://localhost:5001/api/requests \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "request_description": "New employee onboarding - need access to development tools",
    "employee_id": "EMP003",
    "items": [
      {
        "system_id": "SYS003",
        "role_id": "ROLE006",
        "business_justification": "Need JIRA access for sprint planning and task management as part of the development team"
      },
      {
        "system_id": "SYS004",
        "role_id": "ROLE008",
        "business_justification": "Need GitHub contributor access to work on company repositories and collaborate with the team"
      }
    ]
  }'
```

## 🛑 Stop the Server

To stop the backend server:
1. Go to the terminal where the server is running
2. Press `Ctrl+C`

## 🔄 Restart the Server

```bash
cd /Users/babarbashir/Documents/Bobrogramming/systemrequest/backend
npm start
```

## 📚 Next Steps

### Option 1: Continue Testing the API
- Use Postman or cURL to test all endpoints
- Try creating, updating, and deleting records
- Test the request workflow (Draft → Submit → Approve/Reject)

### Option 2: Build the Frontend
- Follow the **IMPLEMENTATION_GUIDE.md** to build React components
- The backend is fully functional and ready for frontend integration

### Option 3: Use a Different Frontend
- Build with Vue.js, Angular, or plain JavaScript
- Create a mobile app with React Native or Flutter
- The API is framework-agnostic!

## 🐛 Troubleshooting

### Server won't start
- Check if port 5001 is available: `lsof -i :5001`
- Change port in `backend/.env` if needed

### Database errors
- Ensure database was initialized: `node src/config/initDatabase.js`
- Check database file exists: `ls -la ../database/`

### Authentication errors
- Make sure you're including the token in the Authorization header
- Token format: `Bearer YOUR_TOKEN_HERE`

## 📖 Documentation

- **SETUP_GUIDE.md** - Complete installation guide
- **README.md** - Project overview
- **TECHNICAL_PLAN.md** - Technical architecture
- **IMPLEMENTATION_GUIDE.md** - Frontend development guide
- **backend/README.md** - Backend API documentation

---

**🎉 Congratulations! Your backend is running and ready to use!**