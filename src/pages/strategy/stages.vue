<script setup lang="ts">
import { debounceFilter, pausableFilter } from "@vueuse/core";

const battleStore = useBattleStore();
const { battle } = storeToRefs(battleStore);
const auto = ref(false);

const pausableDebounceFilter = pausableFilter(debounceFilter(1000));

watch(
  auto,
  (value) => {
    if (value) pausableDebounceFilter.resume();
    else pausableDebounceFilter.pause();
  },
  { immediate: true }
);

watchWithFilter(
  () => battle.value.text,
  () => {
    triggerParse();
  },
  { eventFilter: pausableDebounceFilter.eventFilter }
);

function triggerParse() {
  battle.value.parse();
}
</script>

<template>
  <Splitter>
    <SplitterPanel class="relative">
      <Textarea
        v-model="battle.text"
        class="min-h-full !rounded-none w-full !bg-slate-900 !text-white !pt-24"
        auto-resize
      />
      <div
        class="absolute top-3 h-16 right-3 flex items-center gap-2 bg-[#FFFFFF60] p-2 rounded-lg"
      >
        <Button
          v-if="!auto"
          label="產生"
          raised
          size="small"
          @click="triggerParse"
        />
        <span class="text-white">自動產生</span>
        <ToggleSwitch v-model="auto" />
      </div>
    </SplitterPanel>
    <SplitterPanel>
      <div class="overflow-y-auto p-2 h-full">
        <div class="flex flex-col gap-2">
          <Stage
            v-for="(stage, index) in battle.stages"
            :stage="stage"
            :stage-id="index"
          />
        </div>
      </div>
    </SplitterPanel>
  </Splitter>
</template>

<style lang="scss">
.school-container {
  @apply grid grid-cols-[repeat(auto-fit,minmax(105px,1fr))] gap-2 p-2 border-y border-black border-opacity-20;
}

.student-container {
  @apply flex flex-col rounded-lg overflow-hidden bg-surface-100 shadow-lg hover:shadow-xl cursor-pointer;
  > .icon {
    @apply bg-surface-300;
  }
}

.student-container.selected {
  @apply bg-yellow-100;
  > .icon {
    @apply bg-yellow-200;
  }
}
</style>
