import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';

function NavBar() {
  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-primary/15 text-primary-light'
        : 'text-text-muted hover:text-text hover:bg-surface-light/20'
    }`;

  return (
    <nav className="bg-surface/80 backdrop-blur-xl border-b border-surface-light/20 sticky top-0 z-50">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <span className="text-lg font-bold bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
          HabitTracker
        </span>
        <div className="flex gap-1">
          <NavLink to="/" className={linkClass}>Dashboard</NavLink>
          <NavLink to="/admin" className={linkClass}>Admin</NavLink>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-bg">
        <NavBar />
        <main className="pb-20">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
