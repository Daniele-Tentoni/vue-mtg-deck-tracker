<template>
  <VCard>
    <template #title> Deck {{ index + 1 }} </template>
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
import CardListItem from './CardListItem.vue';
defineProps(['coloredCards', 'deck', 'index']);

const emits = defineEmits(['remove']);

function removeDeck(i: number) {
  emits('remove', i);
}
</script>
