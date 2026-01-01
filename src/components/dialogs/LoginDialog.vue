<template>
  <VDialog max-width="640px" v-model="model">
    <template #default>
      <VCard :loading>
        <template #prepend><VIcon class="me-2">fas fa-right-to-bracket</VIcon></template>
        <template #title>Login</template>
        <template #append>
          <CloseButton @close="model = false"></CloseButton>
        </template>
        <template #text>
          <VRow>
            <VCol>
              <p>
                I ask you only for an email so you don't have to remeber another password. I will
                send you an email with a link you have to click to be redirect to this site.
              </p>
              <p class="mt-2">
                If you need an account,
                <span class="text-decoration-underline" @click="emit('register')">click here</span>.
              </p>
            </VCol>
          </VRow>
          <VRow>
            <VCol>
              <VTextField
                v-model="email"
                type="email"
                placeholder="Email"
                :error-messages="loginError"
                @keyup.enter="login"
              ></VTextField>
            </VCol>
          </VRow>
        </template>
        <template #actions>
          <VBtn color="success" prepend-icon="fas fa-arrow-right-to-bracket" @click="login">
            Login
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
      alert('Controlla la tua casella di posta per il link di login');
      model.value = false;
    }
  } finally {
    loading.value = false;
  }
}
</script>
