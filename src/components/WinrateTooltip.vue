<script setup lang="ts">
import { Deck } from '@/models/Deck';
import { ref } from 'vue';
import { useDisplay } from 'vuetify';

const properties = defineProps<{ deck: Deck }>();

const visible = ref(false);

const { mobile } = useDisplay();

const tierColor =
  properties.deck.tier() === 1 ? '#E53935' : properties.deck.tier() === 2 ? '#F4B400' : '#2E7D32';
</script>

<template>
  <VTooltip>
    <template #default>
      Games won: {{ deck.gamesWon() }}<br />Games played: {{ deck.gamesPlayed() }}</template
    >
    <template #activator="{ props }">
      <span v-bind="props" @click="visible = true">{{ properties.deck.gamesWinRate() }}</span>
    </template>
  </VTooltip>
  <VSnackbar v-if="mobile" v-model="visible" :timeout="6000" :color="tierColor"
    >Games won: {{ deck.gamesWon() }}<br />Games played: {{ deck.gamesPlayed() }}</VSnackbar
  >
</template>
