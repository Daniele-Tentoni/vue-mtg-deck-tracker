<template>
  <VDialog max-width="640px" v-model="model">
    <template #default>
      <VCard :loading>
        <template #title>Register</template>
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
              Questa procedura ti permette di creare un nuovo account con il quale potrai aggiungere
              i tuoi match e contribuire a migliorare la qualità dei dati presenti nel portale.
            </VCol>
          </VRow>
          <VRow>
            <VCol>
              <VTextField
                v-model="email"
                type="email"
                placeholder="Email"
                :error-messages="registerMessages"
              ></VTextField>
            </VCol>
          </VRow>
          <VRow>
            <VCol>
              Se possiedi già un account,
              <span class="text-decoration-underline" @click="emit('login')">clicca qui</span>.
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
      options: {},
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
