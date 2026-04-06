import { ref } from "vue";

const userName = ref(localStorage.getItem("userName") || "");

export function useUser() {
  const setUserName = (name: string) => {
    userName.value = name;
    localStorage.setItem("userName", name);
  };

  return {
    userName,
    setUserName,
  };
}
