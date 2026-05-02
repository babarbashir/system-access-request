# How to Start the Application

## ✅ Backend is Already Running!

Your backend server is running on **http://localhost:5001**

## 🚀 Start the Frontend

Open a **NEW terminal window** (keep the backend running) and run:

```bash
cd /Users/babarbashir/Documents/Bobrogramming/systemrequest/frontend
npm install
npm start
```

The React app will start on **http://localhost:3000** and automatically open in your browser.

## 🔑 Login Credentials

Once the app opens, login with:
- **Username:** `john.manager`
- **Password:** `password123`

## 📱 What You'll See

After logging in, you'll have access to:

1. **Dashboard** - Overview with statistics
2. **Employees** - View all 5 sample employees
3. **Systems** - View all 4 systems (SAP, Salesforce, JIRA, GitHub)
4. **Roles** - View all 9 roles across systems
5. **Requests** - View the sample request

## 🛑 To Stop

- **Frontend:** Press `Ctrl+C` in the frontend terminal
- **Backend:** Press `Ctrl+C` in the backend terminal

## 🔄 To Restart

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm start
```

## 📝 Note

The frontend currently shows data in read-only tables. Full CRUD operations and the request creation form can be added following the IMPLEMENTATION_GUIDE.md.