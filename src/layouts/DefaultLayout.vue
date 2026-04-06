<script setup lang="ts">
import { ref } from "vue";
import NavBar from "../shared/components/NavBar.vue";
import SideBar from "../shared/components/SideBar.vue";

const isSidebarOpen = ref(true);
</script>

<template>
  <SideBar v-model="isSidebarOpen" />

  <div
    v-if="isSidebarOpen"
    class="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-10 lg:hidden transition-opacity duration-300"
    @click="isSidebarOpen = false"
  ></div>

  <div
    :class="[
      'relative h-screen flex flex-col transition-all duration-300 ease-in-out',
      isSidebarOpen ? 'lg:ml-64' : 'ml-0',
    ]"
  >
    <NavBar v-model:is-sidebar-open="isSidebarOpen" />
    <main class="flex-1 min-h-0 flex flex-col overflow-x-hidden">
      <slot></slot>
    </main>
  </div>
</template>
