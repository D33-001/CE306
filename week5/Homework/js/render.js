// js/render.js
// Pure(ish) UI rendering functions. Each render* function takes the current
// state and writes DOM into a fixed root container. Event wiring lives in
// app.js — this module only builds markup and attaches data-action hooks
// that app.js listens for via event delegation.

const root = document.getElementById("app-root");

// Tailwind class dictionaries — never string-concatenated, always looked up
// so the Tailwind content scanner sees full class names in source.
const HEALTH_VARIANTS = {
  healthy: "bg-emerald-700",
  injured: "bg-amber-600",
  critical: "bg-rose-700",
};

const HEALTH_TRACK = "bg-stone-300 dark:bg-stone-700 forced-colors:border forced-colors:border-2";

function healthVariant(ratio) {
  if (ratio > 0.5) return HEALTH_VARIANTS.healthy;
  if (ratio > 0.25) return HEALTH_VARIANTS.injured;
  return HEALTH_VARIANTS.critical;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

/* ------------------------------- Root Render ------------------------------ */

function render(state) {
  if (state.screen === "menu") renderMenu(state);
  else if (state.screen === "creator") renderCreator(state);
  else if (state.screen === "combat") renderCombat(state);
  else if (state.screen === "end") renderEnd(state);
  renderModal(state);
}

/* --------------------------------- Menu ----------------------------------- */

function renderMenu(state) {
  const difficulties = [
    { id: "normal", label: "Normal", desc: "A fair fight. Goblin Scavenger, standard AC." },
    { id: "veteran", label: "Veteran", desc: "Tougher foe. Orc Berserker, higher AC and damage." },
    { id: "nightmare", label: "Nightmare", desc: "A true test. Young Red Dragon, aggressive AI." },
  ];

  root.innerHTML = `
  <div class="min-h-screen flex flex-col items-center justify-center px-4 py-10 sm:px-6">
    <header class="max-w-2xl text-center mb-10">
      <h1 class="font-serif text-4xl sm:text-5xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
        Ledger of the Fifth Reckoning
      </h1>
      <p class="mt-3 text-stone-700 dark:text-stone-300 text-base sm:text-lg">
        A tactical, turn-based campaign built on the core rules of the fifth edition.
        Forge a hero, roll true dice, and survive the arena.
      </p>
    </header>

    <form id="menu-form" class="w-full max-w-xl bg-amber-50/60 dark:bg-stone-900 border border-amber-800/40 dark:border-stone-700 rounded-sm shadow-md p-6 sm:p-8">
      <fieldset>
        <legend class="font-serif text-xl font-semibold text-stone-900 dark:text-stone-100 mb-4 border-b border-stone-300 dark:border-stone-700 pb-2 w-full">
          Choose Your Difficulty
        </legend>
        <div class="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Difficulty">
          ${difficulties.map((d) => `
            <label class="relative flex flex-col gap-1 p-3 rounded-sm border cursor-pointer transition-colors
              ${state.difficulty === d.id
                ? "border-amber-700 ring-2 ring-amber-600 bg-amber-100/70 dark:bg-stone-800"
                : "border-stone-300 dark:border-stone-700 hover:bg-amber-100/40 dark:hover:bg-stone-800/60"}
              forced-colors:border forced-colors:border-2">
              <input type="radio" name="difficulty" value="${d.id}" class="sr-only"
                ${state.difficulty === d.id ? "checked" : ""} data-action="set-difficulty" />
              <span class="font-semibold text-stone-900 dark:text-stone-100">${d.label}</span>
              <span class="text-xs text-stone-600 dark:text-stone-400">${d.desc}</span>
            </label>
          `).join("")}
        </div>
      </fieldset>

      <div class="mt-6 flex flex-col sm:flex-row gap-3">
        <button type="button" data-action="begin-journey"
          class="flex-1 inline-flex justify-center items-center gap-2 rounded-sm bg-rose-800 hover:bg-rose-900 text-amber-50 font-serif font-semibold text-lg px-5 py-3 shadow-sm
          focus-visible:ring-2 focus-visible:ring-amber-500 focus:outline-none forced-colors:border forced-colors:border-2
          motion-reduce:transition-none transition-colors">
          Begin Journey <span class="sr-only">(starts the character creator)</span>
        </button>
        <button type="button" data-action="open-how-to-play"
          class="flex-1 inline-flex justify-center items-center gap-2 rounded-sm border border-stone-400 dark:border-stone-600 text-stone-900 dark:text-stone-100 font-semibold px-5 py-3
          hover:bg-stone-200/60 dark:hover:bg-stone-800 focus-visible:ring-2 focus-visible:ring-amber-500 focus:outline-none forced-colors:border forced-colors:border-2
          motion-reduce:transition-none transition-colors">
          How to Play
        </button>
      </div>
    </form>

    <p class="mt-6 text-xs text-stone-500 dark:text-stone-500 text-center max-w-md">
      Use <kbd class="px-1 py-0.5 border border-stone-400 dark:border-stone-600 rounded">Arrow keys</kbd> to move between controls, then press <kbd class="px-1 py-0.5 border border-stone-400 dark:border-stone-600 rounded">Enter</kbd> or
      <kbd class="px-1 py-0.5 border border-stone-400 dark:border-stone-600 rounded">Space</kbd> to confirm prompts,
      <kbd class="px-1 py-0.5 border border-stone-400 dark:border-stone-600 rounded">Escape</kbd> to close dialogs.
    </p>
  </div>`;
}

/* ------------------------------- How to Play ------------------------------- */

function renderModal(state) {
  let dialog = document.getElementById("how-to-play-dialog");
  if (!dialog) {
    dialog = document.createElement("dialog");
    dialog.id = "how-to-play-dialog";
    dialog.className = "rounded-sm border border-amber-800/40 dark:border-stone-700 bg-amber-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 p-0 max-w-lg w-[92vw] shadow-md backdrop:bg-stone-950/60";
    document.body.appendChild(dialog);
  }
  dialog.innerHTML = `
    <div class="p-6 sm:p-8">
      <h2 class="font-serif text-2xl font-bold mb-4">How to Play</h2>
      <div class="space-y-3 text-sm text-stone-800 dark:text-stone-200 max-h-[60vh] overflow-y-auto pr-1">
        <p><strong>Turn Flow.</strong> On your turn, take exactly one action — Attack, Cast Spell, use your Class Skill, Dodge, or Drink Potion — then press <strong>End Turn</strong> to pass control to the monster.</p>
        <p><strong>Ability Checks.</strong> Attacks roll a d20, add your ability modifier and proficiency bonus, and compare the total to the target's Armor Class (AC).</p>
        <p><strong>Advantage / Disadvantage.</strong> Roll two d20s and take the higher (advantage) or lower (disadvantage). Dodging and Entangle impose disadvantage on the next attack against the target.</p>
        <p><strong>Critical Hits.</strong> A natural 20 always hits and deals double damage dice. A natural 1 always misses.</p>
        <p><strong>Spells.</strong> Cantrips are free and unlimited. Leveled spells (1st, 2nd) cost a spell slot and unlock as you gain character levels.</p>
        <p><strong>Class Skills.</strong> Each martial class has a unique once-per-combat skill: Second Wind, Rage, Cunning Action, or Favored Foe.</p>
        <p><strong>Leveling.</strong> Defeating a monster grants Experience Points. Reaching a threshold levels you up (capped at Level 5).</p>
      </div>
      <div class="mt-6 flex justify-end">
        <button type="button" data-action="close-how-to-play"
          class="rounded-sm bg-stone-800 dark:bg-stone-700 text-amber-50 px-4 py-2 font-semibold hover:bg-stone-900 dark:hover:bg-stone-600
          focus-visible:ring-2 focus-visible:ring-amber-500 focus:outline-none forced-colors:border forced-colors:border-2">
          Close
        </button>
      </div>
    </div>`;

  if (state.modalOpen === "howToPlay" && !dialog.open) dialog.showModal();
  if (state.modalOpen !== "howToPlay" && dialog.open) dialog.close();
}

/* ------------------------------- Creator ----------------------------------- */

function renderCreator(state) {
  const { race, class: classId, gender, baseScores } = state.creator;
  const finalAbilities = computeFinalAbilities(baseScores, race);
  const cls = CLASSES[classId];
  const spent = pointBuyCost(baseScores);
  const remaining = 27 - spent;
  const ac = computeArmorClass(classId, finalAbilities);
  const initMod = computeInitiativeModifier(finalAbilities);
  const maxHp = computeMaxHp(classId, finalAbilities, 1);
  const maxSlots = computeMaxSpellSlots(classId, 1);
  const tier = maxSpellTier(1);
  const knownSpells = cls.spellList.filter((sid) => SPELLS[sid].tier <= tier);

  root.innerHTML = `
  <div class="min-h-screen px-3 py-6 sm:px-6 sm:py-8">
    <form id="creator-form" class="max-w-7xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <h1 class="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">Forge Your Hero</h1>
        <button type="button" data-action="back-to-menu"
          class="text-sm text-stone-600 dark:text-stone-400 underline hover:text-stone-900 dark:hover:text-stone-100
          focus-visible:ring-2 focus-visible:ring-amber-500 focus:outline-none rounded-sm">
          &larr; Main Menu
        </button>
      </div>

      <div class="grid gap-6 lg:grid-cols-[1.15fr_0.9fr_1fr]">
        <!-- Left: Origin & Point Buy -->
        <section aria-labelledby="origin-heading" class="bg-amber-50/60 dark:bg-stone-900 border border-amber-800/40 dark:border-stone-700 rounded-sm shadow-sm p-4 sm:p-5">
          <h2 id="origin-heading" class="font-serif text-lg font-semibold mb-3 text-stone-900 dark:text-stone-100 border-b border-stone-300 dark:border-stone-700 pb-2">Origin</h2>

          <fieldset class="mb-4">
            <legend class="text-sm font-semibold text-stone-800 dark:text-stone-200 mb-2">Race</legend>
            <div class="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Race">
              ${Object.values(RACES).map((r) => `
                <label class="p-2 rounded-sm border text-center cursor-pointer transition-colors
                  ${race === r.id ? "border-amber-700 ring-2 ring-amber-600 bg-amber-100/70 dark:bg-stone-800" : "border-stone-300 dark:border-stone-700 hover:bg-amber-100/40 dark:hover:bg-stone-800/60"}
                  forced-colors:border forced-colors:border-2">
                  <input type="radio" name="race" value="${r.id}" class="sr-only" ${race === r.id ? "checked" : ""} data-action="set-race" />
                  <span class="block text-sm font-medium text-stone-900 dark:text-stone-100">${r.name}</span>
                  <span class="block text-[11px] text-stone-600 dark:text-stone-400">${r.trait}</span>
                </label>`).join("")}
            </div>
            <p class="mt-2 text-xs text-stone-600 dark:text-stone-400">${RACES[race].traitDescription}</p>
          </fieldset>

          <fieldset class="mb-4">
            <legend class="text-sm font-semibold text-stone-800 dark:text-stone-200 mb-2">Class</legend>
            <div class="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Class">
              ${Object.values(CLASSES).map((c) => `
                <label class="p-2 rounded-sm border text-center cursor-pointer transition-colors
                  ${classId === c.id ? "border-amber-700 ring-2 ring-amber-600 bg-amber-100/70 dark:bg-stone-800" : "border-stone-300 dark:border-stone-700 hover:bg-amber-100/40 dark:hover:bg-stone-800/60"}
                  forced-colors:border forced-colors:border-2">
                  <input type="radio" name="class" value="${c.id}" class="sr-only" ${classId === c.id ? "checked" : ""} data-action="set-class" />
                  <span class="block text-sm font-medium text-stone-900 dark:text-stone-100">${c.name}</span>
                  <span class="block text-[11px] text-stone-600 dark:text-stone-400">${c.feature}</span>
                </label>`).join("")}
            </div>
            <p class="mt-2 text-xs text-stone-600 dark:text-stone-400">${cls.description} Recommended: ${cls.recommended.map((k) => ABILITY_LABELS[k]).join(", ")}.</p>
          </fieldset>

          <fieldset class="mb-5">
            <legend class="text-sm font-semibold text-stone-800 dark:text-stone-200 mb-2">Gender</legend>
            <div class="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Gender">
              ${["female", "male", "non-binary"].map((g) => `
                <label class="p-2 rounded-sm border text-center cursor-pointer capitalize transition-colors
                  ${gender === g ? "border-amber-700 ring-2 ring-amber-600 bg-amber-100/70 dark:bg-stone-800" : "border-stone-300 dark:border-stone-700 hover:bg-amber-100/40 dark:hover:bg-stone-800/60"}
                  forced-colors:border forced-colors:border-2">
                  <input type="radio" name="gender" value="${g}" class="sr-only" ${gender === g ? "checked" : ""} data-action="set-gender" />
                  <span class="text-sm font-medium text-stone-900 dark:text-stone-100">${g.replace("-", " ")}</span>
                </label>`).join("")}
            </div>
          </fieldset>

          <fieldset>
            <legend class="text-sm font-semibold text-stone-800 dark:text-stone-200 mb-2 flex items-center justify-between w-full">
              <span>Ability Scores (Point Buy)</span>
              <span class="text-xs font-normal ${remaining === 0 ? "text-emerald-700 dark:text-emerald-500" : "text-stone-600 dark:text-stone-400"}">
                ${remaining} points remaining
              </span>
            </legend>
            <div class="space-y-2">
              ${ABILITIES.map((key) => {
                const score = baseScores[key];
                const final = finalAbilities[key];
                const mod = abilityModifier(final);
                const isPrimary = cls.recommended.includes(key);
                return `
                <div class="flex items-center gap-2 p-2 rounded-sm border border-stone-200 dark:border-stone-800 ${isPrimary ? "bg-amber-100/50 dark:bg-stone-800/60" : ""}">
                  <span class="w-24 text-sm font-medium text-stone-900 dark:text-stone-100">
                    ${ABILITY_LABELS[key]} ${isPrimary ? '<span class="text-amber-700 dark:text-amber-500" title="Recommended">&#9733;</span>' : ""}
                  </span>
                  <button type="button" data-action="ability-decrease" data-key="${key}"
                    class="w-7 h-7 rounded-sm border border-stone-400 dark:border-stone-600 text-stone-800 dark:text-stone-100 font-bold
                    hover:bg-stone-200/70 dark:hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed
                    focus-visible:ring-2 focus-visible:ring-amber-500 focus:outline-none forced-colors:border forced-colors:border-2"
                    ${!canDecrease(baseScores, key) ? "disabled" : ""} aria-label="Decrease ${ABILITY_LABELS[key]}">&minus;</button>
                  <span class="w-8 text-center font-mono text-stone-900 dark:text-stone-100">${score}</span>
                  <button type="button" data-action="ability-increase" data-key="${key}"
                    class="w-7 h-7 rounded-sm border border-stone-400 dark:border-stone-600 text-stone-800 dark:text-stone-100 font-bold
                    hover:bg-stone-200/70 dark:hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed
                    focus-visible:ring-2 focus-visible:ring-amber-500 focus:outline-none forced-colors:border forced-colors:border-2"
                    ${!canIncrease(baseScores, key) ? "disabled" : ""} aria-label="Increase ${ABILITY_LABELS[key]}">+</button>
                  <span class="ml-auto text-xs text-stone-600 dark:text-stone-400">Final ${final} (${formatModifier(mod)})</span>
                </div>`;
              }).join("")}
            </div>
          </fieldset>
        </section>

        <!-- Center: Live Avatar Preview -->
        <section aria-labelledby="preview-heading" class="bg-amber-50/60 dark:bg-stone-900 border border-amber-800/40 dark:border-stone-700 rounded-sm shadow-sm p-4 sm:p-5 flex flex-col items-center">
          <h2 id="preview-heading" class="font-serif text-lg font-semibold mb-3 text-stone-900 dark:text-stone-100 border-b border-stone-300 dark:border-stone-700 pb-2 w-full text-center">Likeness</h2>
          <svg viewBox="0 0 100 120" class="w-48 sm:w-56 drop-shadow-sm" role="img" aria-label="Character preview: ${RACES[race].name} ${cls.name}, ${gender}">
            ${buildAvatarLayers({ race, class: classId, gender })}
          </svg>
          <p class="mt-3 text-sm text-stone-800 dark:text-stone-200 text-center font-medium">${RACES[race].name} ${cls.name}</p>
          <p class="text-xs text-stone-600 dark:text-stone-400 text-center capitalize">${gender.replace("-", " ")}</p>
          ${cls.skill ? `<p class="mt-3 text-xs text-center text-stone-700 dark:text-stone-300 border-t border-stone-300 dark:border-stone-700 pt-2 w-full"><strong>${cls.skill.name}</strong> &mdash; ${cls.skill.description}</p>` : ""}
        </section>

        <!-- Right: Derived Sheet -->
        <section aria-labelledby="sheet-heading" class="bg-amber-50/60 dark:bg-stone-900 border border-amber-800/40 dark:border-stone-700 rounded-sm shadow-sm p-4 sm:p-5">
          <h2 id="sheet-heading" class="font-serif text-lg font-semibold mb-3 text-stone-900 dark:text-stone-100 border-b border-stone-300 dark:border-stone-700 pb-2">Character Sheet</h2>
          <dl class="grid grid-cols-2 gap-3 text-sm mb-4">
            <div class="p-2 rounded-sm border border-stone-200 dark:border-stone-800">
              <dt class="text-stone-600 dark:text-stone-400 text-xs">Armor Class</dt>
              <dd class="font-mono text-lg font-semibold text-stone-900 dark:text-stone-100">${ac}</dd>
            </div>
            <div class="p-2 rounded-sm border border-stone-200 dark:border-stone-800">
              <dt class="text-stone-600 dark:text-stone-400 text-xs">Initiative</dt>
              <dd class="font-mono text-lg font-semibold text-stone-900 dark:text-stone-100">${formatModifier(initMod)}</dd>
            </div>
            <div class="p-2 rounded-sm border border-stone-200 dark:border-stone-800">
              <dt class="text-stone-600 dark:text-stone-400 text-xs">Hit Dice</dt>
              <dd class="font-mono text-lg font-semibold text-stone-900 dark:text-stone-100">1d${cls.hitDie}</dd>
            </div>
            <div class="p-2 rounded-sm border border-stone-200 dark:border-stone-800">
              <dt class="text-stone-600 dark:text-stone-400 text-xs">Max HP</dt>
              <dd class="font-mono text-lg font-semibold text-stone-900 dark:text-stone-100">${maxHp}</dd>
            </div>
          </dl>

          <h3 class="text-sm font-semibold text-stone-800 dark:text-stone-200 mb-1">Starting Equipment</h3>
          <ul class="text-sm text-stone-700 dark:text-stone-300 list-disc list-inside mb-4">
            ${cls.startingEquipment.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>

          ${knownSpells.length ? `
          <h3 class="text-sm font-semibold text-stone-800 dark:text-stone-200 mb-1">Level 1 Spells (${maxSlots} slot${maxSlots === 1 ? "" : "s"})</h3>
          <ul class="text-sm text-stone-700 dark:text-stone-300 list-disc list-inside mb-4">
            ${knownSpells.map((sid) => `<li>${SPELLS[sid].name} <span class="text-[11px] text-stone-500 dark:text-stone-500">${SPELLS[sid].tier === 0 ? "(cantrip)" : `(tier ${SPELLS[sid].tier})`}</span> &mdash; ${SPELLS[sid].description}</li>`).join("")}
          </ul>` : ""}

          <button type="button" data-action="venture-forth"
            class="w-full mt-2 inline-flex justify-center items-center gap-2 rounded-sm bg-rose-800 hover:bg-rose-900 text-amber-50 font-serif font-semibold text-lg px-5 py-3 shadow-sm
            focus-visible:ring-2 focus-visible:ring-amber-500 focus:outline-none forced-colors:border forced-colors:border-2
            motion-reduce:transition-none transition-colors">
            Venture Forth
          </button>
        </section>
      </div>
    </form>
  </div>`;
}

/* -------------------------------- Combat ------------------------------------ */

function renderCombat(state) {
  const { character } = state;
  const { monster, round, turn, log: combatLog, actionTakenThisTurn, spellMenuOpen } = state.combat;
  const playerRatio = Math.max(0, character.hp) / character.maxHp;
  const monsterRatio = Math.max(0, monster.hp) / monster.maxHp;
  const effectiveAc = character.ac + (character.shieldActive ? 5 : 0);
  const cls = CLASSES[character.class];
  const tier = maxSpellTier(character.level);
  const knownSpells = cls.spellList.filter((sid) => SPELLS[sid].tier <= tier);
  const canAct = turn === "player" && !actionTakenThisTurn;

  root.innerHTML = `
  <div class="min-h-screen relative overflow-hidden
    bg-gradient-to-b from-amber-100 via-amber-50 to-stone-100 dark:from-stone-800 dark:via-stone-900 dark:to-stone-950">
    <!-- Light-fantasy backdrop: soft sky glow, distant hills, floating motes -->
    <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
      <div class="absolute top-0 left-0 w-full h-2/3 bg-gradient-to-b from-amber-200/60 dark:from-amber-500/10 to-transparent"></div>
      <svg class="absolute bottom-0 left-0 w-full h-40 sm:h-56 opacity-70 dark:opacity-40" viewBox="0 0 400 100" preserveAspectRatio="none">
        <path d="M0 100 L0 60 Q 60 30 120 55 Q 200 20 260 50 Q 330 25 400 55 L400 100 Z" fill="#d9c9a3" class="dark:fill-stone-700"/>
        <path d="M0 100 L0 78 Q 80 55 160 75 Q 240 55 320 78 Q 360 65 400 78 L400 100 Z" fill="#c9b98f" class="dark:fill-stone-800"/>
      </svg>
      <div class="absolute top-8 right-10 w-16 h-16 rounded-full bg-amber-300/50 dark:bg-amber-400/10 blur-xl"></div>
      <div class="absolute top-16 left-16 w-10 h-10 rounded-full bg-amber-200/60 dark:bg-amber-300/10 blur-lg"></div>
    </div>

    <div class="relative max-w-6xl mx-auto px-3 py-4 sm:px-6 sm:py-6">
      <!-- Tactical Header -->
      <header class="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-stone-400/60 dark:border-stone-700">
        <div class="flex items-center gap-3 flex-wrap">
          <h1 class="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">Round ${round}</h1>
          <span class="text-xs px-2 py-1 rounded-sm border border-stone-500/60 dark:border-stone-600 text-stone-700 dark:text-stone-300 bg-amber-50/70 dark:bg-stone-900/70 forced-colors:border-2">
            Stage ${state.campaignStage}${state.combat.isFinalBoss ? " — Final Boss" : ""}
          </span>
          <span class="text-xs uppercase tracking-wide px-2 py-1 rounded-sm border border-stone-500/60 dark:border-stone-600 text-stone-700 dark:text-stone-300 bg-amber-50/70 dark:bg-stone-900/70 forced-colors:border-2">
            ${state.difficulty}
          </span>
          <span class="text-xs px-2 py-1 rounded-sm ${turn === "player" ? "bg-emerald-700 text-amber-50" : "bg-rose-800 text-amber-50"} forced-colors:border forced-colors:border-2">
            ${turn === "player" ? (actionTakenThisTurn ? "Your Turn — action spent" : "Your Turn") : "Enemy Turn"}
          </span>
        </div>
        <div class="flex gap-2">
          <button type="button" data-action="restart-match" title="Restart (R)"
            class="text-xs px-3 py-1.5 rounded-sm border border-stone-500/60 dark:border-stone-600 text-stone-700 dark:text-stone-300 bg-amber-50/70 dark:bg-stone-900/70
            hover:bg-stone-200/60 dark:hover:bg-stone-800 focus-visible:ring-2 focus-visible:ring-amber-500 focus:outline-none forced-colors:border forced-colors:border-2">
            Restart
          </button>
          <button type="button" data-action="back-to-menu" title="Escape"
            class="text-xs px-3 py-1.5 rounded-sm border border-stone-500/60 dark:border-stone-600 text-stone-700 dark:text-stone-300 bg-amber-50/70 dark:bg-stone-900/70
            hover:bg-stone-200/60 dark:hover:bg-stone-800 focus-visible:ring-2 focus-visible:ring-amber-500 focus:outline-none forced-colors:border forced-colors:border-2">
            Flee to Menu
          </button>
        </div>
      </header>

      <!-- HSR-style turn order strip: upcoming turn queue, current turn glows -->
      <div class="flex items-center gap-1.5 mb-3" role="list" aria-label="Turn order">
        ${Array.from({ length: 5 }, (_, i) => (turn === "player" ? i % 2 === 0 : i % 2 === 1) ? "player" : "monster")
          .map((who, i) => `
          <div role="listitem" class="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 flex items-center justify-center text-[10px] font-bold
            ${i === 0
              ? "border-amber-500 bg-amber-100 dark:bg-stone-800 shadow-[0_0_0_3px_rgba(245,158,11,0.35)] text-stone-900 dark:text-amber-300"
              : "border-stone-400/50 dark:border-stone-700 bg-stone-100/70 dark:bg-stone-900/70 text-stone-500 dark:text-stone-500 opacity-80"}"
            title="${who === "player" ? "You" : monster.name}">
            ${who === "player" ? "P" : "E"}
          </div>
          ${i < 4 ? `<div class="w-3 sm:w-4 h-px bg-stone-400/40 dark:bg-stone-700"></div>` : ""}
        `).join("")}
      </div>

      <!-- Scene: player in the foreground (large, bottom-left), monster further back
           (smaller, higher on the "horizon") for a third-person sense of depth. -->
      <div id="scene-viewport" class="mb-3">
      <div id="scene-stage" data-camera-side="${turn}">
        <div id="arena-sky" aria-hidden="true"></div>
        <svg id="arena-world" aria-hidden="true"></svg>
        <div class="arena-caption">${turn === 'player' ? 'Your perspective' : 'Enemy perspective'}<small>${turn === 'player' ? 'Choose your next move' : escapeHtml(monster.name) + ' is acting'}</small></div>
        <div id="fx-layer" class="absolute inset-0 z-20 pointer-events-none" aria-hidden="true"></div>
        <!-- ground line to sell the perspective -->

        <div id="camera-player" class="camera-actor">
          <div id="player-avatar-wrap" class="${character.hp <= 0 ? "anim-death" : "anim-idle-player"} relative z-10">
            <svg viewBox="0 0 100 120" class="actor-art" role="img" aria-label="${escapeHtml(RACES_LABEL(character.race))} ${cls.name}">
              ${buildAvatarLayers({ race: character.race, class: character.class, gender: character.gender })}
            </svg>
            <svg viewBox="0 0 100 20" class="actor-shadow" aria-hidden="true"><ellipse cx="50" cy="10" rx="34" ry="6" fill="#080f18" opacity="0.45"/></svg>
          </div>
        </div>

        <div class="arena-dice">
          <div id="d20-display" class="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center motion-reduce:animate-none" aria-hidden="true">
            <svg id="d20-shape" viewBox="0 0 100 100" class="absolute inset-0 w-full h-full drop-shadow-md">
              <polygon points="50,4 90,28 90,72 50,96 10,72 10,28" fill="#fefce8" stroke="#57534e" stroke-width="2.5" class="dark:fill-stone-800 dark:stroke-stone-400"/>
              <polygon points="50,4 90,28 50,50" fill="#fde68a" opacity="0.55"/>
              <polygon points="90,28 90,72 50,50" fill="#fbbf24" opacity="0.4"/>
              <polygon points="90,72 50,96 50,50" fill="#f59e0b" opacity="0.3"/>
              <polygon points="50,96 10,72 50,50" fill="#fbbf24" opacity="0.4"/>
              <polygon points="10,72 10,28 50,50" fill="#fde68a" opacity="0.55"/>
              <polygon points="10,28 50,4 50,50" fill="#fef3c7" opacity="0.65"/>
              <polygon points="50,4 90,28 90,72 50,96 10,72 10,28" fill="none" stroke="#57534e" stroke-width="1.5" class="dark:stroke-stone-400"/>
            </svg>
            <span id="d20-number" class="relative z-10 font-mono text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">&mdash;</span>
            <p id="d20-critical-text" class="hidden absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] sm:text-xs font-serif font-bold px-2 py-1 rounded-sm shadow-sm z-30"></p>
          </div>
          <p class="text-[11px] text-stone-600 dark:text-stone-400">D20 Arena</p>
          <p class="sr-only" role="status" aria-live="assertive" id="d20-sr-announce"></p>
        </div>

        <div id="camera-monster" class="camera-actor">
          <div id="monster-avatar-wrap" class="${monster.hp <= 0 ? "anim-death" : "anim-idle-monster"} relative">
            <svg viewBox="0 0 100 100" class="actor-art" role="img" aria-label="${escapeHtml(monster.name)}">
              ${buildMonsterSvg(monster.shape)}
            </svg>
            <svg viewBox="0 0 100 100" class="anim-reticle actor-reticle" aria-hidden="true">
              <circle cx="50" cy="50" r="46" fill="none" stroke="#be123c" stroke-width="1.5" stroke-dasharray="10 8" opacity="0.55"/>
              <circle cx="50" cy="50" r="2.5" fill="#be123c" opacity="0.7"/>
            </svg>
            <svg viewBox="0 0 100 20" class="actor-shadow" aria-hidden="true"><ellipse cx="50" cy="10" rx="30" ry="5" fill="#080f18" opacity="0.45"/></svg>
          </div>
        </div>
      </div>
      </div>

      <!-- Action Bar (HSR-style glass HUD cluster) -->
      <div class="battle-status">${playerPanel(character,effectiveAc)}${monsterPanel(monster)}</div>
      <div class="mb-3 rounded-2xl border border-amber-500/30 bg-stone-900/85 dark:bg-stone-950/85 backdrop-blur-sm p-2.5 shadow-lg">
        <h2 class="sr-only">Actions</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          ${actionButton("attack", "1", "Attack", `Weapon attack vs AC`, !canAct)}
          ${actionButton("toggle-spell-menu", "2", "Cast Spell", knownSpells.length ? `${character.spellSlots} slot(s) left` : "No spells known", !canAct || knownSpells.length === 0)}
          ${cls.skill ? actionButton("use-skill", "5", cls.skill.name, character.skillUsed ? "Already used" : "Once per combat", !canAct || character.skillUsed) : ""}
          ${cls.combatSkill ? actionButton("use-combat-skill", "6", cls.combatSkill.name, character.combatSkillUsed ? "Already used" : "Once per combat", !canAct || character.combatSkillUsed) : ""}
          ${actionButton("dodge", "3", "Dodge", "Impose disadvantage on foe", !canAct)}
          ${actionButton("drink-potion", "4", "Drink Potion", `${character.potionsRemaining} left, heals 2d4+2`, !canAct || character.potionsRemaining === 0)}
          <button type="button" data-action="end-turn" ${turn !== "player" || !actionTakenThisTurn ? "disabled" : ""}
            class="flex flex-col items-center justify-center gap-0.5 rounded-full border-2 border-amber-400 bg-gradient-to-b from-amber-500 to-amber-600 text-stone-900 px-3 py-2.5 font-serif font-bold
            hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:from-stone-500 disabled:to-stone-500 disabled:border-stone-500 disabled:text-stone-300
            focus-visible:ring-2 focus-visible:ring-amber-300 focus:outline-none forced-colors:border forced-colors:border-2 motion-reduce:transition-none transition-colors">
            End Turn
          </button>
        </div>

        ${spellMenuOpen ? spellMenuPanel(character, knownSpells, tier, canAct) : ""}
      </div>

      <!-- Combat Log -->
      <section aria-labelledby="log-heading">
        <h2 id="log-heading" class="text-sm font-semibold text-stone-800 dark:text-stone-200 mb-1">Combat History</h2>
        <output role="log" aria-live="polite" id="combat-log"
          class="block h-36 sm:h-40 overflow-y-auto text-sm bg-stone-100/90 dark:bg-stone-950/90 border border-stone-400/60 dark:border-stone-700 rounded-sm p-3 space-y-1 font-mono text-stone-800 dark:text-stone-200">
          ${combatLog.slice().reverse().map((entry) => `<p>${escapeHtml(entry)}</p>`).join("")}
        </output>
      </section>
    </div>
  </div>`;

  const logEl = document.getElementById("combat-log");
  if (logEl) logEl.scrollTop = 0;
}

function RACES_LABEL(raceId) {
  return RACES[raceId] ? RACES[raceId].name : "";
}

function playerPanel(character, effectiveAc) {
  const ratio = Math.max(0, character.hp) / character.maxHp;
  const clampedHp = Math.max(0, character.hp);
  const conditions = [
    character.dodging ? "Dodging" : null,
    character.shieldActive ? "Shielded (+5 AC)" : null,
    character.buffs?.rageActive ? "Raging" : null,
    character.buffs?.markBonusDice ? "Marked target" : null,
    character.buffs?.advantageNext ? "Advantage ready" : null,
  ].filter(Boolean);
  return `
  <div class="w-full max-w-[13rem] bg-amber-50/80 dark:bg-stone-900/80 border border-amber-800/40 dark:border-stone-700 rounded-sm shadow-sm p-2 mt-1">
    <div class="flex items-center justify-between mb-1">
      <h3 class="font-serif text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">${escapeHtml(RACES_LABEL(character.race))} ${escapeHtml(CLASSES[character.class].name)}</h3>
      <span class="text-[10px] font-mono px-1.5 py-0.5 rounded-sm border border-stone-400 dark:border-stone-600 text-stone-700 dark:text-stone-300 forced-colors:border-2">AC ${effectiveAc}</span>
    </div>
    <div class="w-full h-2.5 rounded-sm ${HEALTH_TRACK} overflow-hidden" role="progressbar" aria-valuenow="${clampedHp}" aria-valuemin="0" aria-valuemax="${character.maxHp}" aria-label="Your health">
      <div class="h-full ${healthVariant(ratio)} motion-reduce:transition-none transition-all duration-300" style="width:${Math.max(0, ratio * 100)}%"></div>
    </div>
    <p class="mt-1 text-[11px] font-mono text-stone-700 dark:text-stone-300">${clampedHp} / ${character.maxHp} HP</p>
    ${conditions.length ? `<p class="mt-0.5 text-[10px] text-amber-700 dark:text-amber-500 truncate">${conditions.join(", ")}</p>` : ""}
    <p class="mt-0.5 text-[10px] text-stone-600 dark:text-stone-400">${character.maxSpellSlots > 0 ? `Slots: ${character.spellSlots}/${character.maxSpellSlots}` : ""} Potions: ${character.potionsRemaining}/2</p>
  </div>`;
}

function monsterPanel(monster) {
  const ratio = Math.max(0, monster.hp) / monster.maxHp;
  const clampedHp = Math.max(0, monster.hp);
  const conditions = [monster.dodging ? "Dodging" : null, monster.entangled ? "Entangled" : null].filter(Boolean);
  return `
  <div class="w-full max-w-[13rem] bg-amber-50/80 dark:bg-stone-900/80 border border-amber-800/40 dark:border-stone-700 rounded-sm shadow-sm p-2 mt-1">
    <div class="flex items-center justify-between mb-1">
      <h3 class="font-serif text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">${escapeHtml(monster.name)}</h3>
      <span class="text-[10px] font-mono px-1.5 py-0.5 rounded-sm border border-stone-400 dark:border-stone-600 text-stone-700 dark:text-stone-300 forced-colors:border-2">AC ${monster.ac}</span>
    </div>
    <div class="w-full h-2.5 rounded-sm ${HEALTH_TRACK} overflow-hidden" role="progressbar" aria-valuenow="${clampedHp}" aria-valuemin="0" aria-valuemax="${monster.maxHp}" aria-label="${escapeHtml(monster.name)} health">
      <div class="h-full ${healthVariant(ratio)} motion-reduce:transition-none transition-all duration-300" style="width:${Math.max(0, ratio * 100)}%"></div>
    </div>
    <p class="mt-1 text-[11px] font-mono text-stone-700 dark:text-stone-300">${clampedHp} / ${monster.maxHp} HP</p>
    ${conditions.length ? `<p class="mt-0.5 text-[10px] text-amber-700 dark:text-amber-500 truncate">${conditions.join(", ")}</p>` : ""}
  </div>`;
}

function spellMenuPanel(character, knownSpells, tier, canAct) {
  const cantrips = knownSpells.filter((sid) => SPELLS[sid].tier === 0);
  const leveled = knownSpells.filter((sid) => SPELLS[sid].tier > 0);
  const spellRow = (sid) => {
    const spell = SPELLS[sid];
    const isCantrip = spell.tier === 0;
    const affordable = isCantrip || character.spellSlots > 0;
    return `
    <button type="button" data-action="cast-spell" data-spell="${spell.id}" ${!canAct || !affordable ? "disabled" : ""}
      class="w-full flex items-center justify-between gap-2 rounded-sm border border-stone-400 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 px-3 py-2 text-left
      hover:bg-amber-100/60 dark:hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed
      focus-visible:ring-2 focus-visible:ring-amber-500 focus:outline-none forced-colors:border forced-colors:border-2 motion-reduce:transition-none transition-colors">
      <span>
        <span class="text-sm font-semibold text-stone-900 dark:text-stone-100">${spell.name}</span>
        <span class="ml-1 text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-sm border border-stone-400 dark:border-stone-600 text-stone-600 dark:text-stone-400">
          ${isCantrip ? "Cantrip" : `Tier ${spell.tier}`}
        </span>
        <span class="block text-[11px] text-stone-600 dark:text-stone-400">${spell.description}</span>
      </span>
    </button>`;
  };

  return `
  <div class="mt-2 p-3 rounded-sm border border-amber-800/40 dark:border-stone-700 bg-amber-50/90 dark:bg-stone-900/90 shadow-sm">
    <div class="flex items-center justify-between mb-2">
      <h3 class="font-serif text-sm font-semibold text-stone-900 dark:text-stone-100">Spellbook (up to Tier ${tier})</h3>
      <span class="text-xs text-stone-600 dark:text-stone-400">Slots: ${character.spellSlots}/${character.maxSpellSlots}</span>
    </div>
    <div class="space-y-1.5">
      ${cantrips.map(spellRow).join("")}
      ${leveled.map(spellRow).join("")}
    </div>
  </div>`;
}

function actionButton(action, key, label, sub, disabled) {
  return `
  <button type="button" data-action="${action}" ${disabled ? "disabled" : ""}
    class="flex flex-col items-start gap-0.5 rounded-xl border border-amber-500/25 bg-stone-800/80 px-3 py-2.5 text-left
    hover:bg-stone-700/80 hover:border-amber-400/50 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-stone-800/80
    focus-visible:ring-2 focus-visible:ring-amber-400 focus:outline-none forced-colors:border forced-colors:border-2 motion-reduce:transition-none transition-colors">
    <span class="text-sm font-semibold text-stone-50">
      <span class="inline-flex items-center justify-center w-5 h-5 mr-1 text-[11px] rounded-full border border-amber-400/60 bg-amber-500/10 text-amber-300 font-mono">${key}</span>${label}
    </span>
    <span class="text-[11px] text-stone-400">${sub}</span>
  </button>`;
}

/* ---------------------------------- End ------------------------------------- */

function renderEnd(state) {
  const { analytics, character, endState } = state;
  const hitPct = analytics.attackRollsMade > 0
    ? Math.round((analytics.attackRollsHit / analytics.attackRollsMade) * 100)
    : 0;
  const victory = endState === "victory";
  const campaignComplete = endState === "campaignComplete";
  const isWin = victory || campaignComplete;

  root.innerHTML = `
  <div class="min-h-screen flex items-center justify-center px-4 py-10">
    <div class="max-w-lg w-full bg-amber-50/70 dark:bg-stone-900 border border-amber-800/40 dark:border-stone-700 rounded-sm shadow-md p-6 sm:p-8 text-center">
      <h1 class="font-serif text-3xl font-bold mb-2 ${isWin ? "text-emerald-800 dark:text-emerald-400" : "text-rose-800 dark:text-rose-400"}">
        ${campaignComplete ? "Campaign Complete!" : victory ? "Victory!" : "You Have Fallen"}
      </h1>
      <p class="text-stone-700 dark:text-stone-300 mb-6">
        ${campaignComplete
          ? "You have slain the Young Red Dragon and reached Level 5. Your legend is complete."
          : victory
          ? "The foe lies defeated. Your legend grows."
          : "The arena claims another challenger. Rest, and rise again."}
      </p>

      <dl class="grid grid-cols-2 gap-3 text-sm mb-6 text-left">
        <div class="p-2 rounded-sm border border-stone-200 dark:border-stone-800">
          <dt class="text-stone-600 dark:text-stone-400 text-xs">Total Damage Dealt</dt>
          <dd class="font-mono text-lg font-semibold text-stone-900 dark:text-stone-100">${analytics.totalDamageDealt}</dd>
        </div>
        <div class="p-2 rounded-sm border border-stone-200 dark:border-stone-800">
          <dt class="text-stone-600 dark:text-stone-400 text-xs">Rounds Survived</dt>
          <dd class="font-mono text-lg font-semibold text-stone-900 dark:text-stone-100">${analytics.roundsSurvived}</dd>
        </div>
        <div class="p-2 rounded-sm border border-stone-200 dark:border-stone-800 col-span-2">
          <dt class="text-stone-600 dark:text-stone-400 text-xs">Dice Accuracy</dt>
          <dd class="font-mono text-lg font-semibold text-stone-900 dark:text-stone-100">${hitPct}% (${analytics.attackRollsHit}/${analytics.attackRollsMade} attacks landed)</dd>
        </div>
        <div class="p-2 rounded-sm border border-stone-200 dark:border-stone-800">
          <dt class="text-stone-600 dark:text-stone-400 text-xs">Character Level</dt>
          <dd class="font-mono text-lg font-semibold text-stone-900 dark:text-stone-100">${character.level} (${character.exp} EXP)</dd>
        </div>
        <div class="p-2 rounded-sm border border-stone-200 dark:border-stone-800">
          <dt class="text-stone-600 dark:text-stone-400 text-xs">Stages Cleared</dt>
          <dd class="font-mono text-lg font-semibold text-stone-900 dark:text-stone-100">${campaignComplete ? state.campaignStage : state.campaignStage - 1}</dd>
        </div>
      </dl>

      <div class="flex flex-col sm:flex-row gap-3">
        ${victory ? `
        <button type="button" data-action="next-foe"
          class="flex-1 rounded-sm bg-emerald-700 hover:bg-emerald-800 text-amber-50 font-serif font-semibold px-5 py-3 shadow-sm
          focus-visible:ring-2 focus-visible:ring-amber-500 focus:outline-none forced-colors:border forced-colors:border-2 motion-reduce:transition-none transition-colors">
          Battle Next Foe
        </button>` : ""}
        <button type="button" data-action="restart-campaign"
          class="flex-1 rounded-sm border border-stone-400 dark:border-stone-600 text-stone-900 dark:text-stone-100 font-semibold px-5 py-3
          hover:bg-stone-200/60 dark:hover:bg-stone-800 focus-visible:ring-2 focus-visible:ring-amber-500 focus:outline-none forced-colors:border forced-colors:border-2 motion-reduce:transition-none transition-colors">
          Restart Campaign
        </button>
      </div>
    </div>
  </div>`;
}
