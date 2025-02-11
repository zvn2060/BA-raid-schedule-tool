<script setup lang="ts">
import { debounceFilter, pausableFilter } from "@vueuse/core";

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

async function insertStr(str: string) {
  if (!currentTeam.value) return;
  document.execCommand("insertText", false, str);
  await nextTick();
  textArea.value?.focus();
  textArea.value?.setSelectionRange(
    cursorPos + str.length,
    cursorPos + str.length
  );
}

async function insertParenthess() {
  if (!currentTeam.value) return;
  document.execCommand("insertText", false, "()");
  await nextTick();
  textArea.value?.focus();
  textArea.value?.setSelectionRange(cursorPos + 1, cursorPos + 1);
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
        v-model="currentTeam.text"
        class="flex-1 !text-white !bg-slate-900 border-none outline-none"
        auto-resize
      />
      <div class="overflow-x-auto -m-3 bg-[#00000040] pt-2">
        <div class="flex w-fit gap-2 items-center px-2">
          <Button icon="pi pi-plus" rounded @click="insertStr('+')" />
          <Button icon="pi pi-arrow-right" rounded @click="insertStr(' → ')" />
          <Button label="註" rounded @click="insertParenthess()" />
          <StudentAvatar
            v-for="member in currentTeam.members"
            class="w-20 cursor-pointer"
            :student="member"
            @click="member && insertStr(member.preferredName ?? member.name)"
          />
        </div>
      </div>
    </SplitterPanel>
    <SplitterPanel >
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
