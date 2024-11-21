<script setup lang="ts">
import {Canvas, Point, Rect} from "fabric";
import {useWheel} from "@vueuse/gesture";

const canvas = ref();
let canvasRef: Canvas;

const container = ref();

const { width, height } = useElementSize(container);
const { elementY: y, elementX: x } = useMouseInElement(container);
const rect = new Rect({
  width: 1000,
  height: 600,
  fill: 'white',
  selectable: false,
  hoverCursor: null,
  objectCaching: false,
  stroke: '#e4e4e4',
  strokeWidth: 2,
});

useWheel(({ movement }) => {
  const isZoomOut = movement[1] > 0;
  const zoom = canvasRef.getZoom();
  if (isZoomOut && zoom < 0.5 || (!isZoomOut && zoom > 2)) return;
  const delta = isZoomOut ? 200 : -200;
  const factor = zoom - delta / width.value;
  canvasRef?.zoomToPoint(new Point(x.value, y.value), factor)
}, { domTarget: container, eventOptions: { passive: true }, axis: "y" });

watch([width, height], ([newW, newH]) => {
  canvasRef?.setDimensions({ width: newW, height: newH });
  canvasRef?.centerObject(rect);
});


onMounted(() => {
  canvasRef = new Canvas(canvas.value, { backgroundColor: "transparent" });
  canvasRef.add(rect);
  canvasRef.renderAll();
})


</script>

<template>
  <div ref="container" class="bg-checkboard">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<style lang="scss">

.bg-checkboard {
  --black: rgba(236, 236, 236, 0.8);
  background: linear-gradient(45deg, var(--black) 25%, transparent 25%, transparent 75%, var(--black) 75%), linear-gradient(45deg, var(--black) 25%, transparent 25%, transparent 75%, var(--black) 75%);
  background-size: 20px 20px;
  background-position: 0 0, 10px 10px;
}
</style>