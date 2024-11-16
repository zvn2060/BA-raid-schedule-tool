<script setup lang="ts">
import download from "downloadjs";
import { toPng } from "html-to-image";
const { flow } = storeToRefs(useFlowStore());

const page = ref(0);

const showStages = computed(() =>
  flow.value.stages.slice(page.value * 8, (page.value + 1) * 8)
);

const { pixelRatio } = useDevicePixelRatio();
const container = ref();
const scaleFactor = computed(() => {
  const factor = pixelRatio.value < 0.01 ? 0 : 1 / pixelRatio.value;
  return { "--tw-scale-x": factor, "--tw-scale-y": factor };
});

function onDownloadClick() {
  if (!container.value) return;
  toPng(container.value).then((dataUrl) => {
    download(dataUrl, `${flow.value.name}-${page.value + 1}.png`);
  });
}
</script>

<template>
  <div class="flex items-center justify-center relative">
    <div class="absolute top-4 right-4">
      <Button @click="onDownloadClick" rounded icon="pi pi-save" />
    </div>
    <div
      ref="container"
      class="preview-container transform"
      :style="scaleFactor"
    >
      <Stage
        v-for="(stage, index) in showStages"
        :stage="stage"
        :stage-id="index"
        :class="{ 'ml-auto': index < 4 }"
      />
    </div>
  </div>
</template>

<style lang="scss">
.preview-container {
  @apply grid grid-cols-2  py-8 px-12 grid-flow-col gap-y-2 gap-x-12;
  grid-template-rows: repeat(4, max-content);
}
</style>
