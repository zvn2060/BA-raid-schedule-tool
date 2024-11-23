<script setup lang="ts">

defineProps<{ student: Student | null }>();
</script>

<template>
  <div
    :key="`student-${student?.id}`"
    class="aspect-square flex items-center justify-center select-none"
  >
    <span v-if="!student">Empty</span>
    <span class="text-xl" v-else-if="student.id === -1">
      {{ student.name }}
    </span>
    <img
      v-else
      :src="`https://schaledb.com/images/student/icon/${student.id}.webp`"
      class="object-cover w-full h-full pointer-events-none"
    />
  </div>
</template>
