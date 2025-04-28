<script setup lang="ts">
const model = defineModel<BattleMode>();
</script>

<template>
  <Select v-model="model" :options="BattleModeOptions" />
</template>
