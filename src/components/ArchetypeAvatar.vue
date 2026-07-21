<template>
  <VAvatar class="me-2" data-test="archetype-image">
    <VImg :src="imageUrl" :alt="name"></VImg>
  </VAvatar>
</template>

<script setup lang="ts">
import { useArchetype } from '@/stores/archetype';
import { onMounted, ref, watch } from 'vue';

const props = defineProps(['name']);

const archetypeStore = useArchetype();

const imageUrl = ref();

const philib =
  'https://cards.scryfall.io/art_crop/front/5/2/52558748-6893-4c72-a9e2-e87d31796b59.jpg?1559959349';

async function loadImage() {
  const arc = await archetypeStore.getByName(props.name);
  if (arc?.image) {
    imageUrl.value = arc.image;
  } else {
    imageUrl.value = philib;
  }
}

watch(
  () => props.name,
  async () => await loadImage(),
);

onMounted(async () => await loadImage());
</script>
