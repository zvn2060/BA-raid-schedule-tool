<script setup lang="ts">
import { useImage } from "@vueuse/core";

const { member, targetActor, side, x, y, stroke, strokeWidth} = defineProps<{
  member: Member;
  targetActor?: Member | null;
  side: number;
  x: number;
  y: number;
  stroke?: string;
  strokeWidth?: number;
}>();

const { avatar } = useStudentAvatar(() => member);
const { state } = useImage(() => ({ src: avatar.value ?? "#", crossorigin: "Anonymous" }));

const targetSide = side / 5 * 2;
const targetX = x + side / 5 * 3;
const targetY = y + side / 5 * 3;
const { avatar: targetAvatar } = useStudentAvatar(() => targetActor);
const { state:targetState } = useImage(() => ({ src: targetAvatar.value ?? "#", crossorigin: "Anonymous" }));
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
  <KonvaRect
    v-if="targetAvatar"
    :width="targetSide"
    :height="targetSide"
    :x="targetX"
    :y="targetY"
    fill="white"
    stroke="black"
    stroke-width="2"
  />
  <KonvaImage
    v-if="targetAvatar"
    :image="targetState"
    :width="targetSide"
    :height="targetSide"
    :x="targetX"
    :y="targetY"
  />
  <KonvaRect
    v-if="targetAvatar"
    :width="targetSide"
    :height="targetSide"
    :x="targetX"
    :y="targetY"
    stroke="black"
    stroke-width="2"
  />
</template>
