<script setup lang="ts">
import { TransitionFade } from "@morev/vue-transitions";
import download from "downloadjs";

const router = useRouter();
const route = useRoute();

const step = computed(() => {
  if (route.name === "/strategy/preview") return "3";
  else if (route.name === "/strategy/stages") return "2";
  else return "1";
});

const { battle } = storeToRefs(useBattleStore());
const { open, onChange, reset } = useFileDialog({
  accept: "application/json",
  multiple: false,
});

onChange(async (filelist) => {
  const file = filelist?.item(0);
  if (!file) return;
  try {
    const json = JSON.parse(await file.text());
    battle.value = new Battle(json);
  } catch (e) {
    console.error(e);
  } finally {
    reset();
  }
});
function onStepChange(value: "1" | "2" | "3") {
  switch (value) {
    case "1":
      return router.replace("/strategy/pick");
    case "2":
      return router.replace("/strategy/stages");
    case "3":
      return router.replace("/strategy/preview");
  }
}

function onExportClick() {
  download(battle.value.serialize(), `${battle.value.name}.json`);
}

async function onLoadSampleClick() {
  const data = await import("../assets/sample.json");
  battle.value = new Battle(data.default);
}
</script>

<template>
  <div class="h-full grid grid-rows-[min-content_1fr]">
    <Toolbar>
      <template #start>
        <InputText v-model="battle.name" />
      </template>
      <template #center>
        <Stepper :value="step" class="w-[400px]" @update:value="onStepChange">
          <StepList>
            <Step value="1">選人</Step>
            <Step value="2">寫軸</Step>
            <Step value="3">輸出</Step>
          </StepList>
        </Stepper>
      </template>
      <template #end>
        <Button
          label="Demo"
          severity="secondary"
          class="mr-2"
          @click="onLoadSampleClick"
        />
        <Button
          label="匯入"
          icon="pi pi-file-import"
          severity="secondary"
          class="mr-2"
          @click="open()"
        />
        <Button label="匯出" icon="pi pi-file-export" @click="onExportClick" />
      </template>
    </Toolbar>
    <div class="min-h-0">
      <RouterView v-slot="{ Component }">
        <TransitionFade group>
          <Component :is="Component" class="h-full" />
        </TransitionFade>
      </RouterView>
    </div>
  </div>
</template>
