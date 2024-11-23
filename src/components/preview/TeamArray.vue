<script setup lang="ts">
const { battle } = storeToRefs(useBattleStore());
const isVertical = computed(() => battle.value.teams.length > 2);

const teamContainerClass = computed(() => {
  if (battle.value.mode === BattleMode.Unrestrict)
    return "px-[20px] w-[1540px]";
  return isVertical.value
    ? "p-[30px] w-[800px] h-[200px] border-[10px] border-white"
    : "px-[20px] w-[940px]";
});

const arrayClasses = computed(() =>
  isVertical.value
    ? ["flex-col", "gap-[20px]"]
    : ["bg-black", "px-[10px] py-[15px]"]
);
</script>

<template>
  <div class="flex items-center justify-center" :class="arrayClasses">
    <template v-for="(team, teamIndex) in battle.teams">
      <div
        v-if="!isVertical && teamIndex > 0"
        class="w-[20px] bg-white self-stretch"
      />
      <div class="flex bg-black" :class="teamContainerClass">
        <template v-for="member in team.members">
          <StudentAvatar class="flex-1" v-if="member" :student="member" />
          <div v-else class="flex-1" />
        </template>
      </div>
    </template>
  </div>
</template>
