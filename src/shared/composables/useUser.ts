import { ref } from "vue";

const userName = ref(localStorage.getItem("userName") || "");
const profilePicture = ref(localStorage.getItem("profilePicture") || "");

const birthday = ref(localStorage.getItem("birthday") || "");

const registeredAt = ref(localStorage.getItem("registeredAt") || "");
 
export function useUser() {
  const setUserName = (name: string) => {
    userName.value = name;
    localStorage.setItem("userName", name);
  };
 
  const setProfilePicture = (url: string) => {
    profilePicture.value = url;
    localStorage.setItem("profilePicture", url);
  };
 
  const setBirthday = (date: string) => {
    birthday.value = date;
    localStorage.setItem("birthday", date);
  };
 
  const setRegisteredAt = (date: string) => {
    registeredAt.value = date;
    localStorage.setItem("registeredAt", date);
  };
 
  return {
    userName,
    profilePicture,
    birthday,
    registeredAt,
    setUserName,
    setProfilePicture,
    setBirthday,
    setRegisteredAt,
  };
}
