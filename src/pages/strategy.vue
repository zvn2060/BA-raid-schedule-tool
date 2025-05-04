<script setup lang="ts">
import { keyBy, mapValues } from "lodash-es";
import { useToast } from "primevue";
import type { RouteNamedMap } from "vue-router/auto-routes";

const router = useRouter();
const battleStore = useBattleStore();
const { battle, teams } = storeToRefs(battleStore);

const route = useRoute();
const toast = useToast();
const stepRoutes: Record<string, { name: keyof RouteNamedMap; label: string }> = {
  1: { name: "strategy-pick", label: "編隊" },
  2: { name: "strategy-stages", label: "寫軸" },
  3: { name: "strategy-preview", label: "輸出" },
};

const reverseStepRoutes = mapValues(
  keyBy(Object.entries(stepRoutes), it => it[1].name),
  it => it[0],
);

const step = computed({
  get: () => reverseStepRoutes[route.name as string],
  set: val => router.replace({ name: stepRoutes[val].name }),
});

const splitButtonActions = [{ label: "匯出 JSON", command: onExportJsonClick }];
const { open, onChange, reset } = useFileDialog({
  accept: "application/json",
  multiple: false,
});

function handleLoadFile(content: string) {
  battleStore
    .loadFromJsonFile(content)
    .catch(e =>
      toast.add({
        summary: "錯誤",
        detail: (e as Error).message,
        severity: "error",
        life: 5000,
      }),
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

function onExportXmlClick() {
  battleStore.exportProject("xml");
}

function onExportJsonClick() {
  battleStore.exportProject("json");
}

async function onLoadSampleClick() {
  const data = await import("@/assets/sample.json");
  handleLoadFile(JSON.stringify(data.default));
}
</script>

<template>
  <div class="h-full flex flex-col">
    <Toolbar :pt="{ center: { class: ['flex-1', 'flex', 'justify-center'] } }">
      <template #start>
        <InputText v-model="battle.name" />
        <BattleModeDropdown v-model="battle.mode" class="ml-2" />
      </template>
      <template #center>
        <Stepper v-model:value="step" class="w-full max-w-[400px] mx-5">
          <StepList>
            <Step
              v-for="[key, val] in Object.entries(stepRoutes)"
              :key="key"
              :value="key"
              :disabled="teams.length === 0"
            >
              {{ val.label }}
            </Step>
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
        <SplitButton
          :model="splitButtonActions"
          @click="onExportXmlClick"
        >
          <span class="flex items-center font-bold gap-2">
            <Icon name="file-icons:adobe-premiere" class="text-xl" />
            <span>匯出專案</span>
          </span>
        </SplitButton>
      </template>
    </Toolbar>
    <div class="flex-1 min-h-0">
      <NuxtPage class="h-full" />
    </div>
  </div>
</template>
