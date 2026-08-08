import {
  FileText, LayoutGrid, Lock, Monitor, BarChart2, Zap, PenLine, RefreshCw, Database, Settings
} from 'lucide-react'
import {
  Badge, Card, SectionHeading, H3, DataTable, AnimSection, Diagram, ScreenCard
} from '../components/shared'

export const RAPPORT_SECTIONS = [
  { id: 'intro',         label: 'Objet' },
  { id: 'architecture',  label: 'Architecture' },
  { id: 'groupes',       label: 'Groupes de sécurité' },
  { id: 'ecrans',        label: 'Écrans' },
  { id: 'rapports',      label: 'Rapports' },
  { id: 'donnees-auto',  label: 'Données générées' },
  { id: 'donnees-saisie','label': 'Données à saisir' },
  { id: 'flux',          label: 'Flux de données' },
  { id: 'modele',        label: 'Modèle de données' },
  { id: 'choix',         label: 'Choix techniques' },
]

export default function RapportConception() {
  return (
    <div>
      {/* INTRO */}
      <AnimSection id="intro">
        <SectionHeading icon={<FileText size={20} />}>Objet du document</SectionHeading>
        <p className="text-[#374151] leading-relaxed mb-3">
          Ce rapport détaille les choix de conception du système KALATI RAG, en réponse aux exigences du cahier des charges. Il couvre en particulier :
        </p>
        <ul className="text-sm space-y-1 text-[#374151] list-disc list-inside mb-4">
          <li>La définition et la logique des groupes de sécurité</li>
          <li>L'inventaire des écrans de l'application et leurs conditions d'accès</li>
          <li>Les rapports produits par le système</li>
          <li>Les données générées automatiquement, par opposition aux données saisies manuellement</li>
        </ul>
        <Card variant="info">
          <strong>Documents complémentaires</strong> — L'installation technique est dans le <em>Guide Technique Complet</em>. Les procédures d'usage sont dans le <em>Manuel Utilisateur</em>. Ce rapport porte sur les <strong>choix de conception</strong>, pas sur le mode d'emploi.
        </Card>
      </AnimSection>

      {/* ARCHITECTURE */}
      <AnimSection id="architecture">
        <SectionHeading icon={<LayoutGrid size={20} />}>Rappel de l'architecture générale</SectionHeading>
        <Diagram>{`Utilisateur (web / tablette / mobile)
        │
        ▼
  Frontend (Next.js) ── authentification, chat, dashboard admin
        │  HTTPS + JWT Bearer
        ▼
  Backend API (FastAPI) ── Clean Architecture (api / domain / infrastructure)
        │
        ├── domain/        logique métier pure (RAG, retrieval, auth)
        │
        ├── infrastructure/ adaptateurs concrets
        │     ├── vector_store.py     → ChromaDB (recherche sémantique)
        │     ├── llm_client.py       → LLM (génération de réponse)
        │     ├── vision_client.py    → modèle de vision
        │     ├── voice_client.py     → transcription + synthèse vocale
        │     ├── document_ingestion.py → lecture/découpage des documents
        │     └── audit_repository.py / user_repository.py → SQLite
        │
        └── api/routes/   auth, query, admin, upload, voice, system`}</Diagram>
        <p className="text-sm text-[#374151] leading-relaxed mb-4">
          Ce découpage en couches permet de changer un composant technique (ex: passer d'un LLM local à un LLM cloud) sans modifier la logique métier.
        </p>
        <Card variant="warn">
          <strong>Deux configurations coexistent</strong>
          <DataTable
            headers={['Configuration', 'LLM / Embeddings', 'Confidentialité', 'Usage recommandé']}
            rows={[
              ['Démonstration', 'Services cloud tiers (Groq, Cohere)', 'Données transmises à des tiers', 'Démonstration, données fictives'],
              ['Production', 'Modèles auto-hébergés (Ollama, Whisper, Piper)', 'Aucune donnée hors infrastructure', 'Exploitation réelle CAMRAIL'],
            ]}
          />
        </Card>
      </AnimSection>

      {/* GROUPES */}
      <AnimSection id="groupes">
        <SectionHeading icon={<Lock size={20} />}>Conception des groupes de sécurité</SectionHeading>
        <H3>Principe de conception</H3>
        <p className="text-sm text-[#374151] leading-relaxed mb-3">
          La conception retenue repose sur un principe volontairement strict : <strong>tout document est réservé par défaut, l'accès doit être explicitement accordé</strong> (logique "fail-safe" ou "deny by default").
        </p>
        <Card variant="success">
          <strong>Pourquoi ce choix plutôt que "tout ouvert sauf restriction explicite"</strong>
          <p className="mt-1 text-sm">Une erreur d'oubli côté administrateur est moins dangereuse dans ce modèle : un document non associé à un groupe n'est visible que par les administrateurs, jamais par tout le personnel par défaut.</p>
        </Card>
        <H3>Les six groupes définis</H3>
        <DataTable
          headers={['Groupe', 'Correspondance métier CAMRAIL', 'Niveau d\'accès']}
          rows={[
            [<Badge color="red">admin</Badge>, 'Coordination Informatique (CI)', 'Accès à tous les documents, gestion des comptes et du système'],
            [<Badge color="pink">direction</Badge>, 'Direction Générale et Directions rattachées', 'Documents stratégiques et de direction'],
            [<Badge color="blue">rh</Badge>, 'Ressources Humaines', 'Convention Collective, dossiers RH, politique sociale'],
            [<Badge color="orange">securite</Badge>, 'Agents de sécurité, personnel de gare', 'IGS, consignes de sécurité, procédures Marche à Vue'],
            [<Badge color="green">maintenance</Badge>, 'Équipes de maintenance ferroviaire', 'Modes opératoires techniques, procédures de révision'],
            [<Badge color="purple">transport</Badge>, 'Personnel d\'exploitation / transport', 'Procédures d\'expédition, gestion des circulations'],
          ]}
        />
        <Card variant="info">
          <strong>Cumul de groupes</strong> — Un utilisateur peut appartenir à plusieurs groupes simultanément (ex: un responsable de gare cumulant sécurité et transport). L'accès résultant est l'<em>union</em> des documents accessibles à chacun de ses groupes, jamais l'intersection.
        </Card>
        <H3>Mécanisme technique</H3>
        <p className="text-sm text-[#374151] leading-relaxed">
          Chaque fragment de document indexé porte un attribut listant les groupes autorisés. Au moment d'une recherche, le filtre est appliqué <strong>avant</strong> que le modèle de langage ne voie le contenu — un document non autorisé n'existe tout simplement pas pour la recherche de cet utilisateur. Ce filtrage s'applique identiquement aux deux méthodes de recherche (lexicale et sémantique).
        </p>
      </AnimSection>

      {/* ÉCRANS */}
      <AnimSection id="ecrans">
        <SectionHeading icon={<Monitor size={20} />}>Inventaire des écrans</SectionHeading>
        <ScreenCard num={1} title="Écran de connexion" access={<Badge color="green">Public</Badge>}>
          Saisie identifiant/mot de passe. Protégé par limitation du nombre de tentatives (anti-bruteforce).
        </ScreenCard>
        <ScreenCard num={2} title="Écran principal — Recherche / Chat" access={<Badge color="blue">Tout utilisateur authentifié</Badge>}>
          Zone de saisie de question (texte ou vocal), affichage de la réponse générée et des sources documentaires citées. Écran central de l'application.
        </ScreenCard>
        <ScreenCard num={3} title='Écran "À propos / Transparence"' access={<Badge color="green">Public (sans connexion)</Badge>}>
          Présente le fonctionnement du système, ses limites, les données utilisées et la politique de journalisation — répond à l'exigence de transparence du cahier des charges.
        </ScreenCard>
        <ScreenCard num={4} title="Dashboard Admin — Gestion des documents" access={<Badge color="red">Groupe admin uniquement</Badge>}>
          Upload par glisser-déposer, sélection des groupes autorisés par document, liste des documents indexés avec leur statut, suppression, déclenchement d'une ré-indexation complète.
        </ScreenCard>
        <ScreenCard num={5} title="Dashboard Admin — Gestion des utilisateurs" access={<Badge color="red">Groupe admin uniquement</Badge>}>
          Création, modification (groupes, nom, mot de passe) et suppression de comptes utilisateurs.
        </ScreenCard>
        <ScreenCard num={6} title="Dashboard Admin — Historique d'audit" access={<Badge color="red">Groupe admin uniquement</Badge>}>
          Consultation de l'ensemble des requêtes traitées (qui, quand, quelle question, quelle réponse, quelles sources), avec filtrage par utilisateur.
        </ScreenCard>
        <ScreenCard num={7} title="Écran de gestion du profil personnel" access={<Badge color="blue">Tout utilisateur authentifié</Badge>}>
          Changement de son propre mot de passe.
        </ScreenCard>
      </AnimSection>

      {/* RAPPORTS */}
      <AnimSection id="rapports">
        <SectionHeading icon={<BarChart2 size={20} />}>Rapports produits par le système</SectionHeading>
        <DataTable
          headers={['Rapport', 'Contenu', 'Destinataire', 'Fréquence']}
          rows={[
            ['Historique d\'audit', 'Journal exhaustif des requêtes (utilisateur, date, question, réponse, sources)', 'Coordination Informatique', 'Consultable en continu'],
            ['Rapport d\'ingestion', 'Nombre de documents traités, fragments créés, erreurs éventuelles', 'Administrateur, au moment de l\'upload', 'À chaque opération d\'ingestion'],
            ['Inventaire documentaire', 'Liste des documents indexés, taille, groupes d\'accès, présence au manifeste', 'Administrateur', 'Consultable en continu'],
            ['Rapport de conformité (proposé)', 'Extraction périodique de l\'audit pour contrôle réglementaire', 'Direction / Contrôle interne', 'À définir selon la politique de rétention'],
          ]}
        />
        <Card variant="warn">
          <strong>À trancher avec la CI</strong> — La politique de rétention des données d'audit (durée de conservation, procédure d'archivage ou de purge) n'est pas encore formalisée. C'est une décision de gouvernance à valider avant mise en production.
        </Card>
      </AnimSection>

      {/* DONNÉES AUTO */}
      <AnimSection id="donnees-auto">
        <SectionHeading icon={<Zap size={20} />}>Données générées automatiquement</SectionHeading>
        <DataTable
          headers={['Donnée générée', 'Origine', 'Où stockée']}
          rows={[
            ['Réponse en langage naturel', 'Génération par le LLM à partir des documents trouvés', 'Journalisée dans l\'audit uniquement'],
            ['Fragments de documents (chunks)', 'Découpage automatique des documents uploadés', 'Base vectorielle (ChromaDB)'],
            ['Vecteurs d\'embedding', 'Encodage numérique du sens de chaque fragment', 'Base vectorielle (ChromaDB)'],
            ['Description textuelle des images/schémas', 'Analyse automatique par le modèle de vision', 'Indexée comme un fragment de texte normal'],
            ['Tableaux convertis en texte structuré', 'Extraction automatique des tableaux PDF', 'Indexée comme un fragment de texte normal'],
            ['Transcription d\'une question vocale', 'Reconnaissance vocale automatique', 'Non persistée seule ; la question textuelle est journalisée'],
            ['Réponse audio synthétisée', 'Synthèse vocale automatique de la réponse texte', 'Fichier temporaire, non conservé'],
            ['Token de session (JWT)', 'Généré à la connexion, signé par le serveur', 'Côté client uniquement (navigateur)'],
            ['Entrée du journal d\'audit', 'Générée automatiquement à chaque question traitée', 'Base SQLite dédiée à l\'audit'],
            ['Mot de passe haché (bcrypt)', 'Transformation automatique, jamais stocké en clair', 'Base des utilisateurs (SQLite)'],
          ]}
        />
      </AnimSection>

      {/* DONNÉES SAISIE */}
      <AnimSection id="donnees-saisie">
        <SectionHeading icon={<PenLine size={20} />}>Données obligatoires à saisir manuellement</SectionHeading>
        <DataTable
          headers={['Écran', 'Champ', 'Saisi par', 'Obligatoire']}
          rows={[
            ['Connexion', 'Identifiant, mot de passe', 'Tout utilisateur', 'Oui'],
            ['Recherche', 'Question (texte ou audio)', 'Tout utilisateur', 'Oui'],
            ['Upload de document', 'Fichier(s) à indexer', 'Administrateur', 'Oui'],
            ['Upload de document', 'Groupes autorisés à consulter le document', 'Administrateur', 'Oui (fail-safe si omis : réservé aux admins)'],
            ['Création d\'utilisateur', 'Identifiant, nom complet, mot de passe, groupes', 'Administrateur', 'Oui'],
            ['Changement de mot de passe', 'Mot de passe actuel, nouveau mot de passe', 'Utilisateur concerné', 'Oui (l\'ancien est requis)'],
          ]}
        />
        <Card variant="info">
          <strong>Principe de conception</strong> — Le nombre de champs obligatoires a été volontairement limité au strict nécessaire. La complexité (groupes, gestion documentaire) est concentrée sur les écrans réservés aux administrateurs.
        </Card>
      </AnimSection>

      {/* FLUX */}
      <AnimSection id="flux">
        <SectionHeading icon={<RefreshCw size={20} />}>Flux de données principaux</SectionHeading>
        <H3>Flux d'ingestion d'un document</H3>
        <Diagram>{`Admin dépose un fichier + sélectionne les groupes
        │
        ▼
Validation (format, taille, contenu binaire réel)
        │
        ▼
Sauvegarde du fichier + mise à jour du manifeste d'accès
        │
        ▼
Lecture et découpage en fragments (texte, + tableaux/images si PDF)
        │
        ▼
Encodage vectoriel de chaque fragment (embeddings)
        │
        ▼
Stockage dans la base vectorielle, avec l'étiquette des groupes autorisés`}</Diagram>
        <H3>Flux d'une question utilisateur</H3>
        <Diagram>{`Utilisateur pose une question (texte ou vocal)
        │
        ▼
[Si vocal] Transcription automatique en texte
        │
        ▼
Recherche hybride (lexicale + sémantique), FILTRÉE par les groupes de l'utilisateur
        │
        ▼
Fusion des résultats des deux méthodes de recherche
        │
        ▼
Génération de la réponse par le LLM, à partir UNIQUEMENT
des fragments trouvés et autorisés
        │
        ▼
Réponse affichée + sources citées + [si vocal] synthèse audio
        │
        ▼
Enregistrement automatique dans le journal d'audit`}</Diagram>
      </AnimSection>

      {/* MODÈLE DE DONNÉES */}
      <AnimSection id="modele">
        <SectionHeading icon={<Database size={20} />}>Modèle de données simplifié</SectionHeading>
        <DataTable
          headers={['Entité', 'Champs principaux', 'Stockage']}
          rows={[
            ['Utilisateur', 'identifiant, nom complet, mot de passe (haché), groupes', 'SQLite'],
            ['Document', 'nom de fichier, taille, groupes autorisés (manifeste)', 'Système de fichiers + fichier manifeste JSON'],
            ['Fragment indexé (chunk)', 'texte, document d\'origine, type (texte/tableau/image), groupes autorisés, vecteur d\'embedding', 'Base vectorielle (ChromaDB)'],
            ['Entrée d\'audit', 'horodatage, utilisateur, groupes, question, réponse, sources utilisées', 'SQLite'],
          ]}
        />
      </AnimSection>

      {/* CHOIX TECHNIQUES */}
      <AnimSection id="choix">
        <SectionHeading icon={<Settings size={20} />}>Justification des principaux choix techniques</SectionHeading>
        <DataTable
          headers={['Choix', 'Justification']}
          rows={[
            ['Recherche hybride (lexicale + sémantique)', 'La recherche sémantique seule peut manquer des termes exacts (numéros d\'article, sigles) ; la recherche lexicale seule ne comprend pas les reformulations.'],
            ['Filtrage par groupe avant génération', 'Un document non autorisé ne doit jamais être vu par le LLM — élimine tout risque de fuite via la réponse générée.'],
            ['Architecture en couches (Clean Architecture)', 'Permet de faire évoluer les composants techniques sans réécrire la logique métier, et facilite les tests.'],
            ['Authentification par token JWT', 'Standard robuste, sans état côté serveur, avec expiration automatique intégrée.'],
            ['Journalisation systématique', 'Répond directement à l\'exigence réglementaire de traçabilité du cahier des charges.'],
            ['Modèles auto-hébergés en production', 'Garantit qu\'aucune donnée normative CAMRAIL ne transite par un service tiers externe.'],
          ]}
        />
      </AnimSection>
    </div>
  )
}
