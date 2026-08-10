import {
  Users, Lock, FileText, LogOut, BarChart3, AlertTriangle, Wrench,
  BookOpen, GraduationCap, MessageCircle, HelpCircle, CheckCircle2,
  AlertCircle
} from 'lucide-react'
import {
  Badge, Card, SectionHeading, H3, DataTable, AnimSection, Step, LocalTabs
} from '../components/shared'

export const ADMIN_FORMATEUR_SECTIONS = [
  { id: 'intro',         label: 'Introduction' },
  // Admin
  { id: 'admin-role',    label: 'Rôle administrateur' },
  { id: 'admin-docs',    label: 'Gestion documents' },
  { id: 'admin-users',   label: 'Gestion utilisateurs' },
  { id: 'admin-audit',   label: 'Audit & Historique' },
  { id: 'admin-securite',label: 'Sécurité admin' },
  { id: 'admin-depannage',label: 'Dépannage' },
  // Formateur
  { id: 'formateur',     label: 'Formation — Objectifs' },
  { id: 'formateur-seance',label: 'Déroulé de séance' },
  { id: 'formateur-prompt',label: 'Prompt engineering' },
  { id: 'formateur-faq', label: 'FAQ formateur' },
]

export default function AdminFormateur() {
  return (
    <div>
      {/* INTRO */}
      <AnimSection id="intro">
        <SectionHeading icon={<BookOpen size={20} />}>À propos de ce manuel</SectionHeading>
        <p className="text-[#374151] leading-relaxed mb-4">
          Ce document s'adresse à deux publics distincts, réunis dans un seul manuel pour la cohérence documentaire :
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-xl border border-[#d1d9e0] p-5 hover:border-[#e63329]/50 transition-all">
            <p className="font-bold text-[#0f1923] mb-1">👤 Partie 1 — Administrateur</p>
            <p className="text-sm text-[#6b7a8d]">Destinée à la <strong>Coordination Informatique</strong>, seule habilitée à gérer les documents, les comptes et l'audit.</p>
          </div>
          <div className="bg-white rounded-xl border border-[#d1d9e0] p-5 hover:border-[#e63329]/50 transition-all">
            <p className="font-bold text-[#0f1923] mb-1">🎓 Partie 2 — Formateur</p>
            <p className="text-sm text-[#6b7a8d]">Destinée à toute personne accompagnant les agents CAMRAIL, y compris le prompt engineering.</p>
          </div>
        </div>
        <Card variant="info">
          <strong>Document complémentaire</strong> — Pour l'installation technique (serveurs, variables d'environnement), reportez-vous au <em>Guide Technique Complet</em>. Ce manuel couvre uniquement l'utilisation opérationnelle.
        </Card>
      </AnimSection>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* PARTIE 1 : ADMINISTRATEUR */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}

      <div className="my-12 bg-gradient-to-r from-[#1a2e4a] to-[#0f1923] text-white rounded-xl p-8 shadow-lg">
        <h2 className="text-2xl font-bold mb-2">PARTIE 1 — MANUEL ADMINISTRATEUR</h2>
        <p className="text-white/70">Coordination Informatique — Gestion quotidienne du système KALATI</p>
      </div>

      {/* ADMIN ROLE */}
      <AnimSection id="admin-role">
        <SectionHeading icon={<Users size={20} />}>Rôle et responsabilités de l'administrateur</SectionHeading>
        <p className="text-[#374151] leading-relaxed mb-3">L'administrateur (groupe <Badge color="red">admin</Badge>) est la seule personne habilitée à :</p>
        <ul className="space-y-2 mb-4">
          {[
            'Ajouter, modifier ou supprimer des documents du corpus documentaire',
            'Définir quels groupes de personnel ont accès à quel document',
            'Créer, modifier ou supprimer des comptes utilisateurs',
            'Consulter l\'historique complet des questions posées (audit)',
            'Déclencher une ré-indexation complète du corpus',
          ].map(item => (
            <li key={item} className="flex items-start gap-3 text-sm">
              <CheckCircle2 size={16} className="text-[#e63329] flex-shrink-0 mt-0.5" />
              <span className="text-[#374151]">{item}</span>
            </li>
          ))}
        </ul>
        <Card variant="warn">
          <strong>⚠️ Responsabilité</strong> — Chaque action a un impact direct sur la confidentialité. Attribuer un mauvais groupe peut exposer des documents sensibles (RH, sécurité) à des personnes non autorisées.
        </Card>
      </AnimSection>

      {/* ADMIN DOCS */}
      <AnimSection id="admin-docs">
        <SectionHeading icon={<FileText size={20} />}>Gestion des documents</SectionHeading>
        
        <H3>Ajouter un document</H3>
        <Step n={1} title="Connexion et accès"><p className="text-sm text-[#6b7a8d]">Connectez-vous avec un compte du groupe <Badge color="red">admin</Badge>, puis ouvrez le <strong>Dashboard Admin → Documents</strong>.</p></Step>
        <Step n={2} title="Upload"><p className="text-sm text-[#6b7a8d]">Glissez-déposez un ou plusieurs fichiers (formats : PDF, DOCX, TXT — 50 Mo max) dans la zone d'upload.</p></Step>
        <Step n={3} title="Sélection des groupes"><p className="text-sm text-[#6b7a8d]">Choisissez les groupes autorisés : <Badge color="blue">rh</Badge> <Badge color="orange">securite</Badge> <Badge color="green">maintenance</Badge> <Badge color="purple">transport</Badge>. Le groupe <Badge color="red">admin</Badge> y a toujours accès.</p></Step>
        <Step n={4} title="Envoi"><p className="text-sm text-[#6b7a8d]">Cliquez sur <strong>Envoyer</strong>. Le système indexe automatiquement — comptez quelques secondes à quelques minutes selon la taille et la présence de tableaux/images.</p></Step>

        <Card variant="warn">
          <strong>⚠️ Choix des groupes — à ne jamais faire à la légère</strong>
          <p className="mt-2 text-sm">Un document sans groupe sélectionné n'est visible <strong>que par les administrateurs</strong> (sécurité par défaut). Si un document doit être visible par Sécurité ET Transport, cochez les deux groupes — un oubli le rendra invisible pour l'un des deux services.</p>
        </Card>

        <H3>Supprimer un document</H3>
        <p className="text-sm text-[#374151] mb-3">Dashboard Admin → Documents → icône de suppression. Confirmez.</p>
        <Card variant="info">
          <strong>Point technique important</strong> — Supprimer un document retire le fichier mais <strong>les fragments indexés restent</strong> jusqu'à la ré-indexation complète. Si vous supprimez un document sensible, lancez immédiatement <strong>Ré-ingérer tout</strong> pour purger réellement son contenu.
        </Card>

        <H3>Ré-indexation complète</H3>
        <p className="text-sm text-[#374151] mb-3">Dashboard Admin → Documents → <strong>Ré-ingérer tout</strong>. À utiliser après suppression d'un document sensible, ou en cas de doute sur la cohérence de l'index.</p>
        <Card variant="warn">
          <strong>⚠️ Durée</strong> — Sur un corpus volumineux, cela peut prendre plusieurs minutes. Évitez de lancer cette opération en heure de forte affluence.
        </Card>
      </AnimSection>

      {/* ADMIN USERS */}
      <AnimSection id="admin-users">
        <SectionHeading icon={<Users size={20} />}>Gestion des utilisateurs</SectionHeading>
        
        <H3>Créer un utilisateur</H3>
        <Step n={1} title="Accès"><p className="text-sm text-[#6b7a8d]">Dashboard Admin → Utilisateurs → <strong>Nouvel utilisateur</strong>.</p></Step>
        <Step n={2} title="Renseignement"><p className="text-sm text-[#6b7a8d]">Identifiant (ex: <code className="bg-red-50 text-red-700 px-1 rounded text-xs">agent.dupont</code>), nom complet, mot de passe temporaire, groupes de sécurité.</p></Step>
        <Step n={3} title="Transmission"><p className="text-sm text-[#6b7a8d]">Transmettez par canal sécurisé et invitez l'agent à changer le mot de passe dès la première connexion.</p></Step>

        <H3>Attribution des groupes</H3>
        <DataTable
          headers={['Groupe', 'Corps de métier']}
          rows={[
            [<Badge color="red">admin</Badge>, 'Coordination Informatique uniquement'],
            [<Badge color="blue">rh</Badge>, 'Personnel des Ressources Humaines'],
            [<Badge color="orange">securite</Badge>, 'Agents de sécurité, personnel de gare'],
            [<Badge color="green">maintenance</Badge>, 'Équipes de maintenance ferroviaire'],
            [<Badge color="purple">transport</Badge>, 'Personnel d\'exploitation / transport'],
            ['direction', 'Direction Générale et Directions rattachées'],
          ]}
        />
        <Card variant="info">
          <strong>Cumul de groupes</strong> — Un agent peut appartenir à plusieurs groupes (ex: RH-Sécurité). Cochez tous les groupes pertinents.
        </Card>
      </AnimSection>

      {/* ADMIN AUDIT */}
      <AnimSection id="admin-audit">
        <SectionHeading icon={<BarChart3 size={20} />}>Audit et historique</SectionHeading>
        <p className="text-[#374151] leading-relaxed mb-4">Dashboard Admin → Audit. Chaque question y est enregistrée avec date, heure, identifiant, groupes, la question, la réponse et les sources.</p>
        <Card variant="success">
          <strong>✅ Pourquoi c'est important</strong> — Cet historique répond à l'exigence de traçabilité : en cas de doute sur la fiabilité d'une réponse, vous pouvez retracer exactement ce qui a été demandé et sur quelle base documentaire.
        </Card>
        <H3>Filtrer l'historique</H3>
        <p className="text-sm text-[#374151] mb-4">Utilisez le filtre par identifiant pour consulter l'activité d'un utilisateur précis, en cas de doute sur un usage anormal.</p>
        <Card variant="warn">
          <strong>⚠️ Politique de rétention</strong> — Définissez une politique de rétention (durée de conservation, procédure d'archivage) en cohérence avec la réglementation applicable.
        </Card>
      </AnimSection>

      {/* ADMIN SECURITE */}
      <AnimSection id="admin-securite">
        <SectionHeading icon={<Lock size={20} />}>Sécurité et bonnes pratiques</SectionHeading>
        <ul className="space-y-2">
          {[
            ['Ne partagez jamais votre compte', 'Créez un compte nominatif par administrateur'],
            ['Changez le mot de passe par défaut', 'Immédiatement après la première mise en service'],
            ['Vérifiez le manifeste après upload', 'Une erreur de groupe est la cause la plus probable d\'une fuite accidentelle'],
            ['Consultez régulièrement l\'audit', 'Repérez un usage anormal (volume inhabituel de questions)'],
            ['Limitez la durée de session', 'Ne prolongez pas le délai d\'expiration sans raison opérationnelle claire'],
          ].map(([title, desc]) => (
            <li key={title} className="flex items-start gap-3 text-sm bg-white border border-[#d1d9e0] rounded-xl p-3">
              <AlertTriangle size={14} className="text-[#e63329] flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#0f1923]">{title}</strong>
                <p className="text-[#6b7a8d] text-xs mt-0.5">{desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </AnimSection>

      {/* ADMIN DEPANNAGE */}
      <AnimSection id="admin-depannage">
        <SectionHeading icon={<Wrench size={20} />}>Dépannage courant</SectionHeading>
        <DataTable
          headers={['Symptôme', 'Cause probable', 'Action']}
          rows={[
            ['Utilisateur ne voit aucun document', 'Groupes mal configurés ou incompatibilité avec manifeste', 'Vérifier les groupes et manifeste d\'accès'],
            ['"Trop de tentatives"', 'Anti-bruteforce déclenché (5 essais / 5 min)', 'Attendre le délai ou vérifier le mot de passe'],
            ['"Je ne trouve pas cette information"', 'Aucun document pertinent ou question hors périmètre', 'Vérifier si le document est indexé'],
            ['Upload échoue "format non supporté"', 'Format autre que PDF/DOCX/TXT ou fichier corrompu', 'Convertir et réessayer'],
            ['Transcription vocale échoue', 'Micro de mauvaise qualité / bruit ambiant', 'Recommander un micro-casque'],
            ['Document supprimé mais toujours cité', 'Ré-indexation complète non effectuée', 'Lancer "Ré-ingérer tout"'],
          ]}
        />
      </AnimSection>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* PARTIE 2 : FORMATEUR */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}

      <div className="my-12 bg-gradient-to-r from-[#1a2e4a] to-[#0f1923] text-white rounded-xl p-8 shadow-lg">
        <h2 className="text-2xl font-bold mb-2">PARTIE 2 — MANUEL FORMATEUR</h2>
        <p className="text-white/70">Accompagner les agents CAMRAIL dans la prise en main de KALATI</p>
      </div>

      {/* FORMATEUR OBJECTIFS */}
      <AnimSection id="formateur">
        <SectionHeading icon={<GraduationCap size={20} />}>Objectifs de la formation</SectionHeading>
        <p className="text-[#374151] leading-relaxed mb-3">À l'issue de la séance, chaque agent doit être capable de :</p>
        <ul className="space-y-2 mb-4">
          {[
            'Se connecter et comprendre à quels documents il a accès (et pourquoi)',
            'Formuler une question efficace pour obtenir une réponse précise',
            'Vérifier une réponse en consultant le document source cité',
            'Reconnaître les limites du système',
            'Utiliser l\'interface vocale si pertinent pour son poste',
          ].map(item => (
            <li key={item} className="flex items-start gap-3 text-sm">
              <CheckCircle2 size={16} className="text-[#e63329] flex-shrink-0 mt-0.5" />
              <span className="text-[#374151]">{item}</span>
            </li>
          ))}
        </ul>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-[#d1d9e0] p-4">
            <p className="font-bold text-sm text-[#0f1923] mb-1">Public cible</p>
            <p className="text-xs text-[#6b7a8d]">Tout agent CAMRAIL disposant d'un compte. Aucun prérequis technique — accessible au public non-informaticien.</p>
          </div>
          <div className="bg-white rounded-xl border border-[#d1d9e0] p-4">
            <p className="font-bold text-sm text-[#0f1923] mb-1">Durée recommandée</p>
            <p className="text-xs text-[#6b7a8d]">45 minutes à 1 heure : 15 min présentation, 30 min pratique, 15 min Q&A.</p>
          </div>
        </div>
      </AnimSection>

      {/* FORMATEUR SEANCE */}
      <AnimSection id="formateur-seance">
        <SectionHeading icon={<BookOpen size={20} />}>Déroulé de séance type</SectionHeading>
        
        <H3>1. Introduction (10 min)</H3>
        <Card>
          <p className="text-sm text-[#374151] mb-2"><strong>Expliquer en langage simple :</strong></p>
          <ul className="text-sm space-y-1 text-[#6b7a8d] list-disc list-inside">
            <li><strong>Ce qu'est KALATI</strong> : un assistant qui répond en cherchant dans les vrais documents CAMRAIL</li>
            <li><strong>Pourquoi c'est fiable</strong> : chaque réponse indique le document source</li>
            <li><strong>Ce que KALATI n'est pas</strong> : pas un moteur internet, pas un outil de décision automatique</li>
          </ul>
        </Card>

        <H3>2. Démonstration (10 min)</H3>
        <p className="text-sm text-[#374151] mb-3">Le formateur pose 2-3 questions en direct, montrant explicitement où et comment poser, comment lire la réponse, comment vérifier la source.</p>

        <H3>3. Pratique guidée (25-30 min)</H3>
        <p className="text-sm text-[#374151] mb-3">Chaque participant pose ses propres questions, formateur disponible pour aider. Exemples selon le métier :</p>
        <DataTable
          headers={['Métier', 'Exemple de question']}
          rows={[
            ['Tout agent', 'Que dit la Convention Collective en matière de retraite ?'],
            ['Agent Sécurité', 'Que prévoient les IGS sur la Marche à Vue ?'],
            ['Maintenance', 'Comment révise-t-on un roulement de boîtes d\'essieux ?'],
            ['Transport', 'Comment expédier un train dans une gare ?'],
          ]}
        />

        <H3>4. Questions/réponses et clôture (10-15 min)</H3>
        <p className="text-sm text-[#374151]">Recueillir les difficultés, rappeler les points de contact (CI) pour tout problème.</p>
      </AnimSection>

      {/* FORMATEUR PROMPT */}
      <AnimSection id="formateur-prompt">
        <SectionHeading icon={<MessageCircle size={20} />}>Initiation au prompt engineering</SectionHeading>
        <p className="text-[#374151] leading-relaxed mb-4">Bien formuler sa question est explicitement demandé. Voici les points essentiels en langage simple.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Card variant="success">
            <h4 className="font-bold text-sm text-[#0f1923] mb-2">✅ Questions efficaces</h4>
            <ul className="text-xs space-y-1 text-[#6b7a8d] list-disc list-inside">
              <li>Précises et complètes</li>
              <li>Une seule question à la fois</li>
              <li>Vocabulaire métier habituel</li>
            </ul>
          </Card>
          <Card variant="warn">
            <h4 className="font-bold text-sm text-[#0f1923] mb-2">⚠️ Questions à éviter</h4>
            <ul className="text-xs space-y-1 text-[#6b7a8d] list-disc list-inside">
              <li>Trop vagues</li>
              <li>Plusieurs questions mélangées</li>
              <li>Hors périmètre documentaire</li>
            </ul>
          </Card>
        </div>

        <H3>Si la réponse ne convient pas</H3>
        <ol className="space-y-2 text-sm text-[#374151] list-decimal list-inside">
          <li>Reformuler la question de façon plus précise</li>
          <li>Vérifier que le document existe bien</li>
          <li>Si incohérence, signaler à la CI</li>
        </ol>

        <Card variant="danger">
          <strong>🚫 Point de vigilance critique</strong>
          <p className="mt-2 text-sm">Ne jamais se fier aveuglément à une réponse touchant à la sécurité (Marche à Vue, consignes gare). <strong>Toujours vérifier le document source cité avant d'agir.</strong> KALATI est une aide à la recherche, pas une autorité réglementaire.</p>
        </Card>
      </AnimSection>

      {/* FORMATEUR FAQ */}
      <AnimSection id="formateur-faq">
        <SectionHeading icon={<HelpCircle size={20} />}>FAQ à anticiper pendant la formation</SectionHeading>
        
        {[
          {
            q: 'Est-ce que KALATI peut se tromper ?',
            a: 'Oui, comme tout système automatisé. Chaque réponse cite sa source — vérifier le document original en cas de doute, surtout sur les sujets sensibles.',
          },
          {
            q: 'Pourquoi je ne vois pas tel document ?',
            a: 'Chaque document est réservé à certains groupes selon sa confidentialité. Demander à la CI pour un accès supplémentaire.',
          },
          {
            q: 'Mes questions sont-elles surveillées ?',
            a: 'Oui, enregistrées dans un journal d\'audit pour conformité et contrôle — exigence réglementaire. À annoncer clairement.',
          },
          {
            q: 'KALATI remplace-t-il mon supérieur ?',
            a: 'Non. C\'est une aide à la recherche documentaire, pas un outil de décision automatique.',
          },
          {
            q: 'Que faire si le système est indisponible ?',
            a: 'Contacter la CI. Les documents papier restent la référence en cas d\'indisponibilité.',
          },
        ].map(({ q, a }) => (
          <div key={q} className="bg-white border border-[#d1d9e0] rounded-xl p-4 mb-3">
            <p className="font-semibold text-sm text-[#0f1923] flex items-start gap-2">
              <HelpCircle size={14} className="text-[#e63329] flex-shrink-0 mt-0.5" />
              {q}
            </p>
            <p className="text-xs text-[#6b7a8d] leading-relaxed pl-6 mt-1">{a}</p>
          </div>
        ))}

        <Card variant="info">
          <strong>💡 Conseil pour le formateur</strong> — Gardez une trace des questions récurrentes : elles permettent d'identifier les documents à enrichir et d'améliorer les prochaines sessions.
        </Card>
      </AnimSection>
    </div>
  )
}
