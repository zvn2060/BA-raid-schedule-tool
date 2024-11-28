<script setup lang="ts">
const props = defineProps<{
  student: Student;
  width: number;
  height: number;
  x: number;
  y: number;
  stroke?: string;
  strokeWidth?: number;
}>();

const { avatar } = useStudentAvatar(() => props.student.id);
const { state } = useImage(() => ({
  src: avatar.value ?? "#",
  crossorigin: "Anonymous",
}));

</script>

<template>
  <KonvaImage
    v-if="student"
    :image="state"
    :width
    :height
    :x="x"
    :y="y"
    :stroke
    :strokeWidth
  />
</template>
