<script setup lang="ts">
import { clamp } from "lodash-es";

const props = defineProps<{ width: number; height: number }>();

const factor = ref(1);
const offset = ref({ x: 0, y: 0 });
const styles = computed(() => ({
  "--tw-scale-x": factor.value,
  "--tw-scale-y": factor.value,
  "--tw-translate-y": `calc(-50% + ${offset.value.y}px)`,
  "--tw-translate-x": `calc(-50% + ${offset.value.x}px)`,
  width: `${props.width}px`,
  height: `${props.height}px`,
}));

function onWheel(event: WheelEvent) {
  factor.value = clamp(factor.value - event.deltaY / 1500, 0.2, 2);
}

const isHoldAlt = useKeyModifier("Alt");

const dragInfo = {
  isDragging: false,
  startX: 0,
  startY: 0,
};

function mouseDownHandler(event: MouseEvent) {
  if (!event.altKey) return;
  dragInfo.isDragging = true;
  dragInfo.startX = event.x;
  dragInfo.startY = event.y;
}

function mouseUpHandler(event: MouseEvent) {
  dragInfo.isDragging = false;
}

function mouseMoveHandler(event: MouseEvent) {
  if (!dragInfo.isDragging) return;
  offset.value.x += event.x - dragInfo.startX;
  offset.value.y += event.y - dragInfo.startY;
  dragInfo.startX = event.x;
  dragInfo.startY = event.y;
}
</script>

<template>
  <div
    class="bg-checkboard relative overflow-hidden"
    :class="isHoldAlt ? 'cursor-move' : 'cursor-auto'"
    @wheel.passive="onWheel"
    @mousedown="mouseDownHandler"
    @mousemove.passive="mouseMoveHandler"
    @mouseup="mouseUpHandler"
    @mouseleave="
      {
        dragInfo.isDragging = false;
      }
    "
  >
    <div id="base" :style="styles">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
#base {
  @apply absolute bg-gray-50 shadow top-1/2  left-1/2 transform;

  > * {
    position: absolute;
  }
}
</style>
