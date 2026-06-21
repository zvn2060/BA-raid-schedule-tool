<script setup lang="ts">
const { member, targetActor } = defineProps<{
  member: Member;
  targetActor?: Member | null;
}>();

const { avatar } = useStudentAvatar(() => member);
const { avatar: targetAvatar } = useStudentAvatar(() => targetActor);
</script>

<template>
  <div :key="`student-${member}`" class="relative aspect-square flex items-center justify-center select-none">
    <img
      v-if="avatar"
      loading="lazy"
      :src="avatar"
      class="object-cover w-full h-full pointer-events-none"
    >
    <span v-else>Empty</span>
    <img
      v-if="targetAvatar"
      loading="lazy"
      :src="targetAvatar"
      class="absolute bottom-0 right-0 z-10 w-15 h-15 object-cover pointer-events-none"
      style="background-color: #FFFFFF; border-width:2px 0 0 2px; border-color: #000000"
    >
  </div>
</template>
