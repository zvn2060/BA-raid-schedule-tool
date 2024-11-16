<script setup lang="ts">
import { groupBy, mapValues } from "lodash-es";
import uniqolor from "uniqolor";

const { students } = useStudents();
const flowStore = useFlowStore();
const { flow } = storeToRefs(flowStore);
const items = computed(() => groupBy(students.value, (it) => it.School));
const schoolStyles = computed(() => {
  return mapValues(items.value, (_, school) => {
    const { color, isLight } = uniqolor(school, { lightness: [90] });
    return { backgroundColor: color, color: isLight ? "black" : "white" };
  });
});
</script>

<template>
  <Splitter>
    <SplitterPanel class="flex flex-col">
      <div class="text-2xl font-bold p-2 text-end">{{ flow.members.size }} 人</div>
      <div class="overflow-y-auto flex-1 min-h-0 pb-2 px-2" style="direction: rtl">
        <div class="flex flex-col gap-2" style="direction: ltr">
          <div
            v-for="[studentId, name] in flow.members.entries()"
            class="bg-surface-100 flex items-center gap-3 rounded pr-2 overflow-hidden h-fit"
          >
            <StudentAvatar
              :student-id="studentId"
              class="w-24 bg-surface-300"
            />
            <InputText
              class="flex-1"
              :model-value="name"
              @update:model-value="flow.renameMember(studentId, $event)"
            />
            <Button
              icon="pi pi-trash"
              text
              severity="danger"
              @click="flow.removeMember(studentId)"
            />
          </div>
        </div>
      </div>
    </SplitterPanel>
    <SplitterPanel class="!overflow-y-auto">
      <div v-for="(students, school) in items">
        <div :style="schoolStyles[school]" class="school-container">
          <div class="col-span-full font-bold text-2xl">
            {{ school }}
          </div>
          <div
            v-for="student in students"
            @click="flow.toogleMember(student)"
            class="student-container"
            :class="{ selected: flow.members.has(student.Id) }"
          >
            <StudentAvatar :student-id="student.Id" class="icon" />
            <span class="text-center font-bold py-1">{{ student.Name }}</span>
          </div>
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
