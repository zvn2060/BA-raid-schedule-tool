<script setup lang="ts">
import type { Team } from "../../shared";

defineProps<{ team: Omit<Team, ""> }>();
defineEmits<{ delete: []; edit: [] }>();

function squadToBackground(member: Member) {
  if (member)
    return [member.squad === "striker" ? "bg-red-100" : "bg-blue-100"];
  return ["bg-surface-200"];
}
</script>

<template>
  <div class="grid grid-cols-[1fr_max-content] rounded-list-item gap-2">
    <div class="grid gap-2 p-2 team-list-item-content" :class="[team.struture]">
      <StudentAvatar
        v-for="member in team.members"
        :student="member"
        :class="squadToBackground(member)"
      />
    </div>
    <div class="flex flex-col items-center justify-center p-2 border-l gap-2">
      <Button icon="pi pi-pencil" text rounded @click="$emit('edit')" raised />
      <Button
        icon="pi pi-trash"
        text
        raised
        rounded
        severity="danger"
        @click="$emit('delete')"
      />
    </div>
  </div>
</template>

<style lang="scss">
.team-list-item-content {
  @apply items-center;
  &.normal {
    @apply grid-cols-6;
  }
  &.unrestrict {
    @apply grid-cols-10;
  }
}
</style>
