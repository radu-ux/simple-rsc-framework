"use client";

import React from "react";

const TodoCTX = React.createContext();

export function useTodo() {
  const ctx = React.useContext(TodoCTX);

  if (!ctx) {
    throw new Error("useTodo() should be used inside <TodoProvider />");
  }

  return ctx;
}

export function TodoProvider({ mode, todo, children }) {
  const editModeEnabled = mode === "edit";
  const readonlyModeEnabled = mode === undefined;
  const [_todo, setTodo] = React.useState(todo);

  // actions
  const onDescriptionChange = React.useCallback((description) => {
    setTodo((_todo) => ({ ..._todo, description }));
  }, []);
  const onTitleChange = React.useCallback((title) => {
    setTodo((_todo) => ({ ..._todo, title }));
  }, []);

  // api
  const saveTodo = React.useCallback(async () => {
    let response = await fetch("/api/todos", {
      method: _todo.id ? "PATCH" : "POST",
      body: JSON.stringify(_todo),
      headers: { "Content-Type": "application/json" },
    });
    response = await response.json();

    return response;
  }, [_todo]);
  const cloneTodo = React.useCallback(async () => {
    let response = await fetch("/api/todos", {
      method: "POST",
      body: JSON.stringify({ ..._todo, id: null }),
      headers: { "Content-Type": "application/json" },
    });
    response = await response.json();

    return response;
  }, [_todo]);
  const deleteTodo = React.useCallback(async () => {
    let response = await fetch("/api/todos", {
      method: "DELETE",
      body: JSON.stringify({ id: _todo.id }),
      headers: { "Content-Type": "application/json" },
    });
    response = await response.json();

    return response;
  }, [_todo]);

  return (
    <TodoCTX.Provider
      value={{
        todo: _todo,
        mode: { editModeEnabled, readonlyModeEnabled },
        api: {
          saveTodo,
          deleteTodo,
          cloneTodo,
        },
        actions: {
          onTitleChange,
          onDescriptionChange,
        },
      }}
    >
      {children}
    </TodoCTX.Provider>
  );
}
