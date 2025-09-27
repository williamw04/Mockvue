const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Initialize database with proper path handling
const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Serialize ensures operations execute sequentially
db.serialize(() => {
  // Create table with proper constraints
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Prepared statements for security and performance
  const stmt = db.prepare("INSERT INTO users (name, email) VALUES (?, ?)");
  stmt.run("Alice", "alice@example.com");
  stmt.run("Bob", "bob@example.com");
  stmt.run("Charlie", "charlie@example.com");
  stmt.finalize(); // Important: release prepared statement

  // Query with callback
  db.each("SELECT id, name, email FROM users", (err, row) => {
    if (err) {
      console.error('Query error:', err.message);
    } else {
      console.log(`${row.id}: ${row.name} (${row.email})`);
    }
  });
});

// Export functions for IPC handlers
function getUsers() {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM users ORDER BY name", (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function addUser(name, email) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare("INSERT INTO users (name, email) VALUES (?, ?)");
    stmt.run(name, email, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, name, email });
      }
    });
    stmt.finalize();
  });
}

function deleteUser(id) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare("DELETE FROM users WHERE id = ?");
    stmt.run(id, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ changes: this.changes });
      }
    });
    stmt.finalize();
  });
}

module.exports = { getUsers, addUser, deleteUser };
