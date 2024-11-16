<script setup lang="ts">
const props = defineProps<{ stage: Stage; stageId: number }>();
const flowStore = useFlowStore();
const { flow } = storeToRefs(flowStore);
const isHoldAlt = useKeyModifier("Alt");
const description = computed(() =>
  props.stage
    .map((it) => it.comment)
    .filter((it) => Boolean(it))
    .join(", ")
);

function onClick(actionId: number) {
  flow.value.move(
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
      <StudentAvatar
        v-for="studentId in action.ids"
        @mouseenter="hoverActionId = index"
        @mouseleave="hoverActionId = undefined"
        :student-id="studentId"
        @click="onClick(index)"
        class="border border-black cursor-pointer"
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
