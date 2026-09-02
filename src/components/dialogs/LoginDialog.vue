<template>
  <VDialog max-width="640px" v-model="model">
    <template #default>
      <VCard :loading>
        <template #prepend><VIcon class="me-2">fas fa-right-to-bracket</VIcon></template>
        <template #title>{{ t('dialogs.login.title') }}</template>
        <template #append>
          <CloseButton @close="model = false"></CloseButton>
        </template>
        <template #text>
          <VRow>
            <VCol>
              <p>
                {{ t('dialogs.login.description') }}
              </p>
              <p class="mt-2">
                {{ t('dialogs.login.needAccount') }}
                <span class="text-decoration-underline cursor-pointer" @click="emit('register')">{{
                  t('dialogs.login.clickHere')
                }}</span
                >.
              </p>
            </VCol>
          </VRow>
          <VRow>
            <VCol>
              <VTextField
                v-model="email"
                type="email"
                :placeholder="t('dialogs.login.emailPlaceholder')"
                :error-messages="loginError"
                @keyup.enter="login"
              ></VTextField>
            </VCol>
          </VRow>
        </template>
        <template #actions>
          <VBtn color="success" prepend-icon="fas fa-arrow-right-to-bracket" @click="login">
            {{ t('dialogs.login.title') }}
          </VBtn>
        </template>
      </VCard>
    </template>
  </VDialog>
</template>

<script setup lang="ts">
import { supabase } from '@/services/supabaseService';
import { ref } from 'vue';
import CloseButton from '@/components/dialogs/CloseButton.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const model = defineModel<boolean>();

const emit = defineEmits<{ (e: 'register'): void }>();

const email = ref('');

const loading = ref(false);
const loginError = ref('');

async function login() {
  try {
    loading.value = true;
    const { error } = await supabase.auth.signInWithOtp({
      email: email.value,
      options: {
        emailRedirectTo: import.meta.env.VITE_SUPABASE_REDIRECT,
      },
    });
    if (error) {
      loginError.value = error.message;
    } else {
      alert(t('dialogs.login.emailSent'));
      model.value = false;
    }
  } finally {
    loading.value = false;
  }
}
</script>
