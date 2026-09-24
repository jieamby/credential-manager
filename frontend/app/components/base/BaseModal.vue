<script setup lang="ts">
defineProps<{ open: boolean; title: string }>();
defineEmits<{ close: [] }>();
</script>
<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-ink-deep/60 p-4 sm:p-6"
    @click.self="$emit('close')"
  >
    <div
      class="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-xl"
    >
      <h2 class="shrink-0 border-b border-line px-6 py-4 text-xl font-semibold">
        {{ title }}
      </h2>
      <div class="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        <slot />
      </div>
      <div
        v-if="$slots.footer"
        class="shrink-0 border-t border-line bg-surface px-6 py-4"
      >
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>
