<template>
  <div class="grid min-h-screen md:grid-cols-[1fr_1.1fr]">
    <section
      class="hidden flex-col justify-between bg-ink-deep p-12 text-white md:flex"
    >
      <p class="font-display text-lg font-semibold">Credential Manager</p>
      <h1 class="max-w-md font-display text-4xl font-semibold leading-tight">
        Simpan password tim di satu tempat, terenkripsi dan tertata.
      </h1>
    </section>
    <section class="flex items-center justify-center p-6"><slot /></section>
  </div>
</template>
