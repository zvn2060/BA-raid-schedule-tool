<script setup lang="ts">
import {
  DataTableCellEditCompleteEvent,
  DataTableProps,
  useToast
} from "primevue";
import { updateStudentData } from "../api/updateStudentData";

const filter = ref({ name: "" });

const nameInput = ref("");
const toast = useToast();

watchDebounced(
  nameInput,
  (value) => {
    filter.value.name = value;
  },
  { debounce: 600 }
);

const first = ref(0);
const rows = ref(20);
const debouncedFirst = useDebounce(first, 300);
const pagination = computed(() => ({
  first: debouncedFirst.value,
  itemPerPage: rows.value,
}));
const {
  students,
  total,
  update: updateProperty,
} = useStudents(filter, pagination);
const { update } = updateStudentData();
const datatableConfig: DataTableProps = {
  scrollable: true,
  scrollHeight: "flex",
  paginator: true,
  lazy: true,
  editMode: "cell",
  pt: { header: { class: ["flex", "items-center", "gap-2"] } },
};

const rowsPerPageOptions = computed(() =>
  (total.value ?? 0) > 50 ? [10, 20, 50, total.value!] : [10, 20, 50]
);

const { open, onChange, reset } = useFileDialog({
  accept: "text/csv",
  multiple: false,
});

function onCellEditComplete(event: DataTableCellEditCompleteEvent) {
  if (event.value === event.newValue) return;
  updateProperty({
    id: event.data.id,
    field: event.field,
    value: event.newValue,
  });
}

onChange((filelist) => {
  const file = filelist?.item(0);
  if (!file) return;
  update(file)
    .catch((e) =>
      toast.add({
        summary: "資料錯誤",
        detail: e instanceof Error ? e.message : `${e}`,
        severity: "error",
        life: 5000,
      })
    )
    .finally(() => {
      reset();
    });
});

const starOptions = [
  "1 星",
  "2 星",
  "3 星",
  "4 星",
  "5 星",
  "專 1",
  "專 2",
  "專 3",
];

</script>

<template>
  <DataTable
    v-model:rows="rows"
    v-model:first="first"
    :value="students"
    v-bind="datatableConfig"
    :rowsPerPageOptions
    :total-records="total"
    @cell-edit-complete="onCellEditComplete"
  >
    <template #header>
      <InputText v-model="nameInput" size="small" />
      <div class="flex-1" />
      <Button
        label="上傳資料"
        @click="open()"
        size="small"
        icon="pi pi-upload"
      />
    </template>
    <Column field="id" body-class="!p-0" class="!w-12">
      <template #body="{ data }">
        <StudentAvatar :student="data" />
      </template>
    </Column>
    <Column field="name" header="名稱" />
    <Column field="aliases" header="別名">
      <template #body="{ data }">
        <div class="flex items-center gap-1">
          <span>{{ data.aliases[0] }}</span>
          <Badge
            v-if="data.aliases.length > 1"
            severity="secondary"
            v-tooltip="data.aliases.join(', ')"
          >
            {{ data.aliases.length }}
          </Badge>
        </div>
      </template>
      <template
        #editor="{ data, field, editorCancelCallback, editorSaveCallback }"
      >
        <div class="flex items-center gap-1">
          <span>{{ data.aliases[0] }}</span>
          <Badge
            v-if="data.aliases.length > 1"
            severity="secondary"
            v-tooltip="data.aliases.join(', ')"
          >
            {{ data.aliases.length }}
          </Badge>
        </div>
        <Dialog
          header="編輯別名"
          visible
          :closable="false"
          modal
          :pt="{ mask: { onClick: (e: Event) => e.stopPropagation() } }"
        >
          <AutoComplete
            v-model="data[field]"
            multiple
            fluid
            :typeahead="false"
            size="small"
          />
          <template #footer>
            <Button
              label="取消"
              severity="danger"
              @click="editorCancelCallback"
            />
            <Button label="儲存" @click="editorSaveCallback" />
          </template>
        </Dialog>
      </template>
    </Column>
    <LevelColumn
      v-if="true"
      field="star"
      :min="1"
      :max="8"
      header="星等"
      body-class="max-w-15"
      :options="starOptions"
    >
      <template #body="{ data }">
        <Stars :star="data.star" />
      </template>
    </LevelColumn>
    <LevelColumn v-if="true" field="level" :min="1" :max="90" header="等級" />
    <LevelColumn v-if="true" field="kizuna" :min="1" :max="100" header="羈絆" />
    <LevelColumn
      v-if="true"
      field="weapon_level"
      :min="1"
      :max="50"
      header="固有等級"
    />
    <LevelColumn v-if="true" field="skill_ex" :min="1" :max="5" header="EX" />
    <LevelColumn
      v-if="true"
      field="skill_n"
      show-max
      :min="1"
      :max="10"
      header="技一"
    />
    <LevelColumn
      v-if="true"
      field="skill_p"
      show-max
      :min="1"
      :max="10"
      header="技二"
    />
    <LevelColumn
      v-if="true"
      field="skill_sub"
      show-max
      :min="1"
      :max="10"
      header="技三"
    />
    <LevelColumn v-if="true" field="gear_1" header="裝備一" :min="0" :max="9" />
    <LevelColumn v-if="true" field="gear_2" header="裝備二" :min="0" :max="9" />
    <LevelColumn v-if="true" field="gear_3" header="裝備三" :min="0" :max="9" />
    <LevelColumn
      v-if="true"
      field="gear_unique"
      header="愛用品"
      :min="1"
      :max="2"
    />
    <LevelColumn
      v-if="true"
      field="release_hp"
      header="生命"
      :min="0"
      :max="25"
    />
    <LevelColumn
      v-if="true"
      field="release_atk"
      header="攻擊"
      :min="0"
      :max="25"
    />
    <LevelColumn
      v-if="true"
      field="release_heal"
      header="治癒"
      :min="0"
      :max="25"
    />
  </DataTable>
</template>
