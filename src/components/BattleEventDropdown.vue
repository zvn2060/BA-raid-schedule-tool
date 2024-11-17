<script setup lang="ts">
const model = defineModel<(typeof BattleEvent)[keyof typeof BattleEvent]>();
</script>

<template>
  <Select :options="BattleEventOptions" v-model="model" />
</template>
