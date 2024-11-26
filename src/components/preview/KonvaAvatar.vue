<script setup lang="ts">
const props = defineProps<{
  student: Student;
  width: number;
  height: number;
  x: number;
  y: number;
  stroke?: string;
}>();

const { state } = useImage(() => ({
  src: `https://schaledb.com/images/student/icon/${props.student.id}.webp`,
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
  />
</template>
