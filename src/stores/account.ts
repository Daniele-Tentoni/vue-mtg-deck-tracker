import { supabase } from '@/services/supabaseService';
import type { User } from '@supabase/supabase-js';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useAccount = defineStore('account', () => {
  const account = ref<User>();

  const authenticated = computed(() => Boolean(account.value?.id));

  async function load() {
    const { data, error } = await supabase.auth.getUser();
    if (data?.user) {
      account.value = data.user;

      supabase.auth.onAuthStateChange((_, session) => {
        account.value = session?.user || undefined;
      });
    }

    if (error?.name !== 'AuthSessionMissingError') {
      console.error(error);
    }
  }

  async function logout() {
    console.log('Executing logout from the application');
    await supabase.auth.signOut();
  }

  return { account, authenticated, load, logout };
});
