<script setup lang="ts">
import { Team } from "../../libs/Battle";

defineProps<{ team: Omit<Team, ""> }>();
defineEmits<{ delete: []; edit: [] }>();
</script>

<template>
  <div class="grid grid-cols-[1fr_max-content] rounded-list-item gap-2">
    <div class="grid grid-cols-6 gap-2 p-2">
      <StudentAvatar v-for="student in team.members" :student="student" class="bg-surface-200" />
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
