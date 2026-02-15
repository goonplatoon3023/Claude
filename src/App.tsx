import { useState } from 'react';
import { StoreProvider } from './store/useAppStore';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import GoalsPage from './pages/GoalsPage';
import LiftsPage from './pages/LiftsPage';
import HeartRatePage from './pages/HeartRatePage';
import WorkoutPlanPage from './pages/WorkoutPlanPage';
import NutritionPlanPage from './pages/NutritionPlanPage';

type Page = 'dashboard' | 'profile' | 'goals' | 'lifts' | 'heartrate' | 'workout' | 'nutrition';

interface NavItem {
  key: Page;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: '\u2302' },
  { key: 'profile', label: 'Profile', icon: '\u263A' },
  { key: 'goals', label: 'Goals', icon: '\u2691' },
  { key: 'lifts', label: 'Lifts', icon: '\u2616' },
  { key: 'workout', label: 'Workout Plan', icon: '\u2699' },
  { key: 'nutrition', label: 'Nutrition', icon: '\u2615' },
  { key: 'heartrate', label: 'Heart Rate', icon: '\u2665' },
];

function AppContent() {
  const [page, setPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <DashboardPage />;
      case 'profile': return <ProfilePage />;
      case 'goals': return <GoalsPage />;
      case 'lifts': return <LiftsPage />;
      case 'heartrate': return <HeartRatePage />;
      case 'workout': return <WorkoutPlanPage />;
      case 'nutrition': return <NutritionPlanPage />;
    }
  };

  return (
    <div style={styles.app}>
      {/* Mobile Header */}
      <div style={styles.mobileHeader}>
        <button
          style={styles.hamburger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? '\u2715' : '\u2630'}
        </button>
        <span style={styles.mobileBrandText}>FitForge</span>
      </div>

      {/* Sidebar Overlay for mobile */}
      {sidebarOpen && (
        <div
          style={styles.overlay}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        ...styles.sidebar,
        ...(sidebarOpen ? styles.sidebarOpen : {}),
      }}>
        {/* Brand */}
        <div style={styles.brand}>
          <div style={styles.brandIcon}>F</div>
          <span style={styles.brandText}>FitForge</span>
        </div>

        {/* Navigation */}
        <nav style={styles.nav}>
          {NAV_ITEMS.map((item) => {
            const isActive = page === item.key;
            return (
              <button
                key={item.key}
                data-active={isActive ? 'true' : 'false'}
                onClick={() => {
                  setPage(item.key);
                  setSidebarOpen(false);
                }}
                style={{
                  ...styles.navItem,
                  ...(isActive ? styles.navItemActive : {}),
                }}
              >
                <span style={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={styles.sidebarFooter}>
          <div style={{ fontSize: 11, color: '#64748b', textAlign: 'center' }}>
            FitForge v1.0
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        {renderPage()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}

const styles = {
  app: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#0f172a',
  } as React.CSSProperties,
  mobileHeader: {
    display: 'none',
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    backgroundColor: '#020617',
    borderBottom: '1px solid #1e293b',
    alignItems: 'center',
    padding: '0 16px',
    zIndex: 100,
    gap: 12,
  } as React.CSSProperties,
  hamburger: {
    background: 'none',
    border: 'none',
    color: '#f8fafc',
    fontSize: 24,
    cursor: 'pointer',
    padding: '4px 8px',
  } as React.CSSProperties,
  mobileBrandText: {
    fontSize: 18,
    fontWeight: 700,
    color: '#f8fafc',
  } as React.CSSProperties,
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 199,
  } as React.CSSProperties,
  sidebar: {
    width: 240,
    backgroundColor: '#020617',
    borderRight: '1px solid #1e293b',
    display: 'flex',
    flexDirection: 'column' as const,
    position: 'fixed' as const,
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 200,
    overflowY: 'auto' as const,
  } as React.CSSProperties,
  sidebarOpen: {
    transform: 'translateX(0)',
  } as React.CSSProperties,
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '20px 20px 16px',
    borderBottom: '1px solid #1e293b',
  } as React.CSSProperties,
  brandIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    fontWeight: 800,
    flexShrink: 0,
  } as React.CSSProperties,
  brandText: {
    fontSize: 20,
    fontWeight: 700,
    color: '#f8fafc',
    letterSpacing: '-0.02em',
  } as React.CSSProperties,
  nav: {
    flex: 1,
    padding: '12px 8px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
  } as React.CSSProperties,
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 14px',
    borderRadius: 8,
    border: 'none',
    background: 'transparent',
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    textAlign: 'left' as const,
    width: '100%',
  } as React.CSSProperties,
  navItemActive: {
    backgroundColor: '#1e293b',
    color: '#f8fafc',
    fontWeight: 600,
  } as React.CSSProperties,
  navIcon: {
    fontSize: 16,
    width: 20,
    textAlign: 'center' as const,
    flexShrink: 0,
  } as React.CSSProperties,
  sidebarFooter: {
    padding: '12px 16px',
    borderTop: '1px solid #1e293b',
  } as React.CSSProperties,
  main: {
    flex: 1,
    marginLeft: 240,
    minHeight: '100vh',
  } as React.CSSProperties,
};

// Add responsive styles via a style tag
const responsiveStyles = document.createElement('style');
responsiveStyles.textContent = `
  @media (max-width: 768px) {
    .app > aside {
      transform: translateX(-100%);
      transition: transform 0.3s ease;
    }
    .app > main {
      margin-left: 0 !important;
      padding-top: 56px;
    }
  }
  button:focus, button:active, button:focus-visible {
    outline: none;
  }
  nav button {
    color: #94a3b8 !important;
  }
  nav button:hover {
    background-color: #1e293b !important;
    color: #f8fafc !important;
  }
  nav button[data-active="true"] {
    background-color: #1e293b !important;
    color: #f8fafc !important;
    font-weight: 600 !important;
  }
`;

// Only add once
if (!document.querySelector('[data-fitforge-responsive]')) {
  responsiveStyles.setAttribute('data-fitforge-responsive', 'true');
  document.head.appendChild(responsiveStyles);
}
