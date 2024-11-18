<script setup lang="ts">
import type {Team} from "../libs";

const props = defineProps<{ team: Omit<Team, "">, stageId: number }>();
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

const hoverActionId = ref<number>();
</script>

<template>
  <div class="stage-container">
    <div class="col-span-full text-white text-stroke text-3xl font-extrabold">
      {{ description || "&nbsp;" }}
    </div>
    <template v-for="(action, index) in stage">
      <template v-for="student in action.students">
        <StudentAvatar
            @mouseenter="hoverActionId = index"
            @mouseleave="hoverActionId = undefined"
            :student="student"
            @click="onClick(index)"
            class="border border-black cursor-pointer"
            :class="{ 'bg-yellow-200': hoverActionId === index }"
        />
      </template>
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
