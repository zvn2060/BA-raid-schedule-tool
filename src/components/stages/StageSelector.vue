<script setup lang="ts">
const { team, studentMap } = defineProps<{ team: Team; studentMap: StudentMap }>();
const emit = defineEmits<{
  "input:add": [];
  "input:arrow": [];
  "input:student": [string];
}>();

const keyNum = new Map([
  ["1", 0],
  ["2", 1],
  ["3", 2],
  ["4", 3],
  ["5", 4],
  ["6", 5],
  ["7", 6],
  ["8", 7],
  ["9", 8],
  ["0", 9],
]);

onKeyStroke((e) => {
  if (!e.altKey) return;
  if (e.key === "q") return emit("input:add");
  if (e.key === "w") return emit("input:arrow");
  const index = keyNum.get(e.key);
  if (index === undefined || index >= team.members.length) return;
  const member = team.members[index];
  if (!member) return;
  const student = studentMap.get(member);
  if (student) emit("input:student", student.prefer_name ?? student.name);
});

function onMemberClick(member: Member) {
  if (!member) return;
  const student = studentMap.get(member);
  if (!student) return;
  emit("input:student", `${student.prefer_name ?? student.name}`);
}
</script>

<template>
  <div class="overflow-x-auto -m-3 bg-[#00000040] pt-2">
    <div class="flex w-fit gap-2 items-center px-2">
      <Button icon="pi pi-plus" rounded @click="$emit('input:add')" />
      <Button icon="pi pi-arrow-right" rounded @click="$emit('input:arrow')" />
      <!-- eslint-disable-next-line vue/valid-v-for  -->
      <StudentAvatar
        v-for="member in team.members"
        class="w-20 cursor-pointer"
        :member="member"
        @click="onMemberClick(member)"
      />
    </div>
  </div>
</template>
