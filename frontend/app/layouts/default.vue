<script setup lang="ts">
const { tree, refresh } = useGroups();
const { logout, isLoggedIn, user, fetchUser } = useAuth();
if (isLoggedIn.value)
  await Promise.all([
    refresh().catch((e) => console.error("Gagal memuat group", e)),
    fetchUser(),
  ]);

const link =
  "block border-l-2 border-transparent py-1.5 pl-3 text-slate-400 hover:text-white";
const active = "border-brass !text-white bg-white/5";
</script>
<template>
  <div v-if="!isLoggedIn"><slot /></div>
  <div v-else class="flex min-h-screen">
    <aside class="flex w-64 shrink-0 flex-col bg-ink-deep px-4 py-6 text-sm">
      <p class="mb-8 pl-3 font-display text-lg font-semibold text-white">
        Credential Manager
      </p>
      <nav class="flex-1 space-y-1">
        <NuxtLink
          to="/credentials"
          exact-active-class=""
          :class="link"
          :active-class="active"
          >Semua credential</NuxtLink
        >
        <p class="pl-3 pb-1 pt-5 text-xs text-slate-500">Group</p>
        <SharedGroupMenu :nodes="tree" />
        <p class="pl-3 pb-1 pt-5 text-xs text-slate-500">Pengaturan</p>
        <NuxtLink to="/groups" :class="link" :active-class="active"
          >Kelola group</NuxtLink
        >
        <NuxtLink to="/categories" :class="link" :active-class="active"
          >Kelola kategori</NuxtLink
        >
        <div class="mb-3 border-t border-white/10 pl-3 pt-4">
          <p class="truncate text-white">{{ user?.name || user?.email }}</p>
          <p v-if="user?.name" class="truncate text-xs text-slate-500">
            {{ user.email }}
          </p>
        </div>
      </nav>
      <button
        class="pl-3 text-left text-slate-400 hover:text-white"
        @click="logout"
      >
        Keluar
      </button>
    </aside>
    <main class="mx-auto w-full max-w-6xl flex-1 px-8 py-8"><slot /></main>
  </div>
</template>
