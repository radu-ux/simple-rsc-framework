"use client";

import React from "react";

import TodoActions from "./TodoActions.jsx";
import TodoDescription from "./TodoDescription.jsx";
import { TodoProvider } from "./TodoContext.jsx";
import { TodoTitle } from "./TodoTitle.jsx";

export default function TodoPreview(props) {
  return (
    <div className="grid grid-rows-[auto_1fr] overflow-hidden gap-10 py-4 px-10">
      <TodoProvider {...props}>
        <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
          <TodoTitle />
          <TodoActions />
        </div>
        <TodoDescription />
      </TodoProvider>
    </div>
  );
}
