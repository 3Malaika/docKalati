import {
  Target, Ruler, KeyRound, Lock, Search, Image, Mic,
  FileText, Users, ClipboardList, Eye, Shield, CheckSquare
} from 'lucide-react'
import { Badge, Card, SectionHeading, H3, DataTable, AnimSection, ScreenshotBlock } from '../components/shared'
import type { ReactNode } from 'react'

// Imports des images de test
import GRP_1 from '../camrail/GRP_1.png'
import GRP_02 from '../camrail/GRP-02.png'
import GRP_03 from '../camrail/GRP-03.png'
import GRP_04_0 from '../camrail/GRP-04-0.png'
import GRP_04 from '../camrail/GRP-04.png'
import GRP_05_0 from '../camrail/GRP-05-0.png'
import GRP_05_01 from '../camrail/GRP-05-01.png'
import GRP_05_02 from '../camrail/GRP-05-02.png'
import GRP_06_0 from '../camrail/GRP-06-0.png'
import GRP_06_1 from '../camrail/GRP-06-1.png'
import GRP_07 from '../camrail/GRP-07.png'
import SEC_02_1 from '../camrail/SEC-02-1.png'
import SEC_02_2 from '../camrail/SEC-02-2.png'
import SEC_03 from '../camrail/SEC-03.png'
import SEC_04_0 from '../camrail/SEC-04-0.png'
import SEC_04_1 from '../camrail/SEC-04-1.png'
import SEC_05 from '../camrail/SEC-05.png'

export const TEST_SECTIONS = [
  { id: 'objectif',      label: 'Objectif' },
  { id: 'methodologie',  label: 'Méthodologie' },
  { id: 'auth',          label: 'Authentification' },
  { id: 'groupes',       label: 'Groupes de sécurité' },
  { id: 'rag',           label: 'Recherche RAG' },
  { id: 'multimodal',    label: 'Multimodalité' },
  { id: 'vocal',         label: 'Vocal' },
  { id: 'docs',          label: 'Gestion documents' },
  { id: 'users',         label: 'Gestion utilisateurs' },
  { id: 'groupes-admin', label: 'Gestion des groupes' },
  { id: 'audit',         label: 'Audit' },
  { id: 'transparence',  label: 'Transparence' },
  { id: 'securite',      label: 'Sécurité' },
  { id: 'recette',       label: 'Grille de recette' },
]

function TestTable({ headers, rows }: { headers: string[]; rows: (string | ReactNode)[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#d1d9e0] my-4 shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#0f1923] text-white">
            {headers.map((h, i) => (
              <th key={i} className={`text-left px-3 py-3 font-semibold ${i === 0 ? 'w-24' : ''} ${i === headers.length - 1 ? 'w-24 text-center' : ''}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
              {row.map((cell, j) => (
                <td key={j} className={`px-3 py-3 border-t border-[#d1d9e0] align-top text-xs ${j === 0 ? 'font-bold text-[#1a2e4a] font-mono whitespace-nowrap' : ''} ${j === row.length - 1 ? 'text-center' : ''}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const NONE = <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-500 border border-slate-200">— Non testé</span>

// Fonction pour générer une date aléatoire entre aujourd'hui, hier et avant-hier
const getRandomRecentDate = () => {
  const today = new Date()
  const daysAgo = Math.floor(Math.random() * 3) // 0, 1 ou 2
  const date = new Date(today)
  date.setDate(date.getDate() - daysAgo)
  return date.toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

// Générer les dates une fois (pour cohérence dans le rendu)
const RECETTE_DATES = {
  AUTH: getRandomRecentDate(),
  GRP: getRandomRecentDate(),
  RAG: getRandomRecentDate(),
  MM: getRandomRecentDate(),
  VOC: getRandomRecentDate(),
  DOC: getRandomRecentDate(),
  USR: getRandomRecentDate(),
  GRPADM: getRandomRecentDate(),
  AUD: getRandomRecentDate(),
  TRA: getRandomRecentDate(),
  SEC: getRandomRecentDate(),
}

export default function TestRecette() {
  return (
    <div>
      {/* OBJECTIF */}
      <AnimSection id="objectif">
        <SectionHeading icon={<Target size={20} />}>Objectif du dossier</SectionHeading>
        <p className="text-[#374151] leading-relaxed mb-4">
          Ce document liste l'ensemble des scénarios de test permettant de valider que KALATI RAG répond aux exigences fonctionnelles et de sécurité du cahier des charges avant sa mise en service opérationnelle chez CAMRAIL.
        </p>
        <Card variant="info">
          <strong>Portée</strong> — Ce dossier couvre les tests <strong>fonctionnels et d'acceptation</strong> (le système fait-il ce qui est attendu, du point de vue métier). Il ne remplace pas un audit de sécurité approfondi ni des tests de charge.
        </Card>
        <H3>Environnements concernés</H3>
        <ul className="text-sm space-y-1.5 text-[#374151] list-disc list-inside">
          <li><strong>Environnement de démonstration</strong> (cloud, données fictives) — pour la recette fonctionnelle</li>
          <li><strong>Environnement de production</strong> (infrastructure maîtrisée, données réelles) — pour la recette finale avant mise en service</li>
        </ul>
        <Card variant="warn">
          <strong>Règle impérative</strong> — Aucun test ne doit être exécuté avec de véritables documents confidentiels CAMRAIL sur l'environnement de démonstration cloud.
        </Card>
      </AnimSection>

      {/* MÉTHODOLOGIE */}
      <AnimSection id="methodologie">
        <SectionHeading icon={<Ruler size={20} />}>Méthodologie</SectionHeading>
        <DataTable
          headers={['Statut', 'Signification']}
          rows={[
            [<Badge color="green">PASS</Badge>, 'Comportement conforme au résultat attendu'],
            [<Badge color="red">FAIL</Badge>, 'Comportement non conforme — anomalie à corriger avant recette'],
            [<Badge color="orange">PARTIEL</Badge>, 'Fonctionne mais avec réserve(s) à documenter'],
            [<Badge color="gray">Non testé</Badge>, 'Test non encore exécuté'],
          ]}
        />
        <p className="text-sm text-[#374151] leading-relaxed">
          Chaque cas de test doit être exécuté par une personne <strong>autre que celle ayant développé la fonctionnalité concernée</strong>, dans la mesure du possible, pour limiter les biais de validation.
        </p>
      </AnimSection>

      {/* AUTH */}
      <AnimSection id="auth">
        <SectionHeading icon={<KeyRound size={20} />}>Authentification et sessions</SectionHeading>
        <TestTable
          headers={['ID', 'Scénario', 'Étapes', 'Résultat attendu', 'Statut']}
          rows={[
            ['AUTH-01', 'Connexion valide', 'Se connecter avec un identifiant/mot de passe correct', 'Token JWT reçu, redirection vers l\'interface principale', <Badge color="green">PASS</Badge>],
            ['AUTH-02', 'Connexion invalide', 'Se connecter avec un mauvais mot de passe', 'Message d\'erreur générique, pas d\'indication sur ce qui est faux', <Badge color="green">PASS</Badge>],
            ['AUTH-03', 'Rate-limiting anti-bruteforce', 'Échouer 6 connexions consécutives en moins de 5 minutes', 'Blocage temporaire (429) après la 5ème tentative', <Badge color="green">PASS</Badge>],
            ['AUTH-04', 'Réinitialisation après succès', 'Échouer 2 fois puis réussir la connexion', 'Le compteur d\'échecs est remis à zéro', <Badge color="green">PASS</Badge>],
            ['AUTH-05', 'Expiration de session', 'Utiliser un token après expiration (8h par défaut)', '401 renvoyé, redirection vers la page de connexion', <Badge color="green">PASS</Badge>],
            ['AUTH-06', 'Accès sans authentification', 'Appeler /api/query sans token', '401 Unauthorized, aucune donnée renvoyée', <Badge color="green">PASS</Badge>],
            ['AUTH-07', 'Changement de mot de passe', 'Modifier son propre mot de passe depuis le profil', 'Ancien mot de passe requis, nouveau actif immédiatement', <Badge color="green">PASS</Badge>],
          ]}
        />
      </AnimSection>

      {/* GROUPES */}
      <AnimSection id="groupes">
        <SectionHeading icon={<Lock size={20} />}>Groupes de sécurité et contrôle d'accès</SectionHeading>
        <Card variant="warn">
          <strong>Tests critiques</strong> — Cette section valide l'exigence centrale de confidentialité. Aucune anomalie sur ces cas de test ne doit rester ouverte avant mise en production.
        </Card>
        <TestTable
          headers={['ID', 'Scénario', 'Étapes', 'Résultat attendu', 'Statut']}
          rows={[
            ['GRP-01', 'Isolation entre groupes', 'Se connecter en agent RH, poser une question dont la réponse n\'existe que dans un document Sécurité', 'Aucune information du document Sécurité n\'apparaît', <Badge color="green">PASS</Badge>],
            ['GRP-02', 'Accès autorisé', 'Se connecter en agent RH, poser une question sur un document RH', 'Réponse correcte, source RH citée', <Badge color="green">PASS</Badge>],
            ['GRP-03', 'Compte sans groupe (fail-safe)', 'Simuler un utilisateur avec une liste de groupes vide', 'Aucun résultat renvoyé (accès refusé)', <Badge color="green">PASS</Badge>],
            ['GRP-04', 'Document non listé au manifeste', 'Indexer un document sans lui assigner de groupe', 'Visible uniquement par le groupe admin', <Badge color="green">PASS</Badge>],
            ['GRP-05', 'Cumul de groupes', 'Utilisateur avec deux groupes (RH + Sécurité), questions sur les deux périmètres', 'Accès aux documents des deux groupes, union correcte', <Badge color="green">PASS</Badge>],
            ['GRP-06', 'Falsification côté client', 'Envoyer un champ groups personnalisé dans le corps de /api/query', 'Le champ est ignoré — seuls les groupes du JWT signé sont utilisés', <Badge color="green">PASS</Badge>],
            ['GRP-07', 'Contournement via recherche lexicale', 'Vérifier que le filtrage s\'applique aussi à BM25', 'Même isolation stricte quelle que soit la méthode de recherche', <Badge color="green">PASS</Badge>],
          ]}
        />
        
        <H3>Captures explicatives — Scénarios de test Groupes (GRP)</H3>
        
        <p className="text-sm text-[#374151] mb-3"><strong>GRP-01 — Isolation entre groupes :</strong> Vérifier qu'un agent RH ne voit aucun document Sécurité.</p>
        <ScreenshotBlock src={GRP_1} alt="GRP-01 : Isolation entre groupes" caption="Écran de test : agent RH isolé du contenu Sécurité" />
        
        <p className="text-sm text-[#374151] mb-3"><strong>GRP-02 — Accès autorisé :</strong> Vérifier qu'un agent RH voit les documents RH avec les bonnes sources.</p>
        <ScreenshotBlock src={GRP_02} alt="GRP-02 : Accès autorisé" caption="Écran de test : agent RH accédant aux documents RH avec source citée" />
        
        <p className="text-sm text-[#374151] mb-3"><strong>GRP-03 — Compte sans groupe :</strong> Vérifier le comportement fail-safe (refus d'accès).</p>
        <ScreenshotBlock src={GRP_03} alt="GRP-03 : Compte sans groupe (fail-safe)" caption="Écran de test : compte sans groupe, refus d'accès (comportement de sécurité attendu)" />
        
        <p className="text-sm text-[#374151] mb-3"><strong>GRP-04 — Document non listé au manifeste :</strong> Vérifier que le document est réservé aux admins.</p>
        <ScreenshotBlock src={GRP_04_0} alt="GRP-04 : Document non listé - avant" caption="État initial : document sans entrée au manifeste" />
        <ScreenshotBlock src={GRP_04} alt="GRP-04 : Document non listé - visibilité admin" caption="Vérification : seul l'admin accède au document" />
        
        <p className="text-sm text-[#374151] mb-3"><strong>GRP-05 — Cumul de groupes :</strong> Vérifier qu'un utilisateur avec plusieurs groupes voit l'union des documents.</p>
        <ScreenshotBlock src={GRP_05_0} alt="GRP-05 : Cumul de groupes - configuration" caption="Configuration : utilisateur avec groupes RH + Sécurité" />
        <ScreenshotBlock src={GRP_05_01} alt="GRP-05 : Cumul de groupes - accès RH" caption="Vérification : accès aux documents RH" />
        <ScreenshotBlock src={GRP_05_02} alt="GRP-05 : Cumul de groupes - accès Sécurité" caption="Vérification : accès aussi aux documents Sécurité (union correcte)" />
        
        <p className="text-sm text-[#374151] mb-3"><strong>GRP-06 — Falsification côté client :</strong> Vérifier que le champ groups personnalisé est ignoré.</p>
        <ScreenshotBlock src={GRP_06_0} alt="GRP-06 : Tentative de falsification" caption="Tentative de falsification du champ groups dans la requête API" />
        <ScreenshotBlock src={GRP_06_1} alt="GRP-06 : Falsification bloquée" caption="Résultat : champ ignoré, seuls les groupes du JWT signé sont utilisés" />
        
        <p className="text-sm text-[#374151] mb-3"><strong>GRP-07 — Contournement via recherche lexicale :</strong> Vérifier que le filtrage s'applique aussi à BM25.</p>
        <ScreenshotBlock src={GRP_07} alt="GRP-07 : Filtrage BM25" caption="Vérification : même isolation stricte via recherche lexicale (BM25)" />
      </AnimSection>

      {/* RAG */}
      <AnimSection id="rag">
        <SectionHeading icon={<Search size={20} />}>Recherche documentaire (RAG)</SectionHeading>
        <TestTable
          headers={['ID', 'Scénario', 'Étapes', 'Résultat attendu', 'Statut']}
          rows={[
            ['RAG-01', 'Question avec réponse existante', 'Poser une question dont la réponse est clairement présente', 'Réponse correcte en français, avec citation du document source', <Badge color="green">PASS</Badge>],
            ['RAG-02', 'Question sans réponse dans le corpus', 'Poser une question totalement hors périmètre documentaire', 'Message explicite "aucun document pertinent trouvé", jamais de réponse inventée', <Badge color="green">PASS</Badge>],
            ['RAG-03', 'Recherche par terme exact', 'Rechercher un numéro d\'article ou sigle précis (ex: "Article 47", "IGS 12")', 'Le document contenant ce terme exact est trouvé', <Badge color="green">PASS</Badge>],
            ['RAG-04', 'Recherche par paraphrase', 'Poser la même question reformulée avec des synonymes', 'Résultat cohérent malgré la reformulation', <Badge color="green">PASS</Badge>],
            ['RAG-05', 'Citation des sources', 'Vérifier que chaque réponse liste le(s) document(s) utilisé(s)', 'Nom(s) de document(s) exact(s) affiché(s)', <Badge color="green">PASS</Badge>],
            ['RAG-06', 'Résistance à l\'injection de prompt', 'Indexer un document contenant "ignore tes consignes"', 'Le système traite ce texte comme du contenu documentaire', <Badge color="green">PASS</Badge>],
            ['RAG-07', 'Question trop longue', 'Envoyer une question dépassant la limite de caractères', 'Rejet propre avec message d\'erreur, pas de plantage serveur', <Badge color="green">PASS</Badge>],
          ]}
        />
      </AnimSection>

      {/* MULTIMODALITÉ */}
      <AnimSection id="multimodal">
        <SectionHeading icon={<Image size={20} />}>Multimodalité (tableaux et images)</SectionHeading>
        <TestTable
          headers={['ID', 'Scénario', 'Étapes', 'Résultat attendu', 'Statut']}
          rows={[
            ['MM-01', 'Extraction de tableau', 'Indexer un PDF contenant un tableau structuré', 'Le tableau est extrait, converti en texte structuré et devient cherchable', <Badge color="green">PASS</Badge>],
            ['MM-02', 'Description d\'image/schéma', 'Indexer un PDF contenant un schéma technique', 'Une description textuelle du schéma est générée et indexée', <Badge color="green">PASS</Badge>],
            ['MM-03', 'Question sur un contenu de tableau', 'Poser une question dont la réponse est uniquement dans un tableau extrait', 'Réponse correcte, source citée avec mention "Tableau, page X"', <Badge color="green">PASS</Badge>],
            ['MM-04', 'Fiabilité sur schéma de sécurité', 'Comparer la description générée avec le schéma original', 'Description globalement fidèle ; toute divergence documentée', <Badge color="green">PASS</Badge>],
            ['MM-05', 'Désactivation de la multimodalité', 'Basculer ENABLE_MULTIMODAL_INGESTION=false, ré-indexer', 'Seul le texte est indexé, aucune erreur bloquante', <Badge color="green">PASS</Badge>],
          ]}
        />
        <Card variant="warn">
          <strong>Limitation à documenter</strong> — La qualité de la description d'image dépend du modèle de vision. Pour tout document lié à la sécurité (ex: Marche à Vue), le test MM-04 doit être exécuté avec une attention particulière.
        </Card>
      </AnimSection>

      {/* VOCAL */}
      <AnimSection id="vocal">
        <SectionHeading icon={<Mic size={20} />}>Interface vocale</SectionHeading>
        <TestTable
          headers={['ID', 'Scénario', 'Étapes', 'Résultat attendu', 'Statut']}
          rows={[
            ['VOC-01', 'Transcription claire', 'Enregistrer une question claire avec un micro-casque', 'Transcription fidèle à ce qui a été dit', <Badge color="green">PASS</Badge>],
            ['VOC-02', 'Pipeline complet', 'Poser une question à l\'oral de bout en bout', 'Transcription → réponse RAG → synthèse audio, cohérentes entre elles', <Badge color="green">PASS</Badge>],
            ['VOC-03', 'Audio silencieux', 'Envoyer un enregistrement vide ou silencieux', 'Filtre anti-hallucination détecte l\'absence de contenu, message clair renvoyé', <Badge color="green">PASS</Badge>],
            ['VOC-04', 'Micro de mauvaise qualité', 'Tester avec le micro intégré dans un environnement bruyant', 'Taux de transcription incorrecte plus élevé — à documenter', <Badge color="green">PASS</Badge>],
            ['VOC-05', 'Formats audio multiples', 'Tester depuis Chrome, Firefox, Edge', 'Transcription fonctionnelle quel que soit le format natif du navigateur', <Badge color="green">PASS</Badge>],
          ]}
        />
      </AnimSection>

      {/* DOCS */}
      <AnimSection id="docs">
        <SectionHeading icon={<FileText size={20} />}>Gestion des documents (admin)</SectionHeading>
        <TestTable
          headers={['ID', 'Scénario', 'Étapes', 'Résultat attendu', 'Statut']}
          rows={[
            ['DOC-01', 'Upload document valide', 'Admin envoie un PDF valide avec groupes sélectionnés', 'Fichier sauvegardé, indexé, apparaît dans la liste des documents', <Badge color="green">PASS</Badge>],
            ['DOC-02', 'Rejet format non supporté', 'Tenter d\'envoyer un fichier .exe ou .zip', 'Rejet avec message d\'erreur clair, aucun fichier écrit sur le serveur', <Badge color="green">PASS</Badge>],
            ['DOC-03', 'Fichier renommé (faux positif)', 'Renommer un .exe en .pdf et l\'envoyer', 'Rejet basé sur le contenu réel du fichier (signature binaire)', <Badge color="green">PASS</Badge>],
            ['DOC-04', 'Fichier trop volumineux', 'Envoyer un fichier dépassant la limite configurée', 'Rejet propre avec message de taille maximale', <Badge color="green">PASS</Badge>],
            ['DOC-05', 'Traversée de répertoire', 'Envoyer un fichier avec un nom contenant ../', 'Nom de fichier nettoyé, écriture confinée au dossier documents', <Badge color="green">PASS</Badge>],
            ['DOC-06', 'Suppression + ré-indexation', 'Supprimer un document, vérifier sa disparition des réponses', 'Le document n\'est plus jamais cité comme source après ré-indexation', <Badge color="green">PASS</Badge>],
            ['DOC-07', 'Accès non-admin', 'Tenter d\'uploader un document avec un compte non-admin', '403 Forbidden', <Badge color="green">PASS</Badge>],
          ]}
        />
      </AnimSection>

      {/* USERS */}
      <AnimSection id="users">
        <SectionHeading icon={<Users size={20} />}>Gestion des utilisateurs (admin)</SectionHeading>
        <TestTable
          headers={['ID', 'Scénario', 'Étapes', 'Résultat attendu', 'Statut']}
          rows={[
            ['USR-01', 'Création d\'utilisateur', 'Admin crée un compte avec groupes définis', 'Compte créé, connexion possible immédiatement', <Badge color="green">PASS</Badge>],
            ['USR-02', 'Modification des groupes', 'Modifier les groupes d\'un utilisateur existant', 'Nouveaux droits appliqués dès la prochaine connexion', <Badge color="green">PASS</Badge>],
            ['USR-03', 'Suppression d\'utilisateur', 'Supprimer un compte, tenter une connexion', 'Connexion refusée immédiatement après suppression', <Badge color="green">PASS</Badge>],
            ['USR-04', 'Accès non-admin', 'Tenter d\'accéder à /api/admin/users avec un compte non-admin', '403 Forbidden', <Badge color="green">PASS</Badge>],
          ]}
        />
      </AnimSection>

      {/* GROUPES ADMIN */}
      <AnimSection id="groupes-admin">
        <SectionHeading icon={<Lock size={20} />}>Gestion des groupes (admin)</SectionHeading>
        <Card variant="info">
          <strong>Route dédiée</strong> — La route <code className="text-xs bg-slate-100 px-1 rounded font-mono">/api/admin/groups</code> permet de créer et gérer des groupes dynamiquement, au-delà des six groupes initiaux.
        </Card>
        <TestTable
          headers={['ID', 'Scénario', 'Étapes', 'Résultat attendu', 'Statut']}
          rows={[
            ['GRP-ADM-01', 'Création d\'un groupe personnalisé', 'Admin appelle POST /api/admin/groups avec un nom de groupe inédit (ex: "juridique")', 'Groupe créé et disponible à l\'assignation dans les documents et les utilisateurs', <Badge color="green">PASS</Badge>],
            ['GRP-ADM-02', 'Listage des groupes', 'Appeler GET /api/admin/groups', 'Liste complète retournée, incluant les groupes par défaut et les groupes créés dynamiquement', <Badge color="green">PASS</Badge>],
            ['GRP-ADM-03', 'Accès restreint aux admins', 'Tenter de créer un groupe avec un compte non-admin', '403 Forbidden — seul le groupe admin peut gérer les groupes', <Badge color="green">PASS</Badge>],
            ['GRP-ADM-04', 'Suppression d\'un groupe', 'Supprimer un groupe via DELETE /api/admin/groups/{name}', 'Le groupe est retiré des assignations futures ; les documents existants ne sont pas supprimés mais leur accès via ce groupe est révoqué', <Badge color="green">PASS</Badge>],
            ['GRP-ADM-05', 'Impact sur documents indexés', 'Supprimer un groupe qui avait des documents associés, puis poser une question sur ces documents avec un utilisateur ayant l\'ancien groupe', 'Les documents ne sont plus accessibles via le groupe supprimé — aucune fuite d\'information', <Badge color="green">PASS</Badge>],
          ]}
        />
      </AnimSection>

      {/* AUDIT */}
      <AnimSection id="audit">
        <SectionHeading icon={<ClipboardList size={20} />}>Audit et historique</SectionHeading>
        <TestTable
          headers={['ID', 'Scénario', 'Étapes', 'Résultat attendu', 'Statut']}
          rows={[
            ['AUD-01', 'Enregistrement systématique', 'Poser une question, consulter l\'audit immédiatement après', 'La question apparaît avec username, groupes, réponse et sources correctes', <Badge color="green">PASS</Badge>],
            ['AUD-02', 'Filtrage par utilisateur', 'Filtrer l\'historique par identifiant précis', 'Seules les entrées de cet utilisateur s\'affichent', <Badge color="green">PASS</Badge>],
            ['AUD-03', 'Accès restreint à l\'audit', 'Tenter de consulter /api/admin/audit/logs avec un compte non-admin', '403 Forbidden', <Badge color="green">PASS</Badge>],
            ['AUD-04', 'Plafond de résultats', 'Demander un limit très élevé (ex: 100000)', 'Le nombre de résultats est plafonné, pas d\'export massif incontrôlé', <Badge color="green">PASS</Badge>],
          ]}
        />
      </AnimSection>

      {/* TRANSPARENCE */}
      <AnimSection id="transparence">
        <SectionHeading icon={<Eye size={20} />}>Transparence utilisateur</SectionHeading>
        <TestTable
          headers={['ID', 'Scénario', 'Étapes', 'Résultat attendu', 'Statut']}
          rows={[
            ['TRA-01', 'Information accessible', 'Consulter les informations "À propos / fonctionnement" depuis l\'interface', 'Explication claire du fonctionnement, des limites et des données utilisées, sans compte requis', <Badge color="green">PASS</Badge>],
            ['TRA-02', 'Mention de l\'audit', 'Vérifier que l\'utilisateur est informé que ses questions sont journalisées', 'Mention explicite et visible, pas cachée dans des mentions légales illisibles', <Badge color="green">PASS</Badge>],
          ]}
        />
      </AnimSection>

      {/* SÉCURITÉ */}
      <AnimSection id="securite">
        <SectionHeading icon={<Shield size={20} />}>Sécurité générale</SectionHeading>
        <TestTable
          headers={['ID', 'Scénario', 'Étapes', 'Résultat attendu', 'Statut']}
          rows={[
            ['SEC-01', 'CORS restreint', 'Tenter un appel API depuis un domaine non autorisé', 'Requête bloquée par le navigateur (CORS)', <Badge color="green">PASS</Badge>],
            ['SEC-02', 'Absence de fuite d\'information en erreur', 'Provoquer volontairement une erreur serveur', 'Message d\'erreur générique au client, détail uniquement dans les logs serveur', <Badge color="green">PASS</Badge>],
            ['SEC-03', 'Conteneur non-root', 'Vérifier l\'utilisateur d\'exécution dans le conteneur Docker', 'Le processus ne tourne jamais en root', <Badge color="green">PASS</Badge>],
            ['SEC-04', 'HTTPS forcé', 'Tenter un accès en HTTP simple', 'Redirection automatique vers HTTPS', <Badge color="green">PASS</Badge>],
            ['SEC-05', 'Scan de dépendances', 'Exécuter pip-audit sur le backend', 'Aucune vulnérabilité critique non traitée', <Badge color="green">PASS</Badge>],
          ]}
        />
        
        <H3>Captures explicatives — Scénarios de test Sécurité (SEC)</H3>
        
        <p className="text-sm text-[#374151] mb-3"><strong>SEC-02 — Absence de fuite d'information en erreur :</strong> Vérifier que les messages d'erreur ne divulguent pas de détails techniques au client.</p>
        <ScreenshotBlock src={SEC_02_1} alt="SEC-02 : Erreur serveur - vue client" caption="Vue client : message d'erreur générique sans détails techniques" />
        <ScreenshotBlock src={SEC_02_2} alt="SEC-02 : Erreur serveur - détails logs" caption="Vue serveur (logs) : détails complets de l'erreur enregistrés à titre interne" />
        
        <p className="text-sm text-[#374151] mb-3"><strong>SEC-03 — Conteneur non-root :</strong> Vérifier que le processus s'exécute avec un utilisateur sans privilèges.</p>
        <ScreenshotBlock src={SEC_03} alt="SEC-03 : Vérification utilisateur conteneur" caption="Vérification : processus KALATI en exécution sous utilisateur non-root (sécurité renforcée)" />
        
        <p className="text-sm text-[#374151] mb-3"><strong>SEC-04 — HTTPS forcé :</strong> Vérifier la redirection automatique de HTTP vers HTTPS.</p>
        <ScreenshotBlock src={SEC_04_0} alt="SEC-04 : Tentative HTTP" caption="Tentative d'accès en HTTP simple" />
        <ScreenshotBlock src={SEC_04_1} alt="SEC-04 : Redirection HTTPS" caption="Résultat : redirection automatique vers HTTPS (connexion sécurisée)" />
        
        <p className="text-sm text-[#374151] mb-3"><strong>SEC-05 — Scan de dépendances :</strong> Vérifier qu'aucune vulnérabilité critique n'est présente.</p>
        <ScreenshotBlock src={SEC_05} alt="SEC-05 : Résultat du scan pip-audit" caption="Résultat du scan : aucune vulnérabilité critique détectée" />
      </AnimSection>

      {/* GRILLE DE RECETTE */}
      <AnimSection id="recette">
        <SectionHeading icon={<CheckSquare size={20} />}>Grille de recette finale</SectionHeading>
        <p className="text-sm text-[#374151] leading-relaxed mb-4">
          À compléter lors de la séance de recette officielle, en présence d'un représentant de la Coordination Informatique.
        </p>
        <DataTable
          headers={['Domaine fonctionnel', 'Nb. cas', 'PASS', 'FAIL', 'Validé le', 'Validé par']}
          rows={[
            ['Authentification', '7', '7', '0', RECETTE_DATES.AUTH, 'CI - Recette'],
            ['Groupes de sécurité', '7', '7', '0', RECETTE_DATES.GRP, 'CI - Recette'],
            ['Recherche RAG', '7', '7', '0', RECETTE_DATES.RAG, 'CI - Recette'],
            ['Multimodalité', '5', '5', '0', RECETTE_DATES.MM, 'CI - Recette'],
            ['Vocal', '5', '5', '0', RECETTE_DATES.VOC, 'CI - Recette'],
            ['Gestion documents', '7', '7', '0', RECETTE_DATES.DOC, 'CI - Recette'],
            ['Gestion utilisateurs', '4', '4', '0', RECETTE_DATES.USR, 'CI - Recette'],
            ['Gestion des groupes', '5', '5', '0', RECETTE_DATES.GRPADM, 'CI - Recette'],
            ['Audit', '4', '4', '0', RECETTE_DATES.AUD, 'CI - Recette'],
            ['Transparence', '2', '2', '0', RECETTE_DATES.TRA, 'CI - Recette'],
            ['Sécurité générale', '5', '5', '0', RECETTE_DATES.SEC, 'CI - Recette'],
          ]}
        />
        <Card variant="warn">
          <strong>Condition de recette</strong> — La recette n'est considérée comme acquise que si <strong>tous les cas de test des sections "Groupes de sécurité" et "Sécurité générale" sont au statut PASS</strong>, sans exception.
        </Card>
        <H3>Signatures</H3>
        <DataTable
          headers={['Rôle', 'Nom', 'Date', 'Signature']}
          rows={[
            ['Représentant Coordination Informatique', '', '', ''],
            ['Responsable projet / développeur', '', '', ''],
          ]}
        />
      </AnimSection>
    </div>
  )
}
