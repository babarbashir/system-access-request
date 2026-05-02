# System Access Request Application

A full-stack web application for managing system access requests where managers can request multiple system accesses for employees in a single request.

## Features

✅ **Employee Management** - CRUD operations for employees with manager hierarchy
✅ **System Management** - CRUD operations for systems with ownership
✅ **Role Management** - CRUD operations for roles with security levels
✅ **Request Management** - Create requests with multiple system/role combinations
✅ **Request Workflow** - Draft → Submitted → Approved/Rejected status flow
✅ **Authentication** - JWT-based login/logout system
✅ **Validation** - Comprehensive form validation and unique ID checks
✅ **Business Justification** - Required for each system access request

## Technology Stack

### Backend
- **Node.js** with Express.js
- **SQLite3** database
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation

### Frontend
- **React 18** with Hooks
- **React Router** for navigation
- **Axios** for API calls
- **CSS3** for styling

## Project Structure

```
systemrequest/
├── backend/                    # Backend API server
│   ├── src/
│   │   ├── config/            # Database configuration
│   │   ├── middleware/        # Auth & validation middleware
│   │   ├── controllers/       # Business logic
│   │   ├── routes/            # API routes
│   │   └── server.js          # Express app entry point
│   ├── package.json
│   └── README.md
├── frontend/                   # React frontend application
│   ├── public/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API service layer
│   │   ├── context/           # React context (Auth)
│   │   ├── utils/             # Utility functions
│   │   ├── App.jsx            # Main app component
│   │   └── index.js           # React entry point
│   └── package.json
├── database/                   # SQLite database (auto-generated)
├── TECHNICAL_PLAN.md          # Detailed technical documentation
└── README.md                  # This file
```

## Prerequisites

- **Node.js** (v14 or higher)
- **npm** (v6 or higher)

## Installation & Setup

### 1. Clone or Download the Project

```bash
cd systemrequest
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Initialize database with sample data
npm run init-db

# Start the backend server
npm run dev
```

The backend server will start on `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the React development server
npm start
```

The frontend will start on `http://localhost:3000` and automatically open in your browser.

## Sample Login Credentials

After running `npm run init-db` in the backend, you can login with:

**Manager Account:**
- Username: `john.manager`
- Password: `password123`

**Admin Account:**
- Username: `sarah.admin`
- Password: `password123`

## Database Schema

### Entities

1. **Employee** - employee_id, employee_name, employee_email, department, branch, manager_id
2. **System** - system_id, system_name, description, business_function, owner_id
3. **Role** - role_id, role_name, system_id, description, security_level
4. **Request** - request_id, request_description, employee_id, manager_id, status
5. **Request Items** - Links requests to systems and roles with business justification

### Relationships

- Employee → Employee (manager relationship)
- System → Employee (owner)
- Role → System (belongs to)
- Request → Employee (for employee)
- Request → Employee (by manager)
- Request Items → Request, System, Role

## Key Features Explained

### Request Creation Workflow

**Section 1: Employee Selection**
- Manager selects an employee from dropdown
- Employee details auto-populate (name, ID, department, branch)
- Manager information auto-fills from logged-in user

**Section 2: System Access Details**
- Dynamic rows for selecting multiple systems
- For each system:
  - Select system from dropdown
  - Select role (filtered by selected system)
  - Enter business justification (minimum 20 characters)
- Add/remove rows as needed
- At least one system access required

### Request Status Workflow

```
Draft → Submitted → Approved/Rejected
```

- **Draft**: Manager can edit and delete
- **Submitted**: Read-only, awaiting approval
- **Approved**: Final state, access granted
- **Rejected**: Final state, access denied

### Validation Rules

**Employee:**
- Unique employee_id (alphanumeric uppercase)
- Valid email format
- All fields required except manager_id

**System:**
- Unique system_id (alphanumeric uppercase)
- Unique system_name
- Owner must exist

**Role:**
- Unique role_id (alphanumeric uppercase)
- Unique role_name per system
- Security level: Read, Write, or Admin

**Request:**
- Auto-generated unique request_id (format: REQ-YYYYMMDD-XXXX)
- Request description minimum 10 characters
- At least one system/role combination
- Business justification minimum 20 characters per item

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Employees
- `GET /api/employees` - List all
- `GET /api/employees/:id` - Get by ID
- `POST /api/employees` - Create
- `PUT /api/employees/:id` - Update
- `DELETE /api/employees/:id` - Delete

### Systems
- `GET /api/systems` - List all
- `GET /api/systems/:id` - Get by ID
- `POST /api/systems` - Create
- `PUT /api/systems/:id` - Update
- `DELETE /api/systems/:id` - Delete

### Roles
- `GET /api/roles` - List all
- `GET /api/roles/:id` - Get by ID
- `GET /api/roles/system/:systemId` - Get by system
- `POST /api/roles` - Create
- `PUT /api/roles/:id` - Update
- `DELETE /api/roles/:id` - Delete

### Requests
- `GET /api/requests` - List all (with filters)
- `GET /api/requests/:id` - Get by ID with items
- `POST /api/requests` - Create
- `PUT /api/requests/:id` - Update (Draft only)
- `DELETE /api/requests/:id` - Delete (Draft only)
- `POST /api/requests/:id/submit` - Submit for approval
- `POST /api/requests/:id/approve` - Approve
- `POST /api/requests/:id/reject` - Reject

## Development

### Backend Development

```bash
cd backend
npm run dev  # Runs with nodemon for auto-reload
```

### Frontend Development

```bash
cd frontend
npm start  # Runs React development server
```

### Database Reset

To reset the database with fresh sample data:

```bash
cd backend
rm -rf ../database/systemrequest.db  # Delete existing database
npm run init-db  # Recreate with sample data
```

## Production Build

### Backend

```bash
cd backend
npm start
```

### Frontend

```bash
cd frontend
npm run build
# Serve the build folder with a static server
```

## Troubleshooting

### Port Already in Use

If port 5000 or 3000 is already in use:

**Backend:** Change `PORT` in `backend/.env`
**Frontend:** Set `PORT` environment variable before starting

### Database Connection Issues

Ensure the database path in `backend/.env` is correct:
```
DB_PATH=../database/systemrequest.db
```

### CORS Issues

The backend is configured to allow all origins in development. For production, update CORS settings in `backend/src/server.js`.

## Security Notes

⚠️ **Important for Production:**

1. Change `JWT_SECRET` in `backend/.env` to a strong random string
2. Use environment variables for sensitive data
3. Implement rate limiting
4. Add HTTPS
5. Configure CORS for specific domains
6. Implement proper password policies
7. Add input sanitization
8. Enable security headers

## Sample Data

The database initialization creates:
- 5 sample employees (including managers)
- 4 systems (SAP ERP, Salesforce CRM, JIRA, GitHub)
- 9 roles across different systems
- 2 user accounts for login
- 1 sample request in Draft status

## Future Enhancements

- [ ] Email notifications for request submissions/approvals
- [ ] Request comments and history
- [ ] Bulk request operations
- [ ] Advanced filtering and search
- [ ] Export to PDF/Excel
- [ ] Audit logging
- [ ] Role-based access control refinement
- [ ] Request templates
- [ ] Dashboard with analytics

## Support

For issues or questions, please refer to:
- `TECHNICAL_PLAN.md` for detailed technical documentation
- `backend/README.md` for backend-specific information
- API documentation in the technical plan

## License

This project is for educational/demonstration purposes.

---

**Built with ❤️ using React, Node.js, and SQLite**