import { MatchClass } from './../models/Deck';
import { supabase } from '@/services/supabaseService';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Database } from '@/types/database.types';
import type { PostgrestError } from '@supabase/supabase-js';

export type Archetype = Database['public']['Tables']['archetypes']['Row'];
export type MatchType = Database['public']['Tables']['matches']['Row'];
export type MatchWithArchetypeType = MatchType & {
  my_archetype: Pick<Database['public']['Tables']['archetypes']['Row'], 'id' | 'name'>;
  their_archetype: Pick<Database['public']['Tables']['archetypes']['Row'], 'id' | 'name'>;
};
type MatchInsert = Database['public']['Tables']['matches']['Insert'];
export type MatchTimeFilter = 'all' | '4w' | '4m';

function getStartDateIso(filter: MatchTimeFilter): string | undefined {
  if (filter === 'all') {
    return undefined;
  }

  const now = new Date();
  const start = new Date(now);

  if (filter === '4w') {
    start.setDate(start.getDate() - 28);
  } else {
    start.setMonth(start.getMonth() - 4);
  }

  return start.toISOString();
}

const MatchWithArchetypeQueryString = `
    *,
    my_archetype:archetypes!matches_my_archetype_fkey (
      id,
      name
    ),
    their_archetype:archetypes!matches_their_archetype_fkey (
      id,
      name
    )
  `;

export const useDeck = defineStore('match', () => {
  const matches = ref<MatchClass[]>([]);

  async function createMatchAsync(newMatch: MatchInsert) {
    const { data, error } = (await supabase
      .from('matches')
      .insert(newMatch)
      .select(MatchWithArchetypeQueryString)
      .single()) as unknown as {
      data: MatchWithArchetypeType;
      error: PostgrestError;
    };

    if (error) {
      throw error;
    }

    matches.value.push(new MatchClass(data));
    return data;
  }

  async function loadAsync(filter: MatchTimeFilter = 'all') {
    const startDateIso = getStartDateIso(filter);

    let query = supabase.from('matches').select(MatchWithArchetypeQueryString);
    if (startDateIso) {
      query = query.gte('created_at', startDateIso);
    }

    const { data } = (await query) as unknown as { data: MatchWithArchetypeType[] };
    if (data) {
      matches.value = [];
      data.forEach((match) => matches.value.push(new MatchClass(match)));
    }
  }

  async function getByArchetype(
    archetypeId: number,
    filter: MatchTimeFilter = 'all',
  ): Promise<MatchWithArchetypeType[] | undefined> {
    const startDateIso = getStartDateIso(filter);

    let query = supabase
      .from('matches')
      .select(MatchWithArchetypeQueryString)
      .or(`my_archetype.eq.${archetypeId},their_archetype.eq.${archetypeId}`);

    if (startDateIso) {
      query = query.gte('created_at', startDateIso);
    }

    const { data } = await query;
    if (data) {
      return data as unknown as MatchWithArchetypeType[];
    }
  }

  async function getByPlayer(
    playerId: string,
    filter: MatchTimeFilter = 'all',
  ): Promise<MatchWithArchetypeType[]> {
    const startDateIso = getStartDateIso(filter);

    let query = supabase
      .from('matches')
      .select(MatchWithArchetypeQueryString)
      .eq('creator', playerId);

    if (startDateIso) {
      query = query.gte('created_at', startDateIso);
    }

    const { data, error } = await query;
    if (error) {
      throw error;
    }

    return data as unknown as MatchWithArchetypeType[];
  }

  return { matches, createMatchAsync, loadAsync, getByArchetype, getByPlayer };
});
