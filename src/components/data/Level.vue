<script setup lang="ts">
import Max from "../../assets/max.png";

defineProps<{ level: number | null; max?: number }>();
</script>

<template>
  <div class="flex items-center">
    <img v-if="level === max" alt="level" :src="Max" class="w-8" />
    <span v-else>{{ level }}</span>
  </div>
</template>
