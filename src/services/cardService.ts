
export function isSideboard(line: string) {
  return line.toLowerCase().startsWith('sideboard');
}

export function isMainboard(line: string) {
  return line.toLowerCase().startsWith('mainboard');
}

export function parseCard(match: RegExpMatchArray) {
  const [, qty, name, set, collectorNumber, foilFlag] = match;
  if (!name) {
    return;
  }

  return {
    quantity: qty ? Number.parseInt(qty, 10) : 1, // default 1
    name: name.trim(),
    set: set,
    collectorNumber: collectorNumber,
    foil: !!foilFlag,
  } as Card;
}

export function trimLines(text: string) {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

export function trimCards(line: string) {
  const match = line.match(
    /^(?:(\d+)\s+)?(.+?)(?:\s+\(([A-Z0-9]+)\))?(?:\s+(\d+))?\s*(\*F\*|\*E\*)?$/,
  );
  if (match) {
    const card = parseCard(match);
    return card;
  }

  console.warn('Linea non parsata:', line);
  return undefined;
}

export type Card = {
  name: string;
  quantity: number;
  legal?: boolean;
  set?: string;
  collectorNumber?: string;
  foil?: boolean;
};

export type Decklist = {
  main: Card[];
  side: Card[];
};
