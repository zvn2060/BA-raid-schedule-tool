<script setup lang="ts">
import { groupBy, mapValues } from "lodash-es";
import type { MenuItem } from "primevue/menuitem";
import uniqolor from "uniqolor";

const filter = ref({ name: "" });

const nameInput = ref("");

watchDebounced(
  nameInput,
  (value) => { filter.value.name = value; },
  { debounce: 600 },
);
const { students } = useStudents(filter);
const battleStore = useBattleStore();
const { battle } = storeToRefs(battleStore);
const studentsBySchool = computed(() =>
  groupBy(students.value, it => it.school),
);
const schoolStyles = computed(() => {
  return mapValues(studentsBySchool.value, (_, school) => {
    const { color, isLight } = uniqolor(school, { lightness: [90] });
    return { backgroundColor: color, color: isLight ? "black" : "white" };
  });
});
const currentTeamIndex = ref(-1);
const currentTeam = computed(() => battle.value.teams[currentTeamIndex.value] as Team);
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
      <DataList class="h-full" mirror-y>
        <template #header>
          <Breadcrumb :home="homeItem" :model="breakcrumbItems" />
          <Button
            v-if="!currentTeam"
            icon="pi pi-plus"
            class="ml-auto"
            text
            rounded
            @click="battle.addTeam()"
          />
        </template>
        <template #content>
          <template v-if="currentTeam">
            <MemberList :team="currentTeam" />
          </template>
          <template v-else>
            <TeamListItem
              v-for="(team, index) in battle.teams"
              :key="index"
              :team="team"
              @delete="battle.deleteTeam(index)"
              @edit="currentTeamIndex = index"
            />
          </template>
        </template>
      </DataList>
    </SplitterPanel>
    <SplitterPanel :min-size="15">
      <DataList class="h-full" :blocked="!currentTeam">
        <template #header>
          <InputText v-model="nameInput" size="small" class="ml-auto" />
        </template>
        <template #content>
          <div v-for="(students, school) in studentsBySchool">
            <div :style="schoolStyles[school]" class="school-container">
              <div class="col-span-full font-bold text-2xl">
                {{ school }}
              </div>
              <div
                v-for="student in students"
                class="student-container"
                :class="{ selected: currentTeam?.hasMember(student.id) }"
                @click="currentTeam?.toogleMember(student)"
              >
                <StudentAvatar :student="student" class="icon" />
                <span class="text-center font-bold py-1 select-none">{{
                  student.name
                }}</span>
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
  @apply grid grid-cols-[repeat(auto-fit,minmax(105px,1fr))] gap-2 p-2 border-y border-black/20 ;
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
