<script setup lang="ts">
definePageMeta({ layout: "auth" });
const { register } = useAuth();
const form = reactive({ name: "", email: "", password: "" });
const error = ref("");
const loading = ref(false);
const submit = async () => {
  loading.value = true;
  error.value = "";
  try {
    await register(form.name.trim() || undefined, form.email, form.password);
    await navigateTo("/credentials");
  } catch (e) {
    error.value = getApiErrorMessage(e, "Pendaftaran gagal.");
  } finally {
    loading.value = false;
  }
};
</script>
<template>
  <form class="w-full max-w-sm space-y-4" @submit.prevent="submit">
    <h2 class="text-2xl font-semibold">Buat akun</h2>
    <BaseInput v-model="form.name" label="Nama" />
    <BaseInput v-model="form.email" label="Email" type="email" required />
    <BaseInput
      v-model="form.password"
      label="Password"
      type="password"
      required
    />
    <p v-if="error" class="text-sm text-danger">{{ error }}</p>
    <BaseButton type="submit" :loading="loading" class="w-full"
      >Daftar</BaseButton
    >
    <p class="text-sm text-ink-soft">
      Sudah punya akun?
      <NuxtLink to="/login" class="font-medium text-brass underline"
        >Masuk</NuxtLink
      >
    </p>
  </form>
</template>
