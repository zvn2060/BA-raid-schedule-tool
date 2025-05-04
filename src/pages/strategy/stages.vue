<script setup lang="ts">
import { debounceFilter, pausableFilter } from "@vueuse/core";
import { split } from "lodash-es";

const battleStore = useBattleStore();
const { teams } = storeToRefs(battleStore);
const textArea = useTemplateRef("textarea");
const currentTeamIndex = ref(0);
const currentTeam = computed(() => teams.value[currentTeamIndex.value]);
const memberMap = useTeamMembers(currentTeam);
const auto = ref(false);
const pausableDebounceFilter = pausableFilter(debounceFilter(1000));

watch(
  auto,
  (value) => {
    if (value) pausableDebounceFilter.resume();
    else pausableDebounceFilter.pause();
  },
  { immediate: true },
);

watchWithFilter(
  () => currentTeam.value?.text,
  () => {
    triggerParse();
  },
  { eventFilter: pausableDebounceFilter.eventFilter },
);

function triggerParse() {
  // @ts-expect-error memberMap student will not undefined
  currentTeam.value?.parse(memberMap.value.data);
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
  if (before && !before.endsWith("→ ") && !before.endsWith("(")!) {
    if (before.endsWith("+")) {
      await insertString(`${studentName}+`);
    } else {
      if (used === 3) await insertString(`+${studentName}() → `, studentName.length + 2);
      else await insertString(`+${studentName}`);
    }
  } else await insertString(`${studentName}`);
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
  <!-- eslint-disable vue/valid-v-for -->
  <Splitter v-if="currentTeam">
    <SplitterPanel class="flex flex-col p-3 bg-slate-900 gap-2">
      <div class="flex items-center gap-2 bg-[#FFFFFF60] p-2 rounded-lg">
        <Button
          v-for="(_, index) in teams"
          :label="`${index + 1}`"
          class="w-10"
          :severity="currentTeamIndex === index ? undefined : 'secondary'"
          @click="currentTeamIndex = index"
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
        v-model="currentTeam.text"
        class="flex-1 text-white! bg-slate-900! border-none outline-hidden"
        auto-resize
        @blur="onBlur"
        @click="onBlur"
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
