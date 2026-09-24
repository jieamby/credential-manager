<script setup lang="ts">
const props = defineProps<{
  label?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  maxlength?: number;
  minlength?: number;
  autocomplete?: string;
}>();
const model = defineModel<string | null | undefined>();

const isPassword = computed(() => props.type === "password");
const visible = ref(false);
const inputType = computed(() =>
  isPassword.value && visible.value ? "text" : (props.type ?? "text"),
);
</script>

<template>
  <label class="block text-sm">
    <span v-if="label" class="font-medium text-ink-soft">
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
      <span v-else-if="optional" class="font-normal text-ink-soft/80">
        (opsional)
      </span>
    </span>
    <span class="relative mt-1 block">
      <input
        v-model="model"
        :type="inputType"
        :placeholder="placeholder"
        :required="required"
        :maxlength="maxlength"
        :minlength="minlength"
        :autocomplete="autocomplete"
        spellcheck="false"
        :class="[
          'w-full rounded-md border border-line bg-surface px-3 py-2 text-ink placeholder:text-ink-soft/60 focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass',
          isPassword ? 'pr-10' : '',
        ]"
      />
      <button
        v-if="isPassword"
        type="button"
        class="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-ink-soft hover:text-ink"
        :aria-label="visible ? 'Sembunyikan password' : 'Tampilkan password'"
        :aria-pressed="visible"
        @click="visible = !visible"
      >
        <svg
          v-if="!visible"
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-6.5 0-10-7-10-7a18.5 18.5 0 0 1 5.06-5.94"
          />
          <path
            d="M9.9 4.24A9.1 9.1 0 0 1 12 5c6.5 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19"
          />
          <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
          <path d="m2 2 20 20" />
        </svg>
      </button>
    </span>
    <p v-if="hint" class="mt-1 text-xs leading-relaxed text-ink-soft">
      {{ hint }}
    </p>
  </label>
</template>
