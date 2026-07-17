/* ============================================================
   CONTENU DE L'ÉCHELLE (FR) — la couche éditable, séparée du composant.
   Traduction de ladderContent.js. Édite CE fichier pour composer le
   cours ; LectureLadderFr.jsx affiche ce qu'il y trouve.

   UNE DIAPOSITIVE :
     id        clé unique, stable (usage interne + clés de cache)
     tag       étiquette courte du rail de gauche, ex. « interrupteurs »
     eyebrow   surtitre au-dessus du fragment (« Section · concept »)
     fragment  le titre que voit la salle
     sub       sous-texte d'une ligne sous le fragment
     anchor    vérité de référence : sens voulu + limites. Seul le modèle
               la voit ; elle contraint toute génération en direct.
     seeds     réponses pré-calculées par sonde. seeds[idSonde] est SOIT
               une chaîne SOIT un tableau de chaînes (alternatives que l'on
               peut faire défiler). Une sonde absente part directement en
               direct au premier clic. « threads » est une liste, un fil
               par ligne, rendue en pastilles cliquables.

   Les champs de prose utilisent des accents graves : accents, tirets et
   apostrophes n'ont pas besoin d'échappement.

   UNE SONDE (ACTIONS) : { id, label (texte du bouton), task (l'instruction
   insérée dans le prompt) }. L'ordre est une donnée : réordonne / ajoute /
   retire des diapositives en éditant le tableau. Le rail se lit de bas en
   haut — SLIDES[0] est la base de l'ascension.
   ============================================================ */

export const SLIDES = [
  /* ---------- RACINE ---------- */
  {
    id: "root",
    tag: "l'ascension",
    eyebrow: "Racine · pourquoi nous sommes là",
    fragment: `Comment fonctionnent les ordinateurs et les données — une ascension, des interrupteurs jusqu'à l'IA.`,
    sub: `Pourquoi s'y intéresser ? On ne peut pas juger ce que l'IA d'aujourd'hui sait et ne sait pas faire sans cela — et chaque barreau repose sur celui du dessous.`,
    anchor: `Le cadre d'ouverture et la motivation de tout le cours : on ne peut pas juger équitablement les pouvoirs et les limites de l'IA moderne sans une compréhension pratique de la façon dont les ordinateurs calculent et dont les données sont utilisées. Propose trois angles interchangeables sur le même domaine — (1) l'information devient réelle en gravissant des couches, l'électricité en bas, le sens en haut ; (2) l'informatique, c'est transformer des représentations de l'information sous contrainte de ressources ; (3) une ascension, des interrupteurs physiques jusqu'à l'IA, chaque barreau bâti sur celui du dessous et utilisable sans comprendre le bas. Reste à cette altitude de cadrage : nomme le voyage, ne descends dans aucun barreau en particulier.`,
    seeds: {
      threads: `Couches d'abstraction — pourquoi chaque niveau peut ignorer sans risque le désordre du dessous, jusqu'à ce qu'il ne le puisse plus.
Représentation — comment les mêmes bits deviennent un nombre, un mot ou une couleur.
Coût en ressources — pourquoi le temps, la mémoire et l'énergie décident du possible, pas seulement de l'imaginable.
La pile comme histoire — l'assembleur a fait confiance au code machine, le C à l'assembleur ; l'IA est le prochain barreau.`,
      synthesis: `Le domaine repose sur trois invariants. Représentation : encoder un aspect du monde en symboles — au fond, des motifs de bits sous des conventions admises. Calcul : transformer ces symboles par des étapes mécaniques, régies par des règles, dénuées de sens intrinsèque. Ressources : chaque transformation se paie en temps, mémoire, énergie et communication, et ces coûts décident du faisable. Structurellement, un ordinateur est une hiérarchie de couches d'abstraction, chacune traduisant celle du dessus — historiquement déterministe et inspectable — du substrat physique jusqu'à l'intention humaine. Ce cours gravit cette hiérarchie ; comprendre l'IA moderne, c'est la situer comme la couche du sommet actuelle, non comme une rupture.`,
      more: [
        `Imagine l'ensemble comme une pile. Tout en bas, de l'électricité brute — des tensions dans des fils. Tout en haut, du sens — une phrase que tu comprends, une décision que tu poses. Entre les deux, chaque couche transforme celle du dessous en quelque chose d'un peu plus humain : les interrupteurs deviennent des nombres, les nombres des instructions, les instructions des programmes, les programmes l'application dans ta main. Rien n'est magique dans la pile ; chaque étage masque simplement le désordre de celui d'en dessous. L'ascension de l'étincelle jusqu'au sens, voilà tout le sujet des vingt prochaines minutes.`,
        `Réduis le domaine à trois mots. Représentation : fixer une tranche du monde sous forme de symboles — une photo en nombres, un contrat en texte. Calcul : pousser ces symboles à travers des règles mécaniques qui ne les comprennent pas, se contentent de les suivre. Ressources : rien n'est gratuit — chaque étape coûte du temps, de la mémoire, de l'énergie, de l'argent et de l'attention humaine. L'informatique, le logiciel et la science des données ne sont que ces trois mots, joués à une échelle vertigineuse. Garde-les en tête, et la tempête d'acronymes cesse d'importer.`,
        `C'est une échelle, et on la lit de bas en haut. Le barreau le plus bas est un interrupteur, allumé ou éteint. Le plus haut est une IA qui écrit et raisonne. Chaque barreau est entièrement bâti sur ceux d'en dessous — et, surtout, on peut se tenir sur un barreau haut sans comprendre les bas, comme on conduit sans connaître les moteurs. On monte lentement, à dessein : le temps d'atteindre l'IA, elle devrait ressembler moins à de la sorcellerie qu'au dernier étage d'un immeuble qu'on a vu se construire.`,
      ],
      example: `Dis « mets un minuteur de dix minutes » à une enceinte posée sur ton plan de travail. Ta voix — de la pression d'air — devient des nombres (interrupteurs). Ces nombres traversent des milliards de petites étapes (calcul), en s'appuyant sur des données bien plus grandes que le petit appareil (mémoire et réseau). Un modèle entraîné sur des océans de parole devine tes mots (données, puis IA). Dix secondes, une phrase — et l'appareil a discrètement touché chaque barreau de l'échelle qu'on s'apprête à gravir.`,
    },
  },

  /* ---------- LA MACHINE ---------- */
  {
    id: "switches",
    tag: "interrupteurs",
    eyebrow: "La machine · les bits",
    fragment: `Tout n'est qu'interrupteurs.`,
    sub: `Allumé ou éteint, 1 ou 0 — chaque nombre, lettre, texte et image n'est qu'un immense tas de allumé/éteint, habillé.`,
    anchor: `Des milliards de transistors agissant comme des interrupteurs extrêmement rapides, sans pièces mobiles. Deux états convenus suffisent à encoder n'importe quel nombre, lettre, image ou son, parce que les bits se composent. Il n'y a ni image ni chanson dans la machine — seulement des motifs de bits et des conventions pour les lire. Reste classique ; pas de détour par l'informatique quantique. Distingue du barreau suivant : cette diapositive porte sur la représentation (monde → bits), pas sur ce que le processeur fait de ces bits.`,
    seeds: {
      threads: `Schémas d'encodage — les codes convenus (ASCII, Unicode) qui transforment des motifs de bits en lettres.
Complément à deux — la convention astucieuse pour stocker les nombres négatifs en bits.
Virgule flottante — comment un budget fixe de bits approxime les nombres réels, et où il dérape.
Portes logiques — comment de simples interrupteurs se combinent en ET/OU, puis en arithmétique.`,
      synthesis: `À la base se trouvent des transistors fonctionnant comme des interrupteurs commandés en tension, sans pièces mobiles, chacun se résolvant en l'un de deux états, 0 ou 1 — un bit. Les bits se composent : des groupes de taille fixe forment des octets et des mots machine, et des encodages convenus les projettent sur tout type de donnée — entiers en complément à deux, réels en virgule flottante, texte Unicode, pixels RVB, audio échantillonné. Le matériel ne porte aucune sémantique ; un motif de bits ne signifie rien tant qu'une convention d'interprétation n'est pas imposée, si bien que les mêmes bits désignent un nombre, un glyphe ou une couleur selon le seul code appliqué. La représentation est donc une convention en couches, pas une propriété physique du substrat.`,
      more: `Un transistor est un interrupteur sans pièce mobile : une tension sur un fil décide si le courant peut passer dans un autre. Voilà toute l'astuce. Ton téléphone en contient des dizaines de milliards, chacun capable de basculer des milliards de fois par seconde. Deux niveaux de tension convenus deviennent 0 et 1 ; huit de ces bits font un octet ; quelques millions d'octets font une photo. La machine ne stocke jamais une image — seulement des motifs de bits, plus un décodeur sur lequel tout le monde s'est accordé.`,
      example: `Appuie sur la lettre A et ton clavier envoie 01000001 — pure convention fixée il y a des décennies. L'écran qui affiche ce A contient des millions de pixels, chacun juste trois nombres pour le rouge, le vert et le bleu. Une chanson, ce sont des milliers de nombres par seconde décrivant la pression de l'air. Texte, image, son — des mondes différents, un seul substrat : des tas de allumé/éteint, lus à travers la bonne convention.`,
    },
  },
  {
    id: "steps",
    tag: "petits pas",
    eyebrow: "La machine · le processeur",
    fragment: `Le processeur ne fait que de minuscules étapes bêtes — à une vitesse folle.`,
    sub: `Déplacer, copier, additionner, comparer — des milliards par seconde. Le calcul, ce sont des symboles poussés par des règles mécaniques, sans magie.`,
    anchor: `Un processeur n'exécute que des opérations triviales : arithmétique, comparaison, déplacement de données, saut vers une autre instruction. Rien de ce qu'il fait n'est individuellement astucieux ; l'intelligence apparente est de la composition à grande échelle. Il est déterministe — mêmes entrées, mêmes étapes, même résultat, à chaque fois. Insiste sur le caractère « sans magie, mécanique, foudroyant de vitesse ». Distingue du barreau des algorithmes plus loin : cette diapositive porte sur le vocabulaire bête-mais-rapide du processeur et le déterminisme, PAS sur les recettes astucieuses ni sur la façon dont le coût grandit.`,
    seeds: {
      threads: `Chargement–décodage–exécution — la boucle-battement de cœur que tout processeur répète des milliards de fois par seconde.
Jeu d'instructions (ISA) — le petit vocabulaire fixe d'opérations qu'une puce comprend réellement.
Pipeline — recouvrir les étapes pour avoir plusieurs instructions en vol à la fois.
Déterminisme — pourquoi des entrées identiques donnent toujours des sorties identiques, et pourquoi cette garantie compte.`,
      synthesis: `Le processeur exécute le cycle chargement–décodage–exécution : il lit une instruction, l'exécute, puis avance, en boucle. Son jeu d'instructions est délibérément primitif — arithmétique entière et logique, comparaisons, chargements et écritures entre registres et mémoire, branchements conditionnels — et il est déterministe : des entrées identiques produisent des sorties identiques. L'intelligence apparente ne réside dans aucune instruction, mais dans la composition : des millions de ces primitives enchaînées et cadencées à des milliards de cycles par seconde. Voilà le sens concret du calcul comme manipulation mécanique de symboles — aucune étape ne comprend quoi que ce soit, et pourtant des séquences empilées d'opérations triviales et fiables réalisent un comportement arbitrairement complexe.`,
      more: `Toute la journée d'un processeur est une boucle : charger l'instruction suivante, l'exécuter, recommencer — où « l'exécuter » veut dire additionner deux nombres, les comparer, en copier un ailleurs, ou sauter à une autre instruction. C'est à peu près tout le vocabulaire. Il n'improvise jamais et ne comprend jamais ; donne-lui les mêmes entrées et il produit le même résultat, indéfiniment. Ce qui ressemble à de l'astuce — un correcteur orthographique, un filtre pour visage — n'est que des millions de ces riens empilés les uns sur les autres. Déterministe, bête et foudroyant de vitesse : cette combinaison, c'est tout le moteur.`,
      example: `Regarde comment il « lit » la phrase sous tes yeux. Il ne la lit pas. Il compare le nombre de ta touche à une table, copie à l'écran une forme correspondante, passe à l'emplacement suivant, compare encore — des milliers de fois avant que tu le remarques. Aucune étape ne sait ce qu'est un mot. Aligne assez de ces comparaisons-copies aveugles, assez vite, et un document semble couler sous tes doigts. L'intelligence est entièrement dans l'empilement, jamais dans l'étape.`,
    },
  },
  {
    id: "os",
    tag: "l'OS",
    eyebrow: "La machine · l'arbitre",
    fragment: `Une seule machine, partagée entre beaucoup.`,
    sub: `Le système d'exploitation rationne le processeur et la mémoire si vite que tes dizaines de programmes semblent tourner tous en même temps.`,
    anchor: `Le système d'exploitation est l'arbitre partagé : il distribue le processeur, la mémoire et les fichiers entre de nombreux programmes, basculant de l'un à l'autre des milliers de fois par seconde pour que les tâches paraissent simultanées, même sur quelques cœurs. Il les isole aussi — chaque programme a sa propre parcelle de mémoire et ne peut pas piétiner celle d'un autre — si bien qu'un plantage ne fait pas tomber la machine. Note le « la plupart du temps » : sous forte charge, l'illusion se fissure et ça saccade. Reste concret ; pas d'algorithmes d'ordonnancement ni d'internes du noyau.`,
    seeds: {
      threads: `Ordonnancement préemptif — comment l'OS découpe le temps processeur pour simuler le tout-en-même-temps.
Mémoire virtuelle — donner à chaque programme son propre espace d'adressage privé et protégé.
Changement de contexte — le coût réel de mettre un programme en pause pour en lancer un autre.
Appels système — la porte gardée par laquelle un programme demande le matériel à l'OS.`,
      synthesis: `Le système d'exploitation multiplexe un matériel fini entre de nombreux programmes. Dans le temps, un ordonnanceur préemptif découpe le processeur et fait tourner les processus via des changements de contexte assez rapides pour créer une illusion de simultanéité ; dans l'espace, la mémoire virtuelle accorde à chaque processus un espace d'adressage isolé, contenant les fautes. Il médie aussi l'accès aux périphériques et fichiers derrière des appels système uniformes. La concurrence n'est une illusion que tant que la machine n'est pas saturée — sous contention, la latence d'ordonnancement resurgit en saccades. Le multiplexage équitable de ressources rares et l'isolation entre processus, réalisés de façon invisible, sont ses responsabilités définitoires.`,
      more: `Un ordinateur n'a souvent qu'une poignée de cœurs, et pourtant il fait tourner des centaines de programmes. Le système d'exploitation est l'arbitre qui rend cela possible : il donne à chaque programme une infime tranche de processeur, le gèle, passe le processeur au suivant, et boucle si vite — des milliers de bascules par seconde — que tout paraît simultané. Il dresse aussi des murs : chaque programme a sa propre parcelle de mémoire et ne peut gribouiller sur celle des autres, si bien qu'un plantage ne coule pas le navire. Partager et isoler, invisiblement, voilà tout son métier.`,
      example: `En ce moment, ton téléphone joue une chanson, tient l'horloge, guette les messages et baisse la luminosité — apparemment tout à la fois. C'est faux. Un unique arbitre découpe le temps entre eux plus vite que tu ne peux le percevoir. Tu ne sens l'astuce que lorsqu'elle force : ouvre trop d'applis lourdes et tout saccade, la musique hoquette, la roue apparaît. Ce hoquet, c'est le « tout à la fois » qui échoue brièvement — l'arbitre s'est simplement retrouvé à court de tranches à distribuer.`,
    },
  },
  {
    id: "memory",
    tag: "mémoire",
    eyebrow: "La machine · la mémoire",
    fragment: `Le lent, c'est d'aller chercher — pas de penser.`,
    sub: `La mémoire rapide est petite et proche ; la grande mémoire est loin et lente. La vitesse, c'est surtout garder les données près.`,
    anchor: `La mémoire est une hiérarchie, du petit-rapide (caches sur la puce) au grand-lent (disque, réseau). Amener les données jusqu'au processeur coûte en général bien plus que le calcul lui-même. C'est pourquoi la mise en cache, la localité et le « ne pas refaire le travail » dominent la performance, et pourquoi alimenter les GPU compte autant que leur arithmétique. Note que c'est en soi un compromis (petit-rapide contre grand-lent) — une préfiguration du barreau des idées récurrentes. Reste concret ; il s'agit du coût du déplacement des données, pas des algorithmes.`,
    seeds: {
      threads: `Niveaux de cache (L1/L2/L3) — les mémoires minuscules et rapides collées juste à côté des cœurs.
Localité — pourquoi des données utilisées ensemble devraient vivre ensemble, dans le temps et dans l'espace.
Le mur mémoire — comment les processeurs ont distancé la vitesse de la mémoire, et ce qu'on y a fait.
Préchargement — le matériel qui devine ce dont tu auras besoin ensuite et va le chercher d'avance.`,
      synthesis: `La mémoire forme une hiérarchie qui échange la latence contre la capacité : registres et caches L1/L2/L3 (nanosecondes, kilo-octets à méga-octets), DRAM principale (dizaines de nanosecondes), puis SSD, disque et réseau (microsecondes à millisecondes et au-delà). La latence d'accès croît de plusieurs ordres de grandeur en descendant la hiérarchie ; pour la plupart des charges, c'est donc le déplacement des données, non l'arithmétique, qui domine le coût — le « mur mémoire ». La performance dépend alors de la localité, temporelle et spatiale, et de la mise en cache : garder les données bientôt utiles dans les niveaux rapides et petits. C'est un compromis direct capacité contre vitesse, et c'est pourquoi alimenter les unités de calcul — garder les GPU approvisionnés — compte souvent plus que le débit arithmétique brut.`,
      more: `Un processeur additionne des nombres en moins d'une nanoseconde, mais aller chercher une valeur en mémoire principale peut coûter des centaines de fois cela — depuis le disque ou le réseau, des millions de fois. Les puces embarquent donc des caches : de minuscules mémoires coûteuses collées près des cœurs, gardant tout ce qui a été touché récemment. L'essentiel de l'optimisation consiste à agencer le travail pour que la donnée nécessaire soit déjà proche — et la plupart des mystères « pourquoi c'est lent ? » se terminent sur un accès mémoire, pas sur un calcul.`,
      example: `Imagine un cuisinier dont la cuisinière est à un pas mais dont le garde-manger est à l'autre bout de la ville. La cuisson n'a jamais été le problème. Cas réel : un programme qui lit une énorme table ligne par ligne peut tourner cinquante fois plus vite qu'un autre qui saute de colonne en colonne — arithmétique identique, résultat identique. Le rapide se contente d'attraper des voisins déjà installés dans le cache.`,
    },
  },

  /* ---------- INSTRUIRE LA MACHINE ---------- */
  {
    id: "code",
    tag: "code",
    eyebrow: "Instruire · le langage",
    fragment: `Le code, ce sont des étapes machine écrites en mots.`,
    sub: `Une chaîne de traduction : un langage lisible par l'humain, broyé jusqu'aux minuscules opérations que le processeur exécute vraiment.`,
    anchor: `Les langages de programmation permettent d'écrire des instructions dans quelque chose de proche des mots ; un traducteur (compilateur ou interpréteur) le broie, couche après couche, jusqu'aux minuscules opérations du processeur. Les langages de haut niveau sont plus expressifs et plus indulgents mais plus loin du métal ; ceux de bas niveau donnent plus de contrôle et plus de douleur — un compromis. Point clé : la machine n'exécute jamais que de minuscules étapes ; le code est une surface à forme humaine posée dessus, traduite mécaniquement. Rien de nouveau n'arrive dans la machine. Reste concret ; pas de détour par la syntaxe ni un langage précis. Distingue du barreau des algorithmes : ici il s'agit de traduction (mots → étapes), pas de l'astuce ni du coût de la recette.`,
    seeds: {
      threads: `Compilateur vs interpréteur — traduire tout le programme d'avance, ou ligne par ligne à l'exécution.
Niveaux de langage — de l'assembleur près du métal à Python près de l'anglais courant.
Types — des étiquettes sur les données qui laissent le langage attraper les erreurs avant l'exécution.
La chaîne d'outils — le pipeline qui transforme ton texte source en quelque chose d'exécutable.`,
      synthesis: `Un langage de programmation est une notation à destination humaine pour des instructions qu'un compilateur ou un interpréteur traduit, par étapes intermédiaires, vers le jeu d'instructions du processeur. Les langages se placent sur leur propre gradient d'abstraction : les langages de haut niveau maximisent l'expressivité et la sûreté en masquant le détail machine ; ceux de bas niveau exposent le contrôle et le coût au prix de l'effort — un compromis récurrent expressivité contre contrôle. L'essentiel : aucune capacité nouvelle n'apparaît dans le matériel ; une seule construction de haut niveau se déploie en une longue séquence exacte d'instructions primitives. C'est la chaîne d'outils qui réalise et optimise cette traduction qui permet de programmer sans écrire de code machine.`,
      more: `Le processeur ne parle qu'en minuscules opérations numérotées, pénibles à écrire pour un humain. On écrit donc dans quelque chose de plus proche du français — « si le panier est vide, cache le bouton de paiement » — et un programme traducteur le broie, étape par étape, dans le dialecte de la machine. Les langages ont leur propre échelle : ceux proches du français sont rapides à écrire et indulgents ; ceux près du métal donnent le contrôle total et punissent le moindre faux pas. Dans les deux cas, rien de nouveau n'arrive dans la machine — des mots entrent, les mêmes minuscules étapes sortent.`,
      example: `Tu tapes une seule instruction : « trie ces mille noms par ordre alphabétique ». Pour toi, trois mots. Pour la machine, « trier » n'existe pas — le traducteur le déploie en des milliers d'opérations individuelles : compare ces deux-là, échange si besoin, passe au suivant. Le seul verbe amical que tu as écrit devient une longue séquence bête et exacte que le processeur peut réellement exécuter. Cet écart — un mot humain, mille étapes mécaniques — est précisément ce que tout langage de programmation existe pour combler.`,
    },
  },
  {
    id: "algorithms",
    tag: "algorithmes",
    eyebrow: "Instruire · l'efficacité",
    fragment: `Un algorithme est une recette — et c'est sa montée en charge qui compte.`,
    sub: `Même résultat, coût radicalement différent. Ne refais pas le travail, mesure avant d'optimiser, et méfie-toi de la métrique que tu poursuis.`,
    anchor: `Un algorithme est une recette précise : une liste finie d'étapes qui résout un problème. Bien des recettes donnent la même réponse à des coûts radicalement différents ; ce qui compte, c'est la façon dont le coût GRANDIT quand l'entrée grandit, car cela décide du faisable tout court. Intègre la sagesse de performance regroupée ici : ne refais pas le travail (mets en cache et réutilise), mesure avant d'optimiser (l'intuition sur ce qui est lent a généralement tort), et méfie-toi qu'une métrique se fait détourner dès qu'elle devient la cible. Distingue du barreau du processeur : là, les étapes étaient bêtes ; ici, l'astuce est dans leur ordre, et la montée en charge est la vedette.`,
    seeds: {
      threads: `Notation grand-O (Big-O) — le raccourci pour dire comment le coût grandit quand l'entrée grossit.
Structures de données — comment l'agencement (liste, table de hachage, arbre) décide de ce qui est rapide.
Mémoïsation — ne jamais recalculer deux fois la même réponse en en gardant une copie.
Loi de Goodhart — pourquoi une métrique qu'on optimise à fond finit par se faire détourner.`,
      synthesis: `Un algorithme est une procédure finie et non ambiguë qui associe une entrée à une sortie ; un même problème admet généralement de nombreux algorithmes de coûts très différents. La faisabilité est décidée par la complexité asymptotique — la façon dont le temps d'exécution et la mémoire croissent avec la taille n de l'entrée, capturée par la notation grand-O. L'écart entre O(n log n) et O(n²) ou une croissance exponentielle est l'écart entre traitable et impossible à grande échelle. Le travail de performance suit quelques lois : éviter le recalcul par la mise en cache et la mémoïsation, profiler pour localiser le vrai goulot d'étranglement avant d'optimiser (l'intuition n'est pas fiable), et se rappeler qu'une métrique optimisée, dès qu'elle devient une cible, tend à être détournée (loi de Goodhart).`,
      more: `Donne à la machine ses étapes bêtes dans un ordre astucieux et tu obtiens un algorithme — une recette. Ce qui sépare un programme utile d'un inutile, c'est la montée en charge : non pas sa vitesse sur dix éléments, mais la façon dont le coût grandit quand les éléments s'entassent par millions. Une recette négligente qui double son travail à chaque nouvel élément peut transformer un job d'une seconde en un job d'un siècle. Le métier tient en trois points : ne refais pas un travail déjà fait, mesure avant d'« optimiser » car ta supposition sur le point lent a souvent tort, et rappelle-toi que tout chiffre poursuivi finira par être détourné.`,
      example: `Cherche « Zoë » dans un annuaire papier. Page par page depuis le début : sur un gros volume, presque une éternité. Ou ouvre au milieu, décide dans quelle moitié elle se trouve, et recoupe encore — quelques feuilletages et tu y es. Même annuaire, même but, deux recettes : l'une rampe à mesure que le volume épaissit, l'autre le remarque à peine. Voilà la montée en charge en un seul geste. Chaque « pourquoi cette appli rame sur un gros fichier ? » est en réalité « quelqu'un a livré la recette page-par-page ».`,
    },
  },

  /* ---------- ASSEMBLER DES SYSTÈMES ---------- */
  {
    id: "stacks",
    tag: "abstraction",
    eyebrow: "Assembler · les interfaces",
    fragment: `Les tâches difficiles sont des tâches plus simples, scellées derrière des interfaces.`,
    sub: `Décompose le problème ; cache chaque morceau derrière un « quoi » net qui dissimule son « comment » désordonné.`,
    anchor: `Le coup de maître contre la complexité : décomposer une tâche difficile en tâches plus simples, et emballer chacune derrière une interface — un contrat qui promet CE QUE fait un composant tout en dissimulant COMMENT il le fait. Les couches s'empilent ainsi (matériel, OS, langages, bibliothèques, applis), chacune faisant confiance à celle du dessous. Nommer et composer — nommer une capacité, combiner des capacités nommées — c'est presque tout ce qu'est la construction. On peut changer le comment librement tant que le quoi tient. Distingue du barreau suivant : ici, le principe (décomposer + interface = quoi/comment) ; ensuite, la réalité vécue (on colle des morceaux empruntés, et les interfaces fuient).`,
    seeds: {
      threads: `Interface vs implémentation — le « quoi » promis face au « comment » caché et modifiable.
Encapsulation — garder les internes d'un composant privés pour pouvoir les changer sans risque.
Composition — bâtir de grands systèmes en emboîtant de petits morceaux nommés.
API — les promesses publiées qui laissent des inconnus bâtir sur du code qu'ils n'ont jamais lu.`,
      synthesis: `La complexité se dompte par décomposition et masquage d'information : découper un système en composants et exposer chacun par une interface — un contrat spécifiant ce qu'il fait tout en dissimulant comment. Séparer l'interface de l'implémentation permet l'encapsulation, la substituabilité (échanger l'implémentation tant que le contrat tient) et la composition de composants en architectures en couches, chaque niveau ne dépendant que des contrats du dessous. Nommer et composer de telles abstractions constitue l'essentiel de l'ingénierie : cela permet de bâtir des systèmes bien plus grands qu'aucun individu ne pourrait tenir en tête, puisque chaque couche se raisonne par son interface plutôt que par ses internes.`,
      more: `Face à quelque chose de trop gros pour tenir dans ta tête, tu le brises en morceaux et emballes chacun dans une interface — une courte promesse de ce qu'il fait, le comment scellé à l'intérieur. Un module de paiement promet « débite cette carte » ; tu l'utilises sans lire une ligne de sa manière de dialoguer avec les banques. Empile ces promesses et tu obtiens le logiciel moderne : des couches sur des couches, chacune faisant confiance au contrat du dessous. Le super-pouvoir discret, c'est nommer et combiner — nommer une capacité, emboîter des capacités nommées — ce qui est presque tout ce qu'est construire quoi que ce soit.`,
      example: `Conduis une voiture et tu utilises quatre interfaces : un volant, deux pédales, un levier. Derrière chacune, une combustion, une hydraulique, un engrenage auxquels tu ne penses jamais. « Tourner » cache mille pièces ; « s'arrêter » mille de plus. Tu les composes avec aisance — tourne, freine, accélère — pour traverser une ville en ne comprenant presque rien de la mécanique. Toute appli, c'est pareil : une poignée de boutons honnêtes qui promettent un quoi, avec des océans de comment scellés dessous. Apprends les boutons, ignore le moteur — jusqu'à ce que tu ne le puisses plus.`,
    },
  },
  {
    id: "gluing",
    tag: "fuites",
    eyebrow: "Assembler · les fuites",
    fragment: `Tu colles les morceaux des autres — et toute abstraction fuit.`,
    sub: `Tu possèdes rarement toute la pile, et tu pars rarement de zéro. La complexité cachée est différée, pas disparue.`,
    anchor: `La réalité pratique de la construction : presque rien ne s'écrit de zéro ; on assemble des blocs existants et on fait confiance à la machinerie derrière chaque interface pour bien se comporter. Mais les abstractions fuient — la complexité cachée est différée, pas supprimée. Le jour où une bibliothèque empruntée échoue bizarrement, une requête est mystérieusement lente, ou une hypothèse qu'on ignorait avoir faite se brise, le « comment » scellé perce et te force à regarder dans quelque chose que tu n'as pas écrit. D'où la règle de l'artisan (préfigurant le barreau des idées récurrentes) : utilise le haut, mais comprends une couche en dessous. Distingue du barreau précédent : là, il s'agissait de cacher la complexité ; ici, d'assembler des morceaux empruntés et des fuites qui s'ensuivent.`,
    seeds: {
      threads: `Abstractions qui fuient — un détail caché qui resurgit en falaise de performance ou en bug étrange.
Dépendances — les bibliothèques et services empruntés sur lesquels tu t'appuies sans les posséder.
Dette technique — des raccourcis qui empruntent de la vitesse maintenant et en facturent les intérêts plus tard.
Une couche en dessous — pourquoi réparer une fuite suppose de comprendre l'étage sous tes pieds.`,
      synthesis: `En pratique, les systèmes s'assemblent en intégrant des composants existants — bibliothèques, services, frameworks — si bien qu'on possède ou comprend rarement toute la pile. Mais les abstractions fuient : un détail d'implémentation dissimulé resurgit en falaises de performance, en défaillances de cas limites, en épuisement de ressources ou en décalage de versions. La complexité qu'une interface cache est différée, pas supprimée, et elle revient précisément quand une dépendance se comporte hors de son contrat affiché. C'est pourquoi la discipline opérante est de comprendre au moins une couche en dessous de là où l'on travaille — assez de l'implémentation pour diagnostiquer la fuite quand le contrat échoue en silence.`,
      more: `La vraie construction, c'est surtout de la plomberie : tu prends une base de données écrite par quelqu'un d'autre, un service de paiement, une bibliothèque de cartographie, et tu les colles avec une fine couche à toi. Tu ne possèdes presque jamais toute la pile, et tu fais confiance à chaque morceau emprunté pour tenir sa promesse. La plupart du temps, il la tient — jusqu'à ce que non. La complexité que ces interfaces cachaient n'était que différée, jamais supprimée. Le jour où un morceau emprunté est mystérieusement lent, ou échoue d'une manière que son manuel ne mentionnait pas, le « comment » scellé fuit et tu te retrouves soudain à devoir regarder dans quelque chose que tu n'as pas bâti.`,
      example: `Les photos « dans le cloud » de ton téléphone ressemblent à un dossier — une interface. Dessous : des centres de données, des protocoles de synchronisation, des reprises sur un réseau capricieux. L'abstraction tient parfaitement jusqu'au moment où tu montes dans un avion et où le « dossier » est soudain vide — le réseau du dessous a fui à travers. Rien n'est cassé ; une hypothèse cachée a fait surface. Chaque « pourtant ça marche sur ma machine » est cela, quelque part dans la pile.`,
    },
  },
  {
    id: "defensive",
    tag: "défense",
    eyebrow: "Assembler · la robustesse",
    fragment: `Suppose que l'extérieur te trahira.`,
    sub: `Les réseaux lâchent, le code dérive, les vérités divergent, les entrées mentent, le travail réparti se percute, la charge s'envole — bâtis pour rester debout quand même.`,
    anchor: `Les systèmes fiables se bâtissent de façon défensive et flexible, car dans le monde réel les choses échouent et changent sans cesse : le réseau tombera, le code et les données dériveront, plusieurs sources de vérité divergeront, l'entrée externe n'est pas digne de confiance, répartir le travail entre machines engendre des conditions de course, et la montée en charge tend sur chaque ressource. La bonne ingénierie anticipe tout cela et reste debout — valide les entrées, tolère les pannes, ne suppose pas une copie unique et vraie, protège le travail partagé. Reste concret et évite le jargon de sécurité. C'est le barreau « bâtir pour un monde hostile et changeant ».`,
    seeds: {
      threads: `Validation des entrées — ne jamais faire confiance à une donnée venue de l'extérieur avant de l'avoir vérifiée.
Conditions de course — des bugs qui n'apparaissent que quand deux tâches touchent la même chose en même temps.
Tolérance aux pannes — rester correct même quand des morceaux échouent ou que des messages se perdent.
Contre-pression (backpressure) — comment un système repousse quand la charge entrante dépasse sa capacité.`,
      synthesis: `Les systèmes fiables sont conçus sous des hypothèses d'adversité et de panne, pas sur le chemin idéal. Une entrée qui franchit une frontière de confiance est validée et assainie, car une entrée externe non vérifiée est un vecteur d'attaque et de défaillance de premier ordre. Les réseaux ne sont pas fiables — les messages sont retardés, réordonnés, perdus ou partitionnés — et des composants indépendants échouent indépendamment, si bien que la tolérance aux pannes et la dégradation gracieuse se conçoivent d'emblée. Un état mutable partagé sous concurrence invite les conditions de course ; un état répliqué tend à diverger, imposant des choix de cohérence explicites ; et la charge montante tend des ressources finies, exigeant dimensionnement et contre-pression. La robustesse est l'anticipation délibérée de tout cela, pour que le système reste correct et debout quand des morceaux se comportent mal.`,
      more: `Tout ce qui quitte ta propre machine entre en territoire hostile. Le réseau lâchera en pleine requête. La source de données à laquelle tu te fiais le mois dernier changera discrètement de forme. Deux copies de « la vérité » — deux serveurs, deux caches — se contrediront. L'entrée que tape un inconnu sera malformée, ou malveillante, à dessein. Répartis un travail entre machines et elles se marcheront dessus d'une façon qui surgit une fois sur mille. La charge grimpera le jour où tu ne regardes pas. Un système robuste suppose chacune de ces choses et reste debout — il traite le monde extérieur comme ce qui va le trahir, parce que ça arrivera.`,
      example: `Deux distributeurs de billets, un compte avec 100 € restants. Toi et ta partenaire retirez au même instant, aux deux bouts de la ville. Chaque machine vérifie le solde — 100 €, très bien — et chacune délivre 100 €. Le compte supposait qu'une seule chose y toucherait à la fois. Répartir le travail sur deux machines a brisé sans bruit cette hypothèse, et la banque perd 100 €. Aucun composant n'a « échoué » ; une vérité partagée non protégée a été touchée deux fois à la fois. La conception défensive, c'est dépenser de l'effort précisément sur ces cas limites ennuyeux-jusqu'à-la-catastrophe.`,
    },
  },

  /* ---------- IDÉES RÉCURRENTES (le socle) ---------- */
  {
    id: "recurring",
    tag: "récurrents",
    eyebrow: "Récurrents · le socle",
    fragment: `Quelques idées reviennent à chaque barreau.`,
    sub: `Comprendre une couche en dessous · tout est compromis · la carte n'est jamais le territoire.`,
    anchor: `Un interlude en recul qui nomme des idées reparaissant à chaque barreau plutôt que sur un seul. Trois d'entre elles : (1) il est payant de comprendre une couche en dessous — on peut utiliser le haut sans le bas, mais chaque niveau qu'on saisit plus profondément cesse d'être magique ; (2) tout est compromis — presque rien n'est simplement bon, alors choisis le sacrifice à dessein, pas par accident ; (3) la carte n'est pas le territoire — comprimer un désir réel et désordonné en symboles laisse toujours tomber quelque chose, donc une métrique n'est pas le but, un modèle n'est pas le monde, une spécification n'est pas le besoin, et les défaillances les plus profondes vivent dans cet écart. Ces idées ont été préfigurées et reviendront ; garde-les en synthèse, pas comme un quatrième sujet.`,
    seeds: {
      threads: `Le compromis CAP — lors d'une partition réseau, choisis la cohérence ou la disponibilité, pas les deux.
Une couche en dessous — l'unique habitude qui transforme la « magie » en cause visible.
Carte vs territoire — une métrique n'est pas le but, un modèle n'est pas le monde.
Loi de Goodhart — la forme la plus tranchée de cet écart, où une cible cesse de mesurer.`,
      synthesis: `Quelques méta-principes reviennent à travers chaque couche. D'abord, comprendre une couche en dessous : parce que les abstractions fuient, le diagnostic exige de connaître l'implémentation juste sous soi. Ensuite, des compromis omniprésents — temps contre espace, latence contre débit, cohérence contre disponibilité (la tension CAP), sûreté contre vivacité — font qu'aucune conception n'est strictement optimale ; on choisit quel coût porter. Enfin, la représentation est à perte : la carte n'est pas le territoire, donc une métrique n'est pas l'objectif, un modèle n'est pas le monde, et une spécification n'est pas l'exigence. La plupart des défaillances profondes vivent dans cet écart, et la loi de Goodhart en est l'instance la plus tranchée.`,
      more: `Certaines idées ne sont pas des barreaux ; elles courent sur toute la hauteur de l'échelle. Un : comprendre une couche en dessous. Tu peux conduire sans moteur et coder sans transistors, mais dès que quelque chose casse, celui qui connaît l'étage du dessous cesse de voir de la magie et se met à voir la cause. Deux : tout est compromis — plus rapide coûte plus simple, plus sûr coûte plus lent, moins cher coûte plus tard ; le choix sage est de décider quoi sacrifier à dessein. Trois : la carte n'est pas le territoire — chaque fois que tu comprimes une chose réelle et désordonnée en symboles, il en reste quelque chose de côté. Une métrique n'est pas le but, un modèle n'est pas le monde, une spec n'est pas le besoin — et les défaillances les plus profondes se cachent dans cet écart.`,
      example: `Un hôpital décide de noter ses urgences sur un seul chiffre : le temps d'attente moyen. Sensé — jusqu'à ce que la carte remplace le territoire. Le personnel se met à enregistrer les patients comme « vus » dès la porte, ou à écarter les cas compliqués qui feraient exploser la moyenne. Le chiffre s'améliore ; les soins empirent. La métrique n'était qu'une carte mince d'une chose riche appelée « bons soins », et dès qu'elle est devenue la cible, on a optimisé la carte en abandonnant discrètement le territoire. Le même piège se cache sous les benchmarks détournés, le bachotage, et les modèles qui cartonnent à leur score en passant à côté de l'essentiel.`,
    },
  },

  /* ---------- APPRENDRE DES DONNÉES ---------- */
  {
    id: "space",
    tag: "espace",
    eyebrow: "Apprendre · la représentation",
    fragment: `Transforme n'importe quoi en points dans l'espace.`,
    sub: `E-mails, visages, phrases — tous deviennent des coordonnées, disposées pour que les choses semblables soient proches.`,
    anchor: `Le geste qui lance l'apprentissage automatique : représenter n'importe quoi — une photo, un mot, un client — comme un point dans un espace de nombres, agencé pour que les choses semblables atterrissent près les unes des autres et les différentes loin. Une fois le sens devenu distance, « trouver du semblable », « regrouper » et « recommander » deviennent de la géométrie. C'est encore la représentation (préfigurée par la racine), désormais orientée vers l'apprentissage. Reste concret ; n'explique pas les maths des embeddings ni les dimensions. Distingue des barreaux voisins : c'est l'idée de représentation spatiale, pas la corrélation ni la généralisation.`,
    seeds: {
      threads: `Embeddings (plongements) — des coordonnées apprises où les choses semblables finissent proches.
Métriques de distance — mesurer la similarité par distance euclidienne ou cosinus.
Recherche des plus proches voisins — transformer « trouver du semblable » en « trouver ce qui est proche ».
Fléau de la dimension — pourquoi l'intuition se brise quand un espace a des milliers d'axes.`,
      synthesis: `L'apprentissage automatique commence par représenter des entités en vecteurs de caractéristiques — des points dans un espace de grande dimension agencé pour que la similarité sémantique corresponde à la proximité géométrique. Les représentations apprises, ou embeddings, placent les éléments liés près les uns des autres sous une distance comme l'euclidienne ou le cosinus, sans aucune définition explicite des catégories concernées. Une fois les données transformées en points, des tâches à formulation cognitive se réduisent à de la géométrie : la similarité devient proximité, le regroupement devient partitionnement, la recherche devient recherche des plus proches voisins, et la classification devient le tracé de frontières de décision. Ce recadrage du sens en distance mesurable est précisément ce qui permet aux méthodes numériques d'opérer sur des mots, des images et des utilisateurs.`,
      more: `Avant qu'une machine puisse apprendre sur quelque chose, elle doit le situer. Elle transforme donc chaque chose — une chanson, un visage, une phrase — en une liste de nombres, c'est-à-dire un point dans l'espace. L'astuce est d'agencer cet espace pour que le sens devienne distance : deux morceaux de jazz atterrissent près l'un de l'autre, un morceau de jazz et un de death-metal atterrissent loin, sans que personne n'ait écrit ce qu'est le « jazz ». Une fois les idées devenues points, les questions difficiles deviennent de la géométrie facile — « qu'est-ce qui est semblable ? » devient « qu'est-ce qui est proche ? », « quels groupes existent ? » devient « où sont les amas ? ». Le sens, discrètement reconstruit en carte.`,
      example: `Chaque « parce que vous avez regardé… » est cela. Le service a placé chaque film comme un point dans un vaste espace de goûts — non par étiquettes de genre, mais par qui apprécie quoi. Ton propre historique est un point aussi. Pour recommander, il regarde simplement autour de ton voisinage et te tend ce qui est proche. Il n'a aucune idée de ce que « thriller de casse » veut dire ; il sait seulement que ton point se trouve près de ces points-là. La similarité est devenue distance, le goût une carte, et choisir un film s'est réduit à regarder ce qu'ont aimé tes plus proches voisins.`,
    },
  },
  {
    id: "correlation",
    tag: "corrélation",
    eyebrow: "Apprendre · ce qu'est un motif",
    fragment: `Les motifs sont de la corrélation, pas de la causalité.`,
    sub: `Les données montrent ce qui va ensemble, jamais pourquoi — et le monde s'éloigne de l'instantané sur lequel tu as entraîné.`,
    anchor: `Les modèles trouvent des corrélations — ce qui tend à survenir avec quoi — pas des raisons ni des causes. Prédire n'est pas expliquer : savoir que deux choses bougent ensemble ne dit pas que l'une entraîne l'autre, ni qu'une troisième cachée les entraîne toutes deux. Pire, les données sont un instantané ; le monde continue de bouger, si bien que les motifs appris hier se périment discrètement (dérive), sans prévenir. Reste concret. Distingue des voisins : ce barreau, c'est corrélation-pas-cause plus dérive ; le barreau spatial portait sur la représentation, et le suivant sur la généralisation aux cas non vus.`,
    seeds: {
      threads: `Facteurs de confusion — une cause commune cachée qui fait bouger ensemble deux choses sans lien.
Inférence causale — les outils pour demander « et si on intervenait ? », pas seulement « qu'est-ce qui coïncide ? ».
Changement de distribution — pourquoi un modèle se dégrade en silence quand le monde s'éloigne de ses données d'entraînement.
Prédiction vs explication — savoir ce qui arrivera sans savoir pourquoi.`,
      synthesis: `Les modèles appris capturent une association statistique — quelles variables coïncident — non une structure causale. La corrélation soutient la prédiction, mais pas l'intervention ni l'explication : un facteur de confusion, une cause commune, peut faire suivre deux effets l'un l'autre sans aucun lien causal entre eux, si bien qu'agir sur l'un ne change rien. Prédire n'est donc pas expliquer. À cela s'ajoute que les données d'entraînement sont un instantané d'une distribution non stationnaire ; à mesure que le monde évolue, les distributions des entrées et des étiquettes changent — changement de distribution, ou dérive conceptuelle — et les corrélations jadis nettes d'un modèle se dégradent en silence après déploiement, généralement sans signal d'erreur, seulement des prédictions discrètement pires.`,
      more: `Un modèle apprend ce qui va avec quoi. Les parapluies vont avec la pluie, certains mots avec le spam, certains achats avec la fraude. C'est de la corrélation, et c'est réellement utile — mais ce n'est pas une raison. Le modèle ne peut dire si A cause B, si B cause A, ou si une troisième chose les cause discrètement tous deux. Il prédit ; il n'explique pas. Et il y a un second piège : les données sont une photographie d'un monde en mouvement. Les goûts changent, les fraudeurs changent de tactique, les mots prennent de nouveaux sens — si bien qu'un motif net l'an dernier devient peu à peu flou, et personne ne sonne la cloche quand ça arrive.`,
      example: `Au fil d'un été, les ventes de glaces et les noyades montent et descendent ensemble, presque parfaitement. Un modèle « prédirait » volontiers l'une à partir de l'autre. Mais interdire la glace ne sauve aucun nageur — une troisième chose, la chaleur, entraîne les deux. Voilà la corrélation sous un déguisement convaincant. Ajoute la dérive : entraîne un modèle sur les achats de la décennie passée et lâche-le aujourd'hui, après qu'une pandémie a recâblé nos façons d'acheter. Les corrélations sur lesquelles il comptait ont discrètement bougé, et ses prédictions assurées répondent à un monde qui n'existe plus.`,
    },
  },
  {
    id: "generalization",
    tag: "généraliser",
    eyebrow: "Apprendre · le vrai but",
    fragment: `Apprendre, c'est bien deviner sur ce qu'on n'a pas vu.`,
    sub: `Pas mémoriser les exemples — généraliser à ceux de demain. On ne peut que l'estimer, et il faut s'attendre à un peu d'erreur.`,
    anchor: `Le succès ne se juge que sur des cas non vus, mis de côté : le but est la généralisation, pas la mémorisation des exemples d'entraînement. Comme le vrai futur ne peut jamais être testé, on estime la généralisation par des substituts — un jeu de test réservé — et il faut accepter une erreur résiduelle : le modèle se trompera sur certains cas non vus, et la pratique honnête s'y prépare au lieu de la cacher. Distingue des voisins : le barreau précédent portait sur corrélation et dérive ; ce barreau, sur le piège de la mémorisation et l'évaluation honnête ; le suivant, sur l'incertitude par prédiction.`,
    seeds: {
      threads: `Surapprentissage (overfitting) — mémoriser le bruit d'entraînement au lieu du motif sous-jacent réel.
Séparation entraînement/test — mettre des données de côté pour noter le modèle honnêtement.
Compromis biais–variance — équilibrer un modèle trop simple contre un modèle trop flexible.
Validation croisée — tirer une estimation honnête de la généralisation de données limitées.`,
      synthesis: `L'objectif de l'apprentissage est la généralisation — une faible erreur attendue sur la distribution sous-jacente des données — non l'erreur minimale sur l'échantillon d'entraînement, que la pure mémorisation peut amener à zéro. Comme la vraie distribution est inobservable, l'erreur de généralisation s'estime sur un jeu de test réservé qui tient lieu de données non vues. La défaillance caractéristique est le surapprentissage : ajuster le bruit et les particularités de l'échantillon plutôt que le signal, d'où une faible erreur d'entraînement mais une forte erreur de test. Un certain écart de généralisation est irréductible ; la pratique honnête rapporte donc la performance sur données réservées, traite l'erreur résiduelle comme attendue, et gère l'équilibre biais–variance au lieu de courir après un ajustement d'entraînement parfait.`,
      more: `Le but n'a jamais été de cartonner aux questions déjà vues — un modèle qui se contente de mémoriser chaque exemple d'entraînement peut obtenir un score parfait et rester sans valeur, car la vraie épreuve est le cas jamais rencontré. On met donc des données de côté, on entraîne sur le reste, et on ne note que sur la partie cachée, en tant que doublure du futur inconnu. Mais cette doublure n'est qu'un substitut : le vrai futur est non testable, donc une part d'erreur sur des cas vraiment nouveaux est garantie, pas un bug. Le travail honnête nomme cette erreur résiduelle à voix haute et prévoit autour, au lieu de se fier à un score suspicieusement parfait.`,
      example: `Entraîne un modèle sur des photos à distinguer huskies et loups et il peut être brillant — jusqu'à ce que tu découvres qu'il a appris « de la neige en arrière-plan veut dire loup ». Il a cartonné sur tout ce qu'il avait vu grâce à un raccourci qui s'effondre sur tout ce qui est non vu. Toute la discipline en une histoire : la généralisation est le but, la corrélation est le piège, et le test réservé est le seul juge honnête.`,
    },
  },
  {
    id: "uncertainty",
    tag: "confiance ?",
    eyebrow: "Apprendre · la confiance",
    fragment: `Une prédiction n'est utile que si tu sais à quel point lui faire confiance.`,
    sub: `Une estimation sans sa confiance est une demi-estimation — « probablement de la pluie » et « certainement de la pluie » sont deux décisions différentes.`,
    anchor: `Une prédiction sans un sens calibré de sa propre fiabilité est dangereuse, car elle invite à faire une confiance égale à une quasi-certitude et à une supposition au hasard. Les bons modèles indiquent leur degré de certitude, et cette confiance doit être honnête (calibrée) : sur toutes les fois où il dit 70 %, il devrait avoir raison environ soixante-dix fois sur cent. Connaître l'incertitude change la décision — agis sur l'annonce assurée, vérifie ou couvre celle qui est bancale. Reste concret. Ce barreau préfigure discrètement le thème du « probablement juste » de toute la section IA.`,
    seeds: {
      threads: `Calibration — quand un modèle dit 70 %, a-t-il vraiment raison environ 70 % du temps ?
Aléatoire vs épistémique — le bruit irréductible du monde face à l'ignorance propre du modèle.
Intervalles de confiance — poser des barres d'erreur honnêtes autour d'une estimation.
Seuils de décision — le niveau de confiance exigé devrait monter avec les enjeux.`,
      synthesis: `Une prédiction ponctuelle n'est actionnable qu'accompagnée d'une estimation calibrée de sa propre fiabilité : quand un modèle sort 70 %, il devrait avoir raison sur environ 70 % de ces cas (calibration). L'incertitude a deux sources — aléatoire, le bruit irréductible du monde (une pièce équilibrée), et épistémique, l'ignorance propre du modèle due à des données limitées ou peu représentatives, qui se réduit à mesure que les données croissent. Les distinguer importe, car elles appellent des réponses différentes. Les décisions saines se conditionnent à la confiance : agir sur les prédictions à haute confiance, et différer, couvrir ou collecter plus de données sur celles à faible confiance. Une prédiction sans son incertitude n'est que la moitié de l'information.`,
      more: `Deux prédictions peuvent se lire à l'identique — « il va pleuvoir » — alors que l'une est une quasi-certitude et l'autre à peine mieux qu'un tirage à pile ou face. Retire la confiance et tu ne peux plus les distinguer : tu surestimes la supposition et sous-estimes la certitude. Un bon modèle indique à la fois la réponse et son degré de certitude, et ce chiffre doit être honnête : sur toutes les fois où il dit 70 %, il devrait avoir raison environ soixante-dix fois sur cent. C'est ce qui permet d'agir — s'appuyer fort sur les annonces assurées, revérifier ou couvrir les bancales. Un chiffre sans son incertitude n'est que la moitié de l'information.`,
      example: `Une appli météo annonce « 70 % de risque de pluie ». Ce seul chiffre pilote discrètement ta matinée : à 70 % tu prends un parapluie mais tu marches quand même ; à 99 % tu prends la voiture ; à 10 % tu laisses tomber. Imagine maintenant qu'elle ne dise jamais que « pluie » ou « pas de pluie », sans chiffre. Tu serais trempé la moitié du temps et paranoïaque l'autre moitié, incapable de distinguer une intuition d'une certitude. Le vrai produit de la prévision, ce n'est pas la prédiction — c'est la confiance calibrée qui l'accompagne, car c'est avec elle que tu décides réellement.`,
    },
  },

  /* ---------- LE PARADIGME IA ---------- */
  {
    id: "nextword",
    tag: "mot suivant",
    eyebrow: "Le paradigme IA · la tâche",
    fragment: `L'IA moderne ne fait que prédire le mot suivant.`,
    sub: `Devine assez bien le mot suivant, sur assez de tout, et la grammaire, les faits et même le raisonnement arrivent en effets de bord.`,
    anchor: `Les grands modèles de langage sont entraînés sur une tâche d'une simplicité embarrassante : étant donné un texte, prédire le mot (token) suivant, sur d'immenses corpus. Fait assez bien, la grammaire, les faits, le style et quelque chose comme le raisonnement émergent en effets de bord que personne n'a codés à la main. La subtilité qu'on souligne : les données d'entraînement deviennent une partie du « code source » — le comportement est façonné par ce qu'il a lu — si bien que le contrôle sur la qualité de sortie devient probabiliste, plus difficile à garantir qu'un code ordinaire. Reste concret. Distingue des barreaux suivants : ici, la tâche plus les capacités émergentes plus données-comme-code ; l'échelle, l'économie et le basculement vers la couche probabiliste viennent après.`,
    seeds: {
      threads: `Tokens — les fragments de sous-mots qu'un modèle lit et prédit réellement.
Apprentissage auto-supervisé — s'entraîner sans étiquettes, juste « prédire le morceau suivant ».
Capacités émergentes — des compétences qui n'apparaissent qu'une fois le modèle assez grand.
Fine-tuning (affinage) — orienter un modèle général vers un comportement précis.`,
      synthesis: `Les grands modèles de langage contemporains sont des modèles de séquence autorégressifs entraînés par prédiction auto-supervisée du token suivant — maximiser la vraisemblance du token suivant étant donné le contexte précédent, sur d'immenses corpus. De ce seul objectif, des compétences émergent sans être explicitement programmées — syntaxe, rappel factuel, style et comportement proche du raisonnement — parce que bien prédire le texte les exige. Une conséquence absente de la pile classique : le corpus d'entraînement est en fait compilé dans les paramètres, donc dans le comportement, si bien que le modèle ne peut être édité ligne par ligne. La qualité de sortie se pilote de façon probabiliste — par le prompt, le fine-tuning, les paramètres de décodage — plutôt que garantie par construction.`,
      more: `La tâche d'entraînement est presque insultante de simplicité : montrer à la machine un bout de texte et lui faire deviner le mot suivant — puis encore, et encore, sur presque tout ce que l'humanité a écrit. Fais-le assez bien et une chose étrange se produit : pour prédire les mots avec cette précision, il doit capter la grammaire, les faits, le ton, et des motifs qui ressemblent beaucoup à du raisonnement — rien de programmé, tout en effet de bord de bien deviner le mot suivant. Mais remarque ce qui a changé : le texte qu'il a lu fait désormais partie de son code. Tu ne peux pas l'ouvrir et corriger une ligne — son « savoir » est cuit dans des milliards de nombres ajustés, et orienter la sortie devient affaire de probabilité, non de garantie.`,
      example: `Demande-lui d'écrire un e-mail contrit à ton propriétaire au sujet d'un loyer en retard. Il n'y a pas de « module d'excuses » dedans. Il a simplement lu tant d'excuses, de négociations et d'e-mails que continuer ton amorce de façon plausible — un mot à la fois — produit une lettre convenable. Le plus troublant, c'est l'étendue : le même réflexe du mot-suivant rédige aussi du code, explique le droit fiscal et imite un poète. Une astuce monotone — deviner ce qui vient ensuite — étirée sur presque tout ce qui a jamais été écrit, avec la compétence qui en tombe comme effet de bord.`,
    },
  },
  {
    id: "scale",
    tag: "échelle",
    eyebrow: "Le paradigme IA · le moteur",
    fragment: `L'échelle est le moteur — et elle tourne sur des GPU.`,
    sub: `Des milliards de boutons, des milliers de milliards de mots d'entraînement. Ça ne marche qu'en immense, et immense veut dire arithmétique massivement parallèle.`,
    anchor: `L'astuce du mot-suivant ne produit sa magie qu'à échelle énorme : les modèles portent des centaines de milliards de paramètres réglables (« boutons ») ajustés sur des milliers de milliards de tokens. Cette échelle est permise par le matériel (GPU, conçus pour l'arithmétique massivement parallèle) et par le logiciel (frameworks qui parallélisent et optimisent cette arithmétique). Passé certaines échelles, de nouvelles capacités apparaissent comme surgies de nulle part (émergence). Le boom de l'IA est, au fond, un boom du matériel et de l'arithmétique. Reste concret. Distingue des voisins : le barreau précédent, c'était la tâche ; ce barreau, c'est le pourquoi de l'échelle + les GPU ; le suivant, l'économie du « entraîner une fois ».`,
    seeds: {
      threads: `Lois d'échelle — comment la capacité s'améliore de façon prévisible avec la taille, les données et le calcul.
Pourquoi les GPU — des milliers d'unités simples faisant de l'arithmétique matricielle toutes à la fois.
FLOPs — le décompte brut d'opérations qui mesure le coût de l'entraînement.
Émergence — des capacités qui s'allument brusquement passé une certaine échelle.`,
      synthesis: `L'objectif du token-suivant ne livre ses capacités frappantes qu'à l'échelle, et l'échelle est quantifiable : la performance s'améliore de façon prévisible avec les paramètres, les données d'entraînement et le calcul (lois d'échelle empiriques). Le calcul est massivement de l'algèbre linéaire dense — des multiplications de matrices — qui se projette sur l'arithmétique massivement parallèle des GPU et TPU ; d'où un boom qui est, au fond, un boom d'accélérateurs et de FLOPs. Au-delà de la tendance lisse, certaines capacités apparaissent brusquement passé des seuils d'échelle (émergence), absentes des modèles plus petits. La frontière est donc autant un problème de systèmes et de matériel — parallélisme, bande passante mémoire, interconnexion — qu'un problème de modélisation.`,
      more: `Réduite, l'astuce du mot-suivant est un jouet de fête. Sa puissance ne s'allume qu'à l'échelle : des centaines de milliards de boutons internes, ajustés contre des milliers de milliards de mots. Tourner ces boutons revient à faire des quantités vertigineuses d'arithmétique simple toutes à la fois — précisément ce à quoi excelle un GPU, une puce conçue à l'origine pour peindre des millions de pixels de jeu par image. Le boom de l'IA est donc, sous le capot, un boom des GPU et de l'arithmétique. Et l'échelle fait quelque chose de troublant : des capacités qu'un modèle plus petit n'a tout simplement pas — suivre des instructions, calculer, traduire — peuvent apparaître presque soudainement une fois la chose assez grande, comme si elles attendaient la taille.`,
      example: `Les puces au centre de la ruée vers l'or de l'IA n'ont pas du tout été conçues pour l'IA. Les GPU ont été bâtis pour rendre des mondes de jeux vidéo — des milliers de petites sommes d'éclairage identiques calculées en parallèle, à chaque image. Il se trouve qu'entraîner un modèle de langage est le même type de travail : des océans de minuscules multiplications, toutes à la fois. Le matériel qui dessinait jadis des explosions dans les jeux de tir ajuste maintenant les milliards de boutons derrière un agent conversationnel. Quand tu entends qu'une entreprise a acheté cent mille GPU, voilà ce qu'elle achète : de l'arithmétique parallèle brute, le vrai moteur sous « l'intelligence ».`,
    },
  },
  {
    id: "trainonce",
    tag: "une fois",
    eyebrow: "Le paradigme IA · l'économie",
    fragment: `Apprends une fois, à grands frais. Sers-t'en un milliard de fois, pour presque rien.`,
    sub: `Un modèle général coûteux, figé, puis pointé vers des milliers de tâches — de plus en plus agissant, pas seulement répondant.`,
    anchor: `L'économie s'inverse : entraîner un grand modèle coûte une fortune, une fois ; ensuite le modèle est figé et réutilisable d'innombrables fois pour un coût minime chacune. Un modèle général, entraîné sur aucune tâche en particulier, se pointe vers des milliers de jobs précis. Et la frontière glisse de répondre (produire du texte) à agir (appeler des outils, enchaîner des étapes, accomplir des buts) — les agents. Reste concret. Distingue des voisins : le barreau précédent, c'était l'échelle et le matériel ; ce barreau, l'asymétrie des coûts et le glissement vers l'action ; le dernier barreau, ce que cela fait à la confiance.`,
    seeds: {
      threads: `Entraînement vs inférence — l'ajustement unique et coûteux face à l'usage bon marché et répété.
Modèles de fondation — un seul modèle général adapté à de nombreuses tâches en aval.
Zéro-shot et few-shot — résoudre des tâches sur lesquelles il n'a jamais été explicitement entraîné.
Agents — des modèles qui ne se contentent pas de répondre mais appellent des outils et agissent.`,
      synthesis: `Il existe une asymétrie de coût marquée entre les deux phases. L'entraînement — ajuster des milliards de paramètres sur d'énormes corpus — est une dépense de calcul massive et largement unique ; l'inférence, faire tourner le modèle figé pour répondre à une requête, est comparativement bon marché et répétable. Cette économie sous-tend le schéma des modèles de fondation : pré-entraîner un modèle général à grand coût, puis l'adapter à de nombreuses tâches en aval pour lesquelles il n'a pas été spécifiquement entraîné, par le prompt ou un léger fine-tuning (transfert zéro-shot et few-shot). La trajectoire va de répondre vers agir — des systèmes agentiques qui invoquent des outils et enchaînent des actions sous un but — en amortissant le coût d'entraînement unique sur un usage vaste et varié.`,
      more: `Il y a deux étiquettes de prix très différentes. Entraîner le modèle est monstrueux — des mois de milliers de puces, un coût énorme, fait une fois. Mais le modèle fini est ensuite figé, un tas fixe de nombres, et le faire tourner pour te répondre coûte une paille en comparaison. Cette asymétrie est tout le modèle économique : paie la fortune une seule fois, puis sers un milliard d'usages pour des centimes chacun. Plus étrange encore, ce seul modèle général — entraîné sur rien en particulier — se pointe vers des milliers de jobs précis. Et de plus en plus il ne se contente pas de répondre ; il agit : cliquer, appeler des outils, enchaîner des étapes vers un but que tu lui as confié.`,
      example: `Pense à une presse d'imprimerie. Composer les caractères est lent, qualifié, coûteux — mais une fois fait, tu peux tirer cent mille pages identiques pour le prix du papier. Un modèle entraîné, c'est la composition figée : le travail dur et coûteux est terminé et gelé. Le même modèle figé rédige ensuite ton e-mail, résume un contrat, écrit un poème d'anniversaire et corrige un bug avant midi — rien de ce pour quoi il aurait été spécialement bâti. Une coulée coûteuse, des impressions bon marché à l'infini — et depuis peu la presse s'est mise à aller chercher son propre papier et son encre : agir, pas seulement imprimer.`,
    },
  },
  {
    id: "probably",
    tag: "nouvelle couche",
    eyebrow: "Le paradigme IA · le basculement",
    fragment: `La nouvelle couche ne promet que d'avoir probablement raison.`,
    sub: `On échange des traducteurs exacts entre couches contre des traducteurs statistiques — plus de portée, garantie plus faible. Garde l'étape de vérification.`,
    anchor: `Chaque couche précédente de la pile était une traduction déterministe et inspectable — un compilateur a raison, ou c'est un bug de compilateur. L'IA rend statistique la traduction entre couches (intention → code, but → plan, question → décision) : elle devine là où chaque couche du dessous calculait. Cela échange le contrôle contre la portée et la précision contre l'expressivité — le langage naturel est plus riche ET plus vague que le code, ce qui est précisément pourquoi les langages de programmation ont été inventés ; l'automatisation revient en arrière. Elle échoue en silence et avec aisance : assurée, bien formée, fausse. Ce qui est vraiment nouveau : pour la première fois, la couche à laquelle tu te fies ne promet pas d'avoir raison, seulement probablement raison — donc l'étape humaine de vérification, que les couches déterministes nous laissaient automatiser sans risque, doit être conservée. Ce cours même tourne sur une telle couche ; le conférencier sur scène est l'étape de vérification.`,
    seeds: {
      threads: `Déterministe vs statistique — un compilateur a toujours raison ; cette couche a raison en moyenne.
Erreur fluide — des réponses assurées et bien formées qui se trouvent être fausses.
Vérification — pourquoi l'étape humaine de contrôle est la seule chose qu'on ne peut pas automatiser.
Interfaces en langage naturel — échanger la précision contre la portée, et pourquoi ça coupe des deux côtés.`,
      synthesis: `Chaque couche antérieure de la pile était une traduction déterministe et inspectable — un compilateur associe la source au code machine de façon identique à chaque fois. La nouvelle couche effectue une traduction statistique de l'intention en code, du but en plan, de la question en décision : correcte en espérance, par construction, non avec certitude. Son mode de défaillance est singulier — non un plantage bruyant, mais une erreur fluide, bien formée, assurée. Elle échange la précision contre la portée expressive, car le langage naturel est plus riche et plus vague que le code formel (la raison même de l'existence des langages de programmation). Le basculement structurel : la correction passe de garantie à vraisemblance, si bien que l'étape de vérification que les couches déterministes nous laissaient abandonner sans risque doit désormais être délibérément conservée.`,
      more: `Pendant soixante-dix ans, le marché était simple : chaque couche traduisait exactement celle du dessus. Un compilateur transforme ton code en étapes machine de la même façon à chaque fois — inspectable, reproductible, ennuyeusement juste. La nouvelle couche rompt ce marché à dessein. Sommée de transformer une intention en code, ou un but en plan, elle devine, parce qu'elle a été bâtie pour avoir raison la plupart du temps, pas toujours. Cela achète une portée énorme : tu peux t'adresser à elle en langage humain désordonné plutôt qu'en code précis. Mais le langage humain désordonné est précisément ce que nous avons inventé les langages de programmation pour fuir, car il est vague. Le gain, c'est l'expressivité et la vitesse ; le prix, c'est que cette couche, à elle seule, ne promet pas la correction — seulement la probabilité. Elle échoue non par un plantage, mais par une réponse fausse, assurée et fluide.`,
      example: `Cette diapositive est l'exemple. Le panneau que tu lis est produit par exactement le genre de couche probabiliste que le fragment décrit. Elle a eu raison tout le cours — vraiment ? Le conférencier ici présent est l'étape de vérification : lire, juger, corriger devant toi. Garde ce rôle, et la nouvelle couche est un triomphe. Automatise-le, et l'erreur fluide part en production.`,
    },
  },
];

/* ------------------------------------------------------------
   SONDES — chacune est un modèle de prompt. Ajoute ou reformule.
   ------------------------------------------------------------ */
export const ACTIONS = [
  {
    id: "more",
    label: "En dire plus",
    task: "Approfondis l'idée d'un cran : révèle le mécanisme derrière le fragment, tout en restant pleinement saisissable par un auditeur profane.",
  },
  {
    id: "example",
    label: "Donner un exemple",
    task: "Donne UN exemple concret et quotidien qui incarne le fragment — une petite scène ou histoire, pas une définition.",
  },
  {
    id: "synthesis",
    label: "Synthèse technique",
    task: "Énonce le contenu du fragment de façon précise et complète : une synthèse technique compacte, dans une terminologie de domaine correcte, fidèle au sens voulu, pour un lecteur scientifiquement averti.",
  },
  {
    id: "differently",
    label: "Expliquer autrement",
    task: "Ré-explique le fragment par une analogie ou un registre complètement différents de tout ce qui a été utilisé avant. Surprends, mais reste strictement exact.",
  },
  {
    id: "risk",
    label: "Limites / risques ?",
    task: "Donne une description synthétique des limites (au regard des questions d'informatique ou de science des données) qui découlent de cette idée, ou des risques qui en émanent.",
  },
  {
    id: "bite",
    label: "Un exemple qui mord ?",
    task: "Montre où cette idée mord dans le monde réel : un échec, un coût ou une conséquence concrète de l'ignorer.",
  },
  {
    // Sonde croisée : buildPrompt fournit à cette sonde la synthèse technique
    // de la diapositive comme contexte, et demande quelques « fils » à tirer.
    id: "threads",
    label: "Fils à tirer",
    task: "À partir de la synthèse technique, fais émerger quelques « fils » concrets à tirer — concepts, mécanismes, termes ou questions ouvertes spécifiques — qu'un auditeur curieux et porté sur la technique pourrait tirer pour aller un cran plus loin.",
  },
];
