<script setup lang="ts">
import type { Category, Group, GroupMember, Paginated } from "~/types";

const api = useApi();
const { groups, refresh } = useGroups();
const { user } = useAuth();

const categories = ref<Category[]>([]);
const selectedGroup = ref<Group | null>(null);
const members = ref<GroupMember[]>([]);
const membersLoading = ref(false);
const membersError = ref("");
const memberEmail = ref("");
const memberSaving = ref(false);

const parentOptions = computed(() =>
  groups.value.map((g) => ({ value: g.id, label: g.name })),
);
const categoryOptions = computed(() =>
  categories.value.map((c) => ({ value: c.id, label: c.name })),
);

onMounted(async () => {
  categories.value = (
    await api<Paginated<Category>>("/credential-categories", {
      query: { limit: 100 },
    })
  ).data;
});

const loadMembers = async (group: Group) => {
  selectedGroup.value = group;
  membersLoading.value = true;
  membersError.value = "";
  try {
    members.value = await api<GroupMember[]>(
      `/credential-groups/${group.id}/members`,
    );
  } catch (e) {
    membersError.value = getApiErrorMessage(e, "Gagal memuat anggota group.");
    members.value = [];
  } finally {
    membersLoading.value = false;
  }
};

const addMember = async () => {
  if (!selectedGroup.value || !memberEmail.value.trim()) return;
  memberSaving.value = true;
  membersError.value = "";
  try {
    await api(`/credential-groups/${selectedGroup.value.id}/members`, {
      method: "POST",
      body: { email: memberEmail.value.trim() },
    });
    memberEmail.value = "";
    await loadMembers(selectedGroup.value);
  } catch (e) {
    membersError.value = getApiErrorMessage(e, "Gagal menambah anggota.");
  } finally {
    memberSaving.value = false;
  }
};

const removeMember = async (member: GroupMember) => {
  if (!selectedGroup.value) return;
  if (!confirm(`Hapus anggota ${member.email}?`)) return;
  membersError.value = "";
  try {
    await api(
      `/credential-groups/${selectedGroup.value.id}/members/${member.userId}`,
      { method: "DELETE" },
    );
    await loadMembers(selectedGroup.value);
  } catch (e) {
    membersError.value = getApiErrorMessage(e, "Gagal menghapus anggota.");
  }
};

const isOwner = computed(
  () => members.value.some((m) => m.userId === user.value?.id && m.role === "owner"),
);
</script>

<template>
  <div class="space-y-8">
    <SharedResourceManager
      title="Credential Group"
      endpoint="/credential-groups"
      with-parent
      with-category
      with-members
      :parent-options="parentOptions"
      :category-options="categoryOptions"
      @changed="refresh"
      @select="loadMembers"
    />

    <section v-if="selectedGroup" class="space-y-4 border-t border-line pt-6">
      <div class="flex items-center justify-between gap-3">
        <div>
          <h2 class="text-xl font-semibold">
            Anggota group: {{ selectedGroup.name }}
          </h2>
          <p class="text-sm text-ink-soft">
            Hanya user yang satu group yang muncul di daftar ini.
          </p>
        </div>
        <BaseButton variant="ghost" @click="selectedGroup = null"
          >Tutup</BaseButton
        >
      </div>

      <form
        v-if="isOwner"
        class="flex flex-col gap-2 sm:flex-row sm:items-end"
        @submit.prevent="addMember"
      >
        <BaseInput
          v-model="memberEmail"
          class="flex-1"
          label="Tambah anggota (email user terdaftar)"
          type="email"
          required
        />
        <BaseButton type="submit" :loading="memberSaving">Tambah</BaseButton>
      </form>

      <p
        v-if="membersError"
        class="rounded-md border border-danger/40 bg-danger/5 px-3 py-2 text-sm text-danger"
      >
        {{ membersError }}
      </p>

      <BaseTable
        :columns="[
          { key: 'name', label: 'Nama' },
          { key: 'email', label: 'Email' },
          { key: 'role', label: 'Role' },
        ]"
        :rows="members"
        :loading="membersLoading"
      >
        <template #cell-name="{ row }">{{ row.name || "-" }}</template>
        <template #actions="{ row }">
          <BaseButton
            v-if="isOwner && row.role !== 'owner'"
            variant="danger"
            @click="removeMember(row)"
            >Hapus</BaseButton
          >
        </template>
      </BaseTable>
    </section>
  </div>
</template>
