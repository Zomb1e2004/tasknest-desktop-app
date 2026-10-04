<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { motion } from "motion-v";
import type { Task } from "../models/TaskModel";
import { tagService } from "../../../shared/services/TagService";
import { useToast } from "../../../shared/composables/useToast";
import type { Tag } from "../../../shared/models/TagModel";
import TaskOptions from "./TaskOptions.vue";
import TaskDeleteModal from "./TaskDeleteModal.vue";
import TaskTagModal from "./TaskTagModal.vue";
import TaskUpdateModal from "./TaskUpdateModal.vue";

const props = withDefaults(
  defineProps<{
    task: Task;
    isGrid?: boolean;
    showOptions?: boolean;
  }>(),
  {
    isGrid: false,
    showOptions: true,
  },
);

const emit = defineEmits<{
  (e: "delete", id: string): void;
  (e: "update", id: string, updates: Partial<Task>): void;
  (e: "tagCreated"): void;
}>();

const { addToast } = useToast();

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getPriorityClass = (priority: string) => {
  switch (priority) {
    case "Alto":
      return "bg-black text-white dark:bg-white dark:text-black";
    case "Medio":
      return "border border-black text-black dark:border-white/15 dark:text-white";
    case "Bajo":
      return "bg-black/[0.05] text-black/40 border border-transparent dark:bg-white/10 dark:text-white/40 dark:border-transparent";
    default:
      return "bg-black/5 text-black/30 border border-transparent dark:bg-white/10 dark:text-white/30 dark:border-transparent";
  }
};

const isOptionsOpen = ref(false);
const optionsButtonRef = ref<HTMLElement | null>(null);
const dropdownPos = ref({ top: 0, left: 0 });

const toggleOptions = () => {
  if (!isOptionsOpen.value && optionsButtonRef.value) {
    const rect = optionsButtonRef.value.getBoundingClientRect();
    dropdownPos.value = {
      top: rect.bottom + window.scrollY + 8,
      left: rect.right + window.scrollX - 160,
    };
  }
  isOptionsOpen.value = !isOptionsOpen.value;
};

const closeOptions = (e: Event) => {
  const target = e.target as HTMLElement;
  if (!target.closest(".options-container")) {
    isOptionsOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", closeOptions);
});

onUnmounted(() => {
  document.removeEventListener("click", closeOptions);
});

const showUpdateModal = ref(false);
const showDeleteModal = ref(false);

const handleDeleteClick = () => {
  isOptionsOpen.value = false;
  showDeleteModal.value = true;
};

const handleConfirmDelete = () => {
  showDeleteModal.value = false;
  emit("delete", props.task.id);
  addToast({
    title: "Tarea eliminada",
    message: "La tarea se ha borrado correctamente.",
    type: "success",
  });
};

const showTagModal = ref(false);
const newTag = ref("");
const allTags = ref<Tag[]>([]);

const loadTags = async () => {
  allTags.value = await tagService.getAll();
};

const handleTagsClick = () => {
  isOptionsOpen.value = false;
  showTagModal.value = true;
  loadTags();
};

const addTag = async (tagName: string) => {
  const cleanName = tagName.trim().toLowerCase();
  if (!cleanName) return;

  if (props.task.tags.includes(cleanName)) {
    addToast({
      title: "Etiqueta ya existe",
      message: "Esta tarea ya tiene esa etiqueta.",
      type: "error",
    });
    return;
  }

  if (props.task.tags.length >= 3) {
    addToast({
      title: "Límite alcanzado",
      message: "Una tarea solo puede tener un máximo de 3 etiquetas.",
      type: "error",
    });
    return;
  }

  try {
    const existing = await tagService.getByName(cleanName);
    if (!existing) {
      await tagService.create({ name: cleanName });
      emit("tagCreated");
    }

    const updatedTags = [...props.task.tags, cleanName];
    emit("update", props.task.id, { tags: updatedTags });
    newTag.value = "";
    addToast({
      title: "Etiqueta añadida",
      message: `Se ha añadido "${cleanName}" a la tarea.`,
      type: "success",
    });
  } catch (error) {
    addToast({
      title: "Error",
      message: "No se pudo añadir la etiqueta.",
      type: "error",
    });
  }
};

const removeTag = (tagName: string) => {
  const updatedTags = props.task.tags.filter((t) => t !== tagName);
  emit("update", props.task.id, { tags: updatedTags });
  addToast({
    title: "Etiqueta eliminada",
    message: "Se ha quitado la etiqueta de la tarea.",
    type: "success",
  });
};

const clearAllTags = () => {
  emit("update", props.task.id, { tags: [] });
  addToast({
    title: "Etiquetas eliminadas",
    message: "Se han quitado todas las etiquetas de la tarea.",
    type: "success",
  });
};
</script>

<template>
  <motion.article
    layout
    :initial="{ opacity: 0, y: 0 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.25, ease: 'easeOut' }"
    :class="[
      'group relative bg-white dark:bg-neutral-900 border rounded-3xl flex transition-all duration-300 cursor-pointer overflow-visible',
      isGrid
        ? 'flex-col gap-3 p-5 shadow-sm hover:shadow-lg border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20'
        : 'flex-row items-center gap-3.5 p-4 hover:bg-black/2 dark:hover:bg-white/10 border-black/10 dark:border-white/10',
      task.completed ? 'opacity-60' : '',
    ]"
    @click="showUpdateModal = true"
  >
    <div
      v-if="isGrid"
      class="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 bg-linear-to-br from-black/2 dark:from-white/10 to-transparent rounded-3xl"
    />

    <div
      layout
      @click.stop="emit('update', task.id, { completed: !task.completed })"
      :class="[
        'w-[22px] h-[22px] border-2 rounded-lg transition-all duration-300 shrink-0 flex items-center justify-center relative z-10',
        task.completed
          ? 'bg-black border-black/80 dark:bg-white dark:border-white/80 shadow-sm'
          : 'border-black/20 dark:border-white/15 group-hover:border-black/40 dark:group-hover:border-white/40',
      ]"
    >
      <svg
        v-if="task.completed"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="3.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="w-3.5 h-3.5 text-white dark:text-black"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>

    <div layout class="flex-1 flex flex-col gap-1.5 relative z-10">
      <div class="flex items-start justify-between gap-4">
        <h3
          layout
          :class="[
            'text-[15px] font-bold leading-tight transition-all duration-300',
            task.completed
              ? 'text-black/30 dark:text-white/30 line-through decoration-black/20 dark:decoration-white/20'
              : 'text-black/80 dark:text-white/80 group-hover:text-black dark:group-hover:text-white',
          ]"
        >
          {{ task.title }}
        </h3>

        <div 
          v-if="showOptions"
          class="flex items-center gap-1 options-container"
        >
          <button
            ref="optionsButtonRef"
            @click.stop="toggleOptions"
            class="flex cursor-pointer items-center justify-center w-8 h-8 rounded-lg text-black/30 dark:text-white/30 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all"
            :class="isOptionsOpen ? 'bg-black/5 dark:bg-white/10 text-black dark:text-white' : ''"
          >
            <span class="material-symbols-outlined text-[20px]">
              more_vert
            </span>
          </button>
        </div>
      </div>

      <div layout class="flex items-center gap-3">
        <span
          layout
          :class="[
            'px-2 py-[2px] text-[10px] font-bold uppercase rounded-full tracking-wider transition-all duration-300',
            task.completed
              ? 'bg-black/3 dark:bg-white/10 text-black/20 dark:text-white/20 border-black/5 dark:border-white/10'
              : getPriorityClass(task.priority),
          ]"
        >
          {{ task.priority }}
        </span>
        <div
          v-if="task.tags?.length"
          class="flex items-center gap-2 overflow-hidden"
        >
          <span
            v-for="tag in task.tags.slice(0, 3)"
            :key="tag"
            layout
            :class="[
              'text-[11px] font-bold tracking-wide transition-colors duration-300 py-px px-1.5 rounded-md bg-black/5 dark:bg-white/10 flex items-center',
              task.completed ? 'text-black/10 dark:text-white/20' : 'text-black/40 dark:text-white/40 group-hover:text-black/60 dark:group-hover:text-white/60',
            ]"
          >
            # <span class="capitalize ml-0.5">{{ tag }}</span>
          </span>
        </div>
      </div>
    </div>

    <div
      layout
      :class="[
        'text-[12px] font-bold transition-all duration-300 relative z-10',
        task.completed
          ? 'text-black/20 dark:text-white/20'
          : 'text-black/30 dark:text-white/30 group-hover:text-black/60 dark:group-hover:text-white/60',
        isGrid ? 'order-3 mt-auto' : 'shrink-0',
      ]"
    >
      {{ formatTime(task.createdAt) }}
    </div>

    <Teleport to="body">
      <TaskOptions
        :show="isOptionsOpen"
        :top="dropdownPos.top"
        :left="dropdownPos.left"
        @tags="handleTagsClick"
        @delete="handleDeleteClick"
      />

      <TaskDeleteModal
        v-if="showDeleteModal"
        @confirm="handleConfirmDelete"
        @close="showDeleteModal = false"
      />

      <TaskTagModal
        v-if="showTagModal"
        :tags="task.tags"
        :all-tags="allTags"
        v-model:new-tag="newTag"
        @add-tag="addTag"
        @remove-tag="removeTag"
        @clear-tags="clearAllTags"
        @close="showTagModal = false"
      />
 
      <TaskUpdateModal
        v-if="showUpdateModal"
        :task="task"
        @save="updates => emit('update', task.id, updates)"
        @close="showUpdateModal = false"
      />
    </Teleport>
  </motion.article>
</template>

