const database = require('./database');
const bcrypt = require('bcryptjs');

const createTables = async () => {
  try {
    await database.connect();

    // Create Employees table
    await database.run(`
      CREATE TABLE IF NOT EXISTS employees (
        employee_id TEXT PRIMARY KEY,
        employee_name TEXT NOT NULL,
        employee_email TEXT NOT NULL UNIQUE,
        department TEXT NOT NULL,
        branch TEXT NOT NULL,
        manager_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (manager_id) REFERENCES employees(employee_id) ON DELETE SET NULL
      )
    `);
    console.log('✓ Employees table created');

    // Create Systems table
    await database.run(`
      CREATE TABLE IF NOT EXISTS systems (
        system_id TEXT PRIMARY KEY,
        system_name TEXT NOT NULL UNIQUE,
        description TEXT,
        business_function TEXT NOT NULL,
        owner_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES employees(employee_id) ON DELETE RESTRICT
      )
    `);
    console.log('✓ Systems table created');

    // Create Roles table
    await database.run(`
      CREATE TABLE IF NOT EXISTS roles (
        role_id TEXT PRIMARY KEY,
        role_name TEXT NOT NULL,
        system_id TEXT NOT NULL,
        description TEXT,
        security_level TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (system_id) REFERENCES systems(system_id) ON DELETE CASCADE,
        UNIQUE(role_name, system_id)
      )
    `);
    console.log('✓ Roles table created');

    // Create Requests table
    await database.run(`
      CREATE TABLE IF NOT EXISTS requests (
        request_id TEXT PRIMARY KEY,
        request_description TEXT NOT NULL,
        employee_id TEXT NOT NULL,
        manager_id TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Draft',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        submitted_at DATETIME,
        approved_at DATETIME,
        approved_by TEXT,
        FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE RESTRICT,
        FOREIGN KEY (manager_id) REFERENCES employees(employee_id) ON DELETE RESTRICT,
        FOREIGN KEY (approved_by) REFERENCES employees(employee_id) ON DELETE SET NULL,
        CHECK (status IN ('Draft', 'Submitted', 'Approved', 'Rejected'))
      )
    `);
    console.log('✓ Requests table created');

    // Create Request Items table
    await database.run(`
      CREATE TABLE IF NOT EXISTS request_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        request_id TEXT NOT NULL,
        system_id TEXT NOT NULL,
        role_id TEXT NOT NULL,
        business_justification TEXT NOT NULL,
        sequence_number INTEGER NOT NULL,
        FOREIGN KEY (request_id) REFERENCES requests(request_id) ON DELETE CASCADE,
        FOREIGN KEY (system_id) REFERENCES systems(system_id) ON DELETE RESTRICT,
        FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE RESTRICT
      )
    `);
    console.log('✓ Request Items table created');

    // Create Users table for authentication
    await database.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id TEXT NOT NULL UNIQUE,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'Manager',
        last_login DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Users table created');

    // Insert sample data
    await insertSampleData();

    console.log('\n✅ Database initialization completed successfully!');
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    throw error;
  } finally {
    await database.close();
  }
};

const insertSampleData = async () => {
  try {
    // Check if data already exists
    const existingEmployee = await database.get('SELECT * FROM employees LIMIT 1');
    if (existingEmployee) {
      console.log('Sample data already exists, skipping insertion');
      return;
    }

    console.log('\nInserting sample data...');

    // Insert sample employees
    const employees = [
      { id: 'EMP001', name: 'John Manager', email: 'john.manager@company.com', dept: 'IT', branch: 'HQ', manager: null },
      { id: 'EMP002', name: 'Sarah Admin', email: 'sarah.admin@company.com', dept: 'IT', branch: 'HQ', manager: null },
      { id: 'EMP003', name: 'Mike Developer', email: 'mike.dev@company.com', dept: 'IT', branch: 'HQ', manager: 'EMP001' },
      { id: 'EMP004', name: 'Lisa Analyst', email: 'lisa.analyst@company.com', dept: 'Finance', branch: 'HQ', manager: 'EMP001' },
      { id: 'EMP005', name: 'Tom Designer', email: 'tom.designer@company.com', dept: 'Marketing', branch: 'Branch-A', manager: 'EMP001' }
    ];

    for (const emp of employees) {
      await database.run(
        'INSERT INTO employees (employee_id, employee_name, employee_email, department, branch, manager_id) VALUES (?, ?, ?, ?, ?, ?)',
        [emp.id, emp.name, emp.email, emp.dept, emp.branch, emp.manager]
      );
    }
    console.log('✓ Sample employees inserted');

    // Insert sample systems
    const systems = [
      { id: 'SYS001', name: 'SAP ERP', desc: 'Enterprise Resource Planning System', func: 'Finance & Operations', owner: 'EMP002' },
      { id: 'SYS002', name: 'Salesforce CRM', desc: 'Customer Relationship Management', func: 'Sales & Marketing', owner: 'EMP002' },
      { id: 'SYS003', name: 'JIRA', desc: 'Project Management Tool', func: 'Project Management', owner: 'EMP001' },
      { id: 'SYS004', name: 'GitHub', desc: 'Version Control System', func: 'Development', owner: 'EMP001' }
    ];

    for (const sys of systems) {
      await database.run(
        'INSERT INTO systems (system_id, system_name, description, business_function, owner_id) VALUES (?, ?, ?, ?, ?)',
        [sys.id, sys.name, sys.desc, sys.func, sys.owner]
      );
    }
    console.log('✓ Sample systems inserted');

    // Insert sample roles
    const roles = [
      { id: 'ROLE001', name: 'Viewer', system: 'SYS001', desc: 'Read-only access', level: 'Read' },
      { id: 'ROLE002', name: 'Editor', system: 'SYS001', desc: 'Read and write access', level: 'Write' },
      { id: 'ROLE003', name: 'Administrator', system: 'SYS001', desc: 'Full administrative access', level: 'Admin' },
      { id: 'ROLE004', name: 'Sales User', system: 'SYS002', desc: 'Standard sales user', level: 'Write' },
      { id: 'ROLE005', name: 'Sales Manager', system: 'SYS002', desc: 'Sales management access', level: 'Admin' },
      { id: 'ROLE006', name: 'Developer', system: 'SYS003', desc: 'Developer access to JIRA', level: 'Write' },
      { id: 'ROLE007', name: 'Project Manager', system: 'SYS003', desc: 'Project management access', level: 'Admin' },
      { id: 'ROLE008', name: 'Contributor', system: 'SYS004', desc: 'Code contributor', level: 'Write' },
      { id: 'ROLE009', name: 'Maintainer', system: 'SYS004', desc: 'Repository maintainer', level: 'Admin' }
    ];

    for (const role of roles) {
      await database.run(
        'INSERT INTO roles (role_id, role_name, system_id, description, security_level) VALUES (?, ?, ?, ?, ?)',
        [role.id, role.name, role.system, role.desc, role.level]
      );
    }
    console.log('✓ Sample roles inserted');

    // Insert sample users with hashed passwords
    const password = await bcrypt.hash('password123', 10);
    const users = [
      { empId: 'EMP001', username: 'john.manager', role: 'Manager' },
      { empId: 'EMP002', username: 'sarah.admin', role: 'Admin' }
    ];

    for (const user of users) {
      await database.run(
        'INSERT INTO users (employee_id, username, password_hash, role) VALUES (?, ?, ?, ?)',
        [user.empId, user.username, password, user.role]
      );
    }
    console.log('✓ Sample users inserted (username: john.manager or sarah.admin, password: password123)');

    // Insert a sample request
    await database.run(
      'INSERT INTO requests (request_id, request_description, employee_id, manager_id, status) VALUES (?, ?, ?, ?, ?)',
      ['REQ-20260502-0001', 'Access request for new developer onboarding', 'EMP003', 'EMP001', 'Draft']
    );

    await database.run(
      'INSERT INTO request_items (request_id, system_id, role_id, business_justification, sequence_number) VALUES (?, ?, ?, ?, ?)',
      ['REQ-20260502-0001', 'SYS003', 'ROLE006', 'Need JIRA access for sprint planning and task management', 1]
    );

    await database.run(
      'INSERT INTO request_items (request_id, system_id, role_id, business_justification, sequence_number) VALUES (?, ?, ?, ?, ?)',
      ['REQ-20260502-0001', 'SYS004', 'ROLE008', 'Need GitHub access for code repository management', 2]
    );

    console.log('✓ Sample request inserted');

  } catch (error) {
    console.error('Error inserting sample data:', error.message);
    throw error;
  }
};

// Run initialization if this file is executed directly
if (require.main === module) {
  createTables().catch(console.error);
}

module.exports = { createTables, insertSampleData };

// Made with Bob
