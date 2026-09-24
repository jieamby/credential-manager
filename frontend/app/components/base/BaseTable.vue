<script setup lang="ts" generic="T extends { id: string }">
defineProps<{ columns: { key: string; label: string }[]; rows: T[]; loading?: boolean }>()
</script>
<template>
  <div class="overflow-x-auto">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b-2 border-ink text-left text-ink-soft">
          <th v-for="c in columns" :key="c.key" class="px-3 py-2.5 font-semibold">{{ c.label }}</th>
          <th class="w-44 px-3 py-2.5 font-semibold">Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading"><td :colspan="columns.length + 1" class="px-3 py-10 text-center text-ink-soft">Memuat data...</td></tr>
        <tr v-else-if="!rows.length"><td :colspan="columns.length + 1" class="px-3 py-10 text-center text-ink-soft">Belum ada data. Tambahkan lewat tombol di kanan atas.</td></tr>
        <tr v-for="r in rows" v-else :key="r.id" class="border-b border-line hover:bg-surface">
          <td v-for="c in columns" :key="c.key" class="px-3 py-3">
            <slot :name="`cell-${c.key}`" :row="r">{{ (r as Record<string, unknown>)[c.key] ?? '-' }}</slot>
          </td>
          <td class="px-3 py-3"><slot name="actions" :row="r" /></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>