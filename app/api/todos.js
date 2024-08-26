import { readFile, writeFile } from "fs/promises";
import { fileURLToPath } from "url";

const MOCKED_DATA_URL = new URL("../../mocks/", import.meta.url);
const TODOS_MOCKED_DATA_PATH = fileURLToPath(
  new URL("todos.json", MOCKED_DATA_URL)
);

async function readTodos() {
  return JSON.parse(await readFile(TODOS_MOCKED_DATA_PATH, "utf-8"));
}

async function writeTodos(todos) {
  await writeFile(TODOS_MOCKED_DATA_PATH, JSON.stringify(todos));
}

export async function GET(req, res) {
  return res.json(await readTodos());
}

export async function PATCH(req, res) {
  const todo = req.body;
  let todos = await readTodos();

  todos = todos.map((t) => (t.id === todo.id ? todo : t));
  await writeTodos(todos);

  return res.json(todo);
}

export async function POST(req, res) {
  const todo = req.body;
  let todos = await readTodos();
  let id = todos[todos.length - 1] ? todos[todos.length - 1].id : 1;
  id++;
  todos.push({ ...todo, id });
  await writeTodos(todos);

  return res.json({ ...todo, id });
}

export async function DELETE(req, res) {
  const { id } = req.body;
  let todos = await readTodos();

  todos = todos.filter((t) => t.id !== id);
  await writeTodos(todos);

  return res.json(todos);
}
