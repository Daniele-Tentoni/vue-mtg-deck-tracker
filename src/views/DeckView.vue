<template>
  <VContainer>
    <VRow>
      <VCol>
        {{ deck }}
      </VCol>
    </VRow>
    <VRow>
      <VCol>
        <VDataTable :headers :items show-expand item-value="id" :loading class="mt-8">
          <template #top>
            <VRow>
              <VSpacer></VSpacer>
              <VCol cols="auto" v-if="account.authenticated">
                <NewMatchDialog></NewMatchDialog>
              </VCol>
            </VRow>
          </template>
          <template v-slot:[`item.my_archetype`]="{ item }">
            {{ isArch(item.my_archetype) ? item.my_archetype.name : '' }}
          </template>
          <template v-slot:[`item.their_archetype`]="{ item }">
            {{ isArch(item?.their_archetype) ? item.their_archetype.name : '' }}
          </template>
          <template v-slot:[`item.score`]="{ item }">
            {{ matchScore(item) }}
          </template>
          <template v-slot:[`item.created_at`]="{ item }">
            {{ new Date(item.created_at).toLocaleDateString() }}
          </template>
          <template v-slot:[`item.side_second_win`]="{ item }">
            {{ item.side_second_win }}
          </template>
          <template #[`item.data-table-expand`]="{ item, internalItem, isExpanded, toggleExpand }">
            <VBtn
              v-if="item.note !== null"
              :append-icon="isExpanded(internalItem) ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"
              :text="isExpanded(internalItem) ? 'Collapse' : 'More info'"
              class="text-none"
              color="medium-emphasis"
              size="small"
              variant="text"
              width="105"
              slim
              @click="toggleExpand(internalItem)"
            ></VBtn>
          </template>
          <template v-slot:expanded-row="{ item, columns }">
            <tr>
              <td :colspan="columns.length"><VIcon>fas fa-note-sticky</VIcon>{{ item.note }}</td>
            </tr>
          </template>
        </VDataTable>
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

<script setup lang="ts">
import NewMatchDialog from '@/components/NewMatchDialog.vue';
import { isArch, MatchClass } from '@/models/Deck';
import { useAccount } from '@/stores/account';
import { useDeck } from '@/stores/matches';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const deck = computed(() => route.params.deck.toString());

const headers = [
  {
    title: 'Archetype',
    key: 'my_archetype',
  },
  {
    title: 'Their archetype',
    key: 'their_archetype',
  },
  {
    title: 'Score',
    key: 'score',
  },
  {
    title: 'Date',
    key: 'created_at',
  },
];

const account = useAccount();

const decks = useDeck();
const items = computed(() => {
  const my = decks.matches.filter(
    (f) => isArch(f.my_archetype) && f.my_archetype.name === deck.value,
  );
  const en = decks.matches.filter(
    (f) => isArch(f.their_archetype) && f.their_archetype.name === deck.value,
  );
  const all = [...my, ...en];
  all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return all;
});

const loading = ref(false);

const matchScore = computed(() => (match: MatchClass) => {
  const c = (i?: number | null) => {
    return i === 0 ? 1 : 0;
  };
  const d = (i?: number | null) => {
    return i === 1 ? 1 : 0;
  };
  const your = c(match.game_one_win) + c(match.side_one_win) + c(match.side_second_win);
  const their = d(match.game_one_win) + d(match.side_one_win) + d(match.side_second_win);
  return `${your} - ${their}`;
});

onMounted(async () => {
  try {
    loading.value = true;
    await decks.loadAsync();
  } finally {
    loading.value = false;
  }
});

const isDev = import.meta.env.DEV;
</script>
