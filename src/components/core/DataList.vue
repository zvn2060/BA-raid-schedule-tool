<script setup lang="ts">
defineProps<{ mirrorY?: boolean; blocked?: boolean; listClass?: string }>();
</script>

<template>
  <div class="flex flex-col">
    <div v-if="$slots['header']" class="text-2xl flex items-center font-bold px-4 h-16">
      <slot name="header" />
    </div>
    <BlockUI class="min-h-0 flex-1" :blocked>
      <div class="overflow-y-auto mb-2 h-full" :class="{ 'datalist-mirrow-y': mirrorY }">
        <div class="flex flex-col h-fit" :class="listClass">
          <slot name="content" />
        </div>
      </div>
    </BlockUI>
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
