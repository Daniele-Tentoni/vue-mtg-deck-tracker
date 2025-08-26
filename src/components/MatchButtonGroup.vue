<template>
  <VBtnToggle v-model="model" divided :disabled="disabled" class="mx-auto" variant="outlined">
    <div>
      <VTooltip :text="`Player 0 have won the game`">
        <template #activator="{ props }">
          <VBtn
            v-bind="props"
            :icon="`fas fa-${p.num}`"
            :data-test="`match-button-group-0-${p.num}`"
            class="pa-2"
          ></VBtn>
        </template>
      </VTooltip>
      <VTooltip :text="`Player 1 have won the game`">
        <template #activator="{ props }">
          <VBtn
            v-bind="props"
            :icon="`fas fa-${p.num}`"
            :data-test="`match-button-group-1-${p.num}`"
            class="pa-2"
          ></VBtn>
        </template>
      </VTooltip>
    </div>
  </VBtnToggle>
</template>

<script setup lang="ts">
import { VTooltip } from 'vuetify/components';

const p = defineProps(['disabled', 'num']);

const model = defineModel();
</script>
