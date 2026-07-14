import { useTheme } from '../lib/theme-context';

export function GuideUtilisateur() {
  const { theme } = useTheme();

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* En-tête */}
      <div 
        className="p-8 rounded-3xl border mb-8 text-center"
        style={{
          background: theme === 'dark' ? 'rgba(10, 8, 24, 0.5)' : 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(20px)',
          borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)',
        }}
      >
        <span
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black text-white mx-auto mb-4"
          style={{ background: 'linear-gradient(135deg, #a855f7, #818cf8)' }}
        >
          OM
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white mb-2">
          Guide de l'Utilisateur — OrientMad
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Découvrez comment naviguer et utiliser au mieux l'application d'orientation OrientMad.
        </p>
      </div>

      {/* Contenu */}
      <div className="space-y-8">
        {/* Section 1 */}
        <section 
          className="p-8 rounded-3xl border"
          style={{
            background: theme === 'dark' ? 'rgba(10, 8, 24, 0.3)' : 'rgba(255, 255, 255, 0.3)',
            borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.06)',
          }}
        >
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">1. Présentation Générale</h2>
          <p className="text-slate-600 dark:text-slate-350 leading-relaxed mb-4">
            <strong>OrientMad</strong> est une application web d'orientation scolaire, universitaire et professionnelle conçue spécifiquement pour Madagascar. Elle a pour objectif de guider les élèves, étudiants et jeunes professionnels dans la construction de leur parcours d'avenir.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-1">🔍 Exploration</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Découvrez des fiches métiers détaillées et adaptées au contexte économique local.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-1">🎓 Annuaire</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Consultez les établissements, mentions et parcours disponibles à Madagascar.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2 (Rôles) */}
        <section 
          className="p-8 rounded-3xl border"
          style={{
            background: theme === 'dark' ? 'rgba(10, 8, 24, 0.3)' : 'rgba(255, 255, 255, 0.3)',
            borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.06)',
          }}
        >
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">2. Rôles et Droits d'Accès</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
                  <th className="py-3 px-4">Fonctionnalité</th>
                  <th className="py-3 px-4 text-center">Visiteur Anonyme</th>
                  <th className="py-3 px-4 text-center">Étudiant</th>
                  <th className="py-3 px-4 text-center">Admin</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-900 text-slate-650 dark:text-slate-300">
                <tr>
                  <td className="py-3 px-4 font-medium">Consulter les métiers & domaines</td>
                  <td className="py-3 px-4 text-center">✅</td>
                  <td className="py-3 px-4 text-center">✅</td>
                  <td className="py-3 px-4 text-center">✅</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Consulter les formations</td>
                  <td className="py-3 px-4 text-center">✅</td>
                  <td className="py-3 px-4 text-center">✅</td>
                  <td className="py-3 px-4 text-center">✅</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Créer un profil & Favoris</td>
                  <td className="py-3 px-4 text-center">❌</td>
                  <td className="py-3 px-4 text-center">✅</td>
                  <td className="py-3 px-4 text-center">✅</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Échanger par tickets de support</td>
                  <td className="py-3 px-4 text-center">❌</td>
                  <td className="py-3 px-4 text-center">✅</td>
                  <td className="py-3 px-4 text-center">✅</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Accéder au Back-Office (/admin)</td>
                  <td className="py-3 px-4 text-center">❌</td>
                  <td className="py-3 px-4 text-center">❌</td>
                  <td className="py-3 px-4 text-center">✅</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3 */}
        <section 
          className="p-8 rounded-3xl border"
          style={{
            background: theme === 'dark' ? 'rgba(10, 8, 24, 0.3)' : 'rgba(255, 255, 255, 0.3)',
            borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.06)',
          }}
        >
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">3. Espace Étudiant</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-slate-850 dark:text-white text-base">🔑 Inscription et Connexion</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Créez votre compte à l'aide de votre adresse email et de votre numéro de téléphone (optionnel). Une fois connecté, vous aurez un accès complet à votre tableau de bord.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-slate-850 dark:text-white text-base">❤️ Profil et Favoris</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Sauvegardez vos métiers préférés ou des fiches universités en cliquant sur le cœur. Renseignez vos compétences et vos intérêts dans votre profil pour concevoir et télécharger votre CV personnalisé en format PDF.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-slate-850 dark:text-white text-base">💬 Tickets de Support</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Une question ? Vous pouvez poser toutes vos questions d'orientation en créant un ticket de support. Un conseiller ou administrateur vous répondra directement sur l'interface.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section 
          className="p-8 rounded-3xl border shadow-lg"
          style={{
            background: theme === 'dark' ? 'rgba(10, 8, 24, 0.3)' : 'rgba(255, 255, 255, 0.3)',
            borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.06)',
          }}
        >
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">4. Espace Administration (Back-Office)</h2>
          <p className="text-sm text-slate-650 dark:text-slate-350 leading-relaxed mb-4">
            Les administrateurs d'OrientMad disposent d'un panel d'administration complet accessible sur l'URL <code>/admin</code>.
          </p>
          <div className="space-y-2.5 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex gap-2">
              <span className="text-purple-500">•</span>
              <span><strong>Gestion des fiches métiers</strong> : création, édition et suppression de fiches métiers détaillées (missions, salaires, codes RIASEC).</span>
            </div>
            <div className="flex gap-2">
              <span className="text-purple-500">•</span>
              <span><strong>Sécurité d'intégrité</strong> : impossibilité de supprimer un domaine s'il est lié à des métiers ou des mentions d'université en activité.</span>
            </div>
            <div className="flex gap-2">
              <span className="text-purple-500">•</span>
              <span><strong>Support technique</strong> : réponse directe aux questions des étudiants via la modération et la gestion des tickets.</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
