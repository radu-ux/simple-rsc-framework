import fs from "fs/promises";
import { fileURLToPath } from "url";

const TODO_LIST_DATA_PATH = fileURLToPath(
  new URL("../../mocks/todos.json", import.meta.url)
);

export async function getTodoList() {
  const todos = JSON.parse(await fs.readFile(TODO_LIST_DATA_PATH, "utf-8"));

  return todos;
}
