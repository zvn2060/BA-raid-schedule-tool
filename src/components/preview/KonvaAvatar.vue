<script setup lang="ts">
import { useImage } from "@vueuse/core";

const { member } = defineProps<{
  member: Member;
  side: number;
  x: number;
  y: number;
  stroke?: string;
  strokeWidth?: number;
}>();

const { avatar } = useStudentAvatar(() => member);
const { state } = useImage(() => ({ src: avatar.value ?? "#", crossorigin: "Anonymous" }));
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
