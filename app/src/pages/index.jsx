import { Outlet } from "@framework/router.server.jsx";

import TodoList from "../components/TodoList.jsx";

export default function Index() {
  return (
    <div className="w-screen h-screen overflow-hidden grid grid-cols-[25%_auto] border">
      <TodoList />
      <Outlet path="/" />
    </div>
  );
}
