<script setup lang="ts">
const { state } = useImage({
  src: new URL(
    encodeURI("../../assets/backgrounds/圖片軸底圖-1.png?url"),
    import.meta.url
  ).href,
});

const { getColor } = useBorderColor();
const store = useBattleStore();
const { battle } = storeToRefs(store);
type StageInfo = {
  comment: string | undefined;
  commentWidth: number;
  actions: Array<{ actor: Member; stroke: string }>;
  y: number;
  avatarsY: number;
};
type Column = { data: StageInfo[]; width: number; x: number };
type Page = Column[];

const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");
if (context) context.font = "40px 'Microsoft YaHei'";

const stagePages = computed<Page[]>(() => {
  const pages = new Array<Page>([]);
  battle.value.teams.forEach((team) => {
    let columns = new Array<Omit<Column, "x">>({ data: [], width: 0 });
    let y = 0;
    team.stages.forEach((stage) => {
      const avatarRows = Math.ceil(stage.actions.length / 4);
      const avatarCols = Math.min(stage.actions.length, 4);
      const commentOnelineWidth =
        context?.measureText(stage.comment ?? "").width ?? 0;
      const commentHeight = Math.ceil(commentOnelineWidth / 630) * 40;
      const commentWidth = Math.min(commentOnelineWidth, 630);
      const avatarsHeight = avatarRows < 2 ? 150 : avatarRows * 160 - 10;
      const avatarsWidth =
        avatarCols < 2 ? avatarCols * 150 : avatarCols * 160 - 10;
      const occupiedY =
        commentHeight +
        (commentHeight && avatarsHeight ? 20 : 0) +
        avatarsHeight;
      const occupiedX = Math.max(avatarsWidth, commentWidth);
      const lastColumn = columns.at(-1)!;
      const data = {
        comment: stage.comment,
        commentWidth: commentWidth,
        actions: stage.actions.map(({ actor, target }) => ({
          actor: team.getMember(actor),
          stroke: getColor(target ? team.skillTargetMap.get(target) ?? -1 : -1),
        })),
        y,
        avatarsY: commentHeight + 20,
      };
      if (y + occupiedY <= 1020) {
        y += occupiedY + 20;
        lastColumn.width = Math.max(lastColumn.width, occupiedX);
        lastColumn.data.push(data);
      } else {
        columns.push({ data: [{ ...data, y: 0 }], width: occupiedX });
        y = occupiedY + 20;
      }
    });

    let x = 0;
    columns.forEach((column) => {
      if (x + column.width <= 1760) {
        pages.at(-1)?.push({ ...column, x });
        x += column.width + 80;
      } else {
        pages.push([{ ...column, x: 0 }]);
        x = column.width + 80;
      }
    });
    pages.push([]);
  });
  return pages.filter((it) => it.length);
});

const height = computed(() => stagePages.value.length * 1080);
</script>

<template>
  <div class="relative">
    <ImageEditor
      :width="1920"
      :height
      class="h-full border-2"
      :pixelRation="1"
      :export-name="`${battle.name}-圖片軸`"
    >
      <KonvaLayer>
        <KonvaGroup
          v-for="(page, pageId) in stagePages"
          :width="1920"
          :height="1080"
          :y="pageId * 1080"
          name="export"
        >
          <KonvaImage :image="state" :width="1920" :height="1080" />
          <KonvaGroup v-for="column in page" :x="80 + column.x" :y="45">
            <KonvaGroup v-for="group in column.data" :y="group.y">
              <!-- <KonvaRect :width="10" :height="10" fill="green" /> -->
              <KonvaText
                :text="group.comment"
                :fontSize="40"
                fill="#ffffff"
                :fillAfterStrokeEnabled="true"
                :strokeWidth="3"
                stroke="#000000"
                :width="group.commentWidth"
                :height="120"
                fontFamily="Microsoft YaHei"
              />
              <KonvaGroup :y="group.avatarsY">
                <template v-for="(action, index) in group.actions">
                  <KonvaAvatar
                    v-if="action.actor"
                    :student="action.actor"
                    :width="148"
                    :height="148"
                    :stroke="action.stroke"
                    :strokeWidth="2"
                    :x="(index % 4) * 150 + 10 * (index % 4) + 1"
                    :y="Math.floor(index / 4) * 160 + 1"
                  />
                </template>
              </KonvaGroup>
            </KonvaGroup>
          </KonvaGroup>
        </KonvaGroup>
      </KonvaLayer>
    </ImageEditor>
  </div>
</template>

<style lang="scss">
.font-image-flow {
  font-family: "Microsoft Yahei", sans-serif;
}
</style>
