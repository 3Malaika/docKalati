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
        <p className="text-sm text-[#374151] leading-relaxed mb-4">
          Le backend est structuré selon les principes de la <strong>Clean Architecture</strong>, organisée en quatre couches concentriques. Les dépendances ne vont que vers l'intérieur : l'Infrastructure dépend du Domain, jamais l'inverse.
        </p>
        <Diagram>{`Utilisateur (web / tablette / mobile)
        │
        ▼
  Frontend (Next.js) ── authentification, chat, dashboard admin
        │  HTTPS + JWT Bearer
        ▼
  Backend API (FastAPI) ── 4 couches concentriques
        │
        ├── core/                 partagé par toutes les couches
        │     └── config.py       variables d'environnement, constantes
        │
        ├── domain/               logique métier pure — aucune dépendance externe
        │     ├── entities/       Query, Document, User, AuditEntry
        │     ├── ports/          interfaces abstraites (VectorStorePort, LLMPort…)
        │     └── use_cases/      RAGUseCase, IngestUseCase, AuthUseCase…
        │
        ├── infrastructure/       implémentations concrètes des ports
        │     ├── adapters/       ChromaDBAdapter, GroqAdapter, CohereAdapter…
        │     └── gateways/       SQLiteAuditGateway, SQLiteUserGateway
        │
        └── api/routes/           couche HTTP uniquement
              auth, query, admin, upload, users, groups, system, voice`}</Diagram>
        <Card variant="info">
          <strong>Principe ports / adaptateurs</strong> — Le Domain ne connaît jamais l'Infrastructure. Il définit uniquement des interfaces (ports) que l'Infrastructure implémente. Cela permet de remplacer ChromaDB par Pinecone, ou Groq par OpenAI, sans toucher à la logique métier.
        </Card>
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
        <p className="text-sm text-[#374151] leading-relaxed mb-3">
          Avec la Clean Architecture, les entités sont des objets du Domain, formalisés dans <code className="text-xs bg-slate-100 px-1 rounded font-mono">domain/entities/</code>. Une question utilisateur, autrefois un simple objet éphémère, est désormais une entité nommée <strong>Query</strong>.
        </p>
        <DataTable
          headers={['Entité', 'Champs principaux', 'Stockage']}
          rows={[
            ['User', 'identifiant, nom complet, mot de passe (haché), groupes', 'SQLite via SQLiteUserGateway'],
            ['Document', 'nom de fichier, taille, groupes autorisés (manifeste)', 'Système de fichiers + manifeste JSON'],
            ['Query', 'texte de la question, identifiant utilisateur, groupes actifs, horodatage', 'Entité Domain — journalisée dans SQLite via AuditEntry'],
            ['AuditEntry', 'horodatage, utilisateur, groupes, question, réponse, sources utilisées', 'SQLite via SQLiteAuditGateway'],
            ['Fragment indexé (chunk)', 'texte, document d\'origine, type (texte/tableau/image), groupes autorisés, vecteur d\'embedding', 'Base vectorielle (ChromaDB) via ChromaDBAdapter'],
          ]}
        />
        <Card variant="info">
          <strong>Pourquoi formaliser Query en entité</strong> — Avant la restructuration, une question n'était qu'un objet éphémère passé entre fonctions. La formaliser en entité Domain permet de lui associer des règles métier (validation de longueur, détection de prompt injection) indépendamment du transport HTTP.
        </Card>
      </AnimSection>

      {/* CHOIX TECHNIQUES */}
      <AnimSection id="choix">
        <SectionHeading icon={<Settings size={20} />}>Justification des principaux choix techniques</SectionHeading>
        <DataTable
          headers={['Choix', 'Justification']}
          rows={[
            ['Recherche hybride (lexicale + sémantique)', 'La recherche sémantique seule peut manquer des termes exacts (numéros d\'article, sigles) ; la recherche lexicale seule ne comprend pas les reformulations.'],
            ['Filtrage par groupe avant génération', 'Un document non autorisé ne doit jamais être vu par le LLM — élimine tout risque de fuite via la réponse générée.'],
            ['Clean Architecture en 4 couches (core / domain / infrastructure / api)', 'Permet de faire évoluer les composants techniques sans réécrire la logique métier, et facilite les tests unitaires du Domain en isolation totale.'],
            ['Pattern Ports / Adaptateurs', 'Permet de remplacer ChromaDB par Pinecone, ou Groq par OpenAI, sans toucher à la logique métier — le Domain ne connaît jamais l\'Infrastructure.'],
            ['Authentification par token JWT', 'Standard robuste, sans état côté serveur, avec expiration automatique intégrée.'],
            ['Journalisation systématique', 'Répond directement à l\'exigence réglementaire de traçabilité du cahier des charges.'],
            ['Modèles auto-hébergés en production', 'Garantit qu\'aucune donnée normative CAMRAIL ne transite par un service tiers externe.'],
          ]}
        />
      </AnimSection>
    </div>
  )
}
