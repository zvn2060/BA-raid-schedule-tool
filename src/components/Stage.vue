<script setup lang="ts">
import type {Team} from "../libs";

const props = defineProps<{ team: Omit<Team, "">; stageId: number }>();
const stage = computed(() => props.team.stages[props.stageId]);
const isHoldAlt = useKeyModifier("Alt");

function onClick(actionId: number) {
  props.team.move(
      { stage: props.stageId, action: actionId },
      isHoldAlt.value ? "next" : "previous"
  );
}

const { getColor } = useBorderColor();

function getBorderColor(members: Member[]) {
  if (members.length < 2) return "#000000";
  else
    return getColor(
        members
            .slice(1)
            .map((it) => `${it?.id ?? 0}`)
            .join(",")
    );
}

const hoverActionId = ref<number>();
</script>

<template>
  <div class="stage-container">
    <Inplace class="col-span-full">
      <template #display><span class="text-white text-stroke text-3xl font-extrabold">{{ stage.comment || "&nbsp;" }}</span></template>
      <template #content="{closeCallback}">
        <InputText v-model="stage.comment" />
        <Button size="small" class="ml-1" icon="pi pi-check" text rounded @click="closeCallback"/>
      </template>
    </Inplace>
    <template v-for="(member, index) in stage.members">
      <StudentAvatar
          @mouseenter="hoverActionId = index"
          @mouseleave="hoverActionId = undefined"
          :student="member"
          @click="onClick(index)"
          class="border-2 cursor-pointer"
          :class="{ 'bg-yellow-200': hoverActionId === index }"
      />
    </template>
  </div>
</template>

<style lang="scss">
.stage-container {
  @apply grid gap-1;
  grid-template-columns: repeat(4, 6rem);
  grid-template-rows: min-content 1fr;
}
</style>
