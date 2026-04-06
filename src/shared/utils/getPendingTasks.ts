import type { Task } from "../../modules/tasks/models/TaskModel";

export const getPendingTasksForToday = (tasks: Task[]): Task[] => {
  return tasks.filter((task) => !task.completed);
};
