import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Calendar, Menu, X, PlusCircle } from 'lucide-react';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="app-header">
      <div className="header-inner">
        <Link to="/" className="header-logo" onClick={closeMobile}>
          <span className="logo-mark">G&amp;C</span>
          <span className="logo-text">Gather &amp; Co.</span>
          <span className="logo-sub">Event Studio</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="header-nav header-nav-desktop">
          <Link
            to="/"
            className={`header-nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            <Sparkles size={14} className="nav-icon" />
            Discover
          </Link>
          <Link
            to="/saved"
            className={`header-nav-link ${location.pathname === '/saved' || location.pathname === '/my-events' ? 'active' : ''}`}
          >
            <Calendar size={14} className="nav-icon" />
            My Events
          </Link>
          <button
            className="btn btn-primary btn-sm header-cta"
            onClick={() => navigate('/create')}
          >
            <PlusCircle size={14} />
            Plan an Event
          </button>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileOpen(prev => !prev)}
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="mobile-nav-drawer" role="dialog" aria-label="Mobile Navigation">
          <Link
            to="/"
            className={`mobile-nav-link ${location.pathname === '/' ? 'active' : ''}`}
            onClick={closeMobile}
          >
            <Sparkles size={16} />
            Discover
          </Link>
          <Link
            to="/saved"
            className={`mobile-nav-link ${location.pathname === '/saved' || location.pathname === '/my-events' ? 'active' : ''}`}
            onClick={closeMobile}
          >
            <Calendar size={16} />
            My Events
          </Link>
          <button
            className="btn btn-primary btn-sm mobile-nav-cta"
            onClick={() => {
              closeMobile();
              navigate('/create');
            }}
          >
            <PlusCircle size={15} />
            Plan an Event
          </button>
        </div>
      )}
    </header>
  );
}
