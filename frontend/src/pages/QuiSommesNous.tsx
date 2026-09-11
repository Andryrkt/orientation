const VALEURS = [
  { titre: 'Écoute', desc: 'Chaque parcours est différent.' },
  { titre: 'Rigueur', desc: 'Des méthodes qui ont fait leurs preuves.' },
  { titre: 'Bienveillance', desc: 'Jamais de jugement.' },
  { titre: 'Engagement', desc: 'On reste à vos côtés jusqu\'au bout.' },
];

export function QuiSommesNous() {
  return (
    <div className="max-w-3xl mx-auto space-y-10 pb-12">
      <section className="text-center">
        <span className="eyebrow mb-2">Qui sommes-nous</span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
          Avenir <span className="gradient-text">Assuré</span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
          On pense qu'aucun choix d'orientation ne devrait se faire dans le doute. C'est pour ça qu'Avenir Assuré
          existe : vous accompagner à chaque étape clé, du collège à la reconversion professionnelle.
        </p>
        <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed mt-4">
          Notre équipe réunit conseillers en orientation, psychologues du travail et experts de l'insertion
          professionnelle. Leur but : transformer vos questions en projet, et votre projet en réussite.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-6">Nos valeurs</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {VALEURS.map((v) => (
            <div key={v.titre} className="glass-card p-6">
              <p className="font-bold text-slate-800 dark:text-white mb-1">{v.titre}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
