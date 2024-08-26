"use client";

import { Link } from "@framework/router.client.jsx";

export default function TodoListItem({ id, title, description, active }) {
  return (
    <Link
      to={`/todos/${id}`}
      className="rounded-md flex flex-col gap-2 border p-2 data-[active='true']:bg-slate-200 border-slate-200 hover:bg-slate-100 hover:border-slate-100 transition-colors duration-150 shadow-sm"
      data-active={active}
    >
      <h3 className="text-ellipsis text-nowrap overflow-hidden text-lg font-bold">
        {title}
      </h3>
      <p className="text-ellipsis text-nowrap overflow-hidden">{description}</p>
    </Link>
  );
}
