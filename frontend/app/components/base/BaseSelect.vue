<script setup lang="ts">
defineProps<{
  label?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  optional?: boolean;
  hint?: string;
}>();
const model = defineModel<string | null | undefined>();
</script>
<template>
  <label class="block text-sm">
    <span v-if="label" class="font-medium text-ink-soft">
      {{ label }}
      <span v-if="optional" class="font-normal text-ink-soft/80">
        (opsional)
      </span>
    </span>
    <select
      v-model="model"
      class="mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 text-ink focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass"
    >
      <option :value="''">{{ placeholder ?? "Pilih..." }}</option>
      <option v-for="o in options" :key="o.value" :value="o.value">
        {{ o.label }}
      </option>
    </select>
    <p v-if="hint" class="mt-1 text-xs leading-relaxed text-ink-soft">
      {{ hint }}
    </p>
  </label>
</template>
