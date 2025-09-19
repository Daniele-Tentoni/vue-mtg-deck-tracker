<template>
  <VContainer fluid>
    <VRow>
      <VCol>User control panel</VCol>
    </VRow>
    <VRow>
      <VCol cols="12" md="auto">
        <VList>
          <VListItem link to="/users/me/identities" prepend-icon="fas fa-users-rectangle"
            >Identities</VListItem
          >
        </VList>
      </VCol>
      <VCol>
        <RouterView></RouterView>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts"></script>
