<template>The page you are looking for, {{ pathMatch }}, does not exists.</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const pathMatch = computed(() => route.params.pathMatch.toString());
</script>
