import { ref } from "vue";

export type ToastType = "success" | "error" | "info" | "warning";
export type VerticalPosition = "top" | "bottom";
export type HorizontalPosition = "left" | "right";

export interface ToastOptions {
  id?: string;
  message: string;
  title?: string;
  type?: ToastType;
  duration?: number;
  vertical?: VerticalPosition;
  horizontal?: HorizontalPosition;
  showIcon?: boolean;
  icon?: string;
}

const toasts = ref<ToastOptions[]>([]);

export function useToast() {
  const addToast = (options: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    const vertical = options.vertical || "top";
    const horizontal = options.horizontal || "right";
    const activeInPos = toasts.value.filter(
      (t) =>
        (t.vertical || "top") === vertical &&
        (t.horizontal || "right") === horizontal,
    ).length;
    const stagger = activeInPos * 250;

    const toast: ToastOptions = {
      id,
      type: "info",
      duration: 4000,
      vertical: "top",
      horizontal: "right",
      ...options,
    };

    toasts.value.push(toast);

    if (toast.duration && toast.duration > 0) {
      setTimeout(
        () => {
          removeToast(id);
        },
        (toast.duration || 4000) + stagger,
      );
    }
  };

  const removeToast = (id: string) => {
    const index = toasts.value.findIndex((t) => t.id === id);
    if (index !== -1) {
      toasts.value.splice(index, 1);
    }
  };

  return {
    toasts,
    addToast,
    removeToast,
  };
}
