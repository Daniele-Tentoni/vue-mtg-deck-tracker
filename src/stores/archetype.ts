import { supabase } from '@/services/supabaseService';
import { defineStore } from 'pinia';
import type { Archetype } from './matches';
import { ref } from 'vue';

export const useArchetype = defineStore('archetype', () => {
  const archetypes = ref<Archetype[]>([]);

  async function loadAsync() {
    const remoteArchetypes = await supabase
      .from('archetypes')
      .select('*')
      .order('name', { ascending: true });
    if (remoteArchetypes.data) {
      archetypes.value = remoteArchetypes.data;
    }
  }

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
    const { data: archetype, error } = await supabase
      .from('archetypes')
      .select('*')
      .eq('name', name)
      .single();
    if (archetype) {
      return archetype;
    }

    if (error) {
      console.error(error);
      throw error;
    }
  }

  return { archetypes, loadAsync, get, getByName };
});
