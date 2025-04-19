<script setup lang="ts">
import { useImage } from '@vueuse/core';

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
  <template v-if="student">
    <KonvaImage :image="state" :width :height :x="x" :y="y" />
    <KonvaRect :stroke :strokeWidth :width :height :x="x" :y="y"/>
  </template>
</template>
