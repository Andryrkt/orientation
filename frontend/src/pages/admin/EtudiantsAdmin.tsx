import { Fragment, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { api } from '../../lib/api';
import { formatMontant } from '../../lib/format';
import { Filiere, MouvementCaisse, Paginated, ResumeEtudiants, ResumeEtudiantsFiliere, PointDeVente, User } from '../../lib/types';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function ilYA30JoursIso() {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString().slice(0, 10);
}

function formatDateCourte(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
}

export function EtudiantsAdmin() {
  const [dateFrom, setDateFrom] = useState(ilYA30JoursIso());
  const [dateTo, setDateTo] = useState(todayIso());
  const [pointDeVenteId, setPointDeVenteId] = useState('');
  const [saisiParId, setSaisiParId] = useState('');
  const [filiereId, setFiliereId] = useState('');
  const [statut, setStatut] = useState<'' | 'PAYE' | 'RESTE'>('');
  const [renouvellement, setRenouvellement] = useState(false);
  const [q, setQ] = useState('');
  const [qDebattue, setQDebattue] = useState('');
  const [page, setPage] = useState(1);
  const [lignesOuvertes, setLignesOuvertes] = useState<Set<string>>(new Set());

  function toggleLigne(id: string) {
    setLignesOuvertes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  useEffect(() => {
    const minuteur = setTimeout(() => {
      setQDebattue(q.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(minuteur);
  }, [q]);

  const { data: pointsDeVente } = useQuery({
    queryKey: ['admin-points-de-vente-filtre'],
    queryFn: async () => (await api.get<Paginated<PointDeVente>>('/admin/points-de-vente')).data,
  });

  const { data: usersData } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => (await api.get<Paginated<User>>('/admin/users?limit=100')).data,
  });
  const secretaires = usersData?.items.filter((u) => u.role === 'SECRETAIRE') ?? [];

  const { data: filieres } = useQuery({
    queryKey: ['admin-filieres-filtre'],
    queryFn: async () => (await api.get<Paginated<Filiere>>('/admin/filieres')).data,
  });

  const { data: etudiants, isLoading } = useQuery({
    queryKey: ['admin-etudiants', dateFrom, dateTo, pointDeVenteId, saisiParId, filiereId, statut, renouvellement, qDebattue, page],
    queryFn: async () =>
      (
        await api.get<Paginated<MouvementCaisse>>('/admin/etudiants', {
          params: {
            dateFrom,
            dateTo,
            pointDeVenteId: pointDeVenteId || undefined,
            saisiParId: saisiParId || undefined,
            filiereId: filiereId || undefined,
            statut: statut || undefined,
            renouvellement: renouvellement || undefined,
            q: qDebattue || undefined,
            page,
            limit: 20,
          },
        })
      ).data,
  });

  const { data: resumeParFiliere } = useQuery({
    queryKey: ['admin-etudiants-par-filiere', dateFrom, dateTo, pointDeVenteId, saisiParId, qDebattue],
    queryFn: async () =>
      (
        await api.get<ResumeEtudiantsFiliere[]>('/admin/etudiants/par-filiere', {
          params: {
            dateFrom,
            dateTo,
            pointDeVenteId: pointDeVenteId || undefined,
            saisiParId: saisiParId || undefined,
            q: qDebattue || undefined,
          },
        })
      ).data,
  });

  // Totaux pour les badges (statut, renouvellements) : ne dépendent jamais de statut/renouvellement
  // eux-mêmes, pour que les badges restent des bascules fiables (compteurs toujours complets).
  const { data: resume } = useQuery({
    queryKey: ['admin-etudiants-resume', dateFrom, dateTo, pointDeVenteId, saisiParId, filiereId, qDebattue],
    queryFn: async () =>
      (
        await api.get<ResumeEtudiants>('/admin/etudiants/resume', {
          params: {
            dateFrom,
            dateTo,
            pointDeVenteId: pointDeVenteId || undefined,
            saisiParId: saisiParId || undefined,
            filiereId: filiereId || undefined,
            q: qDebattue || undefined,
          },
        })
      ).data,
  });

  function resetPage<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setPage(1);
    };
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Étudiants inscrits</h1>
        <div className="flex items-center gap-2 text-sm flex-wrap">
          <input
            type="text"
            placeholder="Rechercher par nom ou n° reçu..."
            className="border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md px-2 py-1 w-64"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className="border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md px-2 py-1"
            value={pointDeVenteId}
            onChange={(e) => resetPage(setPointDeVenteId)(e.target.value)}
          >
            <option value="">— Tous les stands —</option>
            {pointsDeVente?.items.map((pdv) => (
              <option key={pdv.id} value={pdv.id}>
                {pdv.nom}
                {!pdv.actif ? ' (inactif)' : ''}
              </option>
            ))}
          </select>
          <select
            className="border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md px-2 py-1"
            value={saisiParId}
            onChange={(e) => resetPage(setSaisiParId)(e.target.value)}
          >
            <option value="">— Toutes les secrétaires —</option>
            {secretaires.map((s) => (
              <option key={s.id} value={s.id}>
                {s.prenom} {s.nom}
              </option>
            ))}
          </select>
          <select
            className="border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md px-2 py-1"
            value={filiereId}
            onChange={(e) => resetPage(setFiliereId)(e.target.value)}
          >
            <option value="">— Toutes les filières —</option>
            {filieres?.items.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nom}
              </option>
            ))}
          </select>
          <label className="text-slate-500 dark:text-slate-400">Du</label>
          <input
            type="date"
            className="border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md px-2 py-1"
            value={dateFrom}
            onChange={(e) => resetPage(setDateFrom)(e.target.value)}
          />
          <label className="text-slate-500 dark:text-slate-400">au</label>
          <input
            type="date"
            className="border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md px-2 py-1"
            value={dateTo}
            onChange={(e) => resetPage(setDateTo)(e.target.value)}
          />
        </div>
      </div>

      {resume && (
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <button
            onClick={() => {
              setStatut('');
              setRenouvellement(false);
              setPage(1);
            }}
            className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
              statut === '' && !renouvellement
                ? 'bg-slate-700 text-white dark:bg-slate-200 dark:text-slate-900'
                : 'bg-slate-500/10 text-slate-600 dark:text-slate-300 hover:bg-slate-500/20'
            }`}
          >
            Total · {resume.total}
          </button>
          <button
            onClick={() => resetPage(setStatut)(statut === 'PAYE' ? '' : 'PAYE')}
            className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
              statut === 'PAYE'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
            }`}
          >
            ✅ Payé · {resume.payeCount}
          </button>
          <button
            onClick={() => resetPage(setStatut)(statut === 'RESTE' ? '' : 'RESTE')}
            className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
              statut === 'RESTE'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20'
            }`}
          >
            ⚠️ Reste à payer · {resume.resteAPayerCount}
          </button>
          {resume.renouvellementsCount > 0 && (
            <button
              onClick={() => resetPage(setRenouvellement)(!renouvellement)}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                renouvellement
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20'
              }`}
            >
              🔁 Renouvellements · {resume.renouvellementsCount}
            </button>
          )}
        </div>
      )}

      {resumeParFiliere && resumeParFiliere.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Étudiants par filière :</span>
          {resumeParFiliere.map((r) => (
            <button
              key={r.filiereId}
              onClick={() => resetPage(setFiliereId)(filiereId === r.filiereId ? '' : r.filiereId)}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                filiereId === r.filiereId
                  ? 'bg-brand-600 text-white'
                  : 'bg-brand-500/10 text-brand-700 dark:text-brand-400 hover:bg-brand-500/20'
              }`}
            >
              {r.filiereNom} · {r.total}
            </button>
          ))}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-left text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium" />
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Étudiant</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Filières (début → fin)</th>
              <th className="px-4 py-3 font-medium">Montant total</th>
              <th className="px-4 py-3 font-medium">Montant payé</th>
              <th className="px-4 py-3 font-medium">Reste à payer</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Stand</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading && (
              <tr><td colSpan={10} className="px-4 py-6 text-center text-slate-400">Chargement...</td></tr>
            )}
            {!isLoading && etudiants?.items.length === 0 && (
              <tr><td colSpan={10} className="px-4 py-6 text-center text-slate-400">Aucun étudiant sur cette période</td></tr>
            )}
            {etudiants?.items.map((m) => {
              const paiementsComplementaires = m.paiementsComplementaires ?? [];
              // Une filière ajoutée plus tard (via un paiement complémentaire) est rattachée à ce
              // paiement plutôt qu'à l'inscription d'origine : on les fusionne pour l'affichage.
              const toutesFilieresInscrites = [
                ...m.filieresInscrites,
                ...paiementsComplementaires.flatMap((p) => p.filieresInscrites ?? []),
              ];
              const ouvert = lignesOuvertes.has(m.id);
              return (
                <Fragment key={m.id}>
                  <tr
                    onClick={() => toggleLigne(m.id)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer"
                  >
                    <td className="px-4 py-3 text-slate-400">
                      {ouvert ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(m.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                      {m.prenom} {m.nom}
                      {m.autresInscriptions && m.autresInscriptions.length > 0 && (
                        <span
                          className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 align-middle"
                          title={`Autre${m.autresInscriptions.length > 1 ? 's' : ''} inscription${m.autresInscriptions.length > 1 ? 's' : ''} du même étudiant :\n${m.autresInscriptions
                            .map((a) => `${new Date(a.date).toLocaleDateString('fr-FR')}${a.filieres.length ? ` · ${a.filieres.join(' + ')}` : ''}${a.numeroRecu ? ` · Reçu ${a.numeroRecu}` : ''}`)
                            .join('\n')}`}
                        >
                          🔁 renouvellement
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{m.contact ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">
                      {toutesFilieresInscrites.length > 0 ? (
                        <ul className="space-y-0.5">
                          {toutesFilieresInscrites.map((fi) => (
                            <li key={fi.id} className="whitespace-nowrap">
                              <span className="text-slate-700 dark:text-slate-300 font-medium">{fi.filiere.nom}</span>
                              {' '}({formatDateCourte(fi.dateDebutCours)} → {formatDateCourte(fi.dateFinCours)})
                            </li>
                          ))}
                        </ul>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-emerald-600 font-medium whitespace-nowrap">
                      {m.montantTotal !== null ? formatMontant(m.montantTotal) : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                      {m.montantPayeTotal !== undefined ? formatMontant(m.montantPayeTotal) : '—'}
                      {paiementsComplementaires.length > 0 && (
                        <span className="ml-1 text-[10px] font-bold text-brand-600 dark:text-brand-400">
                          (+{paiementsComplementaires.length} paiement{paiementsComplementaires.length > 1 ? 's' : ''})
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {m.montantRestantActuel !== null && m.montantRestantActuel !== undefined ? (
                        <span className={m.montantRestantActuel > 0 ? 'text-amber-600 font-medium' : 'text-slate-500 dark:text-slate-400'}>
                          {formatMontant(m.montantRestantActuel)}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {m.montantRestantActuel === null || m.montantRestantActuel === undefined ? (
                        <span className="text-slate-300 text-xs">—</span>
                      ) : m.montantRestantActuel <= 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600">✅ Payé</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600">⚠️ Reste à payer</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">{m.pointDeVente?.nom ?? '—'}</td>
                  </tr>
                  {ouvert && (
                    <tr>
                      <td colSpan={10} className="p-0">
                        <table className="w-full text-sm bg-slate-50 dark:bg-slate-800/40">
                          <thead className="text-left text-slate-400">
                            <tr>
                              <th className="pl-12 pr-4 py-2 font-medium">N°</th>
                              <th className="px-4 py-2 font-medium">Date</th>
                              <th className="px-4 py-2 font-medium">Montant</th>
                              <th className="px-4 py-2 font-medium">N° reçu</th>
                              <th className="px-4 py-2 font-medium">Filière ajoutée</th>
                              <th className="px-4 py-2 font-medium">Encaissé par</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            <tr>
                              <td className="pl-12 pr-4 py-2 text-slate-400">1ᵉʳ</td>
                              <td className="px-4 py-2 text-slate-600 dark:text-slate-300">
                                {new Date(m.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </td>
                              <td className="px-4 py-2 text-emerald-600 font-medium">{formatMontant(m.montant)}</td>
                              <td className="px-4 py-2 text-slate-500 dark:text-slate-400">{m.numeroRecu ?? '—'}</td>
                              <td className="px-4 py-2 text-slate-500 dark:text-slate-400">
                                {m.filieresInscrites.length > 0 ? m.filieresInscrites.map((fi) => fi.filiere.nom).join(' + ') : '—'}
                              </td>
                              <td className="px-4 py-2 text-slate-500 dark:text-slate-400">
                                {m.saisiPar ? `${m.saisiPar.prenom} ${m.saisiPar.nom}` : '—'}
                              </td>
                            </tr>
                            {paiementsComplementaires.map((p, index) => (
                              <tr key={p.id}>
                                <td className="pl-12 pr-4 py-2 text-slate-400">{index + 2}ᵉ</td>
                                <td className="px-4 py-2 text-slate-600 dark:text-slate-300">
                                  {new Date(p.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </td>
                                <td className="px-4 py-2 text-emerald-600 font-medium">{formatMontant(p.montant)}</td>
                                <td className="px-4 py-2 text-slate-500 dark:text-slate-400">{p.numeroRecu ?? '—'}</td>
                                <td className="px-4 py-2 text-slate-500 dark:text-slate-400">
                                  {p.filieresInscrites && p.filieresInscrites.length > 0 ? p.filieresInscrites.map((fi) => fi.filiere.nom).join(' + ') : '—'}
                                </td>
                                <td className="px-4 py-2 text-slate-500 dark:text-slate-400">
                                  {p.saisiPar ? `${p.saisiPar.prenom} ${p.saisiPar.nom}` : '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>

        {etudiants && etudiants.total > etudiants.limit && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              Page {etudiants.page} sur {Math.ceil(etudiants.total / etudiants.limit)} ({etudiants.total} étudiants)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded-md border border-slate-300 dark:border-slate-700 dark:text-slate-300 disabled:opacity-40"
              >
                Précédent
              </button>
              <button
                disabled={page >= Math.ceil(etudiants.total / etudiants.limit)}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded-md border border-slate-300 dark:border-slate-700 dark:text-slate-300 disabled:opacity-40"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
