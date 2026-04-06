<script setup lang="ts">
import { ref, computed, onUnmounted, watch, useTemplateRef } from "vue";
import { marked } from "marked";
import NoteBadge from "./NoteBadge.vue";
import BadgeButton from "../../../shared/components/BadgeButton.vue";
import { useToast } from "../../../shared/composables/useToast";

const content = defineModel<string>({ default: "" });
const props = defineProps<{
  format: "md" | "txt";
  pinned?: boolean;
  noteId?: string;
}>();

const { addToast } = useToast();
const textareaRef = useTemplateRef<HTMLTextAreaElement>("textarea");
const hasSelection = ref(false);
const isSpeaking = ref(false);
let currentUtterance: SpeechSynthesisUtterance | null = null;

const updateSelection = () => {
  const el = textareaRef.value;
  if (el) {
    hasSelection.value = el.selectionStart !== el.selectionEnd;
  }
};

const applyMarkdown = (prefix: string, suffix: string = "") => {
  const el = textareaRef.value;
  if (!el) return;

  const start = el.selectionStart;
  const end = el.selectionEnd;
  const text = content.value;
  const selection = text.substring(start, end);
  const before = text.substring(0, start);
  const after = text.substring(end);

  if (start !== end) {
    content.value = before + prefix + selection + suffix + after;
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  } else {
    const isList = prefix.includes("-") || prefix.includes(".");
    const isStartOfLine = start === 0 || text[start - 1] === "\n";
    const finalPrefix = isList && !isStartOfLine ? `\n${prefix}` : prefix;

    content.value = before + finalPrefix + suffix + after;

    setTimeout(() => {
      el.focus();
      const newCursorPos = start + finalPrefix.length;
      el.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "Enter") {
    const el = e.target as HTMLTextAreaElement;
    const start = el.selectionStart;
    const text = content.value;

    const lastNewline = text.lastIndexOf("\n", start - 1);
    const lineStart = lastNewline + 1;
    const line = text.substring(lineStart, start);

    const ulMatch = line.match(/^(\s*)([-+*])\s+(.*)$/);
    const olMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/);

    if (ulMatch || olMatch) {
      const match = ulMatch || olMatch!;
      const indent = match[1];
      const bullet = match[2];
      const lineContent = match[3];

      if (lineContent.trim() === "") {
        e.preventDefault();
        const before = text.substring(0, lineStart);
        const after = text.substring(start);
        content.value = before + after;
        setTimeout(() => {
          el.setSelectionRange(lineStart, lineStart);
        }, 0);
        return;
      }

      e.preventDefault();
      let nextPrefix = `${indent}${bullet} `;
      if (olMatch) {
        const nextNum = parseInt(bullet) + 1;
        nextPrefix = `${indent}${nextNum}. `;
      }

      const before = text.substring(0, start);
      const after = text.substring(start);
      content.value = before + "\n" + nextPrefix + after;

      setTimeout(() => {
        const newPos = start + nextPrefix.length + 1;
        el.setSelectionRange(newPos, newPos);
      }, 0);
    }
  }
};

const storageKey = computed(() =>
  props.noteId ? `preview-mode-${props.noteId}` : "preview-mode-default",
);

const isPreviewDark = ref(localStorage.getItem(storageKey.value) === "true");

watch(isPreviewDark, (newVal) => {
  localStorage.setItem(storageKey.value, newVal.toString());
});

const isFocused = ref(false);

const charCount = computed(() => content.value.length);
const wordCount = computed(() => {
  const trimmed = content.value.trim();
  return trimmed === "" ? 0 : trimmed.split(/\s+/).length;
});

const wpm = ref(0);
let startTime: number | null = null;
let idleTimer: ReturnType<typeof setTimeout> | null = null;
let wpmInterval: ReturnType<typeof setInterval> | null = null;

const previewHtml = computed(() => {
  if (props.format !== "md") return "";
  return marked.parse(content.value);
});

const stopTracking = () => {
  if (wpmInterval) {
    clearInterval(wpmInterval);
    wpmInterval = null;
  }
};

const startTracking = () => {
  if (wpmInterval) return;
  wpmInterval = setInterval(() => {
    if (startTime === null || wordCount.value === 0) {
      wpm.value = 0;
      return;
    }
    const minutes = (Date.now() - startTime) / 60_000;
    wpm.value = Math.round(wordCount.value / minutes);
  }, 1000);
};

const onInput = () => {
  if (startTime === null) startTime = Date.now();
  startTracking();
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    stopTracking();
    startTime = null;
    wpm.value = 0;
  }, 3000);
};

const handleTextToSpeech = () => {
  if (isSpeaking.value) {
    window.speechSynthesis.cancel();
    isSpeaking.value = false;
    return;
  }

  if (!content.value.trim()) {
    addToast({
      title: "Contenido vacío",
      message: "No hay texto para leer.",
      type: "warning",
    });
    return;
  }

  try {
    currentUtterance = new SpeechSynthesisUtterance(content.value);

    const voices = window.speechSynthesis.getVoices();
    const spanishVoices = voices.filter((v) => v.lang.startsWith("es"));

    const femaleVoice = spanishVoices.find(
      (v) =>
        v.name.includes("Helena") ||
        v.name.includes("Sabina") ||
        v.name.includes("Laura") ||
        v.name.includes("Luciana") ||
        v.name.includes("Google"),
    );

    if (femaleVoice) {
      currentUtterance.voice = femaleVoice;
    } else if (spanishVoices.length > 0) {
      currentUtterance.voice = spanishVoices[0];
    }

    currentUtterance.lang = "es-PE";

    currentUtterance.onstart = () => {
      isSpeaking.value = true;
    };

    currentUtterance.onend = () => {
      isSpeaking.value = false;
    };

    currentUtterance.onerror = (event) => {
      isSpeaking.value = false;
      if (event.error === "interrupted" || event.error === "canceled") {
        return;
      }
      addToast({
        title: "Error de lectura",
        message: "Ocurrió un problema con la síntesis de voz.",
        type: "error",
      });
    };

    window.speechSynthesis.speak(currentUtterance);
  } catch (error) {
    addToast({
      title: "No soportado",
      message: "Tu navegador no soporta texto a voz nativo.",
      type: "error",
    });
  }
};

const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(content.value);
    addToast({
      title: "Contenido copiado",
      message: "El texto se ha copiado al portapapeles.",
      type: "success",
    });
  } catch (error) {
    addToast({
      title: "Error al copiar",
      message: "No se pudo copiar el contenido.",
      type: "error",
    });
  }
};

onUnmounted(() => {
  stopTracking();
  if (idleTimer) clearTimeout(idleTimer);
  window.speechSynthesis.cancel();
});
</script>

<template>
  <section class="flex flex-col flex-1 min-h-0 w-full gap-3">
    <div class="flex-1 min-h-0 flex flex-col md:flex-row gap-4">
      <div
        class="relative flex-1 min-h-0 rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col"
        :class="isFocused ? 'border-black/25' : 'border-black/10'"
      >
        <div
          class="flex items-center gap-1 px-3 py-2 border-b border-black/5 bg-black/2"
        >
          <button
            type="button"
            class="cursor-pointer p-1.5 rounded-lg hover:bg-black/5 transition-colors group flex items-center gap-1.5 text-black/40 hover:text-black/80"
            title="Lista con viñetas"
            @click="applyMarkdown('- ')"
          >
            <span class="material-symbols-outlined text-[18px]">
              format_list_bulleted
            </span>
          </button>
          <button
            type="button"
            class="cursor-pointer p-1.5 rounded-lg hover:bg-black/5 transition-colors group flex items-center gap-1.5 text-black/40 hover:text-black/80"
            title="Lista numerada"
            @click="applyMarkdown('1. ')"
          >
            <span class="material-symbols-outlined text-[18px]">
              format_list_numbered
            </span>
          </button>

          <div class="w-px h-4 bg-black/5 mx-1"></div>

          <button
            type="button"
            class="p-1.5 rounded-lg transition-all duration-200 group flex items-center gap-1.5"
            :class="
              !hasSelection
                ? 'opacity-20 cursor-not-allowed'
                : 'cursor-pointer hover:bg-black/5 text-black/40 hover:text-black/80'
            "
            :disabled="!hasSelection"
            title="Negrita"
            @click="applyMarkdown('**', '**')"
          >
            <span class="material-symbols-outlined text-[18px]">
              format_bold
            </span>
          </button>
          <button
            type="button"
            class="p-1.5 rounded-lg transition-all duration-200 group flex items-center gap-1.5"
            :class="
              !hasSelection
                ? 'opacity-20 cursor-not-allowed'
                : 'cursor-pointer hover:bg-black/5 text-black/40 hover:text-black/80'
            "
            :disabled="!hasSelection"
            title="Cursiva"
            @click="applyMarkdown('_', '_')"
          >
            <span class="material-symbols-outlined text-[18px]">
              format_italic
            </span>
          </button>
        </div>

        <textarea
          ref="textarea"
          v-model="content"
          placeholder="Empieza a escribir tus pensamientos más brillantes..."
          class="flex-1 w-full resize-none bg-transparent outline-none px-4 md:px-6 py-5 text-[14px] md:text-[15px] leading-[1.75] font-medium text-black/80 placeholder:text-black/25 overflow-y-auto font-['Manrope'] transition-colors duration-200"
          @input="onInput"
          @keydown="handleKeydown"
          @select="updateSelection"
          @click="updateSelection"
          @keyup="updateSelection"
          @focus="
            isFocused = true;
            updateSelection();
          "
          @blur="isFocused = false"
        />
      </div>

      <div
        v-if="format === 'md'"
        class="hidden md:block flex-1 min-h-0 rounded-2xl border transition-all duration-300 overflow-y-auto"
        :class="
          isPreviewDark
            ? 'bg-[#121212] border-white/10'
            : 'bg-black/2 border-black/10'
        "
      >
        <div
          class="p-6 prose-preview"
          :class="{ 'dark-theme': isPreviewDark }"
          v-html="previewHtml"
        ></div>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <NoteBadge
        :icon="format === 'md' ? 'markdown' : 'description'"
        :value="format.toUpperCase()"
      />

      <NoteBadge
        :icon="pinned ? 'keep' : 'keep_off'"
        :value="pinned ? 'Fijada' : 'No fijada'"
      />

      <NoteBadge
        icon="text_fields"
        :value="wordCount"
        :label="wordCount === 1 ? 'Palabra' : 'Palabras'"
      />

      <NoteBadge
        icon="tag"
        :value="charCount"
        :label="charCount === 1 ? 'Carácter' : 'Caracteres'"
      />

      <NoteBadge icon="speed" :value="wpm" label="Palabras x minuto" />

      <BadgeButton
        v-if="format === 'md'"
        :icon="isPreviewDark ? 'light_mode' : 'dark_mode'"
        @click="isPreviewDark = !isPreviewDark"
      >
        {{
          isPreviewDark ? "Previsualización clara" : "Previsualización oscura"
        }}
      </BadgeButton>

      <BadgeButton
        :icon="isSpeaking ? 'stop_circle' : 'record_voice_over'"
        @click="handleTextToSpeech"
      >
        {{ isSpeaking ? "Detener lectura" : "Lectura en voz alta" }}
      </BadgeButton>

      <BadgeButton icon="content_copy" @click="handleCopy">
        Copiar contenido
      </BadgeButton>
    </div>
  </section>
</template>

<style scoped>
.prose-preview {
  font-family: "Manrope", sans-serif;
  font-size: 14px;
  line-height: 1.75;
  color: rgba(0, 0, 0, 0.8);
}

.prose-preview :deep(h1) {
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: #000;
}
.prose-preview :deep(h2) {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: #000;
  margin-top: 1.5rem;
}
.prose-preview :deep(h3) {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #000;
}
.prose-preview :deep(p) {
  margin-bottom: 1rem;
}
.prose-preview :deep(ul) {
  list-style-type: disc;
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}
.prose-preview :deep(ol) {
  list-style-type: decimal;
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}
.prose-preview :deep(li) {
  margin-bottom: 0.25rem;
}
.prose-preview :deep(code) {
  background: rgba(0, 0, 0, 0.05);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9em;
}
.prose-preview :deep(pre) {
  background: #1a1a1a;
  color: #fff;
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  overflow-x: auto;
}
.prose-preview :deep(pre code) {
  background: transparent;
  padding: 0;
  color: inherit;
  font-size: 0.85em;
}
.prose-preview :deep(blockquote) {
  border-left: 4px solid rgba(0, 0, 0, 0.1);
  padding-left: 1rem;
  font-style: italic;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 1rem;
}
.prose-preview :deep(strong) {
  font-weight: 700;
  color: #000;
}
.prose-preview :deep(a) {
  color: #000;
  text-decoration: underline;
  text-underline-offset: 4px;
  font-weight: 600;
}
.prose-preview :deep(img) {
  max-width: 100%;
  border-radius: 8px;
}
.prose-preview :deep(hr) {
  border: none;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  margin: 2rem 0;
}
.prose-preview :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1.5rem;
  font-size: 0.9em;
}
.prose-preview :deep(th),
.prose-preview :deep(td) {
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 0.75rem 1rem;
  text-align: left;
}
.prose-preview :deep(th) {
  background: rgba(0, 0, 0, 0.03);
  font-weight: 700;
  color: #000;
}

.prose-preview.dark-theme {
  color: rgba(255, 255, 255, 0.8);
}
.prose-preview.dark-theme :deep(h1),
.prose-preview.dark-theme :deep(h2),
.prose-preview.dark-theme :deep(h3),
.prose-preview.dark-theme :deep(strong) {
  color: #fff;
}
.prose-preview.dark-theme :deep(code) {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}
.prose-preview.dark-theme :deep(blockquote) {
  border-left-color: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.6);
}
.prose-preview.dark-theme :deep(a) {
  color: #fff;
}
.prose-preview.dark-theme :deep(hr) {
  border-top-color: rgba(255, 255, 255, 0.1);
}
.prose-preview.dark-theme :deep(th),
.prose-preview.dark-theme :deep(td) {
  border-color: rgba(255, 255, 255, 0.1);
}
.prose-preview.dark-theme :deep(th) {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}
</style>
