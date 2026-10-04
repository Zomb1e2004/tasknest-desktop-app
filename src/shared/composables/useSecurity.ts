import { ref } from "vue";

const SECURE_KEY = "tasknest-secure-start";
const PW_KEY = "tasknest-password-hash";
const UNLOCK_KEY = "tasknest-unlocked";

export const MIN_PASSWORD_LENGTH = 4;

export async function hashPassword(pw: string): Promise<string> {
  const data = new TextEncoder().encode(`tasknest:${pw}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

if (localStorage.getItem(SECURE_KEY) === null) {
  localStorage.setItem(SECURE_KEY, "0");
}

const secureEnabled = ref(localStorage.getItem(SECURE_KEY) === "1");

export function useSecurity() {
  const setSecureEnabled = (value: boolean) => {
    secureEnabled.value = value;
    localStorage.setItem(SECURE_KEY, value ? "1" : "0");
  };

  const hasPassword = () => localStorage.getItem(PW_KEY) !== null;

  const verifyPassword = async (pw: string): Promise<boolean> => {
    const stored = localStorage.getItem(PW_KEY);
    if (!stored) return false;
    return (await hashPassword(pw)) === stored;
  };

  const setPassword = async (pw: string): Promise<void> => {
    localStorage.setItem(PW_KEY, await hashPassword(pw));
  };

  const isUnlocked = () => sessionStorage.getItem(UNLOCK_KEY) === "1";
  const markUnlocked = () => sessionStorage.setItem(UNLOCK_KEY, "1");

  return {
    secureEnabled,
    setSecureEnabled,
    hasPassword,
    verifyPassword,
    setPassword,
    isUnlocked,
    markUnlocked,
  };
}
