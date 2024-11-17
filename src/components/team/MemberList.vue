<script setup lang="ts">
import { Team } from "../../libs/Battle";

defineProps<{ team: Omit<Team, ""> }>();
</script>

<template>
  <div
    v-for="(member) in team.members"
    class="bg-surface-100 flex items-center gap-3 rounded pr-2 overflow-hidden h-fit"
  >
    <StudentAvatar :student="member" class="w-24 bg-surface-300" />
    <div class="flex-1">
      <template v-if="member">
        <InputText class="flex-1" v-model="member.name" />
      </template>
    </div>
    <Button
      v-if="member"
      icon="pi pi-trash"
      text
      severity="danger"
      @click="team.removeMember(member.id)"
    />
  </div>
</template>
