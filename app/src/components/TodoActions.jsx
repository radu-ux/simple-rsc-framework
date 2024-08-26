"use client";

import { useNavigate } from "@framework/router.client.jsx";
import { useTodo } from "./TodoContext.jsx";
import Button from "../ui-components/Button.jsx";

export default function TodoActions() {
  const navigate = useNavigate();
  const { api, mode } = useTodo();

  const onEdit = async () => {
    navigate(`${window.location.pathname}?edit=true`);
  };

  const onSave = async () => {
    try {
      const todo = await api.saveTodo();
      navigate(`/todos/${todo.id}`);
    } catch (e) {
      console.log(e);
    }
  };

  const onClone = async () => {
    try {
      await api.cloneTodo();
      navigate(window.location.pathname);
    } catch (e) {
      console.log(e);
    }
  };

  const onDelete = async () => {
    try {
      const todos = await api.deleteTodo();
      const firstTodo = todos[0];

      if (firstTodo) {
        navigate(`/todos/${firstTodo.id}`);
      } else {
        navigate(`/todos`);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const onCancel = () => {
    navigate(window.location.pathname);
  };

  if (mode.editModeEnabled) {
    return (
      <div className="flex gap-2">
        <Button variant="success" onClick={onSave}>
          Save
        </Button>
        <Button onClick={onCancel}>Cancel</Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button onClick={onEdit}>Edit</Button>
      <Button variant="accent" onClick={onClone}>
        Clone
      </Button>
      <Button variant="danger" onClick={onDelete}>
        Delete
      </Button>
    </div>
  );
}
