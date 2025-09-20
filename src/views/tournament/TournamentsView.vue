<template>
  <VContainer fluid>
    <VRow>
      <VCol>
        <h3>Tournaments</h3>
        <p>
          Tournaments are managed by Challonge, we are using thier api through your account.
          Register on the platform to continue using this tool.
        </p>
      </VCol>
      <VSpacer></VSpacer>
      <VCol cols="auto" v-if="loading">Loading</VCol>
      <VCol cols="auto" md="6" v-else-if="challongeUser">
        <VCard
          class="mx-auto"
          :prepend-avatar="challongeUser.attributes.image_url"
          subtitle="Challonge user"
          :title="challongeUser.attributes.username"
        >
          <VCardText
            >You are authenticated as Challonge user with email
            {{ challongeUser.attributes.email }}.</VCardText
          >
        </VCard>
      </VCol>
    </VRow>
    <VRow v-if="account.authenticated && !loading">
      <VCol>
        <VRow v-if="challongeUser?.attributes">
          <VCol>
            <VRow>
              <VCol>
                Create a new tournament on Challonge.com or sign in in one tournament to see it
                here. You could use this application to submit your score and save automatically
                your statistics here. You can choose any tournament you have partecipated and
                download statistics, but you will lose any information about win rate on your first
                game, on your first game post side and so on.
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="auto">
                Clicca su questo bottone per scaricare l'elenco dei tuoi tornei su Challonge.
              </VCol>
              <VCol cols="auto">
                <VBtn @click="getT">GET T</VBtn>
              </VCol>
              <VCol cols="auto" v-if="tournamentFetchError">
                <VAlert color="error">
                  {{ tournamentFetchError }}
                </VAlert>
              </VCol>
            </VRow>
            <VRow>
              <VCol v-for="t in tournaments" :key="t.name">
                <VCard>
                  <template #prepend>{{ t.game_name }}</template>
                  <template #title>{{ t.name }}</template>
                  <template #subtitle>The tournament starts at {{ t.starts_at }}</template>
                  <template #append>
                    <VTooltip v-if="t.private" text="This tournament is private">
                      <template #activator="{ props }">
                        <VIcon v-bind="props">fas fa-lock</VIcon>
                      </template>
                    </VTooltip>
                  </template>
                  <template #text>
                    <p>{{ t.description }}</p>
                    <VAlert> The tournament is {{ t.state }}</VAlert>
                    <span v-if="t.state === 'pending'">
                      In this state you can register your partecipation, waiting for the tournament
                      organizer to start the tournament.
                    </span>
                  </template>
                  <template #actions>
                    <VBtn
                      v-if="t.registration_options.open_signup"
                      link
                      :href="t.sign_up_url"
                      target="_blank"
                      >Sign up</VBtn
                    >
                    <VSpacer></VSpacer>
                    <VBtn link :href="t.full_challonge_url" target="_blank">Go to Challonge</VBtn>
                  </template>
                </VCard>
              </VCol>
            </VRow>
          </VCol>
        </VRow>
        <VRow v-else>
          <VCol cols="auto"> Usa questo pulsante per collegare il tuo account Challonge. </VCol>
          <VCol cols="auto">
            <VBtn @click="loginWithChallonge">Login</VBtn>
          </VCol>
        </VRow>
      </VCol>
    </VRow>
    <VRow v-else>
      <VCol>
        Per accedere a questa sezione devi essere autenticato. Usa i pulsanti in alto a destra per
        iniziare.
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { type ChallongeTournament, useChallonge } from '@/composables/useChallonge';
import { useAccount } from '@/stores/account';
import { onMounted, ref } from 'vue';

const account = useAccount();

const {
  challongeUser,
  loginWithChallonge,
  handleChallongeCallback,
  fetchChallongeUser,
  fetchTournaments,
} = useChallonge();

const loading = ref(false);

const tournaments = ref<ChallongeTournament[]>();

const tournamentFetchError = ref<string>();

async function getT() {
  try {
    tournamentFetchError.value = '';
    const t = await fetchTournaments();
    if (t) {
      tournaments.value = t.map((m) => m.attributes);
    }
  } catch (e: unknown) {
    if (e instanceof Error) {
      const j = JSON.parse(e.message);
      console.log(j.errors.status, j.errors.status === 403);
      if (j.errors.status === 403) {
        tournamentFetchError.value = 'You are not authorized to view tournaments';
      }
    }
  }
}

onMounted(async () => {
  try {
    loading.value = true;
    await handleChallongeCallback();
    await fetchChallongeUser();
  } catch (e) {
    alert('Ho trovatooooo');
  } finally {
    loading.value = false;
  }
});
</script>
