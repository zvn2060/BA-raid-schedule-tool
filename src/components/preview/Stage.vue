<script setup lang="ts">
const props = defineProps<{ team: Team; stageId: number }>();
const stage = computed(() => props.team.stages[props.stageId]);

const container = useTemplateRef("container");
const hover = useElementHover(container);
</script>

<template>
  <div
    ref="container"
    class="stage-container"
    :class="{ 'bg-yellow-50': hover }"
  >
    <Inplace
      :pt="{
        content: { class: ['flex!', 'items-center'] },
        display: { class: ['border-none!'] },
      }"
    >
      <template #display>
        <div class="stage-description">
          {{ stage.comment || "&nbsp;" }}
        </div>
      </template>
      <template #content="{ closeCallback }">
        <InputText v-model="stage.comment" class="flex-1" />
        <Button
          size="small"
          class="ml-1"
          icon="pi pi-check"
          text
          rounded
          @click="closeCallback"
        />
      </template>
    </Inplace>
    <div class="stage-avatars-container">
      <template v-for="action in stage.actions">
        <StudentAvatar :member="action.actor" class="border-4 w-[150px] border-black" />
      </template>
    </div>
    <div class="stage-control" :class="[hover ? 'opacity-100' : 'opacity-0']">
      <i class="pi pi-arrow-up" @click="team.moveStage(stageId, 'front')" />
      <i class="pi pi-arrow-down" @click="team.moveStage(stageId, 'back')" />
      <Icon name="mdi:table-row-plus-before" class="pi pi-plus text-green-600" @click="team.insertStage(stageId, 'front')" />
      <Icon name="mdi:table-row-plus-after" class="pi pi-plus text-green-600" @click="team.insertStage(stageId, 'back')" />
      <i class="pi pi-trash text-red-600" @click="team.deleteStage(stageId)" />
    </div>
  </div>
</template>

<style>
@reference "tailwindcss";
@reference "tailwindcss-primeui";

.stage-container {
  @apply relative flex flex-col gap-[20px] p-4 rounded-md;
}

.stage-avatars-container {
  @apply flex gap-[10px] flex-1 max-w-[630px] flex-wrap;
}

.stage-control {
  @apply transition-opacity flex items-center gap-2 bg-surface-100 px-2 py-1 rounded-lg w-fit;

}

.stage-control > * {
  @apply text-2xl cursor-pointer hover:bg-surface-200 w-10 h-10 p-2  rounded leading-none;
}

.stage-description {
  @apply  text-white leading-none max-w-[630px]  break-all;
  -webkit-text-stroke: 5px black;
  font-family: "Microsoft YaHei", sans-serif;
  font-size: 40px;
  paint-order: stroke;
}
</style>
