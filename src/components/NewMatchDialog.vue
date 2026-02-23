<template>
  <VDialog max-width="640px">
    <template #activator="{ props: dialog }">
      <VTooltip text="Add new match">
        <template #activator="{ props: tooltip }">
          <VBtn
            v-bind="{ ...dialog, ...tooltip }"
            data-test="new-match-button-dialog"
            prepend-icon="fas fa-plus"
          >
            New match
          </VBtn>
        </template>
      </VTooltip>
    </template>
    <template #default="{ isActive }">
      <VCard :loading>
        <template #title>New match</template>
        <template #append>
          <CloseButton @close="isActive.value = false"></CloseButton>
        </template>
        <template #text>
          <VRow>
            <VCol> Select decks played by you and your opponent. </VCol>
          </VRow>
          <VRow>
            <VCol>
              <VAutocomplete
                v-model="yourDeck"
                :items="archetypes.archetypes"
                :disabled="loading || loadingArchetypes"
                label="Your deck"
                data-test="your-deck-field"
                item-value="id"
                item-title="name"
                :hint="yourDeckMessage"
                :errorMessages="yourDeckErrorMessage"
              ></VAutocomplete>
            </VCol>
          </VRow>
          <VRow>
            <v-col>
              <VAutocomplete
                v-model="theirDeck"
                :items="archetypes.archetypes"
                :disabled="loading || loadingArchetypes"
                label="Their deck"
                data-test="their-deck-field"
                item-value="id"
                item-title="name"
                :hint="theirDeckMessage"
                :errorMessages="theirDeckErrorMessage"
              ></VAutocomplete>
            </v-col>
          </VRow>
          <VRow>
            <VCol>
              Indicate games won by you in the first column and games won by your opponent in the
              second column.
            </VCol>
          </VRow>
          <VRow justify="center">
            <VCol cols="auto">
              <VRow align="center">
                <VCol cols="auto">Game one</VCol>
                <VCol cols="auto"> <MatchButtonGroup v-model="g1" num="0"></MatchButtonGroup></VCol>
              </VRow>
            </VCol>
            <VCol cols="auto">
              <VRow align="center">
                <VCol cols="auto">First side game</VCol>
                <VCol cols="auto"><MatchButtonGroup v-model="s1" num="1"></MatchButtonGroup></VCol>
              </VRow>
            </VCol>
            <VCol cols="auto">
              <VRow align="center">
                <VCol cols="auto">
                  <VTooltip
                    :text="
                      shouldPlayThird
                        ? ''
                        : 'You have to indicate first two games before the third one'
                    "
                  >
                    <template #activator="{ props }">
                      <span v-bind="props">Second side game</span>
                    </template>
                  </VTooltip>
                </VCol>
                <VCol cols="auto">
                  <MatchButtonGroup
                    v-model="s2"
                    num="2"
                    :disabled="!shouldPlayThird"
                  ></MatchButtonGroup>
                </VCol>
              </VRow>
            </VCol>
            <VCol v-if="missingResults && resultErrors" cols="12"
              ><span class="text-red">{{ resultErrors }}</span></VCol
            >
          </VRow>
          <VSlideYTransition>
            <VRow v-if="results">
              <VCol data-test="new-match-resume-text">
                {{ results }}
              </VCol>
            </VRow>
          </VSlideYTransition>
          <VRow>
            <VCol>
              <VExpansionPanels>
                <VExpansionPanel>
                  <VExpansionPanelTitle>
                    <VIcon class="me-2">fas fa-note-sticky</VIcon>Note
                  </VExpansionPanelTitle>
                  <VExpansionPanelText>
                    <VRow no-gutter>
                      <VCol cols="12">
                        Use this field to note something you want to remember about this game.
                      </VCol>
                      <VCol cols="12">
                        <VTextarea label="Note" v-model="note"></VTextarea>
                      </VCol>
                    </VRow>
                  </VExpansionPanelText>
                </VExpansionPanel>
              </VExpansionPanels>
            </VCol>
          </VRow>
          <VRow>
            <VCol> If there are missing archetypes, open an issue on Github. </VCol>
          </VRow>
        </template>
        <template #actions>
          <VBtn
            @click="create(isActive)"
            color="success"
            data-test="new-match-create-action"
            prepend-icon="fas fa-plus"
            variant="elevated"
            elevation="2"
            :disabled="!validMatch"
            :loading
            >Create</VBtn
          >
        </template>
      </VCard>
    </template>
  </VDialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, type Ref } from 'vue';
import { useDeck } from '@/stores/matches';
import CloseButton from '@/components/dialogs/CloseButton.vue';
import MatchButtonGroup from './MatchButtonGroup.vue';
import { useArchetype } from '@/stores/archetype';

const props = defineProps(['my']);

const validMatch = computed(() => yourDeck.value && theirDeck.value);
const shouldPlayThird = computed(
  () => typeof g1.value !== 'undefined' && typeof s1.value !== 'undefined' && g1.value !== s1.value,
);

const yourDeck = ref<number | undefined>(props.my);
const theirDeck = ref<number>();

const g1 = ref<number>();
const s1 = ref<number>();
const s2 = ref<number>();

watch(g1, () => {
  if (!shouldPlayThird.value) {
    s2.value = undefined;
  }
});

watch(s1, () => {
  if (!shouldPlayThird.value) {
    s2.value = undefined;
  }
});

const results = computed(() => {
  const p = [];
  if (g1.value === 0) {
    p.push('Player 1 won game one');
  } else if (g1.value === 1) {
    p.push('Player 2 won game one');
  }

  if (s1.value === 0) {
    p.push('Player 1 won first side game');
  } else if (s1.value === 1) {
    p.push('Player 2 won first side game');
  }

  if (s2.value === 0) {
    p.push('Player 1 won second side game');
  } else if (s2.value === 1) {
    p.push('Player 2 won second side game');
  }

  // Concat in reverse order due to array push place last elements in the head of the array.
  return p.length > 0 ? p.join(', ').concat('.') : '';
});

const matches = useDeck();

const yourDeckErrorMessage = ref('');
const theirDeckErrorMessage = ref('');
const resultErrors = ref('');

const note = ref();

const missingResults = computed(
  () =>
    (shouldPlayThird.value && (g1.value === undefined || s1.value === undefined)) ||
    (g1.value === undefined && s1.value !== undefined),
);

function create(isActive: Ref<boolean>) {
  yourDeckErrorMessage.value = theirDeckErrorMessage.value = theirDeckErrorMessage.value = '';

  if (!yourDeck.value) {
    yourDeckErrorMessage.value = 'You have to specify your deck';
    return;
  }

  if (!theirDeck.value) {
    theirDeckErrorMessage.value = 'You have to specify your deck';
    return;
  }

  if (missingResults.value) {
    resultErrors.value = 'You are missing a result';
    return;
  }

  if (loading.value) {
    resultErrors.value = 'The system is busy, retry again later';
    return;
  }

  try {
    loading.value = true;
    matches.createMatchAsync({
      my_archetype: yourDeck.value,
      their_archetype: theirDeck.value,
      game_one_win: g1.value,
      side_one_win: s1.value,
      side_second_win: s2.value,
      note: note.value,
    });
    yourDeck.value = undefined;
    theirDeck.value = undefined;
    g1.value = undefined;
    s1.value = undefined;
    s2.value = undefined;
    note.value = false;
    isActive.value = false;
  } finally {
    loading.value = false;
  }
}

const loadingArchetypes = ref(false);
const archetypes = useArchetype();

const yourDeckMessage = computed(() => `Your deck is ${yourDeck.value}`);
const theirDeckMessage = computed(() => `Their deck is ${theirDeck.value}`);

const loading = ref(false);

onMounted(async () => {
  try {
    loadingArchetypes.value = true;
    // TODO: Fare un mock per la generazione delle liste di archetipi per nome.
    await archetypes.loadAsync();
  } finally {
    loadingArchetypes.value = false;
  }

  try {
    loading.value = true;
    await matches.loadAsync();
  } finally {
    loading.value = false;
  }
});
</script>
