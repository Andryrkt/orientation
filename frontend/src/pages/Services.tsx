import { Link } from 'react-router-dom';

interface ServiceSection {
  emoji: string;
  titre: string;
  intro: string;
  propose: string[];
  pourQui: string;
}

const SERVICES: ServiceSection[] = [
  {
    emoji: '🎓',
    titre: 'Orientation scolaire',
    intro:
      "Au collège comme au lycée, les choix d'orientation arrivent vite, parfois trop vite. On aide les élèves et leurs parents à prendre le temps de réfléchir, pour choisir une voie qui a du sens.",
    propose: [
      "Bilans d'orientation adaptés à l'âge",
      "Tests de personnalité et d'intérêts",
      'Entretiens avec l\'élève, et les parents si besoin',
      'Découverte des filières générales, technologiques et professionnelles',
      'Préparation aux choix de fin de 3e et de 2nde',
    ],
    pourQui: 'Collégiens, lycéens et leurs familles.',
  },
  {
    emoji: '🎯',
    titre: 'Orientation post-bac',
    intro:
      "Parcoursup, grandes écoles, universités, alternance... Il y a tellement d'options qu'on s'y perd facilement. On vous aide à choisir selon vos vraies envies, pas juste selon les classements.",
    propose: [
      'Accompagnement Parcoursup de A à Z',
      'Analyse de vos compétences et de vos envies',
      'Comparaison des filières et des débouchés',
      'Préparation aux entretiens de sélection',
      'Aide à la rédaction de vos lettres de motivation',
      'Aide à la rédaction de mémoire, à la présentation',
    ],
    pourQui: 'Lycéens en terminale, étudiants en réorientation.',
  },
  {
    emoji: '💼',
    titre: 'Orientation professionnelle',
    intro:
      "Vous tournez en rond dans votre carrière ? Vous n'êtes plus sûr de votre voie ? On fait le point avec vous pour identifier vos vraies compétences et les métiers qui vous correspondent.",
    propose: [
      'Bilan de compétences complet',
      'Identification de vos savoir-faire',
      'Exploration de nouvelles pistes de carrière',
      'Un plan d\'action clair et réaliste',
      'Un accompagnement pour bien décider',
    ],
    pourQui: 'Salariés en questionnement, cadres, professionnels en quête de sens.',
  },
  {
    emoji: '🔍',
    titre: 'Orientation pour demandeurs d\'emploi',
    intro:
      "Chercher un emploi peut vite user. On vous aide à retrouver un cap, à mettre en valeur vos atouts et à structurer votre recherche pour avancer sereinement.",
    propose: [
      'Clarification de votre projet professionnel',
      'Valorisation de vos compétences',
      'Aide au CV et à la lettre de motivation',
      "Préparation aux entretiens d'embauche",
      'Une stratégie de recherche ciblée',
    ],
    pourQui: 'Demandeurs d\'emploi, personnes en recherche active.',
  },
  {
    emoji: '🚀',
    titre: 'Orientation entrepreneuriale',
    intro:
      "Créer son entreprise, c'est excitant mais risqué si on part sans préparation. On vous aide à valider votre idée et à poser des bases solides avant de vous lancer.",
    propose: [
      'Validation de votre idée de projet',
      'Analyse de votre profil entrepreneurial',
      'Structuration étape par étape',
      'Orientation vers les bons dispositifs de financement',
      'Préparation au lancement',
    ],
    pourQui: 'Futurs entrepreneurs, porteurs de projet.',
  },
  {
    emoji: '🔄',
    titre: 'Transition professionnelle',
    intro:
      "Changer de métier ou de secteur, ça ne s'improvise pas. On vous aide à transformer ce changement en une étape maîtrisée, pas subie.",
    propose: [
      'Bilan de vos compétences transférables',
      'Exploration de nouveaux secteurs',
      'Un plan de transition réaliste',
      'Un accompagnement humain face au changement',
      'Un suivi tout au long du processus',
    ],
    pourQui: 'Professionnels en reconversion.',
  },
];

export function Services() {
  return (
    <div className="space-y-16 pb-12">
      <section className="text-center max-w-2xl mx-auto">
        <span className="eyebrow mb-2">Nos services</span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          Un accompagnement pour chaque étape
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
          Quel que soit votre âge ou votre situation, il y a un accompagnement adapté à votre besoin.
        </p>
      </section>

      <div className="space-y-8">
        {SERVICES.map((service) => (
          <section key={service.titre} id={service.titre} className="glass-card p-8 sm:p-10">
            <div className="flex items-start gap-4 mb-4">
              <span className="text-3xl shrink-0">{service.emoji}</span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{service.titre}</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-5">{service.intro}</p>

            <p className="text-sm font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400 mb-2">
              Ce qu'on propose :
            </p>
            <ul className="space-y-1.5 mb-5">
              {service.propose.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <span className="text-blue-500 dark:text-blue-400 mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>

            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Pour qui ? </span>
              {service.pourQui}
            </p>

            <Link to="/contact" className="btn-primary px-6 py-2.5 text-sm">
              Prendre rendez-vous
            </Link>
          </section>
        ))}
      </div>
    </div>
  );
}
