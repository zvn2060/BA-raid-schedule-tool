<script setup lang="ts">
const store = useBattleStore();
const { battle } = storeToRefs(store);
const { copied, copy } = useClipboard();
function onCopyClick() {
  copy(battle.value.description);
}
</script>

<template>
  <div class="overflow-y-auto relative">
    <Button
      rounded
      class="!sticky left-full mr-4 top-4"
      size="large"
      :label="copied ? '已複製' : '複製'"
      :icon="copied ? 'pi pi-check' : 'pi pi-copy'"
      @click="onCopyClick"
    />
    <div class="whitespace-pre-wrap px-4 py-2">
      {{ battle.description }}
    </div>
  </div>
</template>

<style lang="scss"></style>
