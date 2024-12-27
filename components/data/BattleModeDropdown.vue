<script setup lang="ts">
import type { BattleMode } from "~/shared";
import { BattleModeOptions } from "~/shared";

const model = defineModel<BattleMode>();
</script>

<template>
  <Select :options="BattleModeOptions" v-model="model" />
</template>
