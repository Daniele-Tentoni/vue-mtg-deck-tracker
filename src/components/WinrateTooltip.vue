<script setup lang="ts">
import { Deck } from '@/models/Deck';
import { ref } from 'vue';
import { useDisplay } from 'vuetify';
import { useI18n } from 'vue-i18n';

const properties = defineProps<{ deck: Deck }>();

const visible = ref(false);

const { mobile } = useDisplay();
const { t } = useI18n();
</script>

<template>
  <VTooltip>
    <template #default>
      {{ t('winrateTooltip.gamesWon', { count: deck.gamesWon() }) }}<br />
      {{ t('winrateTooltip.gamesPlayed', { count: deck.gamesPlayed() }) }}</template
    >
    <template #activator="{ props }">
      <span v-bind="props" @click="visible = true">{{ properties.deck.gamesWinRate() }}</span>
    </template>
  </VTooltip>
  <VSnackbar v-if="mobile" v-model="visible" :timeout="6000" :color="deck.tierColor()"
    >{{ t('winrateTooltip.gamesWon', { count: deck.gamesWon() }) }}<br />
    {{ t('winrateTooltip.gamesPlayed', { count: deck.gamesPlayed() }) }}</VSnackbar
  >
</template>
