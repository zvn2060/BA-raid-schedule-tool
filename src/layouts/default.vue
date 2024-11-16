<script setup lang="ts">
import { TransitionFade } from "@morev/vue-transitions";
</script>

<template>
  <div class="grid grid-rows-[min-content_1fr] h-full">
    <div class="bg-primary text-surface-0 p-2 flex items-center gap-2">
      <img src="/favicon.svg" class="w-8" />
      <span class="text-lg font-bold">檔案軸工具</span>
    </div>
    <div class="overflow-y-auto">
      <RouterView v-slot="{ Component }">
        <TransitionFade>
          <KeepAlive>
            <Component :is="Component" />
          </KeepAlive>
        </TransitionFade>
      </RouterView>
    </div>
  </div>
</template>
