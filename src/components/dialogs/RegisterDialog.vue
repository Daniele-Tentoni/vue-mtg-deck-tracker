<template>
  <VDialog max-width="640px" v-model="model">
    <template #default>
      <VCard :loading>
        <template #prepend><VIcon class="me-2">fas fa-user-plus </VIcon></template>
        <template #title>{{ t('dialogs.register.title') }}</template>
        <template #append>
          <CloseButton @close="model = false"></CloseButton>
        </template>
        <template #text>
          <VRow>
            <VCol>
              <p>
                {{ t('dialogs.register.description') }}
              </p>
              <p class="mt-2">
                {{ t('dialogs.register.alreadyAccount') }}
                <span class="text-decoration-underline cursor-pointer" @click="emit('login')">{{
                  t('dialogs.register.clickHere')
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
                :placeholder="t('dialogs.register.emailPlaceholder')"
                :error-messages="registerMessages"
                :hide-details="true"
                @keyup.enter="register"
              ></VTextField>
            </VCol>
          </VRow>
        </template>
        <template #actions>
          <VBtn @click="register" prepend-icon="fas fa-arrow-right-to-bracket" color="success">{{
            t('dialogs.register.title')
          }}</VBtn>
        </template>
      </VCard>
    </template>
  </VDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { supabase } from '@/services/supabaseService';
import CloseButton from '@/components/dialogs/CloseButton.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const model = defineModel<boolean>();

const emit = defineEmits<{ (e: 'login'): void }>();

const loading = ref(false);

const email = ref('');

const registerMessages = ref('');

async function register() {
  try {
    loading.value = true;
    const { error, data } = await supabase.auth.signInWithOtp({
      email: email.value,
      options: {
        emailRedirectTo: import.meta.env.VITE_SUPABASE_REDIRECT,
      },
    });

    if (error) {
      registerMessages.value = error.message;
    } else {
      if (data) {
        alert(t('dialogs.register.emailSent'));
      }

      model.value = false;
    }
  } finally {
    loading.value = false;
  }
}
</script>
