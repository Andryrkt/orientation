import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-center text-slate-500">Chargement...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function AdminRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-center text-slate-500">Chargement...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'ADMIN' && user.role !== 'MODERATEUR_FINANCE') return <Navigate to="/" replace />;
  return <Outlet />;
}

// Restreint aux sections du back-office hors Finances : un MODERATEUR_FINANCE a le droit d'entrer
// dans /admin (cf. AdminRoute) mais pas dans ces pages-là, seulement dans la section Finances.
export function AdminStrictRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-center text-slate-500">Chargement...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'ADMIN') return <Navigate to="/admin/finances" replace />;
  return <Outlet />;
}

export function SecretaireRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-center text-slate-500">Chargement...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'SECRETAIRE') return <Navigate to="/" replace />;
  return <Outlet />;
}

export function ModerateurRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-center text-slate-500">Chargement...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'MODERATEUR' && user.role !== 'ADMIN') return <Navigate to="/" replace />;
  return <Outlet />;
}

export function CoachOuEnseignantRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-center text-slate-500">Chargement...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'COACH' && user.role !== 'TEACHER') return <Navigate to="/" replace />;
  return <Outlet />;
}
