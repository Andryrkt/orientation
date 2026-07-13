import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { useTheme } from '../lib/theme-context';
import { NavDropdown, NavDropdownItem } from './NavDropdown';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
    isActive
      ? 'bg-neon-purple/20 text-purple-300 border border-purple-500/30'
      : 'text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/8'
  }`;

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
    isActive ? 'bg-neon-purple/20 text-purple-300' : 'text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/8'
  }`;

const ORIENTATION_ITEMS = [
  { to: '/metiers', label: 'Métiers' },
  { to: '/domaines', label: 'Domaines' },
  { to: '/universites', label: 'Universités' },
  { to: '/centres-formation', label: 'Centres de formation' },
  { to: '/questionnaire', label: 'Questionnaire' },
  { to: '/coachs', label: 'Coachs' },
];

const OPPORTUNITES_ITEMS = [
  { to: '/stages', label: 'Stages' },
  { to: '/bourses', label: 'Bourses' },
];

export function PublicLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const userItems: NavDropdownItem[] = user
    ? [
        { to: '/favoris', label: 'Mes favoris' },
        { to: '/mes-resultats', label: 'Mes résultats' },
        { to: '/tickets', label: 'Support / Tickets' },
        { to: '/profil', label: 'Mon profil' },
        { to: '/mon-cv', label: 'Mon CV' },
        { label: 'Déconnexion', onClick: () => logout() },
      ]
    : [];

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      {/* ── Header ── */}
      <header className="sticky top-4 z-30 px-4 w-full max-w-6xl mx-auto">
        <div
          className="px-6 h-16 flex items-center justify-between rounded-2xl border transition-all duration-300"
          style={{
            background: theme === 'dark' ? 'rgba(10, 8, 24, 0.75)' : 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(24px)',
            borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)',
            boxShadow: theme === 'dark' 
              ? '0 10px 30px -10px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.05)' 
              : '0 10px 30px -10px rgba(15, 23, 42, 0.03), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
          }}
        >
          <Link to="/" className="flex items-center gap-2.5 text-lg font-extrabold text-slate-800 dark:text-white hover:opacity-90 transition-opacity">
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white"
              style={{
                background: 'linear-gradient(135deg, #a855f7, #818cf8)',
                boxShadow: '0 4px 14px rgba(168, 85, 247, 0.4)',
              }}
            >
              OM
            </span>
            <span className="gradient-text font-black tracking-tight animate-text-shine">OrientMad</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            <NavDropdown label="Orientation" items={ORIENTATION_ITEMS} />
            <NavDropdown label="Opportunités" items={OPPORTUNITES_ITEMS} />
            <NavLink to="/blog" className={navLinkClass}>Blog / Conseils</NavLink>
            {user?.role === 'ADMIN' && (
              <NavLink to="/admin" className={navLinkClass}>Back-office</NavLink>
            )}
            {user ? (
              <NavDropdown label={`${user.prenom} ${user.nom}`} items={userItems} align="right" />
            ) : (
              <>
                <NavLink to="/login" className={navLinkClass}>Connexion</NavLink>
                <NavLink to="/register" className="btn-primary ml-2 px-4 py-2 text-sm">
                  Inscription
                </NavLink>
              </>
            )}

            {/* Commutateur de thème (Desktop) */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-purple-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-purple-300 dark:hover:bg-white/8 transition-all duration-200 ml-2"
              aria-label="Changer de thème"
              title="Changer de thème"
            >
              {theme === 'dark' ? (
                // Soleil
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="5" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              ) : (
                // Lune
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              )}
            </button>
          </nav>

          <div className="flex items-center lg:hidden">
            {/* Commutateur de thème (Mobile) */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-350 dark:hover:text-white dark:hover:bg-white/10 transition-all mr-1"
              aria-label="Changer de thème"
            >
              {theme === 'dark' ? (
                // Soleil
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="5" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              ) : (
                // Lune
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              )}
            </button>

            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-350 dark:hover:text-white dark:hover:bg-white/10 transition-all"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div
            className="lg:hidden mt-2 px-4 py-4 space-y-1.5 rounded-2xl border animate-dropdown"
            style={{
              background: theme === 'dark' ? 'rgba(10, 8, 24, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(24px)',
              borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)',
              boxShadow: theme === 'dark' ? '0 20px 40px rgba(0, 0, 0, 0.5)' : '0 20px 40px rgba(15, 23, 42, 0.08)',
            }}
          >
            {[...ORIENTATION_ITEMS, ...OPPORTUNITES_ITEMS, { to: '/blog', label: 'Blog / Conseils' }].map(
              (item) => (
                <NavLink key={item.to} to={item.to} className={mobileLinkClass} onClick={() => setMobileOpen(false)}>
                  {item.label}
                </NavLink>
              ),
            )}
            {user?.role === 'ADMIN' && (
              <NavLink to="/admin" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>
                Back-office
              </NavLink>
            )}
            <div className="pt-2.5 mt-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              {user ? (
                <>
                  {userItems.map((item) =>
                    'to' in item ? (
                      <NavLink key={item.to} to={item.to} className={mobileLinkClass} onClick={() => setMobileOpen(false)}>
                        {item.label}
                      </NavLink>
                    ) : (
                      <button
                        key={item.label}
                        onClick={() => { setMobileOpen(false); item.onClick(); }}
                        className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-350 dark:hover:text-white dark:hover:bg-white/8 transition-all"
                      >
                        {item.label}
                      </button>
                    ),
                  )}
                </>
              ) : (
                <div className="flex gap-2 pt-1">
                  <NavLink to="/login" className="btn-secondary flex-1 text-center py-2" onClick={() => setMobileOpen(false)}>
                    Connexion
                  </NavLink>
                  <NavLink to="/register" className="btn-primary flex-1 text-center py-2" onClick={() => setMobileOpen(false)}>
                    Inscription
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── Main ── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 relative z-20">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer 
        className="transition-colors duration-300 z-10 relative"
        style={{ 
          background: theme === 'dark' ? 'rgba(10,8,24,0.8)' : 'rgba(241,245,249,0.9)', 
          borderTop: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(15,23,42,0.06)' 
        }}
      >
        <div className="max-w-6xl mx-auto px-4 py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 text-base font-extrabold text-slate-800 dark:text-white mb-3">
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white"
                style={{ background: 'linear-gradient(135deg, #a855f7, #818cf8)' }}
              >
                OM
              </span>
              <span className="gradient-text animate-text-shine">OrientMad</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              La plateforme de référence pour l'orientation scolaire, universitaire et
              professionnelle à Madagascar.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3">Orientation</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-500">
              {ORIENTATION_ITEMS.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3">Opportunités</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-500">
              {OPPORTUNITES_ITEMS.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">{item.label}</Link>
                </li>
              ))}
              <li>
                <Link to="/blog" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Blog / Conseils</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3">Compte</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-500">
              {user ? (
                <>
                  <li><Link to="/favoris" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Mes favoris</Link></li>
                  <li><Link to="/tickets" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Support & Tickets</Link></li>
                  <li><Link to="/profil" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Mon profil</Link></li>
                  <li><Link to="/mon-cv" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Mon CV</Link></li>
                </>
              ) : (
                <>
                  <li><Link to="/login" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Connexion</Link></li>
                  <li><Link to="/register" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Inscription</Link></li>
                </>
              )}
            </ul>
          </div>
        </div>
        <div className="py-4 text-center text-xs text-slate-500 dark:text-slate-600" style={{ borderTop: theme === 'dark' ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(15,23,42,0.04)' }}>
          © {new Date().getFullYear()} OrientMad — Orientation scolaire, universitaire et professionnelle à Madagascar
        </div>
      </footer>
    </div>
  );
}
