# Stake - Prelude : To understand how modern AI works and what are its possibilities and limitations, one has to have a sufficient good understanding of how computers work and how data can be used

# Root [1] : How computers work and how is data used (layman primer on computer science, data science and software engineering)

## Root perspective 1 : Information becomes real by climbing layers. Electricity at the bottom, meaning at the top.

## Root perspective 2 : Computing is transforming representations of information under constraints of resources.

## Root perspective 3 : How computers & data work. A climb (stack of abstractions) from physical switches up to AI, each rung built on the one below.

# The machine / Hardware - How computers run at all

## [2] It's all switches, 0 and 1's, every information is huge piles of on/off (numbers, letters, texts, images)

## [3] The CPU does tiny dumb operations (move, copy, add, compare) insenely fast, computation is transforming symbols by mechanical rules (no magic, deterministicly)

## [4] The OS organizes and shares computing ressources (compute, memory), so fast that tasks / programs appear simultaneous, most times

## [5] Fast memory is tiny and fast, large memory is large and slow (tradeoff)

# Instructing / taming the machine - Say what to do, and do it efficiently

## [6] Code is machine steps written in words (translating human language to machine instructions)

## [7] An algorithm is a receipe, a list of instructions. Some receipes are more efficient than other, how they scale is what matters. Among other things, don't redo work (cache) and measure before optimizing and beware of the metric

# Assembling systems - managing complexity - enduring and reliable systems

## [8] Difficult tasks are often stacks of simpler task handled by purpose specific programs / receipes, modern computer and systems are stacks of complexity hidden behind abstract interfaces (separating the "what" from the "how")

## [9] Performing complex tasks is almost always glueing things together and assuming the machinery behind the interface will behave as expected (until it leaks and forces you to look inside, complexity is defered, not gone). You almost never own the full stack or work from scrath.

## [10] When assembling computers, programs, sources : one has to build / behave defensively and flexibly : network will fail, code will drift, multiple sources of truth will diverge, outside input should not be trusted, spliting work may generate race conditions, load increase (scale) will pull on ressources, etc

# Cross-cutting principles [11]

## Useful to understand one level below

## Everything is a tradeoff

## The map is not the territory (and abstracting is selecting what and what not to specify)

# Learning from Data - Find pattern instead of hand writting rules

## [12] Turn information as points in space, similar things are close in space

## [13] Patterns are correlation, not causation (and the world tend to drift from snapshots)

## [14] Learning means guessing well on the unseen (not memorizing the examples, test via proxies of the generalization error, and admit / be prepared for generalization error)

## [15] A prediction is only helpful if you now how much to trust it

# The AI paradigm 

## [16] Predict the next word, trained on huge corpora of text - guess the next word well enough for enough circonstances and it picks up grammar, facts even what appears as reasoning (intelligence). Yet, the training data becomes part of the "codebase" and control of the output quality / guarantee becomes harder and probabilistic.

## [17] Scale is the engine - It is enabled by both hardware advances (GPUs) and software advances (optimizing massive and parallelized arithmetic) - billions of knobs, trillions of tokens to train on

## [18] Learn once (costly), use many times (cheap) — one expensive general model, frozen, then pointed at thousands of tasks — increasingly acting, not just answering.

## [19] Each layer of the stack is a precise, deterministic translation of the one above. With AI and automation, we are replacing deterministic translators between layers with probabilistic ones. Automation trades control for reach. Expressiveness vs. precision — intent is richer and vaguer than code. Natural language was never a precise interface; that is why programming languages were invented. Automation walks that back, trading precision for reach. What is genuinely new: for the first time, the layer you are trusting does not promise to be right, only to be probably right