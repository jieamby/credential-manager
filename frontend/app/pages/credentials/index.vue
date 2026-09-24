<script setup lang="ts">
import type {
  Category,
  Credential,
  CredentialForm,
  Paginated,
  RevealedPassword,
} from "~/types";
import {
  CREDENTIAL_LIMITS,
  validateCredentialForm,
} from "~/utils/credentialForm";

const api = useApi();
const route = useRoute();
const { groups } = useGroups();

const categoryId = ref("");
const categories = ref<Category[]>([]);
const modal = ref(false);
const editingId = ref<string>();
const revealed = reactive<Record<string, string>>({});
const formError = ref("");
const actionError = ref("");
const saving = ref(false);

const {
  page,
  search,
  result: rows,
  loading,
  error,
  load,
} = usePaginatedList<Credential>("/credentials", () => ({
  categoryId: categoryId.value || undefined,
  groupId: (route.query.groupId as string) || undefined,
}));

const emptyForm = (): CredentialForm => ({
  title: "",
  username: "",
  password: "",
  url: "",
  notes: "",
  groupId: (route.query.groupId as string) || "",
  categoryId: "",
});
const form = ref<CredentialForm>(emptyForm());

onMounted(async () => {
  categories.value = (
    await api<Paginated<Category>>("/credential-categories", {
      query: { limit: 100 },
    })
  ).data;
});

const groupName = (id: string | null) =>
  groups.value.find((g) => g.id === id)?.name ?? "-";
const categoryName = (id: string | null) =>
  categories.value.find((c) => c.id === id)?.name ?? "-";

const categoryFromGroup = (groupId: string) => {
  const group = groups.value.find((g) => g.id === groupId);
  return group?.categoryId ?? "";
};

const openForm = (row?: Credential) => {
  editingId.value = row?.id;
  formError.value = "";
  if (row) {
    form.value = {
      title: row.title,
      username: row.username ?? "",
      password: "",
      url: row.url ?? "",
      notes: row.notes ?? "",
      groupId: row.groupId ?? "",
      categoryId: row.categoryId ?? "",
    };
  } else {
    const next = emptyForm();
    if (next.groupId) {
      next.categoryId = categoryFromGroup(next.groupId);
    }
    form.value = next;
  }
  modal.value = true;
};

const filteredGroups = computed(() => {
  if (!form.value.categoryId) return groups.value;
  return groups.value.filter(
    (g) => !g.categoryId || g.categoryId === form.value.categoryId
  );
});

watch(
  () => form.value.groupId,
  (groupId) => {
    if (groupId) {
      const inherited = categoryFromGroup(groupId);
      if (inherited) form.value.categoryId = inherited;
    }
  },
);

watch(
  () => form.value.categoryId,
  (categoryId) => {
    if (categoryId && form.value.groupId) {
      const inherited = categoryFromGroup(form.value.groupId);
      if (inherited && inherited !== categoryId) {
        form.value.groupId = "";
      }
    }
  },
);

const save = async () => {
  saving.value = true;
  formError.value = "";
  const validationError = validateCredentialForm({
    title: form.value.title,
    username: form.value.username,
    password: form.value.password,
    url: form.value.url,
    notes: form.value.notes,
    requirePassword: !editingId.value,
  });
  if (validationError) {
    formError.value = validationError;
    saving.value = false;
    return;
  }
  const { password, ...rest } = form.value;
  const body = {
    title: rest.title.trim(),
    username: rest.username.trim() || undefined,
    url: rest.url.trim() || undefined,
    notes: rest.notes.trim() || undefined,
    groupId: rest.groupId || undefined,
    categoryId: rest.categoryId || undefined,
    ...(password ? { password } : {}),
  };
  try {
    await api(
      editingId.value ? `/credentials/${editingId.value}` : "/credentials",
      {
        method: editingId.value ? "PATCH" : "POST",
        body,
      },
    );
    modal.value = false;
    await load();
  } catch (e) {
    formError.value = getApiErrorMessage(e, "Gagal menyimpan credential.");
  } finally {
    saving.value = false;
  }
};

const remove = async (row: Credential) => {
  if (!confirm(`Hapus "${row.title}"?`)) return;
  actionError.value = "";
  try {
    await api(`/credentials/${row.id}`, { method: "DELETE" });
    await load();
  } catch (e) {
    actionError.value = getApiErrorMessage(e, "Gagal menghapus credential.");
  }
};

const toggleReveal = async (row: Credential) => {
  if (revealed[row.id]) {
    delete revealed[row.id];
    return;
  }
  try {
    revealed[row.id] = (
      await api<RevealedPassword>(`/credentials/${row.id}/reveal`)
    ).password;
  } catch (e) {
    actionError.value = getApiErrorMessage(e, "Gagal menampilkan password.");
  }
};
const copy = async (text?: string) => {
  if (text) await navigator.clipboard.writeText(text);
};
const opt = (l: { id: string; name: string }[]) =>
  l.map((x) => ({ value: x.id, label: x.name }));

const activeGroupName = computed(() => {
  const id = route.query.groupId as string | undefined;
  if (!id) return null;
  return groups.value.find((g) => g.id === id)?.name ?? null;
});
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h1 class="text-3xl font-semibold">Credentials</h1>
        <p v-if="activeGroupName" class="text-sm text-ink-soft">
          Filter group: {{ activeGroupName }}
        </p>
      </div>
      <BaseButton @click="openForm()">Tambah credential</BaseButton>
    </div>

    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <BaseInput v-model="search" placeholder="Cari title atau username..." />
      <BaseSelect
        v-model="categoryId"
        :options="opt(categories)"
        placeholder="Semua kategori"
      />
    </div>

    <p
      v-if="error || actionError"
      class="rounded-md border border-danger/40 bg-danger/5 px-3 py-2 text-sm text-danger"
    >
      {{ error || actionError }}
    </p>

    <BaseTable
      :columns="[
        { key: 'title', label: 'Nama credential' },
        { key: 'username', label: 'Username' },
        { key: 'password', label: 'Password' },
        { key: 'category', label: 'Kategori' },
        { key: 'group', label: 'Group' },
      ]"
      :rows="rows.data"
      :loading="loading"
    >
      <template #cell-password="{ row }">
        <span class="font-mono text-ink-soft">{{
          revealed[row.id] ?? "••••••••"
        }}</span>
      </template>
      <template #cell-category="{ row }">{{
        categoryName(row.categoryId)
      }}</template>
      <template #cell-group="{ row }">{{ groupName(row.groupId) }}</template>
      <template #actions="{ row }">
        <div class="flex flex-wrap gap-1.5">
          <BaseButton variant="ghost" @click="toggleReveal(row)">{{
            revealed[row.id] ? "Sembunyikan" : "Lihat"
          }}</BaseButton>
          <BaseButton
            v-if="revealed[row.id]"
            variant="ghost"
            @click="copy(revealed[row.id])"
            >Salin</BaseButton
          >
          <BaseButton variant="ghost" @click="openForm(row)">Edit</BaseButton>
          <BaseButton variant="danger" @click="remove(row)">Hapus</BaseButton>
        </div>
      </template>
    </BaseTable>

    <BasePagination
      :page="rows.page"
      :total="rows.total"
      :total-pages="rows.totalPage"
      @change="page = $event"
    />

    <BaseModal
      :open="modal"
      :title="editingId ? 'Edit credential' : 'Tambah credential'"
      @close="modal = false"
    >
      <form
        id="credential-form"
        class="space-y-4"
        autocomplete="off"
        @submit.prevent="save"
      >
        <p class="text-xs text-ink-soft">
          Tanda <span class="text-danger">*</span> wajib diisi.
        </p>
        <BaseInput
          v-model="form.title"
          label="Nama credential"
          required
          :minlength="CREDENTIAL_LIMITS.titleMin"
          :maxlength="CREDENTIAL_LIMITS.titleMax"
          autocomplete="off"
          placeholder="Contoh: GitHub, Gmail Kerja"
          hint="Nama layanan atau akun. Bukan nama orang."
        />
        <BaseInput
          v-model="form.username"
          label="Username / email login"
          optional
          :maxlength="CREDENTIAL_LIMITS.usernameMax"
          autocomplete="username"
          placeholder="contoh: agus@example.com"
          hint="Username atau email yang dipakai untuk masuk. Bukan nama lengkap."
        />
        <BaseInput
          v-model="form.password"
          type="password"
          :label="
            editingId ? 'Password baru' : 'Password'
          "
          :required="!editingId"
          :optional="!!editingId"
          :minlength="editingId ? undefined : CREDENTIAL_LIMITS.passwordMin"
          :maxlength="CREDENTIAL_LIMITS.passwordMax"
          autocomplete="new-password"
          hint="
            editingId
              ? 'Kosongkan jika password tidak diubah. Jika diisi, minimal 8 karakter.'
              : 'Minimal 8 karakter. Disimpan terenkripsi di server.'
          "
        />
        <BaseInput
          v-model="form.url"
          label="URL situs"
          optional
          type="url"
          :maxlength="CREDENTIAL_LIMITS.urlMax"
          autocomplete="url"
          placeholder="https://github.com"
          hint="Alamat website akun. Harus diawali https:// atau http://"
        />
        <BaseInput
          v-model="form.notes"
          label="Catatan"
          optional
          :maxlength="CREDENTIAL_LIMITS.notesMax"
          hint="Keterangan tambahan, misalnya peran akun atau 2FA."
        />
        <BaseSelect
          v-model="form.groupId"
          label="Group"
          optional
          :options="opt(filteredGroups)"
          placeholder="Tanpa group"
          hint="Opsional. Jika group punya kategori, kategori akan terisi otomatis."
        />
        <BaseSelect
          v-model="form.categoryId"
          label="Kategori"
          optional
          :options="opt(categories)"
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
          <BaseButton type="submit" form="credential-form" :loading="saving"
            >Simpan</BaseButton
          >
        </div>
      </template>
    </BaseModal>
  </div>
</template>
