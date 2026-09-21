import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Mention } from '../lib/types';
import { BackButton } from '../components/BackButton';
import { CONDITION_ADMISSION_LABELS, NIVEAU_LABELS, formatArgent } from '../lib/mention';

export function MentionDetail() {
  const { slug } = useParams();
  const { data: mention, isLoading } = useQuery({
    queryKey: ['mention', slug],
    queryFn: async () => (await api.get<Mention>(`/mentions/${slug}`)).data,
  });

  if (isLoading) return <p className="text-slate-400 py-16 text-center">Chargement...</p>;
  if (!mention) return <p className="text-slate-400 py-16 text-center">Mention introuvable.</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <BackButton fallback={mention.universite ? `/universites/${mention.universite.slug}` : '/etablissements'} />

      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="badge">{NIVEAU_LABELS[mention.niveau] ?? mention.niveau}</span>
          {mention.domaine && <span className="badge">{mention.domaine.nom}</span>}
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{mention.nom}</h1>
        {mention.universite && (
          <Link
            to={`/universites/${mention.universite.slug}`}
            className="text-brand-600 dark:text-blue-400 hover:underline text-sm font-medium"
          >
            {mention.universite.nom}
          </Link>
        )}
      </div>

      {mention.description && (
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{mention.description}</p>
      )}

      {/* Conditions et frais */}
      {(mention.conditionAdmission || mention.droitInscription != null || mention.fraisAnnuel != null || mention.fraisAnnexe != null) && (
        <div className="card p-5 grid sm:grid-cols-2 gap-4">
          {mention.conditionAdmission && (
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">Condition d'admission</p>
              <p className="text-slate-800 dark:text-white font-semibold">
                {CONDITION_ADMISSION_LABELS[mention.conditionAdmission] ?? mention.conditionAdmission}
              </p>
            </div>
          )}
          {mention.droitInscription != null && (
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">Droit d'inscription</p>
              <p className="text-slate-800 dark:text-white font-semibold">{formatArgent(mention.droitInscription)}</p>
            </div>
          )}
          {mention.fraisAnnuel != null && (
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">Frais annuel</p>
              <p className="text-slate-800 dark:text-white font-semibold">{formatArgent(mention.fraisAnnuel)}</p>
            </div>
          )}
          {mention.fraisAnnexe != null && (
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">Frais annexe</p>
              <p className="text-slate-800 dark:text-white font-semibold">{formatArgent(mention.fraisAnnexe)}</p>
            </div>
          )}
        </div>
      )}

      {/* Parcours */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Parcours</h2>
        {(!mention.parcours || mention.parcours.length === 0) && (
          <p className="text-slate-400">Aucun parcours renseigné pour le moment.</p>
        )}
        <div className="space-y-3">
          {mention.parcours?.map((p) => (
            <div key={p.id} className="card p-4">
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <h3 className="font-bold text-slate-800 dark:text-white">{p.nom}</h3>
                {p.duree && <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">{p.duree}</span>}
              </div>
              {p.description && <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{p.description}</p>}
              {p.conditionsAcces && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium">Conditions d'accès : </span>{p.conditionsAcces}
                </p>
              )}
              {p.debouches && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium">Débouchés : </span>{p.debouches}
                </p>
              )}
              {p.fraisAnnuels != null && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium">Frais annuels : </span>{formatArgent(p.fraisAnnuels)}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
