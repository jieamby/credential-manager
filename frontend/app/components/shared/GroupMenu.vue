<script setup lang="ts">
import type { GroupNode } from "~/composables/useGroups";
defineProps<{ nodes: GroupNode[]; depth?: number }>();
</script>
<template>
  <ul>
    <li v-for="n in nodes" :key="n.id">
      <NuxtLink
        :to="{ path: '/credentials', query: { groupId: n.id } }"
        class="block border-l-2 border-transparent py-1.5 text-slate-400 hover:text-white"
        exact-active-class="!border-brass !text-white bg-white/5"
        :style="{ paddingLeft: `${12 + (depth ?? 0) * 14}px` }"
        >{{ n.name }}</NuxtLink
      >
      <SharedGroupMenu
        v-if="n.children.length"
        :nodes="n.children"
        :depth="(depth ?? 0) + 1"
      />
    </li>
  </ul>
</template>
