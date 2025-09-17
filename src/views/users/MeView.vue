<template>
  <VContainer>
    <VRow>
      <VCol>Me</VCol>
      <VSpacer></VSpacer>
      <VCol cols="auto">
        <VDialog max-width="480px">
          <template #activator="{ props }">
            <VBtn v-bind="props" data-test="add-account-button" prepend-icon="fas fa-plus"
              >Add account</VBtn
            >
          </template>
          <template #default="{ isActive }">
            <VCard>
              <VCardTitle> Add account </VCardTitle>
              <VCardText>
                <VRow>
                  <VCol>
                    Use this form to link your account to other account in other services. You will
                    be asked to give some permissions to this app.
                  </VCol>
                </VRow>
                <VRow>
                  <VCol>
                    <VAutocomplete :items="selectableProviders" v-model="provider"></VAutocomplete>
                  </VCol>
                </VRow>
              </VCardText>
              <VCardActions>
                <VBtn
                  @click="link(isActive)"
                  data-test="link-account-button"
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
      <VDataTable :items :loading :headers>
        <template #[`item.actions`]="{ item }">
          <VBtn @click="unlink(item)" prepend-icon="fas fa-link-slash">Unlink</VBtn>
        </template>
      </VDataTable>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { supabase } from '@/services/supabaseService';
import type { UserIdentity } from '@supabase/supabase-js';
import { computed, onMounted, ref, type Ref } from 'vue';

const items = ref<UserIdentity[]>([
  {
    provider: 'Challonge',
    created_at: '2023-11-24T08:05:22.835172Z',
    last_sign_in_at: '2023-11-24T08:05:22.835172Z',
    id: '1234',
    identity_id: '1234',
    user_id: '1234',
    identity_data: {
      avatar_url: 'https://cdn.example.com/avatar.jpg',
      email: 'example@example.com',
      full_name: 'Example User',
      id: '1234',
      provider: 'Challonge',
      user_name: 'example_user',
    },
  },
]);

const headers = computed(() => [
  { title: 'Provider', key: 'provider' },
  { title: 'Email', key: 'email' },
  { title: 'Actions', key: 'actions' },
]);

const loading = ref(false);

const providers = ['Challonge', 'Twitch'];
const selectableProviders = computed(() =>
  providers.filter((f) => !items.value.map((m) => m.provider).includes(f)),
);
const provider = ref();

async function link(isActive: Ref<boolean>) {
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

async function unlink(item: UserIdentity) {
  const { data: identities, error } = await supabase.auth.getUserIdentities();

  if (error) {
    alert('Something went wrong');
    return;
  }

  if (identities?.identities) {
    const identity = identities.identities.find((f) => f.provider === item.provider);
    if (identity) {
      const { data, error } = await supabase.auth.unlinkIdentity(identity);
      if (error) {
        if (error.code === 'single_identity_not_deletable') {
          alert(error.message);
          return;
        }

        alert("I can't unlink your identity");
      }

      if (data) {
        alert('Unlink correctly');
        await update();
        return;
      }

      alert("Why you don't have data?");
    }
  }

  alert('I have not found identities');
}

async function update() {
  const { data: identities, error } = await supabase.auth.getUserIdentities();
  if (error) {
    alert("I can't fetch updated identities");
    return;
  }

  items.value = identities?.identities || [];
  provider.value = null;
}

onMounted(async () => {
  await update();
});
</script>
