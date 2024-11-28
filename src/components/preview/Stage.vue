<script setup lang="ts">
import {TransitionFade} from "@morev/vue-transitions";
import {isNil} from "lodash-es";
import type {Team} from "../../libs";

const props = defineProps<{ team: Omit<Team, "">; stageId: number }>();
const stage = computed(() => props.team.stages[props.stageId]);

const { getColor } = useBorderColor();

function getBorderColor(targetId: StudentId | null | undefined) {
  if (isNil(targetId)) return getColor(-1);
  return getColor(props.team.skillTargetMap.get(targetId) ?? -1);
}

const container = ref();
const hover = useElementHover(container);
</script>

<template>
  <div ref="container" class="w-fit stage-container">
    <Inplace
        :pt="{
        content: { class: ['!flex', 'items-center'] },
        display: { class: ['!border-none'] },
      }"
    >
      <template #display>
        <div class="stage-description">{{ stage.comment || "&nbsp;" }}</div>
      </template>
      <template #content="{ closeCallback }">
        <InputText v-model="stage.comment" class="flex-1"/>
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
        <StudentAvatar
            :student="team.getMember(action.actor)"
            class="border-4 w-[150px]"
            :style="{ 'border-color': getBorderColor(action.target) }"
        />
      </template>
    </div>
    <TransitionFade no-move group class="stage-control">
      <div v-if="hover" class="">
        <i class="pi pi-arrow-up" @click="team.moveStage(stageId, 'front')"/>
        <i class="pi pi-arrow-down" @click="team.moveStage(stageId, 'back')"/>
        <MdiTableRowPlusBefore
            class="pi pi-plus text-green-600"
            @click="team.insertStage(stageId, 'front')"
        />
        <MdiTableRowPlusAfter
            class="pi pi-plus text-green-600 "
            @click="team.insertStage(stageId, 'back')"
        />
        <i
            class="pi pi-trash text-red-600"
            @click="team.deleteStage(stageId)"
        />
      </div>
    </TransitionFade>
  </div>
</template>

<style lang="scss">
.stage-container {
  @apply relative flex flex-col gap-[20px];
  .stage-avatars-container {
    @apply flex gap-[10px] flex-1 max-w-[630px] flex-wrap;
  }
}

.stage-control {
  @apply absolute left-full top-0 bottom-0 pl-3 -my-4 -mr-4 py-4;
  > div {
    @apply flex items-center gap-2 bg-surface-100 px-2 py-1 rounded-lg;
    > * {
      @apply text-2xl cursor-pointer hover:bg-surface-200 w-10 h-10 p-2  rounded leading-none;
    }
  }
}

.stage-description {
  @apply text-stroke-[5px] text-white leading-none max-w-[630px]  break-all;
  font-family: "Microsoft YaHei", sans-serif;
  font-size: 40px;
  paint-order: stroke;
}
</style>
