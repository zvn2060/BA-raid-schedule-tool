<script setup lang="ts">
defineProps<{ star: number }>();
</script>

<template>
  <div class="flex items-center gap-[2px]">
    <i v-for="_ in Math.min(star, 5)" class="pi pi-star-fill text-yellow-400" />
    <template v-if="star > 5">
      <i v-for="_ in star - 5" class="pi pi-star-fill text-cyan-400" />
    </template>
  </div>
</template>
