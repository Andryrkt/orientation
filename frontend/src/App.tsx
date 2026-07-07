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
import { StagesList } from './pages/StagesList';
import { StageDetail } from './pages/StageDetail';
import { BoursesList } from './pages/BoursesList';
import { BourseDetail } from './pages/BourseDetail';
import { BlogsList } from './pages/BlogsList';
import { BlogDetail } from './pages/BlogDetail';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profil } from './pages/Profil';
import { Favoris } from './pages/Favoris';
import { NotFound } from './pages/NotFound';
import { Dashboard } from './pages/admin/Dashboard';
import { DomainesAdmin } from './pages/admin/DomainesAdmin';
import { MetiersAdmin } from './pages/admin/MetiersAdmin';
import { UniversitesAdmin } from './pages/admin/UniversitesAdmin';
import { MentionsAdmin } from './pages/admin/MentionsAdmin';
import { ParcoursAdmin } from './pages/admin/ParcoursAdmin';
import { StagesAdmin } from './pages/admin/StagesAdmin';
import { BoursesAdmin } from './pages/admin/BoursesAdmin';
import { BlogsAdmin } from './pages/admin/BlogsAdmin';
import { BlogCommentairesAdmin } from './pages/admin/BlogCommentairesAdmin';
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
        <Route path="stages" element={<StagesList />} />
        <Route path="stages/:id" element={<StageDetail />} />
        <Route path="bourses" element={<BoursesList />} />
        <Route path="bourses/:id" element={<BourseDetail />} />
        <Route path="blog" element={<BlogsList />} />
        <Route path="blog/:slug" element={<BlogDetail />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="profil" element={<Profil />} />
          <Route path="favoris" element={<Favoris />} />
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
          <Route path="stages" element={<StagesAdmin />} />
          <Route path="bourses" element={<BoursesAdmin />} />
          <Route path="blogs" element={<BlogsAdmin />} />
          <Route path="blog-commentaires" element={<BlogCommentairesAdmin />} />
          <Route path="utilisateurs" element={<UtilisateursAdmin />} />
        </Route>
      </Route>

      <Route path="*" element={<PublicLayout />}>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
