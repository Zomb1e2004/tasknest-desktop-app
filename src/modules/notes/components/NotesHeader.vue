<script setup lang="ts">
import { getWordByIndex } from "../../../shared/utils/getWordByIndex";

defineProps<{
  userName: string;
}>();
</script>

<template>
  <section
    class="flex flex-col gap-3.5 py-3.5 border-y border-black/10 select-none"
  >
    <div class="flex flex-col gap-5 md:gap-3.5">
      <div class="flex flex-col gap-2.5">
        <div class="flex items-center gap-2 px-1">
          <span class="material-symbols-outlined text-[15px] text-black/30"
            >sticky_note_2</span
          >
          <p
            class="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30"
          >
            Mis Notas
          </p>
        </div>

        <h2
          class="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-black/90 leading-tight"
        >
          ¡Hola,
          <span class="text-black">{{
            getWordByIndex($props.userName, 1) || "Desconocid@"
          }}</span
          >! ✨
          <br class="hidden md:block" />
          <span
            class="text-black/40 font-semibold tracking-normal text-xl sm:text-2xl md:text-4xl mt-3 block"
          >
            Es el momento perfecto para organizar tus ideas.
          </span>
        </h2>
      </div>

      <p
        class="text-[15px] md:text-base font-medium text-black/50 leading-relaxed max-w-2xl"
      >
        Todas tus notas están aquí, listas para que sigas creando y avanzando
        con facilidad.
      </p>
    </div>
  </section>
</template>
