<template>
  <VDialog v-model="dialogOpen" max-width="640px">
    <template #activator="{ props: dialog }">
      <VTooltip :text="t('dialogs.newMatch.tooltip')">
        <template #activator="{ props: tooltip }">
          <VBtn
            v-bind="{ ...dialog, ...tooltip }"
            data-test="new-match-button-dialog"
            prepend-icon="fas fa-plus"
          >
            {{ t('dialogs.newMatch.button') }}
          </VBtn>
        </template>
      </VTooltip>
    </template>
    <template #default="{ isActive }">
      <VCard :loading>
        <template #title>{{ t('dialogs.newMatch.title') }}</template>
        <template #append>
          <CloseButton @close="isActive.value = false"></CloseButton>
        </template>
        <template #text>
          <VRow>
            <VCol> {{ t('dialogs.newMatch.selectDecks') }} </VCol>
          </VRow>
          <VRow>
            <VCol>
              <VAutocomplete
                v-model="yourDeck"
                :items="yourDeckItems"
                :disabled="loading || loadingArchetypes"
                :label="t('dialogs.newMatch.yourDeckLabel')"
                data-test="your-deck-field"
                item-value="id"
                item-title="name"
                :hint="yourDeckMessage"
                persistent-hint
                :errorMessages="yourDeckErrorMessage"
                clearable
                :no-data-text="t('dialogs.newMatch.noArchetypeFound')"
              ></VAutocomplete>
            </VCol>
          </VRow>
          <VRow>
            <v-col>
              <VAutocomplete
                v-model="theirDeck"
                :items="theirDeckItems"
                :disabled="loading || loadingArchetypes"
                :label="t('dialogs.newMatch.theirDeckLabel')"
                data-test="their-deck-field"
                item-value="id"
                item-title="name"
                :hint="theirDeckMessage"
                persistent-hint
                :errorMessages="theirDeckErrorMessage"
                clearable
                :no-data-text="t('dialogs.newMatch.noArchetypeFound')"
              ></VAutocomplete>
            </v-col>
          </VRow>
          <VRow>
            <VCol>
              {{ t('dialogs.newMatch.resultInstructions') }}
            </VCol>
          </VRow>
          <VRow class="mb-2" justify="center">
            <VCol cols="auto" class="text-medium-emphasis">{{
              t('dialogs.newMatch.leftButton')
            }}</VCol>
            <VCol cols="auto" class="text-medium-emphasis">{{
              t('dialogs.newMatch.rightButton')
            }}</VCol>
          </VRow>
          <VRow justify="center">
            <VCol cols="auto">
              <VRow align="center">
                <VCol cols="auto">{{ t('dialogs.newMatch.gameOne') }}</VCol>
                <VCol cols="auto"> <MatchButtonGroup v-model="g1" num="0"></MatchButtonGroup></VCol>
              </VRow>
            </VCol>
            <VCol cols="auto">
              <VRow align="center">
                <VCol cols="auto">{{ t('dialogs.newMatch.firstSideGame') }}</VCol>
                <VCol cols="auto"><MatchButtonGroup v-model="s1" num="1"></MatchButtonGroup></VCol>
              </VRow>
            </VCol>
            <VCol cols="auto">
              <VRow align="center">
                <VCol cols="auto">
                  <VTooltip :text="shouldPlayThird ? '' : t('dialogs.newMatch.thirdGameHint')">
                    <template #activator="{ props }">
                      <span v-bind="props">{{ t('dialogs.newMatch.secondSideGame') }}</span>
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
            <VCol v-if="resultErrors" cols="12"
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
                  <VExpansionPanelTitle data-test="note-expansion-title-new-match">
                    <VIcon class="me-2">fas fa-note-sticky</VIcon>&nbsp;{{ t('common.note') }}
                  </VExpansionPanelTitle>
                  <VExpansionPanelText>
                    <VRow no-gutter>
                      <VCol cols="12">
                        {{ t('dialogs.newMatch.noteHelp') }}
                      </VCol>
                      <VCol cols="12">
                        <VTextarea
                          :label="t('common.note')"
                          v-model="note"
                          data-test="note-textarea-new-match-dialog"
                        ></VTextarea>
                      </VCol>
                    </VRow>
                  </VExpansionPanelText>
                </VExpansionPanel>
              </VExpansionPanels>
            </VCol>
          </VRow>
          <VRow>
            <VCol> {{ t('dialogs.newMatch.missingArchetypeHelp') }} </VCol>
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
            >{{ t('dialogs.newMatch.create') }}</VBtn
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
import type { Archetype } from '@/stores/matches';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps(['my']);

const dialogOpen = ref(false);
const loading = ref(false);
const loadingArchetypes = ref(false);

const yourDeck = ref<number | undefined>(props.my);
const theirDeck = ref<number>();

const g1 = ref<number>();
const s1 = ref<number>();
const s2 = ref<number>();

const note = ref<string>();

const shouldPlayThird = computed(
  () => typeof g1.value !== 'undefined' && typeof s1.value !== 'undefined' && g1.value !== s1.value,
);

const hasRequiredResults = computed(
  () =>
    g1.value !== undefined &&
    s1.value !== undefined &&
    (!shouldPlayThird.value || s2.value !== undefined),
);

const validMatch = computed(
  () =>
    Boolean(yourDeck.value) &&
    Boolean(theirDeck.value) &&
    hasRequiredResults.value &&
    !loading.value,
);

const yourDeckErrorMessage = ref('');
const theirDeckErrorMessage = ref('');
const resultErrors = ref('');

const matches = useDeck();

const archetypes = useArchetype();
const archetypeById = computed(() =>
  archetypes.archetypes.reduce<Record<number, Archetype>>((accumulator, archetype) => {
    accumulator[archetype.id] = archetype;
    return accumulator;
  }, {}),
);

const yourDeckItems = computed(() => archetypes.archetypes);
const theirDeckItems = computed(() => archetypes.archetypes);

function archetypeName(id: number | undefined, fallback: string): string {
  if (!id) {
    return fallback;
  }

  return archetypeById.value[id]?.name ?? fallback;
}

function resetForm() {
  yourDeck.value = props.my;
  theirDeck.value = undefined;
  g1.value = undefined;
  s1.value = undefined;
  s2.value = undefined;
  note.value = undefined;
  yourDeckErrorMessage.value = '';
  theirDeckErrorMessage.value = '';
  resultErrors.value = '';
}

watch(g1, () => {
  if (!shouldPlayThird.value) {
    s2.value = undefined;
  }

  resultErrors.value = '';
});

watch(s1, () => {
  if (!shouldPlayThird.value) {
    s2.value = undefined;
  }

  resultErrors.value = '';
});

watch([yourDeck, theirDeck], () => {
  yourDeckErrorMessage.value = '';
  theirDeckErrorMessage.value = '';
});

watch(dialogOpen, (isOpen) => {
  if (!isOpen) {
    resetForm();
  }
});

const results = computed(() => {
  const p: string[] = [];
  if (g1.value === 0) {
    p.push(t('dialogs.newMatch.summary.p1GameOne'));
  } else if (g1.value === 1) {
    p.push(t('dialogs.newMatch.summary.p2GameOne'));
  }

  if (s1.value === 0) {
    p.push(t('dialogs.newMatch.summary.p1FirstSide'));
  } else if (s1.value === 1) {
    p.push(t('dialogs.newMatch.summary.p2FirstSide'));
  }

  if (s2.value === 0) {
    p.push(t('dialogs.newMatch.summary.p1SecondSide'));
  } else if (s2.value === 1) {
    p.push(t('dialogs.newMatch.summary.p2SecondSide'));
  }

  // Concat in reverse order due to array push place last elements in the head of the array.
  return p.length > 0 ? p.join(', ').concat('.') : '';
});

const missingResults = computed(
  () =>
    g1.value === undefined ||
    s1.value === undefined ||
    (shouldPlayThird.value && s2.value === undefined),
);

async function create(isActive: Ref<boolean>) {
  yourDeckErrorMessage.value = '';
  theirDeckErrorMessage.value = '';
  resultErrors.value = '';

  if (!yourDeck.value) {
    yourDeckErrorMessage.value = t('dialogs.newMatch.yourDeckRequired');
    return;
  }

  if (!theirDeck.value) {
    theirDeckErrorMessage.value = t('dialogs.newMatch.theirDeckRequired');
    return;
  }

  if (missingResults.value) {
    resultErrors.value = t('dialogs.newMatch.completeResults');
    return;
  }

  if (loading.value) {
    resultErrors.value = t('dialogs.newMatch.busy');
    return;
  }

  try {
    loading.value = true;
    await matches.createMatchAsync({
      my_archetype: yourDeck.value,
      their_archetype: theirDeck.value,
      game_one_win: g1.value,
      side_one_win: s1.value,
      side_second_win: s2.value,
      note: note.value,
    });
    resetForm();
    isActive.value = false;
  } catch {
    resultErrors.value = t('dialogs.newMatch.saveError');
  } finally {
    loading.value = false;
  }
}

const yourDeckMessage = computed(() =>
  archetypeName(yourDeck.value, t('dialogs.newMatch.selectYourArchetype')),
);
const theirDeckMessage = computed(() =>
  archetypeName(theirDeck.value, t('dialogs.newMatch.selectTheirArchetype')),
);

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
