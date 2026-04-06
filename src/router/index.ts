import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

import DashboardPage from "../modules/dashboard/pages/DashboardPage.vue";

import NotesPage from "../modules/notes/pages/NotesPage.vue";
import AddNotePage from "../modules/notes/pages/AddNotePage.vue";
import UpdateNotePage from "../modules/notes/pages/UpdateNotePage.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/dashboard",
  },
  {
    path: "/dashboard",
    name: "dashboard",
    component: DashboardPage,
  },
  {
    path: "/notes",
    name: "notes",
    component: NotesPage,
  },
  {
    path: "/notes/add",
    name: "add-note",
    component: AddNotePage,
  },
  {
    path: "/notes/:id/edit",
    name: "update-note",
    component: UpdateNotePage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
