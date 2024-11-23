<script setup lang="ts">
const editor = useTemplateRef("editor");
const store = useBattleStore();
const { battle } = storeToRefs(store);
const { url } = useVideoBackground();
const titleFontSize = ref("104px");
const titleStyle = computed(() => {
  switch (battle.value.mode) {
    case BattleMode.Raid:
      return { "--tst-text-stroke-color": "#0088FC" };
    case BattleMode.Elimination:
      return { "--tst-text-stroke-color": "#E6212A" };
    case BattleMode.Test:
      return { "--tst-text-stroke-color": "#FF914D" };
    case BattleMode.Unrestrict:
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
    battle.value.mode === BattleMode.Test ? "right-[30px]" : "left-[20px]"
  );

  return classes;
});

function onDownloadClick() {
  if (!editor.value) return;
  editor.value.export(battle.value.name);
}
</script>

<template>
  <div class="flex">
    <div class="w-fit min-w-[15rem] shadow-xl px-4 py-2 flex flex-col gap-2">
      <div>
        <label class="font-bold block mb-1">標題</label>
        <InputText v-model="battle.title" class="w-full" />
      </div>
      <div>
        <label class="font-bold block mb-1">註解</label>
        <InputText v-model="battle.comment" class="w-full" />
      </div>
      <div>
        <label class="font-bold block mb-1">分數</label>
        <InputText v-model="battle.score" class="w-full" />
      </div>
      <Message>請更改標題以更新註解字體大小</Message>
      <Button
        rounded
        class="self-center my-auto"
        size="large"
        label="下載"
        icon="pi pi-download"
        @click="onDownloadClick"
      />
    </div>
    <ImageEditor
      :width="1920"
      :height="1080"
      ref="editor"
      class="flex-1 font-[wanhanzon] border-2"
    >
      <img v-if="url" :src="url" class="w-full h-full object-contain" />
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
          width: `${battle.mode === BattleMode.Unrestrict ? 360 : 960}px`,
        }"
        class="bottom-0 bg-black right-0 relative h-[180px]"
      >
        <AutoText
          :width="battle.mode === BattleMode.Unrestrict ? 240 : 840"
          :height="160"
          :text="battle.score"
          text-class="video-font-stroke"
          :style="titleStyle"
          class="justify-center !items-center absolute top-[10px] bottom-[10px] left-[60px] right-[60px]"
        />
      </div>
      <TeamArray :class="teamArrayPosition" />
    </ImageEditor>
  </div>
</template>

<style lang="scss">
.video-font-stroke {
  @apply text-stroke  text-stroke-[12px] text-white;
  paint-order: stroke;
}
</style>
