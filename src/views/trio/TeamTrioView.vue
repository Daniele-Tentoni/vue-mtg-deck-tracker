<template>
  <VContainer fluid class="fill-height">
    <VRow class="align-baseline">
      <VCol cols="auto" v-if="duplicates.size > 0">
        <v-alert
          text="Your team decks contain duplicates"
          type="warning"
          data-testid="duplicates-warning"
        ></v-alert>
      </VCol>
      <v-spacer></v-spacer>
      <VCol cols="auto">
        <UploadDeckDialog @get-deck="getDeck"></UploadDeckDialog>
      </VCol>
      <VCol cols="auto">
        <v-tooltip text="Start the deck checking">
          <template #activator="{ props }">
            <VBtn
              v-bind="props"
              prepend-icon="fas fa-check"
              @click="check"
              data-testid="check-deck-button"
              >Check</VBtn
            >
          </template>
        </v-tooltip>
      </VCol>
    </VRow>
    <VRow>
      <VCol>
        <v-tooltip text="Check in progress">
          <template #activator="{ props }">
            <VProgressLinear
              v-bind="props"
              :model-value="progress"
              :max="maxCards"
              :active="progress > 0"
            ></VProgressLinear>
          </template>
        </v-tooltip>
      </VCol>
    </VRow>
    <VRow>
      <VCol v-for="(deck, i) in decks" :key="i" cols="auto">
        <DecklistCard
          :colored-cards="coloredCards"
          :deck
          :index="i"
          @remove="removeDeck"
        ></DecklistCard>
      </VCol>
    </VRow>
    <VRow v-if="isDev">
      <VCol> Duplicates: {{ duplicates.size }} </VCol>
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
    <v-row>
      <VCol>
        Inserisci i mazzi che vuoi usare al tuo prossimo team trio e verifica se le liste sono
        compatibili. Ti ricordo che non puoi usare carte che non siano legali in pauper e non puoi
        usare la stessa carta in due mazzi diversi, nemmeno una.
      </VCol>
      <VCol>
        Quante volte vi è capitato di essere in crisi per non sapere quali carte avete già messo in
        condivisione tra voi e quindi di dover stendere nuovamente tutte le carte per vedere quali
        avete in due o più mazzi? Potete ora usare questa rapida utility per controllare che non ci
        siano carte condivise tra i vostri mazzi. Potete salvere i link ai mazzi dei componenti del
        vostro team in modo tale che possiate controllare le liste aggiornate semplicemente
        ricaricando questa pagina.
      </VCol>
    </v-row>
  </VContainer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { Decklist } from '@/services/cardService';
import UploadDeckDialog from '@/components/trio/UploadDeckDialog.vue';
import DecklistCard from '@/components/trio/DecklistCard.vue';

const isDev = import.meta.env.DEV;

const maxCards = computed(() =>
  decks.value.flatMap((f) => f.main.length + f.side.length).reduce((a, b) => a + b, 0),
);

const decks = ref<Decklist[]>([]);

watch(decks.value, (newValue: Decklist[]) => {
  if (newValue.length < 2) {
    console.log("Clean");
    duplicates.value.clear();
  }
});

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

    cards.value.push({ name: cardName, legal });
    localStorage.setItem('card.legal.' + encoded, data.legalities?.pauper);
    return legal;
  } catch {
    return false;
  }
}
</script>
