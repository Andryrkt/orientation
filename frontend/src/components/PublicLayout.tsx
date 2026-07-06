import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md text-sm font-medium ${
    isActive ? 'bg-brand-100 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
  }`;

export function PublicLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-brand-700">
            OrientMad
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink to="/metiers" className={navLinkClass}>Métiers</NavLink>
            <NavLink to="/domaines" className={navLinkClass}>Domaines</NavLink>
            <NavLink to="/universites" className={navLinkClass}>Universités</NavLink>
            {user?.role === 'ADMIN' && (
              <NavLink to="/admin" className={navLinkClass}>Back-office</NavLink>
            )}
            {user ? (
              <>
                <NavLink to="/profil" className={navLinkClass}>Mon profil</NavLink>
                <button
                  onClick={() => logout()}
                  className="px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navLinkClass}>Connexion</NavLink>
                <NavLink
                  to="/register"
                  className="ml-1 px-3 py-2 rounded-md text-sm font-medium bg-brand-600 text-white hover:bg-brand-700"
                >
                  Inscription
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-500">
        OrientMad — Orientation scolaire, universitaire et professionnelle à Madagascar
      </footer>
    </div>
  );
}
