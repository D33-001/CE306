// js/combatAI.js
// Decides what the monster does on its turn. Pure decision logic — no DOM,
// no dice rolling side-effects beyond what dndCore exposes.

/**
 * Choose an action for the monster given the current combat state.
 * Returns one of: 'attack' | 'specialStrike' | 'retreat'
 */
function chooseMonsterAction({ monster, character, difficulty }) {
  const hpRatio = monster.hp / monster.maxHp;
  const playerHpRatio = character.hp / character.maxHp;

  // Low health: sometimes retreat (Dodge) to survive, scaled by aggression
  // (more aggressive monsters retreat less often).
  if (hpRatio < 0.3 && Math.random() > monster.aggression) {
    return "retreat";
  }

  // If the player is already low, press the advantage with a special strike.
  if (playerHpRatio < 0.4 && Math.random() < monster.aggression) {
    return "specialStrike";
  }

  // Otherwise weighted random between attack and special strike based on aggression.
  return Math.random() < monster.aggression * 0.5 ? "specialStrike" : "attack";
}

/**
 * Resolve the monster's attack roll against the player's AC.
 * Accounts for the player's Dodge (imposes disadvantage on the monster)
 * and Shield spell (+5 AC).
 */
function resolveMonsterAttack({ monster, character, isSpecial }) {
  const effectiveAc = character.ac + (character.shieldActive ? 5 : 0);
  const disadvantaged = character.dodging || monster.entangled;
  const attackRoll = rollD20({ disadvantage: disadvantaged });
  const totalAttack = attackRoll.chosen + monster.attackBonus;
  const hits = attackRoll.isCrit || (totalAttack >= effectiveAc && !attackRoll.isFumble);

  let damage = 0;
  let damageRolls = [];
  if (hits) {
    const diceCount = isSpecial ? monster.damageDice + 1 : monster.damageDice;
    const result = rollFormula(diceCount, monster.damageSides, monster.damageBonus);
    damage = attackRoll.isCrit ? result.total * 2 : result.total;
    damageRolls = result.rolls;
    if (character.buffs?.rageActive) damage = Math.max(1, Math.floor(damage / 2));
  }

  return {
    attackRoll,
    totalAttack,
    effectiveAc,
    hits,
    damage,
    damageRolls,
    isCrit: attackRoll.isCrit,
    isFumble: attackRoll.isFumble,
  };
}
