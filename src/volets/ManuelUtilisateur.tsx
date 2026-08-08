import {
  LogIn, MessageSquare, BookOpen, Mic, ShieldOff, HelpCircle
} from 'lucide-react'
import {
  Card, Step, SectionHeading, H3, DataTable, AnimSection, ExampleBox
} from '../components/shared'

export const MANUEL_SECTIONS = [
  { id: 'bienvenue',          label: 'Bienvenue' },
  { id: 'connexion',          label: 'Se connecter' },
  { id: 'poser-question',     label: 'Poser une question' },
  { id: 'comprendre-reponse', label: 'Comprendre la réponse' },
  { id: 'vocal',              label: 'Utiliser le micro' },
  { id: 'limites',            label: 'Ce que KALATI ne fait pas' },
  { id: 'faq',                label: 'FAQ' },
]

export default function ManuelUtilisateur() {
  return (
    <div>
      {/* BIENVENUE */}
      <AnimSection id="bienvenue">
        <SectionHeading icon={<BookOpen size={20} />}>Bienvenue sur KALATI</SectionHeading>
        <p className="text-[#374151] leading-relaxed mb-4">
          KALATI est un outil qui vous permet de poser une question en langage courant — comme vous le
          feriez à un collègue — et de recevoir une réponse basée sur les vrais documents normatifs de
          CAMRAIL (Convention Collective, Instructions Générales de Sécurité, modes opératoires, etc.).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {[
            { icon: <BookOpen size={20} />, title: 'Vous cherchez une info', desc: 'Plutôt que de parcourir des dizaines de pages, posez directement votre question.' },
            { icon: <BookOpen size={20} />, title: 'Réponse sourcée', desc: 'Chaque réponse indique le document exact dont elle provient — vous pouvez toujours vérifier.' },
            { icon: <Mic size={20} />, title: 'Texte ou voix', desc: 'Tapez votre question ou utilisez le micro, selon ce qui vous convient le mieux.' },
          ].map(c => (
            <div key={c.title} className="bg-white rounded-xl border border-[#f0d4d2] p-5 hover:border-[#e2241b]/50 hover:shadow-md transition-all duration-200 group">
              <div className="text-[#e2241b] mb-3">{c.icon}</div>
              <h3 className="font-bold text-[#1a1a1a] mb-1.5 group-hover:text-[#e2241b] transition-colors text-sm">{c.title}</h3>
              <p className="text-sm text-[#6b7a8d] leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
        <Card variant="info">
          <strong>En résumé</strong> — KALATI ne "sait" que ce qui est écrit dans les documents auxquels vous avez accès. Il ne devine pas, il cherche dans les textes officiels et reformule ce qu'il y trouve.
        </Card>
      </AnimSection>

      {/* CONNEXION */}
      <AnimSection id="connexion">
        <SectionHeading icon={<LogIn size={20} />}>Se connecter</SectionHeading>
        <Step n={1} title="Ouvrez KALATI">
          <p className="text-sm text-[#6b7a8d]">Depuis votre ordinateur, tablette ou téléphone (adresse fournie par votre service informatique).</p>
        </Step>
        <Step n={2} title="Saisissez vos identifiants">
          <p className="text-sm text-[#6b7a8d]">Utilisez l'identifiant et le mot de passe qui vous ont été communiqués.</p>
        </Step>
        <Step n={3} title="Changez votre mot de passe temporaire">
          <p className="text-sm text-[#6b7a8d]">Lors de votre toute première connexion, il est recommandé de changer votre mot de passe temporaire (menu de votre profil).</p>
        </Step>
        <Card variant="warn">
          <strong>Vous ne parvenez pas à vous connecter ?</strong> Après plusieurs essais infructueux, l'accès est temporairement bloqué quelques minutes par mesure de sécurité. Si le problème persiste, contactez la Coordination Informatique.
        </Card>
        <H3>Votre accès dépend de votre poste</H3>
        <p className="text-sm text-[#374151] leading-relaxed">
          Vous ne voyez que les documents liés à votre fonction (RH, Sécurité, Maintenance, Transport, Direction...). C'est normal et volontaire — cela protège les informations sensibles de chaque service. Si un document qui vous semble utile n'apparaît pas dans vos réponses, contactez la Coordination Informatique pour vérifier vos droits d'accès.
        </p>
      </AnimSection>

      {/* POSER UNE QUESTION */}
      <AnimSection id="poser-question">
        <SectionHeading icon={<MessageSquare size={20} />}>Poser une question efficacement</SectionHeading>
        <p className="text-[#374151] leading-relaxed mb-4">KALATI comprend le langage naturel, mais certaines formulations donnent de meilleurs résultats que d'autres.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <ExampleBox variant="good" question={'Que dit la Convention Collective en matière de retraite ?'} note="Précise, complète, une seule question." />
          <ExampleBox variant="bad" question={"Parle-moi du travail"} note="Trop vague — KALATI ne saura pas quel document chercher." />
          <ExampleBox variant="good" question={"Que prévoient les IGS sur la Marche à Vue ?"} note="Utilise le vocabulaire métier habituel — KALATI le reconnaît." />
          <ExampleBox variant="bad" question={"C'est quoi la procédure et aussi les horaires et le contact RH ?"} note="Plusieurs questions mélangées — posez-les une par une." />
        </div>
        <H3>Exemples de questions selon votre métier</H3>
        <DataTable
          headers={['Situation', 'Exemple de question']}
          rows={[
            ['Agent de gare / Sécurité', 'Que prévoient les IGS sur la Marche à Vue ?'],
            ['Maintenance ferroviaire', 'Comment révise-t-on un roulement de boîtes d\'essieux ?'],
            ['Exploitation / Transport', 'Comment expédier un train dans une gare ?'],
            ['Tout agent', 'Que dit la Convention Collective en matière de congés ?'],
          ]}
        />
      </AnimSection>

      {/* COMPRENDRE LA RÉPONSE */}
      <AnimSection id="comprendre-reponse">
        <SectionHeading icon={<BookOpen size={20} />}>Comprendre et vérifier une réponse</SectionHeading>
        <p className="text-[#374151] leading-relaxed mb-3">
          Chaque réponse de KALATI s'accompagne d'une ou plusieurs <strong>sources</strong> : le nom du document exact dans lequel l'information a été trouvée.
        </p>
        <div className="bg-white border border-[#f0d4d2] rounded-xl p-5 my-4 shadow-sm">
          <p className="text-sm font-semibold text-[#1a1a1a] mb-2">Exemple de réponse</p>
          <p className="text-sm text-[#374151] italic mb-3">"La Convention Collective prévoit que... [réponse détaillée]"</p>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-[#1a1a1a]">Sources :</span>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-[#e2241b] border border-[#f0d4d2]">Convention_Collective_CAMRAIL.pdf</span>
          </div>
        </div>
        <Card variant="danger">
          <strong>Règle essentielle — sujets de sécurité</strong><br />
          Ne prenez jamais une décision importante — surtout liée à la sécurité des personnes et des circulations — sur la seule base de la réponse de KALATI. Ouvrez toujours le document source cité pour confirmer avant d'agir. KALATI est une aide à la recherche, pas une autorité.
        </Card>
        <H3>Si la réponse ne vous semble pas correcte</H3>
        <ol className="text-sm space-y-1 text-[#374151] list-decimal list-inside">
          <li>Reformulez votre question différemment, avec d'autres mots</li>
          <li>Vérifiez directement le document source cité</li>
          <li>Si le problème persiste, signalez-le à votre formateur ou à la Coordination Informatique</li>
        </ol>
        <H3>Si KALATI répond "je ne trouve aucun document pertinent"</H3>
        <ul className="text-sm space-y-1 text-[#374151] list-disc list-inside">
          <li>Le document existe mais n'est pas encore intégré à KALATI</li>
          <li>Le document existe mais n'est pas accessible à votre service</li>
          <li>La question sort du périmètre des textes normatifs CAMRAIL</li>
        </ul>
      </AnimSection>

      {/* VOCAL */}
      <AnimSection id="vocal">
        <SectionHeading icon={<Mic size={20} />}>Utiliser le micro</SectionHeading>
        <p className="text-[#374151] leading-relaxed mb-4">Si votre poste le permet, vous pouvez poser votre question à l'oral plutôt qu'au clavier.</p>
        <Step n={1} title="Appuyez sur l'icône micro"><p className="text-sm text-[#6b7a8d]">Parlez clairement votre question.</p></Step>
        <Step n={2} title="Arrêtez l'enregistrement"><p className="text-sm text-[#6b7a8d]">Relâchez ou appuyez à nouveau.</p></Step>
        <Step n={3} title="Résultat automatique"><p className="text-sm text-[#6b7a8d]">KALATI transcrit votre question, cherche la réponse, et peut vous la lire à voix haute.</p></Step>
        <Card variant="info">
          <strong>Conseil pour une bonne transcription</strong> — Utilisez de préférence un casque ou des écouteurs avec micro intégré plutôt que le micro de l'ordinateur : la qualité de la transcription en dépend fortement, surtout dans un environnement bruyant (gare, atelier).
        </Card>
      </AnimSection>

      {/* LIMITES */}
      <AnimSection id="limites">
        <SectionHeading icon={<ShieldOff size={20} />}>Ce que KALATI ne fait pas</SectionHeading>
        <ul className="space-y-3 mb-4">
          {[
            ['Pas un moteur de recherche internet', 'Il ne répond qu\'à partir des documents CAMRAIL indexés, jamais avec des informations extérieures.'],
            ['Pas un outil de décision', 'Il vous aide à retrouver une information, il ne se substitue pas à un responsable ou à une procédure de validation.'],
            ['Il peut se tromper', 'Comme tout système automatisé, vérifiez toujours une réponse importante via le document source.'],
            ['Il ne connaît que ce qui est indexé', 'Un document tout juste ajouté peut prendre quelques minutes avant d\'être pris en compte.'],
          ].map(([title, desc]) => (
            <li key={title} className="flex items-start gap-3 text-sm bg-white border border-[#f0d4d2] rounded-xl p-4">
              <span className="w-5 h-5 rounded-full bg-red-100 text-[#e2241b] flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShieldOff size={11} />
              </span>
              <span><strong className="text-[#1a1a1a]">{title}</strong> — <span className="text-[#6b7a8d]">{desc}</span></span>
            </li>
          ))}
        </ul>
        <Card variant="warn">
          <strong>Confidentialité</strong> — Vos questions et les réponses obtenues sont enregistrées dans un journal à des fins de contrôle et de conformité réglementaire. Utilisez KALATI dans le cadre de votre activité professionnelle.
        </Card>
      </AnimSection>

      {/* FAQ */}
      <AnimSection id="faq">
        <SectionHeading icon={<HelpCircle size={20} />}>Questions fréquentes</SectionHeading>
        <div className="space-y-4">
          {[
            {
              q: 'Je ne vois pas un document que je sais exister, pourquoi ?',
              a: 'Votre accès dépend de votre service. Contactez la Coordination Informatique si vous pensez avoir besoin d\'un accès supplémentaire.',
            },
            {
              q: 'Puis-je poser des questions personnelles ou hors travail ?',
              a: 'Non, KALATI est un outil professionnel dédié à la recherche dans les textes normatifs CAMRAIL.',
            },
            {
              q: 'Que faire si le système ne répond pas ou est très lent ?',
              a: 'Réessayez dans quelques instants. Si le problème persiste, contactez la Coordination Informatique. En cas d\'urgence, référez-vous toujours aux documents papier/officiels.',
            },
            {
              q: 'Puis-je faire confiance à 100 % à une réponse ?',
              a: 'Non — vérifiez toujours la source citée, en particulier pour tout sujet lié à la sécurité ou à la réglementation.',
            },
            {
              q: 'Qui contacter en cas de problème ?',
              a: 'Votre formateur pour les questions d\'usage, la Coordination Informatique pour les problèmes de compte ou d\'accès.',
            },
          ].map(({ q, a }) => (
            <div key={q} className="bg-white border border-[#f0d4d2] rounded-xl p-5 hover:shadow-sm transition-shadow">
              <h4 className="font-semibold text-[#1a1a1a] mb-2 flex items-start gap-2">
                <HelpCircle size={16} className="text-[#e2241b] flex-shrink-0 mt-0.5" />
                {q}
              </h4>
              <p className="text-sm text-[#6b7a8d] leading-relaxed pl-6">{a}</p>
            </div>
          ))}
        </div>
      </AnimSection>
    </div>
  )
}
