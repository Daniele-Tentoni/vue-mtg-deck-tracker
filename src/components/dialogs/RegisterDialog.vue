<template>
  <VDialog max-width="640px" v-model="model">
    <template #default>
      <VCard :loading>
        <template #prepend><VIcon class="me-2">fas fa-user-plus </VIcon></template>
        <template #title>Register</template>
        <template #append>
          <CloseButton @close="model = false"></CloseButton>
        </template>
        <template #text>
          <VRow>
            <VCol>
              <p>
                I only ask you for an email to register, no more passwords! Activate your account by
                clicking on the link in the email I will send you and login next time with the same
                email.
              </p>
              <p class="mt-2">
                If you already have an account,
                <span class="text-decoration-underline" @click="emit('login')">click here</span>.
              </p>
            </VCol>
          </VRow>
          <VRow>
            <VCol>
              <VTextField
                v-model="email"
                type="email"
                placeholder="Email"
                :error-messages="registerMessages"
                :hide-details="true"
                @keyup.enter="register"
              ></VTextField>
            </VCol>
          </VRow>
        </template>
        <template #actions>
          <VBtn @click="register" prepend-icon="fas fa-arrow-right-to-bracket" color="success"
            >Register</VBtn
          >
        </template>
      </VCard>
    </template>
  </VDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { supabase } from '@/services/supabaseService';
import CloseButton from '@/components/dialogs/CloseButton.vue';

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
        alert('Controlla la tua casella di posta');
      }

      model.value = false;
    }
  } finally {
    loading.value = false;
  }
}
</script>
