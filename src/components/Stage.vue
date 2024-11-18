<script setup lang="ts">
import type { Team } from "../libs";

const props = defineProps<{ team: Omit<Team, "">; stageId: number }>();
const stage = computed(() => props.team.stages[props.stageId]);
const isHoldAlt = useKeyModifier("Alt");
const description = computed(() =>
  stage.value
    .map((it) => it.comment)
    .filter((it) => Boolean(it))
    .join(", ")
);

function onClick(actionId: number) {
  props.team.move(
    { stage: props.stageId, action: actionId },
    isHoldAlt.value ? "next" : "previous"
  );
}

const { getColor } = useBorderColor();

function getBorderColor(members: Member[]) {
  if (members.length === 1) return "#000000";
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
    <div class="col-span-full text-white text-stroke text-3xl font-extrabold">
      {{ description || "&nbsp;" }}
    </div>
    <template v-for="(action, index) in stage">
      <StudentAvatar
        @mouseenter="hoverActionId = index"
        @mouseleave="hoverActionId = undefined"
        :student="action.members[0]"
        @click="onClick(index)"
        class="border-2 cursor-pointer"
        :class="{ 'bg-yellow-200': hoverActionId === index }"
        :style="{ 'border-color': getBorderColor(action.members) }"
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
