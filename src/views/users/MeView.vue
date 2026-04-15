<template>
  <v-container fluid class="fill-height">
    Me {{ me.account?.email }}, user since {{ since }}
    <v-row v-if="loading">
      <v-icon>fa fa-spinner fa-spin</v-icon>
    </v-row>
    <v-row v-else>
      <v-col>
        <v-list>
          <v-list-item v-for="m in matches" :key="m.id">
            <template #prepend>
              {{ m.tournament_id }}
            </template>
            <template #title>
              {{ m.their_archetype.name }}
            </template>
            <template #subtitle>
              {{ m.my_archetype.name }}
            </template>
            <template #default v-if="m.note">{{ m.note }}</template>
            <template #append>
              <v-icon>fa fa-trash</v-icon>
            </template>
          </v-list-item>
        </v-list>
      </v-col>
    </v-row>
    <v-row v-if="errorDeck">
      <v-col>
        <v-alert type="error"> {{ errorDeck }} </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useAccount } from '@/stores/account';
import { useDeck, type MatchWithArchetypeType } from '@/stores/matches';
import { PostgrestError } from '@supabase/supabase-js';
import { computed, onMounted, ref, watch } from 'vue';
import { VIcon } from 'vuetify/components';

const me = useAccount();

const since = computed(() => {
  if (!me.account?.created_at) return 'unknown';
  return new Date(me.account.created_at).toLocaleString();
});

const matches = ref<MatchWithArchetypeType[]>();

const loading = ref(false);

const decks = useDeck();

const errorDeck = ref<string>();

async function loadDecks() {
  if (!me.account) return;

  try {
    loading.value = true;
    matches.value = [];
    const data = await decks.getByPlayer(me.account.id);
    if (data) {
      matches.value = data;
    }
  } catch (error) {
    console.error('Error loading matches: ', error);
    if (error instanceof PostgrestError) {
      errorDeck.value = error.message;
    }
  } finally {
    loading.value = false;
  }
}

watch(
  () => me.account,
  async () => {
    await loadDecks();
  },
);

onMounted(async () => await loadDecks());
</script>
