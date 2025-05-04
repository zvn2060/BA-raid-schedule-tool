<script setup lang="ts">
const router = useRouter();
const { teams } = storeToRefs(useBattleStore());
if (!teams.value.length) router.replace("/strategy/pick");
</script>

<template>
  <Tabs value="0">
    <TabList>
      <Tab value="0">資訊欄</Tab>
      <Tab value="1">影片封面</Tab>
      <Tab value="2">網站隊伍</Tab>
      <Tab value="3">圖片軸</Tab>
    </TabList>
    <TabPanels class="flex-1 min-h-0 p-0!">
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
        <ImageFlow class="h-full" />
      </TabPanel>
    </TabPanels>
  </Tabs>
</template>
