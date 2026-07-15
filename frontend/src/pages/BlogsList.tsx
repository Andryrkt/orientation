import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Blog, Paginated } from '../lib/types';
import { BLOG_CATEGORIES } from '../lib/blog-categories';

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString('fr-FR');
}

function excerpt(text: string, length = 140) {
  const cleanText = text.replace(/<[^>]*>/g, '');
  return cleanText.length > length ? `${cleanText.slice(0, length)}…` : cleanText;
}

export function BlogsList() {
  const [categorie, setCategorie] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['blogs', categorie],
    queryFn: async () =>
      (await api.get<Paginated<Blog>>('/blogs', { params: { limit: 50, ...(categorie && { categorie }) } })).data,
  });

  return (
    <div>
      <h1 className="page-title">Blog / Conseils</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={categorie}
          onChange={(e) => setCategorie(e.target.value)}
          className="field-input"
        >
          <option value="">Toutes les catégories</option>
          {BLOG_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {isLoading && <p className="text-slate-400">Chargement...</p>}
      {!isLoading && data?.items.length === 0 && (
        <p className="text-slate-400">Aucun article pour le moment.</p>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.items.map((b) => (
          <Link
            key={b.id}
            to={`/blog/${b.slug}`}
            className="card block overflow-hidden"
          >
            {b.image && <img src={b.image} alt="" className="w-full h-36 object-cover" />}
            <div className="p-5">
              {b.categorie && (
                <p className="text-xs font-medium text-brand-600 mb-1">
                  {BLOG_CATEGORIES.find((c) => c.value === b.categorie)?.label ?? b.categorie}
                </p>
              )}
              <h3 className="text-lg font-bold text-slate-800 mb-2">{b.titre}</h3>
              <p className="text-slate-600 text-sm">{excerpt(b.contenu)}</p>
              <div className="flex items-center justify-between text-xs text-slate-500 mt-3">
                <span>{formatDate(b.publishedAt)}</span>
                <span>★ {b._count?.likes ?? 0}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
