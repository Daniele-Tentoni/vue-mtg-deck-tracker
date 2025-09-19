<template>
  <VContainer fluid>
    <VRow>
      <VCol>Tournaments</VCol>
      <VSpacer></VSpacer>
      <VCol cols="auto" v-if="isDev">Authenticated: {{ challongeUser }}</VCol>
    </VRow>
    <VRow v-if="account.authenticated">
      <VCol cols="auto"> Usa questo pulsante per collegare il tuo account Challonge. </VCol>
      <VCol cols="auto">
        <VBtn @click="loginWithChallonge">Login</VBtn>
      </VCol>
    </VRow>
    <VRow v-else>
      <VCol> Per accedere a questa sezione devi essere autenticato. </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { useChallonge } from '@/composables/useChallonge';
import { useAccount } from '@/stores/account';
import { onMounted } from 'vue';

const isDev = import.meta.env.DEV;

const redirectTo = import.meta.env.VITE_SUPABASE_REDIRECT;

const account = useAccount();

const { challongeUser, loginWithChallonge, handleChallongeCallback, fetchChallongeUser } =
  useChallonge();

onMounted(async () => {
  await handleChallongeCallback();
  await fetchChallongeUser();
});
</script>
