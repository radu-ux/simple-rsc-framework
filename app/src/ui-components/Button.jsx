"use client";

import { cva } from "class-variance-authority";

export const button = cva(
  [
    "border",
    "p-2",
    "text-md",
    "rounded-md min-w-[5rem]",
    "transition-colors duration-150",
  ],
  {
    variants: {
      intent: {
        primary:
          "border-slate-800 bg-slate-800 text-white hover:bg-slate-500 hover:border-slate-500",
        danger:
          "border-red-500 bg-red-500 text-white hover:bg-red-300 hover:border-red-300",
        success:
          "border-green-500 bg-green-500 text-white hover:bg-green-300 hover:border-green-300",
        accent:
          "border-blue-500 bg-blue-500 text-white hover:bg-blue-300 hover:border-blue-300",
      },
    },
    defaultVariants: {
      intent: "primary",
    },
  }
);

export default function Button({ className, variant = "primary", ...rest }) {
  return (
    <button {...rest} className={button({ intent: variant, className })} />
  );
}
