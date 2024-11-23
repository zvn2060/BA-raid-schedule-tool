<script setup lang="ts">

const { battle } = storeToRefs(useBattleStore());
const router = useRouter();
const currentTeamIndex = ref(0);
const currentTeam = computed(() =>
  battle.value.teams.at(currentTeamIndex.value)
);
if (!currentTeam.value) router.replace("/strategy/pick");

</script>

<template>
  <Tabs value="3">
    <TabList>
      <Tab value="0">資訊欄</Tab>
      <Tab value="1">影片封面</Tab>
      <Tab value="2">網站隊伍</Tab>
      <Tab value="3">圖片軸</Tab>
    </TabList>
    <TabPanels class="flex-1 min-h-0 !p-0">
      <TabPanel value="0" class="h-full">
        <Description class="h-full" />
      </TabPanel>
      <TabPanel value="1" class="h-full">
        <VideoCover class="h-full" />
      </TabPanel>
      <TabPanel value="2" class="h-full">
        <Teams class="h-full" />
      </TabPanel>
      <TabPanel value="3" class="h-full">
        <ImageFlow class="h-full"/>
      </TabPanel>
    </TabPanels>
  </Tabs>
</template>

<style lang="scss">
.preview-container {
  @apply grid grid-cols-2  py-8 px-12 grid-flow-col gap-y-2 gap-x-12;
  grid-template-rows: repeat(4, max-content);
}
</style>
