<script setup lang="ts">
import Page from "../../../shared/components/Page.vue";
import { useUser } from "../../../shared/composables/useUser";
// import { useToast } from "../../../shared/composables/useToast";
import { motion } from "motion-v";
import { getWordByIndex } from "../../../shared/utils/getWordByIndex";
// import Button from "../../../shared/components/Button.vue";
// import { ref } from "vue";
// import Modal from "../../../shared/components/Modal.vue";
// import { deleteDB } from "idb";

// View Composables
import { useDashboardView } from "../../dashboard/composables/useDashboardView";
import { useNotesView } from "../../notes/composables/useNotesView";
import { useTasksView } from "../../tasks/composables/useTasksView";

const { userName } = useUser();
// const { addToast } = useToast();

const { isDashboardGridView } = useDashboardView();
const { isGridView: isNotesGridView } = useNotesView();
const { isGridView: isTasksGridView } = useTasksView();

// const isConfirmModalOpen = ref(false);

// const handleResetData = () => {
//   isConfirmModalOpen.value = true;
// };

// const confirmResetData = async () => {
//   isConfirmModalOpen.value = false;

//   try {
//     // 1. Eliminar Bases de Datos IndexedDB
//     await deleteDB("app-db");

//     // 2. Limpiar LocalStorage
//     localStorage.clear();

//     addToast({
//       title: "Datos eliminados",
//       message: "Se han borrado todos los datos. Reiniciando...",
//       type: "success",
//     });

//     setTimeout(() => {
//       window.location.href = "/";
//     }, 1500);
//   } catch (error) {
//     addToast({
//       title: "Error",
//       message: "No se pudieron eliminar todos los datos correctamente.",
//       type: "error",
//     });
//   }
// };
</script>

<template>
  <Page>
    <div class="flex flex-col gap-5 max-w-4xl">
      <!-- Header Section -->
      <motion.section
        :initial="{ opacity: 0, y: 0 }"
        :animate="{ opacity: 1, y: 0 }"
        class="flex flex-col gap-6 py-8 border-y border-black/5 select-none"
      >
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-2 px-1">
            <span class="material-symbols-outlined text-[16px] text-black/30">
              settings
            </span>
            <p
              class="text-[10px] font-bold uppercase tracking-[0.25em] text-black/30"
            >
              Configuración del Sistema
            </p>
          </div>

          <h2
            class="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-black/90 leading-[1.15]"
          >
            Ajustes de
            <span class="text-black">
              {{ getWordByIndex(userName, 1) || "Usuario" }}
            </span>
            ⚙️
            <br />
            <span
              class="text-black/40 font-semibold text-lg sm:text-xl md:text-2xl mt-3 block"
            >
              Personaliza el comportamiento de tu espacio de trabajo.
            </span>
          </h2>
        </div>
      </motion.section>

      <div class="flex flex-col gap-6">
        <!-- Visual Preferences Card -->
        <motion.div
          :initial="{ opacity: 0, x: 0 }"
          :animate="{ opacity: 1, x: 0 }"
          class="bg-white/60 backdrop-blur-xl border border-black/5 rounded-[2.5rem] p-8 md:p-10 shadow-[0_10px_35px_rgba(0,0,0,0.05)] flex flex-col gap-10"
        >
          <div class="flex flex-col gap-2">
            <h3 class="font-black text-2xl text-black tracking-tight">
              Preferencias de Visualización
            </h3>
            <p class="text-sm font-medium text-black/40">
              Elige cómo se ven tus listas al iniciar la aplicación.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Dashboard Toggle -->
            <div
              @click="isDashboardGridView = !isDashboardGridView"
              class="flex flex-col gap-4 p-6 rounded-4xl border transition-all cursor-pointer group"
              :class="
                isDashboardGridView
                  ? 'bg-black text-white border-black shadow-lg scale-[1.02]'
                  : 'bg-black/4 text-black/40 border-transparent hover:bg-black/6'
              "
            >
              <span class="material-symbols-outlined text-[32px]">
                {{ isDashboardGridView ? "grid_view" : "view_list" }}
              </span>
              <div class="flex flex-col gap-1">
                <span
                  class="text-[10px] font-black uppercase tracking-widest opacity-50"
                  >Dashboard</span
                >
                <span class="text-sm font-bold">{{
                  isDashboardGridView ? "Cuadrícula" : "Lista"
                }}</span>
              </div>
            </div>

            <!-- Notes Toggle -->
            <div
              @click="isNotesGridView = !isNotesGridView"
              class="flex flex-col gap-4 p-6 rounded-4xl border transition-all cursor-pointer group"
              :class="
                isNotesGridView
                  ? 'bg-black text-white border-black shadow-lg scale-[1.02]'
                  : 'bg-black/4 text-black/40 border-transparent hover:bg-black/6'
              "
            >
              <span class="material-symbols-outlined text-[32px]">
                {{ isNotesGridView ? "grid_view" : "view_list" }}
              </span>
              <div class="flex flex-col gap-1">
                <span
                  class="text-[10px] font-black uppercase tracking-widest opacity-50"
                  >Notas</span
                >
                <span class="text-sm font-bold">{{
                  isNotesGridView ? "Cuadrícula" : "Lista"
                }}</span>
              </div>
            </div>

            <!-- Tasks Toggle -->
            <div
              @click="isTasksGridView = !isTasksGridView"
              class="flex flex-col gap-4 p-6 rounded-4xl border transition-all cursor-pointer group"
              :class="
                isTasksGridView
                  ? 'bg-black text-white border-black shadow-lg scale-[1.02]'
                  : 'bg-black/4 text-black/40 border-transparent hover:bg-black/6'
              "
            >
              <span class="material-symbols-outlined text-[32px]">
                {{ isTasksGridView ? "grid_view" : "view_list" }}
              </span>
              <div class="flex flex-col gap-1">
                <span
                  class="text-[10px] font-black uppercase tracking-widest opacity-50"
                  >Tareas</span
                >
                <span class="text-sm font-bold">{{
                  isTasksGridView ? "Cuadrícula" : "Lista"
                }}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <!-- System Actions Card -->
        <!-- <motion.div
          :initial="{ opacity: 0, x: 0 }"
          :animate="{ opacity: 1, x: 0 }"
          class="bg-white/70 backdrop-blur-2xl border border-black/5 rounded-[2.5rem] p-10 shadow-[0_10px_35px_rgba(0,0,0,0.05)] flex flex-col gap-12"
        >
          <div
            class="flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div class="flex flex-col gap-2">
              <h3 class="font-black text-2xl text-black tracking-tight">
                Mantenimiento y Datos
              </h3>
              <p class="text-sm font-medium text-black/40">
                Limpia tu espacio de trabajo y restaura la configuración
                original.
              </p>
            </div>

            <Button
              variant="custom"
              class="bg-red-500! text-white! hover:bg-red-600! transition-colors px-8 py-4.5 rounded-3xl font-bold text-sm"
              @click="handleResetData"
            >
              Borrar Datos y Reiniciar
            </Button>
          </div>

          <div
            class="pt-8 border-t border-black/5 flex flex-col md:flex-row items-center justify-between gap-4"
          >
            <div class="flex flex-col">
              <span
                class="text-[10px] font-bold uppercase tracking-widest text-black/30"
                >Versión del Sistema</span
              >
              <span class="text-sm font-black text-black">v0.2.5</span>
            </div>
            <p
              class="text-[11px] font-medium text-black/20 italic max-w-xs text-center md:text-right"
            >
              Esta acción borrará todas tus notas, tareas y personalizaciones de
              forma permanente.
            </p>
          </div>
        </motion.div> -->
      </div>
    </div>

    <!-- Confirmation Modal -->
    <!-- <Modal v-if="isConfirmModalOpen" @close="isConfirmModalOpen = false">
      <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-2">
          <h3 class="font-black text-2xl text-black tracking-tight">
            ¿Confirmar eliminación?
          </h3>
          <p class="text-sm font-medium text-black/60 leading-relaxed">
            Esta acción es irreversible. Se eliminará permanentemente la
            siguiente información:
          </p>
        </div>

        <ul class="flex flex-col gap-3">
          <li
            class="flex items-center gap-3 text-sm font-bold text-black/80 bg-black/5 p-3 rounded-xl"
          >
            <span class="material-symbols-outlined text-[18px] text-red-500"
              >settings</span
            >
            Preferencias de visualización
          </li>
          <li
            class="flex items-center gap-3 text-sm font-bold text-black/80 bg-black/5 p-3 rounded-xl"
          >
            <span class="material-symbols-outlined text-[18px] text-red-500"
              >person</span
            >
            Nombre de usuario y perfil
          </li>
          <li
            class="flex items-center gap-3 text-sm font-bold text-black/80 bg-black/5 p-3 rounded-xl"
          >
            <span class="material-symbols-outlined text-[18px] text-red-500"
              >image</span
            >
            Foto y personalización
          </li>
          <li
            class="flex items-center gap-3 text-sm font-bold text-black/80 bg-black/5 p-3 rounded-xl"
          >
            <span class="material-symbols-outlined text-[18px] text-red-500"
              >description</span
            >
            Todas tus Tareas & Notas
          </li>
        </ul>

        <div class="flex flex-col gap-3 pt-4">
          <Button
            variant="custom"
            class="bg-red-500! text-white! hover:bg-red-600! w-full py-4 rounded-2xl"
            @click="confirmResetData"
          >
            Confirmar y Borrar Todo
          </Button>
          <Button
            variant="ghost"
            class="w-full py-4 rounded-2xl"
            @click="isConfirmModalOpen = false"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </Modal> -->
  </Page>
</template>

<style scoped>
.py-4\.5 {
  padding-top: 1.125rem;
  padding-bottom: 1.125rem;
}
</style>
