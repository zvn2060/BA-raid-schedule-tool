<script setup lang="ts">
import TempVar from "vue-temp-var";

const store = useBattleStore();
const { battle } = storeToRefs(store);
const teamCount = computed(() => battle.value.teams.length);
const showFooter = computed(() => teamCount.value <= 2);
const showComment = computed(() => teamCount.value <= 2);
const showScore = computed(() => teamCount.value === 1);
const isNormal = computed(() => battle.value.mode !== BattleMode.Unrestrict);
const { url } = useVideoBackground();

const { state: backgroundImage } = useImage(() => ({
  src: url.value ?? "",
  crossorigin: "Anonymous",
}));

const strokeColor = computed(() => {
  switch (battle.value.mode) {
    case BattleMode.Raid:
      return "#0088FC";
    case BattleMode.Elimination:
      return "#E6212A";
    case BattleMode.Test:
      return "#FF914D";
    case BattleMode.Unrestrict:
      return "#808080";
  }
});

const titleSize = useAutoSizeText(() => battle.value.title, {
  width: 1800,
  height: 160,
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

const imageName = computed(() => `${battle.value.title}-影片封面`);
</script>

<template>
  <div class="flex">
    <div class="w-fit min-w-[15rem] shadow-xl px-4 py-2 flex flex-col gap-2">
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
    </div>
    <ImageEditor
      :width="1920"
      :height="1080"
      class="flex-1 font-[wanhanzon] border-2"
    >
      <KonvaLayer>
        <KonvaGroup name="export" :id="imageName" :width="1920" :height="1080">
          <KonvaImage :width="1920" :height="1080" :image="backgroundImage" />
          <KonvaRect :width="1920" :height="180" fill="black" />
          <KonvaText
            fill="#ffffff"
            :x="60"
            wrap="none"
            fontFamily="wanhanzon"
            align="center"
            verticalAlign="middle"
            :strokeWidth="12"
            :stroke="strokeColor"
            :y="10"
            :fillAfterStrokeEnabled="true"
            :width="1800"
            :height="160"
            :fontSize="titleSize"
            :text="battle.title"
          />
          <KonvaText
            v-if="showComment"
            fill="#ffffff"
            :x="60"
            fontFamily="wanhanzon"
            :strokeWidth="12"
            stroke="#ff3131"
            :y="210"
            :fillAfterStrokeEnabled="true"
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
            fill="#ffffff"
            :x="isNormal ? 1020 : 1620"
            fontFamily="wanhanzon"
            align="center"
            verticalAlign="middle"
            :strokeWidth="12"
            :stroke="strokeColor"
            :y="910"
            :fillAfterStrokeEnabled="true"
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
  </div>
</template>

<style lang="scss"></style>
