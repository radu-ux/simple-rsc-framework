import { Router, Route } from "@framework/router.server.jsx";
import Index from "./src/pages/index.jsx";
import Todos from "./src/pages/todos.jsx";
import TodoById from "./src/pages/todo-by-id.jsx";

export default function App({ request }) {
  return (
    <Router request={request}>
      <Route path="/" element={<Index />}>
        <Route path="/todos" element={<Todos />}>
          <Route path="/todos/:id" element={<TodoById />} />
        </Route>
      </Route>
    </Router>
  );
}
