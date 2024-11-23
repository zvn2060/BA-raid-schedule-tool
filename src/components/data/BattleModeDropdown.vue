<script setup lang="ts">

const model = defineModel<BattleMode>();
</script>

<template>
  <Select :options="BattleModeOptions" v-model="model" />
</template>
