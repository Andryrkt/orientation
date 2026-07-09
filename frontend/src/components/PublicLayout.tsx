import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { NavDropdown, NavDropdownItem } from './NavDropdown';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
    isActive
      ? 'bg-neon-purple/20 text-purple-300 border border-purple-500/30'
      : 'text-slate-300 hover:text-white hover:bg-white/8'
  }`;

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
    isActive ? 'bg-neon-purple/20 text-purple-300' : 'text-slate-300 hover:text-white hover:bg-white/8'
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
  const [mobileOpen, setMobileOpen] = useState(false);

  const userItems: NavDropdownItem[] = user
    ? [
        { to: '/favoris', label: 'Mes favoris' },
        { to: '/mes-resultats', label: 'Mes résultats' },
        { to: '/profil', label: 'Mon profil' },
        { label: 'Déconnexion', onClick: () => logout() },
      ]
    : [];

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Header ── */}
      <header
        className="sticky top-0 z-20"
        style={{
          background: 'rgba(10, 8, 24, 0.7)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 text-lg font-extrabold text-white hover:opacity-90 transition-opacity">
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white"
              style={{
                background: 'linear-gradient(135deg, #a855f7, #818cf8)',
                boxShadow: '0 4px 14px rgba(168, 85, 247, 0.4)',
              }}
            >
              OM
            </span>
            <span className="gradient-text">OrientMad</span>
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
          </nav>

          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all"
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

        {mobileOpen && (
          <div
            className="lg:hidden px-4 py-3 space-y-1"
            style={{
              background: 'rgba(10, 8, 24, 0.95)',
              borderTop: '1px solid rgba(255,255,255,0.06)',
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
            <div className="pt-2 mt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
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
                        className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/8 transition-all"
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
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer style={{ background: 'rgba(10,8,24,0.8)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto px-4 py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 text-base font-extrabold text-white mb-3">
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white"
                style={{ background: 'linear-gradient(135deg, #a855f7, #818cf8)' }}
              >
                OM
              </span>
              <span className="gradient-text">OrientMad</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              La plateforme de référence pour l'orientation scolaire, universitaire et
              professionnelle à Madagascar.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-3">Orientation</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              {ORIENTATION_ITEMS.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="hover:text-purple-400 transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-3">Opportunités</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              {OPPORTUNITES_ITEMS.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="hover:text-purple-400 transition-colors">{item.label}</Link>
                </li>
              ))}
              <li>
                <Link to="/blog" className="hover:text-purple-400 transition-colors">Blog / Conseils</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-3">Compte</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              {user ? (
                <>
                  <li><Link to="/favoris" className="hover:text-purple-400 transition-colors">Mes favoris</Link></li>
                  <li><Link to="/profil" className="hover:text-purple-400 transition-colors">Mon profil</Link></li>
                </>
              ) : (
                <>
                  <li><Link to="/login" className="hover:text-purple-400 transition-colors">Connexion</Link></li>
                  <li><Link to="/register" className="hover:text-purple-400 transition-colors">Inscription</Link></li>
                </>
              )}
            </ul>
          </div>
        </div>
        <div className="py-4 text-center text-xs text-slate-600" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          © {new Date().getFullYear()} OrientMad — Orientation scolaire, universitaire et professionnelle à Madagascar
        </div>
      </footer>
    </div>
  );
}
