<script setup lang="ts">
defineProps<{ team: Public<Team> }>();
defineEmits<{ delete: []; edit: [] }>();

function squadToBackground(member: Member) {
  return member
    ? [member.squad === "striker" ? "bg-red-100" : "bg-blue-100"]
    : ["bg-surface-200"];
}
</script>

<template>
  <div class="grid grid-cols-[1fr_max-content] rounded-list-item gap-2">
    <div class="grid gap-2 p-2 items-center" :class="[team.struture === 'normal' ? 'grid-cols-6' : 'grid-cols-10']">
      <StudentAvatar
        v-for="member in team.members"
        :key="member?.id"
        :student="member"
        :class="squadToBackground(member)"
      />
    </div>
    <div class="flex flex-col items-center justify-center p-2 border-l gap-2">
      <Button
        icon="pi pi-pencil"
        text
        rounded
        raised
        @click="$emit('edit')"
      />
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
</style>
