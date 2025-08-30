<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import LoginDialog from './components/dialogs/LoginDialog.vue';
import RegisterDialog from './components/dialogs/RegisterDialog.vue';
import { RouterView } from 'vue-router';
import { useAccount } from './stores/account';
import { useGravatar } from './composables/useGravatar';

const drawer = ref<boolean>(false);

const userId = computed(() =>
  account.account?.email ? account.account.email : 'Not authenticated',
);
const account = useAccount();

const loading = ref(false);

onMounted(async () => {
  try {
    loading.value = true;
    await account.load();
    const gravatar = useGravatar(account.account?.email, 64);
    avatarUrl.value = gravatar.avatarUrl;
    profileUrl.value = gravatar.profileUrl;
  } finally {
    loading.value = false;
  }
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

const avatarUrl = ref('');
const profileUrl = ref('');
</script>

<template>
  <VApp>
    <VAppBar>
      <VAppBarNavIcon @click="drawer = !drawer"></VAppBarNavIcon>

      <VAppBarTitle> MDT </VAppBarTitle>

      <template v-slot:append>
        <VMenu>
          <template v-slot:activator="{ props }">
            <VSkeletonLoader :loading type="avatar">
              <VAvatar v-bind="props" class="me-2" data-test="user-menu">
                <img v-if="authenticated && avatarUrl" :src="avatarUrl" alt="Avatar" />
                <VIcon v-else>fa fa-user</VIcon>
              </VAvatar>
            </VSkeletonLoader>
          </template>
          <VList v-if="authenticated">
            <VListItem>{{ userId }}</VListItem>
            <!--<VListItem @click="logout">Account</VListItem>-->
            <VListItem append-icon="fas fa-arrow-up-right-from-square">
              <a :href="profileUrl" target="_blank" class="text-blue-500 underline"> Gravatar </a>
            </VListItem>
            <VDivider class="my-2"></VDivider>
            <VListItem
              @click="logout"
              append-icon="fas fa-arrow-right-from-bracket"
              data-test="user-logout"
              >Logout</VListItem
            >
          </VList>
          <VList v-else>
            <VListItem @click="login" append-icon="fas fa-right-to-bracket" data-test="user-login"
              >Login</VListItem
            >
            <VListItem @click="register" append-icon="fas fa-user-plus" data-test="user-register"
              >Register</VListItem
            >
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
