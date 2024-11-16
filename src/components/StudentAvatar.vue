<script setup lang="ts">
defineProps<{ student: Student }>();
</script>

<template>
  <div
    :key="`student-${student.id}`"
    class="aspect-square flex items-center justify-center"
  >
    <span class="text-xl" v-if="student.id === -1">
      {{ student.name }}
    </span>
    <img
      v-else
      :src="`https://schaledb.com/images/student/icon/${student.id}.webp`"
      class="object-cover w-full h-full"
    />
  </div>
</template>
