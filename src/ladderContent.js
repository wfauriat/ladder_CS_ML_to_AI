/* ============================================================
   LADDER CONTENT — the authorable layer, kept out of the component.
   Edit THIS file to hand-author the lecture. LectureLadder.jsx
   renders whatever it finds here and never has to change.

   A SLIDE:
     id       unique key, stable (used internally + for cache keys)
     tag      short label shown in the left rail, e.g. "switches"
     eyebrow  small kicker above the fragment ("Section · concept")
     fragment the headline the room sees
     sub      one-line subtext under the fragment
     anchor   ground truth: intended meaning + limits. ONLY the model
              sees this; it constrains every live generation. The
              "differentiate from…" notes keep neighbouring rungs
              from drifting into each other.
     seeds    precomputed answers per probe (a warmed cache). Each
              seeds[probeId] is EITHER one string OR an array of
              strings — supply three or four and they become
              browsable alternatives (‹ 1 of 4 ›) shown BEFORE any
              live call. Omit a probe entirely and its first click
              goes straight to the live model. Here the root slide's
              `more` is an array (one entry per lens) as a template;
              every other slide seeds `more` + `example`, and leaves
              `differently` + `bite` to generate live.

   Prose fields use backticks so em-dashes, quotes and apostrophes
   need no escaping. Keep seeds near ~100 words: they are projected
   and read aloud, so they must breathe.

   A PROBE (ACTIONS): { id, label (button text), task (the
   instruction spliced into the prompt) }. Add, reorder, reword.

   Order is data, not code: reorder/add/drop slides by editing the
   array below. The rail, nav and prompts all follow automatically.
   The rail reads bottom-to-top — SLIDES[0] is the base of the climb.
   ============================================================ */

export const SLIDES = [
  /* ---------- ROOT ---------- */
  {
    id: "root",
    tag: "the climb",
    eyebrow: "Root · why we're here",
    fragment: `How computers and data work — a climb from switches to AI.`,
    sub: `Why bother? You can't judge what today's AI can and can't do without it — and every rung is built on the one below.`,
    anchor: `The opening frame and the motivation for the whole lecture: you cannot fairly judge modern AI's powers and limits without a working grasp of how computers compute and how data is used. Offer three interchangeable lenses on the same field — (1) information becomes real by climbing layers, electricity at the bottom, meaning at the top; (2) computing is transforming representations of information under constraints of resources; (3) a climb from physical switches up to AI, each rung built on the one below and usable without understanding the bottom. Stay at this framing altitude: name the journey, do not descend into any single rung yet.`,
    seeds: {
      threads: `Abstraction layers — why each level can safely ignore the messy one beneath it, until it can't.
Representation — how the very same bits become a number, a word, or a colour.
Resource cost — why time, memory and energy decide what's actually possible, not just imaginable.
The stack as history — assembly trusted machine code, C trusted assembly; AI is the next rung up.`,
      synthesis: `The field rests on three invariants. Representation: encode some aspect of the world as symbols — ultimately bit patterns under agreed conventions. Computation: transform those symbols by mechanical, rule-governed steps that carry no intrinsic meaning. Resources: every transformation is paid for in time, memory, energy and communication, and those costs decide what is feasible. Structurally, a computer is a hierarchy of abstraction layers, each a translation of the one above — historically deterministic and inspectable — running from the physical substrate up to human intent. This lecture climbs that hierarchy; understanding modern AI means placing it as the current top layer, not a discontinuity.`,
      more: [
        `Picture the whole thing as a stack. At the very bottom, plain electricity — voltages in wires. At the very top, meaning — a sentence you understand, a decision you act on. Everything between is one layer turning the layer below into something a little more human: switches become numbers, numbers become instructions, instructions become programs, programs become the app in your hand. Nothing in the stack is magic; each floor just hides the messy one beneath it. The climb from spark to sense is the entire subject of the next twenty minutes.`,
        `Strip the field to three words. Representation: pin a slice of the world down as symbols — a photo as numbers, a contract as text. Computation: shove those symbols through mechanical rules that don't understand them, only follow them. Resources: none of it is free — every step costs time, memory, energy, money and human attention. Computer science, software and data science are just those three words, played at enormous scale. Hold them, and the blizzard of acronyms stops mattering.`,
        `This is a ladder, and we read it bottom to top. The lowest rung is a switch that is either on or off. The highest is an AI that writes and reasons. Each rung is built entirely from the ones beneath it — and, crucially, you can stand on a high rung without understanding the low ones, the way you drive without knowing engines. We climb slowly on purpose: by the time we reach AI, it should look less like sorcery and more like the top floor of a building we watched go up.`,
      ],
      example: `Say "set a timer for ten minutes" to a speaker on your counter. Your voice — air pressure — becomes numbers (switches). Those numbers run through billions of tiny steps (computation), leaning on data far larger than the little device (memory and the network). A model trained on oceans of speech guesses your words (data, then AI). Ten seconds, one sentence — and it quietly touched every rung of the ladder we are about to climb.`,
    },
  },

  /* ---------- THE MACHINE ---------- */
  {
    id: "switches",
    tag: "switches",
    eyebrow: "The machine · bits",
    fragment: `It's all switches.`,
    sub: `On or off, 1 or 0 — every number, letter, text and image is huge piles of on/off, dressed up.`,
    anchor: `Billions of transistors acting as extremely fast switches with no moving parts. Two agreed states are enough to encode any number, letter, image or sound, because bits compose. There is no picture or song inside the machine — only bit patterns plus conventions for reading them. Stay classical; no quantum-computing detours. Differentiate from the next rung: this slide is about representation (world → bits), not about what the CPU does to those bits.`,
    seeds: {
      threads: `Encoding schemes — the agreed codes (ASCII, Unicode) that turn bit patterns into letters.
Two's complement — the clever convention for storing negative numbers in bits.
Floating point — how a fixed budget of bits approximates real numbers, and where it slips.
Logic gates — how plain switches combine into AND/OR and then into arithmetic.`,
      synthesis: `At the base sit transistors operating as voltage-gated switches with no moving parts, each resolving to one of two states, 0 or 1 — a bit. Bits compose: fixed-width groups form bytes and machine words, and agreed encodings map them onto every datatype — two's-complement integers, floating-point reals, Unicode text, RGB pixels, sampled audio. The hardware holds no semantics; a bit pattern means nothing until an interpretation convention is imposed, so the same bits denote a number, a glyph, or a colour depending only on the code applied. Representation is thus a layered convention, not a physical property of the substrate.`,
      more: `A transistor is a switch with no moving parts: a voltage on one wire decides whether current may pass through another. That is the entire trick. Your phone holds tens of billions of them, each able to flip billions of times per second. Two agreed voltage levels become 0 and 1; eight of those make a byte; a few million bytes make a photo. The machine never stores a picture — only bit patterns, plus a decoder ring everyone agreed on.`,
      example: `Press the letter A and your keyboard sends 01000001 — a pure convention fixed decades ago. The screen showing that A holds millions of pixels, each just three numbers for red, green and blue. A song is thousands of numbers per second describing air pressure. Text, image, sound — different worlds, one substrate: piles of on/off, read through the right convention.`,
    },
  },
  {
    id: "steps",
    tag: "tiny steps",
    eyebrow: "The machine · the CPU",
    fragment: `The CPU only does tiny dumb steps — insanely fast.`,
    sub: `Move, copy, add, compare — billions a second. Computation is symbols pushed by mechanical rules, no magic.`,
    anchor: `A processor executes only trivial operations: arithmetic, comparison, moving data, jumping to another instruction. Nothing it does is individually clever; apparent intelligence is composition at scale. It is deterministic — same inputs, same steps, same result, every time. Stress the "no magic, mechanical, blindingly fast" nature. Differentiate from the algorithm rung later: this slide is about the CPU's dumb-but-fast vocabulary and determinism, NOT about clever recipes or how cost scales.`,
    seeds: {
      threads: `Fetch–decode–execute — the heartbeat loop every processor repeats billions of times a second.
Instruction set (ISA) — the small fixed vocabulary of operations a chip actually understands.
Pipelining — overlapping steps so several instructions are in flight at once.
Determinism — why identical inputs always give identical outputs, and why that guarantee matters.`,
      synthesis: `The processor runs the fetch–decode–execute cycle: it repeatedly reads an instruction, performs it, and advances. Its instruction set is deliberately primitive — integer and logical arithmetic, comparisons, loads and stores between registers and memory, and conditional branches — and it is deterministic: identical inputs yield identical outputs. Apparent intelligence lies not in any instruction but in composition: millions of these primitives sequenced and driven at clock rates of billions of cycles per second. This is the concrete meaning of computation as mechanical symbol manipulation — no step understands anything, yet layered sequences of trivial, reliable operations realise arbitrarily complex behaviour.`,
      more: `A processor's entire day is a loop: fetch the next instruction, do it, repeat — where "do it" means add two numbers, compare them, copy one into another slot, or jump to a different instruction. That is very nearly the whole vocabulary. It never improvises and never understands; give it the same inputs and it produces the same result, forever. What looks like cleverness — a spell-checker, a face filter — is millions of these nothing-steps stacked on top of each other. Deterministic, dumb, and blindingly fast: that combination is the whole engine.`,
      example: `Watch how it "reads" the sentence in front of you. It doesn't. It compares your keystroke's number against a table, copies a matching shape to the screen, moves to the next slot, compares again — thousands of times before you notice. No single step knows what a word is. Line up enough of these blind compares-and-copies, fast enough, and a document appears to flow under your fingers. The intelligence is entirely in the stacking, never in the step.`,
    },
  },
  {
    id: "os",
    tag: "the OS",
    eyebrow: "The machine · the referee",
    fragment: `One machine, shared among many.`,
    sub: `The operating system rations processor and memory so fast that your dozens of programs all feel like they run at once.`,
    anchor: `The operating system is the shared referee: it hands out the processor, memory and files among many programs, switching between them thousands of times a second so tasks appear simultaneous even on a few cores. It also isolates them — each program gets its own patch of memory and can't trample another's — so one crash doesn't take down the machine. Note the "most times": under heavy load the illusion cracks and things stutter. Keep it concrete; no scheduling algorithms or kernel internals.`,
    seeds: {
      threads: `Preemptive scheduling — how the OS slices CPU time to fake doing everything at once.
Virtual memory — giving each program its own private, protected address space.
Context switching — the real cost of pausing one program to run another.
System calls — the guarded doorway a program uses to ask the OS for hardware.`,
      synthesis: `The operating system multiplexes finite hardware among many programs. In time, a preemptive scheduler slices the CPU and rotates processes via context switches fast enough to create an illusion of simultaneity; in space, virtual memory grants each process an isolated address space so faults stay contained. It also mediates devices and files behind uniform system calls. The concurrency is an illusion sustained only while the machine is unsaturated — under contention, scheduling latency surfaces as stutter. Fair multiplexing of scarce resources and isolation between processes, performed invisibly, are its defining responsibilities.`,
      more: `A computer often has just a handful of cores, yet runs hundreds of programs. The operating system is the referee that makes that work: it gives each program a tiny slice of the processor, freezes it, hands the processor to the next, and cycles so fast — thousands of switches a second — that everything looks simultaneous. It also builds walls: each program gets its own patch of memory and can't scribble on anyone else's, so one crash doesn't sink the ship. Sharing and isolating, invisibly, is its whole job.`,
      example: `Right now your phone is playing a song, keeping the clock ticking, listening for messages and dimming the screen — apparently all at once. It isn't. A single referee is slicing time between them faster than you can perceive. You feel the trick only when it strains: open too many heavy apps and everything stutters, the music skips, the spinner appears. That hitch is "all at once" briefly failing — the referee simply ran out of slices to hand around.`,
    },
  },
  {
    id: "memory",
    tag: "memory",
    eyebrow: "The machine · memory",
    fragment: `Fetching is the slow part, not thinking.`,
    sub: `Fast memory is tiny and near; big memory is far and slow. Speed is mostly keeping data close.`,
    anchor: `Memory is a hierarchy from small-fast (on-chip caches) to large-slow (disk, network). Moving data to the processor usually costs far more than the computation itself. This is why caching, locality and "don't redo work" dominate performance, and why feeding data to GPUs matters as much as their arithmetic. Note this is itself a tradeoff (small-fast vs large-slow) — a foreshadow of the recurring-ideas rung. Keep concrete; this is about the cost of moving data, not about algorithms.`,
    seeds: {
      threads: `Cache levels (L1/L2/L3) — the tiny, fast memories glued right next to the cores.
Locality — why data used together should live together, in time and in space.
The memory wall — how processors outran memory speed, and what was done about it.
Prefetching — the hardware guessing what you'll need next and fetching it early.`,
      synthesis: `Memory forms a hierarchy trading latency against capacity: registers and L1/L2/L3 caches (nanoseconds, kilobytes to megabytes), main DRAM (tens of nanoseconds), then SSD, disk and network (microseconds to milliseconds and beyond). Access latency grows by orders of magnitude down the hierarchy, so for most workloads data movement, not arithmetic, dominates cost — the "memory wall". Performance therefore hinges on locality, both temporal and spatial, and on caching: keeping soon-to-be-used data in the fast, small levels. It is a direct capacity-versus-speed tradeoff, and it is why feeding data to compute units — keeping GPUs supplied — often matters more than raw arithmetic throughput.`,
      more: `A processor adds numbers in under a nanosecond, but fetching a value from main memory can cost hundreds of times that — from disk or network, millions. So chips carry caches: tiny, expensive memories glued next to the cores, holding whatever was touched recently. Most performance engineering is arranging work so the needed data is already close — and most "why is this slow?" mysteries end at a fetch, not at a computation.`,
      example: `Picture a chef whose stove is one step away but whose pantry is across town. The cooking was never the problem. Real case: a program reading a huge table row by row can run fifty times faster than one hopping between columns — identical arithmetic, identical result. The fast one simply keeps grabbing neighbours that are already sitting in the cache.`,
    },
  },

  /* ---------- INSTRUCTING THE MACHINE ---------- */
  {
    id: "code",
    tag: "code",
    eyebrow: "Instructing · language",
    fragment: `Code is machine steps written in words.`,
    sub: `A translation chain: human-readable language ground down into the tiny operations the CPU actually runs.`,
    anchor: `Programming languages let humans write instructions in something close to words; a translator (compiler or interpreter) grinds that down, layer by layer, into the CPU's tiny operations. Higher-level languages are more expressive and forgiving but further from the metal; lower-level ones give more control and more pain — a tradeoff. The key point: the machine only ever runs tiny steps; code is a human-shaped surface over them, mechanically translated. Nothing new happens in the machine. Keep concrete; no syntax or specific-language detours. Differentiate from the algorithm rung: this is about translation (words → steps), not about the cleverness or cost of the recipe.`,
    seeds: {
      threads: `Compiler vs interpreter — translate the whole program upfront, or line by line as it runs.
Levels of language — from assembly near the metal to Python near plain English.
Types — labels on data that let the language catch mistakes before it runs.
The toolchain — the pipeline that turns your source text into something runnable.`,
      synthesis: `A programming language is a human-facing notation for instructions that a compiler or interpreter translates, through intermediate stages, into the processor's instruction set. Languages sit on their own abstraction gradient: high-level languages maximise expressiveness and safety while hiding machine detail; low-level languages expose control and cost at the price of effort — a recurring expressiveness-versus-control tradeoff. The essential point is that no new capability appears in the hardware; a single high-level construct expands into a long, exact sequence of primitive instructions. The toolchain that performs and optimises this translation is what lets people program without writing machine code.`,
      more: `The CPU only speaks in tiny numbered operations, which are miserable for humans to write. So we write in something closer to English — "if the cart is empty, hide the checkout button" — and a translator program grinds that down, step by step, into the machine's dialect. Languages sit on a ladder of their own: the ones near English are quick to write and forgiving; the ones near the metal give total control and punish every slip. Either way, nothing new happens in the machine — words in, the same tiny steps out.`,
      example: `You type one instruction: "sort these thousand names alphabetically." To you it's three words. To the machine there is no such thing as "sort" — the translator expands it into thousands of individual compare-these-two, swap-if-needed, move-on operations. The single friendly verb you wrote becomes a long, dumb, exact sequence the CPU can actually run. That gap — one human word, a thousand mechanical steps — is what every programming language exists to bridge.`,
    },
  },
  {
    id: "algorithms",
    tag: "algorithms",
    eyebrow: "Instructing · efficiency",
    fragment: `An algorithm is a recipe — and how it scales is what matters.`,
    sub: `Same result, wildly different cost. Don't redo work, measure before optimizing, and beware the metric you chase.`,
    anchor: `An algorithm is a precise recipe: a finite list of steps that solves a problem. Many recipes give the same answer at wildly different cost; what matters is how cost GROWS as the input grows, because that decides what is feasible at all. Fold in the performance wisdom the user grouped here: don't redo work (cache and reuse), measure before optimizing (intuition about the slow part is usually wrong), and beware that any metric becomes gamed once it is the target. Differentiate from the CPU rung: there the steps were dumb; here the cleverness lives in their order, and scaling is the star.`,
    seeds: {
      threads: `Big-O notation — the shorthand for how cost grows as the input gets bigger.
Data structures — how the arrangement (list, hash table, tree) decides what's fast.
Memoization — never computing the same answer twice by keeping a copy.
Goodhart's law — why a metric you optimise hard eventually gets gamed.`,
      synthesis: `An algorithm is a finite, unambiguous procedure mapping input to output; the same problem usually admits many algorithms of vastly different cost. Feasibility is decided by asymptotic complexity — how running time and memory scale with input size n, captured in Big-O notation. The gap between O(n log n) and O(n²) or exponential growth is the gap between tractable and impossible at scale. Practical performance work follows a few laws: avoid recomputation through caching and memoization, profile to locate the real bottleneck before optimising (intuition is unreliable), and remember that an optimised metric, once it becomes a target, tends to be gamed (Goodhart's law).`,
      more: `Give the machine its dumb steps in a clever order and you have an algorithm — a recipe. The twist that separates a useful program from a useless one is scaling: not how fast it runs on ten items, but how the cost grows as items pile into millions. A careless recipe that doubles its work with each new input can turn a one-second job into a one-century job. The craft is threefold: don't redo work you've already done, measure before you "optimize" because your guess at the slow part is usually wrong, and remember any number you chase will eventually be gamed.`,
      example: `Find "Zoë" in a paper phone book. Page by page from the front: on a thick book, nearly forever. Or open the middle, decide which half she's in, and halve again — a few flips and you're there. Same book, same goal, two recipes: one crawls as the book thickens, the other barely notices. That is scaling in a single gesture. Every "why is this app grinding on a big file?" is really "someone shipped the page-by-page recipe."`,
    },
  },

  /* ---------- ASSEMBLING SYSTEMS ---------- */
  {
    id: "stacks",
    tag: "abstraction",
    eyebrow: "Assembling · interfaces",
    fragment: `Hard tasks are simpler tasks, sealed behind interfaces.`,
    sub: `Decompose the problem; hide each piece behind a clean "what" that conceals its messy "how".`,
    anchor: `The master move for complexity: decompose a hard task into simpler tasks, and wrap each behind an interface — a contract that promises WHAT a part does while concealing HOW it does it. Layers stack this way (hardware, OS, languages, libraries, apps), each trusting the one below. Naming and composition — name a capability, combine named capabilities — is very nearly all of building. You can change the how freely as long as the what holds. Differentiate from the next rung: this is the principle (decompose + interface = what/how); the next is the lived reality (you glue borrowed parts, and interfaces leak).`,
    seeds: {
      threads: `Interface vs implementation — the promised "what" versus the hidden, changeable "how".
Encapsulation — keeping a component's internals private so they can be changed safely.
Composition — building big systems by snapping small, named pieces together.
APIs — the published promises that let strangers build on code they've never read.`,
      synthesis: `Complexity is tamed by decomposition plus information hiding: split a system into components and expose each through an interface — a contract specifying what it does while concealing how. Separating interface from implementation enables encapsulation, substitutability (swap the implementation while the contract holds) and composition of components into layered architectures, each level depending only on the contracts beneath it. Naming and composing such abstractions is most of engineering: it lets people build systems far larger than any individual could hold in mind, because every layer can be reasoned about through its interface rather than its internals.`,
      more: `Faced with something too big to hold in your head, you break it into parts and wrap each part in an interface — a short promise of what it does, with the how sealed inside. A payment part promises "charge this card"; you use it without reading a line of how it talks to banks. Stack these promises and you get modern software: layers upon layers, each trusting the contract below. The quiet superpower is naming and combining — name a capability, snap named capabilities together — which is very nearly all that building anything is.`,
      example: `Drive a car and you use four interfaces: a wheel, two pedals, a stick. Behind each is combustion, hydraulics and gearing you never think about. "Turn" hides a thousand parts; "stop" hides a thousand more. You compose them fluently — turn, brake, accelerate — to cross a city while understanding almost none of the machinery. Every app is the same: a handful of honest buttons promising what, with oceans of how sealed underneath. Learn the buttons, ignore the engine — until you can't.`,
    },
  },
  {
    id: "gluing",
    tag: "leaks",
    eyebrow: "Assembling · leaks",
    fragment: `You glue other people's parts — and every abstraction leaks.`,
    sub: `You rarely own the whole stack or build from scratch. The hidden complexity is deferred, not gone.`,
    anchor: `The practical reality of building: almost nothing is written from scratch; you assemble existing blocks and trust the machinery behind each interface to behave. But abstractions leak — hidden complexity is deferred, not deleted. The day a borrowed library fails weirdly, a query is mysteriously slow, or an assumption you didn't know you had made breaks, the sealed "how" pokes through and forces you to look inside something you didn't write. Hence the craftsman's rule (foreshadowing the recurring-ideas rung): use the top, but understand one layer below. Differentiate from the previous rung: that was about hiding complexity; this is about assembling borrowed parts and the leaks that follow.`,
    seeds: {
      threads: `Leaky abstractions — hidden detail that resurfaces as a performance cliff or a strange bug.
Dependencies — the borrowed libraries and services you rely on but don't own.
Technical debt — shortcuts that borrow speed now and charge interest later.
One layer below — why fixing a leak means understanding the floor beneath you.`,
      synthesis: `In practice, systems are assembled by integrating existing components — libraries, services, frameworks — so one rarely owns or fully understands the whole stack. But abstractions are leaky: concealed implementation detail resurfaces as performance cliffs, edge-case failures, resource exhaustion or version skew. The complexity an interface hides is deferred, not removed, and it returns precisely when a dependency behaves outside its advertised contract. This is why the operative discipline is to understand at least one layer below where you work — enough of the implementation to diagnose the leak when the contract silently fails.`,
      more: `Real building is mostly plumbing: you take a database someone else wrote, a payment service, a mapping library, and glue them together with a thin layer of your own. You almost never own the whole stack, and you trust each borrowed part to honour its promise. Mostly it does — until it doesn't. The complexity those interfaces hid was only deferred, never deleted. The day a borrowed part is mysteriously slow, or fails in a way its manual never mentioned, the sealed "how" leaks through and you are suddenly forced to look inside something you didn't build.`,
      example: `Your phone's cloud photos look like a folder — an interface. Underneath: data centres, sync protocols, retries over flaky radio. The abstraction holds right up until you board a plane and the "folder" is suddenly empty — the network below leaked through. Nothing broke; a hidden assumption surfaced. Every "it works on my machine" story is this, somewhere in the stack.`,
    },
  },
  {
    id: "defensive",
    tag: "defense",
    eyebrow: "Assembling · robustness",
    fragment: `Assume the outside will betray you.`,
    sub: `Networks drop, code drifts, truths diverge, inputs lie, split work collides, load surges — build to stay standing anyway.`,
    anchor: `Reliable systems are built defensively and flexibly, because in the real world things fail and change constantly: the network will fail, code and data will drift, multiple sources of truth will diverge, outside input cannot be trusted, splitting work across machines breeds race conditions, and rising load (scale) strains every resource. Good engineering expects all of this and keeps standing — validate inputs, tolerate failure, don't assume one true copy, guard shared work. Keep it concrete and avoid security jargon. This is the "build for a hostile, changing world" rung.`,
    seeds: {
      threads: `Input validation — never trusting data from outside until you've checked it.
Race conditions — bugs that appear only when two tasks touch the same thing at once.
Fault tolerance — staying correct even when parts fail or messages go missing.
Backpressure — how a system pushes back when incoming load outruns its capacity.`,
      synthesis: `Reliable systems are engineered under adversarial and failure assumptions rather than the happy path. Input crossing a trust boundary is validated and sanitised, since unchecked external input is a primary attack and failure vector. Networks are unreliable — messages are delayed, reordered, lost, or partitioned — and independent components fail independently, so fault tolerance and graceful degradation are designed in. Shared mutable state under concurrency invites race conditions; replicated state tends to diverge, forcing explicit consistency choices; and rising load stresses finite resources, demanding capacity planning and backpressure. Robustness is the deliberate anticipation of all these, so the system stays correct and standing when parts misbehave.`,
      more: `Anything that leaves your own machine is entering hostile territory. The network will drop mid-request. The data source you trusted last month will quietly change shape. Two copies of "the truth" — two servers, two caches — will disagree. The input a stranger types will be malformed, or malicious, on purpose. Split a job across machines and they'll trip over each other in ways that surface one time in a thousand. Load will spike the day you aren't watching. A robust system assumes every one of these and stays standing — it treats the outside world as something that will betray it, because it will.`,
      example: `Two cash machines, one account with $100 left. You and your partner withdraw at the same instant, on opposite sides of town. Each machine checks the balance — $100, fine — and each hands out $100. The account assumed only one thing would touch it at a time. Splitting the work across two machines quietly broke that assumption, and the bank is out $100. No component "failed"; an unguarded shared truth got touched twice at once. Defensive design is spending effort on exactly these boring-until-catastrophic edges.`,
    },
  },

  /* ---------- RECURRING IDEAS (base plate) ---------- */
  {
    id: "recurring",
    tag: "recurring",
    eyebrow: "Recurring · the base plate",
    fragment: `A few ideas recur at every rung.`,
    sub: `Understand one layer below · everything is a tradeoff · the map is never the territory.`,
    anchor: `A step-back interlude naming ideas that reappear on every rung rather than living on one. Three of them: (1) it pays to understand one layer below — you can use the top without the bottom, but each level you grasp deeper stops being magic; (2) everything is a tradeoff — almost nothing is simply good, so choose the sacrifice on purpose, not by accident; (3) the map is not the territory — squeezing a messy real want into symbols always drops something, so a metric is not the goal, a model is not the world, a spec is not the need, and the deepest failures live in that gap. These were foreshadowed earlier and will keep returning; keep it as synthesis, not a fourth topic.`,
    seeds: {
      threads: `The CAP tradeoff — in a network split, choose consistency or availability, not both.
One layer below — the single habit that turns "magic" into visible cause.
Map vs territory — a metric isn't the goal, a model isn't the world.
Goodhart's law — the sharpest form of that gap, where a target stops measuring.`,
      synthesis: `A few meta-principles recur across every layer. First, understand one layer below: because abstractions leak, diagnosis requires knowledge of the implementation just beneath you. Second, ubiquitous tradeoffs — time versus space, latency versus throughput, consistency versus availability (the CAP tension), safety versus liveness — mean no design is strictly optimal; you choose which cost to bear. Third, representation is lossy: the map is not the territory, so a metric is not the objective, a model is not the world, and a specification is not the requirement. Most deep failures live in that gap, and Goodhart's law is its sharpest instance.`,
      more: `Some ideas aren't rungs; they run the length of the whole ladder. First: understand one layer below. You can drive without engines and code without transistors, but the moment something breaks, whoever knows the floor beneath stops seeing magic and starts seeing cause. Second: everything is a tradeoff — faster costs simpler, safer costs quicker, cheaper costs later; the wise move is choosing which to sacrifice on purpose. Third: the map is not the territory — every time you squeeze a messy real thing into symbols, something is left out. A metric isn't the goal, a model isn't the world, a spec isn't the need — and the deepest failures hide in that gap.`,
      example: `A hospital decides to grade its emergency rooms on one number: average wait time. Sensible — until the map replaces the territory. Staff start logging patients as "seen" at the door, or steering away the complicated cases that would blow the average. The number improves; care gets worse. The metric was a thin map of a rich thing called "good treatment," and once it became the target, people optimized the map and quietly abandoned the territory. The same trap sits under gamed benchmarks, teaching to the test, and models that ace their score while missing the point.`,
    },
  },

  /* ---------- LEARNING FROM DATA ---------- */
  {
    id: "space",
    tag: "points in space",
    eyebrow: "Learning · representation",
    fragment: `Turn anything into points in space.`,
    sub: `Emails, faces, sentences — all become coordinates, arranged so that similar things sit close.`,
    anchor: `The move that starts machine learning: represent anything — a photo, a word, a customer — as a point in a space of numbers, engineered so that similar things land near each other and different things land far apart. Once meaning becomes distance, "find similar," "group," and "recommend" turn into geometry. This is representation again (foreshadowed by the root), now aimed at learning. Keep concrete; don't explain embedding math or dimensions. Differentiate from the neighbouring rungs: this is the spatial-representation idea, not correlation and not generalization.`,
    seeds: {
      threads: `Embeddings — learned coordinates where similar things end up close together.
Distance metrics — measuring similarity as Euclidean or cosine distance.
Nearest-neighbour search — turning "find similar" into "find what's nearby".
Curse of dimensionality — why intuition breaks when a space has thousands of axes.`,
      synthesis: `Machine learning begins by representing entities as feature vectors — points in a high-dimensional space engineered so that semantic similarity corresponds to geometric proximity. Learned representations, or embeddings, place related items near one another under a distance such as Euclidean or cosine, without any explicit definition of the categories involved. Once data are points, cognitively framed tasks reduce to geometry: similarity becomes nearness, grouping becomes clustering, retrieval becomes nearest-neighbour search, and classification becomes drawing decision boundaries. This reframing of meaning as measurable distance is what lets numerical methods operate on words, images and users at all.`,
      more: `Before a machine can learn about something, it has to place it. So it turns each thing — a song, a face, a sentence — into a list of numbers, which is just a point in space. The trick is arranging that space so meaning becomes distance: two jazz tracks land near each other, a jazz track and a death-metal track land far apart, without anyone writing down what "jazz" is. Once ideas are points, hard questions become easy geometry — "what's similar?" becomes "what's nearby?", "what groups exist?" becomes "where are the clusters?" Meaning, quietly rebuilt as a map.`,
      example: `Every "because you watched…" is this. The service placed each film as a point in a vast space of taste — not by genre labels, but by who enjoys what. Your own history is a point too. To recommend, it simply looks around your neighbourhood and hands you what's close. It has no idea what a "heist thriller" means; it only knows your point sits near those points. Similarity became distance, taste became a map, and picking a movie became looking at what your nearest neighbours liked.`,
    },
  },
  {
    id: "correlation",
    tag: "correlation",
    eyebrow: "Learning · what patterns are",
    fragment: `Patterns are correlation, not causation.`,
    sub: `Data shows what goes together, never why — and the world drifts away from the snapshot you trained on.`,
    anchor: `Models find correlations — what tends to occur with what — not reasons or causes. Prediction is not explanation: knowing two things move together does not tell you one drives the other, or that a hidden third thing drives both. Worse, the data is a snapshot; the world keeps moving, so patterns learned yesterday quietly go stale (drift), with no warning. Keep concrete. Differentiate from neighbours: this rung is correlation-not-cause plus drift; the spatial rung was representation, and the next rung is generalizing to unseen cases.`,
    seeds: {
      threads: `Confounders — a hidden common cause that makes two unrelated things move together.
Causal inference — tools for asking "what if we intervened?", not just "what co-occurs?".
Distribution shift — why a model quietly rots as the world drifts from its training data.
Prediction vs explanation — knowing what will happen without knowing why.`,
      synthesis: `Learned models capture statistical association — which variables co-occur — not causal structure. Correlation supports prediction but not intervention or explanation: a confounder, a common cause, can make two effects track each other with no causal link between them, so acting on one changes nothing. Prediction is therefore not explanation. Compounding this, training data is a snapshot of a distribution that is non-stationary; as the world evolves, the input and label distributions shift — distribution shift, or concept drift — and a model's once-sharp correlations decay silently after deployment, usually with no error signal, only quietly worse predictions.`,
      more: `A model learns what goes with what. Umbrellas go with rain, certain words go with spam, certain purchases go with fraud. That is correlation, and it is genuinely useful — but it is not a reason. The model can't tell whether A causes B, B causes A, or some third thing quietly causes both. It predicts; it does not explain. And there is a second catch: the data is a photograph of a moving world. Tastes shift, fraudsters change tactics, words gain new meanings — so a pattern that was sharp last year slowly goes blurry, and nobody rings a bell when it does.`,
      example: `Across a summer, ice-cream sales and drownings rise and fall together, almost perfectly. A model would happily "predict" one from the other. But banning ice cream saves no swimmers — a third thing, hot weather, drives both. That is correlation in a convincing disguise. Now add drift: train a model on last decade's shopping and loose it today, after a pandemic rewired how people buy. The correlations it trusted have quietly moved, and its confident predictions are answering a world that no longer exists.`,
    },
  },
  {
    id: "generalization",
    tag: "generalizing",
    eyebrow: "Learning · the real goal",
    fragment: `Learning means guessing well on the unseen.`,
    sub: `Not memorizing the examples — generalizing to tomorrow's. We can only estimate that, and must expect some error.`,
    anchor: `Success is graded only on held-out, unseen cases: the goal is generalization, not memorizing the training examples. Because the true future can never be tested, we estimate generalization with proxies — a held-back test set — and must accept a residual error: the model will be wrong on some unseen cases, and honest practice prepares for that rather than hiding it. Differentiate from neighbours: the previous rung was correlation and drift; this rung is the memorization trap and honest evaluation; the next is per-prediction uncertainty.`,
    seeds: {
      threads: `Overfitting — memorising the training noise instead of the real underlying pattern.
Train/test split — hiding some data away to grade the model honestly.
Bias–variance tradeoff — balancing a too-simple model against a too-flexible one.
Cross-validation — squeezing an honest estimate of generalisation out of limited data.`,
      synthesis: `The objective of learning is generalisation — low expected error on the underlying data distribution — not minimal error on the training sample, which pure memorisation can drive to zero. Because the true distribution is unobservable, generalisation error is estimated on a held-out test set standing in for unseen data. The characteristic failure is overfitting: fitting the sample's noise and idiosyncrasies rather than the signal, giving low training error but high test error. Some generalisation gap is irreducible, so honest practice reports held-out performance, treats residual error as expected, and manages the bias–variance balance instead of chasing a perfect training fit.`,
      more: `The point was never to ace the questions you have already seen — a model that simply memorizes every training example can score perfectly and still be worthless, because the real test is the case it has never met. So we hide some data away, train on the rest, and grade only on the hidden part, as a stand-in for the unknown future. But that stand-in is only a proxy: the true future is untestable, so some error on genuinely new cases is guaranteed, not a bug. Honest work names that residual error out loud and plans around it, instead of trusting a suspiciously perfect score.`,
      example: `Train a model on photos to tell huskies from wolves and it may perform brilliantly — until you discover it learned "snow in the background means wolf." It aced everything it had seen using a shortcut that collapses on anything unseen. The whole discipline in one story: generalization is the goal, correlation is the trap, and the held-out test is the only honest judge.`,
    },
  },
  {
    id: "uncertainty",
    tag: "how sure?",
    eyebrow: "Learning · trust",
    fragment: `A prediction is only useful if you know how much to trust it.`,
    sub: `A guess without its confidence is half a guess — "probably rain" and "certainly rain" are different decisions.`,
    anchor: `A prediction without a calibrated sense of its own reliability is dangerous, because it invites equal trust in a near-certainty and a wild guess. Good models report how sure they are, and that confidence must be honest (calibrated): of all the times it says 70%, it should be right about seventy in a hundred. Knowing the uncertainty changes the decision — act on the confident call, verify or hedge the shaky one. Keep concrete. This rung quietly foreshadows the whole AI section's "probably right" theme.`,
    seeds: {
      threads: `Calibration — when a model says 70%, is it actually right about 70% of the time?
Aleatoric vs epistemic — the world's irreducible noise versus the model's own ignorance.
Confidence intervals — putting honest error bars around an estimate.
Decision thresholds — how much confidence you demand should rise with the stakes.`,
      synthesis: `A point prediction is only actionable alongside a calibrated estimate of its own reliability: when a model outputs 70% it should be correct on about 70% of such cases (calibration). Uncertainty has two sources — aleatoric, the irreducible noise in the world (a fair coin), and epistemic, the model's own ignorance from limited or unrepresentative data, which shrinks as data grows. Distinguishing them matters because they warrant different responses. Sound decisions condition on confidence: act on high-confidence predictions, and defer, hedge, or gather more data on low-confidence ones. A prediction without its uncertainty is only half the information.`,
      more: `Two predictions can read identically — "it will rain" — while one is a near-certainty and the other barely better than a coin flip. Strip the confidence away and you can't tell them apart, so you over-trust the guess and under-trust the sure thing. A good model reports both the answer and how sure it is, and that number has to be honest: of all the times it says 70%, it should be right about seventy in a hundred. That is what lets you act — lean hard on the confident calls, double-check or hedge the shaky ones. A number without its uncertainty is only half the information.`,
      example: `A phone weather app says "70% chance of rain." That single figure quietly runs your morning: at 70% you grab an umbrella but still walk; at 99% you drive; at 10% you don't bother. Now imagine it only ever said "rain" or "no rain," with no number. You'd be soaked half the time and paranoid the other half, unable to tell a hunch from a lock. The forecast's real product isn't the prediction — it's the calibrated confidence attached to it, because that is what you actually decide with.`,
    },
  },

  /* ---------- THE AI PARADIGM ---------- */
  {
    id: "nextword",
    tag: "next word",
    eyebrow: "The AI paradigm · the task",
    fragment: `Modern AI just predicts the next word.`,
    sub: `Guess the next word well enough, over enough of everything, and grammar, facts and even reasoning arrive as side effects.`,
    anchor: `Large language models are trained on one embarrassingly simple task: given some text, predict the next word (token), across vast corpora. Done well enough, grammar, facts, style and something like reasoning emerge as side effects nobody hand-coded. The twist the user stresses: the training data becomes part of the "codebase" — behaviour is shaped by what it read — so control over output quality becomes probabilistic and harder to guarantee than ordinary code. Keep concrete. Differentiate from the next rungs: this is the task plus emergent abilities plus data-as-codebase; scale, economics and the probabilistic-layer shift come after.`,
    seeds: {
      threads: `Tokens — the sub-word chunks a model actually reads and predicts.
Self-supervised learning — training with no labels, just "predict the next piece".
Emergent abilities — skills that appear only once a model is big enough.
Fine-tuning — nudging a general model toward one specific behaviour.`,
      synthesis: `Contemporary large language models are autoregressive sequence models trained by self-supervised next-token prediction — maximising the likelihood of the next token given preceding context, over vast corpora. From that single objective, competencies emerge without being explicitly programmed — syntax, factual recall, style, and reasoning-like behaviour — because predicting text well demands them. A consequence the classical stack lacks: the training corpus is effectively compiled into the parameters and thus into behaviour, so the model cannot be edited line by line. Output quality is steered probabilistically — via prompting, fine-tuning, decoding parameters — rather than guaranteed by construction.`,
      more: `The training task is almost insultingly simple: show the machine a stretch of text and have it guess the next word — then again, and again, across most of what humanity has written. Do that well enough and something strange happens: to predict words this accurately it has to pick up grammar, facts, tone, and patterns that look a lot like reasoning — none of it programmed in, all of it a side effect of getting the next word right. But notice what changed: the text it read is now effectively part of its code. You can't open it and fix a line — its "knowledge" is baked into billions of nudged numbers, and steering the output becomes a matter of probability, not a guarantee.`,
      example: `Ask one to write a contrite email to your landlord about a late payment. There is no "apology module" inside. It has simply read so much apology, negotiation and email that continuing your prompt in a plausible way — one word at a time — produces a serviceable letter. The unsettling part is the range: the very same next-word reflex also drafts code, explains tax law, and mimics a poet. One monotonous trick — guess what comes next — stretched over almost everything ever written, with competence falling out as a side effect.`,
    },
  },
  {
    id: "scale",
    tag: "scale",
    eyebrow: "The AI paradigm · the engine",
    fragment: `Scale is the engine — and it runs on GPUs.`,
    sub: `Billions of knobs, trillions of words of training. It works only when huge, and huge means massive parallel arithmetic.`,
    anchor: `The next-word trick only produces its magic at enormous scale: models carry hundreds of billions of adjustable parameters ("knobs") tuned on trillions of tokens. That scale is enabled by hardware (GPUs, built for massive parallel arithmetic) and by software (frameworks that parallelize and optimize that arithmetic). Past certain scales, new abilities appear as if from nowhere (emergence). The AI boom is, underneath, a hardware-and-arithmetic boom. Keep concrete. Differentiate from neighbours: the previous rung was the task; this rung is why scale + GPUs; the next is the train-once economics.`,
    seeds: {
      threads: `Scaling laws — how capability improves predictably with size, data and compute.
Why GPUs — thousands of simple units doing matrix arithmetic all at once.
FLOPs — the raw count of operations that measures what training costs.
Emergence — abilities that switch on abruptly past a certain scale.`,
      synthesis: `The next-token objective yields its striking capabilities only at scale, and scale is quantifiable: performance improves predictably with parameters, training data, and compute (empirical scaling laws). The computation is overwhelmingly dense linear algebra — matrix multiplications — which maps onto the massively parallel arithmetic of GPUs and TPUs; hence the boom is, at bottom, an accelerator and FLOPs boom. Beyond the smooth trend, some abilities appear abruptly past scale thresholds (emergence), absent in smaller models. The frontier is therefore as much a systems-and-hardware problem — parallelism, memory bandwidth, interconnect — as it is a modelling one.`,
      more: `Left small, the next-word trick is a party toy. Its power only switches on at scale: hundreds of billions of internal knobs, tuned against trillions of words. Turning those knobs means doing staggering amounts of simple arithmetic all at once — which is exactly what a GPU, a chip originally built to paint millions of game pixels per frame, happens to be great at. So the AI boom is, under the hood, a GPU-and-arithmetic boom. And scale does something eerie: abilities a smaller model simply lacks — following instructions, doing arithmetic, translating — can appear almost suddenly once the thing is big enough, as if they were waiting for the size.`,
      example: `The chips at the centre of the AI gold rush weren't designed for AI at all. GPUs were built to render video-game worlds — thousands of tiny, identical lighting sums computed in parallel, every frame. It turns out that training a language model is the same shape of work: oceans of tiny multiplications, all at once. So the hardware that once drew explosions in shooters now tunes the billions of knobs behind a chatbot. When you hear a company bought a hundred thousand GPUs, that is what they're buying: raw parallel arithmetic, the actual engine under the "intelligence."`,
    },
  },
  {
    id: "trainonce",
    tag: "train once",
    eyebrow: "The AI paradigm · the economics",
    fragment: `Learn once, expensively. Use it a billion times, cheaply.`,
    sub: `One costly general model, frozen, then pointed at thousands of tasks — increasingly acting, not just answering.`,
    anchor: `The economics flip: training a large model costs a fortune, once; afterwards the model is frozen and can be used countless times for a tiny cost each. One general model, trained on no task in particular, gets pointed at thousands of specific jobs. And the frontier is shifting from answering (produce text) to acting (call tools, take steps, carry out goals) — agents. Keep concrete. Differentiate from neighbours: the previous rung was scale and hardware; this rung is the cost asymmetry and the shift to acting; the final rung is what that does to trust.`,
    seeds: {
      threads: `Training vs inference — the costly one-time fit versus cheap, repeated use.
Foundation models — one general model adapted to many downstream tasks.
Zero- and few-shot — solving tasks it was never explicitly trained on.
Agents — models that don't just answer but call tools and take actions.`,
      synthesis: `There is a sharp cost asymmetry between the two phases. Training — fitting billions of parameters over enormous corpora — is a massive, largely one-off compute expenditure; inference, running the frozen model to answer a query, is comparatively cheap and repeatable. This economics underwrites the foundation-model pattern: pretrain one general model at great cost, then adapt it to many downstream tasks it was never specifically trained for, via prompting or light fine-tuning (zero- and few-shot transfer). The trajectory runs from answering toward acting — agentic systems that invoke tools and take multi-step actions under a goal — amortising the one-time training cost across vast, varied use.`,
      more: `There are two very different price tags. Training the model is monstrous — months of thousands of chips, enormous cost, done once. But the finished model is then frozen, a fixed pile of numbers, and running it to answer you costs a rounding error by comparison. That asymmetry is the whole business model: pay the fortune a single time, then serve a billion uses for pennies each. Stranger still, that one general model — trained on nothing in particular — gets aimed at thousands of specific jobs. And increasingly it doesn't just answer; it acts: clicking, calling tools, taking steps toward a goal you handed it.`,
      example: `Think of a printing press. Setting the type is slow, skilled, expensive — but done once, you can run off a hundred thousand identical pages for the cost of paper. A trained model is the set type: the hard, costly work is finished and frozen. The same frozen model then drafts your email, summarizes a contract, writes a birthday poem and fixes a bug before lunch — none of which it was specifically built for. One expensive casting, endless cheap impressions — and lately the press has begun to fetch its own paper and ink: doing, not just printing.`,
    },
  },
  {
    id: "probably",
    tag: "the new layer",
    eyebrow: "The AI paradigm · the shift",
    fragment: `The new layer only promises to be probably right.`,
    sub: `We're swapping exact translators between layers for statistical ones — more reach, weaker guarantee. Keep the verifying step.`,
    anchor: `Every previous layer of the stack was a deterministic, inspectable translation — a compiler is right, or it is a compiler bug. AI turns the translation between layers (intent → code, goal → plan, question → decision) statistical: it guesses where every layer below computed. This trades control for reach and precision for expressiveness — natural language is richer AND vaguer than code, which is exactly why programming languages were invented; automation walks that back. It fails quietly and fluently: confident, well-formed, wrong. What is genuinely new: for the first time the layer you trust does not promise to be right, only probably right — so the human verifying step, which deterministic layers let us safely automate away, must be kept. This very deck runs on such a layer; the lecturer on stage is the verifying step.`,
    seeds: {
      threads: `Deterministic vs statistical — a compiler is always right; this layer is right on average.
Fluent wrongness — confident, well-formed answers that happen to be false.
Verification — why the human checking step is the one thing we can't automate away.
Natural-language interfaces — trading precision for reach, and why that cuts both ways.`,
      synthesis: `Every earlier layer of the stack was a deterministic, inspectable translation — a compiler maps source to machine code identically each time. The new layer performs statistical translation of intent to code, goal to plan, question to decision: correct in expectation, by construction, not with certainty. Its failure mode is distinctive — not a loud crash but fluent, well-formed, confident error. It trades precision for expressive reach, since natural language is richer and vaguer than formal code (the very reason programming languages exist). The structural shift is that correctness weakens from guarantee to likelihood, so the verifying step that deterministic layers let us safely drop must now be deliberately retained.`,
      more: `For seventy years the deal was simple: each layer translated the one above it exactly. A compiler turns your code into machine steps the same way every time — inspectable, reproducible, boringly right. The new layer breaks that deal on purpose. Asked to turn intent into code, or a goal into a plan, it guesses, because it was built to be right most of the time, not always. That buys enormous reach: you can address it in messy human language instead of precise code. But messy human language is exactly what we invented programming languages to escape, because it is vague. So the gain is expressiveness and speed; the price is that this layer, uniquely, doesn't promise correctness — only probability. It fails not with a crash but with a fluent, confident wrong answer.`,
      example: `This slide is the example. The panel you are reading is produced by exactly the kind of probabilistic layer the fragment describes. It has been right all lecture — has it? The lecturer standing here is the verifying step: reading, judging, correcting in front of you. Keep that role, and the new layer is a triumph. Automate it away, and fluent wrongness ships to production.`,
    },
  },
];

/* ------------------------------------------------------------
   PROBES — each is a prompt template. Add or reword freely.
   ------------------------------------------------------------ */
export const ACTIONS = [
  {
    id: "more",
    label: "Tell me more",
    task: "Deepen the idea one level: reveal the mechanism behind the fragment, still fully graspable by a lay listener.",
  },
  {
    id: "example",
    label: "Give an example",
    task: "Give ONE concrete, everyday example that instantiates the fragment — a small scenario or story, not a definition.",
  },
  {
    id: "synthesis",
    label: "Technical synthesis",
    task: "State the fragment's content precisely and comprehensively: a compact technical synthesis in correct domain terminology, staying close to the intended meaning, for a scientifically literate reader.",
  },
  {
    id: "differently",
    label: "Explain it differently",
    task: "Re-explain the fragment through a completely different analogy or register than anything used before. Surprise, but stay strictly accurate.",
  },
  {
    id: "risk",
    label: "What limitations/risks?",
    task: "Give a synthethic description of the limitations (with respect to issues / questions of computer science or data science) that derive from this idea or the risks that stem from it.",
  },
  {
    id: "bite",
    label: "An example that bites?",
    task: "Show where this idea bites in the real world: one concrete failure, cost or consequence of ignoring it.",
  },
  {
    // Cross-probe: buildPrompt feeds this probe the slide's technical synthesis
    // as context, and asks for a few deeper "threads" to pull.
    id: "threads",
    label: "Threads to pull",
    task: "From the technical synthesis, surface a few concrete 'threads' — specific concepts, mechanisms, terms or open questions — that a curious, technically-minded listener could pull to go one level deeper.",
  },
];
