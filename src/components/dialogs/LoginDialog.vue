<template>
  <v-dialog max-width="640px" v-model="model">
    <template #default>
      <v-card :loading>
        <template #title>Login</template>
        <template #append>
          <VTooltip text="Chiudi">
            <template #activator="{ props }">
              <VBtn v-bind="props" icon="fa fa-close" @click="model = false"></VBtn>
            </template>
          </VTooltip>
        </template>
        <template #text>
          <VRow>
            <VCol>
              Non viene chiesta la password perché viene inviata soltanto una mail con un link. Così
              devi ricordarti meno password e sei più contento.
            </VCol>
          </VRow>
          <VRow>
            <VCol>
              <VTextField
                v-model="email"
                type="email"
                placeholder="Email"
                :error-messages="loginError"
              ></VTextField>
            </VCol>
          </VRow>
          <VRow>
            <VCol
              >Se devi registrarti,
              <span class="text-decoration-underline" @click="emit('register')">clicca qui</span>.
            </VCol>
          </VRow>
        </template>
        <template #actions>
          <VBtn color="success" prepend-icon="fas fa-arrow-right-to-bracket" @click="login">
            Login
          </VBtn>
        </template>
      </v-card>
    </template>
  </v-dialog>
</template>

<script setup lang="ts">
import { supabase } from '@/services/supabaseService';
import { ref } from 'vue';

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
        emailRedirectTo: 'https://daniele-tentoni.github.io/vue-mtg-deck-tracker',
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
