<script setup lang="ts">
defineProps<{
  actualDate: string;
  actualGreeting: string;
  userName: string;
}>();
</script>

<template>
  <section
    class="flex flex-col gap-3.5 py-3.5 border-y border-black/10 select-none"
  >
    <div class="flex flex-col gap-5 md:gap-3.5">
      <div
        class="flex flex-col md:flex-row md:items-end justify-between gap-4 w-full"
      >
        <div class="flex flex-col gap-1.5">
          <h2
            class="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-black/90 leading-tight"
          >
            {{ actualGreeting }},
            <span class="text-black">
              {{ userName ?? "Desconocid@" }}
            </span>
            👋
          </h2>
          <span
            class="text-black/40 font-semibold tracking-normal text-lg sm:text-xl md:text-2xl block"
          >
            Resumen de productividad hoy.
          </span>
        </div>

        <div class="flex flex-col md:items-end gap-1">
          <span
            class="text-xs sm:text-sm font-bold text-black/40 uppercase tracking-[0.2em]"
          >
            {{ actualDate }}
          </span>
        </div>
      </div>

      <p
        class="text-[15px] md:text-base font-medium text-black/50 leading-relaxed max-w-2xl"
      >
        Revisa tus tareas pendientes, tus notas recientes y mantén el control de
        tus proyectos en un solo lugar.
      </p>
    </div>
  </section>
</template>
