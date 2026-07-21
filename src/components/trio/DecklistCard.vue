<template>
  <VCard>
    <template #title>
      <span v-if="!deckEditing" @click="deckEditing = true">{{ deckName }}</span>
      <VTextField v-else v-model="deckName"></VTextField>
    </template>
    <template #append>
      <v-tooltip text="Remove deck from comparison">
        <template #activator="{ props }">
          <VBtn
            v-bind="props"
            icon="fas fa-close"
            @click="removeDeck(index)"
            color="warning"
            variant="text"
            data-testid="remove-deck-button-decklist-card"
          ></VBtn>
        </template>
      </v-tooltip>
    </template>
    <template #default>
      <VList density="compact">
        <v-divider></v-divider>
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
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CardListItem from './CardListItem.vue';

const props = defineProps(['coloredCards', 'deck', 'index']);

const emits = defineEmits(['remove']);

function removeDeck(i: number) {
  emits('remove', i);
}

const deckEditing = ref(false);

const deckName = ref(`Deck ${props.index + 1}`);
</script>
