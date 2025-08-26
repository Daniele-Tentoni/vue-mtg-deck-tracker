<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import LoginDialog from './components/dialogs/LoginDialog.vue';
import RegisterDialog from './components/dialogs/RegisterDialog.vue';
import { RouterView } from 'vue-router';
import { useAccount } from './stores/account';
import { VListItem } from 'vuetify/components';

const drawer = ref<boolean>(false);

const userId = computed(() =>
  account.account?.email ? account.account.email : 'Not authenticated',
);
const account = useAccount();

onMounted(async () => {
  await account.load();
});

const authenticated = computed(() => Boolean(account.account?.id));

const loginVisible = ref(false);

function login() {
  registerVisible.value = false;
  loginVisible.value = true;
}

const registerVisible = ref(false);

function register() {
  loginVisible.value = false;
  registerVisible.value = true;
}

async function logout() {
  await account.logout();
}
</script>

<template>
  <VApp>
    <VAppBar>
      <VAppBarNavIcon @click="drawer = !drawer"></VAppBarNavIcon>

      <VAppBarTitle>MDT</VAppBarTitle>

      <template v-slot:append>
        <VMenu>
          <template v-slot:activator="{ props }">
            <VAvatar v-bind="props" icon="fa fa-user"></VAvatar>
          </template>
          <VList v-if="authenticated">
            <VListItem loading="true">{{ userId }}</VListItem>
            <!--<VListItem @click="logout">Account</VListItem>-->
            <VListItem @click="logout">Logout</VListItem>
          </VList>
          <VList v-else>
            <VListItem @click="login">Login</VListItem>
            <VListItem @click="register">Register</VListItem>
          </VList>
        </VMenu>
      </template>
    </VAppBar>

    <VFooter app class="elevation-1">
      <VRow>
        <VSpacer></VSpacer>
        <VCol cols="auto">
          <a href="https://github.com/daniele-tentoni/vue-mtg-deck-tracker" target="_blank">
            <VIcon>fab fa-github</VIcon>
          </a>
        </VCol>
      </VRow>
    </VFooter>

    <VNavigationDrawer v-model="drawer" temporary>
      <VListItem title="Home" prepend-icon="fa fa-home" link to="/" />
      <VListItem title="Pauper Archetypes" prepend-icon="fa fa-home" link to="/pauper" />
      <VListItem
        prepend-icon="fab fa-github"
        link
        href="https://github.com/daniele-tentoni/vue-mtg-deck-tracker"
        target="_blank"
        class="mt-auto"
      >
        <template #default>
          If you want to contribute, explore the Github repository and open an issue or submit a
          pull request.
        </template>
      </VListItem>
    </VNavigationDrawer>

    <VMain>
      <RouterView></RouterView>
    </VMain>

    <LoginDialog v-model="loginVisible" @register="register"></LoginDialog>
    <RegisterDialog v-model="registerVisible" @login="login"></RegisterDialog>
  </VApp>
</template>
