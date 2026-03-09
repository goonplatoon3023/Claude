import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
  savedCount: number;
}

export function Layout({ children, savedCount }: LayoutProps) {
  return (
    <div className="layout">
      <header className="navbar">
        <div className="navbar-brand">
          <span className="navbar-logo">📰</span>
          <span className="navbar-title">ReadWise</span>
        </div>
        <nav className="navbar-nav">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Today's Feed
          </NavLink>
          <NavLink to="/saved" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Saved
            {savedCount > 0 && <span className="nav-badge">{savedCount}</span>}
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Settings
          </NavLink>
        </nav>
      </header>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
