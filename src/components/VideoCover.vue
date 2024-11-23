<script setup lang="ts">
const store = useBattleStore();
const { battle } = storeToRefs(store);

const titleFontSize = ref("104px");
const titleStyle = computed(() => {
  switch (battle.value.mode) {
    case BattleEvent.Raid:
      return { "--tst-text-stroke-color": "#0088FC" };
    case BattleEvent.Elimination:
      return { "--tst-text-stroke-color": "#E6212A" };
    case BattleEvent.Test:
      return { "--tst-text-stroke-color": "#FF914D" };
    case BattleEvent.Unrestrict:
      return { "--tst-text-stroke-color": "#808080" };
  }
});
const teamArrayPosition = computed(() => {
  if (battle.value.teams.length <= 2) return ["bottom-0"];
  const classes = [];
  switch (battle.value.teams.length) {
    case 3:
      classes.push("top-[310px]");
      break;
    case 4:
      classes.push("top-[200px]");
      break;
  }

  classes.push(
    battle.value.mode === BattleEvent.Test ? "right-[30px]" : "left-[20px]"
  );

  return classes;
});
</script>

<template>
  <div class="flex">
    <div
      class="w-fit min-w-[15rem] shadow-xl bg-surface-50 p-2 flex flex-col gap-2"
    >
      <Message> 請更改標題以更新註解字體大小 </Message>
      <InputText v-model="battle.title" />
      <InputText v-model="battle.comment" />
      <InputText v-model="battle.score" />
    </div>
    <CssImageEditor
      :width="1920"
      :height="1280"
      class="flex-1 font-[wanhanzon]"
    >
      <div class="w-full h-[180px] bg-black relative">
        <AutoText
          v-model="titleFontSize"
          :width="1800"
          :height="160"
          text-class="video-font-stroke"
          :style="titleStyle"
          :text="battle.title"
          class="justify-center !items-center absolute top-[10px] bottom-[10px] left-[60px] right-[60px]"
        />
      </div>
      <span
        v-if="battle.teams.length <= 2"
        class="video-font-stroke text-stroke-[#ff3131] absolute top-[210px] bottom-[210px] left-[60px] right-[60px] break-all"
        :style="{ fontSize: titleFontSize }"
      >
        {{ battle.comment }}
      </span>
      <div
        v-if="battle.teams.length === 1"
        :style="{
          width: `${battle.mode === BattleEvent.Unrestrict ? 360 : 960}px`,
        }"
        class="bottom-0 bg-black right-0 relative h-[180px]"
      >
        <AutoText
          :width="battle.mode === BattleEvent.Unrestrict ? 240 : 840"
          :height="160"
          :text="battle.score"
          text-class="video-font-stroke"
          :style="titleStyle"
          class="justify-center !items-center absolute top-[10px] bottom-[10px] left-[60px] right-[60px]"
        />
      </div>
      <TeamArray :class="teamArrayPosition" />
    </CssImageEditor>
  </div>
</template>

<style lang="scss">
.video-font-stroke {
  @apply text-stroke  text-stroke-[12px] text-white;
  paint-order: stroke;
}
</style>
