"use client";

import { useTodo } from "./TodoContext.jsx";
import { cn } from "../utils.js";

export function TodoTitle() {
  const { mode, todo, actions } = useTodo();

  if (mode.readonlyModeEnabled) {
    return <h1 className="text-4xl">{todo.title}</h1>;
  }

  return (
    <input
      className={cn(
        "text-4xl w-full h-full",
        mode.editModeEnabled && "border border-slate-300"
      )}
      placeholder="Enter todo title"
      type="text"
      value={todo.title}
      onChange={(e) => actions.onTitleChange(e.currentTarget.value)}
    />
  );
}
