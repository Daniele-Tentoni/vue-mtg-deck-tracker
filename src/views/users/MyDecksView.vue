<template>
  <VContainer fluid>
    <VRow>
      <VCol>
        <VDataTable :items></VDataTable>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
const items = [{ deck: 'Ok' }];
</script>
