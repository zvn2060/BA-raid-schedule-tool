<script setup lang="ts">
defineProps<{ star: number }>();
</script>

<template>
  <div class="flex items-center gap-[2px]">
    <template v-if="star <= 5">
      <i v-for="i in star" :key="i" class="pi pi-star-fill text-yellow-400" />
    </template>
    <template v-else>
      <i v-for="j in star - 5" :key="j" class="pi pi-star-fill text-cyan-400" />
    </template>
  </div>
</template>
