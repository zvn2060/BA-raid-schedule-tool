<script setup lang="ts">
import download from "downloadjs";
import { toPng } from "html-to-image";
import { castArray, clamp } from "lodash-es";
import { ShallowRef } from "vue";

const props = defineProps<{
  width: number;
  height: number;
}>();

const canvas = useTemplateRef("canvas");
const container = useTemplateRef("container");
const { width: containerW, height: containerH } = useElementSize(container);
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

onMounted(() => {
  offset.value.x = containerW.value >> 1;
  offset.value.y = containerH.value >> 1;
});

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

async function exportPng(
  filename: string,
  ref?: Readonly<ShallowRef<HTMLDivElement | HTMLDivElement[] | null>>
) {
  const targets = ref ? castArray(ref.value) : [canvas.value];
  const oldState = { offset: { ...offset.value }, factor: factor.value };
  const multiple = targets.length > 1;
  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    if (!target) continue;
    offset.value.x = target.offsetWidth >> 1;
    offset.value.y = target.offsetHeight >> 1;
    factor.value = 1;
    await nextTick();
    const dataUrl = await toPng(target);
    download(
      dataUrl,
      multiple ? `${filename}-${i + 1}.png` : `${filename}.png`
    );
  }
  offset.value = oldState.offset;
  factor.value = oldState.factor;
}

defineExpose({ export: exportPng });
</script>

<template>
  <div
    ref="container"
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
    <div id="base" ref="canvas" :style="styles">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
#base {
  @apply absolute bg-white shadow transform select-none pointer-events-none;

  > * {
    position: absolute;
  }
}
</style>
