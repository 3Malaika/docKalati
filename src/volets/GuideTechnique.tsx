import {
  Server, Lock, HardDrive, Monitor, Clock, Cloud, Code2,
  Building2, LayoutGrid, Cpu
} from 'lucide-react'
import {
  IC, CodeBlock, Badge, Card, Step, SectionHeading, H3,
  LocalTabs, DataTable, ArchFlow, AnimSection
} from '../components/shared'

export const GUIDE_SECTIONS = [
  { id: 'apercu',        label: 'Aperçu' },
  { id: 'architecture',  label: 'Architecture' },
  { id: 'acces',         label: 'Accès' },
  { id: 'local',         label: 'Installation locale' },
  { id: 'ollama',        label: 'Ollama & modèles' },
  { id: 'materiel',      label: 'Matériel requis' },
  { id: 'cloud',         label: 'Mode Cloud' },
  { id: 'api',           label: 'API Reference' },
]

export default function GuideTechnique() {
  return (
    <div>
      {/* APERÇU */}
      <AnimSection id="apercu">
        <SectionHeading icon={<Building2 size={20} />}>Aperçu du système</SectionHeading>
        <p className="text-[#374151] leading-relaxed mb-4">
          KALATI RAG est une application web full-stack qui permet aux agents CAMRAIL
          d'interroger en <strong>langage naturel</strong> une base documentaire interne
          (PDF, DOCX, TXT). Le système utilise la technique{' '}
          <strong>RAG (Retrieval-Augmented Generation)</strong> : il recherche les passages
          pertinents dans les documents puis génère une réponse précise via un LLM.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { title: 'Frontend', icon: <Monitor size={20} />, desc: 'Next.js 15 + React 19 + Tailwind CSS. Interface chat, dashboard admin, gestion vocale.' },
            { title: 'Backend', icon: <Server size={20} />, desc: 'FastAPI (Python 3.11). API REST sécurisée JWT, pipeline RAG hybride, multimodalité PDF.' },
            { title: 'Données', icon: <HardDrive size={20} />, desc: 'ChromaDB (vecteurs), SQLite (audit + utilisateurs), fichiers JSON (manifeste d\'accès).' },
          ].map(c => (
            <div key={c.title} className="bg-white rounded-xl border border-[#d1d9e0] p-5 hover:border-[#e63329]/50 hover:shadow-md transition-all duration-200 group">
              <div className="text-[#e63329] mb-3">{c.icon}</div>
              <h3 className="font-bold text-[#0f1923] mb-1.5 group-hover:text-[#e63329] transition-colors">{c.title}</h3>
              <p className="text-sm text-[#6b7a8d] leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
        <H3>Fonctionnalités principales</H3>
        <ul className="space-y-2">
          {[
            ['Recherche hybride', 'sémantique (vecteurs) + lexicale (BM25) fusionnées'],
            ['Contrôle d\'accès par groupe', 'chaque document est associé à un ou plusieurs groupes'],
            ['Interface vocale', 'transcription Whisper → RAG → réponse audio (Piper TTS)'],
            ['Multimodalité', 'tableaux et images des PDF extraits et indexés'],
            ['Gestion des utilisateurs', 'CRUD complet depuis le dashboard admin'],
            ['Journal d\'audit', 'toutes les questions sont tracées dans SQLite'],
          ].map(([title, desc]) => (
            <li key={title} className="flex items-start gap-3 text-sm">
              <span className="mt-1 w-4 h-4 rounded-full bg-[#e63329]/10 text-[#e63329] flex-shrink-0 flex items-center justify-center">
                <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><path d="M7 1L3 6 1 4"/></svg>
              </span>
              <span><strong className="text-[#0f1923]">{title}</strong> — <span className="text-[#6b7a8d]">{desc}</span></span>
            </li>
          ))}
        </ul>
      </AnimSection>

      {/* ARCHITECTURE */}
      <AnimSection id="architecture">
        <SectionHeading icon={<LayoutGrid size={20} />}>Architecture</SectionHeading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <H3>Flux d'une requête texte</H3>
            <div className="bg-white rounded-xl border border-[#d1d9e0] p-4 shadow-sm">
              <ArchFlow steps={[
                'Utilisateur tape une question',
                'Frontend → <code class="text-xs bg-slate-100 px-1 rounded font-mono">POST /api/query</code>',
                'Authentification JWT + vérification groupe',
                '<strong>Embeddings</strong> : Cohere API → vecteur requête',
                '<strong>Recherche hybride</strong> : ChromaDB + BM25',
                '<strong>LLM</strong> : Groq llama-3.3-70b → génère la réponse',
                'Réponse + sources → frontend + audit SQLite',
              ]} />
            </div>
          </div>
          <div>
            <H3>Structure des fichiers clés</H3>
            <CodeBlock lang="tree" code={`kalati-rag/
├── backend/app/
│   ├── main.py              # FastAPI entry
│   ├── config.py            # Variables d'env
│   ├── api/routes/
│   │   ├── auth.py          # Login / JWT
│   │   ├── query.py         # Pipeline RAG
│   │   ├── admin.py         # Ingestion + audit
│   │   ├── users.py         # Gestion users
│   │   └── voice.py         # Transcription TTS
│   ├── domain/
│   │   ├── rag.py           # Orchestrateur RAG
│   │   └── retrieval.py     # Recherche hybride
│   └── infrastructure/
│       ├── embeddings.py    # Cohere API
│       ├── llm_client.py    # Groq LLM
│       └── vector_store.py  # ChromaDB
├── frontend/src/app/
│   ├── login/
│   ├── chat-documentaire/
│   └── admin-dashboard/
└── data/
    ├── access_manifest.json
    └── documents/`} />
          </div>
        </div>
      </AnimSection>

      {/* ACCÈS */}
      <AnimSection id="acces">
        <SectionHeading icon={<Lock size={20} />}>Accès et groupes utilisateurs</SectionHeading>
        <Card variant="info">
          <strong>Comptes de démonstration</strong> — Mot de passe par défaut : <IC>camrail123</IC>
        </Card>
        <DataTable
          headers={['Identifiant', 'Rôle', 'Groupes', 'Accès']}
          rows={[
            [<IC>admin</IC>, 'Administrateur CI', <><Badge color="red">admin</Badge><Badge color="blue">tous</Badge></>, 'Accès total : documents, utilisateurs, audit, upload, dashboard'],
            [<IC>agent.rh</IC>, 'Agent RH Test', <Badge color="blue">rh</Badge>, 'Documents RH (contrats, convention collective…)'],
            [<IC>agent.securite</IC>, 'Agent Sécurité Gare', <Badge color="orange">securite</Badge>, 'Documents sécurité (IGS, procédures gare…)'],
            [<IC>agent.maintenance</IC>, 'Agent Maintenance', <Badge color="green">maintenance</Badge>, 'Documents maintenance (modes opératoires voie…)'],
          ]}
        />
        <H3>Groupes disponibles</H3>
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge color="red">admin</Badge>
          <Badge color="blue">rh</Badge>
          <Badge color="orange">securite</Badge>
          <Badge color="green">maintenance</Badge>
          <Badge color="purple">transport</Badge>
          <Badge color="pink">direction</Badge>
        </div>
        <p className="text-sm text-[#6b7a8d]">Un document absent du manifeste est restreint au groupe <IC>admin</IC> par défaut (fail-safe).</p>

        <H3>URLs d'accès</H3>
        <DataTable
          headers={['Page', 'URL locale', 'URL Render']}
          rows={[
            ['Connexion', <IC>localhost:4028/login</IC>, <IC>kalati.onrender.com/login</IC>],
            ['Chat documentaire', <IC>localhost:4028/chat-documentaire</IC>, <IC>kalati.onrender.com/chat-documentaire</IC>],
            ['Dashboard admin', <IC>localhost:4028/admin-dashboard</IC>, <IC>kalati.onrender.com/admin-dashboard</IC>],
            ['API docs (Swagger)', <IC>localhost:8000/docs</IC>, 'Non exposé en prod'],
            ['Health check', <IC>localhost:8000/health</IC>, <IC>kalatibackend.onrender.com/health</IC>],
          ]}
        />
      </AnimSection>

      {/* INSTALLATION LOCALE */}
      <AnimSection id="local">
        <SectionHeading icon={<Code2 size={20} />}>Installation locale complète</SectionHeading>
        <LocalTabs tabs={['Windows', 'Linux / macOS']}>
          {(active) => active === 'Windows' ? (
            <div>
              <H3>Prérequis Windows</H3>
              <ul className="text-sm space-y-1 mb-4 text-[#374151]">
                <li>• Python 3.11+ — <a href="https://python.org" className="text-[#e63329] underline underline-offset-2">python.org</a></li>
                <li>• Node.js 20+ — <a href="https://nodejs.org" className="text-[#e63329] underline underline-offset-2">nodejs.org</a></li>
                <li>• Git — <a href="https://git-scm.com" className="text-[#e63329] underline underline-offset-2">git-scm.com</a></li>
                <li>• ffmpeg (optionnel, améliore la transcription vocale)</li>
              </ul>
              <Step n={1} title="Cloner le repo"><CodeBlock code={`git clone github.com/3Malaika/kalati.git\ncd kalati`} /></Step>
              <Step n={2} title="Installer le backend"><CodeBlock code={`cd backend\npython -m venv venv\nvenv\\Scripts\\activate\npip install -r requirements.txt`} /></Step>
              <Step n={3} title="Configurer le backend (.env)">
                <CodeBlock code={`copy .env.example .env`} />
                <CodeBlock lang="env" code={`GROQ_API_KEY=votre_cle_groq\nCOHERE_API_KEY=votre_cle_cohere\nJWT_SECRET_KEY=une-cle-aleatoire-longue\nLLM_MODEL=llama-3.3-70b-versatile\nEMBEDDING_MODEL=embed-multilingual-v3.0`} />
                <Card variant="info">Pour utiliser Ollama en local : voir section <strong>Ollama &amp; modèles</strong> ci-dessous.</Card>
              </Step>
              <Step n={4} title="Démarrer le backend"><CodeBlock code={`cd backend\nvenv\\Scripts\\activate\nuvicorn app.main:app --reload --port 8000`} /></Step>
              <Step n={5} title="Installer le frontend"><CodeBlock code={`cd frontend\nnpm install`} /></Step>
              <Step n={6} title="Configurer le frontend"><CodeBlock lang="env" code={`NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`} /></Step>
              <Step n={7} title="Démarrer le frontend">
                <CodeBlock code={`npm run dev`} />
                <p className="text-sm text-[#6b7a8d] mt-1">Ouvrir <IC>http://localhost:4028</IC></p>
              </Step>
              <Step n={8} title="Indexer les documents">
                <p className="text-sm text-[#6b7a8d]">Connectez-vous en tant qu'<IC>admin</IC> → Dashboard → Documents → <em>Ré-ingérer tout</em>.</p>
              </Step>
            </div>
          ) : (
            <div>
              <H3>Prérequis Linux / macOS</H3>
              <CodeBlock lang="bash" code={`# Ubuntu / Debian\nsudo apt update && sudo apt install -y python3.11 python3.11-venv nodejs npm git ffmpeg\n\n# macOS (Homebrew)\nbrew install python@3.11 node git ffmpeg`} />
              <Step n={1} title="Cloner le repo"><CodeBlock code={`git clone github.com/3Malaika/kalati.git\ncd kalati`} /></Step>
              <Step n={2} title="Installer le backend"><CodeBlock code={`cd backend\npython3.11 -m venv venv\nsource venv/bin/activate\npip install -r requirements.txt`} /></Step>
              <Step n={3} title="Configurer le backend"><CodeBlock code={`cp .env.example .env\nnano .env`} /><CodeBlock lang="env" code={`GROQ_API_KEY=votre_cle_groq\nCOHERE_API_KEY=votre_cle_cohere\nJWT_SECRET_KEY=une-cle-aleatoire-longue`} /></Step>
              <Step n={4} title="Démarrer le backend"><CodeBlock code={`source venv/bin/activate\nuvicorn app.main:app --reload --port 8000`} /></Step>
              <Step n={5} title="Frontend"><CodeBlock code={`cd ../frontend\nnpm install\necho "NEXT_PUBLIC_API_BASE_URL=http://localhost:8000" > .env\nnpm run dev`} /></Step>
            </div>
          )}
        </LocalTabs>
      </AnimSection>

      {/* OLLAMA */}
      <AnimSection id="ollama">
        <SectionHeading icon={<Cpu size={20} />}>Mode 100% local avec Ollama</SectionHeading>
        <Card variant="success"><strong>Aucune clé API requise</strong> — En mode Ollama, tout fonctionne hors-ligne.</Card>
        <H3>Installation d'Ollama</H3>
        <LocalTabs tabs={['Windows', 'Linux', 'macOS']}>
          {(active) => (
            <div>
              {active === 'Windows' && <>
                <Step n={1} title="Télécharger et installer Ollama"><p className="text-sm text-[#6b7a8d]">Aller sur <a href="https://ollama.com/download" className="text-[#e63329] underline">ollama.com/download</a> → télécharger le <IC>.exe</IC> → l'installer.</p></Step>
                <Step n={2} title="Vérifier l'installation"><CodeBlock code={`ollama --version`} /></Step>
                <Step n={3} title="Démarrer le serveur"><CodeBlock code={`ollama serve`} /><p className="text-sm text-[#6b7a8d] mt-1">Laisser ce terminal ouvert. Écoute sur <IC>http://localhost:11434</IC></p></Step>
              </>}
              {active === 'Linux' && <>
                <Step n={1} title="Installer Ollama"><CodeBlock code={`curl -fsSL https://ollama.com/install.sh | sh`} /></Step>
                <Step n={2} title="Activer le service"><CodeBlock code={`sudo systemctl enable ollama\nsudo systemctl start ollama`} /></Step>
              </>}
              {active === 'macOS' && <>
                <Step n={1} title="Installer via Homebrew"><CodeBlock code={`brew install ollama`} /></Step>
                <Step n={2} title="Démarrer"><CodeBlock code={`ollama serve &`} /></Step>
              </>}
              <Step n={active === 'Windows' ? 4 : 3} title="Télécharger les modèles">
                <CodeBlock code={`ollama pull mistral\nollama pull llama3.2:3b\nollama pull moondream\nollama pull nomic-embed-text`} />
              </Step>
            </div>
          )}
        </LocalTabs>
        <H3>Adapter KALATI pour Ollama</H3>
        <CodeBlock lang="env" code={`LLM_MODEL=mistral\nOLLAMA_BASE_URL=http://localhost:11434\nEMBEDDING_MODEL=nomic-embed-text\nGROQ_API_KEY=\nCOHERE_API_KEY=`} />
        <H3>Modèles recommandés selon votre matériel</H3>
        <DataTable
          headers={['RAM disponible', 'Modèle LLM', 'Embeddings', 'Qualité']}
          rows={[
            ['8 Go', <IC>llama3.2:3b</IC>, <IC>nomic-embed-text</IC>, 'Acceptable'],
            ['16 Go', <IC>mistral</IC>, <IC>nomic-embed-text</IC>, 'Bonne'],
            ['32 Go', <IC>llama3.1:8b</IC>, <IC>mxbai-embed-large</IC>, 'Très bonne'],
            ['64 Go+', <IC>llama3.3:70b</IC>, <IC>mxbai-embed-large</IC>, 'Excellente'],
          ]}
        />
      </AnimSection>

      {/* MATÉRIEL */}
      <AnimSection id="materiel">
        <SectionHeading icon={<Monitor size={20} />}>Équipement matériel minimum</SectionHeading>
        <Card variant="warn"><strong>Important</strong> — Le mode Cloud (Groq + Cohere) est très léger. Le mode Ollama nécessite plus de ressources.</Card>
        <H3>Mode Cloud (Groq + Cohere)</H3>
        <DataTable
          headers={['Composant', 'Minimum', 'Recommandé']}
          rows={[
            ['CPU', '2 cœurs', '4 cœurs'],
            ['RAM', '4 Go', '8 Go'],
            ['Stockage', '5 Go libres', '20 Go SSD'],
            ['GPU', 'Non requis', 'Non requis'],
            ['Internet', 'Obligatoire (API Groq + Cohere)', '10 Mbps+'],
            ['OS', 'Windows 10 / Ubuntu 20.04 / macOS 12', 'Windows 11 / Ubuntu 22.04'],
          ]}
        />
        <H3>Mode local Ollama — CPU uniquement</H3>
        <DataTable
          headers={['Composant', 'Minimum (llama3.2:3b)', 'Recommandé (mistral)']}
          rows={[
            ['CPU', '4 cœurs x86-64', '8 cœurs'],
            ['RAM', '8 Go', '16 Go'],
            ['Stockage', '10 Go libres', '30 Go SSD'],
            ['Temps de réponse', '15–60 secondes', '5–20 secondes'],
          ]}
        />
        <H3>Mode local Ollama — avec GPU (optimal)</H3>
        <DataTable
          headers={['Composant', 'Minimum', 'Recommandé']}
          rows={[
            ['GPU NVIDIA', '8 Go VRAM (RTX 3060)', '16 Go+ (RTX 4080)'],
            ['GPU AMD', 'ROCm compatible (RX 6800+)', 'RX 7900 XTX'],
            ['RAM système', '16 Go', '32 Go'],
            ['Temps de réponse', '2–5 secondes', '< 2 secondes'],
          ]}
        />
        <Card variant="info"><strong>Sur serveur de production</strong> — Render gratuit offre 512 Mo RAM — suffisant uniquement en mode Cloud.</Card>
      </AnimSection>

      {/* CLOUD */}
      <AnimSection id="cloud">
        <SectionHeading icon={<Cloud size={20} />}>Déploiement Cloud (Render)</SectionHeading>
        <H3>Variables d'environnement — Backend</H3>
        <DataTable
          headers={['Variable', 'Valeur', 'Obligatoire']}
          rows={[
            [<IC>GROQ_API_KEY</IC>, 'Clé depuis console.groq.com', 'Oui'],
            [<IC>COHERE_API_KEY</IC>, 'Clé depuis dashboard.cohere.com', 'Oui'],
            [<IC>JWT_SECRET_KEY</IC>, 'python -c "import secrets; print(secrets.token_hex(32))"', 'Oui'],
            [<IC>CHROMA_PERSIST_DIR</IC>, <IC>/data/chroma_db</IC>, 'Oui (avec disk)'],
            [<IC>AUDIT_DB_PATH</IC>, <IC>/data/audit_log.db</IC>, 'Oui (avec disk)'],
            [<IC>CORS_ORIGINS</IC>, '["https://votre-frontend.onrender.com"]', 'Recommandé'],
          ]}
        />
        <H3>Variables d'environnement — Frontend</H3>
        <DataTable
          headers={['Variable', 'Valeur', 'Note']}
          rows={[[<IC>NEXT_PUBLIC_API_BASE_URL</IC>, <IC>https://kalatibackend.onrender.com</IC>, 'Injectée au build — redéployer si changée']]}
        />
        <Card variant="warn"><strong>Disk Render obligatoire</strong> — Sans disk persistant, ChromaDB, SQLite et les documents sont perdus à chaque redéploiement. Monter sur <IC>/data</IC>.</Card>
      </AnimSection>

      {/* API */}
      <AnimSection id="api">
        <SectionHeading icon={<Code2 size={20} />}>API Reference</SectionHeading>
        <DataTable
          headers={['Méthode', 'Endpoint', 'Auth', 'Description']}
          rows={[
            [<Badge color="blue">POST</Badge>, <IC>/api/auth/login</IC>, 'Non', 'Connexion — retourne un JWT'],
            [<Badge color="blue">POST</Badge>, <IC>/api/query</IC>, 'JWT', 'Question RAG → réponse + sources'],
            [<Badge color="green">GET</Badge>, <IC>/api/admin/documents</IC>, 'Admin', 'Liste des documents indexés'],
            [<Badge color="blue">POST</Badge>, <IC>/api/admin/upload</IC>, 'Admin', 'Upload + indexation automatique'],
            [<Badge color="red">DELETE</Badge>, <IC>/api/admin/documents/{'{filename}'}</IC>, 'Admin', 'Supprime un document'],
            [<Badge color="orange">PATCH</Badge>, <IC>/api/admin/documents/{'{filename}'}/groups</IC>, 'Admin', 'Modifie les groupes d\'accès'],
            [<Badge color="blue">POST</Badge>, <IC>/api/admin/ingest</IC>, 'Admin', 'Ré-indexe tout le dossier documents'],
            [<Badge color="green">GET</Badge>, <IC>/api/admin/users</IC>, 'Admin', 'Liste des utilisateurs'],
            [<Badge color="blue">POST</Badge>, <IC>/api/admin/users</IC>, 'Admin', 'Créer un utilisateur'],
            [<Badge color="orange">PUT</Badge>, <IC>/api/admin/users/{'{username}'}</IC>, 'Admin', 'Modifier un utilisateur'],
            [<Badge color="red">DELETE</Badge>, <IC>/api/admin/users/{'{username}'}</IC>, 'Admin', 'Supprimer un utilisateur'],
            [<Badge color="green">GET</Badge>, <IC>/api/admin/audit/logs</IC>, 'Admin', 'Journal d\'audit'],
            [<Badge color="blue">POST</Badge>, <IC>/api/voice/transcribe</IC>, 'JWT', 'Transcription audio → texte'],
            [<Badge color="blue">POST</Badge>, <IC>/api/voice/query</IC>, 'JWT', 'Audio → RAG → réponse + audio'],
            [<Badge color="green">GET</Badge>, <IC>/health</IC>, 'Non', 'Health check'],
          ]}
        />
        <H3>Exemple d'appel API (curl)</H3>
        <CodeBlock lang="bash" code={`# 1. Connexion
curl -X POST http://localhost:8000/api/auth/login \\
  -d "username=admin&password=camrail123" \\
  -H "Content-Type: application/x-www-form-urlencoded"

# Réponse : { "access_token": "eyJ...", "groups": ["admin", ...] }

# 2. Poser une question
curl -X POST http://localhost:8000/api/query \\
  -H "Authorization: Bearer TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"question": "Quelle est la procédure d expédition d un train ?"}'`} />
      </AnimSection>
    </div>
  )
}
