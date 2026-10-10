import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Heart, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/authState';
import Brand from './Brand';

export default function Navbar() {
  const { user, logout, favorites, notify } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  function signOut() {
    logout();
    setOpen(false);
    navigate('/templates');
    notify('You’re logged out. See you soon.');
  }
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Brand />
        <nav className={`main-nav ${open ? 'is-open' : ''}`} aria-label="Main navigation">
          <NavLink to="/templates" onClick={() => setOpen(false)}>
            Discover
          </NavLink>
          <NavLink to="/favorites" onClick={() => setOpen(false)}>
            <Heart size={15} /> My favorites{' '}
            {user && <span className="nav-count">{favorites.length}</span>}
          </NavLink>
        </nav>
        <div className="header-actions">
          {user ? (
            <>
              <span className="user-label">
                <span className="avatar">{user.name?.slice(0, 1).toUpperCase()}</span>
                <span>{user.name?.split(' ')[0]}</span>
              </span>
              <button
                className="icon-button logout-button"
                title="Log out"
                aria-label="Log out"
                onClick={signOut}
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link className="login-link" to="/login">
                Log in
              </Link>
              <Link className="button button-dark button-small" to="/register">
                Create account <ArrowUpRight size={16} />
              </Link>
            </>
          )}
          <button
            className="icon-button mobile-menu"
            aria-label={open ? 'Close navigation' : 'Open navigation'}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}
