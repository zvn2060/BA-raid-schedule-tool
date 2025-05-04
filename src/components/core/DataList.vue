<script setup lang="ts">
defineProps<{ mirrorY?: boolean; blocked?: boolean }>();
</script>

<template>
  <div class="flex flex-col">
    <div v-if="$slots['header']" class="text-2xl flex items-center font-bold px-4 h-16">
      <slot name="header" />
    </div>
    <div
      class="overflow-y-auto min-h-0 flex-1 mb-2"
      :class="{ 'datalist-mirrow-y': mirrorY }"
    >
      <BlockUI class="flex flex-col gap-2" :blocked>
        <slot name="content" />
      </BlockUI>
    </div>
  </div>
</template>

<style lang="scss">
.datalist-mirrow-y {
  direction: rtl;
  > div {
    direction: ltr;
  }
}
</style>
