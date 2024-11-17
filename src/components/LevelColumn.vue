<script setup lang="ts">
defineProps<{ field: string; max?: number }>();
</script>

<template>
  <Column :field>
    <template #body="{ data }">
      <Level :level="data[field]" :max />
    </template>
  </Column>
</template>
