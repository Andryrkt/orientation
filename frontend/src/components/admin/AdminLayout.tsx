import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';

const links = [
  { to: '/admin', label: 'Tableau de bord', end: true },
  { to: '/admin/domaines', label: 'Domaines' },
  { to: '/admin/metiers', label: 'Métiers' },
  { to: '/admin/universites', label: 'Universités' },
  { to: '/admin/mentions', label: 'Mentions' },
  { to: '/admin/parcours', label: 'Parcours' },
  { to: '/admin/stages', label: 'Stages' },
  { to: '/admin/bourses', label: 'Bourses' },
  { to: '/admin/blogs', label: 'Articles de blog' },
  { to: '/admin/blog-commentaires', label: 'Commentaires' },
  { to: '/admin/utilisateurs', label: 'Utilisateurs' },
];

export function AdminLayout() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-brand-900 text-white flex flex-col">
        <div className="h-16 flex items-center px-6 text-lg font-bold border-b border-brand-800">
          <Link to="/">OrientMad Admin</Link>
        </div>
        <nav className="flex-1 py-4">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `block px-6 py-2.5 text-sm ${
                  isActive ? 'bg-brand-700 font-medium' : 'text-brand-100 hover:bg-brand-800'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-brand-800 space-y-2">
          <Link to="/" className="block text-sm text-brand-100 hover:text-white">
            ← Retour au site
          </Link>
          <button onClick={() => logout()} className="block text-sm text-brand-100 hover:text-white">
            Déconnexion
          </button>
        </div>
      </aside>
      <main className="flex-1 bg-slate-50 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
