<template>
  <VContainer fluid>
    <VRow class="align-baseline">
      <VCol>
        Inserisci i mazzi che vuoi usare al tuo prossimo team trio e verifica se le liste sono
        compatibili. Ti ricordo che non puoi usare carte che non siano legali in pauper e non puoi
        usare la stessa carta in due mazzi diversi, nemmeno una.</VCol
      >
      <VCol cols="auto">
        <UploadDeckDialog @get-deck="getDeck"></UploadDeckDialog>
      </VCol>
      <VCol cols="auto">
        <v-tooltip text="Start the deck checking">
          <template #activator="{ props }">
            <VBtn v-bind="props" @click="check" data-testid="check-deck-button">Check</VBtn>
          </template>
        </v-tooltip>
      </VCol>
    </VRow>
    <VRow>
      <VCol>
        <VProgressLinear
          :model-value="progress"
          :max="maxCards"
          :active="progress > 0"
        ></VProgressLinear>
      </VCol>
    </VRow>
    <VRow>
      <VCol v-for="(deck, i) in decks" :key="i" cols="auto">
        <VCard>
          <template #title> Deck {{ i + 1 }} </template>
          <template #append>
            <VBtn icon="fas fa-close" @click="removeDeck(i)" color="warning" variant="text"></VBtn>
          </template>
          <template #default>
            <VList density="compact">
              <CardListItem
                v-for="(card, j) in deck.main"
                :key="j"
                :card
                :color="coloredCards[card.name]"
                :color-class="coloredCards[card.name]"
              ></CardListItem>
              <v-divider></v-divider>
              <CardListItem
                v-for="(card, j) in deck.side"
                :key="j"
                :card
                :color="coloredCards[card.name]"
                :color-class="coloredCards[card.name]"
              ></CardListItem>
            </VList>
          </template>
        </VCard>
      </VCol>
    </VRow>
    <VRow v-if="isDev">
      <VCol> Duplicates: {{ duplicates }} </VCol>
    </VRow>
    <VRow v-if="isDev">
      <VCol>
        <VList>
          <VListItem
            v-for="card in cards"
            :key="card.name"
            :title="card.name"
            :subtitle="card.legal"
          ></VListItem>
        </VList>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import CardListItem from '@/components/trio/CardListItem.vue';
import { computed, ref } from 'vue';
import type { Decklist } from '@/services/cardService';
import UploadDeckDialog from '@/components/trio/UploadDeckDialog.vue';

const isDev = import.meta.env.DEV;

const maxCards = computed(() =>
  decks.value.flatMap((f) => f.main.length + f.side.length).reduce((a, b) => a + b, 0),
);

const decks = ref<Decklist[]>([]);

function removeDeck(index: number) {
  decks.value.splice(index, 1);
}

function getDeck(deck: Decklist) {
  decks.value.push(deck);
}

const progress = ref(0);

const vuetifyBgColors = [
  'bg-red-lighten-4',
  'bg-red-lighten-3',
  'bg-pink-lighten-4',
  'bg-purple-lighten-4',
  'bg-deep-purple-lighten-4',

  'bg-indigo-lighten-4',
  'bg-blue-lighten-4',
  'bg-light-blue-lighten-4',
  'bg-cyan-lighten-4',
  'bg-teal-lighten-4',

  'bg-green-lighten-4',
  'bg-light-green-lighten-4',
  'bg-lime-lighten-4',
  'bg-yellow-lighten-4',
  'bg-amber-lighten-4',

  'bg-orange-lighten-4',
  'bg-deep-orange-lighten-4',

  'bg-brown-lighten-4',
  'bg-blue-grey-lighten-4',
  'bg-grey-lighten-3',
];

const basics = new Set<string>([
  'Plains',
  'Island',
  'Swamp',
  'Mountain',
  'Forest',
  'Wastes',
  'Snow-covered Plains',
  'Snow-covered Island',
  'Snow-covered Swamp',
  'Snow-covered Mountain',
  'Snow-covered Forest',
]);
const duplicates = ref(new Set<string>());

const coloredCards = ref<{ [name: string]: string }>({});

async function check() {
  progress.value = 0;

  duplicates.value.clear();
  const allCardsMap = new Map<string, number>(); // card name -> deck index
  const duplicatesSet = new Set<string>();
  const allFetches: Promise<void>[] = [];

  decks.value.forEach((deck, deckIndex) => {
    const cards = [...deck.main, ...deck.side];
    cards.forEach((card) => {
      const fetchLegality = async () => {
        const legal = await isCardPauperLegal(card.name);
        card.legal = legal;
        if (
          !basics.has(card.name) &&
          allCardsMap.has(card.name) &&
          allCardsMap.get(card.name) !== deckIndex
        ) {
          duplicatesSet.add(card.name);
        } else {
          allCardsMap.set(card.name, deckIndex);
        }
        progress.value++;
      };
      allFetches.push(fetchLegality());
    });
  });
  await Promise.all(allFetches);
  duplicates.value = duplicatesSet;
  coloredCards.value = {};
  duplicates.value.forEach((c) => {
    if (c) {
      const color = vuetifyBgColors[Math.floor(Math.random() * vuetifyBgColors.length)];
      if (color) coloredCards.value[c] = color;
    }
  });
}

const cards = ref<{ name: string; legal: boolean }[]>([]);

async function isCardPauperLegal(cardName: string) {
  const encoded = encodeURIComponent(cardName);
  const url = `https://api.scryfall.com/cards/named?exact=${encoded}`;
  const cache = localStorage.getItem('card.legal.' + encoded);
  if (cache) {
    return cache === 'legal';
  }

  try {
    const card = cards.value.find((f) => f.name === cardName);
    if (card) {
      return card.legal;
    }

    const response = await fetch(url);
    if (!response.ok) return false;
    const data = await response.json();
    const legal = data.legalities?.pauper === 'legal';
    debugger;
    cards.value.push({ name: cardName, legal });
    localStorage.setItem('card.legal.' + encoded, data.legalities?.pauper);
    return legal;
  } catch {
    return false;
  }
}
</script>
