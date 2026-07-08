import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { NavDropdown, NavDropdownItem } from './NavDropdown';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-full text-sm font-medium transition-colors ${
    isActive ? 'bg-brand-100 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
  }`;

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block px-3 py-2 rounded-lg text-sm font-medium ${
    isActive ? 'bg-brand-100 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
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
      <header className="sticky top-0 z-20 bg-white/85 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center text-sm font-bold shadow-brand">
              OM
            </span>
            OrientMad
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
                <NavLink to="/register" className="btn-primary ml-1 px-4 py-2">
                  Inscription
                </NavLink>
              </>
            )}
          </nav>

          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
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
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
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
            <div className="pt-2 mt-2 border-t border-slate-200">
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
                        onClick={() => {
                          setMobileOpen(false);
                          item.onClick();
                        }}
                        className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
                      >
                        {item.label}
                      </button>
                    ),
                  )}
                </>
              ) : (
                <div className="flex gap-2">
                  <NavLink to="/login" className="btn-secondary flex-1" onClick={() => setMobileOpen(false)}>
                    Connexion
                  </NavLink>
                  <NavLink to="/register" className="btn-primary flex-1" onClick={() => setMobileOpen(false)}>
                    Inscription
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 text-base font-extrabold text-slate-900 mb-2">
              <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center text-xs font-bold">
                OM
              </span>
              OrientMad
            </div>
            <p className="text-sm text-slate-500">
              La plateforme de référence pour l'orientation scolaire, universitaire et
              professionnelle à Madagascar.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-3">Orientation</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              {ORIENTATION_ITEMS.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="hover:text-brand-600">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-3">Opportunités</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              {OPPORTUNITES_ITEMS.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="hover:text-brand-600">{item.label}</Link>
                </li>
              ))}
              <li>
                <Link to="/blog" className="hover:text-brand-600">Blog / Conseils</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-3">Compte</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              {user ? (
                <>
                  <li><Link to="/favoris" className="hover:text-brand-600">Mes favoris</Link></li>
                  <li><Link to="/profil" className="hover:text-brand-600">Mon profil</Link></li>
                </>
              ) : (
                <>
                  <li><Link to="/login" className="hover:text-brand-600">Connexion</Link></li>
                  <li><Link to="/register" className="hover:text-brand-600">Inscription</Link></li>
                </>
              )}
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} OrientMad — Orientation scolaire, universitaire et professionnelle à Madagascar
        </div>
      </footer>
    </div>
  );
}
