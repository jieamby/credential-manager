<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: "primary" | "danger" | "ghost";
    loading?: boolean;
    type?: "button" | "submit";
  }>(),
  { variant: "primary", type: "button" },
);
const styles = {
  primary: "bg-brass text-white hover:bg-brass-dark",
  danger:
    "border border-danger/40 text-danger hover:bg-danger hover:text-white",
  ghost: "border border-line bg-surface text-ink hover:border-ink-soft",
};
</script>
<template>
  <button
    :type="type"
    :disabled="loading"
    :class="[
      'rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40',
      styles[variant],
    ]"
  >
    <slot />
  </button>
</template>
