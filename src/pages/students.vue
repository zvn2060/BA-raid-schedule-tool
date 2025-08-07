<script setup lang="ts">
import { range } from "lodash-es";
import type {
  ColumnProps,
  DataTableCellEditCompleteEvent,
  DataTableCellEditInitEvent,
  DataTableProps,
} from "primevue";
import type { Component } from "vue";
import Max from "~/assets/max.png";
import Stars from "~/components/data/Stars.vue";

const filter = ref({ name: "" });

const nameInput = ref("");
const toast = useToast();
const first = ref(0);
const rows = ref(20);
const debouncedFirst = useDebounce(first, 300);
const pagination = computed(() => ({
  first: debouncedFirst.value,
  itemPerPage: rows.value,
}));
const { students, total, update: updateProperty } = useSearchStudents(filter, pagination);
const { update } = updateStudentData();
const { upload } = uploadStudentAvatars();
const datatableConfig: DataTableProps = {
  scrollable: true,
  scrollHeight: "flex",
  paginator: true,
  lazy: true,
  editMode: "cell",
  pt: { header: { class: ["flex", "items-center", "gap-2"] } },
  rowClass(data) {
    if (!data.image) return "bg-red-50!";
  },
};

const starOptions = [
  "1 星",
  "2 星",
  "3 星",
  "4 星",
  "5 星",
  "專 1",
  "專 2",
  "專 3",
  "專 4",
];

const rowsPerPageOptions = computed(() =>
  (total.value ?? 0) > 50 ? [10, 20, 50, total.value!] : [10, 20, 50],
);

const uploadProgress = useFileDialog({
  accept: "text/csv",
  multiple: false,
});

uploadProgress.onChange((filelist) => {
  const file = filelist?.item(0);
  if (!file) return;
  update(file)
    .catch(e =>
      toast.add({
        summary: "資料錯誤",
        detail: e instanceof Error ? e.message : `${e}`,
        severity: "error",
        life: 5000,
      }),
    )
    .finally(() => {
      uploadProgress.reset();
    });
});

const uploadAvatar = useFileDialog({
  accept: "image/*",
  multiple: true,
});

uploadAvatar.onChange((filelist) => {
  if (!filelist) return;
  upload(Array.from(filelist));
});

function onCellEditComplete(event: DataTableCellEditCompleteEvent) {
  if (event.value === event.newValue) return;
  updateProperty({
    id: event.data.id,
    field: event.field,
    value: event.newValue,
  });
}

function onEnter(event: KeyboardEvent) {
  if (event.isComposing) return;
  filter.value.name = nameInput.value;
}

const rawLevelColumnProps: Array<
  {
    min: number;
    max: number;
    options?: string[];
    showMax?: boolean;
    component?: Component;
  } & ColumnProps
> = [
  {
    field: "star",
    min: 1,
    max: 9,
    header: "星等",
    bodyClass: "max-w-30",
    options: starOptions,
    component: Stars,
  },
  { field: "level", min: 1, max: 90, header: "等級" },
  { field: "kizuna", min: 1, max: 100, header: "羈絆" },
  { field: "weapon_level", min: 1, max: 50, header: "固有等級" },
  { field: "skill_ex", min: 1, max: 5, header: "EX" },
  { field: "skill_n", showMax: true, min: 1, max: 10, header: "技一" },
  { field: "skill_p", showMax: true, min: 1, max: 10, header: "技二" },
  { field: "skill_sub", showMax: true, min: 1, max: 10, header: "技三" },
  { field: "gear_1", min: 0, max: 10, header: "裝備一" },
  { field: "gear_2", min: 0, max: 10, header: "裝備二" },
  { field: "gear_3", min: 0, max: 10, header: "裝備三" },
  { field: "gear_unique", min: 1, max: 2, header: "愛用品" },
  { field: "release_hp", min: 0, max: 25, header: "生命" },
  { field: "release_atk", min: 0, max: 25, header: "攻擊" },
  { field: "release_heal", min: 0, max: 25, header: "治癒" },
];

const levelColumnsProps = rawLevelColumnProps.map(props => ({
  ...props,
  options:
    props.options?.map((it, index) => ({
      value: props.min + index,
      label: it,
    }))
    ?? range(props.min, props.max + 1).map(it => ({ value: it, label: it })),
}));

const editAliasesItem = ref();
const editAliasesDialogVisible = computed({
  get: () => editAliasesItem.value !== undefined,
  set: val => (editAliasesItem.value = val ? editAliasesItem.value : undefined),
});
function onCellEditInit(event: DataTableCellEditInitEvent) {
  if (event.field !== "aliases") return;
  editAliasesItem.value = {
    id: event.data.id,
    name: event.data.name,
    aliases: event.data.aliases,
  };
}

async function onEditAliasesDone() {
  await updateProperty({
    id: editAliasesItem.value.id,
    field: "aliases",
    value: editAliasesItem.value.aliases,
  });

  await updateProperty({
    id: editAliasesItem.value.id,
    field: "prefer_name",
    value: editAliasesItem.value.aliases.length ? editAliasesItem.value.aliases[0] : undefined,
  });

  editAliasesItem.value = undefined;
}
</script>

<template>
  <DataTable
    v-model:rows="rows"
    v-model:first="first"
    :value="students"
    v-bind="datatableConfig"
    :rows-per-page-options
    :total-records="total"
    @cell-edit-complete="onCellEditComplete"
    @cell-edit-init="onCellEditInit"
  >
    <template #header>
      <Dialog
        v-model:visible="editAliasesDialogVisible"
        :header="`編輯${editAliasesItem?.name}的別名`"
        :closable="false"
        dismissable-mask
        modal
      >
        <AutoComplete
          v-model="editAliasesItem.aliases"
          multiple
          fluid
          :typeahead="false"
          size="small"
        />
        <template #footer>
          <Button
            label="取消"
            severity="danger"
            @click="editAliasesDialogVisible = false"
          />
          <Button label="儲存" @click="onEditAliasesDone" />
        </template>
      </Dialog>
      <InputGroup class="max-w-[300px]">
        <InputText v-model="nameInput" size="small" @keydown.enter="onEnter" />
        <Button size="small" label="搜尋" @click="filter.name = nameInput">
          <template #icon>
            <Icon name="mdi:keyboard-return" />
          </template>
        </Button>
      </InputGroup>
      <div class="flex-1" />
      <Button
        label="上傳資料"
        size="small"
        icon="pi pi-upload"
        @click="uploadProgress.open()"
      />
      <Button
        label="上傳頭像"
        size="small"
        icon="pi pi-users"
        @click="uploadAvatar.open()"
      />
    </template>
    <Column field="id" body-class="p-0!" class="w-12!">
      <template #body="{ data }">
        <StudentAvatar :member="data.id" />
      </template>
    </Column>
    <Column field="name" header="名稱" />
    <Column field="aliases" header="別名">
      <template #body="{ data }">
        <div class="flex items-center gap-1">
          <span>{{ data.aliases[0] }}</span>
          <Badge
            v-if="data.aliases.length > 1"
            v-tooltip="data.aliases.join(', ')"
            severity="secondary"
          >
            {{ data.aliases.length }}
          </Badge>
        </div>
      </template>
      <template #editor="{ data }">
        <div class="flex items-center gap-1">
          <span>{{ data.aliases[0] }}</span>
          <Badge v-if="data.aliases.length > 1" severity="secondary">
            {{ data.aliases.length }}
          </Badge>
        </div>
      </template>
    </Column>
    <Column field="prefer_name" header="偏好別名">
      <template #editor="{ data }">
        <Select v-if="data.aliases?.length" v-model="data.prefer_name" :options="data.aliases" />
      </template>
    </Column>
    <!-- eslint-disable-next-line vue/valid-v-for -->
    <Column
      v-for="{
        min,
        max,
        options,
        showMax,
        component,
        bodyClass,
        ...columnProps
      } of levelColumnsProps"
      v-bind="columnProps"
      :body-class="bodyClass ?? 'min-w-8 max-w-10'"
    >
      <template #body="{ data, field }">
        <Component
          :is="component"
          v-if="component"

          v-bind="{ [field as string]: data[field as string] }"
        />
        <div v-else class="flex items-center">
          <img
            v-if="showMax && data[field as string] === max"
            alt="level"
            :src="Max"
            class="w-8"
          >
          <span v-else>{{ data[field as string] }}</span>
        </div>
      </template>
      <template #editor="{ data, field }">
        <Fluid class="-my-3">
          <InputNumber
            v-if="max - min > 10"
            v-model="data[field]"
            :min="min"
            :max="max"
            size="small"
          />
          <Select
            v-else
            v-model="data[field]"
            size="small"
            :options="options"
            option-value="value"
            option-label="label"
          />
        </Fluid>
      </template>
    </Column>
  </DataTable>
</template>
