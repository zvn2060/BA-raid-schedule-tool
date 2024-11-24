<script setup lang="ts">
const editor = useTemplateRef("editor");
const teams = useTemplateRef("teams");
const store = useBattleStore();
const { battle } = storeToRefs(store);

function onDownloadClick() {
  if (!editor.value) return;
  editor.value.export(battle.value.name, teams);
}

const height = computed(() => 220 * battle.value.teams.length - 20);
</script>

<template>
  <div class="relative">
    <ImageEditor :width="1000" :height ref="editor" class="h-full border-2" >
      <template #control>
        <Button
          rounded
          label="下載"
          icon="pi pi-download"
          @click="onDownloadClick"
        />
      </template>
      <div class="flex flex-col w-full h-full justify-evenly">
        <div
          v-for="team in battle.teams"
          class="team-container"
          :class="team.struture"
          ref="teams"
        >
          <template v-for="(member, index) in team.members">
            <div v-if="battle.mode === BattleMode.Unrestrict && index === 6" />
            <StudentAvatar v-if="member" :student="member" />
            <div v-else />
          </template>
        </div>
      </div>
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
