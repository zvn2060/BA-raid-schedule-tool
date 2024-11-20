<script setup lang="ts">
import download from "downloadjs";
import {toPng} from "html-to-image";

const { battle } = storeToRefs(useBattleStore());
const router = useRouter();
const currentTeamIndex = ref(0);
const currentTeam = computed(() =>
    battle.value.teams.at(currentTeamIndex.value)
);
if (!currentTeam.value) router.replace("/strategy/pick");

const page = ref(0);

const showStages = computed(() => currentTeam.value?.stages.slice(page.value * 8, (page.value + 1) * 8) ?? []);

const { pixelRatio } = useDevicePixelRatio();
const container = ref();
const totalPage = computed(() => Math.ceil((currentTeam.value?.stages.length ?? 0) / 8));
const scaleFactor = computed(() => {
  const factor = pixelRatio.value < 0.01 ? 0 : 1 / pixelRatio.value;
  return { "--tw-scale-x": factor, "--tw-scale-y": factor };
});

function onDownloadClick() {
  if (!container.value) return;
  toPng(container.value).then((dataUrl) => {
    download(dataUrl, `${battle.value.name}第 ${currentTeamIndex.value + 1} 隊-${page.value + 1}.png`);
  });
}
</script>

<template>
  <div class="flex items-center justify-center relative">
    <div class="absolute top-4 right-4 flex items-center gap-2">
      <Button icon="pi pi-arrow-left" rounded :disabled="page === 0" @click="page--"/>
      <Button icon="pi pi-arrow-right" rounded :disabled="page === totalPage - 1" @click="page++"/>
      <Button @click="onDownloadClick" rounded icon="pi pi-save"/>
    </div>
    <div v-if="currentTeam"
         ref="container"
         class="preview-container transform"
         :style="scaleFactor"
    >
      <template v-for="index in showStages.length" :key="page * 8 + index">
        <Stage
            :team="currentTeam"
            :stage-id="page * 8 + index - 1"
        />
      </template>
    </div>
  </div>
</template>

<style lang="scss">
.preview-container {
  @apply grid grid-cols-2  py-8 px-12 grid-flow-col gap-y-2 gap-x-12;
  grid-template-rows: repeat(4, max-content);
}
</style>
