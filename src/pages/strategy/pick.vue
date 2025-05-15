<script setup lang="ts">
import { has, set } from "lodash-es";
import type { MenuItem } from "primevue/menuitem";

const filter = ref({ name: "" });
const nameInput = ref("");
const onNameInput = useDebounceFn((val) => {
  filter.value.name = val;
}, 600);

const { students } = useSearchStudents(filter);
const battleStore = useBattleStore();
const { teams, studentMap } = storeToRefs(battleStore);
const studentsBySchoolAndSquad = computed(() => {
  const groups: Record<string, Record<Student["squad"], Student[]>> = {};
  students.value?.forEach((student) => {
    if (!has(groups, [student.school, student.squad]))
      set(groups, [student.school, student.squad], []);
    groups[student.school][student.squad].push(student);
  });
  return groups;
});

const currentTeamIndex = ref(-1);
const currentTeam = computed(() => teams.value[currentTeamIndex.value] as Team);
const breakcrumbItems = computed(() =>
  currentTeamIndex.value === -1
    ? []
    : [{ label: `第 ${currentTeamIndex.value + 1} 隊`, class: ["text-sm"] }],
);

const homeItem: MenuItem = {
  icon: "pi pi-users",
  command: () => {
    currentTeamIndex.value = -1;
  },
};
</script>

<template>
  <!-- eslint-disable vue/require-v-for-key -->
  <Splitter>
    <SplitterPanel>
      <DataList class="h-full" mirror-y list-class="gap-2">
        <template #header>
          <Breadcrumb :home="homeItem" :model="breakcrumbItems" />
          <Button
            v-if="!currentTeam"
            icon="pi pi-plus"
            class="ml-auto"
            text
            rounded
            @click="battleStore.addTeam()"
          />
        </template>
        <template #content>
          <template v-if="currentTeam">
            <MemberList :team="currentTeam" :student-map />
          </template>
          <template v-else>
            <TeamListItem
              v-for="(team, index) in teams"
              :key="index"
              :team="team"
              @delete="battleStore.deleteTeam(index)"
              @edit="currentTeamIndex = index"
            />
          </template>
        </template>
      </DataList>
    </SplitterPanel>
    <SplitterPanel :min-size="15">
      <DataList class="h-full" :blocked="!currentTeam">
        <template #header>
          <InputText
            :model-value="nameInput"
            size="small"
            class="ml-auto"
            @update:model-value="onNameInput"
          />
        </template>
        <template #content>
          <div v-for="(studentsBySquad, school) in studentsBySchoolAndSquad" class="school-container bg-slate-600 border-b border-b-gray-400">
            <div class="text-white row-span-2 font-bold text-2xl px-2 py-1" style="writing-mode: vertical-lr;">
              <span class="sticky z-10 top-2">{{ school }}</span>
            </div>
            <div v-if="studentsBySquad['striker']" class="bg-striker border-b">
              <div
                v-for="student in studentsBySquad['striker']"
                class="student-container "
                :class="{ selected: currentTeam?.hasMember(student.id) }"
                @click="currentTeam?.toogleMember(student)"
              >
                <StudentAvatar :member="student.id" class="icon" />
                <span class="text-center font-bold py-1 select-none">
                  {{ student.name }}
                </span>
              </div>
            </div>
            <div v-if="studentsBySquad['special']" class="bg-special col-start-2">
              <div
                v-for="student in studentsBySquad['special']"
                class="student-container"
                :class="{ selected: currentTeam?.hasMember(student.id) }"
                @click="currentTeam?.toogleMember(student)"
              >
                <StudentAvatar :member="student.id" class="icon" />
                <span class="text-center font-bold py-1 select-none">
                  {{ student.name }}
                </span>
              </div>
            </div>
          </div>
        </template>
      </DataList>
    </SplitterPanel>
  </Splitter>
</template>

<style>
@reference "tailwindcss";
@reference "tailwindcss-primeui";

.school-container {
  @apply grid grid-cols-[max-content_1fr];
}

.school-container > div:not(:first-child) {
  @apply grid grid-cols-[repeat(auto-fill,minmax(105px,1fr))] gap-2 p-2;
}

.student-container {
  @apply flex flex-col rounded-lg overflow-hidden bg-surface-100 shadow-lg hover:shadow-xl cursor-pointer;
}

.student-container > .icon {
  @apply bg-surface-300;
}

.student-container.selected {
  @apply bg-yellow-100;
}

.student-container.selected > .icon {
  @apply bg-yellow-200;
}
</style>
