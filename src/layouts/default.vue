<script setup lang="ts">
import { TransitionFade } from "@morev/vue-transitions";
</script>

<template>
  <div class="grid grid-rows-[min-content_1fr] h-full">
    <div>h</div>
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
