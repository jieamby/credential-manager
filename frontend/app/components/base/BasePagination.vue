<script setup lang="ts">
defineProps<{ page: number; totalPages: number; total: number }>();
defineEmits<{ change: [page: number] }>();
</script>
<template>
  <div class="mt-4 flex items-center justify-between text-sm text-ink-soft">
    <span>{{ total }} data</span>
    <div class="flex items-center gap-3">
      <BaseButton
        variant="ghost"
        :loading="page <= 1"
        @click="$emit('change', page - 1)"
        >Sebelumnya</BaseButton
      >
      <span>Halaman {{ page }} dari {{ Math.max(totalPages, 1) }}</span>
      <BaseButton
        variant="ghost"
        :loading="page >= totalPages"
        @click="$emit('change', page + 1)"
        >Berikutnya</BaseButton
      >
    </div>
  </div>
</template>
