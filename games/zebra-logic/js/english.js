// Hosting presentation only. The original engine's IDs, constraints and names remain unchanged.
export const CAT_SHORT = ['Person', 'Color', 'Pet', 'Drink', 'Job', 'Hobby'];
export const CATALOG = [
  ['Ming', 'Hong', 'Gang', 'Mei', 'Qiang', 'Lin'],
  ['Red', 'Blue', 'Green', 'Yellow', 'White', 'Purple'],
  ['Dog', 'Cat', 'Bird', 'Fish', 'Rabbit', 'Turtle'],
  ['Tea', 'Milk', 'Soda', 'Juice', 'Coffee', 'Soymilk'],
  ['Teacher', 'Doctor', 'Lawyer', 'Driver', 'Chef', 'Artist'],
  ['Piano', 'Go', 'Calligraphy', 'Basketball', 'Photography', 'Gardening'],
];
export const labelOf = (item, N) => `${CAT_SHORT[Math.floor(item / N)]}:${CATALOG[Math.floor(item / N)][item % N]}`;
export function describeClue(clue, N) {
  const a = labelOf(clue.a, N);
  if (clue.k === 'at') return `${a} is in house ${clue.p + 1}.`;
  if (clue.k === 'not') return `${a} is not in house ${clue.p + 1}.`;
  const b = labelOf(clue.b, N);
  switch (clue.k) {
    case 'same': return `${a} and ${b} are in the same house.`;
    case 'not_same': return `${a} and ${b} are in different houses.`;
    case 'direct_left': return `${a} is directly left of ${b}.`;
    case 'direct_right': return `${a} is directly right of ${b}.`;
    case 'side_by_side': return `${a} and ${b} are next door to each other.`;
    case 'not_side_by_side': return `${a} and ${b} are not next door (same house is allowed).`;
    case 'somewhere_left': return `${a} is somewhere left of ${b}.`;
    case 'somewhere_right': return `${a} is somewhere right of ${b}.`;
    case 'n_between': return `${a} and ${b} have exactly ${clue.n} houses between them.`;
    default: throw new Error(`Unknown clue: ${clue.k}`);
  }
}
