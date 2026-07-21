<script setup lang="ts">
import ArchetypeAvatar from '../ArchetypeAvatar.vue';

defineProps(['name']);
</script>

<template>
  <VChip>
    <template #prepend>
      <ArchetypeAvatar :name></ArchetypeAvatar>
    </template>
    {{ name }}
  </VChip>
</template>
