<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import LoginDialog from './components/dialogs/LoginDialog.vue';
import RegisterDialog from './components/dialogs/RegisterDialog.vue';
import { RouterView } from 'vue-router';
import { useAccount } from './stores/account';
import { useGravatar } from './composables/useGravatar';
import { useI18n } from 'vue-i18n';
import { setLocale, type SupportedLocale } from './i18n';

const { t, locale } = useI18n();

const drawer = ref<boolean>(false);

const userId = computed(() =>
  account.account?.email ? account.account.email : t('app.auth.notAuthenticated'),
);
const account = useAccount();

const selectedLocale = ref<SupportedLocale>(locale.value as SupportedLocale);

const languageOptions = computed(() => [
  { title: t('app.language.english'), value: 'en' },
  { title: t('app.language.italian'), value: 'it' },
]);

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

function changeLanguage(value: string | null) {
  if (!value || (value !== 'en' && value !== 'it')) {
    return;
  }

  selectedLocale.value = value;
  setLocale(value);
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
                <img
                  v-if="authenticated && avatarUrl"
                  :src="avatarUrl"
                  :alt="t('app.auth.gravatar')"
                />
                <VIcon v-else>fa fa-user</VIcon>
              </VAvatar>
            </VSkeletonLoader>
          </template>
          <VList v-if="authenticated">
            <VListItem link to="/users/me">{{ userId }}</VListItem>
            <!--<VListItem @click="logout">Account</VListItem>-->
            <VListItem append-icon="fas fa-arrow-up-right-from-square">
              <a :href="profileUrl" target="_blank" class="text-blue-500 underline">
                {{ t('app.auth.gravatar') }}
              </a>
            </VListItem>
            <VDivider class="my-2"></VDivider>
            <VListItem
              @click="logout"
              append-icon="fas fa-arrow-right-from-bracket"
              data-test="user-logout"
              >{{ t('app.auth.logout') }}</VListItem
            >
          </VList>
          <VList v-else>
            <VListItem
              @click="login"
              append-icon="fas fa-right-to-bracket"
              data-test="user-login"
              >{{ t('app.auth.login') }}</VListItem
            >
            <VListItem @click="register" append-icon="fas fa-user-plus" data-test="user-register">{{
              t('app.auth.register')
            }}</VListItem>
          </VList>
        </VMenu>
      </template>
    </VAppBar>

    <VFooter app class="elevation-1">
      <VRow>
        <VCol>Daniele Tentoni</VCol>
        <VSpacer></VSpacer>
        <VCol cols="auto">
          <a href="https://github.com/daniele-tentoni/vue-mtg-deck-tracker" target="_blank">
            <VIcon>fab fa-github</VIcon>
          </a>
        </VCol>
      </VRow>
    </VFooter>

    <VNavigationDrawer v-model="drawer" temporary>
      <VListItem :title="t('app.nav.home')" prepend-icon="fa fa-home" link to="/" />
      <VListItem :title="t('app.nav.trio')" prepend-icon="fa fa-cubes" link to="/trio" />
      <VListItem :title="t('app.nav.pauperArchetypes')" prepend-icon="fa fa-p" link to="/pauper" />

      <VListItem>
        <VSelect
          v-model="selectedLocale"
          :label="t('app.language.title')"
          :items="languageOptions"
          hide-details
          variant="outlined"
          density="compact"
          @update:model-value="changeLanguage"
        ></VSelect>
      </VListItem>

      <VListItem
        prepend-icon="fab fa-github"
        link
        href="https://github.com/daniele-tentoni/vue-mtg-deck-tracker"
        target="_blank"
        class="mt-auto"
      >
        <template #default>
          {{ t('app.contribute') }}
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
