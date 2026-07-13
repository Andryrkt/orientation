import { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth-context';
import { api } from '../lib/api';
import { ExperienceCv, FormationCv, LangueCv } from '../lib/types';

type TemplateType = 'modern' | 'classic' | 'creative';

export function CvGenerator() {
  const { user, refreshUser } = useAuth();

  // CV Fields
  const [photo, setPhoto] = useState('');
  const [titreCv, setTitreCv] = useState('');
  const [bio, setBio] = useState('');
  const [competences, setCompetences] = useState<string[]>([]);
  const [langues, setLangues] = useState<LangueCv[]>([]);
  const [experiences, setExperiences] = useState<ExperienceCv[]>([]);
  const [formations, setFormations] = useState<FormationCv[]>([]);

  // Editor states
  const [newSkill, setNewSkill] = useState('');
  const [newLang, setNewLang] = useState({ langue: '', niveau: 'Intermédiaire' });
  
  const [expForm, setExpForm] = useState<Partial<ExperienceCv>>({
    poste: '', entreprise: '', dateDebut: '', dateFin: '', description: ''
  });
  const [showExpForm, setShowExpForm] = useState(false);
  const [editingExpIndex, setEditingExpIndex] = useState<number | null>(null);

  const [formForm, setFormForm] = useState<Partial<FormationCv>>({
    diplome: '', ecole: '', dateDebut: '', dateFin: '', description: ''
  });
  const [showFormForm, setShowFormForm] = useState(false);
  const [editingFormIndex, setEditingFormIndex] = useState<number | null>(null);

  const [template, setTemplate] = useState<TemplateType>('modern');
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [suggesting, setSuggesting] = useState(false);
  const [suggestionMessage, setSuggestionMessage] = useState('');

  // Initial load from user profile
  useEffect(() => {
    if (user?.profil) {
      setPhoto(user.profil.photo ?? '');
      setTitreCv(user.profil.titreCv ?? '');
      setBio(user.profil.bio ?? '');
      setCompetences(user.profil.competences ?? []);
      setLangues(user.profil.langues ?? []);
      setExperiences(user.profil.experiences ?? []);
      setFormations(user.profil.formations ?? []);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-600">
        <p className="text-lg font-medium mb-4">Veuillez vous connecter pour accéder au générateur de CV.</p>
      </div>
    );
  }

  // Handle Save
  async function handleSave() {
    setSaving(true);
    setSavedMessage('');
    try {
      await api.patch('/users/me', {
        photo,
        titreCv,
        bio,
        competences,
        langues,
        experiences,
        formations,
      });
      await refreshUser();
      setSavedMessage('✨ Votre CV a été enregistré dans votre profil avec succès !');
      setTimeout(() => setSavedMessage(''), 4000);
    } catch (error) {
      console.error('Erreur de sauvegarde CV', error);
      setSavedMessage('❌ Une erreur est survenue lors de l\'enregistrement.');
    } finally {
      setSaving(false);
    }
  }

  // Fetch AI Suggestion
  async function fetchSuggestion() {
    setSuggesting(true);
    setSuggestionMessage('');
    try {
      const response = await api.get('/users/me/cv-suggestion');
      const data = response.data;
      
      setTitreCv(data.titreCv || '');
      setBio(data.bio || '');
      setCompetences(data.competences || []);
      setLangues(data.langues || []);
      setExperiences(data.experiences || []);
      setFormations(data.formations || []);
      
      setSuggestionMessage('🤖 Suggestion générée avec succès sur la base de vos résultats d\'orientation !');
      setTimeout(() => setSuggestionMessage(''), 5000);
    } catch (error) {
      console.error('Erreur suggestion CV', error);
      setSuggestionMessage('⚠️ Impossible de générer des suggestions. Avez-vous terminé le test d\'orientation ?');
    } finally {
      setSuggesting(false);
    }
  }

  // Competence Helpers
  function addSkill() {
    if (newSkill.trim() && !competences.includes(newSkill.trim())) {
      setCompetences([...competences, newSkill.trim()]);
      setNewSkill('');
    }
  }

  // Add handle Enter key for skills
  function handleSkillKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  }

  function removeSkill(skill: string) {
    setCompetences(competences.filter((s) => s !== skill));
  }

  // Language Helpers
  function addLang() {
    if (newLang.langue.trim() && !langues.some(l => l.langue.toLowerCase() === newLang.langue.trim().toLowerCase())) {
      setLangues([...langues, { langue: newLang.langue.trim(), niveau: newLang.niveau }]);
      setNewLang({ langue: '', niveau: 'Intermédiaire' });
    }
  }

  function removeLang(index: number) {
    setLangues(langues.filter((_, i) => i !== index));
  }

  // Experience Helpers
  function saveExperience() {
    if (!expForm.poste || !expForm.entreprise) return;
    const newExp: ExperienceCv = {
      poste: expForm.poste,
      entreprise: expForm.entreprise,
      dateDebut: expForm.dateDebut || '',
      dateFin: expForm.dateFin || 'Présent',
      description: expForm.description || '',
    };

    if (editingExpIndex !== null) {
      const updated = [...experiences];
      updated[editingExpIndex] = newExp;
      setExperiences(updated);
      setEditingExpIndex(null);
    } else {
      setExperiences([...experiences, newExp]);
    }

    setExpForm({ poste: '', entreprise: '', dateDebut: '', dateFin: '', description: '' });
    setShowExpForm(false);
  }

  function editExperience(index: number) {
    setExpForm(experiences[index]);
    setEditingExpIndex(index);
    setShowExpForm(true);
  }

  function removeExperience(index: number) {
    setExperiences(experiences.filter((_, i) => i !== index));
  }

  // Formation Helpers
  function saveFormation() {
    if (!formForm.diplome || !formForm.ecole) return;
    const newForm: FormationCv = {
      diplome: formForm.diplome,
      ecole: formForm.ecole,
      dateDebut: formForm.dateDebut || '',
      dateFin: formForm.dateFin || '',
      description: formForm.description || '',
    };

    if (editingFormIndex !== null) {
      const updated = [...formations];
      updated[editingFormIndex] = newForm;
      setFormations(updated);
      setEditingFormIndex(null);
    } else {
      setFormations([...formations, newForm]);
    }

    setFormForm({ diplome: '', ecole: '', dateDebut: '', dateFin: '', description: '' });
    setShowFormForm(false);
  }

  function editFormation(index: number) {
    setFormForm(formations[index]);
    setEditingFormIndex(index);
    setShowFormForm(true);
  }

  function removeFormation(index: number) {
    setFormations(formations.filter((_, i) => i !== index));
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Print Stylesheet Overrides */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #cv-print-preview, #cv-print-preview * {
            visibility: visible;
          }
          #cv-print-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm;
            min-height: 297mm;
            padding: 20mm !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 no-print">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight dark:text-white flex items-center gap-2">
            📄 Mon Générateur de CV
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Préparez, personnalisez et exportez un CV professionnel à partir de vos compétences et résultats.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={fetchSuggestion}
            disabled={suggesting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium text-sm shadow-md transition duration-300 hover:scale-[1.02] disabled:opacity-70"
          >
            {suggesting ? 'Génération...' : '🤖 Suggestion Automatique'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-medium text-sm shadow transition duration-300 disabled:opacity-70"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer le Profil'}
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow transition duration-300"
          >
            🖨️ Imprimer / PDF
          </button>
        </div>
      </div>

      {savedMessage && (
        <div className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm font-medium shadow-sm transition duration-300 no-print">
          {savedMessage}
        </div>
      )}

      {suggestionMessage && (
        <div className="mb-4 p-4 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 text-sm font-medium shadow-sm transition duration-300 no-print">
          {suggestionMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ==================== VOLET GAUCHE : EDITEUR ==================== */}
        <div className="lg:col-span-5 space-y-6 no-print">
          {/* Sélection du Template */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
              🎨 Style de CV
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {(['modern', 'classic', 'creative'] as TemplateType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTemplate(t)}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg capitalize border transition-all ${
                    template === t
                      ? 'bg-slate-900 text-white border-slate-900 shadow'
                      : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {t === 'modern' ? 'Minimaliste' : t === 'classic' ? 'Classique' : 'Créatif'}
                </button>
              ))}
            </div>
          </div>

          {/* Informations Générales */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              👤 Informations Générales
            </h2>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Titre professionnel ciblé
              </label>
              <input
                type="text"
                placeholder="Ex: Développeur Web Full-Stack"
                value={titreCv}
                onChange={(e) => setTitreCv(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Photo de profil (URL)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://example.com/photo.jpg"
                  value={photo}
                  onChange={(e) => setPhoto(e.target.value)}
                  className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
                {photo && (
                  <img src={photo} alt="Aperçu" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Accroche / Profil professionnel
              </label>
              <textarea
                rows={4}
                placeholder="Décrivez votre projet, vos motivations en quelques lignes..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Formations */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">🎓 Formations</h2>
              <button
                onClick={() => {
                  setEditingFormIndex(null);
                  setFormForm({ diplome: '', ecole: '', dateDebut: '', dateFin: '', description: '' });
                  setShowFormForm(true);
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                + Ajouter
              </button>
            </div>

            {showFormForm && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                <input
                  type="text"
                  placeholder="Diplôme ou mention"
                  value={formForm.diplome || ''}
                  onChange={(e) => setFormForm({ ...formForm, diplome: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white outline-none"
                />
                <input
                  type="text"
                  placeholder="Établissement / École / Université"
                  value={formForm.ecole || ''}
                  onChange={(e) => setFormForm({ ...formForm, ecole: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Date début (Ex: 2022)"
                    value={formForm.dateDebut || ''}
                    onChange={(e) => setFormForm({ ...formForm, dateDebut: e.target.value })}
                    className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Date fin (Ex: 2025)"
                    value={formForm.dateFin || ''}
                    onChange={(e) => setFormForm({ ...formForm, dateFin: e.target.value })}
                    className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white outline-none"
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="Description ou compétences acquises..."
                  value={formForm.description || ''}
                  onChange={(e) => setFormForm({ ...formForm, description: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowFormForm(false)}
                    className="px-3 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-md"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={saveFormation}
                    className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {formations.map((f, i) => (
                <div key={i} className="flex justify-between items-start p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{f.diplome}</h4>
                    <p className="text-xs text-slate-500">{f.ecole} ({f.dateDebut} - {f.dateFin})</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => editFormation(i)} className="text-xs text-slate-400 hover:text-slate-700">✏️</button>
                    <button onClick={() => removeFormation(i)} className="text-xs text-slate-400 hover:text-red-600">❌</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expériences Professionnelles */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">💼 Expériences</h2>
              <button
                onClick={() => {
                  setEditingExpIndex(null);
                  setExpForm({ poste: '', entreprise: '', dateDebut: '', dateFin: '', description: '' });
                  setShowExpForm(true);
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                + Ajouter
              </button>
            </div>

            {showExpForm && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                <input
                  type="text"
                  placeholder="Poste / Rôle"
                  value={expForm.poste || ''}
                  onChange={(e) => setExpForm({ ...expForm, poste: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white outline-none"
                />
                <input
                  type="text"
                  placeholder="Entreprise / Organisation"
                  value={expForm.entreprise || ''}
                  onChange={(e) => setExpForm({ ...expForm, entreprise: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Mois AAAA (Début)"
                    value={expForm.dateDebut || ''}
                    onChange={(e) => setExpForm({ ...expForm, dateDebut: e.target.value })}
                    className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Mois AAAA (Fin)"
                    value={expForm.dateFin || ''}
                    onChange={(e) => setExpForm({ ...expForm, dateFin: e.target.value })}
                    className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white outline-none"
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="Missions accomplies..."
                  value={expForm.description || ''}
                  onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowExpForm(false)}
                    className="px-3 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-md"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={saveExperience}
                    className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {experiences.map((exp, i) => (
                <div key={i} className="flex justify-between items-start p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{exp.poste}</h4>
                    <p className="text-xs text-slate-500">{exp.entreprise} ({exp.dateDebut} - {exp.dateFin})</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => editExperience(i)} className="text-xs text-slate-400 hover:text-slate-700">✏️</button>
                    <button onClick={() => removeExperience(i)} className="text-xs text-slate-400 hover:text-red-600">❌</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compétences */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800">🛠️ Compétences</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ajouter une compétence..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none"
              />
              <button
                onClick={addSkill}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-semibold"
              >
                +
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {competences.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold"
                >
                  {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    className="text-slate-400 hover:text-slate-600 text-[10px]"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Langues */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800">🗣️ Langues</h2>
            <div className="grid grid-cols-12 gap-2">
              <input
                type="text"
                placeholder="Langue (Ex: Anglais)"
                value={newLang.langue}
                onChange={(e) => setNewLang({ ...newLang, langue: e.target.value })}
                className="col-span-6 text-sm border border-slate-200 rounded-lg px-3 py-1.5 outline-none"
              />
              <select
                value={newLang.niveau}
                onChange={(e) => setNewLang({ ...newLang, niveau: e.target.value })}
                className="col-span-4 text-sm border border-slate-200 rounded-lg px-2 py-1.5 bg-white outline-none"
              >
                <option value="Débutant">Débutant</option>
                <option value="Intermédiaire">Intermédiaire</option>
                <option value="Avancé">Avancé</option>
                <option value="Bilingue">Bilingue</option>
                <option value="Langue maternelle">Langue maternelle</option>
              </select>
              <button
                onClick={addLang}
                className="col-span-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg flex items-center justify-center text-sm"
              >
                +
              </button>
            </div>
            <div className="space-y-1.5">
              {langues.map((l, index) => (
                <div key={index} className="flex justify-between items-center bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <span className="text-sm font-semibold text-slate-700">{l.langue}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">{l.niveau}</span>
                    <button
                      onClick={() => removeLang(index)}
                      className="text-slate-400 hover:text-red-500 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ==================== VOLET DROITE : APERÇU TEMPS RÉEL ==================== */}
        <div className="lg:col-span-7 flex justify-center">
          <div
            id="cv-print-preview"
            className="w-full max-w-[210mm] min-h-[297mm] bg-white border border-slate-300 rounded-2xl shadow-lg p-8 md:p-12 text-slate-800 transition-all overflow-hidden relative"
            style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}
          >
            {/* RENDER ACCORDING TO SELECTED TEMPLATE */}

            {/* 1. TEMPLATE : MODERN (MINIMALIST) */}
            {template === 'modern' && (
              <div className="space-y-8">
                {/* Header */}
                <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row items-center md:items-start gap-5 text-center md:text-left">
                  {photo && (
                    <img src={photo} alt="Photo" className="w-20 h-20 rounded-full object-cover border border-slate-200 shadow-sm" />
                  )}
                  <div className="flex-1">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                      {user.prenom} {user.nom}
                    </h1>
                    {titreCv && (
                      <p className="text-lg font-bold text-indigo-600 tracking-wide mt-1 uppercase">
                        {titreCv}
                      </p>
                    )}
                    <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1 text-slate-500 text-xs mt-3">
                      <span>✉️ {user.email}</span>
                      {user.telephone && <span>📞 {user.telephone}</span>}
                      {user.profil?.region && <span>📍 {user.profil.region}</span>}
                    </div>
                  </div>
                </div>

                {/* Accroche */}
                {bio && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Profil
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-light">{bio}</p>
                  </div>
                )}

                {/* Grid Experiences / Formations */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  {/* Left Col (Experiences / Formations) */}
                  <div className="md:col-span-8 space-y-8">
                    {/* Experiences */}
                    {experiences.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">
                          Expérience Professionnelle
                        </h3>
                        <div className="space-y-5">
                          {experiences.map((exp, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between items-baseline">
                                <h4 className="text-sm font-bold text-slate-900">{exp.poste}</h4>
                                <span className="text-xs text-slate-400 whitespace-nowrap">
                                  {exp.dateDebut} - {exp.dateFin}
                                </span>
                              </div>
                              <p className="text-xs font-semibold text-slate-600">{exp.entreprise}</p>
                              <p className="text-xs text-slate-500 leading-relaxed font-light mt-1 whitespace-pre-line">
                                {exp.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Formations */}
                    {formations.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">
                          Éducation & Formations
                        </h3>
                        <div className="space-y-5">
                          {formations.map((f, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between items-baseline">
                                <h4 className="text-sm font-bold text-slate-900">{f.diplome}</h4>
                                <span className="text-xs text-slate-400 whitespace-nowrap">
                                  {f.dateDebut} - {f.dateFin}
                                </span>
                              </div>
                              <p className="text-xs font-semibold text-slate-600">{f.ecole}</p>
                              {f.description && (
                                <p className="text-xs text-slate-500 leading-relaxed font-light mt-1">
                                  {f.description}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Col (Skills / Langs) */}
                  <div className="md:col-span-4 space-y-8">
                    {/* Competences */}
                    {competences.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">
                          Compétences
                        </h3>
                        <div className="flex flex-wrap gap-1">
                          {competences.map((c, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 rounded bg-slate-50 border border-slate-100 text-slate-700 text-xs font-medium"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Langues */}
                    {langues.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">
                          Langues
                        </h3>
                        <div className="space-y-2">
                          {langues.map((l, i) => (
                            <div key={i} className="flex justify-between items-center text-xs">
                              <span className="font-semibold text-slate-800">{l.langue}</span>
                              <span className="text-slate-500 font-light italic">{l.niveau}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Interets */}
                    {user.profil?.interets && user.profil.interets.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">
                          Intérêts
                        </h3>
                        <div className="flex flex-wrap gap-1">
                          {user.profil.interets.map((it, idx) => (
                            <span key={idx} className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded">
                              {it}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 2. TEMPLATE : CLASSIC */}
            {template === 'classic' && (
              <div className="space-y-6">
                {/* Header Banner */}
                <div className="bg-slate-900 -mx-8 -mt-8 md:-mx-12 md:-mt-12 p-8 md:p-10 text-white rounded-t-2xl">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                      {photo && (
                        <img src={photo} alt="Photo" className="w-16 h-16 rounded-lg object-cover border border-slate-700 shadow-sm" />
                      )}
                      <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                          {user.prenom} {user.nom}
                        </h1>
                        {titreCv && (
                          <p className="text-sm font-semibold text-slate-300 tracking-wider uppercase mt-1">
                            {titreCv}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-slate-300 space-y-1 text-left md:text-right font-light">
                      <p>✉️ {user.email}</p>
                      {user.telephone && <p>📞 {user.telephone}</p>}
                      {user.profil?.region && <p>📍 {user.profil.region}</p>}
                    </div>
                  </div>
                </div>

                {/* Accroche */}
                {bio && (
                  <div className="border-l-4 border-slate-800 pl-4 py-1">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
                      Accroche
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed font-light italic">{bio}</p>
                  </div>
                )}

                {/* Grid layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-4">
                  {/* Left */}
                  <div className="md:col-span-8 space-y-6">
                    {/* Experiences */}
                    {experiences.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-bold text-slate-900 border-b-2 border-slate-900 pb-1 uppercase tracking-wider">
                          Expérience Professionnelle
                        </h3>
                        <div className="space-y-4">
                          {experiences.map((exp, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between items-baseline">
                                <h4 className="text-sm font-bold text-slate-800">{exp.poste}</h4>
                                <span className="text-xs text-slate-500 italic">
                                  {exp.dateDebut} - {exp.dateFin}
                                </span>
                              </div>
                              <p className="text-xs font-bold text-indigo-600">{exp.entreprise}</p>
                              <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-line mt-1">
                                {exp.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Formations */}
                    {formations.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-bold text-slate-900 border-b-2 border-slate-900 pb-1 uppercase tracking-wider">
                          Formation & Diplômes
                        </h3>
                        <div className="space-y-4">
                          {formations.map((f, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between items-baseline">
                                <h4 className="text-sm font-bold text-slate-800">{f.diplome}</h4>
                                <span className="text-xs text-slate-500 italic">
                                  {f.dateDebut} - {f.dateFin}
                                </span>
                              </div>
                              <p className="text-xs font-bold text-indigo-600">{f.ecole}</p>
                              {f.description && (
                                <p className="text-xs text-slate-500 leading-relaxed mt-1">
                                  {f.description}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right */}
                  <div className="md:col-span-4 space-y-6">
                    {/* Compétences */}
                    {competences.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-bold text-slate-900 border-b-2 border-slate-900 pb-1 uppercase tracking-wider">
                          Compétences
                        </h3>
                        <div className="flex flex-wrap gap-1">
                          {competences.map((c, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-slate-100 text-slate-800 text-[11px] font-semibold border border-slate-200 rounded"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Langues */}
                    {langues.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-bold text-slate-900 border-b-2 border-slate-900 pb-1 uppercase tracking-wider">
                          Langues
                        </h3>
                        <div className="space-y-1.5">
                          {langues.map((l, i) => (
                            <div key={i} className="flex justify-between text-xs">
                              <span className="font-bold text-slate-700">{l.langue}</span>
                              <span className="text-indigo-600 font-medium">{l.niveau}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 3. TEMPLATE : CREATIVE */}
            {template === 'creative' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-0 -mx-8 -my-8 md:-mx-12 md:-my-12 min-h-[297mm]">
                {/* Sidebar (Colored) */}
                <div className="md:col-span-4 bg-slate-900 text-slate-300 p-8 flex flex-col gap-6">
                  {photo && (
                    <div className="flex justify-center md:justify-start">
                      <img src={photo} alt="Photo" className="w-20 h-20 rounded-full object-cover border-2 border-indigo-500 shadow-sm" />
                    </div>
                  )}
                  {/* Profile info */}
                  <div>
                    <h1 className="text-2xl font-black text-white leading-tight">
                      {user.prenom}
                      <br />
                      <span className="text-indigo-400">{user.nom}</span>
                    </h1>
                    {titreCv && (
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-2">
                        {titreCv}
                      </p>
                    )}
                  </div>

                  {/* Contact */}
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-1">
                      Contact
                    </h3>
                    <div className="text-[11px] space-y-1.5">
                      <p className="truncate">✉️ {user.email}</p>
                      {user.telephone && <p>📞 {user.telephone}</p>}
                      {user.profil?.region && <p>📍 {user.profil.region}</p>}
                    </div>
                  </div>

                  {/* Skills */}
                  {competences.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-1">
                        Compétences
                      </h3>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {competences.map((c, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-slate-800 text-slate-200 rounded text-[10px] font-medium"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Languages */}
                  {langues.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-1">
                        Langues
                      </h3>
                      <div className="space-y-1">
                        {langues.map((l, i) => (
                          <div key={i} className="flex justify-between text-[11px]">
                            <span className="font-medium text-slate-200">{l.langue}</span>
                            <span className="text-indigo-400">{l.niveau}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Main Content (White) */}
                <div className="md:col-span-8 bg-white p-8 md:p-10 flex flex-col gap-6 text-slate-800">
                  {/* Bio */}
                  {bio && (
                    <div className="space-y-2">
                      <h2 className="text-xs font-black text-indigo-600 uppercase tracking-widest">
                        Profil & Objectif
                      </h2>
                      <p className="text-xs text-slate-600 leading-relaxed font-light">{bio}</p>
                    </div>
                  )}

                  {/* Experiences */}
                  {experiences.length > 0 && (
                    <div className="space-y-3">
                      <h2 className="text-xs font-black text-indigo-600 uppercase tracking-widest border-b border-slate-100 pb-1">
                        Expériences Professionnelles
                      </h2>
                      <div className="space-y-4">
                        {experiences.map((exp, idx) => (
                          <div key={idx} className="space-y-1 relative pl-4 border-l border-slate-200">
                            <div className="w-2 h-2 rounded-full bg-indigo-600 absolute -left-[4.5px] top-1.5" />
                            <div className="flex justify-between items-baseline">
                              <h4 className="text-xs font-bold text-slate-900">{exp.poste}</h4>
                              <span className="text-[10px] text-slate-400">
                                {exp.dateDebut} - {exp.dateFin}
                              </span>
                            </div>
                            <p className="text-[11px] font-bold text-slate-500">{exp.entreprise}</p>
                            <p className="text-[11px] text-slate-500 leading-relaxed mt-1 whitespace-pre-line">
                              {exp.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Formations */}
                  {formations.length > 0 && (
                    <div className="space-y-3">
                      <h2 className="text-xs font-black text-indigo-600 uppercase tracking-widest border-b border-slate-100 pb-1">
                        Formations & Diplômes
                      </h2>
                      <div className="space-y-4">
                        {formations.map((f, idx) => (
                          <div key={idx} className="space-y-1 relative pl-4 border-l border-slate-200">
                            <div className="w-2 h-2 rounded-full bg-indigo-600 absolute -left-[4.5px] top-1.5" />
                            <div className="flex justify-between items-baseline">
                              <h4 className="text-xs font-bold text-slate-900">{f.diplome}</h4>
                              <span className="text-[10px] text-slate-400">
                                {f.dateDebut} - {f.dateFin}
                              </span>
                            </div>
                            <p className="text-[11px] font-bold text-slate-500">{f.ecole}</p>
                            {f.description && (
                              <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                                {f.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
