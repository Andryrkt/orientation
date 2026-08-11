import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { Logo } from '../Logo';

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
      { to: '/admin/enseignants', label: 'Enseignants' },
    ],
  },
  {
    title: 'Contenu',
    links: [
      { to: '/admin/blogs', label: 'Articles de blog' },
      { to: '/admin/blog-commentaires', label: 'Commentaires' },
      { to: '/admin/ressources', label: 'Ressources / Docs' },
      { to: '/admin/faq', label: 'FAQ' },
    ],
  },
  {
    title: 'Administration',
    links: [
      { to: '/admin/utilisateurs', label: 'Utilisateurs' },
      { to: '/admin/tickets', label: 'Tickets / Support' },
      { to: '/admin/contact-messages', label: 'Messages de contact' },
    ],
  },
  {
    title: 'Finances',
    links: [
      { to: '/admin/points-de-vente', label: 'Points de vente' },
      { to: '/admin/saisies-journalieres', label: 'Saisies journalières' },
      { to: '/admin/depenses-globales', label: 'Dépenses globales' },
    ],
  },
];

export function AdminLayout() {
  const { logout } = useAuth();
  const [groupesFermes, setGroupesFermes] = useState<Record<string, boolean>>({});

  function toggleGroupe(titre: string) {
    setGroupesFermes((prev) => ({ ...prev, [titre]: !prev[titre] }));
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-brand-900 text-white flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-brand-800">
          <Link to="/" className="flex items-center gap-1.5 hover:opacity-90 transition-opacity">
            <Logo size="sm" />
            <span className="text-xs text-brand-300 font-semibold uppercase tracking-wider mt-0.5 ml-1">Admin</span>
          </Link>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          {groups.map((group, i) => {
            const ouvert = !group.title || !groupesFermes[group.title];
            return (
              <div key={group.title ?? i} className={i > 0 ? 'mt-4' : undefined}>
                {group.title && (
                  <button
                    type="button"
                    onClick={() => toggleGroupe(group.title!)}
                    className="w-full flex items-center justify-between px-6 pb-1 text-xs font-semibold uppercase tracking-wider text-brand-300 hover:text-white transition-colors"
                  >
                    <span>{group.title}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${ouvert ? '' : '-rotate-90'}`} />
                  </button>
                )}
                {ouvert &&
                  group.links.map((link) => (
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
            );
          })}
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
