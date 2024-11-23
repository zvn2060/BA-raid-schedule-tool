<script setup lang="ts">
import type { FabricObject, TPointerEventInfo } from "fabric";
import { Canvas, Point, Rect } from "fabric";
import { clamp } from "lodash-es";

const props = defineProps<{
  width: number;
  height: number;
}>();

const canvas = ref();
let canvasRef: Canvas;
const container = ref();

const { width, height } = useElementSize(container);
const rect = new Rect({
  width: props.width,
  height: props.height,
  fill: "white",
  selectable: false,
  hasControls: false,
  hoverCursor: "auto",
  objectCaching: false,
  stroke: "#e4e4e4",
  strokeWidth: 2,
});

function wheelHandler(event: TPointerEventInfo<WheelEvent>) {
  const fromZoom = canvasRef.getZoom();
  const toZoom = clamp(fromZoom - event.e.deltaY / 2000, 0.4, 1.5);
  canvasRef?.zoomToPoint(event.viewportPoint, toZoom);
  canvasRef?.requestRenderAll();
}

const dragInfo = {
  isDragging: false,
  startX: 0,
  startY: 0,
};

function mouseDownHandler(event: TPointerEventInfo<MouseEvent>) {
  if (!event.e.altKey) return;
  canvasRef?.setCursor("move");
  dragInfo.isDragging = true;
  canvasRef.selection = false;
  dragInfo.startX = event.viewportPoint.x;
  dragInfo.startY = event.viewportPoint.y;
}

function mouseMoveHandler(event: TPointerEventInfo<MouseEvent>) {
  if (!dragInfo.isDragging) return;
  canvasRef.relativePan(
    new Point(
      event.viewportPoint.x - dragInfo.startX,
      event.viewportPoint.y - dragInfo.startY
    )
  );
  dragInfo.startX = event.viewportPoint.x;
  dragInfo.startY = event.viewportPoint.y;
  canvasRef.requestRenderAll();
}

watch([width, height], ([newW, newH]) => {
  resizeCanvas(newW, newH);
});

function resizeCanvas(width: number, height: number) {
  canvasRef?.setDimensions({ width, height });
  const zoom = canvasRef.getZoom();
  canvasRef.absolutePan(
    new Point({
      x: rect.left - ((width - rect.width * zoom) >> 1),
      y: rect.top - ((height - rect.height * zoom) >> 1),
    })
  );
  canvasRef?.renderAll();
}

onMounted(() => {
  canvasRef = new Canvas(canvas.value, {
    backgroundColor: "transparent",
    renderOnAddRemove: false,
  });
  canvasRef.add(rect);
  canvasRef.on("mouse:wheel", wheelHandler);
  canvasRef.on("mouse:down", mouseDownHandler);
  canvasRef.on("mouse:move", mouseMoveHandler);
  canvasRef.on("mouse:up", () => {
    dragInfo.isDragging = false;
    canvasRef.selection = true;
    canvasRef.setCursor("auto");
  });
  canvasRef.setZoom(0.5);
  canvasRef.renderAll();
});

function flush() {
  canvasRef?.renderAll();
}

function addObjects(...objects: FabricObject[]) {
  canvasRef?.add(...objects);
  flush();
}

defineExpose({ flush, addObjects });
</script>

<template>
  <div ref="container" class="bg-checkboard relative">
    <div class="absolute top-0 left-4"></div>
    <canvas ref="canvas"></canvas>
  </div>
</template>

<style lang="scss">

</style>
