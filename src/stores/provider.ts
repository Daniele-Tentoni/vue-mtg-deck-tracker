import { supabase } from '@/services/supabaseService';
import type { Database } from '@/types/database.types';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export type Provider = Database['public']['Tables']['user_tokens']['Row'];

const custom = ['Challonge'];
const supported = ['Twitch'];
const all = [...custom, ...supported];

export const useProviders = defineStore('provider', () => {
  const providers = ref<Provider[]>([]);

  const visibles = computed(() => providers.value.filter((p) => p.provider !== 'email'));

  const selectable = computed(() =>
    all.filter((f) => !providers.value.map((m) => m.provider).includes(f)),
  );

  async function loadAsync() {
    const { data: identities, error } = await supabase.auth.getUserIdentities();
    if (error) {
      console.error("I can't fetch updated identities");
    } else if (identities) {
      providers.value = identities.identities.map((m) => ({
        user_id: m.user_id,
        provider: m.provider,
        access_token: '',
        refresh_token: '',
        created_at: m.created_at!,
      }));
    }

    const { data } = await supabase.from('user_tokens').select('*');
    if (data) {
      data.forEach((d) => {
        providers.value.push(d);
      });
    }
  }

  async function unlink(item: Provider) {
    if (custom.includes(item.provider)) {
      const me = await supabase.auth.getUser();
      if (me.error || !me.data.user) {
        alert('Something went wrong');
        return;
      }

      // TODO: Ask confirmation
      const { error } = await supabase.from('user_tokens').delete().eq('user_id', me.data.user?.id).eq('provider', item.provider);
      if (error) {
        alert("I can't unlink your identity");
        return;
      }

      alert('Unlink correctly');
      await loadAsync();
      return;
    }

    const { data: identities, error } = await supabase.auth.getUserIdentities();

    if (error) {
      alert('Something went wrong');
      return;
    }

    if (identities?.identities) {
      const identity = identities.identities.find((f) => f.provider === item.provider);
      if (identity) {
        const { data, error } = await supabase.auth.unlinkIdentity(identity);
        if (error) {
          if (error.code === 'single_identity_not_deletable') {
            alert(error.message);
            return;
          }

          alert("I can't unlink your identity");
        }

        if (data) {
          alert('Unlink correctly');
      await loadAsync();
          return;
        }

        alert("Why you don't have data?");
      }
    }

    alert('I have not found identities');
  }

  return { selectable, visibles, loadAsync, unlink };
});
