import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import { useAuth } from './auth-context';
import { Favori, FavorisableType } from './types';

export function useFavoris() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: favoris } = useQuery({
    queryKey: ['favoris'],
    queryFn: async () => (await api.get<Favori[]>('/favoris')).data,
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: (payload: { type: FavorisableType; entityId: string }) =>
      api.post<Favori>('/favoris', payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favoris'] }),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/favoris/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favoris'] }),
  });

  function findFavori(type: FavorisableType, entityId: string) {
    return favoris?.find((f) => f.type === type && f.entityId === entityId);
  }

  function toggle(type: FavorisableType, entityId: string) {
    const existing = findFavori(type, entityId);
    if (existing) {
      removeMutation.mutate(existing.id);
    } else {
      addMutation.mutate({ type, entityId });
    }
  }

  return {
    favoris: favoris ?? [],
    isFavori: (type: FavorisableType, entityId: string) => !!findFavori(type, entityId),
    toggle,
    isLoading: addMutation.isPending || removeMutation.isPending,
  };
}
