import { supabase } from '@/services/supabaseService';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useTournament = defineStore('tournaments', () => {
  const t = ref();

  async function loadAsync(player: string) {
    console.log('loadAsync', player);
    const a = await supabase.from('tournaments').select('*');
    if (a.data) {
      t.value = a.data;
    }
  }

  return { t, loadAsync };
});
