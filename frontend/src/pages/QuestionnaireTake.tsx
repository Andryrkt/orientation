import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Questionnaire, ResultatOrientation } from '../lib/types';

interface Answer {
  reponseId?: string;
  valeurEchelle?: number;
  texte?: string;
}

const ECHELLE_LABELS = ['Pas du tout', 'Un peu', 'Moyennement', 'Beaucoup', 'Passionnément'];

export function QuestionnaireTake() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [error, setError] = useState<string | null>(null);

  const { data: questionnaire, isLoading } = useQuery({
    queryKey: ['questionnaire', id],
    queryFn: async () => (await api.get<Questionnaire>(`/questionnaires/${id}`)).data,
  });

  const submitMutation = useMutation({
    mutationFn: () =>
      api.post<ResultatOrientation>(`/questionnaires/${id}/soumettre`, {
        reponses: Object.entries(answers).map(([questionId, answer]) => ({ questionId, ...answer })),
      }),
    onSuccess: (res) => navigate(`/questionnaire/resultats/${res.data.id}`),
    onError: () => setError('Une erreur est survenue. Verifie que tu as repondu a toutes les questions.'),
  });

  if (isLoading) return <p className="text-slate-400">Chargement...</p>;
  if (!questionnaire?.questions?.length) return <p className="text-slate-400">Questionnaire introuvable.</p>;

  const questions = questionnaire.questions;
  const question = questions[index];
  const isLast = index === questions.length - 1;
  const answer = answers[question.id];
  const canProceed =
    question.type === 'CHOIX_MULTIPLE'
      ? !!answer?.reponseId
      : question.type === 'ECHELLE'
        ? answer?.valeurEchelle !== undefined
        : true;

  function setAnswer(value: Answer) {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  }

  function handleNext() {
    if (isLast) {
      submitMutation.mutate();
    } else {
      setIndex((i) => i + 1);
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-1.5 bg-brand-600 rounded-full transition-all"
            style={{ width: `${((index + 1) / questions.length) * 100}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Question {index + 1} / {questions.length}
        </p>
      </div>

      <h1 className="text-xl font-bold text-slate-800 mb-6">{question.texte}</h1>

      {question.type === 'CHOIX_MULTIPLE' && (
        <div className="space-y-2">
          {question.reponses.map((r) => (
            <button
              key={r.id}
              onClick={() => setAnswer({ reponseId: r.id })}
              className={`w-full text-left px-4 py-3 rounded-md border text-sm transition-colors ${
                answer?.reponseId === r.id
                  ? 'bg-brand-50 border-brand-400 text-brand-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {r.texte}
            </button>
          ))}
        </div>
      )}

      {question.type === 'ECHELLE' && (
        <div className="space-y-2">
          {ECHELLE_LABELS.map((label, i) => {
            const value = i + 1;
            return (
              <button
                key={value}
                onClick={() => setAnswer({ valeurEchelle: value })}
                className={`w-full text-left px-4 py-3 rounded-md border text-sm transition-colors ${
                  answer?.valeurEchelle === value
                    ? 'bg-brand-50 border-brand-400 text-brand-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {question.type === 'TEXTE' && (
        <textarea
          className="field-input"
          rows={4}
          value={answer?.texte ?? ''}
          onChange={(e) => setAnswer({ texte: e.target.value })}
        />
      )}

      {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

      <div className="flex justify-between mt-8">
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="px-4 py-2 text-sm rounded-md text-slate-600 hover:bg-slate-100 disabled:opacity-0"
        >
          Précédent
        </button>
        <button
          onClick={handleNext}
          disabled={!canProceed || submitMutation.isPending}
          className="btn-primary"
        >
          {isLast ? 'Terminer' : 'Suivant'}
        </button>
      </div>
    </div>
  );
}
