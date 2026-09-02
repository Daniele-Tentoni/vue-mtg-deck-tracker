<template>
  <VBtnToggle
    v-model="model"
    divided
    :disabled="disabled"
    class="mx-auto"
    variant="flat"
    color="success"
    :data-test="`match-button-group-${p.num}`"
  >
    <div>
      <VTooltip :text="t('matchButtons.player1Tooltip')">
        <template #activator="{ props }">
          <VBtn
            v-bind="props"
            :text="t('matchButtons.you')"
            min-width="72"
            :aria-label="t('matchButtons.youWonAria')"
            :data-test="`match-button-group-${p.num}-button-0`"
            class="pa-2"
          ></VBtn>
        </template>
      </VTooltip>
      <VTooltip :text="t('matchButtons.player2Tooltip')">
        <template #activator="{ props }">
          <VBtn
            v-bind="props"
            :text="t('matchButtons.opponent')"
            min-width="96"
            :aria-label="t('matchButtons.opponentWonAria')"
            :data-test="`match-button-group-${p.num}-button-1`"
            class="pa-2"
          ></VBtn>
        </template>
      </VTooltip>
    </div>
  </VBtnToggle>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const p = defineProps(['disabled', 'num']);

const model = defineModel();

const { t } = useI18n();
</script>
