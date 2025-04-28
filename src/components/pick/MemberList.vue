<script setup lang="ts">
defineProps<{ team: Public<Team> }>();

function squadToBackground(member: Member) {
  return member
    ? [member.squad === "striker" ? "bg-red-100" : "bg-blue-100"]
    : ["bg-surface-200"];
}
</script>

<template>
  <div
    v-for="member in team.members"
    :key="member?.id"
    class="flex gap-3 rounded-sm pr-2 overflow-hidden h-fit"
    :class="squadToBackground(member)"
  >
    <StudentAvatar :student="member" class="w-24 bg-surface-300" />
    <div class="flex-1 grid px-1 py-2 gap-2 grid-rows-[min-content_1fr]">
      <template v-if="member">
        <div class="flex items-center gap-2">
          <span class="font-bold text-lg">{{ member.name }}</span>
          <Stars :star="member.star" />
          <span class="font-bold">LV.{{ member.level }}</span>
          <span v-if="member.weapon_level">
            固有武器：{{ member.weapon_level }}
          </span>
          <span>
            <i class="pi pi-heart-fill text-pink-300" />
            {{ member.kizuna }}</span>
        </div>
        <div class="flex gap-2">
          <span>
            <b>技能：</b>
            {{ member.skill_ex }} {{ member.skill_n }} {{ member.skill_p }}
            {{ member.skill_sub }}
          </span>
          <span class="flex gap-1">
            <b>裝備：</b>
            <span>T{{ member.gear_1 }}</span>
            <span>T{{ member.gear_2 }}</span>
            <span>T{{ member.gear_3 }}</span>
            <span v-if="member.gear_unique">愛用品 T{{ member.gear_unique }}</span>
          </span>
          <span class="flex gap-1">
            <span v-if="member.release_hp">生命：Lv.{{ member.release_hp }}</span>
            <span v-if="member.release_atk">攻擊：Lv.{{ member.release_atk }}</span>
            <span v-if="member.release_heal">治癒：Lv.{{ member.release_heal }}</span>
          </span>
        </div>
      </template>
    </div>
    <div v-if="member" class="flex items-center gap-1">
      <span>使用名稱：</span>
      <Select v-model="member.preferredName" :default-value="member.name" :options="[member.name, ...member.aliases]" />
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
