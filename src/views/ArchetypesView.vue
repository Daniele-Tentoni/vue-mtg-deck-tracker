<script setup lang="ts">
import ArchetypeAvatar from '@/components/ArchetypeAvatar.vue';
import NewMatchDialog from '@/components/NewMatchDialog.vue';
import WinrateTooltip from '@/components/WinrateTooltip.vue';
import { Deck, isArch } from '@/models/Deck';
import { useAccount } from '@/stores/account';
import { useArchetype } from '@/stores/archetype';
import { useDeck } from '@/stores/matches';
import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { useDisplay } from 'vuetify';
import type { SortItem } from 'vuetify/lib/components/VDataTable/composables/sort.mjs';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const route = useRoute();
const format = computed(() => route.params.format?.toString());
const formatName = computed(() =>
  format.value?.substring(0, 1).toUpperCase().concat(format.value.substring(1)),
);

const headers = computed(() => {
  const localizedHeaders = [
    {
      title: t('archetypes.headers.archetype'),
      key: 'name',
    },
    {
      title: t('archetypes.headers.winrate'),
      key: 'winrate',
      sortRaw(a: Deck, b: Deck) {
        return a.rawDecimal() - b.rawDecimal();
      },
    },
    {
      title: t('archetypes.headers.gameWon'),
      key: 'game_won',
      sortRaw(a: Deck, b: Deck) {
        return b.gamesWon() - a.gamesWon();
      },
      mobile: false,
    },
    {
      title: t('archetypes.headers.gamesPlayed'),
      key: 'all_games',
      sortRaw(a: Deck, b: Deck) {
        return b.gamesPlayed() - a.gamesPlayed();
      },
      mobile: false,
    },
    {
      title: t('archetypes.headers.tier'),
      key: 'tier',
      sortable: false,
    },
  ];

  return localizedHeaders.filter((f) => f.mobile === undefined || f.mobile === mobile.value);
});

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
const timeframe = ref<'all' | '4w' | '4m'>('all');
const timeframeOptions = computed(() => [
  { title: t('archetypes.timeframe.all'), value: 'all' },
  { title: t('archetypes.timeframe.last4Weeks'), value: '4w' },
  { title: t('archetypes.timeframe.last4Months'), value: '4m' },
]);

const sortBy = ref<SortItem[]>([{ key: 'winrate', order: 'desc' }]);

onMounted(async () => {
  try {
    loading.value = true;
    await decks.loadAsync(timeframe.value);
    await archetypeStore.loadAsync();
  } finally {
    loading.value = false;
  }
});

watch(timeframe, async (newTimeframe) => {
  try {
    loading.value = true;
    await decks.loadAsync(newTimeframe);
  } finally {
    loading.value = false;
  }
});

const isDev = import.meta.env.DEV;

const { mobile } = useDisplay();

const archetypeStore = useArchetype();
</script>

<template>
  <VContainer fluid>
    <VRow>
      <VCol> {{ t('archetypes.title', { format: formatName }) }} </VCol>
      <VSpacer></VSpacer>
      <VCol cols="12" md="3" lg="2">
        <VSelect
          v-model="timeframe"
          :items="timeframeOptions"
          :label="t('archetypes.timeframe.label')"
          density="comfortable"
          variant="outlined"
          hide-details
        ></VSelect>
      </VCol>
      <VCol cols="auto" v-if="account.authenticated">
        <NewMatchDialog></NewMatchDialog>
      </VCol>
    </VRow>
    <VRow>
      <VCol>
        <VDataTable :headers :items item-value="id" :loading v-model:sort-by="sortBy">
          <template v-slot:[`item.name`]="{ item }">
            <ArchetypeAvatar v-if="!mobile" :name="item.name"></ArchetypeAvatar>
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
        <p class="text-h6">{{ t('archetypes.sections.needDataTitle') }}</p>
        <p>
          {{ t('archetypes.sections.needDataBody') }}
        </p>
      </VCol>
      <VCol cols="12" md="6">
        <p class="text-h6">{{ t('archetypes.sections.contributeTitle') }}</p>
        <p>
          {{ t('archetypes.sections.contributeBody') }}
        </p>
      </VCol>
      <VCol cols="12" md="6">
        <p class="text-h6">{{ t('archetypes.sections.winrateTitle') }}</p>
        <p>
          {{ t('archetypes.sections.winrateBody') }}
        </p>
      </VCol>
      <VCol cols="12" md="6">
        <p class="text-h6">{{ t('archetypes.sections.tiersTitle') }}</p>
        <p>
          {{ t('archetypes.sections.tiersBody') }}
        </p>
      </VCol>
    </VRow>
    <VRow v-if="isDev">
      <VCol>
        <VExpansionPanels>
          <VExpansionPanel :title="t('archetypes.debugItems')" :text="JSON.stringify(items)">
          </VExpansionPanel>
        </VExpansionPanels>
      </VCol>
    </VRow>
  </VContainer>
</template>
