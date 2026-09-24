<script setup lang="ts">
interface Item {
  id: string;
  name: string;
  description?: string | null;
  parentId?: string | null;
  categoryId?: string | null;
}
interface Option {
  value: string;
  label: string;
}

const props = defineProps<{
  title: string;
  endpoint: string;
  withParent?: boolean;
  parentOptions?: Option[];
  withCategory?: boolean;
  categoryOptions?: Option[];
  withMembers?: boolean;
}>();
const emit = defineEmits<{ changed: []; select: [Item] }>();
const api = useApi();

const {
  page,
  search,
  result: items,
  loading,
  error,
  load,
} = usePaginatedList<Item>(props.endpoint);

const modal = ref(false);
const saving = ref(false);
const formError = ref("");
const actionError = ref("");
const form = reactive<{
  id?: string;
  name: string;
  description: string;
  parentId: string;
  categoryId: string;
  hadParent: boolean;
  hadCategory: boolean;
}>({
  name: "",
  description: "",
  parentId: "",
  categoryId: "",
  hadParent: false,
  hadCategory: false,
});

const parentChoices = computed(() =>
  (props.parentOptions ?? []).filter((o) => o.value !== form.id),
);

const openForm = (row?: Item) => {
  Object.assign(form, {
    id: row?.id,
    name: row?.name ?? "",
    description: row?.description ?? "",
    parentId: row?.parentId ?? "",
    categoryId: row?.categoryId ?? "",
    hadParent: !!row?.parentId,
    hadCategory: !!row?.categoryId,
  });
  formError.value = "";
  modal.value = true;
};

const save = async () => {
  saving.value = true;
  formError.value = "";
  const body: Record<string, unknown> = { name: form.name.trim() };
  if (form.description.trim()) body.description = form.description.trim();
  if (props.withParent) {
    if (form.parentId) body.parentId = form.parentId;
    else if (form.id && form.hadParent) body.parentId = null;
  }
  if (props.withCategory) {
    if (form.categoryId) body.categoryId = form.categoryId;
    else if (form.id && form.hadCategory) body.categoryId = null;
  }
  try {
    await api(form.id ? `${props.endpoint}/${form.id}` : props.endpoint, {
      method: form.id ? "PATCH" : "POST",
      body,
    });
    modal.value = false;
    await load();
    emit("changed");
  } catch (e) {
    formError.value = getApiErrorMessage(e, "Gagal menyimpan data.");
  } finally {
    saving.value = false;
  }
};

const remove = async (row: Item) => {
  if (!confirm(`Hapus "${row.name}"?`)) return;
  actionError.value = "";
  try {
    await api(`${props.endpoint}/${row.id}`, { method: "DELETE" });
    await load();
    emit("changed");
  } catch (e) {
    actionError.value = getApiErrorMessage(e, "Gagal menghapus data.");
  }
};

const columns = computed(() => {
  const cols = [
    { key: "name", label: "Nama" },
    { key: "description", label: "Deskripsi" },
  ];
  if (props.withCategory) {
    cols.push({ key: "category", label: "Kategori" });
  }
  return cols;
});

const categoryLabel = (categoryId?: string | null) =>
  (props.categoryOptions ?? []).find((c) => c.value === categoryId)?.label ??
  "-";
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-3">
      <h1 class="text-3xl font-semibold">{{ title }}</h1>
      <BaseButton @click="openForm()">Tambah</BaseButton>
    </div>

    <BaseInput v-model="search" placeholder="Cari nama..." />

    <p
      v-if="error || actionError"
      class="rounded-md border border-danger/40 bg-danger/5 px-3 py-2 text-sm text-danger"
    >
      {{ error || actionError }}
    </p>

    <BaseTable :columns="columns" :rows="items.data" :loading="loading">
      <template v-if="withCategory" #cell-category="{ row }">
        {{ categoryLabel(row.categoryId) }}
      </template>
      <template #actions="{ row }">
        <div class="flex gap-1.5">
          <BaseButton
            v-if="withMembers"
            variant="ghost"
            @click="emit('select', row)"
            >Anggota</BaseButton
          >
          <BaseButton variant="ghost" @click="openForm(row)">Edit</BaseButton>
          <BaseButton variant="danger" @click="remove(row)">Hapus</BaseButton>
        </div>
      </template>
    </BaseTable>

    <BasePagination
      :page="items.page"
      :total="items.total"
      :total-pages="items.totalPage"
      @change="page = $event"
    />

    <BaseModal
      :open="modal"
      :title="form.id ? `Edit ${title}` : `Tambah ${title}`"
      @close="modal = false"
    >
      <form id="resource-form" class="space-y-4" @submit.prevent="save">
        <BaseInput v-model="form.name" label="Nama" required maxlength="100" />
        <BaseInput
          v-model="form.description"
          label="Deskripsi"
          optional
          maxlength="500"
        />
        <BaseSelect
          v-if="withParent"
          v-model="form.parentId"
          label="Parent group"
          optional
          :options="parentChoices"
          placeholder="Tanpa parent"
        />
        <BaseSelect
          v-if="withCategory"
          v-model="form.categoryId"
          label="Kategori"
          optional
          :options="categoryOptions ?? []"
          placeholder="Tanpa kategori"
        />
        <p
          v-if="formError"
          class="rounded-md border border-danger/40 bg-danger/5 px-3 py-2 text-sm text-danger"
        >
          {{ formError }}
        </p>
      </form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <BaseButton variant="ghost" @click="modal = false">Batal</BaseButton>
          <BaseButton type="submit" form="resource-form" :loading="saving"
            >Simpan</BaseButton
          >
        </div>
      </template>
    </BaseModal>
  </div>
</template>
