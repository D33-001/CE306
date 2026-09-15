// js/dndCore.js
// D&D 5e-inspired rules engine: stat math, dice, hit/DC checks, and the
// reference tables for races, classes, weapons, and spells used by the
// rest of the app. This module has no DOM access — it only computes.

/* ----------------------------- Dice Engine ----------------------------- */

// Cryptographically unrigged die roll from 1..sides using the browser's
// CSPRNG. Rejection sampling avoids modulo bias.
function rollDie(sides) {
  const max = Math.floor(0xffffffff / sides) * sides;
  const buf = new Uint32Array(1);
  let x;
  do {
    window.crypto.getRandomValues(buf);
    x = buf[0];
  } while (x >= max);
  return (x % sides) + 1;
}

function rollDice(count, sides) {
  let total = 0;
  const rolls = [];
  for (let i = 0; i < count; i++) {
    const r = rollDie(sides);
    rolls.push(r);
    total += r;
  }
  return { total, rolls };
}

// "2d4+2" style roller used for potions/healing.
function rollFormula(count, sides, bonus = 0) {
  const { total, rolls } = rollDice(count, sides);
  return { total: total + bonus, rolls, bonus };
}

// d20 roll with optional advantage/disadvantage (5e: roll twice, take
// higher/lower). Returns both raw rolls plus the chosen one.
function rollD20({ advantage = false, disadvantage = false } = {}) {
  const a = rollDie(20);
  if (!advantage && !disadvantage) {
    return { chosen: a, rolls: [a], isCrit: a === 20, isFumble: a === 1 };
  }
  const b = rollDie(20);
  const chosen = advantage ? Math.max(a, b) : Math.min(a, b);
  return { chosen, rolls: [a, b], isCrit: chosen === 20, isFumble: chosen === 1 };
}

/* --------------------------- Modifier Formulas -------------------------- */

function abilityModifier(score) {
  return Math.floor((score - 10) / 2);
}

function formatModifier(mod) {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

function proficiencyBonus(level) {
  return level >= 5 ? 3 : 2;
}

// Highest spell "tier" a caster can prepare at a given character level
// (0 = cantrips only, 1 = 1st-level spells unlocked, 2 = 2nd-level unlocked).
// Capped for our Level-5 campaign.
function maxSpellTier(level) {
  return Math.min(2, Math.floor((level - 1) / 2) + 1);
}

/* ------------------------------ Reference Data --------------------------- */

const ABILITIES = ["str", "dex", "con", "int", "wis", "cha"];

const ABILITY_LABELS = {
  str: "Strength",
  dex: "Dexterity",
  con: "Constitution",
  int: "Intelligence",
  wis: "Wisdom",
  cha: "Charisma",
};

const RACES = {
  human: {
    id: "human", name: "Human",
    description: "Versatile and ambitious, humans gain a +1 bonus to every ability score.",
    bonuses: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 },
    trait: "Ambitious Drive", traitDescription: "+1 to all six ability scores.",
  },
  elf: {
    id: "elf", name: "Elf",
    description: "Graceful and keen-eyed, elves favor precision over brute force.",
    bonuses: { dex: 2 },
    trait: "Keen Senses", traitDescription: "+2 Dexterity, advantage on Perception (flavor).",
  },
  dwarf: {
    id: "dwarf", name: "Dwarf",
    description: "Stout and hardy, dwarves shrug off poison and hardship alike.",
    bonuses: { con: 2 },
    trait: "Dwarven Resilience", traitDescription: "+2 Constitution, resistance to poison (flavor).",
  },
  halfling: {
    id: "halfling", name: "Halfling",
    description: "Small, lucky, and nimble — halflings slip past danger with a grin.",
    bonuses: { dex: 2, cha: 1 },
    trait: "Lucky", traitDescription: "+2 Dexterity, +1 Charisma; reroll natural 1s (flavor).",
  },
  tiefling: {
    id: "tiefling", name: "Tiefling",
    description: "Marked by an infernal bloodline, tieflings channel innate fire and charm.",
    bonuses: { cha: 2, int: 1 },
    trait: "Infernal Legacy", traitDescription: "+2 Charisma, +1 Intelligence; resistance to fire (flavor).",
  },
  dragonborn: {
    id: "dragonborn", name: "Dragonborn",
    description: "Proud draconic warriors with a breath weapon in their blood.",
    bonuses: { str: 2, cha: 1 },
    trait: "Draconic Might", traitDescription: "+2 Strength, +1 Charisma; breath weapon (flavor).",
  },
};

const CLASSES = {
  fighter: {
    id: "fighter", name: "Fighter",
    description: "A disciplined master of martial combat, armor, and weapons.",
    hitDie: 10, primaryAbility: "str", recommended: ["str", "con"],
    feature: "Second Wind", featureDescription: "Once per combat, regain 1d10+level Hit Points as a bonus action.",
    armor: "Heavy Armor (Plate)", weapon: "greatsword",
    startingEquipment: ["Greatsword", "Chain Mail", "Explorer's Pack", "Shield"],
    casterType: "none", spellList: [],
    skill: {
      id: "secondWind", name: "Second Wind", key: "5",
      description: "Bonus action: heal 1d10 + level HP. Once per combat.",
      kind: "heal",
    },
    combatSkill: {
      id: "powerStrike", name: "Power Strike", key: "6",
      description: "A mighty maneuver: weapon attack with advantage, dealing +1d6 damage. Once per combat.",
      kind: "attack",
    },
  },
  wizard: {
    id: "wizard", name: "Wizard",
    description: "A scholarly spellcaster who bends arcane forces to their will.",
    hitDie: 6, primaryAbility: "int", recommended: ["int", "con"],
    feature: "Spellcasting", featureDescription: "Prepares arcane cantrips and leveled spells from a spellbook.",
    armor: "Robes (no armor bonus)", weapon: "staff",
    startingEquipment: ["Arcane Staff", "Spellbook", "Component Pouch", "Robes"],
    casterType: "full", spellList: ["fireBolt", "magicMissile", "shield", "burningHands", "mistyStep"],
    skill: null,
  },
  rogue: {
    id: "rogue", name: "Rogue",
    description: "A cunning skirmisher who strikes from the shadows with precision.",
    hitDie: 8, primaryAbility: "dex", recommended: ["dex", "cha"],
    feature: "Sneak Attack", featureDescription: "Extra 2d6 damage once per turn when you have advantage.",
    armor: "Leather Armor", weapon: "daggers",
    startingEquipment: ["Twin Daggers", "Shortbow", "Leather Armor", "Thieves' Tools"],
    casterType: "none", spellList: [],
    skill: {
      id: "cunningAction", name: "Cunning Action: Hide", key: "5",
      description: "Bonus action: vanish into shadow, guaranteeing advantage on your next attack this combat.",
      kind: "buff",
    },
  },
  cleric: {
    id: "cleric", name: "Cleric",
    description: "A divine channel who mends allies and smites foes with sacred light.",
    hitDie: 8, primaryAbility: "wis", recommended: ["wis", "con"],
    feature: "Divine Domain", featureDescription: "Channels healing and radiant magic through prayer.",
    armor: "Chain Shirt", weapon: "mace",
    startingEquipment: ["Mace", "Holy Symbol", "Chain Shirt", "Prayer Book"],
    casterType: "full", spellList: ["sacredFlame", "cureWounds", "healingWord", "guardianOfFaith"],
    skill: null,
  },
  ranger: {
    id: "ranger", name: "Ranger",
    description: "A woodland hunter who blends martial skill with nature magic.",
    hitDie: 10, primaryAbility: "dex", recommended: ["dex", "wis"],
    feature: "Favored Foe", featureDescription: "Marks a target to strike with unerring focus.",
    armor: "Studded Leather", weapon: "shortbow",
    startingEquipment: ["Shortbow", "Studded Leather", "Two Short Swords", "Quiver"],
    casterType: "half", spellList: ["huntersMark", "entangle"],
    skill: {
      id: "favoredFoe", name: "Favored Foe", key: "5",
      description: "Mark the enemy: your next hit this turn deals +1d6 damage.",
      kind: "buff",
    },
  },
  barbarian: {
    id: "barbarian", name: "Barbarian",
    description: "A primal warrior who channels fury into devastating blows.",
    hitDie: 12, primaryAbility: "str", recommended: ["str", "con"],
    feature: "Rage", featureDescription: "Enter a fury that boosts damage and resists incoming harm.",
    armor: "Hide Armor", weapon: "greataxe",
    startingEquipment: ["Greataxe", "Hide Armor", "Javelins", "Explorer's Pack"],
    casterType: "none", spellList: [],
    skill: {
      id: "rage", name: "Rage", key: "5",
      description: "Bonus action: rage for the rest of combat, dealing +2 damage on melee hits and taking half damage from attacks.",
      kind: "buff",
    },
  },
};

const WEAPONS = {
  greatsword: { id: "greatsword", name: "Greatsword", damageDice: 2, damageSides: 6, abilityKey: "str", finesse: false },
  daggers: { id: "daggers", name: "Twin Daggers", damageDice: 1, damageSides: 4, abilityKey: "dex", finesse: true },
  staff: { id: "staff", name: "Arcane Staff", damageDice: 1, damageSides: 6, abilityKey: "int", finesse: false },
  mace: { id: "mace", name: "Mace", damageDice: 1, damageSides: 6, abilityKey: "str", finesse: false },
  shortbow: { id: "shortbow", name: "Shortbow", damageDice: 1, damageSides: 6, abilityKey: "dex", finesse: true },
  greataxe: { id: "greataxe", name: "Greataxe", damageDice: 1, damageSides: 12, abilityKey: "str", finesse: false },
};

// Spells now carry a `tier` (0 = cantrip, 1/2 = leveled) and belong to one
// or more class spell lists (declared per-class above via spellList ids).
const SPELLS = {
  fireBolt: {
    id: "fireBolt", name: "Fire Bolt", tier: 0,
    description: "Cantrip. Hurl a mote of fire: 1d10 fire damage, no slot cost.",
    resolve() { return rollFormula(1, 10, 0); },
  },
  magicMissile: {
    id: "magicMissile", name: "Magic Missile", tier: 1,
    description: "1st-level. Three darts of force, each 1d4+1 damage. Never misses.",
    resolve() {
      let total = 0; const rolls = [];
      for (let i = 0; i < 3; i++) { const { total: dmg, rolls: r } = rollFormula(1, 4, 1); total += dmg; rolls.push(...r); }
      return { total, rolls };
    },
    alwaysHits: true,
  },
  shield: {
    id: "shield", name: "Shield", tier: 1,
    description: "1st-level. A shimmering barrier grants +5 AC until your next turn.",
    acBonus: 5,
  },
  burningHands: {
    id: "burningHands", name: "Burning Hands", tier: 2,
    description: "2nd-level. A cone of fire: 3d6 fire damage.",
    resolve() { return rollFormula(3, 6, 0); },
  },
  mistyStep: {
    id: "mistyStep", name: "Misty Step", tier: 2,
    description: "2nd-level. Teleport behind the foe's guard, granting advantage on your next attack.",
    buff: "advantage",
  },
  sacredFlame: {
    id: "sacredFlame", name: "Sacred Flame", tier: 0,
    description: "Cantrip. Radiant flame descends: 1d8 radiant damage, no slot cost.",
    resolve() { return rollFormula(1, 8, 0); },
  },
  cureWounds: {
    id: "cureWounds", name: "Cure Wounds", tier: 1,
    description: "1st-level. Mend wounds, restoring 1d8+3 Hit Points.",
    resolve() { return rollFormula(1, 8, 3); },
    heal: true,
  },
  healingWord: {
    id: "healingWord", name: "Healing Word", tier: 1,
    description: "1st-level. A word of power restores 1d4+3 Hit Points instantly.",
    resolve() { return rollFormula(1, 4, 3); },
    heal: true,
  },
  guardianOfFaith: {
    id: "guardianOfFaith", name: "Guardian of Faith", tier: 2,
    description: "2nd-level. A spectral guardian strikes: 2d8 radiant damage.",
    resolve() { return rollFormula(2, 8, 0); },
  },
  huntersMark: {
    id: "huntersMark", name: "Hunter's Mark", tier: 1,
    description: "1st-level. Mark the foe: your next hit this turn deals +1d6 damage.",
    buff: "mark",
  },
  entangle: {
    id: "entangle", name: "Entangle", tier: 1,
    description: "1st-level. Grasping vines bind the foe, imposing disadvantage on its next attack.",
    buff: "entangle",
  },
};

const MONSTER_TEMPLATES = {
  goblin: {
    id: "goblinScavenger", name: "Goblin Scavenger", shape: "goblin",
    ac: 12, maxHp: 18, attackBonus: 3, damageDice: 1, damageSides: 6, damageBonus: 1,
    aggression: 0.35, expReward: 60,
  },
  orc: {
    id: "orcBerserker", name: "Orc Berserker", shape: "orc",
    ac: 14, maxHp: 30, attackBonus: 5, damageDice: 1, damageSides: 12, damageBonus: 3,
    aggression: 0.6, expReward: 100,
  },
  dragon: {
    id: "youngRedDragon", name: "Young Red Dragon", shape: "dragon",
    ac: 17, maxHp: 48, attackBonus: 7, damageDice: 2, damageSides: 10, damageBonus: 4,
    aggression: 0.85, expReward: 160,
  },
};

/* ----------------------------- Derived Stats ---------------------------- */

function computeFinalAbilities(baseScores, raceId) {
  const bonuses = RACES[raceId]?.bonuses || {};
  const out = {};
  for (const key of ABILITIES) out[key] = (baseScores[key] || 8) + (bonuses[key] || 0);
  return out;
}

function computeArmorClass(classId, finalAbilities) {
  const dexMod = abilityModifier(finalAbilities.dex);
  if (classId === "fighter") return 16 + Math.max(0, Math.min(2, dexMod));
  if (classId === "barbarian") return 14 + dexMod;
  if (classId === "cleric") return 13 + Math.max(0, Math.min(2, dexMod));
  if (classId === "ranger") return 12 + dexMod;
  if (classId === "rogue") return 11 + dexMod;
  return 10 + dexMod; // wizard
}

function computeInitiativeModifier(finalAbilities) {
  return abilityModifier(finalAbilities.dex);
}

function computeMaxHp(classId, finalAbilities, level = 1) {
  const cls = CLASSES[classId];
  const conMod = abilityModifier(finalAbilities.con);
  const avgPerLevel = Math.ceil(cls.hitDie / 2) + 1;
  let hp = cls.hitDie + conMod;
  for (let lvl = 2; lvl <= level; lvl++) hp += avgPerLevel + conMod;
  return Math.max(1, hp);
}

// Leveled spell slots (tier 1+). Cantrips (tier 0) never consume a slot.
function computeMaxSpellSlots(classId, level) {
  const type = CLASSES[classId]?.casterType;
  if (type === "full") return 2 + Math.floor((level - 1) / 2); // 2 at lvl1 -> 4 at lvl5
  if (type === "half") return Math.max(0, Math.floor((level - 1) / 2) + (level >= 2 ? 1 : 0)); // 0 at lvl1, grows slowly
  return 0;
}

const EXP_THRESHOLDS = { 1: 100, 2: 250, 3: 450, 4: 700, 5: Infinity };
