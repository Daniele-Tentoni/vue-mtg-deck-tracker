<script setup lang="ts">
import NewMatchDialog from '@/components/NewMatchDialog.vue';
import WinrateTooltip from '@/components/WinrateTooltip.vue';
import { Deck, isArch } from '@/models/Deck';
import { useAccount } from '@/stores/account';
import { useArchetype } from '@/stores/archetype';
import { useDeck } from '@/stores/matches';
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { useDisplay } from 'vuetify';
import type { SortItem } from 'vuetify/lib/components/VDataTable/composables/sort.mjs';

const route = useRoute();
const format = computed(() => route.params.format?.toString());
const formatName = computed(() => format.value?.substring(0, 1).toUpperCase().concat(format.value.substring(1)))

const _headers = [
  {
    title: 'Archetype',
    key: 'name',
  },
  {
    title: 'Winrate',
    key: 'winrate',
    sortRaw(a: Deck, b: Deck) {
      return a.rawDecimal() - b.rawDecimal();
    },
  },
  {
    title: 'Game won',
    key: 'game_won',
    sortRaw(a: Deck, b: Deck) {
      return b.gamesWon() - a.gamesWon();
    },
    mobile: false,
  },
  {
    title: 'Games played',
    key: 'all_games',
    sortRaw(a: Deck, b: Deck) {
      return b.gamesPlayed() - a.gamesPlayed();
    },
    mobile: false,
  },
  {
    title: 'Tier',
    key: 'tier',
    sortable: false,
  },
];
const headers = computed(() =>
  _headers.filter((f) => f.mobile === undefined || f.mobile === mobile.value),
);

const account = useAccount();

const decks = useDeck();
const items = computed(() => {
  const mtc = decks.matches;
  const one = mtc.map((m) => isArch(m.my_archetype) && m.my_archetype.name);
  const two = mtc.map((m) => isArch(m.their_archetype) && m.their_archetype.name);
  const three = one.concat(two);
  const s = [...new Set(three)];
  return s.map((m) => {
    const mtcs = mtc.filter((f) => f.my_name() === m || f.their_name() === m);
    return new Deck({ name: m.toString(), matches: mtcs });
  });
});

const loading = ref(false);

const sortBy = ref<SortItem[]>([{ key: 'winrate', order: 'desc' }]);

onMounted(async () => {
  try {
    loading.value = true;
    await decks.loadAsync();
    await archetypeStore.loadAsync();
  } finally {
    loading.value = false;
  }
});

const isDev = import.meta.env.DEV;

const { mobile } = useDisplay();

const archetypeStore = useArchetype();

const imageUrl = computed(() => (name: string) => {
  const arc = archetypeStore.archetypes.find((f) => f.name === name);
  if (arc?.image) {
    return arc.image;
  }

  return 'https://cards.scryfall.io/art_crop/front/5/2/52558748-6893-4c72-a9e2-e87d31796b59.jpg?1559959349';
});
</script>

<template>
  <VContainer fluid>
    <VRow>
      <VCol> {{ formatName }} win rates </VCol>
      <VSpacer></VSpacer>
      <VCol cols="auto" v-if="account.authenticated">
        <NewMatchDialog></NewMatchDialog>
      </VCol>
    </VRow>
    <VRow>
      <VCol>
        <VDataTable :headers :items item-value="id" :loading v-model:sort-by="sortBy">
          <template v-slot:[`item.name`]="{ item }">
            <VAvatar v-if="!mobile" class="me-2" data-test="archetype-image"
              ><VImg :src="imageUrl(item.name)" :alt="item.name"></VImg
            ></VAvatar>
            <RouterLink :to="{ name: 'deck-home', params: { format, deck: item.name } }">
              {{ item.name }}
            </RouterLink>
          </template>
          <template v-slot:[`item.winrate`]="{ item }">
            <WinrateTooltip :deck="item"></WinrateTooltip>
          </template>
          <template v-slot:[`item.game_won`]="{ item }">
            {{ item.gamesWon() }}
          </template>
          <template v-slot:[`item.all_games`]="{ item }">
            {{ item.gamesPlayed() }}
          </template>
          <template v-slot:[`item.tier`]="{ item }">
            <VChip :color="item.tierColor()">T{{ item.tier() }}</VChip>
          </template>
        </VDataTable>
      </VCol>
    </VRow>
    <VRow>
      <VCol cols="12" md="6">
        <p class="text-h6">I'm looking for more data!</p>
        <p>
          I need more data to be more accurated calculating win rates and other metrics. You can
          contact me to help growing the database sending me yor results or registering and
          uploading them.
        </p>
      </VCol>
      <VCol cols="12" md="6">
        <p class="text-h6">How you can contribute</p>
        <p>
          You can open an Issue or submit a Pull request to help me developing this site, or you can
          create now an account and start submit your game data.
        </p>
      </VCol>
      <VCol cols="12" md="6">
        <p class="text-h6">How I calculate win rates</p>
        <p>
          Number of game one won + number of first side game won + number of second side won / total
          number of games played. A match finished with a draw cause the win rate to be flatten to
          the 50%. The sum of my win rate vs another archetype and the my rate of another archetype
          vs must be the 100%.
        </p>
      </VCol>
      <VCol cols="12" md="6">
        <p class="text-h6">How I calculate tiers</p>
        <p>
          An archetype with winrate above the 55% will be marked as Tier 1, below 55% will be a Tier
          2, below 50% a Tier 3. Those indicates strong decks, good decks and others. No other
          tiers, no middle tiers.
        </p>
      </VCol>
    </VRow>
    <VRow v-if="isDev">
      <VCol>
        <VExpansionPanels>
          <VExpansionPanel title="Items" :text="JSON.stringify(items)"> </VExpansionPanel>
        </VExpansionPanels>
      </VCol>
    </VRow>
  </VContainer>
</template>
