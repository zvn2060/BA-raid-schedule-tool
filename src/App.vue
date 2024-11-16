<script setup lang="ts">
import { useToast } from "primevue";
import Toast from "primevue/toast";

const toast = useToast();

onErrorCaptured((error) => {
  toast.add({
    summary: "錯誤",
    detail: error.message,
    severity: "error",
    life: 5000,
  });
});
</script>

<template>
  <RouterView />
  <Toast position="bottom-center" class="max-w-[80vw]" />
</template>
