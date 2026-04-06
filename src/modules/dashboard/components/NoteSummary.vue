<script setup lang="ts">
import { computed } from "vue";
import type { Note } from "../../notes/models/NoteModel";

const props = defineProps<{
  notes: Note[];
}>();

const mostVisitedNote = computed(() => {
  if (!props.notes || props.notes.length === 0) return null;
  return [...props.notes].sort((a, b) => {
    const visitsDiff = (b.totalVisits || 0) - (a.totalVisits || 0);
    if (visitsDiff !== 0) return visitsDiff;

    const dateA = new Date(a.updatedAt || a.createdAt).getTime();
    const dateB = new Date(b.updatedAt || b.createdAt).getTime();
    return dateB - dateA;
  })[0];
});

const leastVisitedNote = computed(() => {
  if (!props.notes || props.notes.length === 0) return null;
  return [...props.notes].sort((a, b) => {
    const visitsDiff = (a.totalVisits || 0) - (b.totalVisits || 0);
    if (visitsDiff !== 0) return visitsDiff;

    const dateA = new Date(a.updatedAt || a.createdAt).getTime();
    const dateB = new Date(b.updatedAt || b.createdAt).getTime();
    return dateB - dateA;
  })[0];
});
</script>

<template>
  <article
    class="bg-[#faf9f5] border border-black/5 rounded-3xl p-8 md:p-10 font-['Manrope'] flex flex-col justify-center items-center flex-1"
  >
    <div class="flex flex-col items-center w-full">
      <h3
        class="text-[11px] font-bold tracking-[0.18em] text-black/40 uppercase mb-8 text-center"
      >
        Resumen de notas
      </h3>

      <div
        class="flex flex-col 2xl:flex-row items-center justify-center gap-8 2xl:gap-12 w-full h-full"
      >
        <!-- Más leída -->
        <div
          class="flex flex-col items-center flex-1 w-full justify-between h-full"
        >
          <div class="flex flex-col gap-1.5 items-center mb-4">
            <span
              class="text-[28px] md:text-[40px] leading-none font-extrabold text-black/90"
              >{{ mostVisitedNote?.totalVisits || 0 }}</span
            >
            <span
              class="text-[10px] font-bold tracking-widest text-[#4caf50]/80 uppercase text-center"
            >
              Más leída
            </span>
          </div>

          <div class="w-full flex flex-col gap-3 items-center">
            <p
              v-if="mostVisitedNote"
              class="text-[13px] font-bold text-black/70 text-center line-clamp-2 px-4 italic"
            >
              "{{ mostVisitedNote.title }}"
            </p>
            <p v-else class="text-[13px] font-bold text-black/30 text-center">
              Sin notas
            </p>
          </div>
        </div>

        <!-- Separador -->
        <div
          class="hidden 2xl:block w-px bg-black/10 self-stretch min-h-[80px]"
        ></div>
        <hr class="2xl:hidden w-1/2 border-t border-black/10 my-1" />

        <!-- Menos leída -->
        <div
          class="flex flex-col items-center flex-1 w-full justify-between h-full"
        >
          <div class="flex flex-col gap-1.5 items-center mb-4">
            <span
              class="text-[28px] md:text-[40px] leading-none font-extrabold text-black/90"
              >{{ leastVisitedNote?.totalVisits || 0 }}</span
            >
            <span
              class="text-[10px] font-bold tracking-widest text-[#f44336]/80 uppercase text-center"
            >
              Menos leída
            </span>
          </div>

          <div class="w-full flex flex-col gap-3 items-center">
            <p
              v-if="leastVisitedNote"
              class="text-[13px] font-bold text-black/70 text-center line-clamp-2 px-4 italic"
            >
              "{{ leastVisitedNote.title }}"
            </p>
            <p v-else class="text-[13px] font-bold text-black/30 text-center">
              Sin notas
            </p>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>
