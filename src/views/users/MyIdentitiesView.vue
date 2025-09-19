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
            data-test="unlink-button"
            >Unlink</VBtn
          >
        </template>
      </VDataTable>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { supabase } from '@/services/supabaseService';
import { computed, type Ref, onMounted, ref } from 'vue';
import CloseButton from '@/components/dialogs/CloseButton.vue';
import { useProviders } from '@/stores/provider';

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
    const state = crypto.randomUUID();
    localStorage.setItem('state', state);

    const redirectUri = import.meta.env.VITE_CHALLONGE_REDIRECT_URI;
    const clientId = import.meta.env.VITE_CHALLONGE_CLIENT_ID;

    const authUrl =
      `https://challonge.com/oauth/authorize?` +
      new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'me',
        state,
      });

    window.location.href = authUrl;
    return;
  }

  const res = await supabase.auth.linkIdentity({
    provider: provider.value,
    options: { redirectTo: import.meta.env.VITE_SUPABASE_REDIRECT },
  });
  if (res.error) {
    if (res.error.code === 'manual_linking_disabled') {
      alert(res.error.message);
    } else {
      alert('Failed integration to twitch');
    }

    return;
  }

  if (res.data) {
    alert(`Done ${res.data.provider}`);
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

onMounted(async () => {
  try {
    loading.value = true;
    // Manage callback.
    await callback();
    // Fetch initial data.
    await update();
  } finally {
    loading.value = false;
  }
});

async function callback() {
  const url = new URL(window.location.href);
  const code = url.searchParams.get('code');
  if (!code) {
    console.info('No code to verify');
    return;
  }

  const state = url.searchParams.get('state');
  const localState = localStorage.getItem('state');
  if (!localState || state !== localState) {
    alert("Can't get state from local storage");
    return;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    alert('Utente non loggato');
    return;
  }

  console.log('Ready to call supabase');
  const supaUrl = import.meta.env.VITE_SUPABASE_URL;

  try {
    const params = new URLSearchParams();
    params.set('code', code);
    params.set('state', state);
    const res = await fetch(`${supaUrl}/functions/v1/challonge-auth?${params}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    const { data, error } = await res.json();
    if (data) console.warn(data);
    if (error) console.warn(error);
  } catch (ex) {
    console.error('Whatt', ex);
  }
}
</script>
