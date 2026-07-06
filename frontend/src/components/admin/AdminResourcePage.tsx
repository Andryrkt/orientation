import { FormEvent, ReactNode, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Paginated } from '../../lib/types';

export type FieldType = 'text' | 'number' | 'textarea' | 'select';

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { value: string; label: string }[];
}

export interface ColumnConfig<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
}

interface AdminResourcePageProps<T extends { id: string }> {
  title: string;
  apiPath: string;
  queryKey: string;
  columns: ColumnConfig<T>[];
  fields: FieldConfig[];
  emptyItem: Record<string, unknown>;
  toFormValues?: (item: T) => Record<string, unknown>;
  toPayload?: (values: Record<string, unknown>) => Record<string, unknown>;
}

export function AdminResourcePage<T extends { id: string }>({
  title,
  apiPath,
  queryKey,
  columns,
  fields,
  emptyItem,
  toFormValues,
  toPayload,
}: AdminResourcePageProps<T>) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<T | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [values, setValues] = useState<Record<string, unknown>>(emptyItem);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: async () => (await api.get<Paginated<T>>(`${apiPath}?limit=100`)).data,
  });

  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post(apiPath, payload),
    onSuccess: closeAndRefresh,
    onError: showError,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      api.patch(`${apiPath}/${id}`, payload),
    onSuccess: closeAndRefresh,
    onError: showError,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`${apiPath}/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [queryKey] }),
    onError: showError,
  });

  function showError(err: unknown) {
    const message =
      (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
    setError(Array.isArray(message) ? message.join(', ') : message ?? 'Une erreur est survenue');
  }

  function closeAndRefresh() {
    queryClient.invalidateQueries({ queryKey: [queryKey] });
    setShowForm(false);
    setEditing(null);
    setValues(emptyItem);
    setError(null);
  }

  function openCreate() {
    setEditing(null);
    setValues(emptyItem);
    setError(null);
    setShowForm(true);
  }

  function openEdit(item: T) {
    setEditing(item);
    setValues(toFormValues ? toFormValues(item) : (item as unknown as Record<string, unknown>));
    setError(null);
    setShowForm(true);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const payload = toPayload ? toPayload(values) : values;
    if (editing) {
      updateMutation.mutate({ id: editing.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  function handleDelete(item: T) {
    if (confirm('Confirmer la suppression ?')) {
      deleteMutation.mutate(item.id);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-brand-600 text-white rounded-md text-sm font-medium hover:bg-brand-700"
        >
          + Ajouter
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 font-medium">
                  {col.label}
                </th>
              ))}
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-6 text-center text-slate-400">
                  Chargement...
                </td>
              </tr>
            )}
            {!isLoading && data?.items.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-6 text-center text-slate-400">
                  Aucun élément
                </td>
              </tr>
            )}
            {data?.items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-slate-700">
                    {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button
                    onClick={() => openEdit(item)}
                    className="text-brand-600 hover:underline mr-3"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="text-red-600 hover:underline"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-20 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <h2 className="text-lg font-bold text-slate-800">
                {editing ? 'Modifier' : 'Ajouter'} — {title}
              </h2>
              {error && (
                <div className="bg-red-50 text-red-700 text-sm rounded-md px-3 py-2">{error}</div>
              )}
              {fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    {field.label}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                      rows={3}
                      required={field.required}
                      value={(values[field.name] as string) ?? ''}
                      onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                      required={field.required}
                      value={(values[field.name] as string) ?? ''}
                      onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
                    >
                      <option value="">—</option>
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                      required={field.required}
                      value={(values[field.name] as string | number) ?? ''}
                      onChange={(e) =>
                        setValues({
                          ...values,
                          [field.name]: field.type === 'number' ? e.target.valueAsNumber : e.target.value,
                        })
                      }
                    />
                  )}
                </div>
              ))}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm rounded-md text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 text-sm rounded-md bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
