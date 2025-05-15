<script setup lang="ts">
import TempVar from "vue-temp-var";

const { team, studentMap } = defineProps<{ team: Team; studentMap: StudentMap }>();
</script>

<template>
  <div
    v-for="(member, index) in team.members"
    :key="index"
    class="flex gap-3 rounded-sm pr-2 overflow-hidden h-fit"
    :class="getMemberBg(team.struture, member, index)"
  >
    <StudentAvatar :member="member" class="w-24 bg-surface-300" />
    <TempVar v-if="member" v-slot="{ student }" :define="{ student: studentMap.get(member)! }">
      <div class="flex-1 grid px-1 py-2 gap-2 grid-rows-[min-content_1fr]">
        <div class="flex items-center gap-2">
          <span class="font-bold text-lg">{{ student.name }}</span>
          <Stars :star="student.star" />
          <span class="font-bold">LV.{{ student.level }}</span>
          <span v-if="student.weapon_level">
            固有武器：{{ student.weapon_level }}
          </span>
          <span>
            <i class="pi pi-heart-fill text-pink-300" />
            {{ student.kizuna }}</span>
        </div>
        <div class="flex gap-2">
          <span>
            <b>技能：</b>
            {{ student.skill_ex }} {{ student.skill_n }} {{ student.skill_p }}
            {{ student.skill_sub }}
          </span>
          <span class="flex gap-1">
            <b>裝備：</b>
            <span>T{{ student.gear_1 }}</span>
            <span>T{{ student.gear_2 }}</span>
            <span>T{{ student.gear_3 }}</span>
            <span v-if="student.gear_unique">愛用品 T{{ student.gear_unique }}</span>
          </span>
          <span class="flex gap-1">
            <span v-if="student.release_hp">生命：Lv.{{ student.release_hp }}</span>
            <span v-if="student.release_atk">攻擊：Lv.{{ student.release_atk }}</span>
            <span v-if="student.release_heal">治癒：Lv.{{ student.release_heal }}</span>
          </span>
        </div>
      </div>
      <Button
        icon="pi pi-trash"
        text
        severity="danger"
        @click="team.removeMember(member)"
      />
    </TempVar>
  </div>
</template>
