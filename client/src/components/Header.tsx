import { Link, useLocation } from 'react-router-dom';
import { PartyPopper, PlusCircle, FolderOpen } from 'lucide-react';

export default function Header() {
  const location = useLocation();

  return (
    <header className="app-header">
      <div className="header-inner">
        <Link to="/" className="header-logo">
          <div className="logo-icon">
            <PartyPopper size={22} />
          </div>
          Celebration Planner
        </Link>
        <nav className="header-nav">
          <Link
            to="/create"
            className={`header-nav-link ${location.pathname === '/create' ? 'active' : ''}`}
          >
            <PlusCircle size={18} />
            <span>Plan Event</span>
          </Link>
          <Link
            to="/saved"
            className={`header-nav-link ${location.pathname === '/saved' ? 'active' : ''}`}
          >
            <FolderOpen size={18} />
            <span>Saved Plans</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
