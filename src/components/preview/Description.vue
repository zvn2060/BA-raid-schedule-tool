<script setup lang="ts">
const store = useBattleStore();
const { copied, copy } = useClipboard();
const description = await store.generateDescription();
function onCopyClick() {
  copy(description);
}
</script>

<template>
  <div class="overflow-y-auto relative">
    <Button
      rounded
      class="sticky! left-full mr-4 top-4"
      size="large"
      :label="copied ? '已複製' : '複製'"
      :icon="copied ? 'pi pi-check' : 'pi pi-copy'"
      @click="onCopyClick"
    />
    <div class="whitespace-pre-wrap px-4 py-2">
      {{ description }}
    </div>
  </div>
</template>

<style lang="scss"></style>
