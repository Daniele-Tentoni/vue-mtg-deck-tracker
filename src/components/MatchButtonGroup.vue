<template>
  <VBtnToggle
    v-model="model"
    divided
    :disabled="disabled"
    class="mx-auto"
    variant="flat"
    color="success"
    :data-test="`match-button-group-${p.num}`"
  >
    <div>
      <VTooltip :text="`Player 1 have won the game`">
        <template #activator="{ props }">
          <VBtn
            v-bind="props"
            :icon="`fas fa-${p.num}`"
            :data-test="`match-button-group-${p.num}-button-0`"
            class="pa-2"
          ></VBtn>
        </template>
      </VTooltip>
      <VTooltip :text="`Player 2 have won the game`">
        <template #activator="{ props }">
          <VBtn
            v-bind="props"
            :icon="`fas fa-${p.num}`"
            :data-test="`match-button-group-${p.num}-button-1`"
            class="pa-2"
          ></VBtn>
        </template>
      </VTooltip>
    </div>
  </VBtnToggle>
</template>

<script setup lang="ts">
const p = defineProps(['disabled', 'num']);

const model = defineModel();
</script>
