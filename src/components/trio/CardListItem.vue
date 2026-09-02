<template>
  <!-- :style="{ 'background-color': color || 'white' }" -->
  <VListItem :class="colorClass" data-testid="card-list-item" :data-card-name="card.name">
    <template #prepend>
      <v-tooltip :text="t('cardListItem.notPauperLegal')">
        <template #activator="{ props }">
          <VIcon v-if="card.legal === false" v-bind="props">fas fa-cross</VIcon>
        </template>
      </v-tooltip>
      <v-tooltip :text="t('cardListItem.duplicated')">
        <template #activator="{ props }">
          <VIcon v-if="color" v-bind="props">far fa-clone</VIcon>
        </template>
      </v-tooltip>
    </template>
    {{ card.quantity }} {{ card.name }}
  </VListItem>
</template>

<script setup lang="ts">
import type { Card } from '@/services/cardService';
import { useI18n } from 'vue-i18n';

defineProps<{ card: Card; color?: string; colorClass?: string }>();

const { t } = useI18n();
</script>
