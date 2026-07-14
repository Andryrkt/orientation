import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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

export function PublicLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const ORIENTATION_ITEMS = [
    { to: '/metiers', label: t('nav.jobs') },
    { to: '/domaines', label: t('nav.domains') },
    { to: '/universites', label: t('nav.universities') },
    { to: '/centres-formation', label: t('nav.training_centers') },
    { to: '/questionnaire', label: t('nav.questionnaire') },
    { to: '/coachs', label: t('nav.coaches') },
  ];

  const OPPORTUNITES_ITEMS = [
    { to: '/stages', label: t('nav.internships') },
    { to: '/bourses', label: t('nav.scholarships') },
  ];

  const userItems: NavDropdownItem[] = user
    ? [
        { to: '/ressources', label: t('nav.ressources') },
        { to: '/favoris', label: t('nav.my_favorites') },
        { to: '/mes-resultats', label: t('nav.my_results') },
        { to: '/tickets', label: t('nav.support_tickets') },
        { to: '/profil', label: t('nav.my_profile') },
        { to: '/mon-cv', label: t('nav.my_cv') },
        { label: t('nav.logout'), onClick: () => logout() },
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
            <NavDropdown label={t('nav.orientation')} items={ORIENTATION_ITEMS} />
            <NavDropdown label={t('nav.opportunities')} items={OPPORTUNITES_ITEMS} />
            <NavLink to="/blog" className={navLinkClass}>{t('nav.blog')}</NavLink>
            {user && (
              <NavLink to="/ressources" className={navLinkClass}>{t('nav.ressources')}</NavLink>
            )}
            {user?.role === 'ADMIN' && (
              <NavLink to="/admin" className={navLinkClass}>{t('nav.backoffice')}</NavLink>
            )}
            {user ? (
              <NavDropdown label={`${user.prenom} ${user.nom}`} items={userItems} align="right" />
            ) : (
              <>
                <NavLink to="/login" className={navLinkClass}>{t('nav.login')}</NavLink>
                <NavLink to="/register" className="btn-primary ml-2 px-4 py-2 text-sm">
                  {t('nav.register')}
                </NavLink>
              </>
            )}

            {/* Sélecteur de langue (Desktop) */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-slate-500 hover:text-purple-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-purple-300 dark:hover:bg-white/8 transition-all duration-200 text-sm font-semibold ml-1"
                aria-label="Changer de langue"
                title="Changer de langue"
              >
                <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253m0 0A17.919 17.919 0 0112 10.5z" />
                </svg>
                <span className="uppercase text-xs">{i18n.language}</span>
                <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {langOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                  <div
                    className="absolute right-0 mt-2 w-32 rounded-xl border py-1.5 space-y-0.5 z-50 animate-dropdown"
                    style={{
                      background: theme === 'dark' ? 'rgba(10, 8, 24, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(24px)',
                      borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)',
                      boxShadow: theme === 'dark' ? '0 10px 25px rgba(0, 0, 0, 0.5)' : '0 10px 25px rgba(15, 23, 42, 0.08)',
                    }}
                  >
                    {[
                      { code: 'fr', label: 'Français' },
                      { code: 'en', label: 'English' },
                      { code: 'mg', label: 'Malagasy' },
                    ].map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          i18n.changeLanguage(lang.code);
                          setLangOpen(false);
                        }}
                        className={`flex w-full items-center px-3 py-1.5 text-xs text-left font-bold transition-all duration-150 rounded-lg ${
                          i18n.language === lang.code
                            ? 'text-purple-500 bg-purple-500/10'
                            : 'text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-white/8 hover:text-slate-800 dark:hover:text-white'
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Commutateur de thème (Desktop) */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-purple-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-purple-300 dark:hover:bg-white/8 transition-all duration-200 ml-1"
              aria-label={t('nav.theme')}
              title={t('nav.theme')}
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
            {/* Sélecteur de langue abrégé (Mobile) */}
            <div className="relative mr-1">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-350 dark:hover:text-white dark:hover:bg-white/10 transition-all text-xs font-bold uppercase"
              >
                {i18n.language}
              </button>
              {langOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                  <div
                    className="absolute right-0 mt-2 w-28 rounded-xl border py-1 z-50 animate-dropdown"
                    style={{
                      background: theme === 'dark' ? 'rgba(10, 8, 24, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(24px)',
                      borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)',
                      boxShadow: theme === 'dark' ? '0 10px 25px rgba(0, 0, 0, 0.5)' : '0 10px 25px rgba(15, 23, 42, 0.08)',
                    }}
                  >
                    {[
                      { code: 'fr', label: 'FR' },
                      { code: 'en', label: 'EN' },
                      { code: 'mg', label: 'MG' },
                    ].map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          i18n.changeLanguage(lang.code);
                          setLangOpen(false);
                        }}
                        className={`flex w-full items-center px-3 py-1.5 text-xs text-left font-bold transition-all duration-150 rounded-lg ${
                          i18n.language === lang.code
                            ? 'text-purple-500 bg-purple-500/10'
                            : 'text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-white/8 hover:text-slate-800 dark:hover:text-white'
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
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
            {[...ORIENTATION_ITEMS, ...OPPORTUNITES_ITEMS, { to: '/blog', label: t('nav.blog') }].map(
              (item) => (
                <NavLink key={item.to} to={item.to} className={mobileLinkClass} onClick={() => setMobileOpen(false)}>
                  {item.label}
                </NavLink>
              ),
            )}
            {user?.role === 'ADMIN' && (
              <NavLink to="/admin" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>
                {t('nav.backoffice')}
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
                    {t('nav.login')}
                  </NavLink>
                  <NavLink to="/register" className="btn-primary flex-1 text-center py-2" onClick={() => setMobileOpen(false)}>
                    {t('nav.register')}
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
              {t('footer.description')}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3">{t('footer.orientation')}</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-500">
              {ORIENTATION_ITEMS.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3">{t('footer.opportunities')}</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-500">
              {OPPORTUNITES_ITEMS.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">{item.label}</Link>
                </li>
              ))}
              <li>
                <Link to="/blog" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">{t('nav.blog')}</Link>
              </li>
              <li>
                <Link to="/guide" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Guide d'utilisation</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3">{t('footer.account')}</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-500">
              {user ? (
                <>
                  <li><Link to="/favoris" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">{t('nav.my_favorites')}</Link></li>
                  <li><Link to="/tickets" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">{t('nav.support_tickets')}</Link></li>
                  <li><Link to="/profil" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">{t('nav.my_profile')}</Link></li>
                  <li><Link to="/mon-cv" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">{t('nav.my_cv')}</Link></li>
                </>
              ) : (
                <>
                  <li><Link to="/login" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">{t('nav.login')}</Link></li>
                  <li><Link to="/register" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">{t('nav.register')}</Link></li>
                </>
              )}
            </ul>
          </div>
        </div>
        <div className="py-4 text-center text-xs text-slate-500 dark:text-slate-600" style={{ borderTop: theme === 'dark' ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(15,23,42,0.04)' }}>
          © {new Date().getFullYear()} {t('footer.copyright')}
        </div>
      </footer>
    </div>
  );
}
