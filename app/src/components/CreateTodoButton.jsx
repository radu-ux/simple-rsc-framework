"use client";

import { useNavigate } from "@framework/router.client.jsx";
import Button from "../ui-components/Button.jsx";

export default function CreateTodoButton() {
  const navigate = useNavigate();

  return (
    <Button
      variant="accent"
      className="w-fit min-w-fit rounded-full px-2 py-0 flex justify-center items-center"
      onClick={() => navigate("/todos?create=true")}
    >
      +
    </Button>
  );
}
