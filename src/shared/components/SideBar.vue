<script setup lang="ts">
import { useRoute, RouterLink } from "vue-router";

const route = useRoute();
const isOpen = defineModel<boolean>({ default: true });

const handleLinkClick = () => {
  if (window.innerWidth < 1024) {
    isOpen.value = false;
  }
};

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: "dashboard" },
  { name: "Notas", path: "/notes", icon: "description" },
  { name: "Tareas", path: "/tasks", icon: "check_circle" },
  { name: "Perfil", path: "/profile", icon: "account_circle" },
  { name: "Ajustes", path: "/settings", icon: "settings" },
];
</script>

<template>
  <aside
    :class="
      isOpen ? 'translate-x-0 shadow-2xl lg:shadow-none' : '-translate-x-full'
    "
    class="flex flex-col h-screen w-64 border-r border-black bg-black font-['Manrope'] text-sm tracking-tight py-8 fixed left-0 top-0 z-60 transition-transform duration-300 ease-in-out select-none"
  >
    <div class="absolute top-8 -right-8 hidden lg:block">
      <button
        @click="isOpen = !isOpen"
        class="cursor-pointer flex items-center justify-center p-1 bg-black border border-l-0 border-white/20 rounded-r-md text-white/80 hover:text-white transition-colors"
        title="Ocultar/Mostrar menú"
      >
        <span class="material-symbols-outlined text-[20px]">
          {{ isOpen ? "chevron_left" : "chevron_right" }}
        </span>
      </button>
    </div>

    <div class="px-8 mb-12">
      <div class="flex flex-col gap-6">
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center p-2 shadow-xl overflow-hidden"
          >
            <img
              src="/src/assets/icon.png"
              alt="TaskNest"
              class="w-full h-full object-contain"
            />
          </div>
          <div class="flex flex-col justify-center">
            <h1
              class="text-2xl font-black tracking-tighter text-white leading-none mb-1.5"
            >
              TaskNest!
            </h1>
            <div
              class="inline-flex items-center px-1.5 py-0.5 bg-white/10 text-white/60 text-[11px] font-black rounded border border-white/5 tracking-wider uppercase w-fit"
            >
              v0.2.5
            </div>
          </div>
        </div>
        <div class="space-y-1 pl-1">
          <p
            class="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold"
          >
            Tu espacio de trabajo local
          </p>
          <div class="w-8 h-0.5 bg-white/10 rounded-full"></div>
        </div>
      </div>
    </div>

    <nav class="flex-1 flex flex-col space-y-3">
      <RouterLink
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        @click="handleLinkClick"
        :class="[
          'mx-3 px-5 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 ease-out hover:translate-x-1 hover:shadow-sm active:scale-[0.97]',
          route.path.startsWith(item.path)
            ? 'bg-white text-black font-bold shadow-sm translate-x-1'
            : 'text-white/70 hover:bg-white/10 hover:text-white',
        ]"
      >
        <span
          class="material-symbols-outlined text-[20px]"
          :data-icon="item.icon"
          >{{ item.icon }}</span
        >
        <span>{{ item.name }}</span>
      </RouterLink>
    </nav>

    <div class="px-8 mt-auto pb-4">
      <p
        class="text-[13px] text-white/30 font-medium tracking-tight leading-relaxed"
      >
        Creado con ❤️ por <br />
        <a
          href="https://www.linkedin.com/in/rodrigolauramoreno/"
          target="_blank"
          rel="noopener noreferrer"
          class="text-white/50 hover:text-white transition-colors cursor-pointer underline-offset-4 hover:underline"
        >
          Rodrigo Sebastián Laura Moreno
        </a>
      </p>
    </div>
  </aside>
</template>
