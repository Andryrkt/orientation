import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Metier } from '../lib/types';
import { FavoriteButton } from '../components/FavoriteButton';

function TagList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span key={item} className="px-2 py-0.5 bg-slate-100 rounded-full text-xs text-slate-600">
          {item}
        </span>
      ))}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-bold text-slate-800 mb-1">{label}</h3>
      {children}
    </div>
  );
}

export function MetierDetail() {
  const { slug } = useParams();
  const { data: metier, isLoading } = useQuery({
    queryKey: ['metier', slug],
    queryFn: async () => (await api.get<Metier>(`/metiers/${slug}`)).data,
  });

  if (isLoading) return <p className="text-slate-400">Chargement...</p>;
  if (!metier) return <p className="text-slate-400">Métier introuvable.</p>;

  const hasTemoignage = metier.temoignageCitation || metier.temoignageCePlait || metier.temoignageConseil;

  return (
    <div className="max-w-3xl mx-auto">
      <p className="text-sm font-medium text-brand-600 mb-1">
        {metier.domaine?.nom}
        {metier.sousDomaine && ` · ${metier.sousDomaine}`}
      </p>
      <div className="flex items-start justify-between gap-4 mb-1">
        <h1 className="text-3xl font-bold text-slate-900">{metier.nom}</h1>
        <FavoriteButton type="METIER" entityId={metier.id} className="shrink-0" />
      </div>
      {metier.autresAppellations?.length > 0 && (
        <p className="text-sm text-slate-500 mb-4">
          Aussi appelé : {metier.autresAppellations.join(', ')}
        </p>
      )}
      <p className="text-slate-700 mb-6">{metier.description}</p>

      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        {metier.missions?.length > 0 && (
          <Field label="Missions">
            <ul className="text-slate-600 text-sm list-disc list-inside space-y-0.5">
              {metier.missions.map((m) => <li key={m}>{m}</li>)}
            </ul>
          </Field>
        )}
        {metier.competences?.length > 0 && (
          <Field label="Compétences techniques">
            <TagList items={metier.competences as unknown as string[]} />
          </Field>
        )}
        {metier.competencesComportementales?.length > 0 && (
          <Field label="Compétences comportementales">
            <TagList items={metier.competencesComportementales} />
          </Field>
        )}
        {metier.languesRequises?.length > 0 && (
          <Field label="Langues requises">
            <p className="text-slate-600 text-sm">
              {metier.languesRequises.join(', ')}
              {metier.niveauLangues && ` — ${metier.niveauLangues}`}
            </p>
          </Field>
        )}
        {(metier.salaireMin || metier.salaireMax) && (
          <Field label="Salaire moyen">
            <p className="text-slate-600 text-sm">
              {metier.salaireMin?.toLocaleString('fr-FR')} - {metier.salaireMax?.toLocaleString('fr-FR')} Ar
            </p>
            {metier.salaireSource && (
              <p className="text-slate-400 text-xs mt-0.5">Source : {metier.salaireSource}</p>
            )}
          </Field>
        )}
        {metier.niveauRequis && (
          <Field label="Niveau requis">
            <p className="text-slate-600 text-sm">{metier.niveauRequis}</p>
            {metier.specialiteDiplome && (
              <p className="text-slate-400 text-xs mt-0.5">Spécialité : {metier.specialiteDiplome}</p>
            )}
          </Field>
        )}
        {metier.formationsMadagascar?.length > 0 && (
          <Field label="Formations à Madagascar">
            <ul className="text-slate-600 text-sm list-disc list-inside space-y-0.5">
              {metier.formationsMadagascar.map((f) => <li key={f}>{f}</li>)}
            </ul>
          </Field>
        )}
        {metier.typeContrat?.length > 0 && (
          <Field label="Type de contrat">
            <TagList items={metier.typeContrat} />
          </Field>
        )}
        {metier.niveauDemande && (
          <Field label="Demande sur le marché malgache">
            <p className="text-slate-600 text-sm">{metier.niveauDemande}</p>
          </Field>
        )}
        {metier.regionsPresence?.length > 0 && (
          <Field label="Régions où le métier est présent">
            <TagList items={metier.regionsPresence} />
          </Field>
        )}
        {metier.employeurs?.length > 0 && (
          <Field label="Principaux employeurs à Madagascar">
            <TagList items={metier.employeurs} />
          </Field>
        )}
        {metier.traitsPersonnalite?.length > 0 && (
          <Field label="Traits de personnalité">
            <TagList items={metier.traitsPersonnalite} />
          </Field>
        )}
        {metier.valeursProfessionnelles?.length > 0 && (
          <Field label="Valeurs professionnelles">
            <TagList items={metier.valeursProfessionnelles} />
          </Field>
        )}
        {metier.perspectivesEmploi && (
          <div className="sm:col-span-2">
            <Field label="Perspectives d'emploi">
              <p className="text-slate-600 text-sm">{metier.perspectivesEmploi}</p>
            </Field>
          </div>
        )}
      </div>

      {hasTemoignage && (
        <div className="mb-8 p-5 bg-brand-50 border border-brand-100 rounded-xl">
          <h3 className="font-bold text-slate-800 mb-2">
            Témoignage{metier.temoignagePrenom && ` de ${metier.temoignagePrenom}`}
            {metier.temoignageAnneesExperience != null &&
              ` (${metier.temoignageAnneesExperience} ans d'expérience)`}
          </h3>
          {metier.temoignageCitation && (
            <p className="italic text-slate-700 mb-2">« {metier.temoignageCitation} »</p>
          )}
          {metier.temoignageCePlait && (
            <p className="text-slate-600 text-sm mb-1">
              <span className="font-medium">Ce qui lui plaît : </span>
              {metier.temoignageCePlait}
            </p>
          )}
          {metier.temoignageConseil && (
            <p className="text-slate-600 text-sm">
              <span className="font-medium">Son conseil : </span>
              {metier.temoignageConseil}
            </p>
          )}
        </div>
      )}

      {metier.similaires && metier.similaires.length > 0 && (
        <div>
          <h3 className="font-bold text-slate-800 mb-3">Métiers similaires</h3>
          <div className="flex flex-wrap gap-2">
            {metier.similaires.map((m) => (
              <Link
                key={m.id}
                to={`/metiers/${m.slug}`}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-sm text-slate-700 hover:bg-slate-50"
              >
                {m.nom}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
