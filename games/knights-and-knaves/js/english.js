// Presentation only: the engine's AST, truth tables and difficulty rules are unchanged.
export const nameOf = (i) => String.fromCharCode(65 + i);
export function claim(p) {
  const xs = (p.xs || []).map(nameOf);
  const group = `{${xs.join(', ')}}`;
  switch (p.t) {
    case 'knight': return `${xs[0]} is a Knight`;
    case 'knave': return `${xs[0]} is a Knave`;
    case 'same': return `${xs[0]} and ${xs[1]} have the same type`;
    case 'diff': return `${xs[0]} and ${xs[1]} have different types`;
    case 'allk': return `Everyone in ${group} is a Knight`;
    case 'nonel': return `Everyone in ${group} is a Knave`;
    case 'somal': return `At least one person in ${group} is a Knight`;
    case 'exactly': return `Exactly ${p.k} people in ${group} are Knights`;
    case 'atleast': return `At least ${p.k} people in ${group} are Knights`;
    case 'atmost': return `At most ${p.k} people in ${group} are Knights`;
    case 'and': return `(${claim(p.a)}) AND (${claim(p.b)})`;
    case 'or': return `(${claim(p.a)}) OR (${claim(p.b)})`;
    case 'not': return `NOT (${claim(p.a)})`;
    case 'imp': return `IF (${claim(p.a)}) THEN (${claim(p.b)})`;
    case 'iff': return `(${claim(p.a)}) IFF (${claim(p.b)})`;
    default: throw new Error(`Unsupported claim: ${p.t}`);
  }
}
