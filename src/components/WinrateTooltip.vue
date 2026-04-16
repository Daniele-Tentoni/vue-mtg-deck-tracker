<script setup lang="ts">
import { Deck } from '@/models/Deck';
import { ref } from 'vue';
import { useDisplay } from 'vuetify';

const properties = defineProps<{ deck: Deck }>();

const visible = ref(false);

const { mobile } = useDisplay();
</script>

<template>
  <VTooltip>
    <template #default>
      <p>Games won: {{ deck.gamesWon() }}</p>
      <p>Games played: {{ deck.gamesPlayed() }}</p>
    </template>
    <template #activator="{ props }">
      <span v-bind="props" @click="visible = mobile">{{ properties.deck.gamesWinRate() }}</span>
    </template>
  </VTooltip>
  <VSnackbar
    v-if="mobile"
    v-model="visible"
    :timeout="3000"
    :color="deck.tierColor()"
    title="Results"
    timer="top"
    timer-color="white"
  >
    <span> Games won: {{ deck.gamesWon() }}<br />Games played: {{ deck.gamesPlayed() }} </span>
    <template #prepend>
      <v-tooltip text="Results">
        <template #activator="{ props }">
          <v-icon v-bind="props" aria-label="Results ranking">fas fa-ranking-star</v-icon>
        </template>
      </v-tooltip>
    </template>
  </VSnackbar>
</template>
