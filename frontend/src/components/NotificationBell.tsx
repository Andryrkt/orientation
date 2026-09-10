import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { api } from '../lib/api';
import { Notification, Paginated } from '../lib/types';
import { useAuth } from '../lib/auth-context';

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days} j`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();
  const previousCount = useRef<number | undefined>(undefined);

  const { data: unread } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: async () => (await api.get<{ count: number }>('/notifications/unread-count')).data,
    refetchInterval: 30000,
  });

  // Une nouvelle notification signale souvent un changement de compte (fiche approuvée/refusée,
  // demande de rôle traitée...) : on resynchronise "user" tout de suite plutôt que d'attendre le
  // rafraîchissement périodique de secours dans AuthContext.
  useEffect(() => {
    if (unread === undefined) return;
    if (previousCount.current !== undefined && unread.count > previousCount.current) {
      refreshUser().catch(() => {});
    }
    previousCount.current = unread.count;
  }, [unread, refreshUser]);

  const { data: list } = useQuery({
    queryKey: ['notifications-list'],
    queryFn: async () => (await api.get<Paginated<Notification>>('/notifications?limit=15')).data,
    enabled: open,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    queryClient.invalidateQueries({ queryKey: ['notifications-list'] });
  };

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/lu`),
    onSuccess: invalidate,
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.patch('/notifications/lu-tout'),
    onSuccess: invalidate,
  });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleClickNotification(n: Notification) {
    if (!n.lu) markReadMutation.mutate(n.id);
    setOpen(false);
    if (n.lien) navigate(n.lien);
  }

  const count = unread?.count ?? 0;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-white/8 transition-all duration-200"
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-80 max-h-[420px] overflow-y-auto rounded-2xl border py-2 z-50 animate-dropdown"
          style={{
            background: 'rgba(10, 8, 24, 0.97)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 30px rgba(0,163,255,0.1)',
          }}
        >
          <div className="flex items-center justify-between px-3.5 pb-2 border-b border-white/8 mb-1">
            <span className="text-sm font-bold text-white">Notifications</span>
            {count > 0 && (
              <button
                onClick={() => markAllReadMutation.mutate()}
                className="text-xs text-blue-400 hover:underline"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>

          {!list || list.items.length === 0 ? (
            <p className="text-xs text-slate-400 px-3.5 py-4 text-center">Aucune notification.</p>
          ) : (
            list.items.map((n) => (
              <button
                key={n.id}
                onClick={() => handleClickNotification(n)}
                className={`block w-full text-left px-3.5 py-2.5 rounded-xl transition-all ${
                  n.lu ? 'hover:bg-white/8' : 'bg-blue-500/10 hover:bg-blue-500/15'
                }`}
              >
                <div className="flex items-start gap-2">
                  {!n.lu && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />}
                  <div className={n.lu ? 'pl-3.5' : ''}>
                    <p className="text-sm font-semibold text-white leading-snug">{n.titre}</p>
                    <p className="text-xs text-slate-300 leading-snug mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
