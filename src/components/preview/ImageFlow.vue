<script setup lang="ts">
import MikaBackground from "../../assets/backgrounds/圖片軸底圖-1.png";

const editor = useTemplateRef("editor");
const store = useBattleStore();
const { battle } = storeToRefs(store);
const pages = useTemplateRef("pages");
type StageInfo = { teamId: number; stageId: number };
type Column = StageInfo[];
type Page = Column[];

const stagePages = computed<Page[]>(() => {
  const pages = new Array<Page>([]);
  battle.value.teams.forEach((team, teamId) => {
    let columns = new Array<{ data: StageInfo[]; width: number }>({
      data: [],
      width: 0,
    });
    let y = 0;
    team.stages.forEach((stage, stageId) => {
      const avatarRows = Math.ceil(stage.actions.length / 4);
      const avatarCols = Math.min(stage.actions.length, 4);
      const occupiedY = avatarRows * 150 + 10 * (avatarRows - 1) + 43.2 + 20;
      const occupiedX = avatarCols * 150 + 10 * (avatarCols - 1);
      const lastColumn = columns.at(-1)!;
      const data = { teamId, stageId };
      if (occupiedY + y + lastColumn.data.length * 20 <= 980) {
        y += occupiedY;
        lastColumn.width = Math.max(lastColumn.width, occupiedX);
        lastColumn.data.push(data);
      } else {
        columns.push({ data: [data], width: occupiedX });
        y = occupiedY;
      }
    });

    let x = 0;
    columns.forEach((column) => {
      if (x + column.width + pages.at(-1)!.length * 80 <= 1760) {
        x += column.width;
        pages.at(-1)?.push(column.data);
      } else {
        x = column.width;
        pages.push([column.data]);
      }
    });
    pages.push([]);
  });
  return pages.filter((it) => it.length);
});

function onDownloadClick() {
  if (!editor.value) return;
  editor.value.export(`${battle.value.name}-圖片軸`, pages);
}
</script>

<template>
  <div class="relative">
    <Button
      rounded
      class="!absolute right-4 top-4 z-10"
      size="large"
      label="下載"
      icon="pi pi-download"
      @click="onDownloadClick"
    />
    <ImageEditor
      :width="1920"
      :height="1080 * stagePages.length"
      ref="editor"
      class="h-full border-2"
    >
      <div class="flex flex-col w-full h-full">
        <div
          ref="pages"
          v-for="page in stagePages"
          :style="{ backgroundImage: `url(${MikaBackground})` }"
          class="py-[40px] px-[80px] outline min-h-[1080px] w-[1920px] max-h-[1080px] flow-page"
        >
          <div v-for="column in page">
            <Stage
              v-for="coord in column"
              :team="battle.teams[coord.teamId]"
              :stage-id="coord.stageId"
            />
          </div>
        </div>
      </div>
    </ImageEditor>
  </div>
</template>

<style lang="scss">
.flow-page {
  @apply flex gap-[80px];
  > div {
    @apply flex flex-col gap-[20px];
  }
}
</style>
