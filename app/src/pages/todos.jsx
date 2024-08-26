import {
  Outlet,
  activeSearch,
  activeParams,
} from "@framework/router.server.jsx";
import TodoPreview from "../components/TodoPreview.jsx";

export default function Todos() {
  const { id } = activeParams;
  const { create } = activeSearch;

  if (!!create) {
    return (
      <TodoPreview
        mode="edit"
        todo={{ id: null, title: "", description: "" }}
      />
    );
  }

  if (!id) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <h1 className="text-2xl">Select a todo to preview or create one</h1>
      </div>
    );
  }

  return <Outlet path="/todos" />;
}
