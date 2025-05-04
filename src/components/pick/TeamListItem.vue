<script setup lang="ts">
const { team } = defineProps<{ team: Team }>();
defineEmits<{ delete: []; edit: [] }>();
</script>

<template>
  <div class="grid grid-cols-[1fr_max-content] rounded-list-item gap-2">
    <div class="grid gap-2 p-2 items-center" :class="[team.struture === 'normal' ? 'grid-cols-6' : 'grid-cols-10']">
      <StudentAvatar
        v-for="(member, index) in team.members"
        :member="member"
        :class="getMemberBg(team.struture, member, index)"
      />
    </div>
    <div id="team-control">
      <div class="bg-green-700" @click="$emit('edit')">
        <i class="pi pi-pencil" />
      </div>
      <div class="bg-red-700" @click="$emit('delete')">
        <i class="pi pi-trash" />
      </div>
    </div>
  </div>
</template>

<style>
@reference "tailwindcss";
@reference "tailwindcss-primeui";

#team-control {
  @apply w-12 border-l grid grid-rows-[1fr_1fr] transition-[grid-template-rows];
}

#team-control > div {
  @apply flex items-center justify-center text-white overflow-hidden cursor-pointer;
}

#team-control:has( > div:first-child:hover){
  @apply grid-rows-[1fr_0fr];
}

#team-control:has( > div:last-child:hover){
  @apply grid-rows-[0fr_1fr];
}
</style>
