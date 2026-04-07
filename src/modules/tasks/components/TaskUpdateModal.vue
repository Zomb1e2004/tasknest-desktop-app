<script setup lang="ts">
import { ref } from "vue";
import Modal from "../../../shared/components/Modal.vue";
import Button from "../../../shared/components/Button.vue";
import type { Task } from "../models/TaskModel";

const props = defineProps<{
  task: Task;
}>();

const emit = defineEmits<{
  (e: "save", updates: Partial<Task>): void;
  (e: "close"): void;
}>();

const title = ref(props.task.title);
const description = ref(props.task.description);
const priority = ref(props.task.priority);
const completed = ref(props.task.completed);
const isPriorityOpen = ref(false);

const priorities: ("Alto" | "Medio" | "Bajo")[] = ["Alto", "Medio", "Bajo"];

const togglePriority = () => {
  isPriorityOpen.value = !isPriorityOpen.value;
};

const selectPriority = (p: "Alto" | "Medio" | "Bajo") => {
  priority.value = p;
  isPriorityOpen.value = false;
};

const handleSave = () => {
  if (!title.value.trim()) return;

  emit("save", {
    title: title.value,
    description: description.value,
    priority: priority.value,
    completed: completed.value,
  });
  emit("close");
};
</script>

<template>
  <Modal :close-on-click-outside="true" @close="emit('close')">
    <div class="flex flex-col gap-6 w-full text-left">
      <div class="flex flex-col gap-2">
        <div
          class="w-12 h-12 bg-black/5 rounded-2xl flex items-center justify-center mb-1"
        >
          <span class="material-symbols-outlined text-[24px] text-black">
            edit_note
          </span>
        </div>
        <h3 class="text-xl font-bold text-black leading-tight">
          Actualizar tarea
        </h3>
        <p class="text-black/60 font-medium text-[14px] leading-relaxed">
          Modifica los detalles de tu tarea.
        </p>
      </div>

      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="text-[12px] font-bold text-black/40 uppercase tracking-wider ml-1">Título</label>
          <input
            v-model="title"
            type="text"
            placeholder="¿Qué hay que hacer?"
            class="w-full px-4 py-2.5 bg-black/5 border border-black/10 rounded-xl text-sm font-semibold focus:outline-hidden focus:border-black/20 focus:bg-black/[0.07] transition-all"
            @keyup.enter="handleSave"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-[12px] font-bold text-black/40 uppercase tracking-wider ml-1">Descripción</label>
          <textarea
            v-model="description"
            placeholder="Añade más detalles..."
            rows="3"
            class="w-full px-4 py-2.5 bg-black/5 border border-black/10 rounded-xl text-sm font-semibold focus:outline-hidden focus:border-black/20 focus:bg-black/[0.07] transition-all resize-none"
          ></textarea>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div class="flex flex-col gap-1.5 relative">
            <label class="text-[12px] font-bold text-black/40 uppercase tracking-wider ml-1">Prioridad</label>
            <div 
              @click="togglePriority"
              class="w-full px-4 py-2.5 bg-black/5 border border-black/10 rounded-xl text-sm font-semibold flex items-center justify-between cursor-pointer hover:bg-black/[0.07] transition-all"
              :class="isPriorityOpen ? 'border-black/20 bg-black/[0.07]' : ''"
            >
              <span>{{ priority }}</span>
              <span 
                class="material-symbols-outlined text-[20px] text-black/40 transition-transform duration-300"
                :class="isPriorityOpen ? 'rotate-180' : ''"
              >
                expand_more
              </span>
            </div>

            <!-- Custom Dropdown -->
            <transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="translate-y-1 opacity-0"
              enter-to-class="translate-y-0 opacity-100"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="translate-y-0 opacity-100"
              leave-to-class="translate-y-1 opacity-0"
            >
              <div 
                v-if="isPriorityOpen"
                class="absolute top-full left-0 w-full mt-2 bg-white border border-black/10 rounded-xl shadow-xl z-50 overflow-hidden py-1"
              >
                <button
                  v-for="p in priorities"
                  :key="p"
                  @click="selectPriority(p)"
                  class="w-full px-4 py-2.5 text-sm font-semibold text-left transition-colors flex items-center justify-between cursor-pointer"
                  :class="[
                    priority === p 
                      ? 'bg-black/5 text-black' 
                      : 'text-black/60 hover:bg-black/3 hover:text-black'
                  ]"
                >
                  {{ p }}
                  <span v-if="priority === p" class="material-symbols-outlined text-[16px]">check</span>
                </button>
              </div>
            </transition>
          </div>
        </div>

        <div class="flex items-center gap-3 px-1 py-1">
          <button 
            @click="completed = !completed"
            class="flex items-center gap-2.5 group cursor-pointer"
          >
            <div
              :class="[
                'w-5 h-5 border-2 rounded-md transition-all flex items-center justify-center',
                completed ? 'bg-black border-black' : 'border-black/20 group-hover:border-black/40'
              ]"
            >
              <span v-if="completed" class="material-symbols-outlined text-[14px] text-white font-bold">check</span>
            </div>
            <span class="text-sm font-bold text-black/80">Marcar como completada</span>
          </button>
        </div>
      </div>

      <div class="flex items-center justify-end gap-3 mt-2">
        <Button variant="ghost" @click="emit('close')">Cancelar</Button>
        <Button
          :disabled="!title.trim()"
          @click="handleSave"
        >
          Guardar cambios
        </Button>
      </div>
    </div>
  </Modal>
</template>
