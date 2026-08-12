import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { useTheme } from '../../lib/theme-context';
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
      { to: '/admin/finances', label: 'Tableau de bord', end: true },
      { to: '/admin/points-de-vente', label: 'Points de vente' },
      { to: '/admin/saisies-journalieres', label: 'Saisies journalières' },
      { to: '/admin/depenses-globales', label: 'Dépenses globales' },
      { to: '/admin/investissements', label: 'Investissements' },
      { to: '/admin/filieres', label: 'Filières' },
    ],
  },
];

export function AdminLayout() {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [groupesFermes, setGroupesFermes] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(groups.filter((g) => g.title).map((g) => [g.title!, true])),
  );

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
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-2 text-sm text-brand-100 hover:text-white"
          >
            {theme === 'dark' ? (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="5" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
                Mode clair
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
                Mode sombre
              </>
            )}
          </button>
          <Link to="/" className="block text-sm text-brand-100 hover:text-white">
            ← Retour au site
          </Link>
          <button onClick={() => logout()} className="block text-sm text-brand-100 hover:text-white">
            Déconnexion
          </button>
        </div>
      </aside>
      <main className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-8 overflow-auto transition-colors duration-300">
        <Outlet />
      </main>
    </div>
  );
}
