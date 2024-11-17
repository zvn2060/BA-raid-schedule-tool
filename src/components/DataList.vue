<script setup lang="ts">
defineProps<{ barYMirror?: boolean }>();
</script>

<template>
  <div class="flex flex-col">
    <div
      v-if="$slots['header']"
      class="text-2xl flex items-center font-bold p-2 h-16"
    >
      <slot name="header" />
    </div>
    <ScrollPanel
      class="overflow-y-auto flex-1 min-h-0 mb-2"
      :pt="{ barY: { class: [barYMirror ? 'left-0' : 'right-0'] } }"
    >
      <div class="flex flex-col gap-2 mx-1" :class="barYMirror ? 'ml-3' : 'mr-3'">
        <slot name="content" />
      </div>
    </ScrollPanel>
  </div>
</template>

<style lang="scss">
.datalist-content-wrapper.left {
  direction: rtl;
  > div {
    direction: ltr;
  }
}
</style>
