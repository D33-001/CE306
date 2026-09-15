// js/gameState.js
// Single central state store for the whole application. No DOM access here —
// render.js reads this to draw the UI, app.js mutates it in response to input.

const SCREENS = { MENU: "menu", CREATOR: "creator", COMBAT: "combat", END: "end" };

function freshPointBuy() {
  return { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 };
}

function createInitialState() {
  return {
    screen: SCREENS.MENU,
    difficulty: "normal",
    modalOpen: null, // 'howToPlay' | null

    creator: {
      race: "human",
      class: "fighter",
      gender: "female",
      baseScores: freshPointBuy(),
    },

    character: null,
    combat: null,
    campaignStage: 1,

    analytics: { totalDamageDealt: 0, roundsSurvived: 0, attackRollsMade: 0, attackRollsHit: 0 },
    endState: null,
  };
}

/* ------------------------------ Point Buy -------------------------------- */

const POINT_BUY_COST = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };

function pointBuyCost(scores) {
  return Object.values(scores).reduce((sum, v) => sum + (POINT_BUY_COST[v] ?? 0), 0);
}

function canIncrease(scores, key) {
  const current = scores[key];
  if (current >= 15) return false;
  const nextCost = POINT_BUY_COST[current + 1] - POINT_BUY_COST[current];
  return pointBuyCost(scores) + nextCost <= 27;
}

function canDecrease(scores, key) {
  return scores[key] > 8;
}

/* --------------------------- Character Building --------------------------- */

function buildCharacter(state) {
  const { race, class: classId, gender, baseScores } = state.creator;
  const finalAbilities = computeFinalAbilities(baseScores, race);
  const level = 1;
  const maxHp = computeMaxHp(classId, finalAbilities, level);
  const maxSlots = computeMaxSpellSlots(classId, level);
  const cls = CLASSES[classId];

  return {
    race, class: classId, gender, finalAbilities, level, exp: 0,
    maxHp, hp: maxHp,
    ac: computeArmorClass(classId, finalAbilities),
    initiativeMod: computeInitiativeModifier(finalAbilities),
    maxSpellSlots: maxSlots,
    spellSlots: maxSlots,
    potionsRemaining: 2,
    skillUsed: false,
    combatSkillUsed: false,
    inventory: [...cls.startingEquipment],
    shieldActive: false,
    dodging: false,
    buffs: { advantageNext: false, markBonusDice: 0, rageActive: false },
  };
}

// Which monster shapes are available at a given campaign stage per difficulty.
// Harder difficulties mix in tougher monsters sooner (more variety earlier).
// The dragon is reserved as the campaign's final boss, appearing once the
// character reaches the level cap, and ends the campaign when defeated.
const STAGE_POOLS = {
  normal: (stage) => (stage <= 4 ? ["goblin"] : ["orc"]),
  veteran: (stage) => (stage <= 2 ? ["goblin"] : stage <= 4 ? ["goblin", "orc"] : ["orc"]),
  nightmare: (stage) => (stage === 1 ? ["goblin", "orc"] : ["goblin", "orc", "orc"]),
};

function pickMonsterShape(state) {
  if (state.character.level >= 5) return "dragon";
  const pool = STAGE_POOLS[state.difficulty](state.campaignStage);
  return pool[Math.floor(Math.random() * pool.length)];
}

function buildMonster(state) {
  const shape = pickMonsterShape(state);
  const template = MONSTER_TEMPLATES[shape];
  return { ...template, hp: template.maxHp, dodging: false, entangled: false };
}

function startCombat(state) {
  const monster = buildMonster(state);
  state.combat = {
    round: 1,
    turn: "player", // 'player' | 'monster'
    monster,
    isFinalBoss: monster.shape === "dragon",
    log: [],
    actionTakenThisTurn: false,
    spellMenuOpen: false,
    sneakAttackAvailableThisEncounter: state.character.class === "rogue",
  };
  state.endState = null;
}

/* --------------------------------- Leveling -------------------------------- */

function awardExp(character, amount) {
  const events = [];
  character.exp += amount;
  while (character.level < 5 && character.exp >= EXP_THRESHOLDS[character.level]) {
    character.level += 1;
    const before = character.maxHp;
    character.maxHp = computeMaxHp(character.class, character.finalAbilities, character.level);
    character.hp += character.maxHp - before;
    character.maxSpellSlots = computeMaxSpellSlots(character.class, character.level);
    character.spellSlots = character.maxSpellSlots;
    character.potionsRemaining = 2;
    character.skillUsed = false;
    character.combatSkillUsed = false;
    events.push(`Reached Level ${character.level}! Max HP is now ${character.maxHp}.`);
  }
  return events;
}

function resetForNextFoe(state) {
  state.campaignStage += 1;
  state.character.hp = state.character.maxHp;
  state.character.spellSlots = state.character.maxSpellSlots;
  state.character.potionsRemaining = 2;
  state.character.skillUsed = false;
  state.character.combatSkillUsed = false;
  state.character.shieldActive = false;
  state.character.dodging = false;
  state.character.buffs = { advantageNext: false, markBonusDice: 0, rageActive: false };
  startCombat(state);
  state.screen = SCREENS.COMBAT;
}

function restartCampaign(state) {
  const fresh = createInitialState();
  Object.keys(state).forEach((k) => delete state[k]);
  Object.assign(state, fresh);
}
