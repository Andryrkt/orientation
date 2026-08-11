import { Route, Routes } from 'react-router-dom';
import { PublicLayout } from './components/PublicLayout';
import { AdminLayout } from './components/admin/AdminLayout';
import { ProtectedRoute, AdminRoute, SecretaireRoute } from './components/ProtectedRoute';
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
import { BudgetSimulator } from './pages/BudgetSimulator';
import { BlogsList } from './pages/BlogsList';
import { BlogDetail } from './pages/BlogDetail';
import { QuestionnairesList } from './pages/QuestionnairesList';
import { QuestionnaireTake } from './pages/QuestionnaireTake';
import { QuestionnaireResultat } from './pages/QuestionnaireResultat';
import { QuestionnaireHistorique } from './pages/QuestionnaireHistorique';
import { CoachsList } from './pages/CoachsList';
import { CoachDetail } from './pages/CoachDetail';
import { EnseignantsList } from './pages/EnseignantsList';
import { EnseignantDetail } from './pages/EnseignantDetail';
import { CentresFormationList } from './pages/CentresFormationList';
import { CentreFormationDetail } from './pages/CentreFormationDetail';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profil } from './pages/Profil';
import { CvGenerator } from './pages/CvGenerator';
import { Favoris } from './pages/Favoris';
import { RessourcesApprentissage } from './pages/RessourcesApprentissage';
import { NotFound } from './pages/NotFound';
import { GuideUtilisateur } from './pages/GuideUtilisateur';
import { Contact } from './pages/Contact';
import { FAQ } from './pages/FAQ';
import { SaisieJournaliere } from './pages/SaisieJournaliere';
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
import { QuestionnairesAdmin } from './pages/admin/QuestionnairesAdmin';
import { QuestionnaireBuilder } from './pages/admin/QuestionnaireBuilder';
import { CoachsAdmin } from './pages/admin/CoachsAdmin';
import { CentresFormationAdmin } from './pages/admin/CentresFormationAdmin';
import { UtilisateursAdmin } from './pages/admin/UtilisateursAdmin';
import { Tickets } from './pages/Tickets';
import { TicketDetail } from './pages/TicketDetail';
import { TicketsAdmin } from './pages/admin/TicketsAdmin';
import { TicketDetailAdmin } from './pages/admin/TicketDetailAdmin';
import { RessourcesAdmin } from './pages/admin/RessourcesAdmin';
import { EnseignantsAdmin } from './pages/admin/EnseignantsAdmin';
import { FaqAdmin } from './pages/admin/FaqAdmin';
import { ContactMessagesAdmin } from './pages/admin/ContactMessagesAdmin';
import { PointsDeVenteAdmin } from './pages/admin/PointsDeVenteAdmin';
import { SaisiesJournalieresAdmin } from './pages/admin/SaisiesJournalieresAdmin';
import { DepensesGlobalesAdmin } from './pages/admin/DepensesGlobalesAdmin';
import { InvestissementsAdmin } from './pages/admin/InvestissementsAdmin';
import { FinancesDashboard } from './pages/admin/FinancesDashboard';
import { FilieresAdmin } from './pages/admin/FilieresAdmin';

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
        <Route path="centres-formation" element={<CentresFormationList />} />
        <Route path="centres-formation/:slug" element={<CentreFormationDetail />} />
        <Route path="stages" element={<StagesList />} />
        <Route path="stages/:id" element={<StageDetail />} />
        <Route path="bourses" element={<BoursesList />} />
        <Route path="bourses/:id" element={<BourseDetail />} />
        <Route path="budget" element={<BudgetSimulator />} />
        <Route path="blog" element={<BlogsList />} />
        <Route path="blog/:slug" element={<BlogDetail />} />
        <Route path="questionnaire" element={<QuestionnairesList />} />
        <Route path="coachs" element={<CoachsList />} />
        <Route path="coachs/:id" element={<CoachDetail />} />
        <Route path="enseignants" element={<EnseignantsList />} />
        <Route path="enseignants/:id" element={<EnseignantDetail />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="guide" element={<GuideUtilisateur />} />
        <Route path="contact" element={<Contact />} />
        <Route path="faq" element={<FAQ />} />
        <Route element={<ProtectedRoute />}>
          <Route path="profil" element={<Profil />} />
          <Route path="mon-cv" element={<CvGenerator />} />
          <Route path="ressources" element={<RessourcesApprentissage />} />
          <Route path="favoris" element={<Favoris />} />
          <Route path="questionnaire/:id" element={<QuestionnaireTake />} />
          <Route path="questionnaire/resultats/:id" element={<QuestionnaireResultat />} />
          <Route path="mes-resultats" element={<QuestionnaireHistorique />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="tickets/:id" element={<TicketDetail />} />
        </Route>
        <Route element={<SecretaireRoute />}>
          <Route path="saisie-journaliere" element={<SaisieJournaliere />} />
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
          <Route path="ressources" element={<RessourcesAdmin />} />
          <Route path="questionnaires" element={<QuestionnairesAdmin />} />
          <Route path="questionnaires/:id" element={<QuestionnaireBuilder />} />
          <Route path="coachs" element={<CoachsAdmin />} />
          <Route path="enseignants" element={<EnseignantsAdmin />} />
          <Route path="centres-formation" element={<CentresFormationAdmin />} />
          <Route path="utilisateurs" element={<UtilisateursAdmin />} />
          <Route path="tickets" element={<TicketsAdmin />} />
          <Route path="tickets/:id" element={<TicketDetailAdmin />} />
          <Route path="faq" element={<FaqAdmin />} />
          <Route path="contact-messages" element={<ContactMessagesAdmin />} />
          <Route path="finances" element={<FinancesDashboard />} />
          <Route path="points-de-vente" element={<PointsDeVenteAdmin />} />
          <Route path="saisies-journalieres" element={<SaisiesJournalieresAdmin />} />
          <Route path="depenses-globales" element={<DepensesGlobalesAdmin />} />
          <Route path="investissements" element={<InvestissementsAdmin />} />
          <Route path="filieres" element={<FilieresAdmin />} />
        </Route>
      </Route>

      <Route path="*" element={<PublicLayout />}>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
