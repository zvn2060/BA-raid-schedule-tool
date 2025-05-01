<script setup lang="ts">
import { useImage } from "@vueuse/core";

const { studentId } = defineProps<{
  studentId?: number | null;
  side: number;
  x: number;
  y: number;
  stroke?: string;
  strokeWidth?: number;
}>();

const { avatar } = useStudentAvatar(() => studentId ?? undefined);
const { state } = useImage(() => ({
  src: avatar.value ?? "#",
  crossorigin: "Anonymous",
}));
</script>

<template>
  <KonvaImage
    :image="state"
    :width="side"
    :height="side"
    :x="x"
    :y="y"
  />
  <KonvaRect
    :stroke
    :strokeWidth
    :width="side"
    :height="side"
    :x="x"
    :y="y"
  />
</template>
