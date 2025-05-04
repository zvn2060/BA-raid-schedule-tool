<script setup lang="ts">
const { member } = defineProps<{ member: Member }>();

const { avatar } = useStudentAvatar(() => member);
</script>

<template>
  <div :key="`student-${member}`" class="aspect-square flex items-center justify-center select-none">
    <img
      v-if="avatar"
      loading="lazy"
      :src="avatar"
      class="object-cover w-full h-full pointer-events-none"
    >
    <span v-else>Empty</span>
  </div>
</template>
