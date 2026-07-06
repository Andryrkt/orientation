import { Route, Routes } from 'react-router-dom';
import { PublicLayout } from './components/PublicLayout';
import { AdminLayout } from './components/admin/AdminLayout';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { MetiersList } from './pages/MetiersList';
import { MetierDetail } from './pages/MetierDetail';
import { DomainesList } from './pages/DomainesList';
import { UniversitesList } from './pages/UniversitesList';
import { UniversiteDetail } from './pages/UniversiteDetail';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profil } from './pages/Profil';
import { NotFound } from './pages/NotFound';
import { Dashboard } from './pages/admin/Dashboard';
import { DomainesAdmin } from './pages/admin/DomainesAdmin';
import { MetiersAdmin } from './pages/admin/MetiersAdmin';
import { UniversitesAdmin } from './pages/admin/UniversitesAdmin';
import { MentionsAdmin } from './pages/admin/MentionsAdmin';
import { ParcoursAdmin } from './pages/admin/ParcoursAdmin';
import { UtilisateursAdmin } from './pages/admin/UtilisateursAdmin';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="metiers" element={<MetiersList />} />
        <Route path="metiers/:slug" element={<MetierDetail />} />
        <Route path="domaines" element={<DomainesList />} />
        <Route path="universites" element={<UniversitesList />} />
        <Route path="universites/:slug" element={<UniversiteDetail />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="profil" element={<Profil />} />
        </Route>
      </Route>

      <Route element={<AdminRoute />}>
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="domaines" element={<DomainesAdmin />} />
          <Route path="metiers" element={<MetiersAdmin />} />
          <Route path="universites" element={<UniversitesAdmin />} />
          <Route path="mentions" element={<MentionsAdmin />} />
          <Route path="parcours" element={<ParcoursAdmin />} />
          <Route path="utilisateurs" element={<UtilisateursAdmin />} />
        </Route>
      </Route>

      <Route path="*" element={<PublicLayout />}>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
