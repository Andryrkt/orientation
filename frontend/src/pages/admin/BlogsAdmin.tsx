import { AdminResourcePage } from '../../components/admin/AdminResourcePage';
import { Blog } from '../../lib/types';
import { BLOG_CATEGORIES } from '../../lib/blog-categories';

function toDateInput(value: string | null | undefined) {
  return value ? value.slice(0, 10) : '';
}

const STATUT_LABELS: Record<string, string> = {
  EN_ATTENTE: 'En attente de modération',
  APPROUVE: 'Approuvé',
  REJETE: 'Rejeté',
};

function toPayload(values: Record<string, unknown>) {
  const payload = { ...values };
  if (payload.publishedAt === '') delete payload.publishedAt;
  if (payload.image === '') delete payload.image;
  if (payload.categorie === '') delete payload.categorie;
  return payload;
}

export function BlogsAdmin() {
  return (
    <AdminResourcePage<Blog>
      title="Articles de blog"
      apiPath="/blogs"
      listApiPath="/admin/blogs"
      queryKey="admin-blogs"
      emptyItem={{ titre: '', contenu: '', image: '', categorie: '', statut: 'APPROUVE', publishedAt: '' }}
      toFormValues={(item) => ({ ...item, publishedAt: toDateInput(item.publishedAt) })}
      toPayload={toPayload}
      columns={[
        { key: 'titre', label: 'Titre' },
        { key: 'auteur', label: 'Auteur', render: (item) => item.auteur ? `${item.auteur.prenom} ${item.auteur.nom}` : '—' },
        {
          key: 'categorie',
          label: 'Catégorie',
          render: (item) => (item.categorie ? BLOG_CATEGORIES.find((c) => c.value === item.categorie)?.label ?? item.categorie : '—'),
        },
        {
          key: 'statut',
          label: 'Statut',
          render: (item) =>
            item.statut !== 'APPROUVE'
              ? STATUT_LABELS[item.statut]
              : item.publishedAt && new Date(item.publishedAt) <= new Date()
                ? 'Publié'
                : 'Approuvé (non publié)',
        },
        { key: 'likes', label: 'Likes', render: (item) => item._count?.likes ?? 0 },
      ]}
      fields={[
        { name: 'titre', label: 'Titre', type: 'text', required: true },
        { name: 'contenu', label: 'Contenu', type: 'wysiwyg', required: true },
        { name: 'image', label: 'Image (URL)', type: 'text' },
        { name: 'categorie', label: 'Catégorie', type: 'select', options: BLOG_CATEGORIES },
        {
          name: 'statut',
          label: 'Modération — statut',
          type: 'select',
          required: true,
          options: [
            { value: 'EN_ATTENTE', label: 'En attente de modération' },
            { value: 'APPROUVE', label: 'Approuvé' },
            { value: 'REJETE', label: 'Rejeté' },
          ],
        },
        {
          name: 'publishedAt',
          label: 'Date de publication (laisser vide pour un brouillon, requiert le statut Approuvé)',
          type: 'date',
        },
      ]}
    />
  );
}
