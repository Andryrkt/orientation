import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div>
      <section className="text-center py-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Trouve ta voie avec <span className="text-brand-600">OrientMad</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
          La plateforme de référence pour l'orientation scolaire, universitaire et professionnelle
          à Madagascar : métiers, formations, universités et bien plus.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            to="/metiers"
            className="px-6 py-3 bg-brand-600 text-white rounded-md font-medium hover:bg-brand-700"
          >
            Découvrir les métiers
          </Link>
          <Link
            to="/universites"
            className="px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-md font-medium hover:bg-slate-50"
          >
            Explorer les universités
          </Link>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-6 py-8">
        {[
          { title: 'Métiers', desc: "Explore les métiers, leurs débouchés et les compétences requises.", to: '/metiers' },
          { title: 'Domaines', desc: 'Parcours les grands domaines de formation et leurs filières associées.', to: '/domaines' },
          { title: 'Universités', desc: 'Trouve les établissements et parcours de formation à Madagascar.', to: '/universites' },
        ].map((card) => (
          <Link
            key={card.title}
            to={card.to}
            className="block bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-bold text-slate-800 mb-2">{card.title}</h3>
            <p className="text-slate-600 text-sm">{card.desc}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
