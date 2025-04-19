<script setup lang="ts">
import { range } from "lodash-es";
import Max from "~/assets/max.png";

const props = withDefaults(
  defineProps<{
    field: string;
    min: number;
    max: number;
    options?: string[];
    showMax?: boolean;
    bodyClass?: string;
  }>(),
  { bodyClass: "min-w-8 max-w-10", showMax: false }
);
const transformedOptions = computed(
  () =>
    props.options?.map((it, index) => ({
      value: props.min + index,
      label: it,
    })) ??
    range(props.min, props.max + 1).map((it) => ({ value: it, label: it }))
);

const shouldUseInput = computed(() => props.max - props.min > 10);
</script>

<template>
  <Column :field :body-class>
    <template #body="slotProps">
      <slot v-if="$slots['body']" name="body" v-bind="slotProps" />
      <div v-else class="flex items-center">
        <img
          v-if="showMax && slotProps.data[slotProps.field] === max"
          alt="level"
          :src="Max"
          class="w-8"
        />
        <span v-else>{{ slotProps.data[slotProps.field] }}</span>
      </div>
    </template>
    <template #editor="{ data, field }">
      <Fluid class="-my-3">
        <InputNumber
          v-if="shouldUseInput"
          v-model="data[field]"
          :min
          :max
          size="small"
        />
        <Select
          v-else
          v-model="data[field]"
          size="small"
          :options="transformedOptions"
          option-value="value"
          option-label="label"
        />
      </Fluid>
    </template>
  </Column>
</template>
