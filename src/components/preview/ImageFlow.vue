<script setup lang="ts">
import { useImage } from "@vueuse/core";
import { calculateStagePages } from "~/utils/generatePages";

const { state } = useImage({
  src: BackgroundImage.圖片軸底圖1.href,
  crossorigin: "Anonymous",
});

const store = useBattleStore();
const { battle } = storeToRefs(store);
const config = useLocalStorage("設定.圖片軸", { strokeWidth: 6 });
const stagePages = computed(() => calculateStagePages(battle.value.toObject(), { col: 80, row: 20 }));

const height = computed(() => stagePages.value.length * 1080);
</script>

<template>
  <!-- eslint-disable vue/valid-v-for -->
  <ImageEditor
    :width="1920"
    :height
    :pixel-ration="1"
    :export-name="`${battle.name}-圖片軸`"
  >
    <template #config>
      <div>
        <label class="font-bold block mb-1">文字邊框寬度</label>
        <InputNumber
          v-model="config.strokeWidth"
          suffix=" px"
          class="w-full"
          :min="1"
          :max="24"
        />
      </div>
    </template>
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
              :strokeWidth="config.strokeWidth"
              stroke="#000000"
              :width="group.commentWidth"
              :height="120"
              fontFamily="Microsoft YaHei"
            />
            <KonvaGroup :y="group.avatarsY">
              <template v-for="(action, index) in group.actions">
                <KonvaAvatar
                  :student-id="action.actor"
                  :side="148"
                  stroke="black"
                  :stroke-width="2"
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
</template>

<style lang="scss"></style>
