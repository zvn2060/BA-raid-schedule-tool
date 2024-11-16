<script setup lang="ts">
defineProps<{ studentId: number }>();
</script>

<template>
  <div :key="`student-${studentId}`" class="aspect-square">
    <img
      :src="`https://schaledb.com/images/student/icon/${studentId}.webp`"
      class="object-cover w-full h-full"
    />
  </div>
</template>
