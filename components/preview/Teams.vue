<script setup lang="ts">
import { BattleMode } from "#shared";

const store = useBattleStore();
const { battle } = storeToRefs(store);

const height = computed(() => 220 * battle.value.teams.length + 20);
</script>

<template>
  <div class="relative">
    <ImageEditor
      :export-name="`${battle.name}-網站隊伍`"
      :width="1000"
      :height
      class="h-full border-2"
      :pixelRation="1"
    >
      <KonvaLayer>
        <template v-if="battle.mode === BattleMode.Unrestrict">
          <KonvaGroup
            name="export"
            v-for="(team, teamId) in battle.teams"
            :width="1000"
            :height="200"
            :y="20 + teamId * 220"
          >
            <KonvaRect fill="#000000" :width="1000" :height="200" />
            <template v-for="(member, index) in team.members.slice(0, 6)">
              <KonvaAvatar
                v-if="member"
                :student="member"
                :x="25 + index * 105"
                :y="47.5"
                :width="105"
                :height="105"
              />
            </template>
            <template v-for="(member, index) in team.members.slice(6)">
              <KonvaAvatar
                v-if="member"
                :student="member"
                :x="675 + index * 75"
                :y="62.5"
                :width="75"
                :height="75"
              />
            </template>
          </KonvaGroup>
        </template>
        <template v-else>
          <KonvaGroup
            name="export"
            v-for="(team, teamId) in battle.teams"
            :width="1000"
            :height="200"
            :y="20 + teamId * 220"
          >
            <KonvaRect fill="#000000" :width="1000" :height="200" />
            <template v-for="(member, index) in team.members">
              <KonvaAvatar
                v-if="member"
                :student="member"
                :x="35 + index * 155"
                :y="22.5"
                :width="155"
                :height="155"
              />
            </template>
          </KonvaGroup>
        </template>
      </KonvaLayer>
    </ImageEditor>
  </div>
</template>

<style lang="scss">
.team-container {
  @apply grid bg-black w-[1000px] h-[200px] items-center justify-center;
  &.normal {
    @apply px-[35px];
    grid-template-columns: repeat(6, 155px);
  }
  &.unrestrict {
    @apply px-[25px];
    grid-template-columns: repeat(6, 105px) 20px repeat(4, 75px);
  }
}
</style>
