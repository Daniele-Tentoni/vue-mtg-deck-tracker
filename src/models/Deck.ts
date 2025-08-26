import type { MatchType, MatchWithArchetypeType } from '@/stores/matches';

export function isArch(obj: unknown): obj is { id: number; name: string } {
  return typeof obj === 'object' && obj !== null && 'name' in obj;
}

export class MatchClass {
  created_at: string = '';
  creator: string | null = '';
  game_one_win: number | null = null;
  id: number = 0;
  my_archetype: number | { id: number; name: string } | null = null;
  note: string | null = null;
  side_in: string | null = null;
  side_one_win: number | null = null;
  side_out: string | null = null;
  side_second_win: number | null = null;
  their_archetype: number | { id: number; name: string } | null = null;

  my_name(): string {
    return isArch(this.my_archetype) ? this.my_archetype.name : '';
  }

  their_name(): string {
    return isArch(this.their_archetype) ? this.their_archetype.name : '';
  }

  /*numMatch(): number {
    return this.win + this.loss
  }

  matchWinRate(): number {
    const total = this.numMatch()
    return total > 0 ? this.win / total : 0
  }

  gameWinRate(): number {
    const total = this.game_one_win + this.side_one_win + this.side_second_win
    return total > 0 ? this.gwin / total : 0
  }

  g1WinRate(): number {
    const total = this.g1win + this.g1loss
    return total > 0 ? this.g1win / total : 0
  }

  sideWinRate(): number {
    const total = this.sidewin + this.sideloss
    return total > 0 ? this.sidewin / total : 0
  }*/

  constructor(init?: Partial<MatchType | MatchWithArchetypeType>) {
    Object.assign(this, init);
  }
}

function gameNumber(m: MatchClass) {
  if (m.game_one_win === null) {
    return 0;
  }

  if (m.side_one_win === null) {
    return 1;
  }

  if (m.side_second_win === null) {
    return 2;
  }

  return 3;
}

export class Deck {
  name: string = '';
  matches: MatchClass[] = [];

  numMatch(): number {
    return 0; // this.matches.sum((s) => s.numMatch())
  }

  matchWinRate(): number {
    return 0; // this.matches.avg((s) => s.matchWinRate())
  }

  rawDecimal(): number {
    if (this.gamesPlayed() === 0) {
      return 0;
    }
    return this.gamesWon() / this.gamesPlayed();
  }

  tier(): number {
    const raw = this.rawDecimal();
    if (raw >= 0.55) {
      return 1;
    }

    if (raw >= 0.5) {
      return 2;
    }

    return 3;
  }

  gamesWinRate(): string {
    return new Intl.NumberFormat('it-IT', {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(this.gamesWon() / this.gamesPlayed());
  }

  gamesWon(): number {
    return this.g1sWon() + this.s1sWon() + this.s2sWon();
  }

  g1sWon(): number {
    return this.matches.sum((s) => {
      if (s.my_name() === this.name) {
        return s.game_one_win === 0 ? 1 : 0;
      }
      return s.game_one_win === 1 ? 1 : 0;
    });
  }

  s1sWon(): number {
    return this.matches.sum((s) => {
      if (s.my_name() === this.name) {
        return s.side_one_win === 0 ? 1 : 0;
      }
      return s.side_one_win === 1 ? 1 : 0;
    });
  }

  s2sWon(): number {
    return this.matches.sum((s) => {
      if (s.my_name() === this.name) {
        return s.side_second_win === 0 ? 1 : 0;
      }
      return s.side_second_win === 1 ? 1 : 0;
    });
  }

  gamesPlayed(): number {
    return this.matches.map(gameNumber).sum();
  }

  sideWinRate(): number {
    return 0; // this.matches.sum((s) => s.numMatch())
  }

  constructor(init?: Partial<Deck>) {
    Object.assign(this, init);
  }
}

export const pauperArchetypes = [
  // Aggro / Tempo
  'Stompy',

  // Midrange
  'Mono-Black Control',
  'Orzhov Pestilence',
  'Golgari Midrange',
  'Jund Cascade',
  'Blue-Black Control',
  'Blue-Red Control',
  'Boros Monarch',

  // Control / Value
  'Familiars',
  'Tron',
  'Jeskai Ephemerate',
  'Azorius Ephemerate',

  // Combo
  'Inside Out Combo',
  'Cycle Storm',
  'Tortured Existence',

  // Tematici / Tribali
  'Slivers',
  'Goblins',
];
