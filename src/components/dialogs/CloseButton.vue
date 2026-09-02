<template>
  <VTooltip :text="t('common.close')">
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
import { useI18n } from 'vue-i18n';

const emits = defineEmits(['close']);

const { t } = useI18n();
</script>
