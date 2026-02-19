import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  ArrowUpRight, 
  ArrowDownLeft, 
  LogOut, 
  Plus, 
  Search,
  Trash2,
  Edit2,
  BookMarked,
  Library
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface Book {
  id: number;
  title: string;
  author: string;
  quantity: number;
  available: number;
}

interface Student {
  id: number;
  name: string;
  department: string;
  phone: string;
}

interface Issue {
  id: number;
  student_id: number;
  book_id: number;
  student_name: string;
  book_title: string;
  issue_date: string;
  status: string;
}

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

const Card = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
    <div>
      <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
    </div>
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
  </div>
);

export default function App() {
  const [view, setView] = useState('dashboard');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalBooks: 0, totalStudents: 0, issuedBooks: 0 });
  const [books, setBooks] = useState<Book[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  
  // Auth State
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchBooks();
      fetchStudents();
      fetchIssues();
    }
  }, [user, view]);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/me');
      const data = await res.json();
      if (data.authenticated) setUser(data.user);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData)
    });
    const data = await res.json();
    if (data.success) setUser(data.user);
    else alert(data.message);
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    setUser(null);
  };

  const fetchStats = async () => {
    const res = await fetch('/api/stats');
    setStats(await res.json());
  };

  const fetchBooks = async () => {
    const res = await fetch('/api/books');
    setBooks(await res.json());
  };

  const fetchStudents = async () => {
    const res = await fetch('/api/students');
    setStudents(await res.json());
  };

  const fetchIssues = async () => {
    const res = await fetch('/api/issues');
    setIssues(await res.json());
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200 w-full max-w-md border border-slate-100"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-indigo-600 p-4 rounded-2xl">
              <Library className="text-white" size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">Lumina Library</h2>
          <p className="text-slate-500 text-center mb-8">Sign in to manage your collection</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Username</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="admin"
                value={loginData.username}
                onChange={e => setLoginData({...loginData, username: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
              <input 
                type="password" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                value={loginData.password}
                onChange={e => setLoginData({...loginData, password: e.target.value})}
              />
            </div>
            <button className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">
              Sign In
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col">
        <div className="flex items-center space-x-3 mb-10 px-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Library className="text-white" size={20} />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">Lumina</span>
        </div>

        <nav className="space-y-2 flex-1">
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            active={view === 'dashboard'} 
            onClick={() => setView('dashboard')} 
          />
          <SidebarItem 
            icon={BookOpen} 
            label="Books" 
            active={view === 'books'} 
            onClick={() => setView('books')} 
          />
          <SidebarItem 
            icon={Users} 
            label="Students" 
            active={view === 'students'} 
            onClick={() => setView('students')} 
          />
          <SidebarItem 
            icon={BookMarked} 
            label="Issue Book" 
            active={view === 'issue'} 
            onClick={() => setView('issue')} 
          />
          <SidebarItem 
            icon={ArrowDownLeft} 
            label="Returns" 
            active={view === 'return'} 
            onClick={() => setView('return')} 
          />
        </nav>

        <button 
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all mt-auto"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 capitalize">{view}</h1>
            <p className="text-slate-500">Welcome back, {user.username}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {view === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <Card title="Total Books" value={stats.totalBooks} icon={BookOpen} color="bg-blue-500" />
              <Card title="Total Students" value={stats.totalStudents} icon={Users} color="bg-emerald-500" />
              <Card title="Issued Books" value={stats.issuedBooks} icon={ArrowUpRight} color="bg-orange-500" />
              
              <div className="md:col-span-3 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Activity</h3>
                <div className="space-y-4">
                  {issues.slice(0, 5).map(issue => (
                    <div key={issue.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center space-x-4">
                        <div className="bg-white p-2 rounded-lg border border-slate-200">
                          <BookMarked size={20} className="text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{issue.book_title}</p>
                          <p className="text-sm text-slate-500">Issued to {issue.student_name}</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-slate-400">{new Date(issue.issue_date).toLocaleDateString()}</span>
                    </div>
                  ))}
                  {issues.length === 0 && <p className="text-slate-400 text-center py-8">No recent activity</p>}
                </div>
              </div>
            </motion.div>
          )}

          {view === 'books' && (
            <BooksView books={books} onRefresh={fetchBooks} />
          )}

          {view === 'students' && (
            <StudentsView students={students} onRefresh={fetchStudents} />
          )}

          {view === 'issue' && (
            <IssueView books={books} students={students} onRefresh={() => { fetchIssues(); fetchStats(); }} />
          )}

          {view === 'return' && (
            <ReturnView issues={issues} onRefresh={() => { fetchIssues(); fetchStats(); }} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// --- Sub-Views ---

function BooksView({ books, onRefresh }: { books: Book[], onRefresh: () => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ title: '', author: '', quantity: 1 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setShowAdd(false);
    setFormData({ title: '', author: '', quantity: 1 });
    onRefresh();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure?')) {
      await fetch(`/api/books/${id}`, { method: 'DELETE' });
      onRefresh();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-900">Book Inventory</h3>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center space-x-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} />
          <span>Add New Book</span>
        </button>
      </div>

      {showAdd && (
        <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-lg shadow-indigo-50">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input 
              placeholder="Title" className="px-4 py-2 border rounded-lg outline-none focus:ring-2 ring-indigo-500"
              value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required
            />
            <input 
              placeholder="Author" className="px-4 py-2 border rounded-lg outline-none focus:ring-2 ring-indigo-500"
              value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} required
            />
            <input 
              type="number" placeholder="Qty" className="px-4 py-2 border rounded-lg outline-none focus:ring-2 ring-indigo-500"
              value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})} required
            />
            <div className="md:col-span-3 flex justify-end space-x-3">
              <button type="button" onClick={() => setShowAdd(false)} className="text-slate-500 px-4 py-2">Cancel</button>
              <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg">Save Book</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-bottom border-slate-100">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Title</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Author</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-center">Total</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-center">Available</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {books.map(book => (
              <tr key={book.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{book.title}</td>
                <td className="px-6 py-4 text-slate-500">{book.author}</td>
                <td className="px-6 py-4 text-center text-slate-500">{book.quantity}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${book.available > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {book.available}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button className="text-slate-400 hover:text-indigo-600"><Edit2 size={18} /></button>
                  <button onClick={() => handleDelete(book.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function StudentsView({ students, onRefresh }: { students: Student[], onRefresh: () => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ name: '', department: '', phone: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setShowAdd(false);
    setFormData({ name: '', department: '', phone: '' });
    onRefresh();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-900">Student Directory</h3>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center space-x-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} />
          <span>Register Student</span>
        </button>
      </div>

      {showAdd && (
        <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-lg shadow-indigo-50">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input 
              placeholder="Full Name" className="px-4 py-2 border rounded-lg outline-none focus:ring-2 ring-indigo-500"
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required
            />
            <input 
              placeholder="Department" className="px-4 py-2 border rounded-lg outline-none focus:ring-2 ring-indigo-500"
              value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} required
            />
            <input 
              placeholder="Phone Number" className="px-4 py-2 border rounded-lg outline-none focus:ring-2 ring-indigo-500"
              value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required
            />
            <div className="md:col-span-3 flex justify-end space-x-3">
              <button type="button" onClick={() => setShowAdd(false)} className="text-slate-500 px-4 py-2">Cancel</button>
              <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg">Register</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-bottom border-slate-100">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Name</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Department</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Phone</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map(student => (
              <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{student.name}</td>
                <td className="px-6 py-4 text-slate-500">{student.department}</td>
                <td className="px-6 py-4 text-slate-500">{student.phone}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button className="text-slate-400 hover:text-indigo-600"><Edit2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function IssueView({ books, students, onRefresh }: { books: Book[], students: Student[], onRefresh: () => void }) {
  const [formData, setFormData] = useState({ student_id: '', book_id: '', issue_date: new Date().toISOString().split('T')[0] });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/issue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (data.success) {
      alert('Book issued successfully!');
      setFormData({ student_id: '', book_id: '', issue_date: new Date().toISOString().split('T')[0] });
      onRefresh();
    } else {
      alert(data.message);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Issue a Book</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Select Student</label>
            <select 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 ring-indigo-500"
              value={formData.student_id} onChange={e => setFormData({...formData, student_id: e.target.value})} required
            >
              <option value="">Choose a student...</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.department})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Select Book</label>
            <select 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 ring-indigo-500"
              value={formData.book_id} onChange={e => setFormData({...formData, book_id: e.target.value})} required
            >
              <option value="">Choose a book...</option>
              {books.filter(b => b.available > 0).map(b => <option key={b.id} value={b.id}>{b.title} by {b.author}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Issue Date</label>
            <input 
              type="date" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 ring-indigo-500"
              value={formData.issue_date} onChange={e => setFormData({...formData, issue_date: e.target.value})} required
            />
          </div>
          <button className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
            Confirm Issue
          </button>
        </form>
      </div>
    </motion.div>
  );
}

function ReturnView({ issues, onRefresh }: { issues: Issue[], onRefresh: () => void }) {
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);

  const handleReturn = async (issueId: number) => {
    const res = await fetch('/api/return', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ issue_id: issueId, return_date: returnDate })
    });
    const data = await res.json();
    if (data.success) {
      alert(`Book returned! Fine: ₹${data.fine}`);
      onRefresh();
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-900">Active Issues</h3>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-slate-500 font-medium">Return Date:</span>
          <input 
            type="date" className="px-4 py-2 border rounded-xl outline-none focus:ring-2 ring-indigo-500"
            value={returnDate} onChange={e => setReturnDate(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-bottom border-slate-100">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Student</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Book</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Issue Date</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {issues.map(issue => (
              <tr key={issue.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{issue.student_name}</td>
                <td className="px-6 py-4 text-slate-500">{issue.book_title}</td>
                <td className="px-6 py-4 text-slate-500">{new Date(issue.issue_date).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleReturn(issue.id)}
                    className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-lg font-bold hover:bg-emerald-100 transition-colors"
                  >
                    Return Book
                  </button>
                </td>
              </tr>
            ))}
            {issues.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">No books currently issued</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
