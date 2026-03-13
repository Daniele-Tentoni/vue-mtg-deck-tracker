<template>
  <VDialog max-width="480px">
    <template #activator="{ props: dialog }">
      <VTooltip text="Aggiungi un nuovo deck">
        <template #activator="{ props: tooltip }">
          <VBtn
            prepend-icon="fas fa-plus"
            v-bind="{ ...dialog, ...tooltip }"
            data-testid="button-open-upload-deck-dialog"
            >Add</VBtn
          >
        </template>
      </VTooltip>
    </template>
    <template #default="{ isActive }">
      <VCard>
        <template #title> Nuovo deck </template>
        <template #subtitle>Inserisci un nuovo mazzo</template>
        <template #append>
          <CloseButton @close="isActive.value = false"></CloseButton>
        </template>
        <template #text>
          <VRow>
            <VCol>
              Paste your list here:
              <VTextarea
                v-model="deckinput"
                label="Deck input"
                auto-grow
                clearable
                counter
                :counter-value="countCards"
                persistent-counter
                hide-details="auto"
                :placeholder
                data-testid="textarea-upload-deck-dialog"
              >
              </VTextarea>
            </VCol>
          </VRow>
          <VRow>
            <VCol>
              Or download it from this url (only moxfield is supported):
              <VTextField
                type="url"
                v-model="deckLink"
                hide-details="auto"
                label="Url"
                data-testid="url-upload-deck-dialog"
              ></VTextField>
            </VCol>
          </VRow>
          <VRow>
            <VCol>
              When you are done, you can close this window by clicking on the close button&nbsp;
              <VIcon>fas fa-close</VIcon>.
            </VCol>
          </VRow>
        </template>
        <template #actions>
          <VBtn
            @click="enterDecklist"
            color="success"
            variant="elevated"
            prepend-icon="fas fa-check"
            data-testid="submit-button-upload-deck-dialog"
            >Submit</VBtn
          >
          <VBtn
            @click="isActive.value = false"
            prepend-icon="fas fa-close"
            variant="outlined"
            data-testid="close-button-upload-deck-dialog"
          >
            Close
          </VBtn>
        </template>
      </VCard>
    </template>
  </VDialog>
</template>

<script setup lang="ts">
import {
  isMainboard,
  isSideboard,
  trimCards,
  trimLines,
  type Card,
  type Decklist,
} from '@/services/cardService';
import { ref } from 'vue';
import CloseButton from '@/components/dialogs/CloseButton.vue';
import cryo from '../../../cypress/fixtures/moxfield/cryo.json';
import { useTrioStore } from '@/stores/trio';

const deckinput = ref<string>();
const deckLink = ref<string>();
const loading = ref(false);

const placeholder = `Mainboard:
4 Lightning Bolt
Sideboard:
3 Duress
`;

function parseDeckList(text: string): Decklist {
  const main: Card[] = [];
  const side: Card[] = [];
  let mode: 'main' | 'side' = 'main';

  const lines = trimLines(text);

  for (const line of lines) {
    if (isSideboard(line)) {
      mode = 'side';
      continue;
    }

    if (isMainboard(line)) {
      mode = 'main';
      continue;
    }

    // Regex flessibile:
    // 1. quantità opzionale (\d+)?
    // 2. nome carta (qualsiasi cosa)
    // 3. set opzionale tra parentesi
    // 4. collector number opzionale
    // 5. foil opzionale *F* o *E*
    const card = trimCards(line);

    if (!card) {
      console.warn('Not parsed card');
      continue;
    }

    if (mode === 'main') main.push(card);
    else side.push(card);
  }

  return { main, side };
}

function countCards(v: unknown): number {
  if (typeof v !== 'string') return 0;
  if (v === '') return 0;

  let total = 0;
  const lines = trimLines(v);
  for (const line of lines) {
    if (isSideboard(line) || isMainboard(line)) {
      continue;
    }

    const card = trimCards(line);
    if (card?.quantity && !Number.isNaN(card.quantity)) {
      total += card.quantity;
    }
  }

  return total;
}

async function downloadDeck(link: string) {
  const deckId = link.split('/').pop();
  const apiUrl = `https://api.moxfield.com/v2/decks/all/${deckId}`;
  try {
    loading.value = true;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Errore nel recupero del mazzo: ${response.statusText}`);
    }
    const data = await response.json();
    console.log(data);
  } catch {
    console.log('Catturato');
  } finally {
    loading.value = false;
  }

  return cryo;
}

const trioStore = useTrioStore();

async function enterDecklist() {
  if (deckLink.value) {
    const d = await trioStore.addUrl(deckLink.value);
    if (d) {
      const mainD = Object.entries(d.main);
      const sideD = Object.entries(d.side);
      console.log("Received ", mainD)
      emits('getDeck', {
        main: mainD.map((m) => ({ name: m[0], quantity: m[1].quantity })),
        side: sideD.map((m) => ({ name: m[0], quantity: m[1].quantity })),
      });

      deckLink.value = undefined;
    }

    return;
  }

  if (!deckinput.value) {
    return;
  }

  const deck = parseDeckList(deckinput.value);
  emits('getDeck', deck);
  deckinput.value = undefined;
}

const emits = defineEmits(['getDeck']);
</script>
