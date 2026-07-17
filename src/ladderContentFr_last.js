/* ============================================================
   LADDER CONTENT (FR) — la couche éditoriale, hors du composant.
   Version française v3, traduite/rédigée à partir des anchors v2.

   Les `id` sont IDENTIQUES à la version anglaise (clés de cache).
   L'ordre est une donnée, pas du code : réordonner/ajouter/retirer
   des diapositives en éditant le tableau ci-dessous. Le rail se lit
   de bas en haut — SLIDES[0] est la base de l'ascension.

   Registre salle : conférencier neutre, sans adresse directe.
   Fragments et sous-titres : français idiomatique, calibré « titre ».
   Anchors : synthétiques, orientés modèle (injectés dans les prompts).
   Seeds : rédigées directement en français (pas traduites), ~100 mots
   pour respirer à l'oral ; `synthesis`/`threads` en registre technique.
   ============================================================ */

/* ------------------------------------------------------------
   CATEGORIES — les trois grands arcs de l'ascension, matérialisés
   par des pastilles verticales colorées le long du rail des tags.
   Chaque diapositive y renvoie via son champ `category` : `sujet` ouvre
   le parcours avec la pastille triangulaire `stack`, `motifs` est la
   charnière entre la moitié classique et la moitié « apprentissage ».
   L'appartenance est une donnée : réaffecter une diapositive en changeant
   sa `category`. Le moteur ne lit que { label, color | colors, shape? }
   et reste générique.
   ------------------------------------------------------------ */
const CS_COLOR = "#6FA8DC";
const ML_COLOR = "#B39DDB";
const AI_COLOR = "#E28AAE";
const STACK_COLOR = "#F2A93B"; // ambre — reprend l'ambre phosphore de l'UI (C.amber)
export const CATEGORIES = {
  cs: { label: "computer science", color: CS_COLOR }, // interrupteurs → perturbations
  ml: { label: "machine learning", color: ML_COLOR }, // apprendre → incertitude
  ai: { label: "AI/LLM", color: AI_COLOR },           // motsuivant → agents
  // l'ouverture : `sujet` amorce l'empilement — pastille TRIANGULAIRE ambre,
  // une seule couleur + `shape:"triangle"`, pour évoquer la mise en pile.
  stack: { label: "", color: STACK_COLOR, shape: "triangle" },
  // la charnière : `motifs` n'appartient à aucune moitié — ses idées servent
  // les deux —, donc sa pastille est sans texte et se scinde proprement entre
  // les accents cs et ml (bas = cs, sous la moitié classique ; haut = ml).
  hinge: { label: "", colors: [CS_COLOR, ML_COLOR] },
};

export const SLIDES = [
  /* ---------- ROOT ---------- */
 {
    id: "sujet",
    category: "stack",
    tag: "empilement",
    eyebrow: "Un empilement d'opérations",
    fragment: "Calculer et transformer — des impulsions électriques à l'IA générative",
    sub: "Comment fonctionnent concrètement les machines ? Comment utiliser des données pour apprendre et raisonner ? Des opérations, pas de magie.",
    anchor: `The opening frame and the motivation for the whole lecture: you cannot fairly judge what today's AI can and cannot do without a working grasp of how machines compute and how data is turned into learning and reasoning. Offer interchangeable lenses on the same field — (1) computing is transforming representations of information under the constraints of finite resources; (2) it is a stack of operations climbed layer by layer, electrical impulses at the bottom, generative AI at the top, each rung usable without understanding the one below; (3) "operations, not magic" — apparent intelligence is composition, never a special ingredient. The room-facing text deliberately leads with the stack-of-operations, no-magic framing and does NOT spell out the deck's second spine. But hold that second spine here as model-only ground truth, because recurring (motifs) and probably (probables) will pay it off: this is really TWO parallel climbs taken in one motion — a climb in reach (from a single switch to systems that write and act) and, running the other way, a descent in certainty (from exact, inspectable, reproducible steps to results that are only probably right). A twin to this: the classical stack hides complexity behind abstractions while keeping its guarantees; the learning and AI halves spend those guarantees for reach. Do not state either spine as doctrine to the room — just make sure the framing leaves room for it. Stay at framing altitude: name the journey and its directions, do not descend into any single rung.`,
    seeds: {
      synthesis: `On ne peut juger honnêtement ce que l'IA d'aujourd'hui sait faire, ni ce qui lui échappe, sans comprendre comment une machine calcule et comment les données deviennent apprentissage et raisonnement. Trois regards interchangeables sur un même objet. Calculer, c'est transformer des représentations de l'information sous la contrainte de ressources finies. C'est aussi une pile d'opérations que l'on gravit étage par étage, de l'impulsion électrique tout en bas jusqu'à l'IA générative au sommet, chaque niveau s'utilisant sans qu'on maîtrise celui du dessous. C'est enfin des opérations, jamais de la magie : l'intelligence apparente tient à l'assemblage, non à quelque ingrédient particulier. Le voyage commence ici ; nommons-en la direction avant d'en parcourir les marches.`,
    },
 },
  /* ---------- LA MACHINE ---------- */
 {
    id: "interrupteurs",
    category: "cs",
    tag: "interrupteurs",
    eyebrow: "La machine · les bits",
    fragment: "Tout n'est qu'interrupteurs",
    sub: `Allumé ou éteint — chaque instruction, chaque nombre, lettre, texte ou image, n'est qu'une collection de 0 et de 1, associée à une convention de lecture.`,
    anchor: `Billions of transistors acting as extremely fast switches with no moving parts. Two agreed-upon states are enough to encode any number, letter, text, image or sound, because bits compose. The point to seat firmly, because the whole deck leans on it later: there is no picture or song or instruction inside the machine — only bit patterns plus a convention for reading them. Meaning is not in the bits; it is in the agreement about how to read them. This is the first instance of "the map is not the territory" (named at motifs) and the seed of every representation move later — bits, then points-in-space, then learned features (representation). Stay classical; no quantum-computing detours. Differentiate from the next rung: this slide is about representation (world → bits under a convention), not about what the CPU does to those bits.`,
    seeds: {
      synthesis: `Des milliards de transistors se comportent comme des interrupteurs d'une rapidité extrême, sans la moindre pièce mobile. Deux états convenus suffisent à coder n'importe quel nombre, lettre, texte, image ou son, car les bits se composent. Le point à poser fermement : rien, dans la machine, ne contient d'image, de mélodie ni d'instruction — seulement des motifs de bits et une convention pour les lire. Le sens ne réside pas dans les bits ; il tient à l'accord sur la façon de les interpréter. C'est là que « la carte n'est pas le terrain » se manifeste pour la première fois, et c'est le germe de tout ce qui suivra en matière de représentation : des bits, puis des points dans un espace, puis des traits appris.`,
    },
 },

{
    id: "opérations",
    category: "cs",
    tag: "opérations",
    eyebrow: "La machine · le CPU",
    fragment: `Le processeur effectue des opérations élémentaires — à une vitesse extrême`,
    sub: `Déplacer, copier, ajouter, comparer — des milliards à la seconde. Calculer c'est manipuler mécaniquement des symboles. Rien de subtil mais du volume, à pleine vitesse.`,
    anchor: `A processor executes only trivial operations: arithmetic, comparison, moving and copying data, jumping to another instruction. Nothing it does is individually clever; apparent intelligence is composition at scale. It is deterministic — same inputs, same steps, same result, every time. Stress the "no magic, mechanical, blindingly fast" nature: computation is symbols pushed by mechanical rules, with all the power in the stacking, none in any single step. This rung introduces the deck's core deflationary move — intelligence is composition of dumb parts, not a special ingredient — which the AI section will both honour and complicate: the same "just composition" logic that demystifies the CPU will, at enough scale, produce behaviour nobody explicitly built (the map emerging from the composition faster than anyone authored it). Do not raise that tension here; just make the composition claim cleanly, because it is the claim the top of the deck will lean on and qualify. Differentiate from neighbours: this slide is the CPU's dumb-but-fast vocabulary and its determinism, NOT the memory cost of feeding it (memoire), NOT clever recipes or how cost scales (algorithmes).`,
    seeds: {
      synthesis: `Un processeur ne sait faire que des gestes élémentaires : additionner, comparer deux valeurs, déplacer ou recopier une donnée, sauter à une autre instruction. Aucun de ces gestes n'est intelligent en lui-même ; l'intelligence apparente ne tient qu'à leur empilement, à leur composition en très grand nombre. Rien de magique là-dedans : la machine pousse des symboles selon des règles mécaniques, à une vitesse qui donne le vertige, mais chaque pas reste trivial. Et tout y est déterministe — mêmes entrées, mêmes étapes, même résultat, à chaque fois. Toute la puissance est dans l'assemblage, aucune dans le geste isolé. L'idée est simple et nette : l'intelligence naît de la composition de pièces qui n'en ont aucune, non d'un ingrédient particulier.`,
    },
    },
{
    id: "memoire",
    category: "cs",
    tag: "mémoire",
    eyebrow: "La machine · la mémoire",
    fragment: `Transformer des états puis stocker le résultat. Utiliser la mémoire c'est toujours un compromis`,
    sub: `La mémoire proche est rapide d'accès mais petite. Pour stocker plus large, il faut stocker plus loin et perdre en vitesse — concevoir des séquences d'opérations, c'est choisir des compromis.`,
    anchor: `Two ideas fused into one rung by design. First: computation is transform-then-store — the processor changes states and the result must be held somewhere for the next operation to use, so memory is not a side concern but half of what computing is. Second, and the load-bearing point: memory is a hierarchy from small-and-fast (on-chip registers and caches, near the processor) to large-and-slow (main memory, disk, network, far away). You cannot have both large and fast at once; storing more means storing farther and paying in speed. Make this the deck's first explicit, physical tradeoff — the concrete anchor for the abstract "everything is a tradeoff" named at motifs; here you can literally point at it. Moving data to the processor usually costs far more than the computation itself, which is why locality, caching and "don't redo work" dominate performance — and why feeding data to GPUs matters as much as their arithmetic, a direct set-up for the scale rung (taille), where the AI boom turns out to be a data-movement-and-arithmetic boom. Keep concrete: this is the cost of holding and moving data, not algorithms (algorithmes) and not the OS's arbitration of it (arbitre).`,
    seeds: {
      synthesis: `Calculer, c'est transformer puis conserver : le processeur change d'état, et le résultat doit être gardé quelque part pour l'opération suivante — la mémoire n'est pas un à-côté, elle est la moitié de ce qu'est le calcul. Or elle s'étage : près du processeur, les registres et les caches, petits et rapides ; plus loin, la mémoire principale, le disque, le réseau, vastes mais lents. Jamais les deux à la fois : stocker plus, c'est stocker plus loin, et le payer en vitesse. Voilà le premier compromis physique, celui que l'on peut montrer du doigt. Amener la donnée au processeur coûte souvent bien plus que le calcul : d'où la localité, la mise en cache, et pourquoi nourrir un GPU compte autant que son arithmétique.`,
    },
  },
    {
    id: "arbitre",
    category: "cs",
    tag: "arbitre",
    eyebrow: "La machine · l'OS",
    fragment: `Le système d'exploitation partage les ressources nécessaires aux calculs`,
    sub: `Mémoire et opérateurs de calculs sont en quantité finie — le système d'exploitation est l'arbitre qui les distribue entre les programmes qui en ont besoin. Si rapidement que tout semble simultané — la plupart du temps.`,
    anchor: `The operating system is the shared referee over finite resources: processor, memory and files are limited, and the OS hands them out among many competing programs, switching between them thousands of times a second so tasks appear simultaneous even on a few cores. It also isolates them — each program gets its own patch of memory and cannot trample another's — so one crash need not take down the machine. Placed here, after CPU and memory, deliberately: you can only appreciate the arbitration once you have seen the two scarce things being arbitrated. This is a first taste of a managed illusion built on rationed resources — a theme that returns structurally when one frozen model is shared across countless uses (couts / trainonce). Note the "most of the time": under heavy load the illusion cracks and things stutter — illusions built on rationed resources have a breaking point. Keep it concrete; no scheduling algorithms or kernel internals.`,
    seeds: {
      synthesis: `Le système d'exploitation arbitre des ressources rares : le processeur, la mémoire, les fichiers, que de nombreux programmes se disputent. Il les répartit en passant de l'un à l'autre des milliers de fois par seconde, si bien que les tâches semblent simultanées alors que les cœurs se comptent sur les doigts. Il les isole aussi : chacun reçoit son coin de mémoire et ne peut empiéter sur celui du voisin, et un plantage n'emporte pas toute la machine. On ne saisit cet arbitrage qu'après avoir vu les deux ressources qu'il répartit. C'est une illusion entretenue sur des ressources rationnées : le plus souvent elle tient, mais sous forte charge elle se fissure et tout saccade.`,
    },
  },

  {
    id: "code",
    category: "cs",
    tag: "code",
    eyebrow: "Les instructions · les langages",
    fragment: `Le code : c'est un ensemble d'instructions à exécuter — dans un langage accessible`,
    sub: `Le langage établit la correspondance entre instructions complexes — décrites en des termes bien choisis — et leur traduction en suites d'opérations élémentaires exécutées par la machine.`,
    anchor: `Programming languages let humans write instructions in something close to words — well-chosen terms naming complex intentions; a translator (compiler or interpreter) grinds that down, layer by layer, into the CPU's tiny operations. Higher-level languages are more expressive and forgiving but further from the metal; lower-level ones give more control and more pain — a tradeoff (expressiveness vs control) that rhymes with every other tradeoff in the deck. The key point, and the one the AI section will overturn: this translation is EXACT and inspectable. The machine only ever runs tiny steps; code is a human-shaped surface over them, mechanically and faithfully translated — a compiler is correct, or it is a bug. Nothing new happens in the machine. Hold this "exact translation between layers" idea deliberately, because probably (probables) is precisely the rung where that guarantee is traded away for reach. Keep concrete; no syntax detours. Differentiate from the algorithm rung (algorithmes): this is about translation (words → steps), not about the cleverness or cost of the recipe.`,
    seeds: {
      synthesis: `Un langage de programmation permet d'écrire des instructions dans des termes proches du langage courant, choisis pour nommer des intentions complexes ; un traducteur — compilateur ou interpréteur — les broie ensuite, couche après couche, jusqu'aux opérations minuscules du processeur. Les langages de haut niveau sont plus expressifs et plus indulgents, mais plus éloignés de la machine ; ceux de bas niveau offrent davantage de contrôle au prix de la peine — un compromis de plus, entre expressivité et maîtrise. Mais l'essentiel tient à ceci : cette traduction est exacte et inspectable. La machine n'exécute jamais que de petits pas ; le code n'est qu'une surface à hauteur d'humain, fidèlement rabattue sur eux. Un compilateur est correct, sinon c'est un bogue. Rien de neuf ne surgit dans la machine — et cette garantie, retenons-la.`,
    },
  },
  {
    id: "algorithmes",
    category: "cs",
    tag: "algorithmes",
    eyebrow: "Les instructions · les algorithmes",
    fragment: `Un algorithme : c'est une recette — une suite d'étapes à réaliser pour mener à bien une tâche`,
    sub: `Il existe souvent de multiples façons de parvenir au même objectif — certaines plus efficaces que d'autres. Le choix d'une recette conditionne ce qui est atteignable, surtout quand le volume de travail croît.`,
    anchor: `An algorithm is a precise recipe: a finite list of steps that solves a problem. Many recipes give the same answer at wildly different cost; what matters is how cost GROWS as the input grows, because that is what decides what is feasible at all — scaling is the star here, and it returns transformed at the scale rung (taille), where growth stops being a cost to fear and becomes the engine that produces new abilities. Fold in the performance wisdom that belongs here: don't redo work (cache and reuse), measure before optimizing (intuition about the slow part is usually wrong), and beware that any metric becomes gamed once it is made the target (Goodhart — a concrete instance of "the map is not the territory," and a live risk again when we grade learned models on proxies). Differentiate from the CPU rung (opérations): there the individual steps were dumb and fast; here the cleverness lives in their order and count, and how that cost scales with the size of the job.`,
    seeds: {
      synthesis: `Un algorithme est une recette exacte : une suite finie d'étapes qui résout un problème. Pour une même réponse, les recettes diffèrent énormément par leur coût, et l'essentiel n'est pas ce coût lui-même, mais sa façon de croître quand l'entrée grandit ; c'est cette croissance qui décide ce qui reste faisable. Là où le processeur enchaînait des opérations bêtes et rapides, la finesse tient ici dans leur ordre et leur nombre. Trois règles en découlent : ne pas refaire un calcul déjà fait, mesurer avant d'optimiser — l'intuition se trompe presque toujours sur le point lent —, et se méfier de toute mesure qui, une fois érigée en objectif, finit truquée : la loi de Goodhart, où la carte n'est pas le terrain.`,
    },
  },

  {
    id: "abstractions",
    category: "cs",
    tag: "abstractions",
    eyebrow: "Composer et assembler · des abstractions",
    fragment: `Réaliser des tâches complexes c'est composer à partir de tâches plus simples — qu'on peut abstraire`,
    sub: `En séparant le "quoi" du "comment" d'une tâche — en cachant les détails derrière une interface — on peut composer plus aisément diverses fonctions et ainsi résoudre des problèmes complexes.`,
    anchor: `The master move for complexity, framed here as the principle of abstraction itself: decompose a hard task into simpler tasks, and wrap each behind an interface — a contract that promises WHAT a part does while concealing HOW it does it. Separating the what from the how is what lets you compose functions freely and build complex things out of simple ones; you can change the how at will as long as the what holds. Naming and composition — name a capability, combine named capabilities — is very nearly all of building. This is the constructive, load-bearing form of the deck's composition theme (opérations introduced it as dumb parts; here composition becomes the deliberate discipline that builds everything) — and it sets up the sharpest contrast with AI: these interfaces promise their "what" exactly, whereas a learned layer only promises it probably (probables). Differentiate from the next rung (assemblages): this is the principle (decompose + interface = what/how); the next is the lived reality (you glue borrowed parts, and interfaces leak).`,
    seeds: {
      synthesis: `Face à la complexité, un geste domine : décomposer une tâche difficile en tâches plus simples, puis enfermer chacune derrière une interface. Cette interface est un contrat : elle promet ce qu'une partie fait, sans rien dire de la manière dont elle le fait. Séparer le quoi du comment, c'est précisément ce qui autorise à composer librement, à bâtir du complexe à partir du simple ; tant que le contrat tient, on peut refondre l'implémentation à volonté. Nommer une capacité, puis combiner des capacités nommées — c'est presque tout l'art de construire. Et ces contrats tiennent exactement leur promesse : ils annoncent leur quoi avec certitude, là où une couche apprise, plus tard, ne le promettra que probablement.`,
    },
  },
  {
    id: "assemblages",
    category: "cs",
    tag: "assemblages",
    eyebrow: "Composer et assembler · des piles logicielles",
    fragment: `Un programme informatique moderne repose sur une pile d'abstractions`,
    sub: `On s'appuie sur du code et des fonctions conçues par d'autres puis "empilés" — pilotes matériels, OS, langages, libraries. Complexité et composition sont cachées par de multiples interfaces — jamais complètement "évacuées".`,
    anchor: `The practical reality of building on the previous rung's principle: a modern program rests on a tall stack of abstractions built by other people — hardware drivers, OS, languages, libraries, frameworks — each trusted through its interface to behave. Almost nothing is written from scratch; you assemble existing blocks. But the complexity hidden behind each interface is deferred, not deleted — never fully "evacuated" — and abstractions leak. The day a borrowed library fails weirdly, a query is mysteriously slow, or an assumption you didn't know you had made breaks, the sealed "how" pokes through and forces you to look inside something you didn't write. Hence the craftsman's rule that motifs will name first: use the top, but understand one layer below. This matters more, not less, as we climb into AI — a probabilistic layer (probables) is the leakiest abstraction of all, and "understand one layer below" becomes the verifying step it insists on keeping. Differentiate from the previous rung (abstractions): that was the principle of hiding complexity; this is the reality of assembling borrowed parts and the leaks that follow.`,
    seeds: {
      synthesis: `Construire, aujourd'hui, c'est presque toujours assembler. Un programme repose sur une longue pile d'abstractions bâties par d'autres — pilotes, système, langages, bibliothèques, frameworks —, chacune tenue pour fiable à travers son interface. On n'écrit presque rien de zéro ; on emboîte des blocs existants. Mais la complexité masquée derrière chaque interface est différée, jamais vraiment évacuée : les abstractions fuient. Le jour où une bibliothèque empruntée défaille bizarrement, où une requête traîne sans raison, où une hypothèse ignorée cède, le « comment » scellé perce et force à ouvrir ce qu'on n'a pas écrit. D'où la règle de l'artisan : se servir du sommet, mais comprendre un cran plus bas. Plus on montera vers les couches probabilistes, plus cette exigence deviendra l'étape de vérification.`,
    },
  },
{
    id: "perturbations",
    category: "cs",
    tag: "perturbations",
    eyebrow: "Composer et assembler · des choix et des perturbations",
    fragment: `Assembler c'est choisir — et anticiper les perturbations`,
    sub: `Tout ne suit pas toujours le meilleur scenario — le réseau peut couper, des références diverger, des évolutions de code modifier les interfaces, une saisie utilisateur s'avérer non-conforme. Il faut construire en intégrant ces éventualités.`,
    anchor: `Reframed from pure defensiveness toward the choice it forces: assembling is choosing, and choosing means anticipating that the world will not follow the happy path. Reliable systems are built to stay standing when things fail and change, because in the real world they constantly do: the network drops, code evolves and shifts its interfaces underneath you, multiple sources of truth diverge, outside input cannot be trusted and may be non-conforming or hostile, splitting work across machines breeds collisions and race conditions, and rising load strains every resource. Good engineering expects all of this and keeps standing — validate inputs, tolerate failure, don't assume one true copy, guard shared work. Crucially, this defensive disposition is exactly what the whole back half of the deck will demand of AI too: drift reappears literally when learned patterns go stale (correlation), "inputs lie" reappears as untrusted data becoming the program (apprendre, motsuivant), and "expect to be wrong and stay standing" is precisely the posture that calibrated uncertainty (incertitude) and the verifying step (probables, agents) formalize. Keep it concrete and avoid security jargon. This is the "build for a hostile, changing world" rung.`,
    seeds: {
      synthesis: `Assembler, c'est choisir, et choisir, c'est admettre que le monde ne suivra pas le chemin idéal. Un système fiable tient debout quand les choses échouent et changent, car dans le réel elles le font sans cesse : le réseau tombe, le code déplace ses interfaces sous nos pieds, plusieurs sources de vérité divergent, l'entrée extérieure est suspecte, répartir le travail engendre des collisions, la charge éprouve chaque ressource. La bonne ingénierie anticipe tout cela : valider les entrées, tolérer la panne, ne pas présumer une copie unique, protéger le travail partagé. Cette posture ressurgira intacte plus haut : la dérive des motifs appris, les données extérieures qui deviennent le programme, l'étape de vérification qui assume l'erreur sans céder.`,
    },
  },

   {
    id: "motifs",
    category: "hinge",
    tag: "motifs",
    eyebrow: "Des motifs récurrents",
    fragment: `Gardons certaines idées à l'esprit — lorsqu'on manipule des symboles`,
    sub: `Identifier les limites d'une abstraction — c'est réfléchir un niveau plus bas, sous l'interface. Délimiter un objet, c'est figer ce qu'il est et ce qu'il n'est pas — la carte n'est pas le terrain. La plupart des choix sont des compromis à arbitrer — vitesse, taille, cohérence, disponibilité, simplicité, sécurité.`,
    anchor: `A step-back interlude naming the ideas that reappear on every rung rather than living on one. Three that the classical half has already earned, and that the room-facing text states: (1) understand one layer below — you can use the top without the bottom, but each level you grasp deeper stops being magic, and spotting an abstraction's limits means thinking beneath its interface; (2) the map is not the territory — drawing a boundary around an object fixes what it is and is not, and squeezing a messy real want into symbols always drops something, so a metric is not the goal, a model is not the world, a spec is not the need, and the deepest failures live in that gap; (3) almost everything is a tradeoff — speed, size, consistency, availability, simplicity, security rarely align, so choose the sacrifice on purpose, not by accident. Now the model-only part, deliberately NOT stated to the room here (per the deck's decision to keep it out of the audience layer): hold the deck's fourth, forward-pointing idea — the epistemic ladder — as ground truth. As we climb in reach, we descend in certainty: everything below this rung was exact, inspectable, reproducible; everything above it trades some of that guarantee for the ability to handle things we could never write down. This is the hinge that turns the deck toward its second half; it is paid off explicitly at probably (probables). Keep the room-facing version to the recurring ideas as synthesis, not four flat topics, and let the epistemic turn stay latent in the anchor, surfacing only if a listener pulls on it.`,
    seeds: {
      synthesis: `Une pause, le temps de nommer ce qui revient à chaque étage plutôt que de vivre sur un seul. Comprendre un cran plus bas, d'abord : on peut se servir du sommet sans en connaître le socle, mais chaque niveau vraiment saisi cesse d'être magique, et repérer les limites d'une abstraction, c'est penser sous son interface. La carte n'est pas le terrain, ensuite : réduire un besoin réel à des symboles laisse toujours échapper quelque chose — une métrique n'est pas le but, un modèle n'est pas le monde, et les défaillances les plus profondes logent dans cet écart. Enfin, presque tout est un compromis : vitesse, taille, cohérence, disponibilité, sécurité s'accordent rarement, et le sacrifice se choisit à dessein, jamais par accident.`,
    },
  },
{
    id: "apprendre",
    category: "ml",
    tag: "apprendre",
    eyebrow: "Apprendre des données · ne plus écrire les règles",
    fragment: `Apprendre plutôt que spécifier — montrer des exemples et laisser la machine identifier des règles`,
    sub: `Pour certaines tâches complexes — reconnaître un visage — il est difficile de spécifier des règles. On peut tenter d'apprendre des règles à partir d'exemples. Les données deviennent une partie du programme, la rigidité des règles se relâche, leur portée s'accroît mais les garanties s'effacent.`,
    anchor: `The section-opening paradigm shift, the counterpart to the opening frame (sujet) but for data. Everything up to here was the classical stack: a human writes explicit rules and a deterministic machine follows them. Some tasks defeat that approach — recognising a face, flagging spam, translating a sentence — because nobody can enumerate the rules; the rule lives in millions of examples, not in a spec. Machine learning inverts the classical arrangement: instead of writing the how, you supply examples of the what (inputs and desired outputs) and an algorithm searches for a rule that fits them and, crucially, extends to new cases. Frame this squarely as the defining TRADEOFF of the paradigm, in the deck's own tradeoff idiom, so opportunity and cost arrive together rather than the section reading as a list of dangers: what you GAIN is reach — you can now handle tasks too messy, too various or too shifting to ever specify by hand, obtained cheaply from observation instead of exhaustive authorship; what you SPEND is guarantee and legibility — (1) the rules are now learned, not authored, so they are statistical and approximate rather than exact, the point where the deterministic stack starts giving way to the probabilistic one the AI section completes; (2) the data becomes the real program — the examples, not the code, now decide behaviour, so their gaps and biases become the system's, and "who chose the examples" becomes a first-class engineering question; (3) the machine finds correlation, not understanding, and success is judged on unseen cases, not the examples shown. The four rungs above unpack the mechanics and costs (points in space, correlation-not-cause, generalization, calibrated trust); the gains show up when someone pulls on them (a task you could never have coded, now working). Stay at section-opener altitude: name the inversion as a genuine bargain — real reach for real guarantee — and point down the section, without descending into vectors, evaluation or uncertainty yet.`,
    seeds: {
      synthesis: `Jusqu'ici, un humain écrivait les règles et une machine déterministe les suivait. Mais reconnaître un visage, filtrer un courriel indésirable ou traduire une phrase déjoue cette approche : nul ne sait énumérer la règle, elle vit dans des millions d'exemples. L'apprentissage automatique inverse l'ordre — au lieu d'écrire le comment, on fournit des exemples du quoi, et un algorithme cherche une règle qui s'y ajuste et s'étend aux cas nouveaux. C'est un compromis : on gagne en portée, car des tâches trop mouvantes pour être spécifiées à la main deviennent traitables, à peu de frais ; on y perd en garanties et en lisibilité. Les règles sont désormais statistiques, les données deviennent le programme, et la machine saisit des corrélations, jugées sur ce qu'elle n'a jamais vu.`,
    },
  },

  {
    id: "representation",
    category: "ml",
    tag: "représentation",
    eyebrow: "Apprendre des données · encoder des objets",
    fragment: `Les machines excellent dans la manipulation des nombres — les objets sont transformés en vecteurs`,
    sub: `E-mails, visages, mots — tout est transformé en vecteur : un ensemble de coordonnées dans un espace. Souvent, des objets "semblables" seront "proches" dans cet espace — tout se passe comme si la géométrie pouvait encoder le sens.`,
    anchor: `The move that starts machine learning working FOR you — the productive engine of the section, not a caveat: because machines excel at manipulating numbers, represent anything — an e-mail, a face, a word, a customer — as a vector, a point in a space of coordinates, engineered so that similar things land near each other and different things land far apart. Once meaning becomes distance, "find similar," "group," and "recommend" turn into geometry — it is as if the geometry itself could encode meaning. This is where the reach promised at apprendre actually gets delivered, and it is worth letting this rung feel powerful, since the neighbouring rungs are about limits. This is representation again — foreshadowed by interrupteurs' "meaning is a convention on top of bits," now learned rather than authored, and aimed at learning. Keep concrete; don't explain embedding math or dimensionality. Differentiate from the neighbouring rungs: this is the spatial-representation idea (the mechanism that works), not correlation-not-cause (correlation) and not generalization (generalisation) — the limits that qualify it.`,
    seeds: {
      synthesis: `Puisque la machine excelle à manipuler des nombres, on lui donne prise sur le sens en représentant toute chose — un courriel, un visage, un mot, un client — par un vecteur, un point dans un espace de coordonnées. Cet espace est façonné pour que les objets semblables se rapprochent et que les dissemblables s'éloignent : la ressemblance devient une distance. Dès lors, « trouver du semblable », « regrouper », « recommander » se ramènent à de la géométrie, comme si l'espace lui-même portait la signification. C'est ici que se concrétise la portée entrevue quand on a choisi d'apprendre. On retrouve la représentation déjà croisée avec les interrupteurs — le sens comme convention posée sur les bits — mais désormais apprise plutôt qu'écrite, et vouée à l'apprentissage.`,
    },
  },
   {
    id: "correlation",
    category: "ml",
    tag: "corrélation",
    eyebrow: "Apprendre des données · des exemples aux relations",
    fragment: `Les exemples peuvent révéler des motifs — des relations : mêmes conditions, mêmes conclusions`,
    sub: `Les données pointent ce qui s'observe ensemble — les corrélations — pas directement si une observation en implique nécessairement une autre — la causalité. Les observations sont toujours parcellaires, elles peuvent dériver silencieusement et avec elles les modèles qui veulent les expliquer.`,
    anchor: `Models find correlations — what tends to occur with what — not reasons or causes. Prediction is not explanation: knowing two things move together does not tell you that one drives the other, or that a hidden third thing drives both. This is the "map is not the territory" idea (motifs) in its learning-section form — the model captures the shadow of the world, not its mechanism. Two compounding limits the room should feel: observations are always partial — a snapshot, never the whole — so the pattern is built on a fragment; and the world keeps moving, so patterns learned yesterday quietly go stale (drift), with no warning, and the models built to explain them drift with them. This is the same drift the perturbations rung told us to expect, now arriving inside the model itself. Keep concrete. Differentiate from neighbours: this rung is correlation-not-cause plus partiality and drift; the previous rung (representation) was the representation that works, and the next (generalisation) is guessing well on genuinely unseen cases.`,
    seeds: {
      synthesis: `Un modèle repère des corrélations — ce qui va souvent de pair — jamais des causes. Prédire n'est pas expliquer : savoir que deux grandeurs varient ensemble ne dit pas que l'une commande l'autre, ni qu'un troisième facteur, resté caché, les gouverne toutes deux. C'est ici la carte n'est pas le terrain : le modèle saisit l'ombre du monde, non son mécanisme. Deux limites se cumulent. Toute observation est partielle, un instantané, jamais le tout ; le motif se bâtit donc sur un fragment. Et le monde bouge : ce qui valait hier se périme sans prévenir — la dérive — et le modèle censé en rendre compte dérive avec lui.`,
    },
  },
  {
    id: "generalisation",
    category: "ml",
    tag: "généralisation",
    eyebrow: "Apprendre des données · prédire dans de nouvelles situations",
    fragment: `Apprendre, ce n'est pas mémoriser, c'est savoir se prononcer sur de nouveaux cas.`,
    sub: `Un programme ou modèle qui montre de bonnes capacités de prédiction pour des situations qu'il n'a pas observées, a pu saisir certaines relations ou mécanismes sous-jacents. En généralisant, il exploite sa connaissance acquise — sans garanties cependant.`,
    anchor: `Learning means guessing well on the unseen, not memorizing the examples: success is graded only on held-out cases the model never saw during training. A model that predicts well on genuinely new situations has plausibly captured some underlying relation or mechanism, not just stored the answers — that is what generalization is and why it is the real goal. But because the true future can never be tested, we can only ESTIMATE generalization with a proxy — a held-back test set — and must accept a residual error: the model will be wrong on some unseen cases, and honest practice prepares for that rather than hiding it. Two recurring shapes surface here so the rung isn't merely a warning: the test set is a MAP of future performance, not the territory, so it can be gamed exactly like any metric made a target (Goodhart, from algorithmes); and "expect to be wrong and build for it" is the perturbations posture applied to prediction. This is the honest core of the epistemic descent — real power that comes with a quantified, unavoidable error rate, and no guarantees. Differentiate from neighbours: the previous rung (correlation) was correlation and drift; this rung is the memorization-vs-generalization distinction and honest evaluation; the next (incertitude) is per-prediction confidence.`,
    seeds: {
      synthesis: `Apprendre, ce n'est pas retenir les exemples, mais bien deviner sur ce qu'on n'a jamais vu : la réussite ne se juge que sur des cas absents de l'entraînement. Un modèle qui prédit juste sur des situations nouvelles a vraisemblablement saisi une relation sous-jacente plutôt que rangé des réponses — c'est la généralisation, le but réel. Or l'avenir échappe à tout test : on ne peut que l'estimer par un jeu réservé, en acceptant une erreur résiduelle qu'on prépare au lieu de la masquer. Ce jeu dresse une carte des performances futures — la carte n'est pas le terrain — et, métrique érigée en cible, se laisse manipuler : la loi de Goodhart. Là est le cœur lucide de la descente : une puissance réelle, une erreur chiffrée, aucune garantie.`,
    },
  },
 {
    id: "incertitude",
    category: "ml",
    tag: "incertitude",
    eyebrow: "Prédire · quelle confiance dans les modèles appris ?",
    fragment: `Généraliser à des cas non-encore-observés ne peut conduire qu'à des conclusions incertaines.`,
    sub: `Une prédiction n'est raisonnablement exploitable que si elle est accompagnée du niveau de confiance — à évaluer — avec lequel elle a été produite. Il "se pourrait qu'il pleuve" et "il va pleuvoir" entraîneront vraisemblablement des décisions différentes.`,
    anchor: `A prediction without a calibrated sense of its own reliability is only half a prediction, because it invites equal trust in a near-certainty and a wild guess. A usable prediction comes with the confidence it was produced with, and that confidence must itself be honest (calibrated): of all the times the model says 70%, it should be right about seventy in a hundred. Knowing the uncertainty changes the decision — "it might rain" and "it will rain" lead to different choices; you act on the confident call and verify or hedge the shaky one. This is the constructive resolution of the whole epistemic descent: certainty, once lost, can at least be MEASURED and reported, which is what makes an approximate system safe to use rather than merely unreliable. It is also the bridge into the AI section: "probably rain" is the friendly face of "probably right" (probables), and honest confidence is exactly what lets the verifying step know where to look. Keep concrete. This rung quietly foreshadows the whole AI section's "probably right" theme.`,
    seeds: {
      synthesis: `Une prédiction sans mesure de sa fiabilité n'en est qu'une moitié : elle accorde autant de crédit à une quasi-certitude qu'à un coup de dé. Une prédiction utilisable s'accompagne du degré de confiance qui l'a produite, et ce degré doit être honnête, calibré : sur les fois où le modèle annonce 70 %, il devrait avoir raison soixante-dix fois sur cent. Connaître l'incertitude change la décision — « il pourrait pleuvoir » et « il va pleuvoir » n'appellent pas les mêmes gestes ; on suit l'annonce assurée, on vérifie ou l'on tempère l'annonce fragile. Là est la résolution constructive de la descente épistémique : la certitude perdue peut au moins être mesurée et déclarée, ce qui rend un système approché sûr d'emploi plutôt que peu fiable.`,
    },
  },
{
    id: "motsuivant",
    category: "ai",
    tag: "mot suivant",
    eyebrow: "Intelligence Artificielle · génération du mot suivant",
    fragment: `L'IA générative — de langage — poursuit un objectif simple : produire les "meilleurs" mots suivants`,
    sub: `Un programme ou modèle capable de "deviner" le mot suivant à partir de tout ce qu'il a ingurgité — grammaire, sémantique, faits historiques, techniques ou scientifiques — s'il le fait avec assez d'aisance, semble mettre en avant une forme d'intelligence, voire une capacité à "raisonner".`,
    anchor: `Large language models are trained on one embarrassingly simple task: given some text, predict the next word (token), across vast corpora. Keep the room-facing line deliberately deflationary — "it just predicts the next word" — because that honest deflation is what dissolves the magic and sets up the real surprise. But hold the balanced truth in reserve, to release as the listener pulls on it: done well enough, over enough of nearly everything — grammar, semantics, historical, technical and scientific facts — fluency at next-word prediction yields grammar, facts, style and something like reasoning as side effects nobody hand-coded. This is the composition theme (opérations, abstractions) reaching its strangest form — the capability is really "just" composed next-word prediction, AND the composition yields functional behaviour no one explicitly built or can fully enumerate. Both halves are true; resist collapsing to either "mere autocomplete" or "mysterious mind." The twist that matters for the rest of the deck: the training data becomes part of the "codebase" — behaviour is shaped by whatever it read — so this is the learning paradigm's data-as-program tradeoff (apprendre) at full scale, and control over output quality becomes probabilistic and harder to guarantee than ordinary code. Keep concrete. Differentiate from the next rungs: this is the task plus emergent abilities plus data-as-codebase; scale and hardware (taille), economics (couts), and the probabilistic-layer shift (probables) come after.`,
    seeds: {
      synthesis: `Un grand modèle de langue s'entraîne sur une tâche d'une simplicité déconcertante : à partir d'un fragment de texte, prédire le token suivant, sur des corpus immenses. Gardons la formule modeste — « il ne fait que prédire le mot d'après » —, car c'est elle qui rend la suite étonnante. Menée assez bien, sur presque tout, cette prédiction fait émerger la grammaire, les faits, le style et quelque chose qui ressemble au raisonnement — autant d'effets que personne n'a codés. Les deux moitiés tiennent ensemble : rien qu'une prédiction composée, et pourtant un comportement que nul n'a écrit ni ne saurait énumérer. Ici, les données deviennent le programme : ce que le modèle a lu façonne sa conduite, et la qualité devient probabiliste, plus difficile à garantir qu'un code ordinaire.`,
    },
  },
  {
    id: "taille",
    category: "ai",
    tag: "taille",
    eyebrow: "Intelligence Artificielle · la taille compte, les ressources aussi",
    fragment: `Augmenter la taille du modèle améliore notablement ses capacités — et les coûts d'infrastructure`,
    sub: `Les modèles de langage modernes sont faits de milliards de paramètres — boutons — ajustés pour améliorer progressivement la capacité à prédire le suivant, pour des milliers de milliards d'exemples. Cette phase d'ajustement repose sur un volume colossal d'opérations arithmétiques.`,
    anchor: `The next-word trick only produces its magic at enormous scale: modern models carry hundreds of billions of adjustable parameters ("knobs"), tuned to improve next-word prediction over trillions of examples. That tuning rests on a colossal volume of arithmetic, enabled by hardware (GPUs, built for massive parallel arithmetic) and software (frameworks that parallelize and optimize it) — the AI boom is, underneath, the memory-and-arithmetic story from the earlier rungs (memoire, algorithmes) at civilizational scale, which is why "size counts, and so do the resources." Past certain scales, new abilities appear as if from nowhere (emergence). Keep "as if from nowhere" for the room — it is the honest felt experience — but hold the hedge in the anchor and let it out as a thread: the abilities are not truly acausal; they are the map emerging from composition faster than we can author or even perceive it. We built the rule-driven, composed machinery, but the resulting behaviour is no longer something we wrote down or can fully trace — which is precisely why it can look like magic while remaining, mechanically, just composition. (Note too that some "emergence" is partly a measurement artifact — a sharp metric on a smooth underlying trend — a live instance of "the map is not the territory," best offered as a thread than a cold-open claim.) Keep the room-facing version concrete. Differentiate from neighbours: the previous rung (motsuivant) was the task; this rung is why scale + GPUs and the emergence it produces; the next (couts) is train-once economics.`,
    seeds: {
      synthesis: `Le tour de la prédiction du mot suivant ne déploie ses effets qu'à très grande échelle : les modèles récents portent des centaines de milliards de paramètres ajustables, réglés sur des milliers de milliards d'exemples pour affiner cette seule prédiction. Derrière ce réglage, une quantité vertigineuse d'arithmétique, que rendent possible un matériel taillé pour le calcul massivement parallèle et des logiciels qui l'optimisent : au fond, c'est l'histoire de la mémoire et des algorithmes reprise à l'échelle d'une civilisation. Passé certains seuils, des capacités surgissent comme de nulle part — l'émergence. Rien d'acausal pourtant : la carte se dessine par composition plus vite qu'on ne sait l'écrire ou même la percevoir. Nous avons bâti la mécanique ; son comportement, lui, nous échappe.`,
    },
  },
{
    id: "couts",
    category: "ai",
    tag: "coûts et usage",
    eyebrow: "Intelligence Artificielle · entraînement et usage",
    fragment: `Il y existe une asymétrie forte entre la phase d'entraînement et celle d'utilisation`,
    sub: `Une fois le modèle entraîné — une tâche hautement parallélisable mais très lourde — le coût d'usage est bien plus limité. Par contre, la phase de génération est séquentielle par nature — mettant la disponibilité et le débit des ressources de calcul à l'épreuve.`,
    anchor: `The economics flip, framed as a strong asymmetry between two phases. TRAINING is heavy but massively parallelizable: an enormous, one-time cost you can throw hardware at, because the arithmetic can be spread across many processors at once; you pay it once and freeze the result. USE (inference / generation) is comparatively light per call, but sequential by nature — a language model produces one token, then the next, each depending on the last, so it cannot be parallelized away the same manner. The pressure therefore moves from raw compute to latency, throughput and availability: serving many users fast is a data-movement-and-scheduling problem, not a training problem. Be careful not to blur these two — training is parallel-and-heavy, inference is sequential-and-light. This is the arbitre rung's "one machine shared among many" at another level: one general capability, trained on no task in particular, frozen, then amortized across thousands of specific jobs for a tiny cost each. It also names the frontier the final rungs depend on: the shift from answering (produce text) to acting (call tools, take steps, pursue goals) — agents — set up here and made concrete at the closing rung. Keep concrete. Differentiate from neighbours: the previous rung (taille) was scale and hardware; this rung is the cost asymmetry and the turn toward acting; probables is what that does to trust, and agents is what it looks like when it acts.`,
    seeds: {
      synthesis: `L'économie s'inverse. L'entraînement est lourd mais massivement parallélisable : un coût unique et colossal qu'on peut confier à des milliers de processeurs travaillant de front, payé une fois puis figé. L'usage, lui, reste léger à chaque appel, mais séquentiel par nature — le modèle produit un token, puis le suivant, chacun dépendant du précédent, sans qu'aucun parallélisme ne l'abrège. La contrainte se déplace donc du calcul brut vers la latence, le débit et la disponibilité : servir rapidement une multitude d'utilisateurs relève de l'ordonnancement et du transport des données. Une même capacité générale, sans spécialité propre, s'amortit ensuite sur des milliers d'usages pour presque rien. Et ici s'amorce le passage de répondre à agir.`,
    },
  },

  {
    id: "probables",
    category: "ai",
    tag: "opérations probables",
    eyebrow: "Traducteur probabiliste · d'un contexte à une réalisation",
    fragment: `L'IA générative est la couche supérieure de la pile d'abstractions — une couche non déterministe`,
    sub: `Plutôt que de composer des opérations élémentaires de façon stricte et déterministe : on spécifie un contexte et on laisse le modèle produire une réponse — statistique et dépendante des données injectées. La portée et la complexité des productions augmente, leur contrôle a priori se complique.`,
    anchor: `The payoff rung, where the deck's two ladders meet — and where generative AI is named as the top, NON-DETERMINISTIC layer of the abstraction stack. Every previous layer was a deterministic, inspectable translation between levels — a compiler is right, or it is a compiler bug. This layer makes the translation statistical: instead of strictly composing elementary operations, you specify a context and let the model produce a response that is statistical and dependent on the data it was trained on and the data you inject. State this as a genuine BARGAIN with two real sides, not a warning — it is the balanced counterpart to motsuivant's deflation. What is gained is not trivial: natural language is richer than code, so a statistical layer can attempt things no one could ever specify exactly — the reach and complexity of what can be produced genuinely grows, and that reach is real, not hype. What is spent is control and certainty: the same richness is vaguer than code (which is exactly why programming languages were invented — automation now walks that back), a priori control over the output becomes hard, and the layer fails quietly and fluently — confident, well-formed, wrong. This is the epistemic ladder, held latent at motifs, reaching its floor: we have climbed to the top in reach and, in the same motion, descended to "probably" in certainty. What is genuinely new: for the first time the layer you trust does not promise to be right, only probably right — so the human verifying step, which deterministic layers let us safely automate away, must be kept. This very deck runs on such a layer; the lecturer on stage is the verifying step. Set up the final rung: this trade gets sharper the moment the probably-right layer stops merely answering and starts acting (agents).`,
    seeds: {
      synthesis: `Nous voici au sommet de la pile d'abstractions, et cette couche n'est plus déterministe. Jusqu'ici, chaque niveau traduisait le précédent de façon exacte et inspectable ; désormais la traduction devient statistique : au lieu de composer des opérations élémentaires, on précise un contexte et le modèle produit une réponse façonnée par ses données d'entraînement et par celles qu'on lui injecte. C'est un vrai compromis. Ce qu'on gagne est réel : la langue naturelle, plus riche que le code, permet de tenter ce que nul ne saurait spécifier exactement, et la portée s'élargit. Ce qu'on paie, c'est la maîtrise et la certitude ; la couche échoue sans bruit — fluide, assurée, et fausse. Pour la première fois, ce à quoi l'on se fie ne promet plus d'avoir raison, seulement probablement — d'où la vérification humaine, qu'il faut maintenir.`,
    },
  },
{
    id: "agents",
    category: "ai",
    tag: "agents",
    eyebrow: "IA agentique · capacité d'agir et d'itérer",
    fragment: `Autoriser les productions des modèles de langage à générer des actions — on augmente encore leur portée`,
    sub: `Donner à un système de production de raisonnements — probabilistes — la capacité de percevoir son environnement, d'exécuter des actions et d'itérer — il pourra réaliser des tâches complexes, séquencées. Attention, la portée des conséquences de ses actions augmente de pair.`,
    anchor: `The closing rung, but an OPENING rather than an analytical closure: not a new mechanism, an instantiation that puts the whole deck's conclusions under strain and makes the stakes concrete. An agent is a probabilistic reasoning system given the ability to perceive its environment, take actions and iterate — reading, calling tools, deciding, acting over many steps — instead of returning one answer, so it can carry out complex, sequenced tasks. This is where the abstract "probably right" (probables) acquires teeth: a wrong answer you read and discard; a wrong ACTION executes, and across a chain of steps small probabilistic errors compound into outcomes no single step intended, while the reach of the consequences grows in step with the reach of the capability. Pull the deck's threads together here rather than introducing new theory — each earlier rung reappears with consequences: drift and correlation-not-cause (correlation) mean the plan can be confidently built on a stale or spurious pattern; leaky abstractions (assemblages) mean a borrowed tool behaves in ways the model didn't foresee; the map-is-not-the-territory gap between the stated goal and the real want (a spec is not the need, motifs) is now optimized against at machine speed — Goodhart with a motor; and "understand one layer below / build for perturbations / keep the verifying step" stop being craftsmanship and become the load-bearing safeguards of a system that acts on probability. Frame agents as the honest reason all this literacy matters now: the least-certain layer we have built is being handed the most capacity to act, so the verifying step — human judgment placed where the guarantee used to be — is the live problem, not a footnote. This is an opener, not a survey: agentic AI is its own large subject; the rung's job is to make the stakes vivid and point the audience toward it, closing the climb on why understanding the whole ladder is what lets you place that verifying step well. Keep concrete; resist turning it into a taxonomy of agent architectures.`,
    seeds: {
      synthesis: `Cette dernière marche ouvre plus qu'elle ne conclut : l'agent instancie tout le reste. C'est un système de raisonnement probabiliste qui, au lieu de rendre une seule réponse, perçoit, appelle des outils et recommence d'étape en étape. Le « probablement juste » y prend du mordant : une réponse fausse, on l'écarte ; une action fausse s'exécute, et de petites erreurs se composent en résultats que nulle étape n'a voulus, leur portée suivant celle de la capacité. Tout revient — la dérive, la corrélation prise pour la cause, l'écart entre le but énoncé et le besoin —, désormais optimisé à la vitesse de la machine : la loi de Goodhart, avec un moteur. On confie à la couche la moins certaine le plus de pouvoir d'agir, et la vérification humaine devient le problème vivant.`,
    },
  },
];

/* ------------------------------------------------------------
   PROBES (ACTIONS) — chaque entrée est un gabarit de prompt.
   Ajouter, réordonner, reformuler librement.
   ------------------------------------------------------------ */
export const ACTIONS = [
  {
    id: "more",
    label: "En savoir plus",
    task: "Deepen the idea one level: reveal the mechanism behind the fragment, still fully graspable by a lay listener.",
  },
  {
    id: "example",
    label: "Un exemple",
    task: "Give ONE concrete, everyday example that instantiates the fragment — a small scenario or story, not a definition.",
  },
  {
    id: "synthesis",
    label: "Résumé technique",
    task: "State the fragment's content precisely and comprehensively: a compact technical synthesis in correct domain terminology, staying close to the intended meaning, for a scientifically literate reader.",
  },
  {
    id: "differently",
    label: "Autre perspective",
    task: "Re-explain the fragment through a completely different analogy or register than anything used before. Surprise, but stay strictly accurate.",
  },
  {
    id: "risk",
    label: "Difficultés ?",
    task: "Give a synthetic description of the limitations (with respect to issues / questions of computer science or data science) that derive from this idea or the risks that stem from it.",
  },
  {
    id: "bite",
    label: "Une surprise ?",
    task: "Show where this idea bites in the real world: one concrete failure, cost or consequence of ignoring it.",
  },
  {
    // Cross-probe: buildPrompt feeds this probe the slide's technical synthesis
    // as context, and asks for a few deeper "threads" to pull.
    id: "threads",
    label: "Dérouler un fil",
    task: "From the technical synthesis, surface a few concrete 'threads' — specific concepts, mechanisms, terms or open questions — that a curious, technically-minded listener could pull to go one level deeper.",
  },
];