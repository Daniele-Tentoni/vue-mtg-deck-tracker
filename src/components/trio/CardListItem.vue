<template>
  <!-- :style="{ 'background-color': color || 'white' }" -->
  <VListItem :class="colorClass" data-testid="card-list-item" :data-card-name="card.name">
    <template #prepend>
      <v-tooltip text="This is not pauper legal">
        <template #activator="{ props }">
          <VIcon v-if="card.legal === false" v-bind="props">fas fa-cross</VIcon>
        </template>
      </v-tooltip>
      <v-tooltip text="This is duplicated in your team">
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

defineProps<{ card: Card; color?: string; colorClass?: string }>();
</script>
