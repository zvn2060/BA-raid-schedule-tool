<script setup lang="ts">
import type { MenuItem } from "primevue/menuitem";

const router = useRouter();
const store = useBattleStore();

onMounted(() => {
  const content = localStorage.getItem("battle");
  if (content) store.loadFromJsonFile(content);
});

useEventListener(window, "beforeunload", () => {
  localStorage.setItem("battle", JSON.stringify(store.battle.toObject()));
});

const topNavigations: MenuItem[] = [
  {
    label: "編排攻略",
    icon: "pi pi-map",
    command: () => {
      router.push("/strategy/pick");
    },
  },
  {
    label: "資料設定",
    icon: "pi pi-users",
    command: () => {
      router.push("/students");
    },
  },
];
</script>

<template>
  <Toast position="bottom-center" class="max-w-[80vw]" />
  <div class="h-dvh flex flex-col">
    <Menubar :model="topNavigations">
      <template #start>
        <img src="/favicon.svg" class="w-8 mr-2">
        <span class="text-lg font-bold">檔案軸工具</span>
      </template>
      <template #item="{ item, props, hasSubmenu }">
        <router-link
          v-if="item.route"
          v-slot="{ href, navigate }"
          :to="item.route"
          custom
        >
          <a
            v-ripple
            :href="href"
            v-bind="props.action"
            @click="navigate"
          >
            <span :class="item.icon" />
            <span>{{ item.label }}</span>
          </a>
        </router-link>
        <a
          v-else
          v-ripple
          :href="item.url"
          :target="item.target"
          v-bind="props.action"
        >
          <span :class="item.icon" />
          <span>{{ item.label }}</span>
          <span v-if="hasSubmenu" class="pi pi-fw pi-angle-down" />
        </a>
      </template>
    </Menubar>
    <div class="flex-1 min-h-0">
      <NuxtPage />
    </div>
  </div>
</template>
