"use client";

import React from "react";

import { cn } from "../utils.js";
import { useTodo } from "./TodoContext.jsx";

export default function TodoDescription() {
  const textareaRef = React.useRef(null);
  const { mode, todo, actions } = useTodo();

  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (mode.editModeEnabled && textarea) {
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    }
  }, [mode.editModeEnabled]);

  if (mode.readonlyModeEnabled) {
    return <p>{todo.description}</p>;
  }

  return (
    <textarea
      className={cn(
        "w-full h-full resize-none",
        mode.editModeEnabled && "border border-slate-300"
      )}
      placeholder="Enter todo description"
      value={todo.description}
      onChange={(e) => {
        actions.onDescriptionChange(e.currentTarget.value);
      }}
      ref={textareaRef}
    />
  );
}
