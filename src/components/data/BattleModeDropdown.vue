<script setup lang="ts">
import { BattleMode } from "../../libs";

const model = defineModel<BattleMode>();
</script>

<template>
  <Select :options="BattleModeOptions" v-model="model" />
</template>
