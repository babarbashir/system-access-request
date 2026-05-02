# System Access Request - Backend API

Backend API server for the System Access Request Application built with Node.js, Express, and SQLite.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

## Database Setup

Initialize the database with tables and sample data:

```bash
npm run init-db
```

This will create:
- All required tables (employees, systems, roles, requests, request_items, users)
- Sample data including:
  - 5 employees
  - 4 systems
  - 9 roles
  - 2 users (for login)
  - 1 sample request

## Sample Login Credentials

After running `npm run init-db`, you can login with:

**Manager Account:**
- Username: `john.manager`
- Password: `password123`

**Admin Account:**
- Username: `sarah.admin`
- Password: `password123`

## Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### Employees
- `GET /api/employees` - List all employees
- `GET /api/employees/:id` - Get employee by ID
- `GET /api/employees/:id/subordinates` - Get employee's subordinates
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Systems
- `GET /api/systems` - List all systems
- `GET /api/systems/:id` - Get system by ID
- `POST /api/systems` - Create new system
- `PUT /api/systems/:id` - Update system
- `DELETE /api/systems/:id` - Delete system

### Roles
- `GET /api/roles` - List all roles
- `GET /api/roles/:id` - Get role by ID
- `GET /api/roles/system/:systemId` - Get roles for a specific system
- `POST /api/roles` - Create new role
- `PUT /api/roles/:id` - Update role
- `DELETE /api/roles/:id` - Delete role

### Requests
- `GET /api/requests` - List all requests (supports filtering)
- `GET /api/requests/:id` - Get request by ID with items
- `POST /api/requests` - Create new request
- `PUT /api/requests/:id` - Update request (Draft only)
- `DELETE /api/requests/:id` - Delete request (Draft only)
- `POST /api/requests/:id/submit` - Submit request for approval
- `POST /api/requests/:id/approve` - Approve request
- `POST /api/requests/:id/reject` - Reject request

## Request Status Workflow

```
Draft → Submitted → Approved/Rejected
```

- **Draft**: Can be edited and deleted
- **Submitted**: Read-only, awaiting approval
- **Approved/Rejected**: Final states

## Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h
NODE_ENV=development
DB_PATH=../database/systemrequest.db
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # Database connection
│   │   └── initDatabase.js      # Database initialization
│   ├── middleware/
│   │   ├── auth.js              # Authentication middleware
│   │   └── validation.js        # Request validation
│   ├── models/                  # (Future: Model classes)
│   ├── routes/
│   │   ├── auth.js              # Auth routes
│   │   ├── employees.js         # Employee routes
│   │   ├── systems.js           # System routes
│   │   ├── roles.js             # Role routes
│   │   └── requests.js          # Request routes
│   ├── controllers/
│   │   ├── authController.js    # Auth logic
│   │   ├── employeeController.js
│   │   ├── systemController.js
│   │   ├── roleController.js
│   │   └── requestController.js
│   └── server.js                # Express app entry point
├── package.json
└── .env
```

## Testing the API

You can test the API using tools like:
- Postman
- cURL
- Thunder Client (VS Code extension)

### Example: Login Request

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john.manager","password":"password123"}'
```

### Example: Get Employees (with auth token)

```bash
curl -X GET http://localhost:5000/api/employees \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Features

✅ JWT-based authentication
✅ Request validation with express-validator
✅ Foreign key constraints
✅ Unique ID validation
✅ Request status workflow
✅ Cascade delete protection
✅ Comprehensive error handling
✅ CORS enabled for frontend integration

## Notes

- All routes except `/api/auth/login` require authentication
- Employee IDs, System IDs, and Role IDs must be unique and alphanumeric uppercase
- Requests can only be edited/deleted when in Draft status
- The database file is created in the `database/` directory at the project root