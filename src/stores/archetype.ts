import { supabase } from '@/services/supabaseService';
import { defineStore } from 'pinia';

export const useArchetype = defineStore('archetype', () => {
  async function get(id: number) {
    const { data: archetypes, error } = await supabase.from('archetypes').select('*').eq('id', id);
    if (archetypes) {
      return archetypes;
    }

    if (error) {
      console.error(error);
    }
  }

  async function getByName(name: string) {
    const { data: archetypes, error } = await supabase
      .from('archetypes')
      .select('*')
      .eq('name', name);
    if (archetypes) {
      return archetypes;
    }

    if (error) {
      console.error(error);
    }
  }

  return { get, getByName };
});
