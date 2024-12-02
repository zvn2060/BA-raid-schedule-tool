<script setup lang="ts">
import type { TextConfig } from "konva/lib/shapes/Text";
import TempVar from "vue-temp-var";

const store = useBattleStore();
const { battle } = storeToRefs(store);
const teamCount = computed(() => battle.value.teams.length);
const showFooter = computed(() => teamCount.value <= 2);
const showComment = computed(() => teamCount.value <= 2);
const showScore = computed(() => teamCount.value === 1);
const isNormal = computed(() => battle.value.mode !== BattleMode.Unrestrict);
const { url } = useVideoBackground();
const config = useLocalStorage(
  "設定.影片封面",
  {
    strokeWidth: 24,
    strokeColor: {
      [BattleMode.Raid]: "0088FC",
      [BattleMode.Elimination]: "E6212A",
      [BattleMode.Test]: "FF914D",
      [BattleMode.Unrestrict]: "808080",
      [BattleMode.JpRaid]: "5E17EB",
    },
  },
  { mergeDefaults: true }
);

const { state: backgroundImage } = useImage(() => ({
  src: url.value ?? "",
  crossorigin: "Anonymous",
}));

const strokeColor = computed(
  () => `#${config.value.strokeColor[battle.value.mode] ?? "00FF00"}`
);

const titleSize = useAutoSizeText(() => battle.value.title, {
  width: 1800,
  height: 150,
  fontFamily: "wanhanzon",
});
const normalScoreSize = useAutoSizeText(() => battle.value.score, {
  width: 840,
  height: 160,
  fontFamily: "wanhanzon",
});
const unrestrictScoreSize = useAutoSizeText(() => battle.value.score, {
  width: 240,
  height: 160,
  fontFamily: "wanhanzon",
});
const commonTextStyle: TextConfig = computed(() => ({
  fontFamily: "wanhanzon",
  fill: "#ffffff",
  strokeWidth: config.value.strokeWidth,
  fillAfterStrokeEnabled: true,
}));

const imageName = computed(() => `${battle.value.title}-影片封面`);
</script>

<template>
  <ImageEditor
    :export-name="imageName"
    :width="1920"
    :height="1080"
    :pixelRation="2 / 3"
  >
    <template #config>
      <div>
        <label class="font-bold block mb-1">標題</label>
        <Textarea v-model="battle.title" class="w-full" auto-resize />
      </div>
      <div v-if="showComment">
        <label class="font-bold block mb-1">註解</label>
        <Textarea v-model="battle.comment" class="w-full" auto-resize />
      </div>
      <div v-if="showScore">
        <label class="font-bold block mb-1">分數</label>
        <InputText v-model="battle.score" class="w-full" />
      </div>
      <div>
        <label class="font-bold block mb-1">文字邊框寬度</label>
        <InputNumber
          suffix=" px"
          v-model="config.strokeWidth"
          class="w-full"
          :min="1"
          :max="36"
        />
      </div>
      <div>
        <label class="font-bold block mb-1">文字邊框顏色</label>
        <div class="grid grid-cols-[max-content_1fr] gap-2">
          <span class="font-semibold">{{ battle.mode }}</span>
          <ColorPicker v-model="config.strokeColor[battle.mode]" />
        </div>
      </div>
    </template>
    <KonvaLayer>
      <KonvaGroup name="export" :width="1920" :height="1080">
        <KonvaImage :width="1920" :height="1080" :image="backgroundImage" />
        <KonvaRect :width="1920" :height="180" fill="black" />
        <KonvaText
          v-bind="commonTextStyle"
          :x="60"
          wrap="none"
          align="center"
          verticalAlign="middle"
          :stroke="strokeColor"
          :y="10"
          :width="1800"
          :height="160"
          :fontSize="titleSize"
          :text="battle.title"
        />
        <KonvaText
          v-if="showComment"
          v-bind="commonTextStyle"
          :x="60"
          stroke="#ff3131"
          :y="210"
          :width="1800"
          :fontSize="titleSize"
          :text="battle.comment"
        />
        <KonvaRect
          v-if="showFooter"
          :y="900"
          :width="1920"
          :height="180"
          fill="black"
        />
        <KonvaText
          v-if="showScore"
          v-bind="commonTextStyle"
          :x="isNormal ? 1020 : 1620"
          align="center"
          verticalAlign="middle"
          :stroke="strokeColor"
          :y="910"
          :width="isNormal ? 840 : 240"
          :height="160"
          :fontSize="isNormal ? normalScoreSize : unrestrictScoreSize"
          :text="battle.score"
        />
        <TempVar
          v-if="battle.teams.length === 1"
          v-slot="{ team }"
          :define="{ team: battle.teams[0] }"
        >
          <KonvaGroup :x="40" :y="895">
            <template v-for="(member, memberId) in team.members">
              <KonvaAvatar
                v-if="member"
                :student="member"
                :x="20 + memberId * 150"
                :y="20"
                :width="150"
                :height="150"
              />
            </template>
          </KonvaGroup>
        </TempVar>
        <TempVar
          v-else-if="battle.teams.length === 2"
          v-slot="{ offsetY, offsetX }"
          :define="{
            offsetY: 895,
            offsetX: 10,
          }"
        >
          <KonvaGroup
            v-for="(team, teamId) in battle.teams"
            :x="offsetX + 940 * teamId"
            :y="offsetY"
          >
            <KonvaRect
              v-if="teamId"
              :width="20"
              :height="150"
              :x="0"
              :y="20"
              fill="#ffffff"
            />
            <template v-for="(member, memberId) in team.members">
              <KonvaAvatar
                v-if="member"
                :student="member"
                :x="(teamId ? 40 : 20) + memberId * 150"
                :y="20"
                :width="150"
                :height="150"
              />
            </template>
          </KonvaGroup>
        </TempVar>
        <TempVar
          v-else
          v-slot="{ offsetY, offsetX }"
          :define="{
            offsetY: teamCount === 3 ? 315 : 205,
            offsetX: battle.mode === BattleMode.Test ? 1055 : 25,
          }"
        >
          <KonvaGroup
            v-for="(team, teamId) in battle.teams"
            :x="offsetX"
            :y="offsetY + teamId * 220"
          >
            <KonvaRect
              :width="790"
              :height="190"
              stroke="#ffffff"
              :strokeWidth="10"
              fill="#000000"
            />
            <template v-for="(member, memberId) in team.members">
              <KonvaAvatar
                v-if="member"
                :student="member"
                :x="35 + memberId * 120"
                :y="35"
                :width="120"
                :height="120"
                stroke="#000000"
              />
            </template>
          </KonvaGroup>
        </TempVar>
      </KonvaGroup>
    </KonvaLayer>
  </ImageEditor>
</template>

<style lang="scss"></style>
