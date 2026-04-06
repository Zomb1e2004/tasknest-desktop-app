<script setup lang="ts">
import { getWordByIndex } from "../../../shared/utils/getWordByIndex";

defineProps<{
  userName: string;
}>();
</script>

<template>
  <section class="flex flex-col gap-3.5 select-none">
    <hr class="border-t border-black/10" />

    <div class="flex flex-col gap-5 md:gap-3.5">
      <h2
        class="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-black/90 leading-tight"
      >
        ¡Hola,
        <span class="text-black">{{
          getWordByIndex($props.userName, 1) || "Desconocid@"
        }}</span
        >! :D
        <br class="hidden md:block" />
        <span
          class="text-black/40 font-semibold tracking-normal text-xl sm:text-2xl md:text-4xl mt-3 block"
        >
          Es el momento perfecto para organizar tus ideas.
        </span>
      </h2>

      <p
        class="text-[15px] md:text-base font-medium text-black/50 leading-relaxed"
      >
        Todas tus notas están aquí, listas para que sigas creando y avanzando
        con facilidad.
      </p>
    </div>

    <hr class="border-t border-black/10 my-4" />
  </section>
</template>
