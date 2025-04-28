<script setup lang="ts">
const store = useBattleStore();
const { battle } = storeToRefs(store);

const height = computed(() => 220 * battle.value.teams.length + 20);
</script>

<template>
  <!-- eslint-disable vue/valid-v-for -->
  <div class="relative">
    <ImageEditor
      :export-name="`${battle.name}-網站隊伍`"
      :width="1000"
      :height
      class="h-full border-2"
      :pixel-ration="1"
    >
      <KonvaLayer>
        <template v-if="battle.mode === BattleMode.Unrestrict">
          <KonvaGroup
            v-for="(team, teamId) in battle.teams"
            name="export"
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
            v-for="(team, teamId) in battle.teams"
            name="export"
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
