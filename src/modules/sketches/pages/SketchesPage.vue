<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import Page from "../../../shared/components/Page.vue";
import Button from "../../../shared/components/Button.vue";
import SketchesHeader from "../components/SketchesHeader.vue";
import SketchList from "../components/SketchList.vue";
import ScrollToTop from "../../../shared/components/ScrollToTop.vue";
import ScrollDown from "../../../shared/components/ScrollDown.vue";
import { useUser } from "../../../shared/composables/useUser";
import { useToast } from "../../../shared/composables/useToast";
import { useSketchesView } from "../composables/useSketchesView";
import { sketchService } from "../services/SketchService";
import type { Sketch } from "../models/SketchModel";

const { userName } = useUser();
const { addToast } = useToast();
const { isGridView } = useSketchesView();
const router = useRouter();

const sketches = ref<Sketch[]>([]);
const creating = ref(false);

const loadSketches = async () => {
  const all = await sketchService.getAll();
  sketches.value = all.sort((a, b) => b.updatedAt - a.updatedAt);
};

const handleCreate = async () => {
  if (creating.value) return;
  creating.value = true;
  try {
    const sketch = await sketchService.create({
      title: "Sin título",
      strokes: [],
      width: 1600,
      height: 1000,
      thumbnail: "",
      background: "#ffffff",
    } as Omit<Sketch, "id" | "createdAt" | "updatedAt">);
    router.push({ name: "sketch-editor", params: { id: sketch.id } });
  } catch (error) {
    addToast({
      title: "Error",
      message: "No se pudo crear el trazo.",
      type: "error",
    });
  } finally {
    creating.value = false;
  }
};

onMounted(loadSketches);
</script>

<template>
  <Page>
    <div class="flex flex-col gap-6 md:gap-8">
      <SketchesHeader :user-name="userName" :count="sketches.length" />

      <div class="flex items-center gap-3">
        <Button :disabled="creating" :animate-icon="false" @click="handleCreate" icon="add">
          Nuevo trazo
        </Button>

        <div class="flex items-center gap-1 p-1 rounded-xl bg-black/5 dark:bg-white/10 ml-auto">
          <button
            @click="isGridView = true"
            title="Vista cuadrícula"
            class="cursor-pointer flex items-center justify-center w-9 h-9 rounded-lg transition-all"
            :class="isGridView ? 'bg-black text-white dark:bg-white dark:text-black shadow' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'"
          >
            <span class="material-symbols-outlined text-[20px]">grid_view</span>
          </button>
          <button
            @click="isGridView = false"
            title="Vista lista"
            class="cursor-pointer flex items-center justify-center w-9 h-9 rounded-lg transition-all"
            :class="!isGridView ? 'bg-black text-white dark:bg-white dark:text-black shadow' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'"
          >
            <span class="material-symbols-outlined text-[20px]">view_list</span>
          </button>
        </div>
      </div>
    </div>

    <div class="mt-6">
      <SketchList
        :sketches="sketches"
        :is-grid="isGridView"
        @delete="loadSketches"
      />
    </div>

    <ScrollToTop />
    <ScrollDown />
  </Page>
</template>
