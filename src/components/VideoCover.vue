<script setup lang="ts">
import {Canvas, Point, Rect} from "fabric";
import {useWheel} from "@vueuse/gesture";

const canvas = ref();
let canvasRef: Canvas;
const container = ref();

const { width, height } = useElementSize(container);
const { elementY: y, elementX: x } = useMouseInElement(container);

useWheel(({ movement }) => {
  const isZoomOut = movement[1] > 0;
  const zoom = canvasRef.getZoom();
  if (isZoomOut && zoom < 0.5 || (!isZoomOut && zoom > 2)) return;
  const delta = isZoomOut ? 200 : -200;
  const factor = zoom - delta / width.value;
  canvasRef.zoomToPoint(new Point(x.value, y.value), factor)
}, { domTarget: container, eventOptions: { passive: true }, axis: "y" });

watch(width, value => {
  canvasRef?.setDimensions({ width: value })
});

watch(height, value => {
  canvasRef?.setDimensions({ height: value })
});

onMounted(() => {
  canvasRef = new Canvas(canvas.value);
  const rect = new Rect({
    width: 1000,
    height: 600,
    fill: 'white',
    objectCaching: false,
    stroke: '#e4e4e4',
    strokeWidth: 2,
  });
  canvasRef.centerObject(rect);
  canvasRef.add(rect);
  canvasRef.renderAll();
})
</script>

<template>
  <div ref="container">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<style lang="scss">
</style>