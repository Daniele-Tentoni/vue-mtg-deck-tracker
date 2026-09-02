<template>{{ t('notFound.message', { path: pathMatch ?? '' }) }}</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const { t } = useI18n();

const pathMatch = computed(() => route.params.pathMatch?.toString());
</script>
