import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';

const groups: { title?: string; links: { to: string; label: string; end?: boolean }[] }[] = [
  {
    links: [{ to: '/admin', label: 'Tableau de bord', end: true }],
  },
  {
    title: 'Catalogue',
    links: [
      { to: '/admin/domaines', label: 'Domaines' },
      { to: '/admin/metiers', label: 'Métiers' },
      { to: '/admin/universites', label: 'Universités' },
      { to: '/admin/centres-formation', label: 'Centres de formation' },
      { to: '/admin/mentions', label: 'Mentions' },
      { to: '/admin/parcours', label: 'Parcours' },
    ],
  },
  {
    title: 'Opportunités',
    links: [
      { to: '/admin/stages', label: 'Stages' },
      { to: '/admin/bourses', label: 'Bourses' },
    ],
  },
  {
    title: 'Orientation',
    links: [
      { to: '/admin/questionnaires', label: "Questionnaires d'orientation" },
      { to: '/admin/coachs', label: 'Coachs' },
    ],
  },
  {
    title: 'Contenu',
    links: [
      { to: '/admin/blogs', label: 'Articles de blog' },
      { to: '/admin/blog-commentaires', label: 'Commentaires' },
      { to: '/admin/ressources', label: 'Ressources / Docs' },
    ],
  },
  {
    title: 'Administration',
    links: [
      { to: '/admin/utilisateurs', label: 'Utilisateurs' },
      { to: '/admin/tickets', label: 'Tickets / Support' },
    ],
  },
];

export function AdminLayout() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-brand-900 text-white flex flex-col">
        <div className="h-16 flex items-center px-6 text-lg font-bold border-b border-brand-800">
          <Link to="/">OrientMad Admin</Link>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          {groups.map((group, i) => (
            <div key={group.title ?? i} className={i > 0 ? 'mt-4' : undefined}>
              {group.title && (
                <p className="px-6 pb-1 text-xs font-semibold uppercase tracking-wider text-brand-300">
                  {group.title}
                </p>
              )}
              {group.links.map((link) => (
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
            </div>
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
