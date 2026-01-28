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
      .select(MatchWithArchetypeQueryString).single()) as unknown as {
        data: MatchWithArchetypeType;
        error: PostgrestError;
      };

    if (error) {
      throw error;
    }

    matches.value.push(new MatchClass(data));
    return data;
  }

  async function loadAsync() {
    const { data } = (await supabase
      .from('matches')
      .select(MatchWithArchetypeQueryString)) as unknown as { data: MatchWithArchetypeType[] };
    if (data) {
      matches.value = [];
      data.forEach((match) => matches.value.push(new MatchClass(match)));
    }
  }

  async function getByArchetype(archetypeId: number): Promise<MatchWithArchetypeType[] | undefined> {
    const { data } = await supabase
    .from('matches')
    .select(MatchWithArchetypeQueryString)
    .or(`my_archetype.eq.${archetypeId},their_archetype.eq.${archetypeId}`)
    if (data) {
      return data as unknown as MatchWithArchetypeType[];
    }
  }

  return { matches, createMatchAsync, loadAsync, getByArchetype };
});
