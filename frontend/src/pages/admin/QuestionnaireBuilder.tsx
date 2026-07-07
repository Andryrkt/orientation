import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { Question, Questionnaire, Reponse, TypeQuestion } from '../../lib/types';
import { parseScore, serializeScore } from '../../lib/riasec-score';

const TYPE_OPTIONS: { value: TypeQuestion; label: string }[] = [
  { value: 'CHOIX_MULTIPLE', label: 'Choix multiple' },
  { value: 'ECHELLE', label: 'Échelle (1-5)' },
  { value: 'TEXTE', label: 'Texte libre' },
];

function ReponseRow({ reponse, questionId }: { reponse: Reponse; questionId: string }) {
  const queryClient = useQueryClient();
  const [texte, setTexte] = useState(reponse.texte);
  const [score, setScore] = useState(serializeScore(reponse.score));

  const save = useMutation({
    mutationFn: () => api.patch(`/reponses/${reponse.id}`, { texte, score: parseScore(score) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-questionnaire', questionId] }),
  });
  const remove = useMutation({
    mutationFn: () => api.delete(`/reponses/${reponse.id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-questionnaire'] }),
  });

  return (
    <div className="flex gap-2 items-center">
      <input
        className="flex-1 border border-slate-300 rounded-md px-2 py-1.5 text-sm"
        value={texte}
        onChange={(e) => setTexte(e.target.value)}
      />
      <input
        className="w-32 border border-slate-300 rounded-md px-2 py-1.5 text-sm"
        placeholder="R:2, I:1"
        value={score}
        onChange={(e) => setScore(e.target.value)}
      />
      <button onClick={() => save.mutate()} className="text-brand-600 text-sm hover:underline shrink-0">
        Enregistrer
      </button>
      <button
        onClick={() => confirm('Supprimer cette reponse ?') && remove.mutate()}
        className="text-red-600 text-sm hover:underline shrink-0"
      >
        ✕
      </button>
    </div>
  );
}

function QuestionCard({ question }: { question: Question }) {
  const queryClient = useQueryClient();
  const [texte, setTexte] = useState(question.texte);
  const [type, setType] = useState<TypeQuestion>(question.type);
  const [ordre, setOrdre] = useState(question.ordre);
  const [scoreDimensions, setScoreDimensions] = useState(serializeScore(question.scoreDimensions));
  const [newReponseTexte, setNewReponseTexte] = useState('');

  const save = useMutation({
    mutationFn: () =>
      api.patch(`/questions/${question.id}`, {
        texte,
        type,
        ordre,
        scoreDimensions: parseScore(scoreDimensions),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-questionnaire'] }),
  });
  const remove = useMutation({
    mutationFn: () => api.delete(`/questions/${question.id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-questionnaire'] }),
  });
  const addReponse = useMutation({
    mutationFn: () => api.post('/reponses', { questionId: question.id, texte: newReponseTexte, score: {} }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-questionnaire'] });
      setNewReponseTexte('');
    },
  });

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
      <div className="flex gap-2">
        <input
          className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm font-medium"
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
        />
        <input
          type="number"
          className="w-16 border border-slate-300 rounded-md px-2 py-2 text-sm"
          value={ordre}
          onChange={(e) => setOrdre(e.target.valueAsNumber)}
        />
        <select
          className="border border-slate-300 rounded-md px-2 py-2 text-sm"
          value={type}
          onChange={(e) => setType(e.target.value as TypeQuestion)}
        >
          {TYPE_OPTIONS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {type === 'ECHELLE' && (
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-500 shrink-0">Poids RIASEC (ex: R:1)</label>
          <input
            className="border border-slate-300 rounded-md px-2 py-1.5 text-sm w-40"
            value={scoreDimensions}
            onChange={(e) => setScoreDimensions(e.target.value)}
          />
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button onClick={() => save.mutate()} className="text-sm text-brand-600 hover:underline">
          Enregistrer la question
        </button>
        <button
          onClick={() => confirm('Supprimer cette question ?') && remove.mutate()}
          className="text-sm text-red-600 hover:underline"
        >
          Supprimer
        </button>
      </div>

      {type === 'CHOIX_MULTIPLE' && (
        <div className="border-t border-slate-100 pt-3 space-y-2">
          <p className="text-xs font-medium text-slate-500 uppercase">Réponses</p>
          {question.reponses.map((r) => (
            <ReponseRow key={r.id} reponse={r} questionId={question.id} />
          ))}
          <div className="flex gap-2">
            <input
              className="flex-1 border border-slate-300 rounded-md px-2 py-1.5 text-sm"
              placeholder="Nouvelle réponse..."
              value={newReponseTexte}
              onChange={(e) => setNewReponseTexte(e.target.value)}
            />
            <button
              onClick={() => newReponseTexte.trim() && addReponse.mutate()}
              className="text-sm text-brand-600 hover:underline shrink-0"
            >
              + Ajouter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function QuestionnaireBuilder() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [newQuestionTexte, setNewQuestionTexte] = useState('');

  const { data: questionnaire, isLoading } = useQuery({
    queryKey: ['admin-questionnaire', id],
    queryFn: async () => (await api.get<Questionnaire>(`/admin/questionnaires/${id}`)).data,
  });

  useEffect(() => {
    if (questionnaire) {
      setTitre(questionnaire.titre);
      setDescription(questionnaire.description ?? '');
    }
  }, [questionnaire?.id]);

  const saveHeader = useMutation({
    mutationFn: () => api.patch(`/questionnaires/${id}`, { titre, description }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-questionnaire', id] }),
  });

  const addQuestion = useMutation({
    mutationFn: () =>
      api.post('/questions', {
        questionnaireId: id,
        texte: newQuestionTexte,
        type: 'CHOIX_MULTIPLE',
        ordre: (questionnaire?.questions?.length ?? 0) + 1,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-questionnaire', id] });
      setNewQuestionTexte('');
    },
  });

  if (isLoading) return <p className="text-slate-400">Chargement...</p>;
  if (!questionnaire) return <p className="text-slate-400">Questionnaire introuvable.</p>;

  const questions = [...(questionnaire.questions ?? [])].sort((a, b) => a.ordre - b.ordre);

  return (
    <div className="max-w-3xl">
      <Link to="/admin/questionnaires" className="text-sm text-brand-600 hover:underline">
        ← Retour aux questionnaires
      </Link>

      <div className="bg-white border border-slate-200 rounded-lg p-6 my-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Titre</label>
          <input
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Description</label>
          <textarea
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <button
          onClick={() => saveHeader.mutate()}
          className="px-4 py-2 bg-brand-600 text-white rounded-md text-sm font-medium hover:bg-brand-700"
        >
          Enregistrer
        </button>
      </div>

      <h2 className="text-lg font-bold text-slate-800 mb-4">Questions</h2>
      <div className="space-y-4 mb-6">
        {questions.map((q) => (
          <QuestionCard key={q.id} question={q} />
        ))}
      </div>

      <div className="bg-white border border-dashed border-slate-300 rounded-lg p-5 flex gap-2">
        <input
          className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm"
          placeholder="Texte de la nouvelle question..."
          value={newQuestionTexte}
          onChange={(e) => setNewQuestionTexte(e.target.value)}
        />
        <button
          onClick={() => newQuestionTexte.trim() && addQuestion.mutate()}
          className="px-4 py-2 bg-brand-600 text-white rounded-md text-sm font-medium hover:bg-brand-700 shrink-0"
        >
          + Ajouter une question
        </button>
      </div>
    </div>
  );
}
