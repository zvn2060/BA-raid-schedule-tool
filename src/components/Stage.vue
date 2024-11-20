<script setup lang="ts">
import type {Team} from "../libs";
import {isNil} from "lodash-es";
import {TransitionFade} from "@morev/vue-transitions";

const props = defineProps<{ team: Omit<Team, "">; stageId: number }>();
const stage = computed(() => props.team.stages[props.stageId]);

const { getColor } = useBorderColor();

function getBorderColor(targetId: StudentId | null | undefined) {
  if (isNil(targetId)) return getColor(-1);
  return getColor(props.team.skillTargetMap.get(targetId) ?? -1)
}

const container = ref();
const hover = useElementHover(container)
</script>

<template>
  <div ref="container" class="w-fit stage-container">
    <Inplace class="stage-description" :pt="{content: {class: ['!flex', 'items-center']}}">
      <template #display><span class="text-white text-stroke text-3xl font-extrabold">{{ stage.comment || "&nbsp;" }}</span></template>
      <template #content="{closeCallback}">
        <InputText v-model="stage.comment" class="flex-1"/>
        <Button size="small" class="ml-1" icon="pi pi-check" text rounded @click="closeCallback"/>
      </template>
    </Inplace>
    <div class="stage-avatars-container">
      <template v-for="action in stage.actions">
        <StudentAvatar
            :student="team.getMember(action.actor)"
            class="border-2"
            :style="{ 'border-color': getBorderColor(action.target)}"
        />
      </template>
    </div>
    <TransitionFade no-move group class="stage-control flex flex-col justify-center items-center gap-1 text-surface-600">
      <template v-if="hover">
        <i class="pi pi-arrow-up cursor-pointer hover:bg-surface-200 p-1 rounded" @click="team.moveStage(stageId, 'front')"/>
        <i class="pi pi-arrow-down cursor-pointer hover:bg-surface-200 p-1 rounded" @click="team.moveStage(stageId, 'back')"/>
        <div class="mt-1">
          <i class="pi pi-plus cursor-pointer hover:bg-surface-200 p-1 rounded text-primary" @click="team.insertStage(stageId)"/>
          <i class="pi pi-trash cursor-pointer hover:bg-surface-200 p-1 rounded text-red-600" @click="team.deleteStage(stageId)"/>
        </div>
      </template>
    </TransitionFade>
  </div>
</template>

<style lang="scss">

.stage-container {
  display: grid;
  grid-template-columns: 1fr max-content;
  grid-template-rows: min-content 1fr;
  gap: 2px;

  .stage-avatars-container {
    @apply grid gap-1;
    grid-template-columns: repeat(4, 6rem);
    grid-area: 2/1/3/2;
  }

  .stage-description {
    grid-area: 1/1/2/2;
  }

  .stage-control {
    grid-area: 2/2/3/3;
  }
}
</style>
