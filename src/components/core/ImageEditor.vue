<script setup lang="ts">
import download from "downloadjs";
import Konva from "konva";
import { clamp, isNull } from "lodash-es";

const props = defineProps<{
  pixelRation: number;
  width: number;
  height: number;
  exportName: string;
}>();
const padding = 100;
const container = useTemplateRef("container");
const stage = useTemplateRef<Konva.Stage>("stage");
const pointerPosition = ref({ x: 0, y: 0 });
const stagePosition = ref({ x: 0, y: 0 });
const indicator = computed(() => {
  const targetX = -stagePosition.value.x / scale.value;
  const targetY = -stagePosition.value.y / scale.value;
  const width = 1 / scale.value;
  return {
    x: pointerPosition.value.x,
    y: pointerPosition.value.y,
    targetX,
    targetY,
    width,
    offset: { x: -width * 10, y: -width * 10 },
    fontSize: 20 / scale.value,
    label: `${pointerPosition.value.x.toFixed(
      1
    )}, ${pointerPosition.value.y.toFixed(1)}`,
  };
});
const { width: containerW, height: containerH } = useElementSize(container);
const scale = ref(1);
const minScale = computed(() =>
  Math.max(
    Math.min(
      containerW.value / (props.width + padding * 2),
      containerH.value / (props.height + padding * 2)
    ),
    Number.MIN_VALUE
  )
);
const stageConfig = computed<Konva.StageConfig>(() => ({
  width: containerW.value,
  height: containerH.value,
  scaleX: scale.value,
  scaleY: scale.value,
  draggable: true,
}));

onMounted(() => {});

function dragMoveHandler() {
  const pos = stage.value?.getStage().getPosition();
  if (!pos) return;
  stagePosition.value = { x: pos.x, y: pos.y };
}

function mouseMoveHandler() {
  const pointer = stage.value?.getStage().getRelativePointerPosition();
  if (!pointer) return;
  pointerPosition.value = { x: pointer.x, y: pointer.y };
}

function wheelHandler(event: Konva.KonvaEventObject<WheelEvent>) {
  event.evt.preventDefault();
  const stageInstance = stage.value?.getStage();
  const pointer = stageInstance?.getPointerPosition();
  if (!stageInstance || !pointer) return;
  const oldScale = scale.value;
  const mousePointTo = {
    x: (pointer.x - stageInstance.x()) / oldScale,
    y: (pointer.y - stageInstance.y()) / oldScale,
  };
  scale.value = clamp(
    scale.value * (event.evt.deltaY > 0 ? 0.882 : 1.133),
    minScale.value,
    10
  );
  stagePosition.value = {
    x: pointer.x - mousePointTo.x * scale.value,
    y: pointer.y - mousePointTo.y * scale.value,
  };
  stage.value?.getStage().setPosition(stagePosition.value);
}

function onResetClick() {
  stagePosition.value = {
    x: (containerW.value - props.width * minScale.value) >> 1,
    y: (containerH.value - props.height * minScale.value) >> 1,
  };
  stage.value?.getStage().setPosition(stagePosition.value);
  scale.value = minScale.value;
}

async function onDownloadClick() {
  const oldScale = scale.value;
  scale.value = 1;
  await nextTick();
  const targets = stage.value?.getStage().find(".export");
  if (targets) {
    const isSingle = targets.length < 2;
    const data = targets
      .filter((target) => !isNull(target))
      .map((target, index) => ({
        dataUrl: target.toDataURL({ pixelRatio: props.pixelRation }),
        name: isSingle
          ? `${props.exportName}.png`
          : `${props.exportName}-${index + 1}.png`,
      }));
    if (isSingle) download(data[0].dataUrl, data[0].name);
    else workerDownload({ files: data, name: `${props.exportName} (壓縮)` });
  }
  scale.value = oldScale;
}
</script>
<template>
  <div class="flex">
    <div class="w-fit min-w-[15rem] shadow-xl px-4 py-2 flex flex-col gap-2">
      <slot name="config">
        <span class="my-auto self-center font-bold">沒有可配置的選項</span>
      </slot>
    </div>
    <div
      ref="container"
      class="bg-checkboard relative overflow-hidden flex-1 border-2"
    >
      <div id="control-panel">
        <slot name="control" />
        <Button
          icon="pi pi-refresh"
          size="small"
          rounded
          severity="contrast"
          @click="onResetClick"
        />
        <div class="flex-1" />
        <Button
          rounded
          size="small"
          label="下載"
          icon="pi pi-download"
          @click="onDownloadClick"
        />
      </div>
      <KonvaStage
        ref="stage"
        v-bind="stageConfig"
        @wheel="wheelHandler"
        @dragmove="dragMoveHandler"
        @mousemove="mouseMoveHandler"
      >
        <KonvaLayer>
          <KonvaRect :width="props.width" :height="props.height" fill="white" />
        </KonvaLayer>
        <slot />
        <KonvaLayer>
          <KonvaLabel
            :x="indicator.x"
            :y="indicator.y"
            :offset="indicator.offset"
          >
            <KonvaTag fill="#000000" :opacity="0.74" />
            <KonvaText
              fill="#ffffff"
              :text="indicator.label"
              :fontSize="indicator.fontSize"
              :padding="indicator.width * 4"
            />
          </KonvaLabel>
          <KonvaRect
            :x="indicator.x"
            :y="indicator.targetY"
            :width="indicator.width"
            :height="containerH / scale"
            fill="orange"
          />
          <KonvaRect
            :x="indicator.targetX"
            :y="indicator.y"
            :width="containerW / scale"
            :height="indicator.width"
            fill="orange"
          />
        </KonvaLayer>
      </KonvaStage>
    </div>
  </div>
</template>

<style scoped lang="scss">
#control-panel {
  @apply absolute top-2  inset-x-2 flex  items-end gap-2 z-10  pointer-events-none;
  > * {
    @apply pointer-events-auto;
  }
}
</style>
