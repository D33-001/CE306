// js/characterModel.js
// Builds layered 2D SVG markup for the player avatar (creator preview) and
// distinct monster silhouettes for the combat arena. Pure function module —
// returns markup strings, never touches the DOM directly.
//
// Player avatar style: cel-shaded anime-lite. Every major fill uses a
// two-stop "hard" gradient (see cel()) instead of a flat color, which reads
// as a base tone + one graphic shadow shape — the classic cel-shading look —
// without needing extra clipped shadow paths. Hair and eyes are split into
// their own <g> layers with ids/classes (see buildAvatarLayers) so index.html
// can animate them independently (blinking, hair sway) on top of the whole-
// character idle sway that already exists on #player-avatar-wrap.

const SKIN_TONES = {
  human: { base: "#e8b48a", shadow: "#c9905f" },
  elf: { base: "#e9d6ab", shadow: "#c7ac78" },
  dwarf: { base: "#d9a679", shadow: "#b17a49" },
  halfling: { base: "#e3b98f", shadow: "#c49263" },
  tiefling: { base: "#d67878", shadow: "#a8484d" },
  dragonborn: { base: "#8f5a3c", shadow: "#673f28" },
};

const HAIR_COLORS = {
  female: { base: "#5b3a29", shadow: "#3c2416", highlight: "#8a6248" },
  male: { base: "#3a2a1d", shadow: "#221710", highlight: "#5c4530" },
  "non-binary": { base: "#7a4a63", shadow: "#4f2e40", highlight: "#a06f8a" },
};

// Unique-per-document gradient id namespace — safe because only one player
// avatar SVG is ever mounted at a time (creator preview XOR combat screen).
let gradSeq = 0;
function cel(fills) {
  // fills: { base, shadow } -> a small cel-shaded linearGradient + its id.
  const id = `cel-${gradSeq++}`;
  const defs = `<linearGradient id="${id}" x1="0" y1="0" x2="0.35" y2="1">
    <stop offset="0%" stop-color="${fills.base}"/>
    <stop offset="58%" stop-color="${fills.base}"/>
    <stop offset="59%" stop-color="${fills.shadow}"/>
    <stop offset="100%" stop-color="${fills.shadow}"/>
  </linearGradient>`;
  return { fill: `url(#${id})`, defs };
}

/* ------------------------------- Player Avatar ------------------------------ */

function bodyLayer(race, gender) {
  gradSeq = 0; // keep ids short & deterministic per build; fine since single-avatar-at-a-time
  const tone = SKIN_TONES[race] || SKIN_TONES.human;
  const skin = cel(tone);
  const shoulderWidth = gender === "male" ? 34 : gender === "female" ? 26 : 30;
  const cx = 50;
  const horns = race === "tiefling" ? `
    <path d="M 42 12 Q 38 4 43 2 Q 44 8 45 13 Z" fill="#3a1f1f"/>
    <path d="M 58 12 Q 62 4 57 2 Q 56 8 55 13 Z" fill="#3a1f1f"/>` : "";
  const snout = race === "dragonborn" ? `
    <path d="M 43 31 Q 50 38 57 31 L 55 34 Q 50 36 45 34 Z" fill="${tone.shadow}"/>` : "";
  return `
  <g id="layer-body" aria-hidden="true">
    <defs>${skin.defs}</defs>
    <ellipse cx="${cx}" cy="27" rx="13" ry="15" fill="${skin.fill}" stroke="#3f2e22" stroke-width="1"/>
    ${horns}${snout}
    <path d="M ${cx - shoulderWidth / 2} 52
             Q ${cx} 38 ${cx + shoulderWidth / 2} 52
             L ${cx + shoulderWidth / 2 - 4} 92
             L ${cx - shoulderWidth / 2 + 4} 92 Z"
          fill="${skin.fill}" stroke="#3f2e22" stroke-width="1"/>
    <rect x="${cx - 10}" y="90" width="8" height="24" fill="${skin.fill}" stroke="#3f2e22" stroke-width="1"/>
    <rect x="${cx + 2}" y="90" width="8" height="24" fill="${skin.fill}" stroke="#3f2e22" stroke-width="1"/>
  </g>`;
}

// Anime-style face: big almond eyes with a catch-light, thin brows, a soft
// blush, and a small mouth. Eyes get class="char-eye" so index.html's
// blink keyframes can animate them independently of everything else.
function faceLayer() {
  return `
  <g id="layer-face" aria-hidden="true">
    <ellipse cx="45.5" cy="18" rx="2.4" ry="1" fill="#3f2e22" opacity="0.7" transform="rotate(-6 45.5 18)"/>
    <ellipse cx="54.5" cy="18" rx="2.4" ry="1" fill="#3f2e22" opacity="0.7" transform="rotate(6 54.5 18)"/>
    <g class="char-eye">
      <ellipse cx="45" cy="27" rx="3.1" ry="3.8" fill="#241a12"/>
      <circle cx="43.9" cy="25.6" r="1" fill="#ffffff"/>
    </g>
    <g class="char-eye">
      <ellipse cx="55" cy="27" rx="3.1" ry="3.8" fill="#241a12"/>
      <circle cx="53.9" cy="25.6" r="1" fill="#ffffff"/>
    </g>
    <ellipse cx="42.5" cy="32" rx="2.2" ry="1.2" fill="#e8798a" opacity="0.35"/>
    <ellipse cx="57.5" cy="32" rx="2.2" ry="1.2" fill="#e8798a" opacity="0.35"/>
    <path d="M 47 35.5 Q 50 37.5 53 35.5" stroke="#8a4a3f" stroke-width="1" fill="none" stroke-linecap="round"/>
  </g>`;
}

// Hair is split front/back so it can sandwich the head (back behind body,
// front over the forehead) and so index.html can sway each half on its own
// timing for a subtle cloth-sim feel. Each half gets its own cel gradient.
function hairLayers(gender, race) {
  if (race === "dragonborn") {
    return { back: `<g id="layer-hair-back" class="char-hair-back" aria-hidden="true"></g>`, front: `<g id="layer-hair-front" class="char-hair-front" aria-hidden="true"></g>` };
  }
  const tone = HAIR_COLORS[gender] || HAIR_COLORS.male;
  const hair = cel({ base: tone.base, shadow: tone.shadow });
  const defs = `<defs>${hair.defs}</defs>`;

  if (gender === "female") {
    return {
      back: `<g id="layer-hair-back" class="char-hair-back" aria-hidden="true">${defs}
        <path d="M 36 20 Q 30 40 34 70 Q 36 78 40 72 L 38 40 Z" fill="${hair.fill}" stroke="#2a190f" stroke-width="0.75"/>
        <path d="M 64 20 Q 70 40 66 70 Q 64 78 60 72 L 62 40 Z" fill="${hair.fill}" stroke="#2a190f" stroke-width="0.75"/>
      </g>`,
      front: `<g id="layer-hair-front" class="char-hair-front" aria-hidden="true">
        <path d="M 37 17 Q 50 6 63 17 Q 67 26 61 33 L 58 22 Q 50 17 42 22 L 39 33 Q 33 26 37 17 Z" fill="${hair.fill}" stroke="#2a190f" stroke-width="0.75"/>
        <path d="M 46 14 Q 50 11 54 14 L 52 20 L 48 20 Z" fill="${tone.highlight}" opacity="0.55"/>
      </g>`,
    };
  }
  if (gender === "male") {
    return {
      back: `<g id="layer-hair-back" class="char-hair-back" aria-hidden="true">${defs}</g>`,
      front: `<g id="layer-hair-front" class="char-hair-front" aria-hidden="true">
        <path d="M 38 15 Q 50 7 62 15 Q 63 22 58 25 Q 50 18 42 25 Q 37 22 38 15 Z" fill="${hair.fill}" stroke="#2a190f" stroke-width="0.75"/>
        <path d="M 45 12.5 Q 50 10 55 12.5 L 53 17 L 47 17 Z" fill="${tone.highlight}" opacity="0.5"/>
      </g>`,
    };
  }
  // non-binary
  return {
    back: `<g id="layer-hair-back" class="char-hair-back" aria-hidden="true">${defs}
      <path d="M 38 22 Q 33 36 36 58 Q 38 64 41 58 L 40 36 Z" fill="${hair.fill}" stroke="#2a190f" stroke-width="0.75"/>
      <path d="M 62 22 Q 67 36 64 58 Q 62 64 59 58 L 60 36 Z" fill="${hair.fill}" stroke="#2a190f" stroke-width="0.75"/>
    </g>`,
    front: `<g id="layer-hair-front" class="char-hair-front" aria-hidden="true">
      <path d="M 36 16 Q 50 5 64 16 Q 66 28 59 34 L 56 23 Q 50 18 44 23 L 41 34 Q 34 28 36 16 Z" fill="${hair.fill}" stroke="#2a190f" stroke-width="0.75"/>
      <path d="M 46 12.5 Q 50 10 54 12.5 L 52 18 L 48 18 Z" fill="${tone.highlight}" opacity="0.5"/>
    </g>`,
  };
}

const OUTFIT_COLORS = {
  fighter: { base: "#9a9fa8", shadow: "#5c606a" },
  wizard: { base: "#4a6b95", shadow: "#22374f" },
  rogue: { base: "#5a4534", shadow: "#2b1e15" },
  cleric: { base: "#d6cca8", shadow: "#8a7f5a" },
  ranger: { base: "#4c6e46", shadow: "#233720" },
  barbarian: { base: "#8f5a3a", shadow: "#4a2c1a" },
};

function outfitLayer(classId) {
  const tone = OUTFIT_COLORS[classId] || OUTFIT_COLORS.fighter;
  const cloth = cel(tone);
  const defs = `<defs>${cloth.defs}</defs>`;
  const c = { fill: cloth.fill, stroke: tone.shadow };

  if (classId === "wizard") {
    return `<g id="layer-outfit" aria-hidden="true">${defs}
      <path d="M 30 50 Q 50 40 70 50 L 74 112 L 26 112 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1.5"/>
      <path d="M 50 50 L 50 108" stroke="${c.stroke}" stroke-width="1"/>
      <path d="M 36 60 Q 50 56 64 60" stroke="#98c1d9" stroke-width="1.5" fill="none"/></g>`;
  }
  if (classId === "cleric") {
    return `<g id="layer-outfit" aria-hidden="true">${defs}
      <path d="M 32 50 Q 50 39 68 50 L 71 108 L 29 108 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1.5"/>
      <circle cx="50" cy="62" r="5" fill="#c9a227" stroke="#7a5f14" stroke-width="0.75"/>
      <path d="M 50 58 L 50 66 M 46 62 L 54 62" stroke="#7a5f14" stroke-width="1"/></g>`;
  }
  if (classId === "ranger") {
    return `<g id="layer-outfit" aria-hidden="true">${defs}
      <path d="M 34 50 Q 50 39 66 50 L 62 92 L 38 92 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1.5"/>
      <path d="M 33 54 L 67 54" stroke="#8a6a3a" stroke-width="2"/></g>`;
  }
  if (classId === "barbarian") {
    return `<g id="layer-outfit" aria-hidden="true">${defs}
      <path d="M 35 50 Q 50 40 65 50 L 60 90 L 40 90 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1.5"/>
      <path d="M 33 50 L 40 58 M 67 50 L 60 58" stroke="${c.stroke}" stroke-width="2"/></g>`;
  }
  if (classId === "fighter") {
    return `<g id="layer-outfit" aria-hidden="true">${defs}
      <path d="M 33 50 Q 50 37 67 50 L 63 92 L 37 92 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1.5"/>
      <path d="M 42 58 L 58 58 M 40 68 L 60 68 M 39 78 L 61 78" stroke="#5c606a" stroke-width="1"/>
      <circle cx="50" cy="55" r="3" fill="#c9a227" stroke="#7a5f14" stroke-width="0.5"/></g>`;
  }
  // rogue
  return `<g id="layer-outfit" aria-hidden="true">${defs}
    <path d="M 35 50 Q 50 39 65 50 L 61 92 L 39 92 Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1.5"/>
    <path d="M 33 48 Q 50 60 67 48 L 67 54 Q 50 66 33 54 Z" fill="${c.stroke}" opacity="0.6"/>
    <path d="M 40 92 L 44 100 M 60 92 L 56 100" stroke="${c.stroke}" stroke-width="1"/></g>`;
}

function weaponLayer(classId) {
  if (classId === "fighter") {
    return `<g id="layer-weapon" aria-hidden="true">
      <rect x="72" y="34" width="4" height="52" rx="1" fill="#c7cbd1" stroke="#5c606a" stroke-width="0.75"/>
      <rect x="68" y="82" width="12" height="6" rx="1" fill="#7a5f14"/>
      <rect x="70" y="86" width="8" height="14" rx="1" fill="#4a3728"/></g>`;
  }
  if (classId === "wizard") {
    return `<g id="layer-weapon" aria-hidden="true">
      <rect x="74" y="20" width="3" height="76" rx="1.5" fill="#8a5a2b" stroke="#4a2e12" stroke-width="0.5"/>
      <circle cx="75.5" cy="18" r="5" fill="#98c1d9" stroke="#3d5a80" stroke-width="1"/></g>`;
  }
  if (classId === "cleric") {
    return `<g id="layer-weapon" aria-hidden="true">
      <rect x="73" y="40" width="3" height="46" rx="1.5" fill="#8a8f98" stroke="#4a4e57" stroke-width="0.5"/>
      <circle cx="74.5" cy="36" r="6" fill="#c7cbd1" stroke="#5c606a" stroke-width="1"/></g>`;
  }
  if (classId === "ranger") {
    return `<g id="layer-weapon" aria-hidden="true">
      <path d="M 76 18 Q 88 55 76 92" stroke="#6b4a2b" stroke-width="2.5" fill="none"/>
      <path d="M 76 18 L 76 92" stroke="#d9c9a3" stroke-width="0.75"/></g>`;
  }
  if (classId === "barbarian") {
    return `<g id="layer-weapon" aria-hidden="true">
      <rect x="72" y="30" width="4" height="58" rx="1" fill="#8a8f98" stroke="#4a4e57" stroke-width="0.75"/>
      <path d="M 66 26 L 82 26 L 78 40 L 70 40 Z" fill="#c7cbd1" stroke="#5c606a" stroke-width="0.75"/></g>`;
  }
  // rogue
  return `<g id="layer-weapon" aria-hidden="true">
    <path d="M 24 60 L 16 68 L 22 70 L 28 64 Z" fill="#c7cbd1" stroke="#5c606a" stroke-width="0.5"/>
    <path d="M 76 60 L 84 68 L 78 70 L 72 64 Z" fill="#c7cbd1" stroke="#5c606a" stroke-width="0.5"/></g>`;
}

/**
 * Build the full layered SVG markup for the character creator preview /
 * combat avatar. Stacking order (back to front): hair-back, body, outfit,
 * face, hair-front, weapon. Hair and eyes carry classes (char-hair-back,
 * char-hair-front, char-eye) that index.html animates independently — see
 * the "Cel-shaded avatar micro-animation" block in index.html's <style>.
 * @param {{race:string, class:string, gender:string}} selection
 * @returns {string} inner SVG markup (layers only, no outer <svg> tag)
 */
function buildAvatarLayers({ race, class: classId, gender }) {
  const hair = hairLayers(gender, race);
  return [
    hair.back,
    bodyLayer(race, gender),
    outfitLayer(classId),
    faceLayer(),
    hair.front,
    weaponLayer(classId),
  ].join("\n");
}

/* -------------------------------- Monster Avatars ---------------------------- */
// Each monster shape is a distinct silhouette so Goblin / Orc / Dragon read
// clearly different at a glance in the combat arena, independent of size.

function goblinSvg() {
  return `
  <svg viewBox="0 0 100 100" role="img" aria-label="Goblin Scavenger">
    <ellipse cx="50" cy="70" rx="20" ry="18" fill="#6b8f4e" stroke="#3d5230" stroke-width="1.5"/>
    <path d="M 30 66 L 18 58 L 22 70 Z" fill="#5a7a42" stroke="#3d5230" stroke-width="1"/>
    <path d="M 70 66 L 82 58 L 78 70 Z" fill="#5a7a42" stroke="#3d5230" stroke-width="1"/>
    <ellipse cx="50" cy="40" rx="16" ry="15" fill="#7fa15a" stroke="#3d5230" stroke-width="1.5"/>
    <path d="M 36 30 L 30 16 L 40 26 Z" fill="#7fa15a" stroke="#3d5230" stroke-width="1"/>
    <path d="M 64 30 L 70 16 L 60 26 Z" fill="#7fa15a" stroke="#3d5230" stroke-width="1"/>
    <circle cx="43" cy="40" r="3.5" fill="#f2e14c"/>
    <circle cx="57" cy="40" r="3.5" fill="#f2e14c"/>
    <circle cx="43" cy="40" r="1.4" fill="#1a1a1a"/>
    <circle cx="57" cy="40" r="1.4" fill="#1a1a1a"/>
    <path d="M 44 50 Q 50 54 56 50" stroke="#2f3d24" stroke-width="1.5" fill="none"/>
    <path d="M 8 76 L 26 66 L 30 74 L 14 84 Z" fill="#9a9a9a" stroke="#5c5c5c" stroke-width="1"/>
  </svg>`;
}

function orcSvg() {
  return `
  <svg viewBox="0 0 100 100" role="img" aria-label="Orc Berserker">
    <path d="M 26 88 Q 50 30 74 88 Z" fill="#5d7a4a" stroke="#33422b" stroke-width="1.5"/>
    <rect x="20" y="60" width="14" height="26" rx="3" fill="#4f6b3f" stroke="#33422b" stroke-width="1"/>
    <rect x="66" y="60" width="14" height="26" rx="3" fill="#4f6b3f" stroke="#33422b" stroke-width="1"/>
    <ellipse cx="50" cy="34" rx="17" ry="16" fill="#6d8c56" stroke="#33422b" stroke-width="1.5"/>
    <path d="M 34 30 L 24 20 L 32 34 Z" fill="#5d7a4a" stroke="#33422b" stroke-width="1"/>
    <path d="M 66 30 L 76 20 L 68 34 Z" fill="#5d7a4a" stroke="#33422b" stroke-width="1"/>
    <circle cx="43" cy="33" r="3" fill="#e8542e"/>
    <circle cx="57" cy="33" r="3" fill="#e8542e"/>
    <path d="M 40 46 L 44 40 M 60 46 L 56 40" stroke="#eaeaea" stroke-width="2" stroke-linecap="round"/>
    <path d="M 20 50 L 8 30 L 14 52 Z" fill="#8a8f98" stroke="#4a4e57" stroke-width="1"/>
  </svg>`;
}

function dragonSvg() {
  return `
  <svg viewBox="0 0 100 100" role="img" aria-label="Young Red Dragon">
    <path d="M 50 92 Q 20 78 22 50 Q 24 34 40 26 Q 34 12 50 8 Q 66 12 60 26 Q 76 34 78 50 Q 80 78 50 92 Z"
          fill="#a83c2c" stroke="#5c1c12" stroke-width="1.5"/>
    <path d="M 10 46 Q 24 30 40 40 Q 30 52 10 46 Z" fill="#c24b36" stroke="#5c1c12" stroke-width="1"/>
    <path d="M 90 46 Q 76 30 60 40 Q 70 52 90 46 Z" fill="#c24b36" stroke="#5c1c12" stroke-width="1"/>
    <path d="M 40 24 L 44 10 L 48 24 Z" fill="#7a2318" stroke="#5c1c12" stroke-width="1"/>
    <path d="M 52 24 L 56 10 L 60 24 Z" fill="#7a2318" stroke="#5c1c12" stroke-width="1"/>
    <circle cx="42" cy="34" r="3.2" fill="#f2c94c"/>
    <circle cx="58" cy="34" r="3.2" fill="#f2c94c"/>
    <circle cx="42" cy="34" r="1.3" fill="#1a0d08"/>
    <circle cx="58" cy="34" r="1.3" fill="#1a0d08"/>
    <path d="M 44 44 Q 50 48 56 44 L 54 50 L 46 50 Z" fill="#5c1c12"/>
    <path d="M 50 92 Q 60 96 68 90" stroke="#5c1c12" stroke-width="2" fill="none"/>
  </svg>`;
}

const MONSTER_SVG_BUILDERS = { goblin: goblinSvg, orc: orcSvg, dragon: dragonSvg };

/**
 * Build a standalone monster SVG (with its own outer <svg>) keyed by the
 * monster's `shape` field, so each difficulty tier looks distinct.
 */
function buildMonsterSvg(shape) {
  const builder = MONSTER_SVG_BUILDERS[shape] || goblinSvg;
  return builder();
}
