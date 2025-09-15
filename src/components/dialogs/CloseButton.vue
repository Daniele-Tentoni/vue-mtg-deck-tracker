<template>
  <VTooltip text="Close">
    <template #activator="{ props }">
      <VBtn
        v-bind="props"
        icon="fa fa-close"
        @click="emits('close')"
        color="error"
        data-test="close-button"
        variant="text"
      ></VBtn>
    </template>
  </VTooltip>
</template>

<script setup lang="ts">
const emits = defineEmits(['close']);
</script>
