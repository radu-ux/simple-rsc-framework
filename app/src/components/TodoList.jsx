import TodoListItem from "./TodoListItem.jsx";
import CreateTodoButton from "./CreateTodoButton.jsx";
import { getTodoList } from "../api/index.js";
import { activeParams } from "@framework/router.server.jsx";

export default async function TodoList() {
  const todos = await getTodoList();
  const { id } = activeParams;

  return (
    <div className="flex flex-col gap-4 border p-4 overflow-hidden">
      <div className="grid grid-cols-[1fr_auto]">
        <h2 className="text-xl font-bold">Your todos</h2>
        <CreateTodoButton />
      </div>
      <div className="flex flex-col gap-4 overflow-auto">
        {todos.map((todo) => {
          return (
            <TodoListItem key={todo.id} active={+todo.id === +id} {...todo} />
          );
        })}
      </div>
    </div>
  );
}
