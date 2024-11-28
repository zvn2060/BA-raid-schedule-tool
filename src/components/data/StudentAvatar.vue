<script setup lang="ts">
const props = defineProps<{ student: Student | null }>();

const { avatar } = useStudentAvatar(() => props.student?.id);
</script>

<template>
  <div
    :key="`student-${student?.id}`"
    class="aspect-square flex items-center justify-center select-none"
  >
    <img
      v-if="avatar"
      :src="avatar"
      class="object-cover w-full h-full pointer-events-none"
    />
    <span v-else>Empty</span>
  </div>
</template>
