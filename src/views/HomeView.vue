<template>
  <VRow>
    <VCol> {{ t('home.welcome') }} </VCol>
  </VRow>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>
