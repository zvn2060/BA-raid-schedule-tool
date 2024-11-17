<script setup lang="ts">
import { DataTableProps, useToast } from "primevue";
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
const { students, total } = useStudents(filter, pagination);
const { update } = updateStudentData();
const datatableConfig: DataTableProps = {
  scrollable: true,
  scrollHeight: "flex",
  paginator: true,
  lazy: true,
  pt: { header: { class: ["flex", "items-center", "gap-2"] } },
};

const rowsPerPageOptions = computed(() =>
  (total.value ?? 0) > 50 ? [10, 20, 50, total.value!] : [10, 20, 50]
);

const { open, onChange, reset } = useFileDialog({
  accept: "text/csv",
  multiple: false,
});

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
</script>

<template>
  <DataTable
    v-model:rows="rows"
    v-model:first="first"
    :value="students"
    v-bind="datatableConfig"
    :rowsPerPageOptions
    :total-records="total"
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
          <Badge v-if="data.aliases.length > 1" severity="secondary" v-tooltip="data.aliases.join(', ')">
            {{ data.aliases.length }}
          </Badge>
        </div>
      </template>
    </Column>
    <Column field="star" header="星等">
      <template #body="{ data }">
        <Stars :star="data.star" />
      </template>
    </Column>
    <Column field="level" header="等級" />
    <Column field="kizuna" header="羈絆" />
    <Column field="weapon_level" header="固有等級" />
    <LevelColumn v-if="true" field="skill_ex" :max="5" header="EX" />
    <LevelColumn v-if="true" field="skill_n" :max="10" header="技一" />
    <LevelColumn v-if="true" field="skill_p" :max="10" header="技二" />
    <LevelColumn v-if="true" field="skill_sub" :max="10" header="技三" />
    <LevelColumn v-if="true" field="gear_1" header="裝備一" />
    <LevelColumn v-if="true" field="gear_2" header="裝備二" />
    <LevelColumn v-if="true" field="gear_3" header="裝備三" />
    <LevelColumn v-if="true" field="gear_unique" header="愛用品" />
    <LevelColumn v-if="true" field="release_hp" header="生命" />
    <LevelColumn v-if="true" field="release_atk" header="攻擊" />
    <LevelColumn v-if="true" field="release_heal" header="治癒" />
  </DataTable>
</template>
