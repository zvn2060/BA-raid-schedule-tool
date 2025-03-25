<script setup lang="ts">
import { debounceFilter, pausableFilter } from "@vueuse/core";
import { split } from "lodash-es";

const battleStore = useBattleStore();
const { battle } = storeToRefs(battleStore);
const router = useRouter();
const textArea = useTemplateRef("textarea");
const currentTeamIndex = ref(0);
const currentTeam = computed(() =>
  battle.value.teams.at(currentTeamIndex.value)
);
if (!currentTeam.value) router.replace("/strategy/pick");

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
  () => currentTeam.value?.text,
  () => {
    triggerParse();
  },
  { eventFilter: pausableDebounceFilter.eventFilter }
);

function triggerParse() {
  currentTeam.value?.parse();
}

let cursorPos = 0;

function onBlur() {
  cursorPos = textArea.value?.selectionEnd ?? 0;
}

async function insertAdd() {
  await insertString("+");
}

async function insertStudentName(studentName: string) {
  if (!currentTeam.value) return;
  const before = currentTeam.value?.text.slice(0, cursorPos);
  const lastIndexOfArrow = before.lastIndexOf("→");
  const used = split(lastIndexOfArrow === -1 ? before : before.slice(lastIndexOfArrow), "+").length;
  console.log(before, Boolean(before),used)
  if (before && !before.endsWith("→ ") && !before.endsWith("(")!) {
    if(before.endsWith("+")){
      await insertString(`${studentName}+`)      
    } else {
      if (used === 3 ) await insertString(`+${studentName}() → `, studentName.length + 2);
      else await insertString(`+${studentName}`)      
    }
  } else await insertString(`${studentName}`)
}

async function insertArrow() {
  await insertString("() → ", 1);
}

async function insertString(str: string, offset?: number) {
  document.execCommand("insertText", false, str);
  await nextTick();
  textArea.value?.focus();
  const selectionEnd = cursorPos + (offset ?? str.length);
  textArea.value?.setSelectionRange(selectionEnd, selectionEnd);
  cursorPos = selectionEnd;
}
</script>

<template>
  <Splitter v-if="currentTeam">
    <SplitterPanel class="flex flex-col p-3 bg-slate-900 gap-2">
      <div class="flex items-center gap-2 bg-[#FFFFFF60] p-2 rounded-lg">
        <Button
          v-for="(_, index) in battle.teams"
          @click="currentTeamIndex = index"
          :label="`${index + 1}`"
          class="w-10"
          :severity="currentTeamIndex === index ? undefined : 'secondary'"
        />
        <div class="flex-1" />
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
      <textarea
        ref="textarea"
        @blur="onBlur"
        @click="onBlur"
        v-model="currentTeam.text"
        class="flex-1 !text-white !bg-slate-900 border-none outline-none"
        auto-resize
      />
      <StageSelector
        :team="currentTeam"
        @input:arrow="insertArrow"
        @input:add="insertAdd"
        @input:student="insertStudentName"
      />
    </SplitterPanel>
    <SplitterPanel>
      <DataList class="h-full">
        <template #content>
          <Stage
            v-for="(_, index) in currentTeam.stages"
            :team="currentTeam"
            :stage-id="index"
            class="ml-5"
          />
        </template>
      </DataList>
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
