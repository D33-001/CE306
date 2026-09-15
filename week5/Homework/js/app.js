// js/app.js
// Application entry point: event delegation, keyboard shortcuts, and the
// core state machine loop tying dndCore, gameState, combatAI, and render together.

const state = createInitialState();
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function rerender() {
  render(state);
  battleCamera.sync(state.combat?.turn || 'player');
}

function rerenderAndRestoreRadioFocus(action, value) {
  rerender();
  [...document.querySelectorAll(`input[type="radio"][data-action="${action}"]`)]
    .find((input) => input.value === value)?.focus();
}

function log(message) {
  state.combat.log.push(message);
}

/* ------------------------------ D20 Animation ------------------------------ */

function animateD20(finalValue, { isCrit, isFumble } = {}) {
  const numberEl = document.getElementById("d20-number");
  const shapeEl = document.getElementById("d20-shape");
  const critEl = document.getElementById("d20-critical-text");
  const sr = document.getElementById("d20-sr-announce");
  if (!numberEl) return Promise.resolve();

  const settle = () => {
    numberEl.textContent = String(finalValue);
    numberEl.classList.remove("text-stone-900", "dark:text-stone-100", "text-emerald-800", "dark:text-emerald-400", "text-rose-800", "dark:text-rose-400");
    if (critEl) {
      critEl.classList.remove("hidden", "bg-emerald-700", "bg-rose-800", "text-amber-50");
      if (isCrit) {
        critEl.textContent = "Critical Hit!";
        critEl.classList.add("bg-emerald-700", "text-amber-50");
        numberEl.classList.add("text-emerald-800", "dark:text-emerald-400");
      } else if (isFumble) {
        critEl.textContent = "Critical Miss!";
        critEl.classList.add("bg-rose-800", "text-amber-50");
        numberEl.classList.add("text-rose-800", "dark:text-rose-400");
      } else {
        critEl.classList.add("hidden");
        numberEl.classList.add("text-stone-900", "dark:text-stone-100");
      }
    }
    if (sr) {
      sr.textContent = isCrit
        ? `Natural 20! Critical roll of ${finalValue}.`
        : isFumble
        ? `Natural 1! Critical failure.`
        : `Rolled a ${finalValue}.`;
    }
  };

  if (prefersReducedMotion) {
    settle();
    return Promise.resolve();
  }

  if (critEl) critEl.classList.add("hidden");

  return new Promise((resolve) => {
    const start = performance.now();
    const duration = 600;
    if (shapeEl) {
      shapeEl.classList.remove("anim-d20-spin");
      void shapeEl.offsetWidth;
      shapeEl.classList.add("anim-d20-spin");
    }
    function tick(now) {
      const elapsed = now - start;
      if (elapsed >= duration) {
        settle();
        resolve();
        return;
      }
      numberEl.textContent = String(1 + Math.floor(Math.random() * 20));
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

/* ------------------------------- Scene FX Helpers ---------------------------- */

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fxLayer() {
  return document.getElementById("fx-layer");
}

function avatarEl(side) {
  return document.getElementById(`${side}-avatar-wrap`);
}

function triggerLunge(side) {
  if (prefersReducedMotion) return;
  const el = avatarEl(side);
  if (!el) return;
  const cls = side === "player" ? "anim-lunge-player" : "anim-lunge-monster";
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
}

function triggerHit(side) {
  if (prefersReducedMotion) return;
  const el = avatarEl(side);
  if (!el) return;
  el.classList.remove("anim-hit", "anim-hit-flash");
  void el.offsetWidth;
  el.classList.add("anim-hit", "anim-hit-flash");
}

function triggerCastPulse(side) {
  if (prefersReducedMotion) return;
  const el = avatarEl(side);
  if (!el) return;
  el.classList.remove("anim-cast");
  void el.offsetWidth;
  el.classList.add("anim-cast");
}

function spawnImpact(x, y, color) {
  const layer = fxLayer();
  if (!layer || prefersReducedMotion) return;
  const burst = document.createElement("div");
  burst.className = "anim-impact w-8 h-8";
  burst.style.left = `${x - 16}px`;
  burst.style.top = `${y - 16}px`;
  burst.style.background = color;
  layer.appendChild(burst);
  setTimeout(() => burst.remove(), 500);
}

function spawnBolt(fromSide, toSide, color) {
  const layer = fxLayer();
  const fromEl = avatarEl(fromSide);
  const toEl = avatarEl(toSide);
  if (!layer || !fromEl || !toEl) return;
  if (prefersReducedMotion) return;
  const layerRect = layer.getBoundingClientRect();
  const fromRect = fromEl.getBoundingClientRect();
  const toRect = toEl.getBoundingClientRect();
  const startX = fromRect.left + fromRect.width / 2 - layerRect.left;
  const startY = fromRect.top + fromRect.height / 2 - layerRect.top;
  const endX = toRect.left + toRect.width / 2 - layerRect.left;
  const endY = toRect.top + toRect.height / 2 - layerRect.top;

  const bolt = document.createElement("div");
  bolt.className = "anim-bolt w-3 h-3 rounded-full";
  bolt.style.background = color;
  bolt.style.boxShadow = `0 0 8px ${color}`;
  bolt.style.setProperty("--fx-start-x", `${startX}px`);
  bolt.style.setProperty("--fx-start-y", `${startY}px`);
  bolt.style.setProperty("--fx-end-x", `${endX}px`);
  bolt.style.setProperty("--fx-end-y", `${endY}px`);
  layer.appendChild(bolt);
  setTimeout(() => {
    spawnImpact(endX, endY, color);
    bolt.remove();
  }, 520);
}

function spawnFloatText(text, side, color) {
  const layer = fxLayer();
  const el = avatarEl(side);
  if (!layer || !el || prefersReducedMotion) return;
  const layerRect = layer.getBoundingClientRect();
  const rect = el.getBoundingClientRect();
  const x = rect.left + rect.width / 2 - layerRect.left;
  const y = rect.top - layerRect.top;
  const label = document.createElement("div");
  label.className = "anim-float-text text-sm sm:text-base";
  label.style.left = `${x - 14}px`;
  label.style.top = `${y}px`;
  label.style.color = color;
  label.textContent = text;
  layer.appendChild(label);
  setTimeout(() => label.remove(), 950);
}

const SPELL_COLORS = {
  fireBolt: "#ea580c", burningHands: "#ea580c",
  magicMissile: "#7c9cc7", mistyStep: "#7c9cc7", shield: "#7c9cc7",
  sacredFlame: "#eab308", cureWounds: "#eab308", healingWord: "#eab308", guardianOfFaith: "#eab308",
  huntersMark: "#16a34a", entangle: "#16a34a",
};

function colorForSpell(spellId) {
  return SPELL_COLORS[spellId] || "#98c1d9";
}

/* -------------------------------- Combat Flow ------------------------------- */

function isMeleeWeapon(weaponId) {
  return weaponId !== "shortbow";
}

function playerAttackModifier() {
  const character = state.character;
  const weaponId = CLASSES[character.class].weapon;
  const weapon = WEAPONS[weaponId];
  const straightMod = abilityModifier(character.finalAbilities[weapon.abilityKey]);
  const dexMod = abilityModifier(character.finalAbilities.dex);
  const abilityMod = weapon.finesse ? Math.max(straightMod, dexMod) : straightMod;
  return { weapon, abilityMod, prof: proficiencyBonus(character.level) };
}

function markActionTaken() {
  state.combat.actionTakenThisTurn = true;
  state.combat.spellMenuOpen = false;
}

async function playerAttack() {
  const character = state.character;
  const monster = state.combat.monster;
  const { weapon, abilityMod, prof } = playerAttackModifier();
  const isRogue = character.class === "rogue" && state.combat.sneakAttackAvailableThisEncounter;
  const hasAdvantage = character.buffs.advantageNext || (isRogue && Math.random() < 0.5);

  const roll = rollD20({ advantage: hasAdvantage });
  battleCamera.punchIn("player");
  triggerLunge("player");
  await animateD20(roll.chosen, roll);

  const total = roll.chosen + abilityMod + prof;
  const hits = roll.isCrit || (total >= monster.ac && !roll.isFumble);

  state.analytics.attackRollsMade += 1;
  log(`You roll a d20: ${roll.chosen} + ${abilityMod + prof} = ${total} vs AC ${monster.ac}.`);
  character.buffs.advantageNext = false;

  if (!hits) {
    log(`Your ${weapon.name} attack misses.`);
    spawnFloatText("Miss", "monster", "#78716c");
    battleCamera.resetView();
    markActionTaken();
    rerender();
    return;
  }

  state.analytics.attackRollsHit += 1;
  const dmgResult = rollFormula(weapon.damageDice, weapon.damageSides, abilityMod);
  let damage = roll.isCrit ? dmgResult.total * 2 : dmgResult.total;
  let bonusText = "";

  if (isRogue) {
    const sneak = rollFormula(2, 6, 0);
    damage += sneak.total;
    bonusText += ` (+${sneak.total} Sneak Attack)`;
    state.combat.sneakAttackAvailableThisEncounter = false;
  }
  if (character.buffs.markBonusDice > 0) {
    const mark = rollFormula(character.buffs.markBonusDice, 6, 0);
    damage += mark.total;
    bonusText += ` (+${mark.total} Favored Foe)`;
    character.buffs.markBonusDice = 0;
  }
  if (character.buffs.rageActive && isMeleeWeapon(CLASSES[character.class].weapon)) {
    damage += 2;
    bonusText += ` (+2 Rage)`;
  }

  monster.hp -= damage;
  state.analytics.totalDamageDealt += damage;
  log(`${roll.isCrit ? "Critical hit! " : ""}Your ${weapon.name} deals ${damage} damage${bonusText}.`);
  triggerHit("monster");
  spawnBolt("player", "monster", "#c7cbd1");
  spawnFloatText(`-${damage}`, "monster", "#be123c");

  await checkMonsterDefeated();
  if (state.screen === SCREENS.COMBAT) {
    battleCamera.resetView();
    markActionTaken();
    rerender();
  }
}

async function playerCastSpell(spellId) {
  const character = state.character;
  const spell = SPELLS[spellId];
  if (!spell) return;
  const monster = state.combat.monster;

  if (spell.tier > 0) {
    if (character.spellSlots <= 0) return;
    character.spellSlots -= 1;
  }

  if (spell.buff === "advantage") {
    character.buffs.advantageNext = true;
    triggerCastPulse("player");
    log(`You cast ${spell.name}, gaining advantage on your next attack.`);
  } else if (spell.buff === "mark") {
    character.buffs.markBonusDice = 1;
    triggerCastPulse("monster");
    log(`You cast ${spell.name}, marking ${monster.name} for extra damage.`);
  } else if (spell.buff === "entangle") {
    monster.entangled = true;
    triggerCastPulse("monster");
    log(`You cast ${spell.name}, binding ${monster.name} in grasping vines.`);
  } else if (spell.acBonus) {
    character.shieldActive = true;
    triggerCastPulse("player");
    log(`You cast ${spell.name}, raising a shimmering barrier (+${spell.acBonus} AC).`);
  } else if (spell.heal) {
    triggerCastPulse("player");
    await animateD20(0, {});
    const { total, rolls } = spell.resolve();
    const before = character.hp;
    character.hp = Math.min(character.maxHp, character.hp + total);
    const healed = character.hp - before;
    spawnFloatText(`+${healed}`, "player", "#16a34a");
    log(`You cast ${spell.name}, healing ${healed} HP (rolls ${rolls.join(", ")}).`);
  } else if (spell.resolve) {
    battleCamera.punchIn("player");
    triggerLunge("player");
    await animateD20(0, {});
    const { total, rolls } = spell.resolve();
    monster.hp -= total;
    state.analytics.totalDamageDealt += total;
    triggerHit("monster");
    spawnBolt("player", "monster", colorForSpell(spellId));
    spawnFloatText(`-${total}`, "monster", "#be123c");
    log(`You cast ${spell.name}: ${total} damage (rolls ${rolls.join(", ")}).`);
    await checkMonsterDefeated();
  }

  if (state.screen === SCREENS.COMBAT) {
    battleCamera.resetView();
    markActionTaken();
    rerender();
  }
}

function playerUseSkill() {
  const character = state.character;
  const cls = CLASSES[character.class];
  if (!cls.skill || character.skillUsed) return;
  character.skillUsed = true;

  if (cls.skill.id === "secondWind") {
    const { total, rolls } = rollFormula(1, 10, character.level);
    const before = character.hp;
    character.hp = Math.min(character.maxHp, character.hp + total);
    triggerCastPulse("player");
    spawnFloatText(`+${character.hp - before}`, "player", "#16a34a");
    log(`You use Second Wind, healing ${character.hp - before} HP (rolls ${rolls.join(", ")}+${character.level}).`);
  } else if (cls.skill.id === "rage") {
    character.buffs.rageActive = true;
    triggerCastPulse("player");
    spawnFloatText("Rage!", "player", "#be123c");
    log(`You fly into a Rage! +2 melee damage, half damage taken for the rest of combat.`);
  } else if (cls.skill.id === "cunningAction") {
    character.buffs.advantageNext = true;
    triggerCastPulse("player");
    log(`You vanish into the shadows with Cunning Action, gaining advantage on your next attack.`);
  } else if (cls.skill.id === "favoredFoe") {
    character.buffs.markBonusDice = 1;
    triggerCastPulse("monster");
    log(`You mark ${state.combat.monster.name} as your Favored Foe, gaining +1d6 on your next hit.`);
  }

  battleCamera.resetView();
  markActionTaken();
  rerender();
}

async function playerUseCombatSkill() {
  const character = state.character;
  const cls = CLASSES[character.class];
  if (!cls.combatSkill || character.combatSkillUsed) return;
  const monster = state.combat.monster;

  if (cls.combatSkill.id === "powerStrike") {
    character.combatSkillUsed = true;
    const { weapon, abilityMod, prof } = playerAttackModifier();

    battleCamera.punchIn("player");
    triggerLunge("player");
    const roll = rollD20({ advantage: true });
    await animateD20(roll.chosen, roll);

    const total = roll.chosen + abilityMod + prof;
    const hits = roll.isCrit || (total >= monster.ac && !roll.isFumble);
    state.analytics.attackRollsMade += 1;
    log(`Power Strike! You roll a d20 (advantage): ${roll.chosen} + ${abilityMod + prof} = ${total} vs AC ${monster.ac}.`);

    if (!hits) {
      log(`Your Power Strike misses.`);
      spawnFloatText("Miss", "monster", "#78716c");
    } else {
      state.analytics.attackRollsHit += 1;
      const dmgResult = rollFormula(weapon.damageDice, weapon.damageSides, abilityMod);
      const bonus = rollFormula(1, 6, 0);
      let damage = dmgResult.total + bonus.total;
      if (roll.isCrit) damage = dmgResult.total * 2 + bonus.total;
      monster.hp -= damage;
      state.analytics.totalDamageDealt += damage;
      triggerHit("monster");
      spawnBolt("player", "monster", "#c7cbd1");
      spawnFloatText(`-${damage}`, "monster", "#be123c");
      log(`${roll.isCrit ? "Critical hit! " : ""}Power Strike deals ${damage} damage (+${bonus.total} maneuver dice).`);
      await checkMonsterDefeated();
    }
  }

  if (state.screen === SCREENS.COMBAT) {
    battleCamera.resetView();
    markActionTaken();
    rerender();
  }
}

function playerDodge() {
  state.character.dodging = true;
  triggerCastPulse("player");
  log("You take the Dodge action, imposing disadvantage on the next attack against you.");
  battleCamera.resetView();
  markActionTaken();
  rerender();
}

function playerDrinkPotion() {
  const character = state.character;
  if (character.potionsRemaining <= 0) return;
  character.potionsRemaining -= 1;
  const { total, rolls } = rollFormula(2, 4, 2);
  const before = character.hp;
  character.hp = Math.min(character.maxHp, character.hp + total);
  const healed = character.hp - before;
  triggerCastPulse("player");
  spawnFloatText(`+${healed}`, "player", "#16a34a");
  log(`You drink a potion, rolling 2d4+2 (${rolls.join(", ")}+2) and healing ${healed} HP.`);
  battleCamera.resetView();
  markActionTaken();
  rerender();
}

function endPlayerTurn() {
  if (state.screen !== SCREENS.COMBAT || state.combat.turn !== "player" || !state.combat.actionTakenThisTurn) return;
  state.combat.turn = "monster";
  rerender();
  battleCamera.setPreset("PRESET_ENEMY_TURN");
  const encounter = state.combat;
  setTimeout(() => {
    if (state.screen === SCREENS.COMBAT && state.combat === encounter && encounter.turn === 'monster') monsterTurn();
  }, prefersReducedMotion ? 150 : 1100);
}

async function monsterTurn() {
  if (state.screen !== SCREENS.COMBAT) return;
  const character = state.character;
  const monster = state.combat.monster;

  const action = chooseMonsterAction({ monster, character, difficulty: state.difficulty });

  if (action === "retreat") {
    monster.dodging = true;
    triggerCastPulse("monster");
    log(`${monster.name} retreats defensively, wary of your blade.`);
  } else {
    const isSpecial = action === "specialStrike";
    const result = resolveMonsterAttack({ monster, character, isSpecial });
    battleCamera.punchIn("monster");
    triggerLunge("monster");
    await animateD20(result.attackRoll.chosen, result.attackRoll);
    log(`${monster.name} rolls a d20: ${result.attackRoll.chosen} + ${monster.attackBonus} = ${result.totalAttack} vs your AC ${result.effectiveAc}${isSpecial ? " (special strike)" : ""}.`);
    if (result.hits) {
      character.hp -= result.damage;
      triggerHit("player");
      spawnBolt("monster", "player", "#7f1d1d");
      spawnFloatText(`-${result.damage}`, "player", "#be123c");
      log(`${result.isCrit ? "Critical hit! " : ""}${monster.name} deals ${result.damage} damage to you.`);
    } else {
      spawnFloatText("Miss", "player", "#78716c");
      log(`${monster.name}'s attack misses.`);
    }
  }

  character.dodging = false;
  monster.entangled = false;
  if (action !== "retreat") monster.dodging = false;

  if (character.hp <= 0) {
    rerender();
    await wait(750);
    endCombat("defeat");
    return;
  }

  character.shieldActive = false;
  state.combat.round += 1;
  state.analytics.roundsSurvived = state.combat.round - 1;
  state.combat.turn = "player";
  state.combat.actionTakenThisTurn = false;
  state.combat.spellMenuOpen = false;
  rerender();
  battleCamera.setPreset("PRESET_PLAYER_TURN");
}

async function checkMonsterDefeated() {
  const monster = state.combat.monster;
  if (monster.hp > 0) return;
  monster.hp = 0;
  const wasFinalBoss = state.combat.isFinalBoss;
  log(`${monster.name} has been defeated!`);
  const events = awardExp(state.character, monster.expReward);
  events.forEach((e) => log(e));
  if (wasFinalBoss) log("The campaign draws to a close. Your legend is complete!");
  state.analytics.roundsSurvived = state.combat.round;
  rerender();
  await wait(750);
  endCombat(wasFinalBoss ? "campaignComplete" : "victory");
}

function endCombat(result) {
  state.endState = result;
  state.screen = SCREENS.END;
  rerender();
}

/* ------------------------------- Screen Actions ------------------------------ */

function beginJourney() {
  state.screen = SCREENS.CREATOR;
  rerender();
}

function ventureForth() {
  state.character = buildCharacter(state);
  state.analytics = { totalDamageDealt: 0, roundsSurvived: 0, attackRollsMade: 0, attackRollsHit: 0 };
  startCombat(state);
  state.screen = SCREENS.COMBAT;
  rerender();
  battleCamera.setPreset("PRESET_PLAYER_TURN");
}

function backToMenu() {
  state.screen = SCREENS.MENU;
  state.combat = null;
  rerender();
}

/* --------------------------------- Event Wiring ------------------------------- */

document.addEventListener("click", (e) => {
  const target = e.target.closest("[data-action]");
  if (!target || target.disabled) return;
  // A pointer click on a radio is already handled here. Its following native
  // `change` event must not apply the selection a second time.
  if (target.matches('input[type="radio"]')) target.dataset.handledByClick = "true";
  const action = target.dataset.action;

  switch (action) {
    case "set-difficulty":
      state.difficulty = target.value;
      rerenderAndRestoreRadioFocus(action, target.value);
      break;
    case "begin-journey":
      beginJourney();
      break;
    case "open-how-to-play":
      state.modalOpen = "howToPlay";
      rerender();
      break;
    case "close-how-to-play":
      state.modalOpen = null;
      rerender();
      break;
    case "back-to-menu":
      backToMenu();
      break;
    case "set-race":
      state.creator.race = target.value;
      rerenderAndRestoreRadioFocus(action, target.value);
      break;
    case "set-class":
      state.creator.class = target.value;
      rerenderAndRestoreRadioFocus(action, target.value);
      break;
    case "set-gender":
      state.creator.gender = target.value;
      rerenderAndRestoreRadioFocus(action, target.value);
      break;
    case "ability-increase": {
      const key = target.dataset.key;
      if (canIncrease(state.creator.baseScores, key)) {
        state.creator.baseScores[key] += 1;
        rerender();
      }
      break;
    }
    case "ability-decrease": {
      const key = target.dataset.key;
      if (state.creator.baseScores[key] > 8) {
        state.creator.baseScores[key] -= 1;
        rerender();
      }
      break;
    }
    case "venture-forth":
      ventureForth();
      break;
    case "attack":
      playerAttack();
      break;
    case "toggle-spell-menu":
      state.combat.spellMenuOpen = !state.combat.spellMenuOpen;
      rerender();
      break;
    case "cast-spell":
      playerCastSpell(target.dataset.spell);
      break;
    case "use-skill":
      playerUseSkill();
      break;
    case "use-combat-skill":
      playerUseCombatSkill();
      break;
    case "dodge":
      playerDodge();
      break;
    case "drink-potion":
      playerDrinkPotion();
      break;
    case "end-turn":
      endPlayerTurn();
      break;
    case "restart-match":
      if (state.character) {
        state.character.hp = state.character.maxHp;
        state.character.spellSlots = state.character.maxSpellSlots;
        state.character.potionsRemaining = 2;
        state.character.skillUsed = false;
        state.character.combatSkillUsed = false;
        state.character.dodging = false;
        state.character.shieldActive = false;
        state.character.buffs = { advantageNext: false, markBonusDice: 0, rageActive: false };
        startCombat(state);
        rerender();
        battleCamera.setPreset("PRESET_PLAYER_TURN");
      }
      break;
    case "next-foe":
      resetForNextFoe(state);
      rerender();
      battleCamera.setPreset("PRESET_PLAYER_TURN");
      break;
    case "restart-campaign":
      restartCampaign(state);
      rerender();
      break;
    case "toggle-theme": {
      const isDark = document.documentElement.classList.toggle("dark");
      try { localStorage.setItem("theme", isDark ? "dark" : "light"); } catch (err) { /* storage unavailable */ }
      break;
    }
    default:
      break;
  }
});

// Arrow keys on a native radio change its checked value without a click. Keep
// keyboard and pointer selection in sync with game state in that case.
document.addEventListener("change", (e) => {
  const target = e.target;
  if (!(target instanceof HTMLInputElement) || target.type !== "radio" || !target.dataset.action) return;
  if (target.dataset.handledByClick === "true") {
    delete target.dataset.handledByClick;
    return;
  }
  switch (target.dataset.action) {
    case "set-difficulty": state.difficulty = target.value; break;
    case "set-race": state.creator.race = target.value; break;
    case "set-class": state.creator.class = target.value; break;
    case "set-gender": state.creator.gender = target.value; break;
    default: return;
  }
  rerenderAndRestoreRadioFocus(target.dataset.action, target.value);
});

/* -------------------------- Directional navigation -------------------------- */

const ARROW_DIRECTIONS = {
  ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
};

function arrowNavigationScope() {
  const dialog = document.querySelector("dialog[open]");
  return dialog || document;
}

function arrowNavigableElements(scope) {
  return [...scope.querySelectorAll('button:not(:disabled), input[type="radio"]:not(:disabled)')]
    .filter((el) => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
}

function focusWithArrow(direction) {
  const scope = arrowNavigationScope();
  const choices = arrowNavigableElements(scope);
  if (!choices.length) return false;
  const active = document.activeElement;
  if (!choices.includes(active)) {
    choices[0].focus();
    return true;
  }
  const source = active.getBoundingClientRect();
  const sourceX = source.left + source.width / 2;
  const sourceY = source.top + source.height / 2;
  const scored = choices.filter((el) => el !== active).map((el) => {
    const rect = el.getBoundingClientRect();
    const dx = rect.left + rect.width / 2 - sourceX;
    const dy = rect.top + rect.height / 2 - sourceY;
    const primary = direction.x ? dx * direction.x : dy * direction.y;
    const secondary = direction.x ? Math.abs(dy) : Math.abs(dx);
    return { el, primary, secondary, distance: Math.hypot(dx, dy) };
  });
  const ahead = scored.filter((item) => item.primary > 2);
  // Prefer the nearest item in the requested direction, while keeping rows
  // and columns stable when controls are arranged in a grid.
  const pick = (ahead.length ? ahead : scored).sort((a, b) =>
    ahead.length
      ? (a.primary + a.secondary * 4) - (b.primary + b.secondary * 4)
      : a.distance - b.distance
  )[0];
  if (!pick) return false;
  pick.el.focus();
  return true;
}

document.addEventListener("keydown", (e) => {
  // Buttons already activate themselves natively on Enter/Space — only add
  // our synthetic Enter/Space shortcuts when focus is NOT on a <button>, so
  // we never double-fire a click the browser is already handling.
  const activeIsButton = document.activeElement && document.activeElement.tagName === "BUTTON";

  // Preserve the browser's expected radio behavior: arrow keys select another
  // option inside that radio group, and the change handler above updates state.
  if (ARROW_DIRECTIONS[e.key] && document.activeElement?.matches('input[type="radio"]')) return;
  if (ARROW_DIRECTIONS[e.key] && !e.altKey && !e.ctrlKey && !e.metaKey) {
    if (focusWithArrow(ARROW_DIRECTIONS[e.key])) e.preventDefault();
    return;
  }

  // Global: theme toggle works from any screen.
  if (e.key.toLowerCase() === "t" && !e.altKey && !e.ctrlKey && !e.metaKey && !activeIsButton) {
    document.querySelector('[data-action="toggle-theme"]')?.click();
    return;
  }

  if (e.key === "Escape") {
    if (state.modalOpen) {
      state.modalOpen = null;
      rerender();
      return;
    }
    // No modal open: Escape flees to the main menu (matches the "Escape"
    // hint already shown on the Flee to Menu button's tooltip).
    if (state.screen === SCREENS.COMBAT) {
      document.querySelector('[data-action="back-to-menu"]')?.click();
    }
    return;
  }

  if (state.modalOpen) return; // let the dialog own the keyboard while open

  if (e.key.toLowerCase() === "r" && state.screen === SCREENS.COMBAT && !activeIsButton) {
    document.querySelector('[data-action="restart-match"]')?.click();
    return;
  }

  // Per-screen keyboard control — every primary action stays reachable
  // without a mouse, in addition to normal Tab/Enter/Space on the buttons.
  if (state.screen === SCREENS.MENU) {
    if ((e.key === "Enter" || e.key === " ") && !activeIsButton) {
      e.preventDefault();
      document.querySelector('[data-action="begin-journey"]')?.click();
    } else if (e.key.toLowerCase() === "h" && !activeIsButton) {
      document.querySelector('[data-action="open-how-to-play"]')?.click();
    }
    return;
  }

  if (state.screen === SCREENS.CREATOR) {
    if (e.key === "Enter" && !activeIsButton) {
      e.preventDefault();
      document.querySelector('[data-action="venture-forth"]')?.click();
    }
    return;
  }

  if (state.screen === SCREENS.END) {
    if ((e.key === "Enter" || e.key === " ") && !activeIsButton) {
      e.preventDefault();
      const primary = document.querySelector('[data-action="next-foe"]') || document.querySelector('[data-action="restart-campaign"]');
      primary?.click();
    }
    return;
  }

  if (state.screen !== SCREENS.COMBAT || state.combat.turn !== "player") return;

  if (e.key === "Enter" && state.combat.actionTakenThisTurn && !activeIsButton) {
    document.querySelector('[data-action="end-turn"]')?.click();
    return;
  }

  const keyMap = { "1": "attack", "2": "toggle-spell-menu", "3": "dodge", "4": "drink-potion", "5": "use-skill", "6": "use-combat-skill" };
  if (keyMap[e.key]) {
    document.querySelector(`[data-action="${keyMap[e.key]}"]`)?.click();
  }
});

/* ---------------------------------- Boot -------------------------------------- */

rerender();
