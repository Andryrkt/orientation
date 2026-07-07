import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth-context';
import { Blog } from '../lib/types';
import { BLOG_CATEGORIES } from '../lib/blog-categories';

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString('fr-FR');
}

export function BlogDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');
  const [sent, setSent] = useState(false);

  const { data: blog, isLoading } = useQuery({
    queryKey: ['blog', slug],
    queryFn: async () => (await api.get<Blog>(`/blogs/${slug}`)).data,
  });

  const { data: likeStatus } = useQuery({
    queryKey: ['blog-like-status', blog?.id],
    queryFn: async () => (await api.get<{ liked: boolean }>(`/blogs/${blog!.id}/like-status`)).data,
    enabled: !!user && !!blog,
  });

  const likeMutation = useMutation({
    mutationFn: () => api.post(`/blogs/${blog!.id}/like`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-like-status', blog?.id] });
      queryClient.invalidateQueries({ queryKey: ['blog', slug] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: (contenu: string) => api.post(`/blogs/${blog!.id}/comments`, { contenu }),
    onSuccess: () => {
      setComment('');
      setSent(true);
    },
  });

  function handleLike() {
    if (!user) {
      navigate('/login');
      return;
    }
    likeMutation.mutate();
  }

  function handleComment(e: FormEvent) {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (comment.trim()) commentMutation.mutate(comment.trim());
  }

  if (isLoading) return <p className="text-slate-400">Chargement...</p>;
  if (!blog) return <p className="text-slate-400">Article introuvable.</p>;

  return (
    <div className="max-w-2xl mx-auto">
      {blog.categorie && (
        <p className="text-sm font-medium text-brand-600 mb-1">
          {BLOG_CATEGORIES.find((c) => c.value === blog.categorie)?.label ?? blog.categorie}
        </p>
      )}
      <h1 className="text-3xl font-bold text-slate-900 mb-2">{blog.titre}</h1>
      <p className="text-sm text-slate-500 mb-6">
        {blog.auteur && `${blog.auteur.prenom} ${blog.auteur.nom} — `}
        {formatDate(blog.publishedAt)}
      </p>

      {blog.image && <img src={blog.image} alt="" className="w-full rounded-lg mb-6" />}

      <div className="text-slate-700 whitespace-pre-line mb-8">{blog.contenu}</div>

      <button
        onClick={handleLike}
        disabled={likeMutation.isPending}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium mb-10 transition-colors disabled:opacity-50 ${
          likeStatus?.liked
            ? 'bg-brand-50 border-brand-300 text-brand-700'
            : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
        }`}
      >
        <span>{likeStatus?.liked ? '★' : '☆'}</span>
        J'aime ({blog._count?.likes ?? 0})
      </button>

      <h2 className="text-xl font-bold text-slate-800 mb-4">Commentaires</h2>

      {user ? (
        <form onSubmit={handleComment} className="mb-8">
          <textarea
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
            rows={3}
            placeholder="Ton commentaire..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          {sent && (
            <p className="text-sm text-green-700 mt-2">
              Merci ! Ton commentaire sera visible après validation par l'équipe.
            </p>
          )}
          <button
            type="submit"
            disabled={commentMutation.isPending || !comment.trim()}
            className="mt-2 px-4 py-2 bg-brand-600 text-white rounded-md text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
          >
            Publier
          </button>
        </form>
      ) : (
        <p className="text-sm text-slate-500 mb-8">
          <button onClick={() => navigate('/login')} className="text-brand-600 hover:underline">
            Connecte-toi
          </button>{' '}
          pour laisser un commentaire.
        </p>
      )}

      {blog.commentaires && blog.commentaires.length > 0 ? (
        <div className="space-y-4">
          {blog.commentaires.map((c) => (
            <div key={c.id} className="bg-white border border-slate-200 rounded-lg p-4">
              <p className="text-sm font-medium text-slate-800">
                {c.utilisateur?.prenom} {c.utilisateur?.nom}
              </p>
              <p className="text-sm text-slate-600 mt-1">{c.contenu}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-400 text-sm">Aucun commentaire pour le moment.</p>
      )}
    </div>
  );
}
