<script setup lang="ts">
import { TransitionFade } from "@morev/vue-transitions";
import download from "downloadjs";
import { useToast } from "primevue";

const router = useRouter();
const route = useRoute();
const step = computed(() => {
  if (route.name === "/strategy/preview") return "3";
  else if (route.name === "/strategy/stages") return "2";
  else return "1";
});

const battleStore = useBattleStore();

const { battle } = storeToRefs(battleStore);
const { open, onChange, reset } = useFileDialog({
  accept: "application/json",
  multiple: false,
});
const toast = useToast();

function handleLoadFile(content: string) {
  battleStore
    .loadFromJsonFile(content)
    .catch((e) =>
      toast.add({
        summary: "錯誤",
        detail: (e as Error).message,
        severity: "error",
        life: 5000,
      })
    )
    .finally(() => {
      reset();
    });
}

onChange(async (filelist) => {
  const file = filelist?.item(0);
  if (!file) return;
  handleLoadFile(await file.text());
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
  download(
    JSON.stringify(battle.value.toObject(), null, 2),
    `${battle.value.name}.json`
  );
}

async function onLoadSampleClick() {
  const data = await import("../assets/sample.json");
  handleLoadFile(JSON.stringify(data.default));
}
</script>

<template>
  <div class="h-full flex flex-col">
    <Toolbar>
      <template #start>
        <InputText v-model="battle.name" />
        <BattleModeDropdown v-model="battle.mode" class="ml-2" />
      </template>
      <template #center>
        <Stepper :value="step" class="w-[400px]" @update:value="onStepChange">
          <StepList>
            <Step value="1">編隊</Step>
            <Step value="2" :disabled="battle.teams.length === 0">寫軸</Step>
            <Step value="3" :disabled="battle.teams.length === 0">輸出</Step>
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
    <div class="flex-1 min-h-0">
      <RouterView v-slot="{ Component }">
        <TransitionFade group>
          <Component :is="Component" class="h-full" />
        </TransitionFade>
      </RouterView>
    </div>
  </div>
</template>
