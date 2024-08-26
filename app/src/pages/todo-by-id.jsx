import { activeParams, activeSearch } from "@framework/router.server.jsx";

import { getTodoList } from "../api/index.js";
import TodoPreview from "../components/TodoPreview.jsx";

export default async function TodoById() {
  const { id } = activeParams;
  const { edit } = activeSearch;
  const todos = await getTodoList();
  const todo = todos.find((t) => t.id === +id);
  const mode = !!edit ? "edit" : undefined;

  if (!todo) {
    return (
      <div className="flex justify-center items-center w-full h-full">
        <h1 className="text-2xl">Could find todo with id {id}</h1>
      </div>
    );
  }

  return <TodoPreview mode={mode} todo={todo} key={`todo-${id}-${mode}`} />;
}
