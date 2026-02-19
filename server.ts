import express from "express";
import { createServer as createViteServer } from "vite";
import session from "express-session";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("library.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  );

  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    department TEXT,
    phone TEXT
  );

  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    author TEXT,
    quantity INTEGER,
    available INTEGER
  );

  CREATE TABLE IF NOT EXISTS issue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    book_id INTEGER,
    issue_date TEXT,
    return_date TEXT,
    fine INTEGER DEFAULT 0,
    status TEXT DEFAULT 'issued',
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (book_id) REFERENCES books(id)
  );
`);

// Seed Admin if not exists
const adminCount = db.prepare("SELECT count(*) as count FROM admin").get() as { count: number };
if (adminCount.count === 0) {
  db.prepare("INSERT INTO admin (username, password) VALUES (?, ?)").run("admin", "admin123");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(session({
    secret: "library-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: false, // Set to true if using HTTPS
      maxAge: 24 * 60 * 60 * 1000 
    }
  }));

  // Auth Routes
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT * FROM admin WHERE username = ? AND password = ?").get(username, password) as any;
    if (user) {
      (req.session as any).userId = user.id;
      res.json({ success: true, user: { id: user.id, username: user.username } });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/me", (req, res) => {
    if ((req.session as any).userId) {
      const user = db.prepare("SELECT id, username FROM admin WHERE id = ?").get((req.session as any).userId);
      res.json({ authenticated: true, user });
    } else {
      res.json({ authenticated: false });
    }
  });

  // Dashboard Stats
  app.get("/api/stats", (req, res) => {
    const totalBooks = db.prepare("SELECT SUM(quantity) as total FROM books").get() as any;
    const totalStudents = db.prepare("SELECT COUNT(*) as total FROM students").get() as any;
    const issuedBooks = db.prepare("SELECT COUNT(*) as total FROM issue WHERE status = 'issued'").get() as any;
    res.json({
      totalBooks: totalBooks.total || 0,
      totalStudents: totalStudents.total || 0,
      issuedBooks: issuedBooks.total || 0
    });
  });

  // Books Routes
  app.get("/api/books", (req, res) => {
    const books = db.prepare("SELECT * FROM books").all();
    res.json(books);
  });

  app.post("/api/books", (req, res) => {
    const { title, author, quantity } = req.body;
    db.prepare("INSERT INTO books (title, author, quantity, available) VALUES (?, ?, ?, ?)").run(title, author, quantity, quantity);
    res.json({ success: true });
  });

  app.put("/api/books/:id", (req, res) => {
    const { title, author, quantity } = req.body;
    const book = db.prepare("SELECT * FROM books WHERE id = ?").get(req.params.id) as any;
    const diff = quantity - book.quantity;
    db.prepare("UPDATE books SET title = ?, author = ?, quantity = ?, available = available + ? WHERE id = ?").run(title, author, quantity, diff, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/books/:id", (req, res) => {
    db.prepare("DELETE FROM books WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Students Routes
  app.get("/api/students", (req, res) => {
    const students = db.prepare("SELECT * FROM students").all();
    res.json(students);
  });

  app.post("/api/students", (req, res) => {
    const { name, department, phone } = req.body;
    db.prepare("INSERT INTO students (name, department, phone) VALUES (?, ?, ?)").run(name, department, phone);
    res.json({ success: true });
  });

  // Issue/Return Routes
  app.post("/api/issue", (req, res) => {
    const { student_id, book_id, issue_date } = req.body;
    const book = db.prepare("SELECT available FROM books WHERE id = ?").get(book_id) as any;
    if (book && book.available > 0) {
      db.prepare("INSERT INTO issue (student_id, book_id, issue_date) VALUES (?, ?, ?)").run(student_id, book_id, issue_date);
      db.prepare("UPDATE books SET available = available - 1 WHERE id = ?").run(book_id);
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, message: "Book not available" });
    }
  });

  app.get("/api/issues", (req, res) => {
    const issues = db.prepare(`
      SELECT i.*, s.name as student_name, b.title as book_title 
      FROM issue i 
      JOIN students s ON i.student_id = s.id 
      JOIN books b ON i.book_id = b.id
      WHERE i.status = 'issued'
    `).all();
    res.json(issues);
  });

  app.post("/api/return", (req, res) => {
    const { issue_id, return_date } = req.body;
    const issue = db.prepare("SELECT * FROM issue WHERE id = ?").get(issue_id) as any;
    
    if (!issue) return res.status(404).json({ success: false, message: "Issue record not found" });

    const issueDate = new Date(issue.issue_date);
    const retDate = new Date(return_date);
    const diffTime = Math.abs(retDate.getTime() - issueDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let fine = 0;
    if (diffDays > 7) {
      fine = (diffDays - 7) * 2;
    }

    db.prepare("UPDATE issue SET return_date = ?, fine = ?, status = 'returned' WHERE id = ?").run(return_date, fine, issue_id);
    db.prepare("UPDATE books SET available = available + 1 WHERE id = ?").run(issue.book_id);
    
    res.json({ success: true, fine });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
