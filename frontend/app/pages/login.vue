<script setup lang="ts">
definePageMeta({ layout: "auth" });
const { login } = useAuth();
const form = reactive({ email: "", password: "" });
const error = ref("");
const loading = ref(false);
const submit = async () => {
  loading.value = true;
  error.value = "";
  try {
    await login(form.email, form.password);
    await navigateTo("/credentials");
  } catch {
    error.value = "Email atau password salah.";
  } finally {
    loading.value = false;
  }
};
</script>
<template>
  <form class="w-full max-w-sm space-y-4" @submit.prevent="submit">
    <h2 class="text-2xl font-semibold">Masuk</h2>
    <BaseInput v-model="form.email" label="Email" type="email" required />
    <BaseInput
      v-model="form.password"
      label="Password"
      type="password"
      required
    />
    <p v-if="error" class="text-sm text-danger">{{ error }}</p>
    <BaseButton type="submit" :loading="loading" class="w-full"
      >Masuk</BaseButton
    >
    <p class="text-sm text-ink-soft">
      Belum punya akun?
      <NuxtLink to="/register" class="font-medium text-brass underline"
        >Daftar</NuxtLink
      >
    </p>
  </form>
</template>
