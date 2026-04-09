import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo">QuickEdit</Link>
        <div className="nav-links">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
          <Link to="/editor" className={location.pathname === '/editor' ? 'active' : ''}>Editor</Link>
        </div>
      </div>
    </nav>
  );
}