<script setup lang="ts">
import { autoTextSize } from "auto-text-size";

const props = defineProps<{
  width: number;
  height: number;
  text: string;
  textClass: string;
  mode?: "oneline" | "multiline" | "box" | "boxoneline" 
}>();

const container = useTemplateRef("container");
const textEl = useTemplateRef("text");
let updateSize: ReturnType<typeof autoTextSize>;

const fontSize = defineModel();

onMounted(() => {
  if (!textEl.value || !container.value) return;
  updateSize = autoTextSize({
    innerEl: textEl.value,
    containerEl: container.value,
    mode: props.mode,
  });
});

onUnmounted(() => {
  updateSize?.disconnect();
});

watch(
  () => props.text,
  () => {
    if (!updateSize) return;
    if (textEl.value) fontSize.value = textEl.value.style.fontSize;
    updateSize();
  }
);
</script>

<template>
  <div ref="container" :style="{ width, height }">
    <div ref="text" :class="textClass">{{ text }}</div>
  </div>
</template>
