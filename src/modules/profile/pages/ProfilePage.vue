<script setup lang="ts">
import Page from "../../../shared/components/Page.vue";
import { useUser } from "../../../shared/composables/useUser";
import { ref, computed } from "vue";
import { useToast } from "../../../shared/composables/useToast";
import { motion } from "motion-v";
import { getWordByIndex } from "../../../shared/utils/getWordByIndex";
import Button from "../../../shared/components/Button.vue";

const {
  userName,
  profilePicture,
  birthday,
  setUserName,
  setProfilePicture,
  setBirthday,
} = useUser();
const { addToast } = useToast();

const localUserName = ref(userName.value);
const localProfilePicture = ref(profilePicture.value);
const localBirthday = ref(birthday.value);

const hasChanges = computed(() => {
  return (
    localUserName.value !== userName.value ||
    localProfilePicture.value !== profilePicture.value ||
    localBirthday.value !== birthday.value
  );
});

const handleSave = () => {
  setUserName(localUserName.value);
  setProfilePicture(localProfilePicture.value);
  setBirthday(localBirthday.value);
  addToast({
    title: "Cambios guardados",
    message: "Tu perfil ha sido actualizado con éxito.",
    type: "success",
  });
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      localProfilePicture.value = e.target?.result as string;
    };
    reader.readAsDataURL(target.files[0]);
  }
};

const removePhoto = () => {
  localProfilePicture.value = "";
};
</script>

<template>
  <Page>
    <div class="flex flex-col gap-6">
      <motion.section
        :initial="{ opacity: 0, y: 0 }"
        :animate="{ opacity: 1, y: 0 }"
        class="flex flex-col gap-6 py-8 border-y border-black/5 select-none"
      >
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-2 px-1">
            <span class="material-symbols-outlined text-[16px] text-black/30">
              account_circle
            </span>
            <p
              class="text-[10px] font-bold uppercase tracking-[0.25em] text-black/30"
            >
              Configuración de Perfil
            </p>
          </div>

          <h2
            class="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-black/90 leading-[1.15]"
          >
            Hola,
            <span class="text-black">
              {{ getWordByIndex(userName, 1) || "Usuario" }}
            </span>
            👋
            <br />
            <span
              class="text-black/40 font-semibold text-lg sm:text-xl md:text-2xl mt-3 block"
            >
              Personaliza tu identidad en la plataforma.
            </span>
          </h2>
        </div>
      </motion.section>

      <div class="flex flex-col gap-5 max-w-4xl">
        <div class="flex flex-col gap-6">
          <!-- Sidebar Profile -->
          <motion.div
            class="flex flex-col gap-6"
            :initial="{ opacity: 0, x: 0 }"
            :animate="{ opacity: 1, x: 0 }"
          >
            <div
              class="bg-white/60 backdrop-blur-xl border border-black/5 rounded-[2.5rem] p-5.5 shadow-[0_10px_35px_rgba(0,0,0,0.05)] flex flex-col md:flex-row items-center gap-8 transition-all hover:shadow-[0_14px_45px_rgba(0,0,0,0.07)]"
            >
              <!-- Avatar Header -->
              <div class="relative group shrink-0">
                <div
                  class="w-32 h-32 rounded-full overflow-hidden border-[6px] border-white shadow-xl bg-linear-to-b from-black/5 to-black/3 flex items-center justify-center transition-all duration-500 group-hover:scale-[1.03]"
                >
                  <img
                    v-if="localProfilePicture"
                    :src="localProfilePicture"
                    alt="Avatar"
                    class="w-full h-full object-cover"
                  />
                  <span
                    v-else
                    class="material-symbols-outlined text-[48px] text-black/10"
                  >
                    person
                  </span>

                  <div
                    class="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                  >
                    <span
                      class="material-symbols-outlined text-white text-[24px]"
                    >
                      photo_camera
                    </span>
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    class="absolute inset-0 opacity-0 cursor-pointer z-10"
                    @change="handleFileChange"
                  />
                </div>
              </div>

              <!-- Profile Info Header -->
              <div
                class="flex flex-col items-center md:items-start flex-1 gap-4"
              >
                <div class="flex flex-col items-center md:items-start gap-1">
                  <span
                    class="text-[10px] font-black uppercase tracking-[0.2em] text-black/20"
                  >
                    Información Actual
                  </span>
                  <h3
                    class="font-black text-2xl md:text-3xl text-black tracking-tight"
                  >
                    {{ localUserName || "Sin nombre" }}
                  </h3>
                </div>

                <button
                  v-if="localProfilePicture"
                  @click="removePhoto"
                  class="text-[10px] cursor-pointer font-black uppercase tracking-widest text-red-500/60 hover:text-red-500 transition-all hover:translate-x-1"
                >
                  Eliminar foto de perfil
                </button>
              </div>
            </div>
          </motion.div>

          <!-- Main Form -->
          <motion.div
            class="w-full"
            :initial="{ opacity: 0, x: 0 }"
            :animate="{ opacity: 1, x: 0 }"
          >
            <div
              class="bg-white/70 backdrop-blur-2xl border border-black/5 rounded-[2.5rem] p-10 shadow-[0_10px_35px_rgba(0,0,0,0.05)] flex flex-col gap-12"
            >
              <div class="grid grid-cols-1 gap-9">
                <!-- Name -->
                <div class="flex flex-col gap-3">
                  <div class="flex items-center justify-between px-1">
                    <label
                      class="text-[11px] font-black uppercase tracking-[0.18em] text-black/40"
                    >
                      Nombre de Identidad
                    </label>
                    <span class="text-[10px] font-medium text-black/20 italic">
                      Requerido
                    </span>
                  </div>

                  <div class="relative">
                    <span
                      class="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-black/20"
                    >
                      fingerprint
                    </span>

                    <input
                      v-model="localUserName"
                      type="text"
                      placeholder="Escribe tu nuevo nombre..."
                      class="w-full pl-14 pr-6 py-4.5 bg-black/4 hover:bg-black/6 border border-transparent rounded-3xl font-bold text-base focus:bg-white focus:border-black/10 focus:ring-[6px] focus:ring-black/5 outline-none transition-all placeholder:text-black/25 tracking-tight"
                    />
                  </div>
                </div>

                <!-- Birthday -->
                <div class="flex flex-col gap-3">
                  <div class="flex items-center justify-between px-1">
                    <label
                      class="text-[11px] font-black uppercase tracking-[0.18em] text-black/40"
                    >
                      Fecha de Nacimiento
                    </label>
                    <span
                      class="material-symbols-outlined text-[16px] text-black/20"
                    >
                      cake
                    </span>
                  </div>

                  <div class="relative">
                    <span
                      class="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-black/20"
                    >
                      calendar_today
                    </span>

                    <input
                      v-model="localBirthday"
                      type="date"
                      class="w-full pl-14 pr-6 py-4.5 bg-black/4 hover:bg-black/6 border border-transparent rounded-3xl font-bold text-base focus:bg-white focus:border-black/10 focus:ring-[6px] focus:ring-black/5 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div
                class="pt-6 flex items-center justify-between border-t border-black/5"
              >
                <div class="flex flex-col">
                  <span
                    class="text-[10px] font-bold uppercase tracking-widest text-black/30"
                  >
                    Miembro desde
                  </span>
                  <span class="text-sm font-black text-black">
                    07 de Abril, 2026
                  </span>
                </div>

                <Button
                  icon="auto_awesome"
                  @click="handleSave"
                  :disabled="!hasChanges"
                >
                  Actualizar Perfil
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  </Page>
</template>

<style scoped>
input[type="date"]::-webkit-calendar-picker-indicator {
  position: absolute;
  right: 20px;
  opacity: 0.5;
  cursor: pointer;
  filter: grayscale(1);
}

input[type="date"]::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
}

.py-4\.5 {
  padding-top: 1.125rem;
  padding-bottom: 1.125rem;
}
</style>
