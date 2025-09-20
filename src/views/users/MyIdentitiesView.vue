<template>
  <VContainer fluid>
    <VRow>
      <VCol>Identities</VCol>
      <VSpacer></VSpacer>
      <VCol cols="auto">
        <VDialog max-width="480px">
          <template #activator="{ props }">
            <VBtn v-bind="props" data-test="add-account-button" prepend-icon="fas fa-user-plus"
              >Add account</VBtn
            >
          </template>
          <template #default="{ isActive }">
            <VCard>
              <template #title> Add account </template>
              <template #prepend><VIcon>fas fa-user-plus</VIcon></template>
              <template #append>
                <CloseButton @close="isActive.value = false"></CloseButton>
              </template>
              <VCardText>
                <VRow>
                  <VCol>
                    Use this form to link your account to other account in other services. You will
                    be asked to give some permissions to this app.
                  </VCol>
                </VRow>
                <VRow>
                  <VCol>
                    <VAutocomplete
                      :items="providerStore.selectable"
                      v-model="provider"
                      data-test="provider-selector"
                    >
                      <template v-slot:item="{ props, item }">
                        <VListItem v-bind="props">
                          <template #prepend>
                            <VTooltip :text="icons[item.raw] ? item.raw : 'Missing icon'">
                              <template #activator="{ props: tooltip }">
                                <VAvatar v-bind="tooltip">
                                  <VIcon>{{ icons[item.raw] ?? 'fas fa-ghost' }}</VIcon>
                                </VAvatar>
                              </template>
                            </VTooltip>
                          </template>
                        </VListItem>
                      </template>
                    </VAutocomplete>
                  </VCol>
                </VRow>
              </VCardText>
              <VCardActions>
                <VBtn
                  @click="link(isActive)"
                  data-test="link-account-button"
                  variant="outlined"
                  prepend-icon="fas fa-link"
                  :disabled="!provider"
                  >Link</VBtn
                >
              </VCardActions>
            </VCard>
          </template>
        </VDialog>
      </VCol>
    </VRow>
    <VRow>
      <VCol>
        In this page are displayed your linked identities. You can use this page to access to your
        Challonge user and download tournaments to better contribute with data. More providers will
        come with time!
      </VCol>
    </VRow>
    <VRow>
      <VDataTable :items="providerStore.visibles" :loading :headers>
        <template #[`item.actions`]="{ item }">
          <VBtn
            @click="providerStore.unlink(item)"
            prepend-icon="fas fa-link-slash"
            data-test="unlink-account-button"
            >Unlink</VBtn
          >
        </template>
        <template #no-data> No linked accounts </template>
      </VDataTable>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { supabase } from '@/services/supabaseService';
import { computed, type Ref, onMounted, ref } from 'vue';
import CloseButton from '@/components/dialogs/CloseButton.vue';
import { useProviders } from '@/stores/provider';
import { useChallonge } from '@/composables/useChallonge';

const loading = ref(false);

const icons: { [id: string]: string } = {
  Twitch: 'fab fa-twitch',
};

const headers = computed(() => [
  { title: 'Provider', key: 'provider' },
  { title: 'Email', key: 'email' },
  { title: 'Actions', key: 'actions', width: '1%' },
]);

async function link(isActive: Ref<boolean>) {
  if (provider.value === 'Challonge') {
    const challonge = useChallonge();
    await challonge.loginWithChallonge();
    return;
  }

  const { data, error } = await supabase.auth.linkIdentity({
    provider: provider.value,
    options: { redirectTo: import.meta.env.VITE_SUPABASE_REDIRECT },
  });
  if (error) {
    if (error.code === 'manual_linking_disabled') {
      alert(error.message);
    } else {
      alert('Failed integration to twitch');
    }

    return;
  }

  if (data) {
    alert(`Done ${data.provider}`);
    await update();
  }

  isActive.value = false;
}

const provider = ref();

const providerStore = useProviders();

async function update() {
  await providerStore.loadAsync();
  provider.value = null;
}

const { handleChallongeCallback } = useChallonge();

onMounted(async () => {
  try {
    loading.value = true;
    // Manage callback.
    await handleChallongeCallback();
    // Fetch initial data.
    await update();
  } finally {
    loading.value = false;
  }
});
</script>
