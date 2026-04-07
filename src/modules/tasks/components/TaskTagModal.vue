<script setup lang="ts">
import Modal from "../../../shared/components/Modal.vue";
import Button from "../../../shared/components/Button.vue";
import type { Tag } from "../../../shared/models/TagModel";

defineProps<{
  tags: string[];
  allTags: Tag[];
  newTag: string;
}>();

const emit = defineEmits<{
  (e: "update:newTag", value: string): void;
  (e: "addTag", tagName: string): void;
  (e: "removeTag", tagName: string): void;
  (e: "clearTags"): void;
  (e: "close"): void;
}>();
</script>

<template>
  <Modal :close-on-click-outside="true" @close="emit('close')">
    <div class="flex flex-col gap-6 w-full text-left">
      <div class="flex flex-col gap-2">
        <div
          class="w-12 h-12 bg-black/5 rounded-2xl flex items-center justify-center mb-1"
        >
          <span class="material-symbols-outlined text-[24px] text-black">
            label
          </span>
        </div>
        <h3 class="text-xl font-bold text-black leading-tight">
          Gestionar etiquetas
        </h3>
        <p class="text-black/60 font-medium text-[14px] leading-relaxed">
          Puedes asignar hasta <span class="font-bold text-black">3 etiquetas</span> para categorizar esta tarea.
        </p>
      </div>

      <div class="flex flex-col gap-4">
        <div class="flex flex-wrap gap-2">
          <div
            v-for="tag in tags"
            :key="tag"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-black/5 rounded-xl border border-black/10 group/tag"
          >
            <span class="text-[13px] font-bold text-black/70">#{{ tag }}</span>
            <button
              @click="emit('removeTag', tag)"
              class="flex items-center justify-center w-5 h-5 rounded-full hover:bg-black/10 text-black/30 hover:text-black transition-all cursor-pointer"
            >
              <span class="material-symbols-outlined text-[14px]">close</span>
            </button>
          </div>
          <div
            v-if="tags.length === 0"
            class="text-black/30 text-[13px] font-medium py-1"
          >
            No hay etiquetas asignadas
          </div>
        </div>

        <div class="flex items-center gap-2">
          <div class="relative flex-1">
            <input
              :value="newTag"
              @input="
                emit('update:newTag', ($event.target as HTMLInputElement).value)
              "
              type="text"
              :placeholder="tags.length >= 3 ? 'Límite de 3 alcanzado' : 'Nueva etiqueta...'"
              :disabled="tags.length >= 3"
              class="w-full px-4 py-2.5 bg-black/5 border border-black/10 rounded-xl text-sm font-semibold focus:outline-hidden focus:border-black/20 focus:bg-black/[0.07] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              @keyup.enter="tags.length < 3 && emit('addTag', newTag)"
            />
          </div>
          <Button @click="emit('addTag', newTag)" :disabled="!newTag.trim() || tags.length >= 3">
            Añadir
          </Button>
        </div>

        <div
          v-if="tags.length < 3 && allTags.filter((t) => !tags.includes(t.name.toLowerCase())).length > 0"
          class="flex flex-wrap gap-2 mt-2"
        >
          <button
            v-for="tag in Array.from(new Map(allTags.map(t => [t.name.toLowerCase(), t])).values()).filter((t) => !tags.includes(t.name.toLowerCase()))"
            :key="tag.id"
            @click="emit('addTag', tag.name)"
            class="px-2.5 py-1.5 rounded-lg border border-black/5 bg-black/2 hover:bg-black/5 text-[12px] font-bold text-black/40 hover:text-black transition-all cursor-pointer"
          >
            + {{ tag.name }}
          </button>
        </div>
      </div>

      <div
        class="flex items-center mt-2"
        :class="tags.length > 0 ? 'justify-between' : 'justify-end'"
      >
        <button
          v-if="tags.length > 0"
          @click="emit('clearTags')"
          class="flex items-center gap-1.5 text-[12px] font-semibold text-black/30 hover:text-red-400 transition-colors cursor-pointer"
        >
          <span class="material-symbols-outlined text-[15px]">remove_done</span>
          Limpiar todas
        </button>
        <Button variant="ghost" @click="emit('close')">Cerrar</Button>
      </div>
    </div>
  </Modal>
</template>
