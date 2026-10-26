import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <div>
          <div className="footer-brand">Gather &amp; Co.</div>
          <p className="footer-text">
            Thoughtful event planning, powered by AI.
          </p>
        </div>
        <nav className="footer-links">
          <Link to="/">Discover</Link>
          <Link to="/create">Plan Event</Link>
          <Link to="/saved">My Events</Link>
        </nav>
      </div>
    </footer>
  );
}
